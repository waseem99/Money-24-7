import path from 'node:path';
import {mkdir,readFile,copyFile} from 'node:fs/promises';
import {validateProgramme} from '../../src/broadcast/contracts.js';
import {exampleProgramme} from '../../src/broadcast/fixtures.js';
import {bindAlignment,speechMap} from '../../src/broadcast/speech.js';
import {slots,compileTimeline} from '../../src/broadcast/timeline.js';
import {hash,atomicJSON,readJSON,id} from '../contracts.mjs';
import {runBase,exists,withLock,editorial} from '../workflow.mjs';
import {mediaRecord,command,verifyAudible,inspectMedia} from '../media.mjs';
import {Providers,required} from '../providers.mjs';
import {Store,chargedJob,jobKey} from '../store.mjs';
import {invalidateOutput} from '../archive.mjs';
export {editorial};

export async function initV2(file,{fixture=false,profile='sample'}={}){
  const episode=validateProgramme(file?await readJSON(file):exampleProgramme(profile)),digest=hash(episode);
  const name=`${episode.id}-${digest.slice(0,10)}-${fixture?'fixture':'real'}`,root=path.join(runBase(),name);
  if(await exists(path.join(root,'manifest.json')))return loadV2(name);
  await mkdir(path.join(root,'assets'),{recursive:true,mode:0o700});
  const manifest={version:2,name,episodeHash:digest,fixture,assets:{},listeners:{},attempts:{},pending:{},createdAt:new Date().toISOString(),state:'planned'};
  await atomicJSON(path.join(root,'episode.json'),episode);await atomicJSON(path.join(root,'manifest.json'),manifest);return {name,root,episode,manifest};
}
export async function loadV2(name){id(name);const root=path.join(runBase(),name),manifest=await readJSON(path.join(root,'manifest.json')),episode=validateProgramme(await readJSON(path.join(root,'episode.json')));if(manifest.version!==2||manifest.episodeHash!==hash(episode))throw new Error('Programme changed; initialize a new revision');return {name,root,manifest,episode};}
async function fresh(run){Object.assign(run,await loadV2(run.manifest.name));}
async function save(run){await atomicJSON(path.join(run.root,'manifest.json'),run.manifest);}
export async function requireEditorial(run){const r=await readJSON(path.join(run.root,'editorial.json')).catch(()=>null);if(r?.episodeHash!==hash(run.episode)||r.status!=='approved')throw new Error('Approve exact programme with editorial first');}
export function requiresAlpha(p,presenterId){return p.scenes.some(s=>s.presenterIds.includes(presenterId)&&(s.template==='anchor-analyst-wall'||p.cues.some(c=>s.turnIds.includes(c.turnId)&&c.template==='anchor-analyst-wall'))&&s.presenterIds[1]===presenterId);}
export async function checkAlpha(file){
  const {stderr}=await command('ffmpeg',['-hide_banner','-c:v','libvpx-vp9','-i',file,'-vf','alphaextract,signalstats,metadata=print','-frames:v','3','-f','null','-']);
  const lo=[...stderr.matchAll(/lavfi.signalstats.YMIN=(\d+)/g)].map(x=>+x[1]),hi=[...stderr.matchAll(/lavfi.signalstats.YMAX=(\d+)/g)].map(x=>+x[1]);
  if(!lo.length||Math.min(...lo)>=250||Math.max(...hi)<=5)throw new Error('Decoded alpha plane must contain transparent and visible pixels');return true;
}
function presenter(run,turn){return run.episode.presenters.find(p=>p.id===turn.speakerId);}
function ruleSet(p){return p.pronunciations||[];}
export async function verifyAsset(run,asset){const file=path.join(run.root,'assets',asset.file);if(path.basename(asset.file)!==asset.file||hash(await readFile(file))!==asset.sha256)throw new Error('Asset integrity mismatch');return file;}
async function validateTake(file,turn,{listener=false,alpha=false}={}){
  const record=await mediaRecord(file);
  if(!record.video||Math.min(record.video.width,record.video.height)<720||Math.max(record.video.width,record.video.height)<1280||!Number.isFinite(record.duration))throw new Error('A moving source of at least 1280×720 is required');
  if(listener){if(record.duration<turn.durationMs/1000-.035)throw new Error('Listener must cover the complete scene without looping');}
  else{
    if(!record.audio||record.duration>turn.durationMs/1000+.035||record.duration<turn.durationMs/1000-3)throw new Error('Speaker take must fit its slot, with at most three seconds breathing room');
    if(Math.abs(record.audio.start-record.video.start)>.12||Math.abs(record.audio.duration-record.video.duration)>.15)throw new Error('Source A/V timing mismatch');
    record.loudness=await verifyAudible(file);
  }
  const anomalies=await inspectMedia(file,{freeze:true,silence:!listener});if(!anomalies.pass)throw new Error('Source has black, frozen or unexpected silent sections');
  if(alpha)await checkAlpha(file);return {...record,alpha,anomalies};
}
export async function importV2(run,{turnId,sceneId,presenterId,file,alignmentFile,provenance,reaction='neutral',synthetic=false}={}){
  if(run.manifest.fixture)throw new Error('Import media into a real run');if(!provenance?.trim())throw new Error('Provenance and permitted use required');await requireEditorial(run);
  return withLock(run.root,async()=>{await fresh(run);let target,p,listener=!!sceneId,key;
    if(listener){target=run.episode.scenes.find(s=>s.id===sceneId);p=run.episode.presenters.find(p=>p.id===presenterId);if(!target||!p||!target.presenterIds.includes(p.id)||!['neutral','nod','attentive'].includes(reaction))throw new Error('Invalid listener binding');key=`${sceneId}-${p.id}-${reaction}`;}
    else{target=run.episode.turns.find(t=>t.id===turnId);if(!target)throw new Error('Unknown turn');p=presenter(run,target);key=target.id;}
    const alpha=requiresAlpha(run.episode,p.id),record=await validateTake(file,target,{listener,alpha});let timing={};
    if(!listener){const input=await readJSON(alignmentFile);timing=bindAlignment(target.text,ruleSet(p),input.alignment||input);timing.offsetMs=input.offsetMs||0;if(!Number.isFinite(timing.offsetMs)||Math.abs(timing.offsetMs)>2000||timing.alignment.character_end_times_seconds.at(-1)*1000+timing.offsetMs>record.duration*1000+35||timing.alignment.character_start_times_seconds[0]*1000+timing.offsetMs<0)throw new Error('Alignment exceeds source media');}
    const dest=`${key}-${record.sha256.slice(0,12)}.${alpha?'webm':'mp4'}`;await copyFile(file,path.join(run.root,'assets',dest));
    await invalidateOutput(run.root);const collection=listener?run.manifest.listeners:run.manifest.assets;
    run.manifest.history??=[];if(collection[key])run.manifest.history.push({key,asset:collection[key],at:new Date().toISOString()});
    collection[key]={...record,...timing,file:dest,kind:listener?'listener':'speaker',presenterId:p.id,provenance,synthetic,source:'manual-import',reason:'Explicit imported performance fallback'};
    if(!listener)delete run.manifest.pending[key];run.manifest.state='media-partial';await save(run);return collection[key];
  });
}
// A paid render must be released for this exact immutable episode and capped explicitly.
// This is an operator authorization gate, NOT a substitute for the provider wallet limit.
export function requirePaidRelease(run,env){
  if(env.PILOT_PAID_RELEASE_EPISODE_HASH!==run.manifest.episodeHash)throw new Error('Paid generation locked: approve and set PILOT_PAID_RELEASE_EPISODE_HASH for the exact programme');
  const approved=Number(env.PILOT_PAID_RELEASE_MAX_USD),reserved=Number(env.PILOT_MAX_ESTIMATED_USD);
  if(!Number.isFinite(approved)||approved<=0||!Number.isFinite(reserved)||reserved<=0||reserved>approved)throw new Error('Paid generation locked: PILOT_MAX_ESTIMATED_USD must be within a positive PILOT_PAID_RELEASE_MAX_USD');
}
export async function produceV2(run,{paid=false,env=process.env,provider=new Providers(env),turnId,onProgress=()=>{}}={}){
  if(!paid||run.manifest.fixture)throw new Error('Real provider production requires --paid');await requireEditorial(run);
  for(const name of ['ELEVENLABS_API_KEY','ELEVENLABS_MODEL_ID','HEYGEN_API_KEY'])required(env,name);
  if(turnId&&!run.episode.turns.some(t=>t.id===turnId))throw new Error('Unknown turn');
  for(const field of ['PILOT_SPEECH_ESTIMATE_USD','PILOT_AVATAR_ESTIMATE_USD','PILOT_MAX_ESTIMATED_USD'])if(!(Number(env[field])>0))throw new Error('Positive estimate required: '+field);
  requirePaidRelease(run,env);
  for(const p of run.episode.presenters.filter(p=>run.episode.turns.some(t=>t.speakerId===p.id&&(!turnId||turnId===t.id)))){required(env,`ELEVENLABS_${p.configRef}_VOICE_ID`);required(env,`HEYGEN_${p.configRef}_AVATAR_ID`);if(requiresAlpha(run.episode,p.id)&&env[`HEYGEN_${p.configRef}_MATTING`]!=='true')throw new Error(`Confirm matting compatibility before paid calls: HEYGEN_${p.configRef}_MATTING=true`);}
  if(run.episode.snapshots.some(s=>s.kind==='current'&&Date.parse(s.expiresAt)<=Date.now()))throw new Error('Expired source snapshot: revise programme before production');
  return withLock(run.root,async()=>{await fresh(run);const db=new Store(run.root);try{
    for(const t of run.episode.turns.filter(t=>!turnId||t.id===turnId)){
      if(run.manifest.assets[t.id]){await verifyAsset(run,run.manifest.assets[t.id]);continue;}
      const p=presenter(run,t),alpha=requiresAlpha(run.episode,p.id),attempt=run.manifest.attempts[t.id]||0;
      const voiceId=required(env,`ELEVENLABS_${p.configRef}_VOICE_ID`),avatarId=required(env,`HEYGEN_${p.configRef}_AVATAR_ID`);
      if(alpha&&env[`HEYGEN_${p.configRef}_MATTING`]!=='true')throw new Error(`Confirm compatible matting asset: HEYGEN_${p.configRef}_MATTING=true; transparent standing footage is required`);
      const mapped=speechMap(t.text,ruleSet(p)),voiceFile=path.join(run.root,'assets',`${t.id}-${attempt}-voice.mp3`);
      const sk=jobKey('v2-speech',{programme:run.manifest.episodeHash,turn:t.id,attempt,text:mapped.spokenText,voiceId,model:env.ELEVENLABS_MODEL_ID});
      run.manifest.pending[t.id]??={};run.manifest.pending[t.id].speechKey=sk;await save(run);
      const speech=await chargedJob(db,sk,{amount:Number(env.PILOT_SPEECH_ESTIMATE_USD),cap:Number(env.PILOT_MAX_ESTIMATED_USD),category:'speech',units:{characters:mapped.spokenText.length}},()=>provider.speech(mapped.spokenText,p.configRef,voiceFile));
      const timing=bindAlignment(t.text,ruleSet(p),speech.alignment),voice=await mediaRecord(voiceFile);
      if(voice.duration>t.durationMs/1000||voice.duration<t.durationMs/1000-3)throw new Error('Speech pacing does not fit the planned turn; revise script or import a take');await verifyAudible(voiceFile);
      const uk=jobKey('v2-upload',{voice:voice.sha256});let upload=db.get(uk)?.data;if(!upload){upload=await provider.upload(voiceFile);db.set(uk,'complete',upload);}
      const ak=jobKey('v2-avatar',{voice:voice.sha256,avatarId,attempt,turn:t.id,alpha});run.manifest.pending[t.id].avatarKey=ak;await save(run);
      const submitted=await chargedJob(db,ak,{amount:Number(env.PILOT_AVATAR_ESTIMATE_USD),cap:Number(env.PILOT_MAX_ESTIMATED_USD),category:'avatar',units:{seconds:voice.duration}},()=>provider.avatar(upload.assetId,p.configRef,ak,{alpha}));
      const status=await provider.status(submitted.videoId);run.manifest.pending[t.id]={...run.manifest.pending[t.id],videoId:submitted.videoId,state:status.status};await save(run);
      if(['failed','error','canceled'].includes(status.status))throw new Error('Provider failed; reconcile the saved job before a paid retake');
      if(status.status!=='completed'){onProgress(`${t.id}: ${status.status}; resume polls the saved job`);continue;}
      const file=path.join(run.root,'assets',`${t.id}-${attempt}.${alpha?'webm':'mp4'}`);await provider.download(status.video_url,file);
      const record=await validateTake(file,t,{alpha});if(timing.alignment.character_end_times_seconds.at(-1)>record.duration+.035)throw new Error('Speech alignment exceeds avatar duration');
      run.manifest.assets[t.id]={...record,...timing,offsetMs:0,kind:'speaker',presenterId:p.id,synthetic:false,source:'heygen',providerJobId:submitted.videoId,voiceSha256:voice.sha256,provenance:'Configured provider avatar and voice; operator verifies rights'};delete run.manifest.pending[t.id];
      db.metric(ak,{providerReadyAt:new Date().toISOString()});await save(run);onProgress(`${t.id}: ready`);
    }
    run.manifest.state='media-partial';await save(run);return readiness(run);
  }finally{db.close();}});
}
export function readiness(run){
  const missing=[];if(run.manifest.fixture)return {ready:true,fixture:true,missing};
  for(const source of run.episode.snapshots)if(source.kind==='current'&&Date.parse(source.expiresAt)<=Date.now())missing.push(`expired-source:${source.id}`);
  for(const t of run.episode.turns)if(!run.manifest.assets[t.id])missing.push(`speaker:${t.id}`);
  for(const scene of run.episode.scenes){const variants=[scene,...run.episode.cues.filter(c=>scene.turnIds.includes(c.turnId)&&c.action==='camera.cut').map(c=>({...scene,template:c.template}))];
    for(const pid of new Set(variants.flatMap(s=>slots(s).map(x=>x.presenterId))))if(!run.manifest.listeners[`${scene.id}-${pid}-neutral`])missing.push(`listener:${scene.id}:${pid}:neutral`);
  }
  for(const cue of run.episode.cues.filter(c=>c.action==='listener.react')){const scene=run.episode.scenes.find(s=>s.turnIds.includes(c.turnId));if(!run.manifest.listeners[`${scene.id}-${cue.presenterId}-${cue.reaction}`])missing.push(`listener:${scene.id}:${cue.presenterId}:${cue.reaction}`);}
  return {ready:!missing.length,fixture:false,missing};
}
export async function retakeV2(run,turnId,reason){if(!reason?.trim())throw new Error('Retake reason required');return withLock(run.root,async()=>{await fresh(run);if(!run.episode.turns.some(t=>t.id===turnId))throw new Error('Unknown turn');if(run.manifest.pending[turnId])throw new Error('Pending job requires reconciliation or import');await invalidateOutput(run.root);run.manifest.history??=[];run.manifest.history.push({turnId,reason,asset:run.manifest.assets[turnId]||null,at:new Date().toISOString()});delete run.manifest.assets[turnId];run.manifest.attempts[turnId]=(run.manifest.attempts[turnId]||0)+1;run.manifest.state='media-partial';await save(run);});}
export async function reconcileV2(run,key,videoId){id(videoId);return withLock(run.root,async()=>{await fresh(run);if(!Object.values(run.manifest.pending).some(x=>x.avatarKey===key))throw new Error('Job not bound to this run');const db=new Store(run.root);try{const job=db.get(key);if(!['submitting','uncertain'].includes(job?.state))throw new Error('Only uncertain avatar submissions can be reconciled');db.set(key,'complete',{videoId,reconciledAt:new Date().toISOString()});}finally{db.close();}});}
export const humanChecks=['identities','lipSync','dialogue','listeners','standingComposition','chartReadability','claimsAndSources','audio','disclosure','overallQuality'];
export async function approveV2(run,input){return withLock(run.root,async()=>{await fresh(run);if(run.manifest.fixture)throw new Error('Rehearsals cannot be approved');await requireEditorial(run);const qa=await readJSON(path.join(run.root,'output/qa.json')),master=await mediaRecord(path.join(run.root,'output/master.mp4'));
  if(!input.reviewer?.trim()||humanChecks.some(k=>input.checks?.[k]!==true)||!qa.pass||qa.synthetic||qa.episodeHash!==run.manifest.episodeHash||qa.masterHash!==master.sha256||qa.assetHash!==hash({assets:run.manifest.assets,listeners:run.manifest.listeners}))throw new Error('Exact real master, passing QA and all named human checks required');
  const approval={reviewer:input.reviewer,checks:input.checks,masterHash:master.sha256,episodeHash:run.manifest.episodeHash,at:new Date().toISOString(),status:'approved'};await atomicJSON(path.join(run.root,'approval.json'),approval);return approval;
});}
export async function defectV2(run,input){if(!run.episode.turns.some(t=>t.id===input.turnId)||!['voice','lipSync','gesture','facts','graphics','timing','other'].includes(input.category)||!input.note?.trim()||input.note.length>2000||!Number.isFinite(input.atMs)||input.atMs<0||input.atMs>run.episode.durationMs)throw new Error('Valid timed defect and turn required');return withLock(run.root,async()=>{const file=path.join(run.root,'defects.json'),items=await readJSON(file).catch(()=>[]);items.push({...input,episodeHash:run.manifest.episodeHash,createdAt:new Date().toISOString()});await atomicJSON(file,items);return items;});}
