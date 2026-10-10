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
  .filter(p=>(p.id==='araj'?'female':'male')===gender)
  .map(p=>({voice_id:p.auditionVoiceId,name:p.auditionVoiceName,language:'English',gender}));

test('Araj/Kevin/Araj identities, voices, portrait framing and conservative budget are immutable',()=>{
  const a=auditNativePlan();
  assert.equal(a.safeDryRun,true);
  assert.equal(a.paidRelease,'BLOCKED');
  assert.equal(a.engine,'avatar_iii');
  assert.deepEqual(a.turns.map(t=>t.presenter),['Araj','Kevin','Araj']);
  assert.deepEqual(nativeAuditionPlan.turns.map(t=>t.aspectRatio),['9:16','16:9','9:16']);
  assert.deepEqual(nativeAuditionPlan.turns.map(t=>t.fit),['contain','cover','contain']);
  assert.equal(a.maximumReservedEstimateUSD,1.02);
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
      name:'Yuki - Conversational & Easygoing',language:'English',gender:'female'}]})};
  });
  const voices=await p.listVoices({gender:'female'});
  assert.equal(calls,1);
  assert.ok(urlSeen.startsWith('https://api.heygen.com/v3/voices?'));
  assert.ok(urlSeen.includes('engine=starfish'));
  assert.ok(urlSeen.includes('gender=female'));
  assert.equal(methodSeen,undefined); // fetch default method is GET; no paid POST
  assert.equal(voices[0].voice_id,proposedPresenters.ANCHOR.auditionVoiceId);
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

test('paid audition fails closed without same-key preflight and can only submit one charged job per turn',async()=>{
  const dir=await mkdtemp(path.join(os.tmpdir(),'signal-native-mock-'));
  const old=process.env.PILOT_DATA_DIR;process.env.PILOT_DATA_DIR=dir;
  try{
    const run=await initNative();
    let submissions=0,polls=0;
    const provider={
      async avatarScript(text,id,voice,key,options){
        submissions++;
        assert.equal(options.engine,'avatar_iii');
        assert.equal(options.aspectRatio,'9:16');
        assert.equal(options.fit,'contain');
        assert.equal(text,nativeAuditionPlan.turns[0].text);
        assert.equal(id,proposedPresenters.ANCHOR.lookId);
        assert.equal(voice,proposedPresenters.ANCHOR.auditionVoiceId);
        return {videoId:'mock-provider-job'};
      },
      async status(){polls++;return {status:'processing'};},
      async download(){throw new Error('No media download while processing');}
    };
    const env={...testEnv,PILOT_PAID_RELEASE_EPISODE_HASH:run.manifest.planHash};
    await assert.rejects(produceNativeTurn(run,'araj-open',{env,provider}),/explicit --paid/);
    await assert.rejects(produceNativeTurn(run,'araj-open',{paid:true,env,provider}),/same-key read-only/);
    await lookCheckNative(run,{env,provider:{avatarLook:async id=>look(id),listVoices:async args=>voiceCatalog(args)}});
    await assert.rejects(produceNativeTurn(run,'araj-open',{paid:true,env:{...env,HEYGEN_API_KEY:'other-valid-key'},provider}),/same-key read-only/);
    await assert.rejects(produceNativeTurn(run,'araj-open',{paid:true,env:{...env,PILOT_PAID_RELEASE_EPISODE_HASH:'wrong'},provider}),/locked/);
    await assert.rejects(produceNativeTurn(run,'araj-open',{paid:true,env:{...env,PILOT_PAID_RELEASE_MAX_USD:'0.50'},provider}),/locked/);
    await assert.rejects(produceNativeTurn(run,'not-a-real-turn',{paid:true,env,provider}),/one approved --turn/);
    assert.equal(submissions,0);
    const one=await produceNativeTurn(run,'araj-open',{paid:true,env,provider});
    const two=await produceNativeTurn(run,'araj-open',{paid:true,env,provider});
    assert.equal(one.state,'pending');assert.equal(two.state,'pending');
    assert.equal(submissions,1);assert.equal(polls,2);
    const status=await nativeStatus(run);
    assert.equal(status.jobs.reservedEstimateUSD,.34);
    assert.equal(status.jobs.jobs.filter(j=>j.state==='complete').length,1);
  }finally{
    if(old===undefined)delete process.env.PILOT_DATA_DIR;else process.env.PILOT_DATA_DIR=old;
    await rm(dir,{recursive:true,force:true});
  }
});
