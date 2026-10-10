import test from 'node:test';
import assert from 'node:assert/strict';
import {budgetPreflight,selectedProgramme,proposedPresenters} from '../pilot/v2/budget-preflight.mjs';
import {requirePaidRelease} from '../pilot/v2/workflow.mjs';

test('Araj/Kevin profile is valid, retains timings and cannot silently use Maya/Daniel dialogue',()=>{
  for(const profile of ['sample','pilot']){
    const p=selectedProgramme(profile);
    assert.equal(p.durationMs,profile==='sample'?45000:300000);
    assert.deepEqual(p.presenters.map(x=>x.name),['Araj','Kevin']);
    assert.deepEqual(p.presenters.map(x=>x.id),['araj','kevin']);
    assert.equal(p.turns.some(t=>/\b(Maya|Daniel)\b/.test(t.text)),false);
    assert.ok(p.turns.every(t=>p.presenters.some(x=>x.id===t.speakerId)));
  }
  assert.equal(proposedPresenters.ANCHOR.defaultVoiceId.length,32);
  assert.equal(proposedPresenters.ANALYST.lookId.length,32);
  assert.equal(proposedPresenters.ANCHOR.avatarType,'digital_twin');
  assert.equal(proposedPresenters.ANALYST.preferredAspectRatio,'16:9');
  assert.equal(proposedPresenters.ANCHOR.preferredAspectRatio,'9:16');
  assert.throws(()=>selectedProgramme('segment'),/Only sample and pilot/);
});

test('preflight has no paid side effects and keeps budget contingent on listener/matting evidence',()=>{
  const sample=budgetPreflight('sample'),pilot=budgetPreflight('pilot');
  assert.equal(sample.noExternalCalls,true);
  assert.equal(sample.paidRelease,'BLOCKED');
  assert.equal(sample.plannedExposure.speakingSlotUpperSeconds,42);
  assert.equal(sample.plannedExposure.avatarIIIForSpeakingSlotsUSD,.70);
  assert.equal(sample.plannedExposure.avatarIVForSpeakingSlotsUSD,2.80);
  assert.equal(sample.plannedExposure.offScreenVoiceSecondsCurrentlySentThroughAvatar,7.5);
  assert.equal(sample.plannedExposure.fullSceneVisiblePresenterCoverageSeconds,53);
  assert.deepEqual(sample.alphaScenes,['scene-3']);
  assert.equal(pilot.plannedExposure.speakingSlotUpperSeconds,295);
  assert.equal(pilot.plannedExposure.avatarIVForSpeakingSlotsUSD,19.67);
  assert.ok(sample.blockers.some(x=>x.includes('ElevenLabs')));
  assert.ok(sample.blockers.some(x=>x.includes('listener footage')));
  assert.ok(sample.plannedExposure.extraListenerFootage.includes('not included'));
});

test('paid worker rejects unapproved exact episode hash and cap without any provider call',()=>{
  const run={manifest:{episodeHash:'approved-episode-digest'}};
  const env={PILOT_MAX_ESTIMATED_USD:'5',PILOT_PAID_RELEASE_MAX_USD:'5',PILOT_PAID_RELEASE_EPISODE_HASH:'wrong-digest'};
  assert.throws(()=>requirePaidRelease(run,env),/Paid generation locked/);
  env.PILOT_PAID_RELEASE_EPISODE_HASH=run.manifest.episodeHash;
  env.PILOT_PAID_RELEASE_MAX_USD='4';
  assert.throws(()=>requirePaidRelease(run,env),/within a positive/);
  env.PILOT_PAID_RELEASE_MAX_USD='5';
  assert.doesNotThrow(()=>requirePaidRelease(run,env));
});
