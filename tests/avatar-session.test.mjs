import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/liveavatar/v1/sessions/[action].js';
async function request(t,{method='POST',action='start',authorization='Bearer test-session',ok=true}={}) {
  const calls=[];t.mock.method(globalThis,'fetch',async(url,options)=>{calls.push({url,options});return {ok,status:ok?200:401,json:async()=>ok?{code:1000,data:{session_id:'test'}}:{message:'secret upstream text'}};});
  const res={code:200,setHeader(){},status(code){this.code=code;return this;},json(body){this.body=body;return this;}};
  await handler({method,query:{action},headers:{authorization}},res);return {res,calls};
}
test('session proxy rejects arbitrary destinations',async t=>{const {res,calls}=await request(t,{action:'https://example.com'});assert.equal(res.code,404);assert.equal(calls.length,0);});
test('session proxy requires token',async t=>{const {res,calls}=await request(t,{authorization:''});assert.equal(res.code,401);assert.equal(calls.length,0);});
test('session proxy forwards only permitted action and bearer token',async t=>{const {res,calls}=await request(t,{action:'stop'});assert.equal(res.code,200);assert.equal(calls[0].url,'https://api.liveavatar.com/v1/sessions/stop');assert.equal(calls[0].options.headers.Authorization,'Bearer test-session');assert.ok(!('X-API-KEY' in calls[0].options.headers));});
test('session proxy does not expose upstream errors',async t=>{const {res}=await request(t,{ok:false});assert.equal(res.code,401);assert.ok(!JSON.stringify(res.body).includes('secret'));});
