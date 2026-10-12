import test from 'node:test';
import assert from 'node:assert/strict';
import {realismComparison,finalCast} from '../pilot/v2/realism-casting.mjs';
import {proposedPresenters} from '../pilot/v2/budget-preflight.mjs';
import {nativeAuditionPlan} from '../pilot/v2/native-audition.mjs';

test('final user decision is Liza with Annie and Lasse with Orson, using genuine existing formal office photos',()=>{
  const p=realismComparison();
  assert.deepEqual(p.selectedPair,['Liza','Lasse']);
  assert.deepEqual(p.selectedVoicePair,['Annie - Lifelike','Orson - Firm & Measured']);
  assert.equal(p.femaleLead,true);
  assert.equal(p.maleAnalyst,true);
  assert.equal(p.wardrobeApproved,true);
  assert.equal(p.motionQualityApproved,false);
  assert.equal(p.readyForFullLengthRelease,false);
  assert.equal(finalCast.selectedCastVideoProduced,false);
  assert.equal(finalCast.status,'liza-and-lasse-locked-formal-outfits-previewed-motion-qa-pending');
  assert.deepEqual(nativeAuditionPlan.turns.map(t=>t.name),['Liza','Lasse','Liza']);
  for(const role of ['ANCHOR','ANALYST']){
    const actor=role==='ANCHOR'?finalCast.anchor:finalCast.analyst;
    assert.equal(actor.lookId,proposedPresenters[role].lookId);
    assert.equal(actor.avatarType,'photo_avatar');
    assert.equal(actor.wardrobeApprovalStatus,'approved');
    assert.equal(actor.performanceApprovalStatus,'pending');
    assert.equal(actor.preferredAspectRatio,'16:9');
    assert.ok(actor.videoPreviewUrl.startsWith('https://'));
  }
});

test('Photo Avatar III is $1/min, Photo IV is $3/min; short QA must precede full film',()=>{
  const p=realismComparison();
  assert.equal(p.avatarIIIPricePerMinuteUSD,1);
  assert.equal(p.avatarIVPhotoPricePerMinuteUSD,3);
  assert.equal(p.fortyFiveSecondIIIEstimateUSD,.75);
  assert.equal(p.threeMinuteSpeakingIIIEstimateUSD,3);
  assert.equal(p.noAutomaticRetakes,true);
  assert.ok(p.reviewRequired.some(x=>/lip sync/i.test(x)));
});
