import {DatabaseSync} from 'node:sqlite';
import {hash} from '../contracts.mjs';
// Durable readiness/claim ledger for the later shared encoder trial. Claiming
// before delivery avoids double-air after restart; unresolved claims require an
// operator decision and are never silently replayed. This is not an encoder.
export class ReadyQueue {
  constructor(file){this.db=new DatabaseSync(file);this.db.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS segments(id TEXT PRIMARY KEY, digest TEXT, state TEXT, data TEXT); CREATE TABLE IF NOT EXISTS questions(id TEXT PRIMARY KEY,data TEXT);');}
  add(s,now=Date.now()){
    if(!s.id||!s.masterHash||!s.approvalHash||!s.qaPass||s.fixture||!Number.isFinite(s.durationMs)||s.durationMs<=0||s.pendingJobs||!Number.isFinite(s.validUntil)||s.validUntil<=now||!Number.isFinite(s.priority))throw new Error('Only approved, unexpired, complete real segments can queue');
    const digest=hash(s),old=this.db.prepare('SELECT * FROM segments WHERE id=?').get(s.id);if(old){if(old.digest!==digest)throw new Error('Segment ID cannot be reused for a new revision');return old.state;}
    this.db.prepare('INSERT INTO segments VALUES (?,?,?,?)').run(s.id,digest,'ready',JSON.stringify(s));return 'ready';
  }
  supersede(id){this.db.prepare("UPDATE segments SET state='superseded' WHERE id=? AND state='ready'").run(id);}
  next(now=Date.now()){
    this.db.exec('BEGIN IMMEDIATE');try{const candidates=[];for(const r of this.db.prepare("SELECT * FROM segments WHERE state='ready'").all()){const s=JSON.parse(r.data);if(s.validUntil<=now)this.db.prepare("UPDATE segments SET state='expired' WHERE id=?").run(s.id);else candidates.push(s);}
      candidates.sort((a,b)=>b.priority-a.priority||a.validUntil-b.validUntil||a.id.localeCompare(b.id));const s=candidates[0];if(s)this.db.prepare("UPDATE segments SET state='claimed' WHERE id=?").run(s.id);this.db.exec('COMMIT');return s||null;
    }catch(e){this.db.exec('ROLLBACK');throw e;}
  }
  complete(id,{programmeSequence,deliveredAt}={}){if(!Number.isInteger(programmeSequence)||programmeSequence<1||!Number.isFinite(deliveredAt))throw new Error('Delivery receipt required');const r=this.db.prepare("SELECT * FROM segments WHERE id=? AND state='claimed'").get(id);if(!r)throw new Error('Claim missing or already delivered');const data={...JSON.parse(r.data),programmeSequence,deliveredAt};this.db.prepare("UPDATE segments SET state='played',data=? WHERE id=?").run(JSON.stringify(data),id);}
  question(q){if(!q.id||!q.text?.trim()||q.text.length>1000||!Number.isFinite(q.receivedAt)||!Number.isFinite(q.viewerPositionMs)||!q.topic)throw new Error('Invalid question');this.db.prepare('INSERT INTO questions VALUES (?,?) ON CONFLICT(id) DO NOTHING').run(q.id,JSON.stringify({...q,status:'awaiting-editorial-selection'}));}
  status(now=Date.now()){const rows=this.db.prepare('SELECT * FROM segments').all().map(r=>({...JSON.parse(r.data),state:r.state})),readyMs=rows.filter(r=>r.state==='ready'&&r.validUntil>now).reduce((n,r)=>n+r.durationMs,0);return {rows,readyMs,lowWatermark:readyMs<60000,targetMs:120000,unresolvedClaims:rows.filter(r=>r.state==='claimed').map(r=>r.id),certified:false};}
  close(){this.db.close();}
}
