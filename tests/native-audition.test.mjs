import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {Providers} from '../pilot/providers.mjs';
import {proposedPresenters} from '../pilot/v2/budget-preflight.mjs';
import {nativeAuditionPlan,auditNativePlan,initNative,loadNative,nativeStatus,lookCheckNative,produceNativeTurn}
  from '../pilot/v2/native-audition.mjs';

const env={HEYGEN_API_KEY:'offline-nonpayable-test-key',PILOT_MAX_ESTIMATED_USD:'1.02',PILOT_PAID_RELEASE_MAX_USD:'1.02'};
const look=id=>{
  const p=Object.values(proposedPresenters).find(x=>x.lookId===id);
  if(!p)throw new Error('Unrecognized mock look');
  return {id,group_id:p.groupId,avatar_type:p.avatarType,status:'completed',
    default_voice_id:p.defaultVoiceId,image_width:1920,image_height:1080,
    supported_api_engines:['avatar_iii','avatar_iv','avatar_v']};
};
const voiceCatalog=({gender})=>Object.values(proposedPresenters)
  .filter(p=>(p.id==='liza'?'female':'male')===gender)
  .map(p=>({voice_id:p.auditionVoiceId,name:p.auditionVoiceName,language:'English',gender}));

test('Liza and Lasse selected 16:9 formal photo looks and prior identities are excluded',()=>{
  const audit=auditNativePlan();
  assert.equal(audit.safeDryRun,true);
  assert.equal(audit.paidRelease,'BLOCKED');
  assert.equal(audit.engine,'avatar_iii');
  assert.deepEqual(audit.turns.map(t=>t.presenter),['Liza','Lasse','Liza']);
  assert.deepEqual(nativeAuditionPlan.turns.map(t=>t.id),['liza-open','lasse-analysis','liza-close']);
  assert.deepEqual(nativeAuditionPlan.turns.map(t=>t.aspectRatio),['16:9','16:9','16:9']);
  assert.deepEqual(nativeAuditionPlan.turns.map(t=>t.fit),['cover','cover','cover']);
  assert.equal(audit.maximumReservedEstimateUSD,1.02);
  assert.equal(proposedPresenters.ANCHOR.lookId,'5ee67ac453c34ffebd71e8eedb47b2fe');
  assert.equal(proposedPresenters.ANCHOR.auditionVoiceId,'330290724a1b470fb63153f34d4c0183');
  assert.equal(proposedPresenters.ANALYST.lookId,'de9f36c26bd841c891489a0c9d6174de');
  assert.equal(proposedPresenters.ANALYST.auditionVoiceId,'00e3d285aba44b27a83c47c02c9c2d9c');
  assert.equal(proposedPresenters.ANCHOR.avatarType,'photo_avatar');
  assert.equal(proposedPresenters.ANALYST.avatarType,'photo_avatar');
  assert.equal(proposedPresenters.ANCHOR.wardrobeApprovalStatus,'approved');
  assert.equal(proposedPresenters.ANALYST.wardrobeApprovalStatus,'approved');
  assert.equal(proposedPresenters.ANCHOR.performanceApprovalStatus,'pending');
  const injected=structuredClone(nativeAuditionPlan);
  injected.turns[0].avatarId='425825d6465b4ba4bd261d334d530430';
  assert.throws(()=>auditNativePlan(injected),/Presenter\/voice changed/);
  const wrongVoice=structuredClone(nativeAuditionPlan);
  wrongVoice.turns[1].voiceId='unapproved';
  assert.throws(()=>auditNativePlan(wrongVoice),/Presenter\/voice changed/);
});

test('native single-speaker HeyGen request is correct Photo Avatar III, correct voice and never auto-submits',async()=>{
  let count=0,last=null;
  const provider=new Providers({HEYGEN_API_KEY:env.HEYGEN_API_KEY},async(url,opt)=>{
    count++;last={url,opt};
    return {ok:true,json:async()=>({data:{video_id:'nonpaying-provider-job'}})};
  });
  for(const t of nativeAuditionPlan.turns.slice(0,2)){
    const result=await provider.avatarScript(t.text,t.avatarId,t.voiceId,'test-job',
      {engine:'avatar_iii',aspectRatio:t.aspectRatio,fit:t.fit});
    assert.equal(result.videoId,'nonpaying-provider-job');
    assert.equal(last.url,'https://api.heygen.com/v3/videos');
    const data=JSON.parse(last.opt.body);
    assert.equal(data.avatar_id,t.avatarId);
    assert.equal(data.voice_id,t.voiceId);
    assert.equal(data.script,t.text);
    assert.equal(data.aspect_ratio,'16:9');
    assert.equal(data.fit,'cover');
    assert.equal(data.resolution,'1080p');
    assert.deepEqual(data.engine,{type:'avatar_iii'});
  }
  assert.equal(count,2);
  await assert.rejects(provider.avatarScript('x','id','voice','tag',{engine:'avatar_v'}),/restricted to published pay-as-you-go/);
  assert.equal(count,2);
});

