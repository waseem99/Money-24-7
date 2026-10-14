import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const p=JSON.parse(readFileSync(new URL('../docs/STOCKS-17-SHOT-READINESS-20261014.json',import.meta.url),'utf8'));

test('storyboard has all seventeen contiguous timecoded shot slots and source-safe alternatives',()=>{
 assert.equal(p.shots.length,17);
 let end=0;
 for(let i=0;i<p.shots.length;i++){
  const s=p.shots[i];
  assert.equal(s.id,String(i+1).padStart(2,'0'));
  assert.equal(s.start_ms,end);
  assert.equal(s.end_ms,s.start_ms+s.duration_ms);
  assert.ok(s.primary_plan.trim().length>=10);
  assert.ok(s.fallback_plan.length>12);
  assert.equal(s.release_ready,false,'Planning cannot claim finished shot');
  assert.notEqual(s.qa_status,'PASS','Existing sample shots cannot certify entire storyboard');
  end=s.end_ms;
 }
 assert.equal(end,260000);
 assert.equal(p.source_storyboard.master_approved,false);
});

test('cast and editorial snapshot stay distinct from experimental close-edition identities',()=>{
 assert.equal(p.cast.nora.look_id,'5ee67ac453c34ffebd71e8eedb47b2fe');
 assert.equal(p.cast.marcus.look_id,'de9f36c26bd841c891489a0c9d6174de');
 assert.equal(p.source_storyboard.source_snapshot_time,'09:40 ET');
 assert.equal(p.source_storyboard.prerecorded,true);
 assert.ok(p.source_banks.some(x=>x.id==='EXPERIMENTAL_W3_W7'&&x.approval==='NOT_APPROVED_FOR_ORIGINAL_CAST'));
 assert.equal(p.cast.remote.status,'pending');
});

test('cost and final release fail closed until explicit approval',()=>{
 assert.equal(p.spend_guard.automatic_paid_generation,false);
 assert.equal(p.spend_guard.manual_approval_required,true);
 assert.equal(p.spend_guard.new_paid_submissions_enabled,false);
 assert.equal(p.spend_guard.new_paid_submissions_limit,0);
 assert.equal(p.spend_guard.wallet_fresh_read_required,true);
 assert.equal(p.release_state,'BLOCKED_PENDING_GATES');
 assert.equal(p.gates.length,7);
 assert.ok(p.gates.every(g=>g.status==='BLOCKED'&&!g.approved_sha256));
});
