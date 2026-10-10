import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {Providers} from '../pilot/providers.mjs';
import {nativeAuditionPlan,auditNativePlan,initNative,loadNative,nativeStatus,
  lookCheckNative,produceNativeTurn} from '../pilot/v2/native-audition.mjs';

test('Liza/Lasse/Liza script and maximum estimated exposure are pinned, no account needed',()=>{
  const result=auditNativePlan();
  assert.equal(result.safeDryRun,true);
  assert.equal(result.paidRelease,'BLOCKED');
  assert.equal(result.engine,'avatar_iv');
  assert.deepEqual(result.turns.map(t=>t.presenter),['Liza','Lasse','Liza']);
  assert.equal(result.maximumReservedEstimateUSD,3);
  assert.equal(result.turns.length,3);
  assert.equal(result.turns.every(t=>t.words<=38),true);
  const changed=structuredClone(nativeAuditionPlan);
  changed.turns[1].voiceId='unapproved';
  assert.throws(()=>auditNativePlan(changed),/Presenter\/voice changed/);
});

test('HeyGen direct native-script payload has the exact selected voice, explicit IV engine, no uploaded audio',async()=>{
  let request=null;
  const provider=new Providers({HEYGEN_API_KEY:'local-test-key'},async(url,opts)=>{
    request={url,opts};return {ok:true,json:async()=>({data:{video_id:'provider-job'}})};
  });
  const t=nativeAuditionPlan.turns[0];
  const output=await provider.avatarScript(t.text,t.avatarId,t.voiceId,'job-001',{engine:'avatar_iv'});
  assert.equal(output.videoId,'provider-job');
  assert.equal(request.url,'https://api.heygen.com/v3/videos');
  const body=JSON.parse(request.opts.body);
  assert.equal(body.script,t.text);
  assert.equal(body.avatar_id,t.avatarId);
  assert.equal(body.voice_id,t.voiceId);
  assert.deepEqual(body.engine,{type:'avatar_iv'});
  assert.equal(body.resolution,'1080p');
  assert.equal(body.output_format,'mp4');
  assert.equal(body.aspect_ratio,'16:9');
  assert.equal(body.audio_url,undefined);
  assert.equal(body.audio_asset_id,undefined);
  assert.equal(body.motion_prompt,undefined);
  assert.equal(body.remove_background,undefined);
  assert.throws(()=>provider.avatarScript('text','bad','bad','job-001',{engine:'avatar_v'}),/approved public avatar/);
});

test('separate free look+voice queries require both IDs to exist in API account',async()=>{
  const dir=await mkdtemp(path.join(os.tmpdir(),'signal-native-read-')),old=process.env.PILOT_DATA_DIR;
  process.env.PILOT_DATA_DIR=dir;
  try{
    const run=await initNative();let looks=0,voices=0;
    const provider={
      async avatarLook(id){looks++;const t=nativeAuditionPlan.turns.find(x=>x.avatarId===id);return {id,status:'completed',default_voice_id:t.voiceId,supported_api_engines:['avatar_iv']};},
      async voiceInfo(id){voices++;return {voice_id:id,language:'en',name:'Default voice'};}
    };
    const a=await lookCheckNative(run,{provider});
    assert.equal(looks,2);assert.equal(voices,2);
    assert.equal(a.billedRenderRequests,0);assert.equal(a.apiWalletUnverified,true);
    const failed={...provider,async voiceInfo(){return {voice_id:'different',language:'en'}}};
    await assert.rejects(lookCheckNative(run,{provider:failed}),/voice is unavailable/);
  }finally{
    if(old===undefined)delete process.env.PILOT_DATA_DIR;else process.env.PILOT_DATA_DIR=old;
    await rm(dir,{recursive:true,force:true});
  }
});

test('paid native audition defaults to locked, runs one turn only, resumes without duplicate POST',async()=>{
  const dir=await mkdtemp(path.join(os.tmpdir(),'signal-native-paid-mock-')),old=process.env.PILOT_DATA_DIR;
  process.env.PILOT_DATA_DIR=dir;
  try{
    const run=await initNative(),same=await loadNative(run.name);
    assert.equal(run.manifest.planHash,same.manifest.planHash);
    let submissions=0,statusReads=0;
    const provider={
      async avatarScript(text,id,voice,job,options){
        submissions++;
        assert.equal(options.engine,'avatar_iv');
        assert.equal(text,nativeAuditionPlan.turns[0].text);
        return {videoId:'video-mock-one'};
      },
      async status(){statusReads++;return {status:'processing'};},
      async download(){throw new Error('Should not download processing result');}
    };
    const env={HEYGEN_API_KEY:'offline-test-key',PILOT_PAID_RELEASE_EPISODE_HASH:run.manifest.planHash,
      PILOT_MAX_ESTIMATED_USD:'3',PILOT_PAID_RELEASE_MAX_USD:'3'};
    await assert.rejects(produceNativeTurn(run,'liza-open',{env,provider}),/explicit --paid/);
    await assert.rejects(produceNativeTurn(run,'liza-open',{paid:true,env:{...env,PILOT_PAID_RELEASE_EPISODE_HASH:'wrong'},provider}),/locked/);
    await assert.rejects(produceNativeTurn(run,'liza-open',{paid:true,env:{...env,PILOT_PAID_RELEASE_MAX_USD:'1'},provider}),/locked/);
    await assert.rejects(produceNativeTurn(run,'invalid',{paid:true,env,provider}),/one approved --turn/);
    assert.equal(submissions,0);
    const one=await produceNativeTurn(run,'liza-open',{paid:true,env,provider});
    const two=await produceNativeTurn(run,'liza-open',{paid:true,env,provider});
    assert.equal(one.state,'pending');assert.equal(two.state,'pending');
    assert.equal(submissions,1);assert.equal(statusReads,2);
    const status=await nativeStatus(run);
    assert.equal(status.jobs.reservedEstimateUSD,1);
    assert.equal(status.jobs.jobs.filter(j=>j.state==='complete').length,1);
  }finally{
    if(old===undefined)delete process.env.PILOT_DATA_DIR;else process.env.PILOT_DATA_DIR=old;
    await rm(dir,{recursive:true,force:true});
  }
});
