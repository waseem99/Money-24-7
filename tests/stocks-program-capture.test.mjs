import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {FRAME,validateCaptureInputs,graphicFramePolicy,MAX_RECORD_SECONDS} from '../network/streaming/program-capture.mjs';

const input={
 roomReady:true,logoReady:true,camera:'C_NORA',seconds:30,marketStatus:'RECORDED_DEMO',
 sources:{NORA:{connected:true,frames:150,hasVideoTrack:true},
 MARCUS:{connected:false,frames:0,hasVideoTrack:false}}
};
test('A real moving approved 1080p provider clip can be captured but no static placeholder can',()=>{
 assert.equal(FRAME.width,1920);assert.equal(FRAME.height,1080);assert.equal(FRAME.fps,30);
 assert.equal(validateCaptureInputs(input).pass,true);
 const stopped=structuredClone(input);stopped.sources.NORA.frames=0;
 assert.equal(validateCaptureInputs(stopped).pass,false);
 const none=structuredClone(input);none.sources.NORA.connected=false;
 assert.equal(validateCaptureInputs(none).pass,false);
});
test('No false shared desk proof and no nonexistent presenter role',()=>{
 assert.equal(validateCaptureInputs({...input,camera:'A_WIDE'}).pass,false);
 assert.equal(validateCaptureInputs({...input,camera:'B_MARCUS'}).pass,false);
 assert.equal(validateCaptureInputs({...input,camera:'C_NORA'}).pass,true);
 assert.equal(validateCaptureInputs({...input,camera:'X'}).pass,false);
});
test('Capture is short, real, licensed source only and not a public LIVE feed',()=>{
 assert.equal(MAX_RECORD_SECONDS,90);
 assert.equal(validateCaptureInputs({...input,seconds:91}).pass,false);
 assert.equal(validateCaptureInputs({...input,seconds:1}).pass,false);
 assert.equal(validateCaptureInputs({...input,roomReady:false}).pass,false);
 assert.equal(validateCaptureInputs({...input,logoReady:false}).pass,false);
 assert.equal(validateCaptureInputs({...input,marketStatus:'LIVE'}).pass,false);
});
test('Broadcast graphics are independent of generative studio art',()=>{
 assert.deepEqual(graphicFramePolicy({bugCount:1,brandPosition:'TOP_LEFT',coverage:'US',
  recorded:true,status:'RECORDED DEMO',bakedStockQuotes:false,bakedStudioPeople:false}),[]);
 assert.ok(graphicFramePolicy({bugCount:2,brandPosition:'TOP_LEFT',coverage:'US'}).length);
 assert.ok(graphicFramePolicy({bugCount:1,brandPosition:'TOP_LEFT',coverage:'US',bakedStockQuotes:true}).length);
 assert.ok(graphicFramePolicy({bugCount:1,brandPosition:'TOP_LEFT',coverage:'US',recorded:true,status:'LIVE'}).length);
});
test('Operator lab records MediaStream audio and actual keyed video locally, never publishes',()=>{
 const studio=readFileSync(new URL('../stocks-streaming-lab.html',import.meta.url),'utf8');
 const operator=readFileSync(new URL('../network/streaming/operator.js',import.meta.url),'utf8');
 const producer=readFileSync(new URL('../network/streaming/program-capture.mjs',import.meta.url),'utf8');
 const vite=readFileSync(new URL('../vite.config.js',import.meta.url),'utf8');
 assert.ok(studio.includes('program-capture-preview')&&studio.includes('record-stop'));
 assert.ok(operator.includes('new ProgramRecorder')&&operator.includes('record-start'));
 assert.ok(producer.includes('captureStream(FRAME.fps)')&&producer.includes('new MediaRecorder(stream'));
 assert.ok(producer.includes('createMediaStreamSource')&&producer.includes('getAudioTracks()'));
 assert.ok(producer.includes("No actual moving provider frames"));
 assert.match(vite,/operatorLabEnabled\?[\s\S]*stocksOperator/);
 assert.doesNotMatch(producer,/api\.liveavatar\.com|X-API-KEY/);
});
