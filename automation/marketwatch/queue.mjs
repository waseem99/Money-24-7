import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {digest} from './core.mjs';

const need=(ok,message)=>{if(!ok) throw new Error(message);};
export function calendarJobs(day) {
  need(day?.market_state === 'trading' && day.programmes?.length === 12 && day.fresh_editorial_minutes === 90, 'Compiled trading rundown required');
  return day.programmes.flatMap(p=>[
    ['DRAFT_PREPARE',p.draft_due_at,p.review_due_at],
    ['REVIEW_HANDOFF',p.review_due_at,p.scheduled_at],
    ['RELEASE_CHECK',p.release_due_at,p.scheduled_at]
  ].map(([kind,dueAt,deadlineAt])=>({key:`${p.episode_id}:${kind}`,kind,dueAt,deadlineAt,retrySafe:kind==='RELEASE_CHECK',
    payload:{programme:p,calendar_source:day.calendar_source,calendar_version:p.calendar_version,paid_calls_authorized:false,publish_authorized:false}})));
}

// The queue holds orchestration only. It does not port the SQLite review store
// to PostgreSQL or authorize email, paid rendering, or publication.
export class PostgresQueue {
  constructor(pool){this.pool=pool;}
  async transaction(fn) {
    const c=await this.pool.connect();
    try {await c.query('BEGIN');const result=await fn(c);await c.query('COMMIT');return result;}
    catch(e){await c.query('ROLLBACK');throw e;} finally {c.release();}
  }
  async migrate() {
    const sql=await readFile(new URL('./migrations/001-queue.sql',import.meta.url),'utf8');
    return this.transaction(async c=>{await c.query("SELECT pg_advisory_xact_lock(582019501)");await c.query(sql);});
  }
  async enqueue(jobs) {
    for(const j of jobs) {
      need(j.key && /^[A-Z_]+$/.test(j.kind) && j.payload && typeof j.retrySafe === 'boolean','Complete job required');
      need(Number.isFinite(Date.parse(j.dueAt)) && Date.parse(j.deadlineAt)>Date.parse(j.dueAt),'Valid due/deadline required');
    }
    return this.transaction(async c=>{
      let inserted=0;
      for(const j of jobs) {
        const r=await c.query(`INSERT INTO mw_jobs(key,kind,payload,due_at,deadline_at,retry_safe,available_at)
          VALUES($1,$2,$3,$4,$5,$6,$4) ON CONFLICT DO NOTHING RETURNING key`,[j.key,j.kind,j.payload,j.dueAt,j.deadlineAt,j.retrySafe]);
        inserted+=r.rowCount;
        if(!r.rowCount) {
          const {rows:[old]}=await c.query('SELECT * FROM mw_jobs WHERE key=$1',[j.key]);
          need(old.kind===j.kind && digest(old.payload)===digest(j.payload) && old.due_at.toISOString()===new Date(j.dueAt).toISOString() && old.deadline_at.toISOString()===new Date(j.deadlineAt).toISOString() && old.retry_safe===j.retrySafe,'Job conflict: explicit calendar revision/cancellation required');
        }
      }
      return inserted;
    });
  }
  async incident(c,job,kind) {
    await c.query('INSERT INTO mw_events(job_key,kind) VALUES($1,$2) ON CONFLICT DO NOTHING',[job.key,kind]);
    await c.query(`INSERT INTO mw_outbox(key,topic,payload) VALUES($1,'OPERATOR_ALERT',$2) ON CONFLICT DO NOTHING`,[`${job.key}:${kind}`,{job_key:job.key,kind}]);
  }
  async recover() {
    return this.transaction(async c=>{
      const {rows}=await c.query(`SELECT * FROM mw_jobs WHERE (state='RUNNING' AND lease_until<=now()) OR (state='PENDING' AND deadline_at<=now()) FOR UPDATE SKIP LOCKED`);
      for(const j of rows) {
        // Never resend an uncertain external action after worker loss.
        const uncertain=j.state==='RUNNING' && !j.retry_safe;
        const late=await c.query('SELECT $1::timestamptz<=now() AS late',[j.deadline_at]);
        const state=uncertain?'UNKNOWN':late.rows[0].late?'MISSED':j.attempts>=j.max_attempts?'FAILED':'PENDING';
        await c.query(`UPDATE mw_jobs SET state=$2,lease_token=NULL,lease_until=NULL,available_at=now(),updated_at=now() WHERE key=$1`,[j.key,state]);
        if(state!=='PENDING') await this.incident(c,j,state);
      }
      return rows.length;
    });
  }
  async claim(kinds,{leaseSeconds=120}={}) {
    need(Array.isArray(kinds) && kinds.length>0 && kinds.every(k=>/^[A-Z_]+$/.test(k)),'Handler kinds required');
    need(Number.isInteger(leaseSeconds) && leaseSeconds>=5 && leaseSeconds<=3600,'Invalid lease');
    return this.transaction(async c=>{
      const token=randomUUID();
      const {rows}=await c.query(`WITH candidate AS (
        SELECT key FROM mw_jobs WHERE state='PENDING' AND kind=ANY($1::text[]) AND available_at<=now() AND due_at<=now()
        AND deadline_at>now() AND attempts<max_attempts ORDER BY due_at,key FOR UPDATE SKIP LOCKED LIMIT 1)
        UPDATE mw_jobs j SET state='RUNNING',attempts=attempts+1,lease_token=$2,lease_until=now()+make_interval(secs=>$3),updated_at=now()
        FROM candidate WHERE j.key=candidate.key RETURNING j.*`,[kinds,token,leaseSeconds]);
      if(rows[0]) {
        const {rows:[{late}]}=await c.query("SELECT $1::timestamptz < now()-interval '60 seconds' AS late",[rows[0].due_at]);
        if(late) await this.incident(c,rows[0],'LATE_START');
      }
      return rows[0]||null;
    });
  }
  async finish(job,{ok=false,result={},retryable=false,uncertain=false}={}) {
    return this.transaction(async c=>{
      const {rows:[current]}=await c.query(`SELECT * FROM mw_jobs WHERE key=$1 AND state='RUNNING' AND lease_token=$2 AND lease_until>now() FOR UPDATE`,[job.key,job.lease_token]);
      need(current,'Lease lost; result requires reconciliation');
      const {rows:[{late}]}=await c.query('SELECT $1::timestamptz<=now() AS late',[current.deadline_at]);
      const state=uncertain?'UNKNOWN':ok?'DONE':late?'MISSED':retryable && current.retry_safe && current.attempts<current.max_attempts?'PENDING':'FAILED';
      await c.query(`UPDATE mw_jobs SET state=$2,result=$3,lease_token=NULL,lease_until=NULL,
        available_at=now()+interval '60 seconds',updated_at=now() WHERE key=$1`,[job.key,state,result]);
      if(state==='DONE') {
        if(late) await this.incident(c,current,'COMPLETED_LATE');
        await c.query(`INSERT INTO mw_events(job_key,kind) VALUES($1,'DONE') ON CONFLICT DO NOTHING`,[job.key]);
        await c.query(`INSERT INTO mw_outbox(key,topic,payload) VALUES($1,'JOB_COMPLETED',$2) ON CONFLICT DO NOTHING`,[`${job.key}:DONE`,{job_key:job.key}]);
      } else if(state!=='PENDING') await this.incident(c,current,state);
      return state;
    });
  }
  async status() {
    const {rows}=await this.pool.query(`SELECT key,kind,state,due_at,deadline_at,attempts FROM mw_jobs ORDER BY due_at,key`);
    return rows;
  }
}

export async function openQueue(env=process.env) {
  need(env.MW_DATABASE_URL,'MW_DATABASE_URL required; use a dedicated private database');
  const {Pool}=await import('pg');
  const pool=new Pool({connectionString:env.MW_DATABASE_URL,max:5,connectionTimeoutMillis:10000,statement_timeout:15000});
  return {queue:new PostgresQueue(pool),close:()=>pool.end()};
}
