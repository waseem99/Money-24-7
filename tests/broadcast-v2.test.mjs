import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,readFile,writeFile,mkdir} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {exampleProgramme} from '../src/broadcast/fixtures.js';
import {validateProgramme} from '../src/broadcast/contracts.js';
import {sma,ema,rsi,macd,candles,validateSnapshot} from '../src/broadcast/data.js';
import {compileTimeline,sceneState,slots} from '../src/broadcast/timeline.js';
import {speechMap,bindAlignment} from '../src/broadcast/speech.js';
import {renderSVG} from '../src/broadcast/render.js';
import {validateDraft,directV2} from '../pilot/v2/director.mjs';
import {initV2,loadV2,readiness,approveV2,editorial,defectV2,produceV2,retakeV2} from '../pilot/v2/workflow.mjs';
import {migrateV1} from '../pilot/v2/migrate-v1.mjs';
import {chartTarget} from '../pilot/v2/movement.mjs';
import {ReadyQueue} from '../pilot/v2/playout.mjs';
import {Store} from '../pilot/store.mjs';
import {Providers} from '../pilot/providers.mjs';
import {createReviewServer} from '../pilot/server.mjs';
import {once} from 'node:events';
const timing=text=>({characters:[...text],character_start_times_seconds:[...text].map((_,i)=>i*.02),character_end_times_seconds:[...text].map((_,i)=>(i+1)*.02)});
const copy=structuredClone;

