/**
 * Minimal three-turn, two-voice, no-auto-payment audition route for Signal.
 * This is deliberately NOT the 45-second standing-analyst/alpha/listener R2 acceptance trial.
 * Read-only and dry-run commands do not call paid APIs. Paid generation is single-turn only.
 */
import path from 'node:path';
import {mkdir,readFile,rename,writeFile,copyFile} from 'node:fs/promises';
import {runBase,exists,withLock} from '../workflow.mjs';
import {hash,atomicJSON,readJSON,id,realSetting} from '../contracts.mjs';
import {Store,chargedJob,jobKey} from '../store.mjs';
import {Providers,required} from '../providers.mjs';
import {mediaRecord,verifyAudible,inspectMedia,command,vttTime} from '../media.mjs';
import {proposedPresenters} from './budget-preflight.mjs';

const turns=[
  {id:'araj-open',role:'ANCHOR',text:"Good evening, and welcome to Signal. I'm Araj. Markets can move quickly, but one headline rarely tells the whole story. Kevin, what should viewers check first?"},
  {id:'kevin-analysis',role:'ANALYST',text:"I start with the timeframe and trading volume. A sharp move across one session can look very different over a week. It's important to check the source and avoid jumping to conclusions."},
  {id:'araj-close',role:'ANCHOR',text:"Exactly. We'll show the chart and timestamp together, and explain what the numbers can and cannot tell us. This is an AI-presented demonstration using illustrative information. Thanks for watching Signal."}
];

