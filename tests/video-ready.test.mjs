import test from 'node:test';
import assert from 'node:assert/strict';
import {waitForVideo} from '../src/video-ready.js';
test('does not certify an empty media element as a live presenter',async()=>{const video=new EventTarget();Object.assign(video,{readyState:0,videoWidth:0,videoHeight:0});await assert.rejects(waitForVideo(video,5),/no video frames/);});
test('accepts decoded video frames',async()=>{const video=new EventTarget();Object.assign(video,{readyState:2,videoWidth:1280,videoHeight:720});await waitForVideo(video,5);});
