import path from 'node:path';
import assert from 'node:assert/strict';
import {mkdir,mkdtemp,writeFile,readFile,copyFile} from 'node:fs/promises';
import {exampleProgramme} from '../../src/broadcast/fixtures.js';
import {atomicJSON} from '../contracts.mjs';
import {command,probe} from '../media.mjs';
import {initV2,editorial,importV2,readiness,approveV2,humanChecks,produceV2} from './workflow.mjs';
import {renderV2} from './render.mjs';

// Actual media integration using deliberately synthetic moving test patterns and
// tones. Exercises the real import/composite path; never counts as an audition.
const parent=path.resolve('pilot-runs');await mkdir(parent,{recursive:true});const base=await mkdtemp(path.join(parent,'v2-verification-'));process.env.PILOT_DATA_DIR=base;
const p=exampleProgramme();p.id='composition-integration';p.profile='segment';p.durationMs=9000;
p.scenes=[{...p.scenes[3],id:'studio',startMs:0,durationMs:9000,turnIds:['a','b','c']}];
p.turns=['maya','daniel','maya'].map((speakerId,i)=>({id:['a','b','c'][i],speakerId,startMs:i*3000,durationMs:2800,text:'Moving test media only.',claimIds:[]}));
p.cues=p.turns.map((t,i)=>({id:`cue-${i}`,turnId:t.id,action:'chart.highlight',targetIndex:20+i*25,tokenStart:1,tokenEnd:2,offsetMs:0}));
const json=path.join(base,'programme.json');await atomicJSON(json,p);const run=await initV2(json);await editorial(run,'Synthetic integration harness');
const opaque=path.join(base,'opaque.mp4'),alpha=path.join(base,'alpha.webm');
await command('ffmpeg',['-v','error','-y','-f','lavfi','-i','testsrc2=size=1280x720:rate=30','-f','lavfi','-i','sine=frequency=440:sample_rate=48000','-t','9','-c:v','libx264','-preset','ultrafast','-threads','2','-pix_fmt','yuv420p','-c:a','aac',opaque]);
await command('ffmpeg',['-v','error','-y','-f','lavfi','-i','testsrc2=size=720x1280:rate=30','-f','lavfi','-i','sine=frequency=660:sample_rate=48000','-t','9','-vf','format=rgba,colorchannelmixer=aa=0.65,format=yuva420p','-c:v','libvpx-vp9','-deadline','realtime','-cpu-used','8','-threads','2','-auto-alt-ref','0','-c:a','libopus',alpha]);
for(const [pid,file]of [['maya',opaque],['daniel',alpha]])await importV2(run,{sceneId:'studio',presenterId:pid,file,provenance:'FFmpeg moving pattern, verification only',synthetic:true});
for(const turn of p.turns){
  const transparent=turn.speakerId==='daniel',file=path.join(base,turn.id+(transparent?'.webm':'.mp4'));
  await command('ffmpeg',['-v','error','-y',...(transparent?['-c:v','libvpx-vp9']:[]),'-i',transparent?alpha:opaque,'-t','2.8','-c:v',transparent?'libvpx-vp9':'libx264',...(transparent?['-deadline','realtime','-cpu-used','8','-auto-alt-ref','0','-pix_fmt','yuva420p']:['-preset','ultrafast','-pix_fmt','yuv420p']),'-threads','2','-c:a',transparent?'libopus':'aac',file]);
  const n=turn.text.length,alignment={characters:[...turn.text],character_start_times_seconds:[...turn.text].map((_,i)=>.08+i/n*2.5),character_end_times_seconds:[...turn.text].map((_,i)=>.08+(i+1)/n*2.5)},alignmentFile=path.join(base,turn.id+'.json');await atomicJSON(alignmentFile,{alignment,offsetMs:0});
  await importV2(run,{turnId:turn.id,file,alignmentFile,provenance:'FFmpeg pattern and tone; not human or avatar performance',synthetic:true});
}
assert.equal(readiness(run).ready,true);const qa=await renderV2(run,console.log);assert.equal(qa.pass,true);assert.equal(qa.synthetic,true);
await assert.rejects(approveV2(run,{reviewer:'test',checks:Object.fromEntries(humanChecks.map(k=>[k,true]))}),/Exact real master/);
const media=await probe(path.join(run.root,'output/master.mp4'));assert.equal(media.duration,9);
console.log(JSON.stringify({passed:true,scope:'Synthetic multi-presenter composition, alpha decode, three turns, measured cue mapping, captions, loudness, approval exclusion',qa:qa.checks,output:path.join(run.root,'output/master.mp4')},null,2));

// Exercise asynchronous submit -> saved job -> poll without external requests.
const providerProgramme=structuredClone(p);providerProgramme.id='provider-resume-test';
const providerFile=path.join(base,'provider-programme.json');await atomicJSON(providerFile,providerProgramme);
const providerRun=await initV2(providerFile);await editorial(providerRun,'Mock provider harness');
const calls={speech:0,avatar:0,status:0},jobs=new Map();
const provider={
  async speech(text,role,file){calls.speech++;await command('ffmpeg',['-v','error','-y','-f','lavfi','-i','sine=frequency=440:sample_rate=44100','-t','2.6','-c:a','libmp3lame',file]);const n=text.length;return {alignment:{characters:[...text],character_start_times_seconds:[...text].map((_,i)=>.08+i/n*2.5),character_end_times_seconds:[...text].map((_,i)=>.08+(i+1)/n*2.5)}};},
  async upload(){return {assetId:'mock-audio'};},
  async avatar(asset,role,key){calls.avatar++;jobs.set(key,{role,polled:false});return {videoId:key};},
  async status(key){calls.status++;const job=jobs.get(key);if(!job.polled){job.polled=true;return {status:'processing'};}return {status:'completed',video_url:job.role==='ANALYST'?'mock:alpha':'mock:opaque'};},
  async download(url,file){await copyFile(path.join(base,url==='mock:alpha'?'b.webm':'a.mp4'),file);}
};
const env={ELEVENLABS_API_KEY:'mock-key',ELEVENLABS_MODEL_ID:'mock-model',HEYGEN_API_KEY:'mock-key',ELEVENLABS_ANCHOR_VOICE_ID:'anchor-voice',ELEVENLABS_ANALYST_VOICE_ID:'analyst-voice',HEYGEN_ANCHOR_AVATAR_ID:'anchor-avatar',HEYGEN_ANALYST_AVATAR_ID:'standing-avatar',HEYGEN_ANALYST_MATTING:'true',PILOT_SPEECH_ESTIMATE_USD:'1',PILOT_AVATAR_ESTIMATE_USD:'2',PILOT_MAX_ESTIMATED_USD:'9'};
await produceV2(providerRun,{paid:true,env,provider});assert.equal(Object.keys(providerRun.manifest.assets).length,0);
await produceV2(providerRun,{paid:true,env,provider});assert.equal(Object.keys(providerRun.manifest.assets).length,3);
await produceV2(providerRun,{paid:true,env,provider});assert.deepEqual(calls,{speech:3,avatar:3,status:6});
console.log(JSON.stringify({mockProviderResume:'passed',requests:calls,externalCalls:0}));
