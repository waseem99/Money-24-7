import test from 'node:test';
import assert from 'node:assert/strict';
import {realismComparison,castingShortlist} from '../pilot/v2/realism-casting.mjs';
import {proposedPresenters} from '../pilot/v2/budget-preflight.mjs';
import {nativeAuditionPlan} from '../pilot/v2/native-audition.mjs';

test('zero-cost realism casting never silently replaces approved Liza/Lasse',()=>{
  const p=realismComparison();
  assert.equal(p.zeroSpend,true);
  assert.equal(p.noVideoGenerated,true);
  assert.equal(p.paymentStatus,'BLOCKED');
  assert.equal(p.userMustApproveChangingFaces,true);
  assert.deepEqual(p.comparisons.map(x=>x.id),['keep-liza-lasse','recast-filmed-studio','recast-recorded-digital-twins']);
  assert.deepEqual([nativeAuditionPlan.turns[0].name,nativeAuditionPlan.turns[1].name],['Liza','Lasse']);
  assert.equal(castingShortlist.keep.anchor.lookId,proposedPresenters.ANCHOR.lookId);
  assert.equal(castingShortlist.keep.analyst.lookId,proposedPresenters.ANALYST.lookId);
});
test('recorded studio fallback has distinct real look identities, Avatar III and explicit costs',()=>{
  const p=realismComparison(),v=p.comparisons.find(x=>x.id==='recast-filmed-studio');
  assert.equal(v.engine,'avatar_iii');
  assert.deepEqual(v.avatarTypes,['studio_avatar','studio_avatar']);
  assert.notEqual(v.lookIds[0],v.lookIds[1]);
  assert.equal(v.sample45SecSpokenVideoUSD,.75);
  assert.equal(v.fiveMinSpokenVideoUSD,5);
  assert.equal(v.three20SecMaxTurnEstimateUSD,1);
  assert.deepEqual(p.comparisons.map(x=>x.sample45SecSpokenVideoUSD),[2.25,.75,3]);
  const higher=p.comparisons.find(x=>x.id==='recast-recorded-digital-twins');
  assert.deepEqual(higher.avatarTypes,['digital_twin','digital_twin']);
  assert.deepEqual(higher.presenters,['Veronica','Kevin']);
  assert.equal(higher.engine,'avatar_v');
  assert.equal(higher.fiveMinSpokenVideoUSD,20);
  assert.equal(higher.alternateBudgetEngine,'avatar_iii');
  assert.equal(higher.alternateBudgetEngineRateUSDPerMinute,1);
  assert.deepEqual([castingShortlist.twins.anchor.nativeWidth,castingShortlist.twins.analyst.nativeWidth],[1280,1280]);
  for(const t of [castingShortlist.filmed.anchor,castingShortlist.filmed.analyst]){
    assert.ok(t.videoPreviewUrl.startsWith('https://files2.heygen.ai/'));
    assert.ok(t.defaultVoiceId.length>=20);
  }
});
