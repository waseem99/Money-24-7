import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {inspectArgs,loadLocalKey,readyToMint,createLitePayload,providerCall,executeDirect} from '../network/live-avatar/direct-setup.mjs';

test('No browser automation, API call or provider spending for direct help/doctor',async()=>{
 const opt=inspectArgs(['doctor']);
 let reads=0;
 const result=await executeDirect(opt,{env:{},cwd:'/temp',read:async()=>{reads++;throw Error('Missing');},
  fetchImpl:()=>{throw Error('Network should NOT happen')}});
 assert.equal(result.apiCallsMade,0);
 assert.equal(result.keyConfigured,false);
 assert.equal(result.type,'DIRECT_NO_PAID_BROWSER_TOOL');
 assert.ok(reads>0);
});
test('API key stays in ignored local file, not committed or sent to chat',async()=>{
 const ignore=readFileSync(new URL('../.gitignore',import.meta.url),'utf8');
 assert.ok(ignore.includes('.stocks-liveavatar.local.key'));
 assert.equal(await loadLocalKey({LIVEAVATAR_API_KEY:'local-key'},
   {cwd:'/tmp',read:()=>{throw Error('must not read file')}}),'local-key');
 assert.ok(readyToMint({command:'sandbox-token',avatarId:'nora_custom_avatar_2026',confirmed:false}).length);
});
test('Read-only credits and avatar inventory calls documented API, not paid session',async()=>{
 let requests=[];
 const fetchImpl=async(url,options)=>{
  requests.push({url,method:options.method});
  return {ok:true,status:200,json:async()=>url.endsWith('/avatars')?
   {code:100,data:{count:1,results:[{id:'custom_nora_123456',name:'Nora',status:'READY',is_1080p:true}]}}:
   {code:100,data:{credits_left:'10'}}};
 };
 const opts={env:{LIVEAVATAR_API_KEY:'local-only-secret'},fetchImpl};
 const a=await executeDirect(inspectArgs(['avatars']),opts);
 const b=await executeDirect(inspectArgs(['credits']),opts);
 assert.equal(a.avatars[0].name,'Nora');
 assert.equal(b.creditsLeft,'10');
 assert.deepEqual(requests.map(x=>x.method),['GET','GET']);
 assert.ok(!JSON.stringify({a,b}).includes('local-only-secret'));
});
test('Sandbox token is LITE and sandbox by default, never paid implicitly',()=>{
 const o=inspectArgs(['sandbox-token','--avatar-id','custom_nora_123456','--confirm-one-session']);
 const d=createLitePayload(o,{});
 assert.equal(d.mode,'LITE');
 assert.equal(d.is_sandbox,true);
 assert.equal(d.max_session_duration,45);
 assert.deepEqual(readyToMint(o,{}),[]);
});
test('Paid session requires EXPLICIT local one-shot confirmation and never retries',()=>{
 const options=inspectArgs(['paid-token','--avatar-id','custom_nora_123456','--confirm-one-session']);
 assert.ok(readyToMint(options,{}).length);
 assert.throws(()=>createLitePayload(options,{}));
 const p=createLitePayload(options,{STOCKS_APPROVE_ONE_LIVEAVATAR_PAID_TEST:'YES'});
 assert.equal(p.is_sandbox,false);
 assert.equal(p.mode,'LITE');
});
test('Request body and key are private; no random destinations or FULL mode accepted',async()=>{
 let count=0;
 const fetchImpl=async(url,options)=>{
  count++;
  assert.equal(url,'https://api.liveavatar.com/v1/sessions/token');
  assert.equal(options.headers['X-API-KEY'],'local-only-secret');
  assert.equal(JSON.parse(options.body).is_sandbox,true);
  return {ok:true,status:200,json:async()=>({code:100,data:{session_token:'private-local-only-token',session_id:'example-session'}})};
 };
 const r=await executeDirect(inspectArgs(['sandbox-token','--avatar-id','custom_nora_123456','--confirm-one-session']),
  {env:{LIVEAVATAR_API_KEY:'local-only-secret'},fetchImpl});
 assert.equal(count,1);
 assert.equal(r.token,'private-local-only-token');
 assert.equal(r.sandbox,true);
 await assert.rejects(()=>providerCall('/v1/anything',{apiKey:'private',fetchImpl}),/Only documented/);
});
