import {createHash} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import {mkdirSync} from 'node:fs';
import path from 'node:path';

const need = (ok, message) => { if (!ok) throw new Error(message); };
const instant = value => {
  need(typeof value === 'string' && /(?:Z|[+-]\d\d:\d\d)$/.test(value) && Number.isFinite(Date.parse(value)), 'Explicit timestamp with timezone required');
  return Date.parse(value);
};
const stable = value => Array.isArray(value) ? value.map(stable) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(k => [k, stable(value[k])])) : value;
export const digest = value => createHash('sha256').update(JSON.stringify(stable(value))).digest('hex');

export function buildDay(calendar, date, {marketState, calendarSource} = {}) {
  need(/^\d{4}-\d{2}-\d{2}$/.test(date) && new Date(`${date}T00:00:00Z`).toISOString().slice(0,10) === date, 'Valid broadcast date required');
  need(calendar.timezone === 'Asia/Karachi', 'Unsupported calendar timezone');
  need(date >= calendar.effective_from && date <= calendar.effective_until, 'Outside configured calendar range');
  need(marketState === 'trading' && /^https:\/\//.test(calendarSource || ''), 'Verified trading calendar source required; non-trading schedule is not configured');
  const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
  need(weekday !== 0 && weekday !== 6, 'Weekend schedule is not configured');
  need(calendar.slots.length === 12 && new Set(calendar.slots.map(s => s.id)).size === 12, 'Twelve distinct programmes required');
  need(Number.isInteger(calendar.review_lead_minutes) && calendar.review_lead_minutes === 120, 'Two-hour lead required');
  const programmes = calendar.slots.map(slot => {
    need(/^[a-z0-9-]+$/.test(slot.id) && Number.isFinite(slot.minutes) && slot.minutes > 0, 'Invalid slot');
    const time = weekday === 5 ? slot.friday_airtime || slot.airtime : slot.airtime;
    need(/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time), 'Invalid airtime');
    const air = instant(`${date}T${time}:00+05:00`);
    return {...slot, episode_id: `${date}_${slot.id}`, scheduled_at: new Date(air).toISOString(),
      review_due_at: new Date(air - 120 * 60000).toISOString(),
      draft_due_at: new Date(air - 150 * 60000).toISOString(),
      release_due_at: new Date(air - 15 * 60000).toISOString(),
      status: 'PLANNED', assignment_status: 'PROVISIONAL', calendar_version: calendar.version};
  }).sort((a,b) => a.scheduled_at.localeCompare(b.scheduled_at));
  need(programmes.reduce((n,s) => n+s.minutes,0) === 90 && calendar.fresh_minutes === 90, 'Fresh editorial total must be 90 minutes');
  for (let i=1; i<programmes.length; i++) need(instant(programmes[i-1].scheduled_at)+programmes[i-1].minutes*60000 <= instant(programmes[i].scheduled_at), 'Programme overlap');
  return {date, timezone: calendar.timezone, calendar_source: calendarSource, market_state: marketState,
    fresh_editorial_minutes: 90, paid_generation_enabled: false, programmes};
}

