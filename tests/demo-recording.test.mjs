import test from 'node:test';
import assert from 'node:assert/strict';
import {createDemoRecorder,demoScenes} from '../src/broadcast-demo.js';
test('demo is a bounded three-part script with explicit AI disclosure',()=>{assert.equal(demoScenes.length,3);const text=demoScenes.map(s=>s.text).join(' ');assert.ok(text.split(/\s+/).length<160);assert.match(text,/AI-generated/);});
test('recording requires decoded video and live audio',t=>{t.mock.method(globalThis,'setTimeout',setTimeout);globalThis.window={MediaRecorder:function(){}};globalThis.HTMLCanvasElement={prototype:{captureStream(){}}};t.after(()=>{delete globalThis.window;delete globalThis.HTMLCanvasElement;});assert.throws(()=>createDemoRecorder({readyState:0}),/wait for video/);assert.throws(()=>createDemoRecorder({readyState:2,videoWidth:1280,srcObject:{getAudioTracks:()=>[]}}),/audio track/);});
