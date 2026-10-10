// No-API FFmpeg proof for the native 3-cut audition path.
// All synthetic media are visibly technical test patterns and cannot be approved.
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import {mkdtemp,rm} from 'node:fs/promises';
import {command,probe} from '../media.mjs';
import {initNative,importNativeFixture,assembleNative,produceNativeTurn} from './native-audition.mjs';

const root=await mkdtemp(path.join(os.tmpdir(),'signal-native-integration-'));
const original=process.env.PILOT_DATA_DIR;process.env.PILOT_DATA_DIR=root;
try{
  const run=await initNative({fixture:true});
  assert.equal(run.manifest.fixture,true);
  let calls=0;
  await assert.rejects(produceNativeTurn(run,'liza-open',{
    paid:true,env:{HEYGEN_API_KEY:'mock',PILOT_PAID_RELEASE_EPISODE_HASH:run.manifest.planHash,
      PILOT_MAX_ESTIMATED_USD:'3',PILOT_PAID_RELEASE_MAX_USD:'3'},
    provider:{async avatarScript(){calls++;}}
  }),/Fixture audition cannot/);
  assert.equal(calls,0);
  for(let i=0;i<run.plan.turns.length;i++){
    const t=run.plan.turns[i],file=path.join(root,'test-'+i+'.mp4');
    await command('ffmpeg',['-v','error','-y','-f','lavfi','-i','testsrc2=size=1280x720:rate=30',
      '-f','lavfi','-i','sine=frequency='+String(420+i*120)+':sample_rate=48000',
      '-t','2.5','-c:v','libx264','-preset','ultrafast','-threads','2',
      '-pix_fmt','yuv420p','-c:a','aac',file]);
    await importNativeFixture(run,t.id,file);
  }
  const qa=await assembleNative(run);
  const record=await probe(path.join(run.root,'output/audition-master.mp4'));
  assert.equal(qa.synthetic,true);
  assert.equal(qa.realPresenterSources,false);
  assert.equal(qa.humanLipSyncApproval,false);
  assert.equal(qa.withinRequested30To45Seconds,false);
  assert.equal(qa.actualProviderCostUSD,null);
  assert.equal(record.video.width,1920);assert.equal(record.video.height,1080);
  assert.equal(record.audio.sampleRate,48000);
  assert.ok(record.duration>7&&record.duration<9);
  console.log(JSON.stringify({passed:true,providerCalls:0,synthetic:true,
    clips:run.plan.turns.length,durationSeconds:record.duration,outputProfile:'H.264/AAC 1080p30',realPresenterApproval:false}));
}finally{
  if(original===undefined)delete process.env.PILOT_DATA_DIR;else process.env.PILOT_DATA_DIR=original;
  await rm(root,{recursive:true,force:true});
}
