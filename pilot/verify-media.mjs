import {mkdtemp,rm,mkdir,writeFile} from 'node:fs/promises';import path from 'node:path';import {tmpdir} from 'node:os';import assert from 'node:assert/strict';
import {command,verifyAudible,mediaRecord,inspectMedia} from './media.mjs';
import {readJSON} from './contracts.mjs';
import {compose} from './compositor.mjs';
const root=await mkdtemp(path.join(tmpdir(),'signal-media-check-'));await mkdir(path.join(root,'assets'));
try {
const take=path.join(root,'assets','test.mp4');
await command('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','lavfi','-i','testsrc2=size=1280x720:rate=30','-f','lavfi','-i','sine=frequency=440:sample_rate=48000','-t','13','-c:v','libx264','-preset','ultrafast','-threads','2','-c:a','aac',take]);
await verifyAudible(take);
assert.equal((await inspectMedia(take)).pass,true);
const listener=path.join(root,'assets','listener.mp4');
await command('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','lavfi','-i','testsrc2=size=1280x720:rate=30','-t','14','-c:v','libx264','-preset','ultrafast','-threads','2',listener]);
const frozen=path.join(root,'frozen.mp4');await command('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','lavfi','-i','color=c=black:size=1280x720:rate=30','-t','3','-c:v','libx264','-preset','ultrafast','-threads','2',frozen]);
const defects=await inspectMedia(frozen,{silence:false});assert.equal(defects.pass,false);assert.ok(defects.black.length);assert.ok(defects.freeze.length);
const silence=path.join(root,'silent.wav');await command('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','lavfi','-i','anullsrc=r=48000:cl=stereo','-t','2',silence]);await assert.rejects(verifyAudible(silence),/silent/);
const episode=await readJSON(new URL('./episodes/pilot.json',import.meta.url));episode.shots=episode.shots.slice(0,2);
const manifest={listeners:{welcome:await mediaRecord(listener,{speaker:'analyst',provenance:'synthetic test only'})},assets:{welcome:await mediaRecord(take,{kind:'presenter',fixture:false,provider:'synthetic-integration-test'})}};
// A deliberately short synthetic programme exercises actual clip overlay/audio/music
// and must FAIL final 300s approval. It is never offered as a real presenter demo.
await assert.rejects(compose(episode,manifest,root,{onProgress:console.log}),/export quality gates/);
const qa=await readJSON(path.join(root,'output','qa.json'));assert.equal(qa.checks.duration,false);assert.equal(qa.checks.canvas,true);assert.equal(qa.checks.codecs,true);assert.equal(qa.checks.frameRate,true);assert.equal(qa.checks.loudness,true);assert.equal(qa.technicalPass,false);
console.log(JSON.stringify({syntheticClipPath:'passed',splitScreen:'passed',blackAndFreezeRejected:true,silentSourceRejected:true,shortMasterRejected:true,loudness:qa.loudness,dimensions:qa.master.video}));
}finally{await rm(root,{recursive:true,force:true});}
