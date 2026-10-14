import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {float32ToPcm16Binary,audioProofPolicy,LITE_AUDIO} from '../network/streaming/lite-audio.mjs';

test('Signed PCM16 conversion is 24kHz-compatible little endian, bounded and non-synthetic',()=>{
 const pcm=float32ToPcm16Binary(new Float32Array([0,1,-1,.5,-.5]));
 assert.equal(pcm.length,10);
 assert.deepEqual([...pcm].map(x=>x.charCodeAt(0)),[0,0,255,127,0,128,0,64,0,192]);
 assert.equal(LITE_AUDIO.sampleRate,24000);
 assert.equal(LITE_AUDIO.channels,1);
});
test('Nora 20.9s full synthetic speech can be audited but not called avatar video',()=>{
 const verified=audioProofPolicy({durationSeconds:20.9,sampleRate:24000,channels:1,
  byteLength:1003200,sourceApproved:true});
 assert.deepEqual(verified.errors,[]);
 assert.equal(verified.pass,true);
 assert.equal(audioProofPolicy({...{durationSeconds:20.9,sampleRate:24000,channels:1,
  byteLength:1003200},sourceApproved:false}).pass,false);
 assert.equal(audioProofPolicy({durationSeconds:3600,sampleRate:24000,channels:1,
  byteLength:172800000,sourceApproved:true}).pass,false);
});
test('Existing Stocks private operator lab has deliberate one-shot source-audio injection only after real stream',()=>{
 const html=readFileSync(new URL('../stocks-streaming-lab.html',import.meta.url),'utf8');
 const js=readFileSync(new URL('../network/streaming/operator.js',import.meta.url),'utf8');
 assert.ok(html.includes('NORA-audio-file')&&html.includes('NORA-speak'));
 assert.ok(js.includes('speakNoraOnce()'));
 assert.ok(js.includes('entry.oneSpeechSubmitted=true'));
 assert.ok(js.includes("entry.session.repeatAudio(audio.pcm24kBinary)"));
 assert.ok(js.includes('entry.mediaReady'));
 assert.ok(js.includes('oneSpeechSubmitted'));
 assert.ok(js.includes("sourceApproved:true"));
 assert.doesNotMatch(js,/fetch\(['"]https:\/\/api\.liveavatar\.com/);
});
