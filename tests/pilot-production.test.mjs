import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {mkdtemp,rm,mkdir,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {spokenText} from '../pilot/pronunciation.mjs';
import {retake,pipeline} from '../pilot/production.mjs';
import {Store,chargedJob} from '../pilot/store.mjs';
import {parseAnomalies,checkTake} from '../pilot/media.mjs';
import {invalidateOutput} from '../pilot/archive.mjs';
import {hash,readJSON} from '../pilot/contracts.mjs';
const temp=async t=>{const root=await mkdtemp(path.join(tmpdir(),'production-test-'));t.after(()=>rm(root,{recursive:true,force:true}));return root;};
test('pronunciation aliases respect word boundaries and protect numbers',()=>{
  assert.equal(spokenText('NASDAQ rose 5%. NASDAQs unchanged.',[{term:'NASDAQ',say:'Naz-dak'}]),'Naz-dak rose 5%. NASDAQs unchanged.');
  assert.throws(()=>spokenText('5%',[{term:'5',say:'6'}]),/numerical/);
  assert.equal(spokenText('A+B rose.',[{term:'A+B',say:'A plus B'}]),'A plus B rose.');
});
test('targeted retake preserves unrelated media and archived metadata without charging',async t=>{
  const root=await temp(t);const run={root,episode:{shots:[{id:'a',speaker:'anchor'}]},manifest:{assets:{a:{file:'old.mp4'},b:{file:'untouched.mp4'}},pending:{a:{state:'completed'}}}};
  await writeFile(path.join(root,'approval.json'),'{}');const r=await retake(run,'a','Pronunciation correction');assert.equal(r.paidCalls,0);assert.equal(run.manifest.assets.a,undefined);assert.equal(run.manifest.assets.b.file,'untouched.mp4');assert.equal(run.manifest.history[0].asset.file,'old.mp4');assert.equal(run.manifest.attempts.a,1);
});
test('retake cannot duplicate an uncertain paid request or a running avatar',async t=>{
  const root=await temp(t);const run={root,episode:{shots:[{id:'a',speaker:'anchor'}]},manifest:{assets:{},pending:{a:{speechKey:'speech-key'}}}};
  const db=new Store(root);db.set('speech-key','uncertain');await assert.rejects(retake(run,'a','Again'),/Reconcile/);db.set('speech-key','complete',{});db.close();run.manifest.pending.a={avatarKey:'avatar-key',state:'waiting'};await assert.rejects(retake(run,'a','Again'),/still pending/);
});
test('usage records measured latency and retains unknown actual billing',async t=>{
  const db=new Store(await temp(t));await chargedJob(db,'speech',{amount:1,cap:5,category:'speech',units:{characters:23}},async()=>({usage:{tokens:4}}));const m=db.summary().metrics[0];assert.equal(m.actualBilledUSD,null);assert.equal(m.units.characters,23);assert.ok(m.responseMs>=0);assert.equal(m.providerUsage.tokens,4);db.close();
});
test('anomaly parser captures unfinished freezes and timestamped black/silent intervals',()=>{
  const a=parseAnomalies('black_start:1 black_end:2 black_duration:1\nfreeze_start: 3\nsilence_start: 4\nsilence_end: 7',10);assert.equal(a.black[0].duration,1);assert.equal(a.freeze[0].end,10);assert.equal(a.silence[0].duration,3);
});
test('A/V mismatch gate rejects offset or unequal source tracks',()=>{
  const record={duration:11,video:{width:1920,height:1080,duration:11,start:0},audio:{duration:10,start:.3}};assert.throws(()=>checkTake({id:'s',duration:12},record),/timing mismatch/);
});
test('integrated pipeline resumes production and renders once ready; fixture makes no calls',async t=>{
  const root=await temp(t);const run={root,episode:{shots:[{id:'a',speaker:'anchor',layout:'presenter'}]},manifest:{fixture:false,assets:{}}};let calls=0,renders=0;
  const producer=async()=>{calls++;if(calls===2)run.manifest.assets.a={file:'ready.mp4'};};const renderer=async()=>{renders++;return {master:{sha256:'hash'},technicalPass:true};};
  await pipeline(run,{paid:true,pollMs:1,producer,renderer});assert.equal(calls,2);assert.equal(renders,1);
  run.manifest.fixture=true;run.manifest.assets={};await pipeline(run,{producer:()=>{throw new Error('fixture called provider');},renderer});assert.equal(renders,2);
});
test('replacing a programme archives the exact approved master and approval',async t=>{
  const root=await temp(t);await mkdir(path.join(root,'output'));await writeFile(path.join(root,'output/master.mp4'),'approved-bytes');const masterHash=hash('approved-bytes');await writeFile(path.join(root,'approval.json'),JSON.stringify({masterHash,reviewer:'test'}));await invalidateOutput(root);assert.equal((await readJSON(path.join(root,'archive',masterHash,'approval.json'))).reviewer,'test');
});