export function sealScript(script) {
  need(/^[a-z0-9_-]+$/.test(script.episode_id || '') && Number.isInteger(script.version) && script.version > 0, 'Episode/version required');
  need(instant(script.expires_at) > instant(script.source_cutoff), 'Expiry must follow source cutoff');
  need(script.presenter && script.language && script.disclosure, 'Presenter, language and disclosure required');
  need(Array.isArray(script.scenes) && script.scenes.length > 0 && new Set(script.scenes.map(s=>s.id)).size === script.scenes.length, 'Distinct scenes required');
  need(Array.isArray(script.sources) && script.sources.length > 0, 'Evidence ledger required');
  const sourceIds = new Set(script.sources.map(s => s.id));
  need(sourceIds.size === script.sources.length, 'Duplicate evidence ID');
  for (const s of script.sources) need(s.id && /^https:\/\//.test(s.url) && s.supports && instant(s.checked_at) <= instant(script.source_cutoff), 'Source URL, support and observation before cutoff required');
  for (const scene of script.scenes) {
    need(/^[a-z0-9_-]+$/.test(scene.id || '') && typeof scene.dialogue === 'string' && scene.dialogue.trim() && scene.flow_prompt && scene.visual_cue, 'Complete scene dialogue/prompt/visual required');
    need(!/\{\{|\[INSERT|\bTBD\b/i.test(scene.dialogue), 'Unfilled dialogue placeholder');
    need(Array.isArray(scene.source_ids) && scene.source_ids.length > 0 && scene.source_ids.every(id => sourceIds.has(id)), 'Scene evidence required');
    need(Array.isArray(scene.asset_refs) && scene.asset_refs.length > 0 && scene.asset_refs.every(a => a.filename && /^https:\/\//.test(a.url)), 'Exact asset filenames and links required');
  }
  need(Array.isArray(script.blockers) && script.blockers.length === 0, 'Resolve script blockers');
  const immutable = structuredClone(script);
  return {script: immutable, hash: digest(immutable)};
}

// Single-host foundation only. Keep database on a private durable volume.
// No network transports or paid-provider calls are included in this phase.
export class ReviewStore {
  constructor(root) {
    mkdirSync(root, {recursive:true, mode:0o700});
    this.db = new DatabaseSync(path.join(root,'marketwatch.sqlite'));
    this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
      CREATE TABLE IF NOT EXISTS versions (episode TEXT, version INTEGER, hash TEXT, payload TEXT, status TEXT,
        reviewer TEXT, thread TEXT, receipt TEXT, sent_at TEXT, review_deadline TEXT, decision_at TEXT,
        PRIMARY KEY(episode,version));
      CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY, episode TEXT, version INTEGER);
      CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY, episode TEXT, version INTEGER, kind TEXT, at TEXT);
      CREATE TABLE IF NOT EXISTS outbox (key TEXT PRIMARY KEY, episode TEXT, version INTEGER, kind TEXT, payload TEXT);`);
  }
  transaction(fn) { this.db.exec('BEGIN IMMEDIATE'); try { const r=fn(); this.db.exec('COMMIT'); return r; } catch(e) {this.db.exec('ROLLBACK'); throw e;} }
  event(e,v,kind,at) { this.db.prepare('INSERT INTO events(episode,version,kind,at) VALUES (?,?,?,?)').run(e,v,kind,at); }
  get(e,v) { return this.db.prepare('SELECT * FROM versions WHERE episode=? AND version=?').get(e,v); }
  latest(e) { return this.db.prepare('SELECT * FROM versions WHERE episode=? ORDER BY version DESC LIMIT 1').get(e); }
  draft(script, now) {
    instant(now); const sealed=sealScript(script);
    need(instant(script.source_cutoff) <= instant(now) && instant(now) < instant(script.expires_at), 'Future cutoff or expired script');
    return this.transaction(()=>{
      const old=this.latest(script.episode_id);
      if(old?.version === script.version && old.hash === sealed.hash) return old;
      need(!old || script.version > old.version, 'Revision must increase version; never overwrite');
      this.db.prepare("UPDATE versions SET status='SUPERSEDED' WHERE episode=?").run(script.episode_id);
      this.db.prepare('DELETE FROM outbox WHERE episode=?').run(script.episode_id);
      this.db.prepare('INSERT INTO versions(episode,version,hash,payload,status) VALUES (?,?,?,?,?)').run(script.episode_id,script.version,sealed.hash,JSON.stringify(sealed.script),'DRAFT');
      this.event(script.episode_id,script.version,'DRAFT',now);
      return this.get(script.episode_id,script.version);
    });
  }
  sent(e,v,{reviewer,thread,receipt,sentAt}) {
    instant(sentAt); need(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reviewer || '') && thread && receipt, 'Confirmed email receipt and reviewer required');
    return this.transaction(()=>{
      const r=this.get(e,v); need(r && this.latest(e).version === v, 'Stale version');
      if(r.receipt === receipt && r.thread === thread && r.reviewer === reviewer.toLowerCase() && r.sent_at === sentAt) return r;
      need(r.status === 'DRAFT' && instant(sentAt) >= instant(JSON.parse(r.payload).source_cutoff) && instant(sentAt) < instant(JSON.parse(r.payload).expires_at), 'Only current unexpired draft can be sent');
      const deadline=new Date(instant(sentAt)+600000).toISOString();
      this.db.prepare("UPDATE versions SET status='REVIEW_PENDING',reviewer=?,thread=?,receipt=?,sent_at=?,review_deadline=? WHERE episode=? AND version=?").run(reviewer.toLowerCase(),thread,receipt,sentAt,deadline,e,v);
      this.event(e,v,'EMAIL_SENT',sentAt); return this.get(e,v);
    });
  }
  reply(e,v,{id,from,thread,hash,action,receivedAt,authenticated}) {
    instant(receivedAt);
    return this.transaction(()=>{
      const r=this.get(e,v);
      need(r && this.latest(e).version === v && r.hash === hash, 'Stale script/hash');
      need(authenticated === true && r.reviewer === from?.toLowerCase() && r.thread === thread && instant(receivedAt) >= instant(r.sent_at), 'Unverified reviewer/thread/time');
      need(id && id !== r.receipt, 'Reply message ID required');
      if(this.db.prepare('SELECT id FROM messages WHERE id=?').get(id)) return r;
      need(['REVIEW_PENDING','AUTO_APPROVED','APPROVED','HOLD','CHANGES_REQUIRED'].includes(r.status), 'Script is not reviewable');
      need(['APPROVED','HOLD','CHANGES_REQUIRED','FEEDBACK'].includes(action), 'Unknown review action');
      need(!['HOLD','CHANGES_REQUIRED'].includes(r.status) || action !== 'APPROVED', 'Revised script required after hold/changes');
      const status=action === 'FEEDBACK' ? 'HOLD' : action;
      this.db.prepare('INSERT INTO messages VALUES (?,?,?)').run(id,e,v);
      this.db.prepare('UPDATE versions SET status=?,decision_at=? WHERE episode=? AND version=?').run(status,receivedAt,e,v);
      this.db.prepare('DELETE FROM outbox WHERE episode=? AND version=?').run(e,v);
      this.event(e,v,status,receivedAt); return this.get(e,v);
    });
  }
  expireReview(e,v,{now,inboxCheckedThrough}) {
    // Transport must first synchronize ALL replies through now; an inbox failure
    // cannot be interpreted as silence. Pass checkpoint only after full catch-up.
    instant(now); instant(inboxCheckedThrough);
    return this.transaction(()=>{
      const r=this.get(e,v); need(r && this.latest(e).version === v, 'Stale version');
      if(r.status !== 'REVIEW_PENDING') return r;
      need(instant(inboxCheckedThrough) >= instant(now), 'Inbox catch-up required before automatic approval');
      if(instant(now) < instant(r.review_deadline)) return r;
      const expired=instant(now) >= instant(JSON.parse(r.payload).expires_at);
      const status=expired ? 'EXPIRED' : 'AUTO_APPROVED';
      this.db.prepare('UPDATE versions SET status=?,decision_at=? WHERE episode=? AND version=?').run(status,now,e,v);
      this.event(e,v,status,now); return this.get(e,v);
    });
  }
  queue(e,v,now) {
    return this.transaction(()=>{
      const r=this.get(e,v); need(r && this.latest(e).version === v && ['APPROVED','AUTO_APPROVED'].includes(r.status), 'Current script approval required');
      need(instant(now) < instant(JSON.parse(r.payload).expires_at), 'Script expired');
      const key=`${e}:v${v}:${r.hash}:PREPRODUCTION`;
      const payload={episode_id:e,version:v,script_hash:r.hash,approval_kind:r.status,paid_calls_authorized:false,publish_authorized:false};
      this.db.prepare('INSERT OR IGNORE INTO outbox VALUES (?,?,?,?,?)').run(key,e,v,'PREPRODUCTION',JSON.stringify(payload));
      return payload;
    });
  }
  close() { this.db.close(); }
}

export function productionGate({enabled=false,model,credentialsPresent=false,qualified=false,budgetUsd=0}={}) {
  return {ready:false, configuration_ready:enabled === true && credentialsPresent === true && qualified === true && !!model && Number.isFinite(budgetUsd) && budgetUsd > 0,
    implemented:false, reason:'Paid adapter is not implemented in phase 1; passing configuration does not submit a render'};
}