test('read-only look+Starfish catalog check authorizes only exact frozen formal-look identities',async()=>{
  const dir=await mkdtemp(path.join(os.tmpdir(),'signal-liza-free-'));
  const prev=process.env.PILOT_DATA_DIR;process.env.PILOT_DATA_DIR=dir;
  try{
    const run=await initNative();
    let lookReads=0;
    const provider={async avatarLook(id){lookReads++;return look(id);},async listVoices(a){return voiceCatalog(a);}};
    const data=await lookCheckNative(run,{env,provider});
    assert.equal(lookReads,2);
    assert.equal(data.billedRenderRequests,0);
    assert.equal(data.chosenVoiceVerifiedInStarfishCatalog,true);
    assert.equal(data.checks[0].voiceId,proposedPresenters.ANCHOR.auditionVoiceId);
    const saved=await loadNative(run.name);
    assert.equal(saved.manifest.lookCheck.planHash,run.manifest.planHash);
    const missing={async avatarLook(id){return look(id);},async listVoices(){return []}};
    await assert.rejects(lookCheckNative(run,{env,provider:missing}),/not independently listed/);
  }finally{
    if(prev===undefined)delete process.env.PILOT_DATA_DIR;else process.env.PILOT_DATA_DIR=prev;
    await rm(dir,{recursive:true,force:true});
  }
});

test('paid audition fails closed until direct same-key preflight, exact hash and cap; one mock POST per immutable turn',async()=>{
  const dir=await mkdtemp(path.join(os.tmpdir(),'signal-liza-guard-'));
  const prev=process.env.PILOT_DATA_DIR;process.env.PILOT_DATA_DIR=dir;
  try{
    const run=await initNative();
    let paidSubmissions=0,polls=0;
    const provider={
      async avatarLook(id){return look(id);},
      async listVoices(a){return voiceCatalog(a);},
      async avatarScript(text,avatarId,voiceId,job,opts){
        paidSubmissions++;
        assert.equal(text,nativeAuditionPlan.turns[0].text);
        assert.equal(avatarId,proposedPresenters.ANCHOR.lookId);
        assert.equal(voiceId,proposedPresenters.ANCHOR.auditionVoiceId);
        assert.equal(opts.engine,'avatar_iii');
        assert.equal(opts.aspectRatio,'16:9');
        return {videoId:'offline-mock-job'};
      },
      async status(){polls++;return {status:'processing'};},
      async download(){throw new Error('Never download a pending clip');}
    };
    const released={...env,PILOT_PAID_RELEASE_EPISODE_HASH:run.manifest.planHash};
    await assert.rejects(produceNativeTurn(run,'liza-open',{env:released,provider}),/explicit --paid/);
    await assert.rejects(produceNativeTurn(run,'liza-open',{paid:true,env:released,provider}),/same-key read-only/);
    const verified=await lookCheckNative(run,{env:released,provider});
    assert.equal(verified.billedRenderRequests,0);
    await assert.rejects(produceNativeTurn(run,'liza-open',{paid:true,env:{...released,PILOT_PAID_RELEASE_EPISODE_HASH:'bad'},provider}),/locked/);
    await assert.rejects(produceNativeTurn(run,'liza-open',{paid:true,env:{...released,HEYGEN_API_KEY:'wrong-different-key'},provider}),/same-key read-only/);
    await assert.rejects(produceNativeTurn(run,'liza-open',{paid:true,env:{...released,PILOT_PAID_RELEASE_MAX_USD:'0.11'},provider}),/locked/);
    assert.equal(paidSubmissions,0);
    const one=await produceNativeTurn(run,'liza-open',{paid:true,env:released,provider});
    const two=await produceNativeTurn(run,'liza-open',{paid:true,env:released,provider});
    assert.equal(one.state,'pending');
    assert.equal(two.state,'pending');
    assert.equal(paidSubmissions,1);
    assert.equal(polls,2);
    const status=await nativeStatus(run);
    assert.equal(status.jobs.reservedEstimateUSD,.34);
  }finally{
    if(prev===undefined)delete process.env.PILOT_DATA_DIR;else process.env.PILOT_DATA_DIR=prev;
    await rm(dir,{recursive:true,force:true});
  }
});
