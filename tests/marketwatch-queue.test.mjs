import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildDay} from '../automation/marketwatch/core.mjs';
import {calendarJobs,PostgresQueue} from '../automation/marketwatch/queue.mjs';
import {runTick} from '../automation/marketwatch/worker.mjs';
const calendar=JSON.parse(readFileSync(new URL('../automation/marketwatch/calendar.json',import.meta.url)));

test('calendar creates 36 stable jobs and never authorizes paid calls or publication',()=>{
  const day=buildDay(calendar,'2026-11-06',{marketState:'trading',calendarSource:'https://example.org/fixture'});
  const jobs=calendarJobs(day);
  assert.equal(jobs.length,36);assert.equal(new Set(jobs.map(j=>j.key)).size,36);
  assert.equal(jobs.find(j=>j.key==='2026-11-06_market-ahead:REVIEW_HANDOFF').dueAt,'2026-11-06T01:30:00.000Z');
  for(const j of jobs){assert.equal(j.payload.paid_calls_authorized,false);assert.equal(j.payload.publish_authorized,false);}
  assert.throws(()=>calendarJobs({}));
});
test('inspect mode never leases work or invokes handlers; enable requires handlers',async()=>{
  const queue={status:async()=>[{state:'PENDING'}],claim:()=>assert.fail('inspect leased a job')};
  assert.equal((await runTick(queue,{})).mode,'INSPECT_ONLY');
  await assert.rejects(runTick(queue,{}, {enabled:true}),/handlers/);
});
test('external handler exception is uncertain, local exception retryable; provider messages are not persisted',async()=>{
  for(const safe of [false,true]){
    let outcome;
    const queue={recover:async()=>{},claim:async()=>({key:'fixture',kind:'FIXTURE',retry_safe:safe}),finish:async(j,o)=>{outcome=o;return 'TEST';}};
    await runTick(queue,{FIXTURE:async()=>{throw new Error('secret token');}},{enabled:true});
    assert.equal(outcome.uncertain,!safe);assert.equal(outcome.retryable,safe);assert.doesNotMatch(JSON.stringify(outcome),/secret/);
  }
});

// Real PostgreSQL in CI, isolated schema per run; never point this at production.
test('PostgreSQL: concurrent claims, restart recovery, deadline incidents, fencing and atomic outbox', {skip:!process.env.MW_TEST_DATABASE_URL},async t=>{
  const {Pool}=await import('pg');
  const schema=`mw_test_${process.pid}_${Date.now()}`;
  const admin=new Pool({connectionString:process.env.MW_TEST_DATABASE_URL});
  await admin.query(`CREATE SCHEMA ${schema}`);
  const pool=new Pool({connectionString:process.env.MW_TEST_DATABASE_URL,options:`-c search_path=${schema}`,max:8});
  t.after(async()=>{await pool.end();await admin.query(`DROP SCHEMA ${schema} CASCADE`);await admin.end();});
  const q=new PostgresQueue(pool);await q.migrate();await q.migrate();
  const make=(key,safe=true)=>({key,kind:'FIXTURE',payload:{fixture:true},retrySafe:safe,dueAt:new Date(Date.now()-10000).toISOString(),deadlineAt:new Date(Date.now()+3600000).toISOString()});
  const jobs=[make('a'),make('b')];
  assert.equal(await q.enqueue(jobs),2);assert.equal(await q.enqueue(jobs),0);
  await assert.rejects(q.enqueue([{...jobs[0],payload:{changed:true}}]),/conflict/);
  // The earlier successful INSERT must roll back when a later row conflicts.
  await assert.rejects(q.enqueue([make('rollback'),{...jobs[0],payload:{changed:true}}]));
  assert.equal((await pool.query("SELECT * FROM mw_jobs WHERE key='rollback'")).rowCount,0);
  const claimed=await Promise.all(Array.from({length:5},()=>q.claim(['FIXTURE'])));
  assert.deepEqual(claimed.filter(Boolean).map(j=>j.key).sort(),['a','b']);
  const a=claimed.find(j=>j?.key==='a');
  assert.equal(await q.finish(a,{ok:true,result:{fixture:true}}),'DONE');
  assert.equal((await pool.query("SELECT * FROM mw_outbox WHERE topic='JOB_COMPLETED'")).rowCount,1);
  await assert.rejects(q.finish(a,{ok:true}),/Lease lost/);
  // A new queue instance recovers expired safe work, but fences the stale token.
  await pool.query("UPDATE mw_jobs SET lease_until=now()-interval '1 second' WHERE key='b'");
  const restarted=new PostgresQueue(pool);await restarted.recover();
  const b=await restarted.claim(['FIXTURE']);assert.equal(b.key,'b');
  await assert.rejects(q.finish(claimed.find(j=>j?.key==='b'),{ok:true}),/Lease lost/);
  await restarted.finish(b,{ok:true});
  await q.enqueue([make('external',false)]);
  await q.claim(['FIXTURE']);
  await pool.query("UPDATE mw_jobs SET lease_until=now()-interval '1 second' WHERE key='external'");
  await q.recover();assert.equal((await q.status()).find(j=>j.key==='external').state,'UNKNOWN');
  assert.equal(await q.claim(['FIXTURE']),null);
  const late=make('late');late.dueAt=new Date(Date.now()-20000).toISOString();late.deadlineAt=new Date(Date.now()-10000).toISOString();
  await q.enqueue([late]);await q.recover();await q.recover();
  assert.equal((await q.status()).find(j=>j.key==='late').state,'MISSED');
  assert.equal((await pool.query("SELECT * FROM mw_outbox WHERE key='late:MISSED'")).rowCount,1);
  await q.enqueue([make('failure')]);const f=await q.claim(['FIXTURE']);
  assert.equal(await q.finish(f,{retryable:true}),'PENDING');assert.equal(await q.claim(['FIXTURE']),null);
});
