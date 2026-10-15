import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {getProviderLiteSocket,observeLiteSpeechEvents,sendApprovedLiteAudio} from '../network/streaming/lite-speech-wire.mjs';

class FakeProviderSocket {
 constructor(){this.readyState=1;this.sent=[];this.listeners=new Map()}
 send(s){this.sent.push(JSON.parse(s))}
 addEventListener(kind,fn){const s=this.listeners.get(kind)||new Set();s.add(fn);this.listeners.set(kind,s)}
 removeEventListener(kind,fn){this.listeners.get(kind)?.delete(fn)}
 receive(event){for(const f of this.listeners.get('message')||[])f({data:JSON.stringify(event)})}
}
const uuid='abcde123-4567-4abc-9999-aabbccddeeff';
const fakeSession=()=>({_sessionEventSocket:new FakeProviderSocket()});
const sample=(secs=5)=>String.fromCharCode(0,0,0x3f,0x7f).repeat(12000*secs);

test('Provider LITE source is read-only until REAL moving media exists',()=>{
 const s=fakeSession();
 const wav=sample();
 assert.throws(()=>sendApprovedLiteAudio(s,wav,{mediaReady:false,frames:0,sourceApproved:true,uuid:()=>uuid}),/actual moving/);
 assert.throws(()=>sendApprovedLiteAudio(s,wav,{mediaReady:true,frames:9,sourceApproved:true,uuid:()=>uuid}),/actual moving/);
 assert.throws(()=>sendApprovedLiteAudio(s,wav,{mediaReady:true,frames:25,sourceApproved:false,uuid:()=>uuid}),/approved TTS/);
 assert.equal(s._sessionEventSocket.sent.length,0);
});
test('One approved 5-second take emits 5 real Base64 audio packets plus one speak_end',()=>{
 const s=fakeSession();
 const raw=sample(5);
 const report=sendApprovedLiteAudio(s,raw,{mediaReady:true,frames:20,sourceApproved:true,uuid:()=>uuid,encode:btoa});
 assert.equal(report.packetCount,5);
 assert.equal(report.durationSeconds,5);
 assert.equal(report.speakingVerified,false);
 const messages=s._sessionEventSocket.sent;
 assert.equal(messages.length,6);
 const speaking=messages.slice(0,-1);
 assert.ok(speaking.every(x=>x.type==='agent.speak'&&x.event_id===uuid));
 assert.ok(speaking.every(x=>Buffer.from(x.audio,'base64').length===48000));
 assert.equal(Buffer.concat(speaking.map(x=>Buffer.from(x.audio,'base64'))).toString('binary'),raw);
 assert.deepEqual(messages[5],{type:'agent.speak_end',event_id:uuid});
 assert.ok(speaking.every(x=>x.audio.length<1024*1024));
});
test('SDK directly forwarding repeatAudio would be INVALID; we never call it',()=>{
 const source=readFileSync(new URL('../network/streaming/operator.js',import.meta.url),'utf8');
 assert.ok(source.includes('sendApprovedLiteAudio('));
 assert.ok(source.includes('observeLiteSpeechEvents('));
 assert.doesNotMatch(source,/\.repeatAudio\(/);
 assert.ok(source.includes('entry.oneSpeechSubmitted=true'));
});
test('Observer distinguishes provider acknowledgment/error from mere outgoing audio',()=>{
 const s=fakeSession(),events=[];
 const observer=observeLiteSpeechEvents(s,e=>events.push(e));
 assert.equal(observer.status.speakStarted,false);
 assert.equal(observer.status.connectedObserved,false);
 s._sessionEventSocket.receive({type:'session.state_updated',state:'connected'});
 s._sessionEventSocket.receive({type:'agent.speak_started',event_id:uuid});
 s._sessionEventSocket.receive({type:'agent.speak_ended',event_id:uuid});
 assert.equal(observer.status.connectedObserved,true);
 assert.equal(observer.status.speakStarted,true);
 assert.equal(observer.status.speakEnded,true);
 assert.equal(observer.status.providerError,false);
 assert.equal(events.length,3);
 s._sessionEventSocket.receive({type:'error',message:'invalid base64 audio data'});
 assert.equal(observer.status.providerError,true);
 observer.stop();
 s._sessionEventSocket.receive({type:'agent.speak_started',event_id:uuid});
 assert.equal(events.length,4);
});
test('Missing or not-yet-open SDK provider WebSocket fails closed, never silently emits audio',()=>{
 assert.throws(()=>getProviderLiteSocket({}),/does not expose/);
 const s=fakeSession();s._sessionEventSocket.readyState=0;
 assert.throws(()=>sendApprovedLiteAudio(s,sample(),{mediaReady:true,frames:25,sourceApproved:true,uuid:()=>uuid}),/not OPEN/);
 assert.equal(s._sessionEventSocket.sent.length,0);
});