export const nativeAuditionPlan=Object.freeze({
  version:3,id:'signal-native-araj-kevin',kind:'short-presenter-audition',engine:'avatar_iii',
  resolution:'1080p',targetSeconds:45,maxEstimatedClipSeconds:20,disclosure:'AI presenters; illustrative market discussion, not live quotes.',
  turns:turns.map(t=>({...t,avatarId:proposedPresenters[t.role].lookId,
    voiceId:proposedPresenters[t.role].auditionVoiceId,name:proposedPresenters[t.role].name,
    aspectRatio:proposedPresenters[t.role].preferredAspectRatio,
    fit:proposedPresenters[t.role].preferredAspectRatio==='9:16'?'contain':'cover'}))
});
const rateFor=engine=>engine==='avatar_iv'?4:engine==='avatar_iii'?1:NaN; // 1080p digital-twin API rates
const usd=n=>Math.ceil(n*100-1e-9)/100;
export function auditNativePlan(plan=nativeAuditionPlan){
  if(plan.version!==3||plan.kind!=='short-presenter-audition'||!['avatar_iii','avatar_iv'].includes(plan.engine)||plan.resolution!=='1080p')throw new Error('Unapproved audition format/engine');
  if(!Array.isArray(plan.turns)||plan.turns.length!==3||plan.turns.map(t=>t.role).join(',')!=='ANCHOR,ANALYST,ANCHOR')throw new Error('Three Araj/Kevin/Araj turns required');
  const ids=new Set;
  for(const t of plan.turns){
    if(ids.has(t.id)||!/^[-a-z0-9]+$/.test(t.id)||!t.text||t.text.length>5000||t.text.split(/\s+/).length>38)throw new Error('Invalid bounded audition turn');
    ids.add(t.id);
    const p=proposedPresenters[t.role];
    if(t.avatarId!==p.lookId||t.voiceId!==p.auditionVoiceId||t.name!==p.name||t.aspectRatio!==p.preferredAspectRatio||t.fit!==(p.preferredAspectRatio==='9:16'?'contain':'cover'))throw new Error('Presenter/voice changed without a new review');
    if(/live market prices|today's actual quotes|real.time quotes/i.test(t.text))throw new Error('Do not claim synthetic commentary is live');
  }
  if(plan.maxEstimatedClipSeconds<10||plan.maxEstimatedClipSeconds>20||plan.targetSeconds!==45)throw new Error('Bounded audition size changed');
  const rate=rateFor(plan.engine);
  const perClip=usd(plan.maxEstimatedClipSeconds*rate/60);
  return {planHash:hash(plan),paidRelease:'BLOCKED',safeDryRun:true,engine:plan.engine,
    turns:plan.turns.map(t=>({id:t.id,presenter:t.name,lookId:t.avatarId,voiceId:t.voiceId,
      words:t.text.split(/\s+/).length,script:t.text,estimatedReservationUSD:perClip})),
    rateUSDPerVideoMinute:rate,maximumReservedEstimateUSD:usd(perClip*plan.turns.length),
    caveat:'Estimates are not actual charges; no retakes, listener footage, matting or provider-side wallet limit are included. User selected the cast, not spending.',
    unresolved:['Prior Araj default voice failed TTS; selected replacement requires real lip-sync audit and separate payment approval','American English/accent and natural-looking on-screen performance not independently verified','Female portrait look requires 9:16 contain framing and custom newsroom panel','R2 standing alpha and non-speaking listener footage']};
}
export async function initNative({fixture=false}={}){
  const audit=auditNativePlan(),plan=nativeAuditionPlan;
  const name=plan.id+'-'+audit.planHash.slice(0,12)+(fixture?'-fixture':''),root=path.join(runBase(),name);
  if(await exists(path.join(root,'manifest.json')))return loadNative(name);
  await mkdir(path.join(root,'assets'),{recursive:true,mode:0o700});
  const manifest={kind:plan.kind,name,planHash:audit.planHash,fixture,state:'prepared',createdAt:new Date().toISOString(),assets:{},providerStatus:{}};
  await atomicJSON(path.join(root,'plan.json'),plan);await atomicJSON(path.join(root,'manifest.json'),manifest);
  return {name,root,plan,manifest};
}
export async function loadNative(name){
  id(name);const root=path.join(runBase(),name);
  const plan=await readJSON(path.join(root,'plan.json')),manifest=await readJSON(path.join(root,'manifest.json'));
  if(manifest.kind!=='short-presenter-audition'||manifest.name!==name||manifest.planHash!==hash(plan)||Boolean(manifest.fixture)!==name.endsWith('-fixture'))throw new Error('Audition plan/manifest tampered; generate a new plan');
  auditNativePlan(plan);
  return {name,root,plan,manifest};
}
function paidGate(run,env){
  if(env.PILOT_PAID_RELEASE_EPISODE_HASH!==run.manifest.planHash)throw new Error('Paid audition locked: approve the exact plan hash first');
  const approved=Number(env.PILOT_PAID_RELEASE_MAX_USD),reserved=Number(env.PILOT_MAX_ESTIMATED_USD);
  const min=auditNativePlan(run.plan).maximumReservedEstimateUSD;
  if(!Number.isFinite(approved)||approved<=0||!Number.isFinite(reserved)||reserved<min||reserved>approved)
    throw new Error('Paid audition locked: explicit release and sufficient bounded internal estimate required');
  const key=required(env,'HEYGEN_API_KEY'),proof=run.manifest.lookCheck;
  if(!proof||proof.planHash!==run.manifest.planHash||proof.keyHash!==hash(key)||
     !Number.isFinite(Date.parse(proof.checkedAt))||Date.now()-Date.parse(proof.checkedAt)>24*60*60*1000||
     !Array.isArray(proof.checks)||proof.checks.length!==2||!proof.checks.every(x=>x.voiceProvenance==='starfish-catalog'))
    throw new Error('Paid audition locked: a successful same-key read-only look/voice/engine account check within 24 hours is required');
  return {cap:reserved,perClip:usd(run.plan.maxEstimatedClipSeconds*rateFor(run.plan.engine)/60)};
}
// Non-billable read of the exact looks with the private API credential.
// A successful catalog read does not imply that the API wallet has spendable funds.
export async function lookCheckNative(run,{env=process.env,provider=new Providers(env)}={}){
  if(run.manifest.fixture)throw new Error('Fixture cannot establish account readiness');
  const token=required(env,'HEYGEN_API_KEY'),checks=[];
  for(const role of ['ANCHOR','ANALYST']){
    const p=proposedPresenters[role],look=await provider.avatarLook(p.lookId);
    if(look.id!==p.lookId||look.avatar_type!=='digital_twin'||look.status!=='completed'||
       look.group_id!==p.groupId||look.default_voice_id!==p.defaultVoiceId||
       !look.supported_api_engines?.includes(run.plan.engine))
      throw new Error('Selected '+p.name+' look, default voice or engine is not confirmed for this direct API account');
    const voices=await provider.listVoices({gender:role==='ANCHOR'?'female':'male'});
    const v=voices.find(x=>x.voice_id===p.auditionVoiceId&&x.language==='English'&&x.gender===(role==='ANCHOR'?'female':'male'));
    if(!v)throw new Error('Chosen '+p.name+' voice is not independently listed as available on the direct Starfish API; paid generation blocked');
    checks.push({presenter:p.name,lookId:look.id,avatarDefaultVoiceId:look.default_voice_id,
      voiceId:v.voice_id,voiceName:String(v.name||p.auditionVoiceName).slice(0,100),voiceProvenance:'starfish-catalog',
      engine:run.plan.engine,status:look.status});
  }
  const checkedAt=new Date().toISOString();
  return withLock(run.root,async()=>{
    Object.assign(run,await loadNative(run.name));
    run.manifest.lookCheck={planHash:run.manifest.planHash,keyHash:hash(token),checkedAt,checks};
    await atomicJSON(path.join(run.root,'manifest.json'),run.manifest);
    return {checks,checkedAt,planHash:run.manifest.planHash,billedRenderRequests:0,
      apiWalletUnverified:true,voiceAccentUnverified:true,chosenVoiceVerifiedInStarfishCatalog:true,originalDefaultVoiceMayBeUnavailable:true};
  });
}
export async function nativeStatus(run){
  const db=new Store(run.root);
  try{return {name:run.name,planHash:run.manifest.planHash,assets:Object.keys(run.manifest.assets),lookCheck:run.manifest.lookCheck?{checkedAt:run.manifest.lookCheck.checkedAt,checks:run.manifest.lookCheck.checks}:null,jobs:db.summary(),providerStatus:run.manifest.providerStatus};}
  finally{db.close();}
}
export async function produceNativeTurn(run,turnId,{paid=false,env=process.env,provider=new Providers(env)}={}){
  if(!paid)throw new Error('No paid request: explicit --paid required');
  if(run.manifest.fixture)throw new Error('Fixture audition cannot call a paid provider');
  const turn=run.plan.turns.find(t=>t.id===turnId);
  if(!turn)throw new Error('Specify exactly one approved --turn');
  const budget=paidGate(run,env);
  return withLock(run.root,async()=>{
    const fresh=await loadNative(run.name);Object.assign(run,fresh);
    if(run.manifest.assets[turnId])return {state:'ready',turnId,videoId:run.manifest.assets[turnId].providerVideoId,reused:true};
    const db=new Store(run.root);
    try{
      const key=jobKey('native-heygen-audition',{planHash:run.manifest.planHash,turnId,avatarId:turn.avatarId,voiceId:turn.voiceId,engine:run.plan.engine,text:turn.text});
      const submitted=await chargedJob(db,key,{amount:budget.perClip,cap:budget.cap,category:'avatar',units:{estimatedMaxSeconds:run.plan.maxEstimatedClipSeconds}},
        ()=>provider.avatarScript(turn.text,turn.avatarId,turn.voiceId,key,{engine:run.plan.engine,aspectRatio:turn.aspectRatio,fit:turn.fit}));
      const videoId=submitted.videoId;
      const status=await provider.status(videoId);
      run.manifest.providerStatus[turnId]={videoId,status:status.status,checkedAt:new Date().toISOString()};
      await atomicJSON(path.join(run.root,'manifest.json'),run.manifest);
      if(['failed','error','canceled','cancelled'].includes(status.status))throw new Error('Provider video failed; do not retry automatically. Examine recorded job '+key);
      if(status.status!=='completed')return {state:'pending',turnId,videoId,estimatedReservedUSD:budget.perClip};
      if(!status.video_url)throw new Error('Completed provider video missing URL');
      const file=path.join(run.root,'assets',turnId+'.mp4');
      await provider.download(status.video_url,file);
      const record=await mediaRecord(file);
      if(!record.video||Math.min(record.video.width,record.video.height)<720||Math.max(record.video.width,record.video.height)<1280||!record.audio||record.duration<6||record.duration>run.plan.maxEstimatedClipSeconds)
        throw new Error('Audition output outside 6–20s video/audio window; inspect provider job before any retake');
      if(Math.abs(record.audio.start-record.video.start)>.12||Math.abs(record.audio.duration-record.video.duration)>.15)
        throw new Error('Audition A/V timing mismatch');
      await verifyAudible(file);
      const anomalies=await inspectMedia(file,{freeze:true,silence:true});
      if(!anomalies.pass)throw new Error('Audition source has black/frozen/silent sections');
      run.manifest.assets[turnId]={...record,providerVideoId:videoId,providerDurationSeconds:status.duration??null,
        provider:'heygen',synthetic:false,engine:run.plan.engine,lookId:turn.avatarId,voiceId:turn.voiceId,
        scriptHash:hash(turn.text),anomalies,actualBilledUSD:null};
      run.manifest.state=Object.keys(run.manifest.assets).length===run.plan.turns.length?'clips-ready':'clips-partial';
      await atomicJSON(path.join(run.root,'manifest.json'),run.manifest);
      return {state:'ready',turnId,videoId,actualSeconds:record.duration,estimatedReservedUSD:budget.perClip,
        note:'Human lip-sync and voice review required; estimated reserve is not actual billed cost'};
    }finally{db.close();}
  });
}
export async function reconcileNative(run,turnId,videoId){
  const turn=run.plan.turns.find(t=>t.id===turnId);id(videoId);
  if(!turn)throw new Error('Unknown audited turn');
  return withLock(run.root,async()=>{
    const key=jobKey('native-heygen-audition',{planHash:run.manifest.planHash,turnId,avatarId:turn.avatarId,voiceId:turn.voiceId,engine:run.plan.engine,text:turn.text});
    const db=new Store(run.root);
    try{const state=db.get(key)?.state;if(!['submitting','uncertain'].includes(state))throw new Error('Only uncertain submissions can be reconciled');db.set(key,'complete',{videoId,recovered:true});}
    finally{db.close();}
    return {reconciled:true,turnId,videoId,noNewPaidPost:true};
  });
}
// Assemble only real, technically verified presenter clips. Not a certification
// of the standing analyst, moving listener, precise word timing or final R2.
// Deliberately labelled synthetic clip intake, for FFmpeg verification only.
export async function importNativeFixture(run,turnId,sourceFile){
  if(!run.manifest.fixture)throw new Error('Synthetic source is only allowed in a fixture run');
  const turn=run.plan.turns.find(t=>t.id===turnId);
  if(!turn)throw new Error('Unknown fixture turn');
  return withLock(run.root,async()=>{
    Object.assign(run,await loadNative(run.name));
    const dest=path.join(run.root,'assets',turnId+'.mp4');
    await copyFile(sourceFile,dest);
    const record=await mediaRecord(dest);
    if(!record.video||!record.audio||Math.min(record.video.width,record.video.height)<720||Math.max(record.video.width,record.video.height)<1280)throw new Error('Synthetic source format inadequate');
    run.manifest.assets[turnId]={...record,provider:'fixture',synthetic:true,scriptHash:hash(turn.text),
      providerVideoId:null,actualBilledUSD:0};
    await atomicJSON(path.join(run.root,'manifest.json'),run.manifest);
    return {turnId,fixture:true};
  });
}
export async function assembleNative(run){
  return withLock(run.root,async()=>{
    Object.assign(run,await loadNative(run.name));
    if(run.plan.turns.some(t=>!run.manifest.assets[t.id]))throw new Error('Three genuine clips are required; no fixture can be called a real audition');
    const {assets,plan}= {assets:run.manifest.assets,plan:run.plan};
    for(const t of plan.turns){
      const a=assets[t.id],input=path.join(run.root,'assets',a.file);
      if(hash(await readFile(input))!==a.sha256||a.provider!==(run.manifest.fixture?'fixture':'heygen')||Boolean(a.synthetic)!==Boolean(run.manifest.fixture)||a.scriptHash!==hash(t.text))throw new Error('Source clip identity/fixture mismatch');
    }
    const inputs=plan.turns.flatMap(t=>['-i',path.join(run.root,'assets',assets[t.id].file)]);
    const filters=[];
    for(let i=0;i<plan.turns.length;i++){
      filters.push('['+i+':v]fps=30,scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0x102944,setsar=1,setpts=PTS-STARTPTS[v'+i+']');
      filters.push('['+i+':a]aresample=48000:async=1,aformat=sample_fmts=fltp:channel_layouts=stereo,asetpts=PTS-STARTPTS[a'+i+']');
    }
    filters.push(plan.turns.map((_,i)=>'[v'+i+'][a'+i+']').join('')+'concat=n=3:v=1:a=1[vout][aout]');
    const out=path.join(run.root,'output');await mkdir(out,{recursive:true,mode:0o700});
    const tmp=path.join(out,'master-pending.mp4'),master=path.join(out,'audition-master.mp4');
    await command('ffmpeg',['-v','error','-y',...inputs,'-filter_complex',filters.join(';'),'-map','[vout]','-map','[aout]',
      '-c:v','libx264','-preset','veryfast','-crf','20','-pix_fmt','yuv420p','-r','30',
      '-c:a','aac','-b:a','160k','-ar','48000','-movflags','+faststart',tmp]);
    const record=await mediaRecord(tmp);
    if(!record.video||record.video.width!==1920||record.video.height!==1080||record.video.fps!=='30/1'||record.duration>60)
      throw new Error('Composite output technical gate failed');
    await rename(tmp,master);
    let start=0,caption='WEBVTT\n\n';
    for(const t of plan.turns){
      const seconds=assets[t.id].duration;
      caption+=vttTime(start)+' --> '+vttTime(start+seconds)+'\n'+t.name+': '+t.text+'\n\n';
      start+=seconds;
    }
    await writeFile(path.join(out,'captions.vtt'),caption,{mode:0o600});
    const qa={programme:'short native-voice presenter cut audition',masterHash:record.sha256,durationSeconds:record.duration,
      withinRequested30To45Seconds:record.duration>=30&&record.duration<=45,
      realPresenterSources:!run.manifest.fixture,synthetic:Boolean(run.manifest.fixture),standingAnalystCertified:false,listenerReactionCertified:false,
      actualProviderCostUSD:null,humanLipSyncApproval:false,sourceClips:plan.turns.map(t=>({turn:t.id,sha256:assets[t.id].sha256,videoId:assets[t.id].providerVideoId}))};
    await atomicJSON(path.join(out,'qa.json'),qa);
    return qa;
  });
}
