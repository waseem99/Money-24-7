import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {buildDay,sealScript,ReviewStore,productionGate} from '../automation/marketwatch/core.mjs';
const calendar=JSON.parse(readFileSync(new URL('../automation/marketwatch/calendar.json',import.meta.url),'utf8'));
const options={marketState:'trading',calendarSource:'https://example.org/verified-calendar'};
const fixture=(version=1)=>({episode_id:'2026-11-05_morning-brief',version,presenter:'ali',language:'ur-PK-en',disclosure:'AI presenter',source_cutoff:'2026-11-05T02:00:00Z',expires_at:'2026-11-05T06:00:00Z',blockers:[],sources:[{id:'s1',url:'https://example.org/release',checked_at:'2026-11-05T01:59:00Z',supports:'Fixture demonstration only'}],scenes:[{id:'a01',dialogue:'This is a test fixture, not a broadcast script.',flow_prompt:'Read the exact supplied dialogue.',visual_cue:'Approved studio',source_ids:['s1'],asset_refs:[{filename:'ali.png',url:'https://example.org/ali.png'}]}]});
const store=t=>{const root=mkdtempSync(path.join(tmpdir(),'mw-'));const db=new ReviewStore(root);t.after(()=>{db.close();rmSync(root,{recursive:true,force:true});});return db;};
const send=db=>{db.draft(fixture(),'2026-11-05T02:00:00Z');return db.sent(fixture().episode_id,1,{reviewer:'reviewer@example.org',thread:'thread1',receipt:'sent1',sentAt:'2026-11-05T03:00:00Z'});};
const reply=(r,action='APPROVED')=>({id:'reply1',from:'reviewer@example.org',thread:r.thread,hash:r.hash,action,receivedAt:'2026-11-05T03:05:00Z',authenticated:true});

