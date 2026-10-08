import path from 'node:path';
import {mkdir,readFile,copyFile,access,open,unlink,readlink} from 'node:fs/promises';
import {hostname} from 'node:os';
import {Store,jobKey,chargedJob} from './store.mjs';
import {hash,atomicJSON,readJSON,validateEpisode,realSetting,id,validateAlignment} from './contracts.mjs';
import {Providers,required} from './providers.mjs';
import {mediaRecord,checkTake,verifyAudible} from './media.mjs';
import {compose} from './compositor.mjs';

export const runBase=()=>path.resolve(process.env.PILOT_DATA_DIR || 'pilot-runs');
export async function exists(file) {try{await access(file);return true;}catch{return false;}}
export async function loadRun(name) {
  id(name);const root=path.join(runBase(),name);const manifest=await readJSON(path.join(root,'manifest.json'));const episode=validateEpisode(await readJSON(path.join(root,'episode.json')));
  if(manifest.episodeHash!==hash(episode))throw new Error('Episode changed. Create a new run to invalidate dependent assets.');
  return {root,manifest,episode};
}
export async function withLock(root,fn) {
  const file=path.join(root,'worker.lock');let handle;
  try {handle=await open(file,'wx',0o600);}catch{throw new Error('Worker already locked. If interrupted, run unlock after checking the worker is stopped.');}
  try {await handle.writeFile(JSON.stringify({pid:process.pid,host:hostname(),namespace:await readlink('/proc/self/ns/pid').catch(()=>null),processStart:await processStart(process.pid)}));return await fn();}
  finally {await handle.close();await unlink(file);}
}
async function processStart(pid){return readFile(`/proc/${pid}/stat`,'utf8').then(s=>s.slice(s.lastIndexOf(')')+2).split(' ')[19]).catch(()=>null);}
export async function unlock(root) {
  const file=path.join(root,'worker.lock');const lock=await readJSON(file);
  if(lock.host!==hostname())throw new Error('Lock belongs to another host; reconcile on that host');
  const namespace=await readlink('/proc/self/ns/pid').catch(()=>null);
  if(lock.namespace&&namespace!==lock.namespace)throw new Error('Lock belongs to another process namespace; reconcile on the original worker');
  const currentStart=await processStart(lock.pid);
  if(!lock.processStart||!currentStart||currentStart===lock.processStart){try {process.kill(lock.pid,0);throw new Error('Worker process is still alive');}catch(e){if(e.code!=='ESRCH')throw e;}}
  await unlink(file);
}
export async function init(file,{fixture=false}={}) {
  const episode=validateEpisode(await readJSON(file));const digest=hash(episode);const name=`${episode.id}-${digest.slice(0,10)}-${fixture?'fixture':'real'}`;const root=path.join(runBase(),name);
  if(await exists(path.join(root,'manifest.json')))return {name,...await loadRun(name)};
  await mkdir(path.join(root,'assets'),{recursive:true,mode:0o700});
  const manifest={version:1,name,episodeHash:digest,fixture,createdAt:new Date().toISOString(),assets:{},state:'planned'};
  await atomicJSON(path.join(root,'episode.json'),episode);await atomicJSON(path.join(root,'manifest.json'),manifest);
  return {name,root,manifest,episode};
}
export async function editorial(run,reviewer) {
  if(!reviewer?.trim())throw new Error('Named editorial reviewer required');
  await atomicJSON(path.join(run.root,'editorial.json'),{episodeHash:hash(run.episode),reviewer,at:new Date().toISOString(),status:'approved',scope:'script, numerical claims, evidence and planned visuals'});
}
async function requireEditorial(run) {
  const review=await readJSON(path.join(run.root,'editorial.json')).catch(()=>null);
  if(review?.status!=='approved'||review.episodeHash!==hash(run.episode))throw new Error('Approve the script with editorial before real media production');
}
export function configuration(env=process.env) {
  return ['AI_GATEWAY_API_KEY','AI_GATEWAY_MODEL','ELEVENLABS_API_KEY','ELEVENLABS_MODEL_ID','ELEVENLABS_ANCHOR_VOICE_ID','ELEVENLABS_ANALYST_VOICE_ID','HEYGEN_API_KEY','HEYGEN_ANCHOR_AVATAR_ID','HEYGEN_ANALYST_AVATAR_ID'].map(name=>({name,configured:realSetting(env[name])}));
}
const estimates=env=>({cap:Number(env.PILOT_MAX_ESTIMATED_USD),speech:Number(env.PILOT_SPEECH_ESTIMATE_USD),avatar:Number(env.PILOT_AVATAR_ESTIMATE_USD),director:Number(env.PILOT_DIRECTOR_ESTIMATE_USD)});
export async function direct(run,{paid=false,provider=new Providers(),env=process.env}={}) {
  if(!paid||run.manifest.fixture)throw new Error('Director requires a real run and --paid; curated episode works without a model');
  required(env,'AI_GATEWAY_API_KEY');required(env,'AI_GATEWAY_MODEL');
  return withLock(run.root,async()=>{
    const db=new Store(run.root);try {
      const cost=estimates(env);const key=jobKey('director',{episode:run.episode,model:env.AI_GATEWAY_MODEL,promptVersion:1});
      const result=await chargedJob(db,key,{amount:cost.director,cap:cost.cap,category:'director'},()=>provider.direct(run.episode));
      await atomicJSON(path.join(run.root,'director-draft.json'),result.episode);await atomicJSON(path.join(run.root,'director-report.json'),{model:result.model,usage:result.usage,promptVersion:result.promptVersion});
      return path.join(run.root,'director-draft.json');
    }finally{db.close();}
  });
}
export async function produce(run,{paid=false,provider=new Providers(),env=process.env,onProgress=()=>{},shotId}={}) {
  if(run.manifest.fixture)throw new Error('Fixture runs never call providers; use render');
  if(!paid)throw new Error('Production calls require --paid after reviewing estimates');
  await requireEditorial(run);
  if(shotId&&!run.episode.shots.some(s=>s.id===shotId&&s.speaker))throw new Error('Unknown audition shot');
  for(const setting of configuration(env).filter(s=>!s.name.startsWith('AI_')))if(!setting.configured)throw new Error(`Configure ${setting.name}`);
  return withLock(run.root,async()=> {
    const db=new Store(run.root);const cost=estimates(env);const {episode,manifest,root}=run;
    try {
      for(const shot of episode.shots.filter(s=>s.speaker&&(!shotId||s.id===shotId))) {
        if(manifest.assets[shot.id])continue;
        onProgress(`Preparing ${shot.id}`);
        const voiceFile=path.join(root,'assets',`${shot.id}-voice.mp3`);
        const sk=jobKey('speech',{episode:manifest.episodeHash,shot:shot.id,voice:env[`ELEVENLABS_${shot.speaker.toUpperCase()}_VOICE_ID`],model:env.ELEVENLABS_MODEL_ID});
        const speech=await chargedJob(db,sk,{amount:cost.speech,cap:cost.cap,category:'speech'},()=>provider.speech(shot.text,shot.speaker,voiceFile));
        if(!await exists(voiceFile))throw new Error('Completed speech artifact missing; import a recovered take, do not resubmit blindly');
        const voice=await mediaRecord(voiceFile);checkTake(shot,voice,{voice:true});
        await verifyAudible(voiceFile);
        if(speech.alignment.character_end_times_seconds.at(-1)>shot.duration)throw new Error('Speech alignment exceeds shot');
        const uk=jobKey('upload',{voice:voice.sha256});
        // Upload is cached too, with no billing assumption. Network errors are safe to retry uploads.
        let upload=db.get(uk)?.data;if(!upload){upload=await provider.upload(voiceFile);db.set(uk,'complete',upload);}
        const ak=jobKey('avatar',{voice:voice.sha256,avatar:env[`HEYGEN_${shot.speaker.toUpperCase()}_AVATAR_ID`]});
        const submitted=await chargedJob(db,ak,{amount:cost.avatar,cap:cost.cap,category:'avatar'},()=>provider.avatar(upload.assetId,shot.speaker,ak));
        const status=await provider.status(submitted.videoId);
        if(['failed','error','canceled'].includes(status.status))throw new Error(`Avatar failed: ${shot.id}. Inspect provider job ${submitted.videoId}; no automatic paid retry.`);
        if(status.status!=='completed'){onProgress(`${shot.id} queued. Run produce again later to poll; no duplicate submit.`);continue;}
        if(!status.video_url)throw new Error('Completed video missing URL');
        const file=path.join(root,'assets',`${shot.id}.mp4`);await provider.download(status.video_url,file);
        const record=await mediaRecord(file,{kind:'presenter',fixture:false,provider:'heygen',providerJobId:submitted.videoId,voiceSha256:voice.sha256,alignment:speech.alignment});checkTake(shot,record);
        record.sourceLoudness=await verifyAudible(file);
        manifest.assets[shot.id]=record;await atomicJSON(path.join(root,'manifest.json'),manifest);
      }
      manifest.state=episode.shots.filter(s=>s.speaker).every(s=>manifest.assets[s.id])?'media-ready':'awaiting-media';
      manifest.spend=db.summary();await atomicJSON(path.join(root,'manifest.json'),manifest);return manifest;
    }finally{db.close();}
  });
}
export async function importTake(run,shotId,file,{provenance,alignmentFile}={}) {
  if(run.manifest.fixture)throw new Error('Import real takes into a real run');await requireEditorial(run);id(shotId);
  const shot=run.episode.shots.find(s=>s.id===shotId&&s.speaker);if(!shot)throw new Error('Unknown speaking shot');
  if(!provenance?.trim())throw new Error('Provide provenance: provider, identity, rights and render reference');
  const record=await mediaRecord(path.resolve(file));checkTake(shot,record);
  record.sourceLoudness=await verifyAudible(path.resolve(file));
  const alignment=alignmentFile?await readJSON(alignmentFile):null;
  if(alignment)validateAlignment(alignment,shot.duration);
  return withLock(run.root,async()=> {
    const dest=path.join(run.root,'assets',`${shotId}.mp4`);await copyFile(path.resolve(file),dest);
    run.manifest.assets[shotId]={...record,file:path.basename(dest),kind:'presenter',fixture:false,provider:'manual-import',provenance,alignment};
    run.manifest.state='media-imported';await atomicJSON(path.join(run.root,'manifest.json'),run.manifest);
    // Any replacement invalidates the previous render and human approval.
    for(const stale of ['approval.json','output/qa.json'])await unlink(path.join(run.root,stale)).catch(()=>{});
  });
}
export async function reconcile(run,key,videoId) {
  if(!key.startsWith('avatar-'))throw new Error('Only avatar submissions can be reconciled by provider video ID. Import other recovered outputs.');id(videoId);
  return withLock(run.root,async()=>{const db=new Store(run.root);try{const old=db.get(key);if(!old||!['submitting','uncertain'].includes(old.state))throw new Error('No uncertain avatar submission to reconcile');db.set(key,'complete',{videoId,reconciledAt:new Date().toISOString()});}finally{db.close();}});
}
export async function illustration(run,{paid=false,provider=new Providers(),env=process.env}={}) {
  if(!paid||run.manifest.fixture)throw new Error('Illustration requires a real run and --paid');await requireEditorial(run);
  required(env,'AI_GATEWAY_API_KEY');required(env,'AI_IMAGE_MODEL');
  return withLock(run.root,async()=>{
    const db=new Store(run.root);try{
      const prompt=run.episode.shots[0].imagePrompt;const file=path.join(run.root,'assets','opening-art.png');const key=jobKey('illustration',{prompt,model:env.AI_IMAGE_MODEL});
      const result=await chargedJob(db,key,{amount:Number(env.PILOT_IMAGE_ESTIMATE_USD),cap:Number(env.PILOT_MAX_ESTIMATED_USD),category:'illustration'},()=>provider.illustration(prompt,file));
      if(!await exists(file))throw new Error('Generated illustration missing; recover original output');
      run.manifest.illustration={...result,file:'opening-art.png',sha256:hash(await readFile(file))};await atomicJSON(path.join(run.root,'manifest.json'),run.manifest);
    }finally{db.close();}
  });
}
export async function render(run,onProgress) {
  if(!run.manifest.fixture)await requireEditorial(run);
  return withLock(run.root,async()=>{
    await unlink(path.join(run.root,'approval.json')).catch(()=>{});await unlink(path.join(run.root,'output/qa.json')).catch(()=>{});
    const qa=await compose(run.episode,run.manifest,run.root,{fixture:run.manifest.fixture,onProgress});
    run.manifest.state=run.manifest.fixture?'fixture-rendered':'review-ready';run.manifest.masterHash=qa.master.sha256;
    await atomicJSON(path.join(run.root,'manifest.json'),run.manifest);return qa;
  });
}
export async function approve(run,{reviewer,checks,masterHash,notes=''}) {
  return withLock(run.root,async()=> {
    if(run.manifest.fixture)throw new Error('Fixture rehearsal cannot be approved as final');await requireEditorial(run);
    const qa=await readJSON(path.join(run.root,'output/qa.json'));
    const current=hash(await readFile(path.join(run.root,'output/master.mp4')));
    if(!qa.technicalPass || qa.episodeHash!==hash(run.episode) || current!==qa.master.sha256 || current!==masterHash)throw new Error('Technical gate failed or reviewed master changed');
    if(!reviewer?.trim()||!Array.isArray(checks)||qa.review.items.some(item=>!checks.includes(item)))throw new Error('Named reviewer must complete every quality check');
    const approval={status:'approved',reviewer,at:new Date().toISOString(),episodeHash:hash(run.episode),masterHash,checks,notes};
    await atomicJSON(path.join(run.root,'approval.json'),approval);return approval;
  });
}
