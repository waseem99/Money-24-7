import {DatabaseSync} from 'node:sqlite';
import {mkdirSync} from 'node:fs';
import path from 'node:path';
import {hash} from './contracts.mjs';

// Single-host pilot worker. Keep this directory on a durable private volume.
export class Store {
  constructor(root) {
    mkdirSync(root,{recursive:true,mode:0o700});
    this.db = new DatabaseSync(path.join(root,'jobs.sqlite'));
    this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
      CREATE TABLE IF NOT EXISTS jobs (key TEXT PRIMARY KEY, state TEXT NOT NULL, data TEXT NOT NULL, updated TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS charges (key TEXT PRIMARY KEY, amount REAL NOT NULL, category TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS events (seq INTEGER PRIMARY KEY, job TEXT, kind TEXT, at TEXT);
      CREATE TABLE IF NOT EXISTS metrics (key TEXT PRIMARY KEY, data TEXT NOT NULL);`);
  }
  get(key) { const r=this.db.prepare('SELECT * FROM jobs WHERE key=?').get(key); return r?{...r,data:JSON.parse(r.data)}:null; }
  set(key,state,data={}) {
    this.db.prepare('INSERT INTO jobs VALUES (?,?,?,?) ON CONFLICT(key) DO UPDATE SET state=excluded.state,data=excluded.data,updated=excluded.updated').run(key,state,JSON.stringify(data),new Date().toISOString());
    this.db.prepare('INSERT INTO events(job,kind,at) VALUES (?,?,?)').run(key,state,new Date().toISOString());
  }
  reserve(key, amount, cap, category) {
    if (!Number.isFinite(amount) || amount<=0 || !Number.isFinite(cap) || cap<=0) throw new Error('Positive operator-supplied cost estimate and episode cap required');
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const total=this.db.prepare('SELECT COALESCE(SUM(amount),0) AS total FROM charges').get().total;
      if (!this.db.prepare('SELECT key FROM charges WHERE key=?').get(key)) {
        if (total+amount>cap) throw new Error('Episode estimated spend cap exceeded');
        this.db.prepare('INSERT INTO charges VALUES (?,?,?)').run(key,amount,category);
      }
      this.db.exec('COMMIT');
    } catch(e) {this.db.exec('ROLLBACK');throw e;}
  }
  metric(key,data){const old=this.db.prepare('SELECT data FROM metrics WHERE key=?').get(key);const merged={...(old?JSON.parse(old.data):{}),...data};this.db.prepare('INSERT INTO metrics VALUES (?,?) ON CONFLICT(key) DO UPDATE SET data=excluded.data').run(key,JSON.stringify(merged));return merged;}
  summary() {return {jobs:this.db.prepare('SELECT key,state,updated FROM jobs ORDER BY key').all(),metrics:this.db.prepare('SELECT * FROM metrics ORDER BY key').all().map(r=>({key:r.key,...JSON.parse(r.data)})),reservedEstimateUSD:this.db.prepare('SELECT COALESCE(SUM(amount),0) AS total FROM charges').get().total};}
  close(){this.db.close();}
}
export const jobKey = (kind, inputs) => `${kind}-${hash(inputs).slice(0,24)}`;

// No automatic retry of a potentially charged POST after process/network failure.
export async function chargedJob(store,key,{amount,cap,category,units={}},run) {
  const old=store.get(key);
  if (old?.state==='complete') return old.data;
  if (old) throw new Error(`Job ${key} requires reconciliation; refusing duplicate paid request`);
  store.reserve(key,amount,cap,category);
  store.set(key,'submitting');
  const start=Date.now();store.metric(key,{category,units,startedAt:new Date(start).toISOString(),estimatedUSD:amount,actualBilledUSD:null});
  try {const result=await run(); store.set(key,'complete',result);store.metric(key,{responseMs:Date.now()-start,finishedAt:new Date().toISOString(),providerUsage:result.usage||null});return result;}
  catch {store.metric(key,{responseMs:Date.now()-start,outcome:'uncertain'});store.set(key,'uncertain');throw new Error(`Provider request uncertain (${key}). Reconcile or import output; not automatically retried.`);}
}
