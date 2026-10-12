import test from 'node:test';
import assert from 'node:assert/strict';
import {programme,identity,auditPlan,newVideoScenes,existingVideoScenes} from '../pilot/v2/demo-master-plan.mjs';
import {renderFrame,simulated} from '../pilot/v2/animated-signal.mjs';
import {allocateTimeline,captionsVTT} from '../pilot/v2/assemble-demo.mjs';

test('frozen formal Liza/Annie and Lasse/Orson 3-minute film is narratively coherent and budget bounded',()=>{
 const p=auditPlan();
 assert.equal(p.safeDryRun,true);
 assert.equal(p.newPaidClips,8);
 assert.equal(p.reusedCompletedClips,2);
 assert.equal(p.targetSeconds,180);
 assert.equal(p.totalScenes,14);
 assert.equal(p.readyForBatch,false);
 assert.equal(identity.LIZA.look,'5ee67ac453c34ffebd71e8eedb47b2fe');
 assert.equal(identity.LIZA.voice,'330290724a1b470fb63153f34d4c0183');
 assert.equal(identity.LASSE.look,'de9f36c26bd841c891489a0c9d6174de');
 assert.equal(identity.LASSE.voice,'00e3d285aba44b27a83c47c02c9d416');
 assert.equal(programme.illustrative,true);
 assert.equal(programme.disclosure.includes('NOT LIVE'),true);
 assert.ok(newVideoScenes.every(s=>s.script&&!s.existingVideoId));
 assert.ok(existingVideoScenes.every(s=>s.existingVideoId));
 assert.ok(newVideoScenes.every(s=>s.script.split(/\s+/).length<=53));
});

test('active ticker, progressive candles, RSI and polished typographic overlays CHANGE over time',()=>{
 const q=programme.scenes.find(s=>s.id==='lasse_momentum');
 const early=renderFrame(q,.6,18,{globalSeconds:100.6,audioDuration:15.2});
 const late=renderFrame(q,13.5,18,{globalSeconds:113.5,audioDuration:15.2});
 assert.notEqual(early,late);
 assert.ok(early.includes('SIGNAL'));
 assert.ok(late.includes('MACD 12 / 26 / 9'));
 assert.ok(late.includes('MOMENTUM  /  RSI 14'));
 assert.ok(late.includes('MARKET DEMO'));
 assert.ok(late.includes('SIMULATED MARKET DATA'));
 assert.ok(late.includes('<svg'));
 assert.equal(simulated.length,52);
});

test('timeline follows actual immutable speaking clips, produces approximately 180s and bounded caption tracks',()=>{
 const sources=Object.fromEntries(programme.scenes.filter(s=>s.kind==='speaker')
   .map(s=>[s.id,{duration:s.existingVideoId?8.7:s.id==='liza_close'?9.3:15.2}]));
 const timeline=allocateTimeline(programme,sources);
 assert.ok(Math.abs(timeline.totalSeconds-180)<.1);
 assert.equal(timeline.entries.length,programme.scenes.length);
 for(let i=1;i<timeline.entries.length;i++)assert.equal(timeline.entries[i].startSeconds,timeline.entries[i-1].endSeconds);
 assert.ok(timeline.entries.every(s=>s.durationSeconds>=s.audioDuration));
 const vtt=captionsVTT(programme,timeline);
 assert.ok(vtt.startsWith('WEBVTT'));
 assert.ok(vtt.includes('Liza'));
 assert.ok(vtt.includes('signal')===false||vtt.length>1200);
 assert.ok(vtt.includes('-->'));
});
