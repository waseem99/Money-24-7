import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {Providers} from '../pilot/providers.mjs';
import {proposedPresenters} from '../pilot/v2/budget-preflight.mjs';
import {nativeAuditionPlan,auditNativePlan,initNative,loadNative,nativeStatus,
  lookCheckNative,produceNativeTurn} from '../pilot/v2/native-audition.mjs';

const testEnv={HEYGEN_API_KEY:'offline-test-key',PILOT_MAX_ESTIMATED_USD:'1.02',PILOT_PAID_RELEASE_MAX_USD:'1.02'};
const look=(id)=>{
  const p=Object.values(proposedPresenters).find(x=>x.lookId===id);
  if(!p)throw new Error('Unknown test look');
  return {id,group_id:p.groupId,avatar_type:'digital_twin',status:'completed',
    default_voice_id:p.defaultVoiceId,supported_api_engines:['avatar_iii','avatar_iv']};
};

const voiceCatalog=({gender})=>Object.values(proposedPresenters)
  .filter(p=>(p.id==='rumi'?'female':'male')===gender)
  .map(p=>({voice_id:p.auditionVoiceId,name:p.auditionVoiceName,language:'English',gender}));

test('Rumi/Kevin/Rumi locked visual and voice identities, portrait framing and conservative budget',()=>{
  const a=auditNativePlan();
  assert.equal(a.safeDryRun,true);
  assert.equal(a.paidRelease,'BLOCKED');
  assert.equal(proposedPresenters.ANCHOR.visualApprovalStatus,'approved');
  assert.equal(proposedPresenters.ANALYST.visualApprovalStatus,'approved');
  assert.equal(proposedPresenters.ANCHOR.wardrobeApprovalStatus,'blocked-public-casual');
  assert.equal(proposedPresenters.ANALYST.wardrobeApprovalStatus,'blocked-public-casual');
  assert.equal(a.engine,'avatar_iii');
  assert.deepEqual(a.turns.map(t=>t.presenter),['Rumi','Kevin','Rumi']);
  assert.deepEqual(nativeAuditionPlan.turns.map(t=>t.aspectRatio),['9:16','16:9','9:16']);
  assert.deepEqual(nativeAuditionPlan.turns.map(t=>t.fit),['contain','cover','contain']);
  assert.equal(a.maximumReservedEstimateUSD,1.02);
  assert.equal(proposedPresenters.ANCHOR.auditionVoiceId,'330290724a1b470fb63153f34d4c0183');
  assert.equal(proposedPresenters.ANCHOR.auditionVoiceName,'Annie - Lifelike');
  assert.notEqual(proposedPresenters.ANCHOR.auditionVoiceId,'0989cd9eec9e485da0d7945fe142dfb9');
  assert.equal(proposedPresenters.ANALYST.auditionVoiceId,'00e3d285aba44b27a83c47c02c9c2d9c');
  assert.equal(a.turns.every(t=>t.words<=38),true);
  const change=structuredClone(nativeAuditionPlan);
  change.turns[1].voiceId='unapproved';
  assert.throws(()=>auditNativePlan(change),/Presenter\/voice changed/);
  change.turns[1].voiceId=nativeAuditionPlan.turns[1].voiceId;
  change.turns[0].aspectRatio='16:9';
  assert.throws(()=>auditNativePlan(change),/Presenter\/voice changed/);
});