test('12 Thursday programmes total 90 fresh minutes with all review deadlines exactly two hours early',()=>{
  const day=buildDay(calendar,'2026-11-05',options);
  assert.equal(day.programmes.length,12); assert.equal(day.fresh_editorial_minutes,90);
  assert.equal(day.programmes[0].review_due_at,'2026-11-05T01:45:00.000Z');
  for(const s of day.programmes) assert.equal(Date.parse(s.scheduled_at)-Date.parse(s.review_due_at),7200000);
  assert.equal(day.paid_generation_enabled,false);
});
test('Friday earlier morning and later closing slots match session',()=>{
  const day=buildDay(calendar,'2026-11-06',options);
  assert.equal(day.programmes[0].review_due_at,'2026-11-06T01:30:00.000Z');
  const close=day.programmes.find(s=>s.id==='closing-review');
  assert.equal(close.review_due_at,'2026-11-06T10:00:00.000Z'); assert.equal(close.preclose_review,true);
});
test('calendar blocks weekends, unknown holidays/state, out-of-range dates and overlaps',()=>{
  for(const d of ['2026-11-07','2026-12-01','2026-11-31']) assert.throws(()=>buildDay(calendar,d,options));
  assert.throws(()=>buildDay(calendar,'2026-11-05'));
  assert.throws(()=>buildDay(calendar,'2026-11-05',{...options,marketState:'closed'}));
  const bad=structuredClone(calendar);bad.slots[1].airtime='08:46';assert.throws(()=>buildDay(bad,'2026-11-05',options),/overlap/);
});
test('hash is stable across key order; altered dialogue, assets or sources require a new version',()=>{
  const a=fixture();const reordered=Object.fromEntries(Object.entries(a).reverse());assert.equal(sealScript(a).hash,sealScript(reordered).hash);
  for(const mutate of [s=>s.scenes[0].dialogue+=' Changed.',s=>s.scenes[0].asset_refs[0].filename='other.png',s=>s.sources[0].supports='Changed']){const b=fixture();mutate(b);assert.notEqual(sealScript(a).hash,sealScript(b).hash);}
  for(const mutate of [s=>s.blockers.push('missing data'),s=>s.scenes[0].source_ids=['missing'],s=>s.scenes[0].dialogue='[INSERT PRICE]',s=>s.scenes[0].asset_refs=[]]){const b=fixture();mutate(b);assert.throws(()=>sealScript(b));}
});
test('10-minute clock starts only with confirmed sent receipt and is durable',t=>{
  const db=store(t);db.draft(fixture(),'2026-11-05T02:00:00Z');
  assert.throws(()=>db.sent(fixture().episode_id,1,{reviewer:'reviewer@example.org',sentAt:'2026-11-05T03:00:00Z'}));
  const r=send(db);assert.equal(r.review_deadline,'2026-11-05T03:10:00.000Z');
  const second=new ReviewStore(path.dirname(db.db.location()));assert.equal(second.get(r.episode,1).review_deadline,r.review_deadline);second.close();
  assert.equal(send(db).status,'REVIEW_PENDING');
});
test('timeout cannot approve early or with an incomplete inbox scan; exact deadline auto-approves',t=>{
  const db=store(t),r=send(db);
  assert.throws(()=>db.expireReview(r.episode,1,{now:'2026-11-05T03:10:00Z',inboxCheckedThrough:'2026-11-05T03:09:00Z'}),/catch-up/);
  assert.equal(db.expireReview(r.episode,1,{now:'2026-11-05T03:09:59Z',inboxCheckedThrough:'2026-11-05T03:09:59Z'}).status,'REVIEW_PENDING');
  assert.equal(db.expireReview(r.episode,1,{now:'2026-11-05T03:10:00Z',inboxCheckedThrough:'2026-11-05T03:10:00Z'}).status,'AUTO_APPROVED');
  db.queue(r.episode,1,'2026-11-05T03:11:00Z');db.queue(r.episode,1,'2026-11-05T03:11:01Z');
  assert.equal(db.db.prepare('SELECT COUNT(*) AS n FROM outbox').get().n,1);
});
test('HOLD, changes and substantive feedback prevent timeout approval',t=>{
  const db=store(t);const r=send(db);db.reply(r.episode,1,reply(r,'FEEDBACK'));
  assert.equal(db.expireReview(r.episode,1,{now:'2026-11-05T03:20:00Z',inboxCheckedThrough:'2026-11-05T03:20:00Z'}).status,'HOLD');
  assert.throws(()=>db.queue(r.episode,1,'2026-11-05T03:21:00Z'),/approval/);
  assert.throws(()=>db.reply(r.episode,1,{...reply(r),id:'reply2'}),/Revised/);
});
test('wrong sender, thread, hash, timestamp or unauthenticated reply is rejected; duplicate is idempotent',t=>{
  const db=store(t),r=send(db);
  for(const change of [{from:'other@example.org'},{thread:'wrong'},{hash:'wrong'},{authenticated:false},{receivedAt:'2026-11-05T02:00:00Z'}]) assert.throws(()=>db.reply(r.episode,1,{...reply(r),...change}));
  db.reply(r.episode,1,reply(r));db.reply(r.episode,1,reply(r));
  assert.equal(db.db.prepare('SELECT COUNT(*) AS n FROM messages').get().n,1);
});
test('late hold revokes automatic approval and cancels pending handoff',t=>{
  const db=store(t),r=send(db);db.expireReview(r.episode,1,{now:'2026-11-05T03:10:00Z',inboxCheckedThrough:'2026-11-05T03:10:00Z'});
  db.queue(r.episode,1,'2026-11-05T03:11:00Z');db.reply(r.episode,1,{...reply(r,'HOLD'),receivedAt:'2026-11-05T03:12:00Z'});
  assert.equal(db.db.prepare('SELECT COUNT(*) AS n FROM outbox').get().n,0);
});
test('revision invalidates previous approval/queue and starts its own review window',t=>{
  const db=store(t),r=send(db);db.reply(r.episode,1,reply(r));db.queue(r.episode,1,'2026-11-05T03:06:00Z');
  db.draft(fixture(2),'2026-11-05T03:07:00Z');
  assert.throws(()=>db.queue(r.episode,1,'2026-11-05T03:08:00Z'));
  assert.throws(()=>db.reply(r.episode,1,{...reply(r),id:'old-reply'}));
  const v2=db.sent(r.episode,2,{reviewer:'reviewer@example.org',thread:'thread2',receipt:'sent2',sentAt:'2026-11-05T03:20:00Z'});
  assert.equal(v2.review_deadline,'2026-11-05T03:30:00.000Z');
  assert.equal(db.db.prepare('SELECT COUNT(*) AS n FROM outbox').get().n,0);
});
test('expiry blocks approval timeout and queue; credentials alone never enable rendering',t=>{
  const db=store(t),r=send(db);
  assert.equal(db.expireReview(r.episode,1,{now:'2026-11-05T06:01:00Z',inboxCheckedThrough:'2026-11-05T06:01:00Z'}).status,'EXPIRED');
  assert.throws(()=>db.queue(r.episode,1,'2026-11-05T06:02:00Z'));
  assert.equal(productionGate({enabled:true,model:'account-qualified-model',credentialsPresent:true,qualified:true,budgetUsd:10}).ready,false);
});

test('pack exports exact dialogue, linked assets, sources and separate approval manifest',async t=>{
  const {exportPack}=await import('../automation/marketwatch/pack.mjs');
  const root=mkdtempSync(path.join(tmpdir(),'mw-pack-'));t.after(()=>rmSync(root,{recursive:true,force:true}));
  const s=fixture(),p=await exportPack(s,root);
  assert.match(readFileSync(path.join(p.root,'Scripts/voice-copy.txt'),'utf8'),/test fixture/);
  assert.match(readFileSync(path.join(p.root,'Flow Prompts and Assets/scene-prompts.txt'),'utf8'),/ali.png/);
  assert.equal(JSON.parse(readFileSync(path.join(p.root,'Review and Approvals/manifest.json'),'utf8')).paid_calls_authorized,false);
  assert.equal((await exportPack(s,root)).root,p.root);
});
