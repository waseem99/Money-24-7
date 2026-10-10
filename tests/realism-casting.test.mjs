import test from 'node:test';
import assert from 'node:assert/strict';
import {realismComparison,finalCast} from '../pilot/v2/realism-casting.mjs';
import {proposedPresenters} from '../pilot/v2/budget-preflight.mjs';
import {nativeAuditionPlan} from '../pilot/v2/native-audition.mjs';

test('user-delegated casting is Araj female anchor + Kevin male analyst, never silently replaced',()=>{
  const p=realismComparison();
  assert.equal(p.noSpend,true);assert.equal(p.readyForPaidRelease,false);
  assert.deepEqual(p.selectedPair,['Araj','Kevin']);
  assert.equal(p.femaleLead,true);assert.equal(p.maleAnalyst,true);
  assert.deepEqual(nativeAuditionPlan.turns.map(t=>t.name),['Araj','Kevin','Araj']);
  assert.equal(finalCast.anchor.lookId,proposedPresenters.ANCHOR.lookId);
  assert.equal(finalCast.analyst.lookId,proposedPresenters.ANALYST.lookId);
  assert.equal(finalCast.anchor.avatarType,'digital_twin');
  assert.equal(finalCast.analyst.avatarType,'digital_twin');
  assert.equal(finalCast.anchor.preferredAspectRatio,'9:16');
  assert.equal(finalCast.analyst.preferredAspectRatio,'16:9');
  assert.equal(finalCast.accountPurchaseAuthorized,false);
  assert.equal(finalCast.liveVideoProduced,false);
});

test('cost comparison uses only published Avatar III and IV digital-twin API rates',()=>{
  const p=realismComparison();
  assert.equal(finalCast.auditionEngine,'avatar_iii');
  assert.equal(p.avatarIIICostPerMinuteUSD,1);
  assert.equal(p.avatarIVCostPerMinuteUSD,4);
  assert.equal(p.avatarVDirectApiPriceConfirmed,false);
  assert.equal(p.hypothetical45SecondIIIUSD,.75);
  assert.equal(p.hypothetical45SecondIVUSD,3);
  assert.equal(p.hypotheticalFiveMinuteSpeakingIIIUSD,5);
  assert.equal(p.hypotheticalFiveMinuteSpeakingIVUSD,20);
  assert.equal(p.payAsYouGoMinTopUpUSD,5);
  for(const presenter of [finalCast.anchor,finalCast.analyst]) {
    assert.equal(presenter.supportedEngines.includes('avatar_iii'),true);
    assert.ok(presenter.videoPreviewUrl.startsWith('https://resource2.heygen.ai/'));
  }
});
