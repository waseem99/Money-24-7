import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {inspectArgs,loadLocalKey,readyToMint,createLitePayload,providerCall,executeDirect,WAYNE_SANDBOX_ID} from '../network/live-avatar/direct-setup.mjs';

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
 const o=inspectArgs(['sandbox-token','--avatar-id',WAYNE_SANDBOX_ID,'--confirm-one-session']);
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
 const r=await executeDirect(inspectArgs(['sandbox-token','--avatar-id',WAYNE_SANDBOX_ID,'--confirm-one-session']),
  {env:{LIVEAVATAR_API_KEY:'local-only-secret'},fetchImpl});
 assert.equal(count,1);
 assert.equal(r.token,'private-local-only-token');
 assert.equal(r.sandbox,true);
 await assert.rejects(()=>providerCall('/v1/anything',{apiKey:'private',fetchImpl}),/Only documented/);
});

test('Only Wayne may be used in the zero-credit sandbox',()=>{
 const invalid=inspectArgs(['sandbox-token','--avatar-id','fictional-dexter-id','--confirm-one-session']);
 assert.throws(()=>createLitePayload(invalid),/only permits Wayne/i);
 const wayne=inspectArgs(['sandbox-token','--avatar-id',WAYNE_SANDBOX_ID,'--confirm-one-session']);
 assert.equal(createLitePayload(wayne).is_sandbox,true);
});
test('Free plan read-only public presets need NO key and list verified real IDs',async()=>{
 let calls=0;
 const response=await executeDirect(inspectArgs(['presets']),{
   env:{},cwd:'/tmp',read:async()=>{throw Error('none')},
   fetchImpl:async(url,opts)=>{calls++;
      assert.equal(url,'https://api.liveavatar.com/v1/avatars/public?page=1&page_size=100');
      assert.equal(opts.method,'GET');
      return {ok:true,status:200,json:async()=>({code:100,data:{count:4,results:[
        {id:'public-amina-1234',name:'Amina',status:'READY',is_1080p:true},
        {id:'public-dexter-123',name:'Dexter',status:'READY',is_1080p:true},
        {id:'other-1',name:'Wayne',status:'READY',is_1080p:true}
      ],next:null}})};
    }});
 assert.equal(response.presets.length,2);
 assert.equal(response.type,'FREE_PLAN_PUBLIC_PRESETS');
 assert.equal(calls,1);
});
test('Free preset token uses included credits and never claims to be zero-credit sandbox',async()=>{
 let paths=[];
 const free=inspectArgs(['free-preset-token','--avatar-id','public-amina-1234',
   '--confirm-one-session','--confirm-use-included-credits']);
 assert.equal(createLitePayload(free).is_sandbox,false);
 assert.ok(readyToMint({...free,confirmIncludedCredits:false}).length);
 const fetchImpl=async(url,opts)=>{
   paths.push(url);
   const resp=url.includes('/avatars/public') ? {count:2,results:[
      {id:'public-amina-1234',name:'Amina',status:'READY'},
      {id:'public-dexter-123',name:'Dexter',status:'READY'}],next:null}
     :url.endsWith('/credits') ? {credits_left:9}
     :{session_token:'secret-local-only',session_id:'private-1'};
   return {ok:true,status:200,json:async()=>({code:100,data:resp})};
 };
 const result=await executeDirect(free,{env:{LIVEAVATAR_API_KEY:'local-secret'},fetchImpl});
 assert.equal(result.usesIncludedCredits,true);
 assert.equal(result.sandbox,false);
 assert.equal(result.watermarkExpected,true);
 assert.equal(result.concurrentAvatarLimit,1);
 assert.equal(paths.length,3);
 assert.ok(paths[0].endsWith('/public?page=1&page_size=100'));
 assert.ok(paths[1].endsWith('/credits'));
 assert.ok(paths[2].endsWith('/sessions/token'));
});
test('Free preset session is blocked for zero credits or fabricated avatar ID',async()=>{
 const free=inspectArgs(['free-preset-token','--avatar-id','wrong-fake-123',
   '--confirm-one-session','--confirm-use-included-credits']);
 let count=0;
 const fetchImpl=async(url)=>{count++;return {ok:true,status:200,json:async()=>({code:100,data:
    url.includes('/public')?{results:[{id:'public-dexter-123',name:'Dexter'}],next:null}:
    {credits_left:0}})};};
 await assert.rejects(()=>executeDirect(free,{env:{LIVEAVATAR_API_KEY:'local-secret'},fetchImpl}),/not a verified public/);
 assert.equal(count,1);
});
