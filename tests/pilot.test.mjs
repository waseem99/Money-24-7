import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,writeFile,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import http from 'node:http';
import {validateEpisode,validateDirector,readJSON,realSetting} from '../pilot/contracts.mjs';
import {Store,chargedJob} from '../pilot/store.mjs';
import {Providers} from '../pilot/providers.mjs';
import {checkTake,writeCaptions,timedCues} from '../pilot/media.mjs';
import {createReviewServer} from '../pilot/server.mjs';
import {init,approve,loadRun,withLock,editorial,produce} from '../pilot/workflow.mjs';
const episode=await readJSON(new URL('../pilot/episodes/pilot.json',import.meta.url));
const temporary=async t=>{const p=await mkdtemp(path.join(tmpdir(),'signal-pilot-'));t.after(()=>rm(p,{recursive:true,force:true}));return p;};
test('pilot is an exact 300s two-presenter programme with grounded dialogue',()=>{assert.equal(validateEpisode(episode),episode);assert.equal(episode.shots.at(-1).start+episode.shots.at(-1).duration,300);});
test('rejects timeline gaps, duplicate IDs, unsafe paths, missing evidence and unnatural pacing',()=>{
  for(const mutate of [e=>e.shots[1].start++,e=>e.shots[1].id=e.shots[0].id,e=>e.id='../outside',e=>e.shots[2].sourceIds=['invented'],e=>e.shots[3].text='Hello.']){const e=structuredClone(episode);mutate(e);assert.throws(()=>validateEpisode(e));}
});
test('director cannot alter numerical claims or shot count',()=>{const draft={shots:episode.shots.map(({id,text,imagePrompt})=>({id,text,imagePrompt}))};assert.equal(validateDirector(episode,draft).shots.length,15);draft.shots[3].text=draft.shots[3].text.replace('105','106');assert.throws(()=>validateDirector(episode,draft),/numerical/);});
test('dummy credentials fail before network',async()=>{assert.equal(realSetting('DUMMY_NOT_CONFIGURED'),false);let calls=0;const p=new Providers({ELEVENLABS_ANCHOR_VOICE_ID:'DUMMY'},()=>{calls++;});await assert.rejects(p.speech('Hello','anchor','/tmp/unwritten'),/Configure/);assert.equal(calls,0);});
test('durable jobs resume completed output and refuse duplicate uncertain paid POSTs',async t=>{
  const root=await temporary(t);let db=new Store(root),calls=0;const cost={amount:2,cap:3,category:'avatar'};const run=()=>{calls++;return {videoId:'job-1'};};
  await chargedJob(db,'complete',cost,run);db.close();db=new Store(root);assert.deepEqual(await chargedJob(db,'complete',cost,run),{videoId:'job-1'});assert.equal(calls,1);
  await assert.rejects(chargedJob(db,'expensive',cost,run),/cap/);assert.equal(calls,1);
  await assert.rejects(chargedJob(db,'uncertain',{...cost,amount:1},()=>{calls++;throw new Error('Secret upstream body');}),/uncertain/);
  await assert.rejects(chargedJob(db,'uncertain',{...cost,amount:1},run),/reconciliation/);assert.equal(calls,2);assert.equal(db.summary().reservedEstimateUSD,3);db.close();
});
test('budget refuses zero or unknown price estimates',async t=>{const db=new Store(await temporary(t));assert.throws(()=>db.reserve('bad',0,20,'avatar'),/Positive/);assert.throws(()=>db.reserve('bad',NaN,20,'avatar'),/Positive/);db.close();});
test('voice adapter preserves measured timestamps and documented request shape',async t=>{
  const dir=await temporary(t);let request;const env={ELEVENLABS_API_KEY:'secret-key',ELEVENLABS_ANCHOR_VOICE_ID:'voice-id',ELEVENLABS_MODEL_ID:'model-id'};
  const p=new Providers(env,async(url,opts)=>{request={url,opts};return new Response(JSON.stringify({audio_base64:Buffer.from('audio').toString('base64'),alignment:{characters:['H','i'],character_start_times_seconds:[0,.1],character_end_times_seconds:[.1,.2]}}));});
  const r=await p.speech('Hi','anchor',path.join(dir,'voice.mp3'));assert.equal(r.alignment.characters.join(''),'Hi');assert.match(request.url,/with-timestamps\?output_format=mp3_44100_128/);assert.equal(JSON.parse(request.opts.body).text,'Hi');assert.equal(await readFile(path.join(dir,'voice.mp3'),'utf8'),'audio');
});
test('avatar submission uses external speech and never invents media readiness',async()=>{let request;const p=new Providers({HEYGEN_API_KEY:'secret-key',HEYGEN_ANALYST_AVATAR_ID:'analyst-avatar'},async(url,opts)=>{request={url,opts};return new Response(JSON.stringify({data:{video_id:'video-123',status:'waiting'}}));});assert.deepEqual(await p.avatar('asset-123','analyst','request-123'),{videoId:'video-123'});const data=JSON.parse(request.opts.body);assert.equal(data.audio_asset_id,'asset-123');assert.equal(data.avatar_id,'analyst-avatar');assert.equal(data.script,undefined);});
test('provider failures suppress raw upstream bodies',async()=>{const p=new Providers({},async()=>new Response('APIKEY-PRIVATE',{status:401}));await assert.rejects(p.json('https://example.invalid'),e=>e.message==='Provider HTTP 401');});
test('media gate rejects missing audio, low source resolution and speech requiring trimming',()=>{const shot={id:'test',duration:12};const valid={duration:11,audio:{codec:'aac'},video:{width:1920,height:1080}};checkTake(shot,valid);for(const r of [{...valid,audio:null},{...valid,duration:13},{...valid,duration:5},{...valid,video:{width:640,height:360}}])assert.throws(()=>checkTake(shot,r));});
test('captions use real timing with programme offsets',async t=>{const dir=await temporary(t);const file=path.join(dir,'captions.vtt');await writeCaptions({shots:[{id:'s',text:'Hi',start:15,duration:10}]},{s:{alignment:{characters:['H','i'],character_start_times_seconds:[.2,.3],character_end_times_seconds:[.3,.5]}}},file);assert.match(await readFile(file,'utf8'),/00:00:15.200 --> 00:00:15.500\nHi/);});
test('graphics anchor to measured speech instead of guessed word timing',()=>{
  const shot={id:'chart',duration:10,cues:[{at:1,phrase:'value',label:'100'}]};const characters='The value';const alignment={characters:[...characters],character_start_times_seconds:[0,.1,.2,.3,2,2.1,2.2,2.3,2.4]};
  assert.equal(timedCues(shot,{alignment})[0].at,2);assert.equal(timedCues(shot,{alignment},{fixture:true})[0].at,1);assert.throws(()=>timedCues({...shot,cues:[{at:1,phrase:'missing',label:'100'}]},{alignment}),/Cannot align/);
});
test('run changes invalidate assets, worker locks exclude concurrency, fixture approval fails',async t=>{
  const root=await temporary(t);const previous=process.env.PILOT_DATA_DIR;process.env.PILOT_DATA_DIR=root;t.after(()=>{if(previous===undefined)delete process.env.PILOT_DATA_DIR;else process.env.PILOT_DATA_DIR=previous;});
  const fixture=await init(new URL('../pilot/episodes/pilot.json',import.meta.url),{fixture:true});await assert.rejects(approve(fixture,{reviewer:'test'}),/Fixture/);await withLock(fixture.root,async()=>{await assert.rejects(withLock(fixture.root,()=>{}),/locked/);});
  const real=await init(new URL('../pilot/episodes/pilot.json',import.meta.url));await editorial(real,'test');let calls=0;await assert.rejects(produce(real,{paid:true,env:{},provider:{speech(){calls++;}}}),/Configure/);assert.equal(calls,0);
  const changed=structuredClone(episode);changed.title='changed';await writeFile(path.join(real.root,'episode.json'),JSON.stringify(changed));await assert.rejects(loadRun(real.name),/Episode changed/);
});
test('private review rejects unauthenticated/cross-origin requests, hides secrets, supports ranges',async t=>{
  const dist=await temporary(t);await writeFile(path.join(dist,'pilot.html'),'review');const token='x'.repeat(40);const server=createReviewServer({token,dist});await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>server.close(r)));const base=`http://127.0.0.1:${server.address().port}`;
  assert.equal((await fetch(base+'/api/pilot/runs')).status,401);assert.equal((await fetch(base+'/api/pilot/login',{method:'POST',body:JSON.stringify({token})})).status,403);
  const login=await fetch(base+'/api/pilot/login',{method:'POST',headers:{Origin:base},body:JSON.stringify({token})});assert.equal(login.status,200);const cookie=login.headers.get('set-cookie').split(';')[0];assert.match(login.headers.get('set-cookie'),/HttpOnly; SameSite=Strict/);
  assert.equal((await fetch(base+'/api/pilot/runs',{headers:{Cookie:cookie}})).status,200);assert.equal((await fetch(base+'/.env.local')).status,404);const part=await fetch(base+'/pilot',{headers:{Range:'bytes=0-2'}});assert.equal(part.status,206);assert.equal(await part.text(),'rev');assert.equal((await fetch(base+'/pilot',{headers:{Range:'bytes=999-'}})).status,416);
  const rebound=await new Promise((resolve,reject)=>{http.get(base+'/pilot',{headers:{Host:'evil.example'}},r=>{r.resume();resolve(r.statusCode);}).on('error',reject);});assert.equal(rebound,403);
});