test('sample and pilot retain exact profiles; schema rejects overlapping dialogue and ambiguous cues',()=>{
  for(const profile of ['sample','pilot'])assert.equal(validateProgramme(exampleProgramme(profile)).durationMs,profile==='sample'?45000:300000);
  for(const mutate of [p=>p.durationMs--,p=>p.turns[1].startMs=0,p=>p.scenes[1].startMs++,p=>p.cues[0].tokenStart=999,p=>p.cues[0].action='eval',p=>p.cues[0].seriesId='unknown',p=>p.theme.accent='url(https://invalid)',p=>p.claims[0].subject='WRONG ENTITY',p=>p.claims[0].unit='percentage points',p=>p.claims[0].asOf='2020-01-01',p=>p.claims[0].value++]){const p=exampleProgramme();mutate(p);assert.throws(()=>validateProgramme(p));}
});
test('three presenter roster is supported across scenes without changing the two-person layout contract',()=>{const p=exampleProgramme();p.presenters.push({...p.presenters[1],id:'guest',name:'Guest',configRef:'GUEST'});p.scenes[2].presenterIds[1]='guest';p.turns[2].speakerId='guest';assert.equal(validateProgramme(p).presenters.length,3);p.scenes[1].presenterIds.push('guest');assert.throws(()=>validateProgramme(p),/Two-person/);});
test('financial calculations preserve warm-up gaps and known reference values',()=>{
  assert.deepEqual(sma([1,2,3,4,5],3),[null,null,2,3,4]);assert.deepEqual(ema([1,2,3,4,5],3),[null,null,2,3,4]);
  const prices=[44.34,44.09,44.15,43.61,44.33,44.83,45.10,45.42,45.84,46.08,45.89,46.03,45.61,46.28,46.28];assert.ok(Math.abs(rsi(prices).at(-1)-70.464135)<.00001);
  assert.equal(rsi(Array(16).fill(10)).at(-1),50);const m=macd(Array.from({length:50},(_,i)=>i+1));assert.equal(m.line[24],null);assert.equal(m.line[25],7);assert.equal(m.signal[32],null);assert.equal(m.signal[33],7);assert.equal(m.histogram[33],0);
  const rows=exampleProgramme().snapshots[0].rows;assert.throws(()=>candles([rows[0],rows[0]]));assert.throws(()=>candles([{...rows[0],low:200}]));
});
test('real snapshots require source rights, consistent event time and explicit current expiry',()=>{const s=copy(exampleProgramme().snapshots[0]);s.kind='current';assert.throws(()=>validateSnapshot(s),/entitlement/);s.sourceUrl='https://data.example.test';s.entitlementRef='local-contract';assert.throws(()=>validateSnapshot(s),/expiry/);s.expiresAt='2026-01-01T07:30:00Z';assert.equal(validateSnapshot(s),s);s.asOf='2025-01-01';assert.throws(()=>validateSnapshot(s),/timestamps/);});
test('pronunciation and repeated phrases bind exact token occurrences to measured character timing',()=>{
  assert.equal(bindAlignment('📈 market rises',[],timing('📈 market rises')).tokenOffsets[1],2);
  const text='GDP rises and GDP rises again',rules=[{term:'GDP',say:'G D P'}],mapped=speechMap(text,rules);assert.equal(mapped.spokenText,'G D P rises and G D P rises again');assert.equal(mapped.tokenOffsets[3],16);assert.throws(()=>bindAlignment(text,rules,timing(text)),/exact spoken/);
  const p=exampleProgramme();p.turns[0].text=text;p.cues[0].tokenStart=3;p.cues[0].tokenEnd=4;const assets=Object.fromEntries(p.turns.map(t=>[t.id,bindAlignment(t.text,t.id==='turn-0'?rules:[],timing(t.id==='turn-0'?mapped.spokenText:t.text))]));const timeline=compileTimeline(p,assets);assert.equal(timeline.find(c=>c.id==='cue-0').atMs,570);assert.equal(timeline[0].timing,'measured');assert.throws(()=>compileTimeline(p,{}),/Measured/);
});
test('seeking rebuilds cue state and whitelisted camera cuts; unsupported reactions fail',()=>{
  const p=exampleProgramme();p.cues.push({id:'cut',turnId:'turn-1',action:'camera.cut',template:'chart-full',tokenStart:1,tokenEnd:2,offsetMs:0});const ts=compileTimeline(p,{}, {fixture:true}),cut=ts.find(c=>c.id==='cut');assert.equal(sceneState(p,cut.atMs+1,ts).scene.template,'chart-full');assert.equal(sceneState(p,6001,ts).scene.template,'discussion-two');assert.equal(sceneState(p,cut.atMs+1,ts).scene.template,'chart-full');p.cues.push({id:'react',turnId:'turn-1',action:'listener.react',presenterId:'maya',reaction:'nod',tokenStart:1,tokenEnd:2,offsetMs:0});assert.throws(()=>validateProgramme(p),/reaction/);
});
test('rendered graphics are deterministic and escape text; visible snapshot never drifts to unrelated replay values',()=>{const p=exampleProgramme();p.scenes[0].headline='<script>alert</script>';const ts=compileTimeline(p,{}, {fixture:true}),a=renderSVG(p,1000,ts),b=renderSVG(p,1000,ts);assert.equal(a,b);assert.ok(a.includes('&lt;script&gt;'));assert.ok(!a.includes('<script>'));assert.ok(a.includes('111.00'));assert.ok(a.includes('ILLUSTRATIVE'));assert.equal(slots(p.scenes[3])[1].kind,'alpha');});
function validDraft(p){return {turns:p.turns.map(t=>({id:t.id,text:t.text})),scenes:p.scenes.map(s=>({id:s.id,template:s.template,headline:s.headline})),cues:p.cues};}
test('director inserts complete authorized claims and rejects standalone figures, entities and omitted evidence',()=>{const p=exampleProgramme();p.turns[2].claimIds=[p.claims[0].id];p.turns[2].durationMs=7500;const d=validDraft(p);d.turns[2].text='{{claim:'+p.claims[0].id+'}}';assert.match(validateDraft(p,d).turns[2].text,/SIGNAL 500: change from prior close 11.00 percent, as of/);d.turns[2].text='The market rose 11 percent.';assert.throws(()=>validateDraft(p,d),/authorized/);d.turns[2].text='{{claim:claim-source-1}}';assert.throws(()=>validateDraft(p,d),/authorized/);});
test('V1 migration requires deliberate new OHLC bindings and preserves original version',async()=>{const old=JSON.parse(await readFile(new URL('../pilot/episodes/pilot.json',import.meta.url)));assert.throws(()=>migrateV1(old),/explicit/);const p=exampleProgramme(),bindings=Object.fromEntries(old.shots.map(s=>[s.id,{snapshotId:p.snapshots[0].id}]));const migrated=migrateV1(old,{snapshots:p.snapshots,bindings});assert.equal(migrated.programme.durationMs,300000);assert.equal(old.version,1);assert.equal(migrated.report.mediaReused,false);});
test('standing provider requests preserve alpha and omit opaque background',async()=>{let sent;const p=new Providers({HEYGEN_API_KEY:'real-test-key',HEYGEN_ANALYST_AVATAR_ID:'compatible-avatar'},async(_,opts)=>{sent=JSON.parse(opts.body);return {ok:true,json:async()=>({data:{video_id:'one'}})};});await p.avatar('audio','analyst','job',{alpha:true});assert.equal(sent.output_format,'webm');assert.equal(sent.aspect_ratio,'9:16');assert.equal(sent.fit,'contain');assert.ok(!sent.background);});
test('calibrated target mapping provides research coordinates without claiming a real gesture',()=>{const r=chartTarget(4,50,{count:10,min:0,max:100,pixelRect:{x:100,y:100,w:1000,h:500},worldCorners:[[0,0,0],[2,0,0],[0,0,1]]});assert.deepEqual(r.pixel,{x:550,y:350});assert.deepEqual(r.world,[.9,0,.5]);assert.equal(r.verifiedReach,false);});
test('durable ready queue excludes expired/replaced content and never repeats a claimed segment on restart',async()=>{const root=await mkdtemp(path.join(os.tmpdir(),'signal-queue-')),file=path.join(root,'queue.db');try{let q=new ReadyQueue(file);const segment={id:'one',masterHash:'hash',approvalHash:'approval',qaPass:true,fixture:false,durationMs:45000,pendingJobs:0,validUntil:3000,priority:1};q.add(segment,1000);assert.equal(q.add(segment,1000),'ready');assert.throws(()=>q.add({...segment,masterHash:'changed'},1000),/reused/);assert.equal(q.next(1500).id,'one');q.close();q=new ReadyQueue(file);assert.equal(q.next(1600),null);assert.deepEqual(q.status(1600).unresolvedClaims,['one']);q.complete('one',{programmeSequence:1,deliveredAt:1800});assert.throws(()=>q.complete('one',{programmeSequence:1,deliveredAt:1800}),/already/);q.add({...segment,id:'expired'},1000);assert.equal(q.next(4000),null);q.close();}finally{await rm(root,{recursive:true,force:true});}});
test('V2 workflow locks mutations, bounds paid repairs, exposes missing reaction media and rejects fixture approval',async()=>{
  const root=await mkdtemp(path.join(os.tmpdir(),'signal-v2-')),old=process.env.PILOT_DATA_DIR;process.env.PILOT_DATA_DIR=root;
  try{const fixture=await initV2(null,{fixture:true});await assert.rejects(approveV2(fixture,{}),/Rehearsals/);const run=await initV2();await editorial(run,'test editor');assert.ok(readiness(run).missing.includes('listener:scene-3:daniel:neutral'));await assert.rejects(produceV2(run,{paid:true,env:{}}),/Configure/);
    let calls=0;const env={AI_GATEWAY_API_KEY:'local-mock-key',AI_GATEWAY_MODEL:'mock-model',PILOT_DIRECTOR_ESTIMATE_USD:'1',PILOT_MAX_ESTIMATED_USD:'3'};const request=async()=>{calls++;return {draft:{}};};await assert.rejects(directV2(run,{paid:true,env,request}),/two repairs/);await assert.rejects(directV2(run,{paid:true,env,request}),/two repairs/);assert.equal(calls,3);const db=new Store(run.root);assert.equal(db.summary().reservedEstimateUSD,3);db.close();
    await defectV2(run,{turnId:'turn-0',atMs:200,category:'timing',note:'test defect'});assert.equal(JSON.parse(await readFile(path.join(run.root,'defects.json'))).length,1);
    await retakeV2(run,'turn-0','test new take');assert.equal((await loadV2(run.name)).manifest.attempts['turn-0'],1);
  }finally{if(old===undefined)delete process.env.PILOT_DATA_DIR;else process.env.PILOT_DATA_DIR=old;await rm(root,{recursive:true,force:true});}
});
test('private V2 review shares authentication and refuses cross-origin mutation',async()=>{const root=await mkdtemp(path.join(os.tmpdir(),'signal-review-v2-')),old=process.env.PILOT_DATA_DIR;process.env.PILOT_DATA_DIR=root;const token='private-review-token-with-enough-characters',server=createReviewServer({token});server.listen(0,'127.0.0.1');await once(server,'listening');const base='http://127.0.0.1:'+server.address().port;try{const run=await initV2(null,{fixture:true});assert.equal((await fetch(base+'/api/pilot/v2/runs')).status,401);const login=await fetch(base+'/api/pilot/login',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({token})});const cookie=login.headers.get('set-cookie').split(';')[0];const list=await fetch(base+'/api/pilot/v2/runs',{headers:{cookie}});assert.equal((await list.json())[0].name,run.name);assert.equal((await fetch(base+`/api/pilot/v2/runs/${run.name}/approve`,{method:'POST',headers:{cookie,Origin:'https://bad.example'},body:'{}'})).status,403);}finally{server.close();server.closeAllConnections();if(old===undefined)delete process.env.PILOT_DATA_DIR;else process.env.PILOT_DATA_DIR=old;await rm(root,{recursive:true,force:true});}});
