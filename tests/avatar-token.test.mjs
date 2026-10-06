import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/avatar-token.js';

const fixture = {LIVEAVATAR_API_KEY:'test-key',LIVEAVATAR_AVATAR_ID:'test-avatar',LIVEAVATAR_VOICE_ID:'test-voice',LIVEAVATAR_CONTEXT_ID:'test-context',STUDIO_ACCESS_TOKEN:'test-studio',LIVEAVATAR_SANDBOX:'true'};
async function run(t, {method='POST',authorization='Bearer test-studio',missing,reply,fail,profile,confirm}={}) {
  const saved=Object.fromEntries(Object.keys(fixture).map(k=>[k,process.env[k]]));
  Object.assign(process.env,fixture);
  if(missing) delete process.env[missing];
  t.after(()=>{for(const [k,v] of Object.entries(saved)) v===undefined?delete process.env[k]:process.env[k]=v;});
  const calls=[];
  t.mock.method(globalThis,'fetch',async (url,options)=>{calls.push({url,options});if(fail)throw new Error('private upstream failure');return reply||{ok:true,json:async()=>({data:{session_token:'test-session'}})};});
  const res={code:200,headers:{},setHeader(k,v){this.headers[k]=v;},status(code){this.code=code;return this;},json(body){this.body=body;return this;}};
  await handler({method,query:{profile},headers:authorization===null?{}:{authorization,'x-confirm-credit-use':confirm}},res);
  return {res,calls};
}
test('unsupported method never calls the provider',async t=>{const {res,calls}=await run(t,{method:'GET'});assert.equal(res.code,405);assert.equal(calls.length,0);});
test('missing configuration never calls the provider',async t=>{const {res,calls}=await run(t,{missing:'LIVEAVATAR_API_KEY'});assert.equal(res.code,503);assert.equal(calls.length,0);});
for(const authorization of [null,'Bearer wrong','test-studio','Basic test-studio','Bearer test-studio extra']) {
  test(`rejects invalid authorization: ${authorization}`,async t=>{const {res,calls}=await run(t,{authorization});assert.equal(res.code,401);assert.equal(calls.length,0);});
}
test('authorized request sends server-side settings and returns only session token',async t=>{
  const {res,calls}=await run(t);assert.equal(res.code,200);assert.deepEqual(res.body,{sessionToken:'test-session'});assert.equal(res.headers['Cache-Control'],'no-store');assert.equal(calls.length,1);
  assert.equal(calls[0].url,'https://api.liveavatar.com/v1/sessions/token');assert.equal(calls[0].options.headers['X-API-KEY'],'test-key');
  const body=JSON.parse(calls[0].options.body);assert.equal(body.is_sandbox,true);assert.equal(body.max_session_duration,60);assert.equal(body.avatar_id,'test-avatar');assert.equal(body.avatar_persona.voice_id,'test-voice');assert.equal(body.avatar_persona.context_id,'test-context');
});
test('provider rejection is sanitized',async t=>{const {res}=await run(t,{reply:{ok:false,json:async()=>({error:'private upstream details'})}});assert.equal(res.code,502);assert.ok(!JSON.stringify(res.body).includes('private'));});
test('missing session token fails closed',async t=>{const {res}=await run(t,{reply:{ok:true,json:async()=>({data:{}})}});assert.equal(res.code,502);});
test('network failure is sanitized',async t=>{const {res}=await run(t,{fail:true});assert.equal(res.code,502);assert.ok(!JSON.stringify(res.body).includes('private'));});

test('provider authentication failures are actionable without leaking details',async t=>{const {res}=await run(t,{reply:{ok:false,status:401,json:async()=>({error:'private upstream details'})}});assert.equal(res.body.providerStatus,401);assert.match(res.body.error,/API key rejected/);assert.ok(!JSON.stringify(res.body).includes('private'));});

test('professional profile requires deliberate credit confirmation',async t=>{const {res,calls}=await run(t,{profile:'professional'});assert.equal(res.code,400);assert.equal(calls.length,0);});
test('professional profile uses fixed selected assets and bounded duration',async t=>{const {res,calls}=await run(t,{profile:'professional',confirm:'yes'});assert.equal(res.code,200);const b=JSON.parse(calls[0].options.body);assert.equal(b.is_sandbox,false);assert.equal(b.max_session_duration,120);assert.equal(b.avatar_id,'87dff365-543d-46a5-9f5a-524da44675ab');});
test('arbitrary profile is rejected without calling provider',async t=>{const {res,calls}=await run(t,{profile:'arbitrary'});assert.equal(res.code,400);assert.equal(calls.length,0);});
test('explicit sandbox selection keeps sandbox enabled and uses Wayne',async t=>{const {calls}=await run(t,{profile:'sandbox'});const b=JSON.parse(calls[0].options.body);assert.equal(b.is_sandbox,true);assert.equal(b.avatar_id,'dd73ea75-1218-4ef3-92ce-606d5f7fbc0a');});