test('HeyGen native-script request protects portrait anchor proportions and uses only selected voice',async()=>{
  let request=null,submitted=0;
  const provider=new Providers({HEYGEN_API_KEY:'offline-test-key'},async(url,opts)=>{
    submitted++;request={url,opts};
    return {ok:true,json:async()=>({data:{video_id:'provider-job'}})};
  });
  for(const t of nativeAuditionPlan.turns.slice(0,2)){
    const result=await provider.avatarScript(t.text,t.avatarId,t.voiceId,'job-001',
      {engine:nativeAuditionPlan.engine,aspectRatio:t.aspectRatio,fit:t.fit});
    assert.equal(result.videoId,'provider-job');
    assert.equal(request.url,'https://api.heygen.com/v3/videos');
    const data=JSON.parse(request.opts.body);
    assert.equal(data.type,'avatar');
    assert.equal(data.script,t.text);
    assert.equal(data.avatar_id,t.avatarId);
    assert.equal(data.voice_id,t.voiceId);
    assert.deepEqual(data.engine,{type:'avatar_iii'});
    assert.equal(data.aspect_ratio,t.aspectRatio);
    assert.equal(data.fit,t.fit);
    assert.equal(data.resolution,'1080p');
    assert.equal(data.output_format,'mp4');
    assert.equal(data.audio_url,undefined);
    assert.equal(data.audio_asset_id,undefined);
    assert.equal(data.motion_prompt,undefined);
  }
  await assert.rejects(provider.avatarScript('Script','c8f428c549ea448488fdb2214dbcad57','5141743c956d4a1298b7126c9639d416','x',{engine:'avatar_v'}),/restricted to published pay-as-you-go/);
  await assert.rejects(provider.avatarScript('Script','c8f428c549ea448488fdb2214dbcad57','5141743c956d4a1298b7126c9639d416','x',{engine:'avatar_iii',aspectRatio:'1:1'}),/Unsupported verified audition orientation/);
  assert.equal(submitted,2);
});

test('HeyGen provider voice catalog GET does not create any billable audio/video',async()=>{
  let urlSeen='',methodSeen=null,calls=0;
  const p=new Providers({HEYGEN_API_KEY:'offline-test-key'},async(url,options)=>{
    calls++;urlSeen=url;methodSeen=options.method;
    return {ok:true,json:async()=>({data:[{voice_id:proposedPresenters.ANCHOR.auditionVoiceId,
      name:'Annie - Lifelike',language:'English',gender:'female'}]})};
  });
  const voices=await p.listVoices({gender:'female'});
  assert.equal(calls,1);
  assert.ok(urlSeen.startsWith('https://api.heygen.com/v3/voices?'));
  assert.ok(urlSeen.includes('engine=starfish'));
  assert.ok(urlSeen.includes('gender=female'));
  assert.ok(!urlSeen.includes('POST'));
  assert.equal(methodSeen,'GET'); // explicitly read-only; no paid POST
  assert.equal(voices[0].voice_id,proposedPresenters.ANCHOR.auditionVoiceId);
});

test('Starfish read-only catalog handles paginated exact voice verification',async()=>{
  const calls=[];
  const provider=new Providers({HEYGEN_API_KEY:'offline-test-key'},async(url,options)=>{
    const u=new URL(url);calls.push({url:u,method:options.method});
    const next=u.searchParams.get('token');
    return {ok:true,json:async()=>({data:next?
      {items:[{voice_id:'330290724a1b470fb63153f34d4c0183',name:'Annie - Lifelike',language:'English',gender:'female'}],next_token:null}:
      {items:[{voice_id:'some-other-voice',name:'Another Voice',language:'English',gender:'female'}],next_token:'page2'}})};
  });
  const voices=await provider.listVoices({gender:'female',searchQuery:'Annie',maxPages:3});
  assert.equal(calls.length,2);
  assert.equal(calls.every(x=>x.method==='GET'),true);
  assert.equal(calls[0].url.searchParams.get('search_query'),'Annie');
  assert.equal(calls[1].url.searchParams.get('token'),'page2');
  assert.equal(voices.some(x=>x.voice_id===proposedPresenters.ANCHOR.auditionVoiceId),true);
});

