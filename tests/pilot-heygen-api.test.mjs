import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {HeyGenAPI,preflight,fundingStatus,screenTestHash,submitScreenTest,collectScreenTest} from '../pilot/heygen-api.mjs';

const account={username:'account-test',billing_type:'wallet',wallet:{currency:'usd',remaining_balance:5,auto_reload:{enabled:false}}};
function plan() {
  const p={id:'sara-test-v1',expectedAccountId:'account-test',durationSeconds:16.12,estimatedUSD:.81,capUSD:1,
    request:{type:'image',image:{type:'asset_id',asset_id:'approved-image'},audio_asset_id:'approved-audio',title:'Screen test',resolution:'1080p',aspect_ratio:'16:9',engine:{type:'avatar_iv'},expressiveness:'low',motion_prompt:'Calm presenter, subtle motion.',fit:'cover',remove_background:false,output_format:'mp4'}};
  p.approval={renderAuthorized:true,planHash:screenTestHash(p),reference:'Test authorization fixture'};return p;
}
const temp=async t=>{const root=await mkdtemp(path.join(tmpdir(),'heygen-api-'));t.after(()=>rm(root,{force:true,recursive:true}));return root;};
function client() {return {account:async()=>account,asset:async id=>({id}),create:async()=>({video_id:'video-test'}),status:async()=>({status:'completed',video_url:'https://media.example.org/test.mp4'})};}

test('preflight authenticates with API key and performs GET only without exposing key or identity in errors',async()=>{
  let calls=0;
  const c=new HeyGenAPI({HEYGEN_API_KEY:'secret-test-value'},async(url,options)=>{calls++;assert.equal(url,'https://api.heygen.com/v3/users/me');assert.equal(options.method,'GET');assert.equal(options.headers['X-Api-Key'],'secret-test-value');assert.equal(options.redirect,'error');return Response.json({data:account});});
  const r=await preflight(c);assert.equal(calls,1);assert.equal(r.authenticated,true);assert.equal(r.generationRequested,false);assert.equal(r.resolutionAccess,'not_tested');
  const broken=new HeyGenAPI({HEYGEN_API_KEY:'secret-test-value'},async()=>Response.json({error:{code:'insufficient_credit',message:'secret-test-value'}},{status:402}));
  await assert.rejects(broken.account(),e=>e.message.includes('insufficient_credit')&&!e.message.includes('secret-test-value'));
});
test('unknown funding, insufficient funds and automatic recharge cannot pass the balance guard',()=>{
  assert.equal(fundingStatus({...account,wallet:null},1),'funding_not_verified');
  assert.equal(fundingStatus({...account,wallet:{currency:'usd',remaining_balance:null}},1),'funding_not_verified');
  assert.equal(fundingStatus({...account,wallet:{currency:'usd',remaining_balance:.17}},1),'insufficient_balance');
  assert.equal(fundingStatus({...account,wallet:{...account.wallet,auto_reload:{enabled:true}}},1),'auto_reload_requires_review');
});
test('approval changes and absent paid authorization stop before network calls',async t=>{
  const root=await temp(t),c=client();c.account=()=>{throw Error('unexpected network');};
  await assert.rejects(submitScreenTest(root,plan(),{client:c}),/authorization/);
  const changed=plan();changed.request.audio_asset_id='different-audio';
  await assert.rejects(submitScreenTest(root,changed,{paid:true,client:c}),/authorization/);
  const text=plan();text.request.script='Unapproved speech';assert.throws(()=>screenTestHash(text),/approved audio/);
});
test('wrong account, low balance and unavailable assets prevent generation',async t=>{
  for(const change of [c=>c.account=async()=>({...account,username:'other'}),c=>c.account=async()=>({...account,wallet:{currency:'usd',remaining_balance:.17}}),c=>c.asset=async()=>({id:'wrong'})]) {
    const root=await temp(t),c=client();change(c);let calls=0;c.create=()=>{calls++;};
    await assert.rejects(submitScreenTest(root,plan(),{paid:true,client:c}));assert.equal(calls,0);
  }
});
test('one submission preserves exact audio and resolution; repeat and collection do not render again',async t=>{
  const root=await temp(t),p=plan(),c=client();let creates=0;c.create=async r=>{creates++;assert.deepEqual(r,p.request);return {video_id:'video-test'};};
  const first=await submitScreenTest(root,p,{paid:true,client:c});assert.equal(first.videoId,'video-test');
  assert.equal((await submitScreenTest(root,p,{paid:true,client:c})).reused,true);
  const result=await collectScreenTest(root,c);assert.equal(result.status,'completed');assert.equal(result.humanReview,'pending');assert.equal(creates,1);
  assert.equal(JSON.parse(await readFile(path.join(root,'result.json'))).videoId,'video-test');
  p.request.resolution='720p';p.approval.planHash=screenTestHash(p);
  await assert.rejects(submitScreenTest(root,p,{paid:true,client:c}),/plan changed/);
});
test('uncertain submission cannot be repeated or silently replaced',async t=>{
  const root=await temp(t),c=client();let creates=0;c.create=async()=>{creates++;throw Error('network lost after POST');};
  await assert.rejects(submitScreenTest(root,plan(),{paid:true,client:c}),/uncertain/);
  await assert.rejects(submitScreenTest(root,plan(),{paid:true,client:c}),/Reconcile/);assert.equal(creates,1);
});
test('concurrent calls cannot submit two paid jobs and failed status remains terminal',async t=>{
  const root=await temp(t),c=client();let creates=0;c.create=async()=>{creates++;await new Promise(r=>setTimeout(r,20));return {video_id:'video-test'};};
  const results=await Promise.allSettled([submitScreenTest(root,plan(),{paid:true,client:c}),submitScreenTest(root,plan(),{paid:true,client:c})]);
  assert.equal(results.filter(x=>x.status==='fulfilled').length,1);assert.equal(creates,1);
  c.status=async()=>({status:'failed'});assert.equal((await collectScreenTest(root,c)).status,'failed');
  await submitScreenTest(root,plan(),{paid:true,client:c});assert.equal(creates,1);
});
