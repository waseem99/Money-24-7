import test from 'node:test';
import assert from 'node:assert/strict';
import {lines,speechRequests,prepareVideos} from '../production/audition/prepare.mjs';
const audio=()=>lines.map((l,i)=>({...l,voiceId:speechRequests()[i].body.voice_id,assetId:`asset-${i}`,seconds:8,sha256:String(i).repeat(64)}));
test('fixed speakers retain distinct voices and explicit engines',()=>{
 const s=speechRequests();assert.notEqual(s[0].body.voice_id,s[1].body.voice_id);assert.equal(s[0].body.voice_id,s[2].body.voice_id);
 const p=prepareVideos(audio(),{usdPerMinute:2.31});assert.equal(p.totalSeconds,32);assert.equal(p.estimatedVideoUsd,1.24);assert.ok(p.requests.every(r=>r.body.engine.type==='avatar_iv'));assert.equal(p.requestHash,prepareVideos(audio(),{usdPerMinute:2.31}).requestHash);
});
test('reject mismatched voices, scripts, durations, duplicates and budgets',()=>{
 for(const mutate of [a=>a[1].voiceId=a[0].voiceId,a=>a[0].text='wrong',a=>a[0].seconds=NaN,a=>a[0].assetId='',a=>a[0].sha256='',a=>a[1].id=a[0].id,a=>a.forEach(x=>x.seconds=11)]){const a=audio();mutate(a);assert.throws(()=>prepareVideos(a,{usdPerMinute:2.31}));}
 assert.throws(()=>prepareVideos(audio(),{usdPerMinute:10,estimateLimitUsd:1}));assert.throws(()=>prepareVideos([],{usdPerMinute:2.31}));
});