test('read-only look check stores a same-account preflight; mismatched voice blocks it',async()=>{
  const dir=await mkdtemp(path.join(os.tmpdir(),'signal-native-read-'));
  const old=process.env.PILOT_DATA_DIR;process.env.PILOT_DATA_DIR=dir;
  try{
    const run=await initNative();
    let calls=0;
    const provider={async avatarLook(id){calls++;return look(id);},async listVoices(args){return voiceCatalog(args);}};
    const result=await lookCheckNative(run,{env:testEnv,provider});
    assert.equal(calls,2);
    assert.equal(result.billedRenderRequests,0);
    assert.equal(result.apiWalletUnverified,true);
    assert.equal(result.chosenVoiceVerifiedInStarfishCatalog,true);
    assert.equal(result.checks[0].voiceId,proposedPresenters.ANCHOR.auditionVoiceId);
    assert.notEqual(result.checks[0].voiceId,proposedPresenters.ANCHOR.defaultVoiceId);
    assert.equal(result.checks.length,2);
    const again=await loadNative(run.name);
    assert.equal(again.manifest.lookCheck.planHash,run.manifest.planHash);
    assert.equal(again.manifest.lookCheck.checks.length,2);
    const bad={async avatarLook(id){return {...look(id),default_voice_id:'unapproved'};}};
    await assert.rejects(lookCheckNative(run,{env:testEnv,provider:bad}),/not confirmed/);
    const unavailable={async avatarLook(id){return look(id);},async listVoices(){return [];}};
    await assert.rejects(lookCheckNative(run,{env:testEnv,provider:unavailable}),/not independently listed/);
  }finally{
    if(old===undefined)delete process.env.PILOT_DATA_DIR;else process.env.PILOT_DATA_DIR=old;
    await rm(dir,{recursive:true,force:true});
  }
});

test('formal wardrobe is a hard NO-GO for paid Rumi or Kevin even after free account check and authorization hash',async()=>{
  const dir=await mkdtemp(path.join(os.tmpdir(),'signal-rumi-formal-clothing-hold-'));
  const old=process.env.PILOT_DATA_DIR;process.env.PILOT_DATA_DIR=dir;
  try{
    const run=await initNative();
    let paidSubmissions=0;
    const env={...testEnv,PILOT_PAID_RELEASE_EPISODE_HASH:run.manifest.planHash};
    const provider={
      async avatarLook(id){return look(id);},
      async listVoices(args){return voiceCatalog(args);},
      async avatarScript(){paidSubmissions++;throw new Error('Casual presenter must NEVER be rendered again');},
      async status(){throw new Error('No provider status call expected');},
      async download(){throw new Error('No media download expected');}
    };
    await assert.rejects(produceNativeTurn(run,'rumi-open',{env,provider}),/explicit --paid/);
    const check=await lookCheckNative(run,{env,provider});
    assert.equal(check.billedRenderRequests,0);
    assert.equal(check.chosenVoiceVerifiedInStarfishCatalog,true);
    await assert.rejects(produceNativeTurn(run,'rumi-open',{paid:true,env,provider}),/business-formal presenter wardrobe not approved/);
    await assert.rejects(produceNativeTurn(run,'kevin-analysis',{paid:true,env,provider}),/business-formal presenter wardrobe not approved/);
    await assert.rejects(produceNativeTurn(run,'rumi-close',{paid:true,env,provider}),/business-formal presenter wardrobe not approved/);
    assert.equal(paidSubmissions,0);
    const status=await nativeStatus(run);
    assert.equal(status.jobs.reservedEstimateUSD,0);
    assert.equal(status.jobs.jobs.length,0);
  }finally{
    if(old===undefined)delete process.env.PILOT_DATA_DIR;else process.env.PILOT_DATA_DIR=old;
    await rm(dir,{recursive:true,force:true});
  }
});

test('rejected historical Araj look and any silently modified voice are excluded from Rumi paid plan',()=>{
  const oldAvatar=structuredClone(nativeAuditionPlan);
  oldAvatar.turns[0].avatarId='425825d6465b4ba4bd261d334d530430';
  assert.throws(()=>auditNativePlan(oldAvatar),/Presenter\/voice changed/);
  const oldVoice=structuredClone(nativeAuditionPlan);
  oldVoice.turns[0].voiceId='5769809d7ddd445e8173b3d08c509ae1';
  assert.throws(()=>auditNativePlan(oldVoice),/Presenter\/voice changed/);
});
