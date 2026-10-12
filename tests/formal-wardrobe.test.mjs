import test from 'node:test';
import assert from 'node:assert/strict';
import {formalWardrobeBrief,auditFormalWardrobe} from '../pilot/v2/formal-wardrobe.mjs';
import {proposedPresenters} from '../pilot/v2/budget-preflight.mjs';

test('business-formal wardrobe is required before the full Jazz master',()=>{
  const a=auditFormalWardrobe();
  assert.equal(a.ready,false);
  assert.equal(a.status,'HOLD_FORMAL_WARDROBE');
  assert.equal(a.paidVideoAuthorized,false);
  assert.equal(a.roles.ANCHOR.actor,'Rumi');
  assert.equal(a.roles.ANALYST.actor,'Kevin');
  assert.equal(formalWardrobeBrief.cast.ANCHOR.voiceId,'330290724a1b470fb63153f34d4c0183');
  assert.equal(formalWardrobeBrief.cast.ANALYST.voiceId,'00e3d285aba44b27a83c47c02c9c2d9c');
  assert.ok(a.blockers.some(x=>x.includes('exact NEW professional outfit')));
  assert.throws(()=>auditFormalWardrobe({}, {strict:true}),/HOLD_FORMAL_WARDROBE/);
});

test('casual original public video looks must NEVER pass wardrobe gate even after someone marks them approved',()=>{
  const formal=role=>{
    const p=proposedPresenters[role];
    return {actorName:p.name,lookId:p.lookId,groupId:p.groupId,voiceId:p.auditionVoiceId,
      avatarType:'digital_twin',completed:true,actualOutfitReviewed:true,
      faceMatchedExistingActor:true,approvedBy:'Human reviewer',previewUrl:'https://example.org/formal-preview',motionQualityApproved:true};
  };
  const result=auditFormalWardrobe({ANCHOR:formal('ANCHOR'),ANALYST:formal('ANALYST')});
  assert.equal(result.ready,false);
  assert.ok(result.roles.ANCHOR.blockers.some(x=>x.includes('original casual public video look')));
  assert.ok(result.roles.ANALYST.blockers.some(x=>x.includes('original casual public video look')));
  assert.equal(result.paidVideoAuthorized,false);
});

test('photo-based wardrobe versions additionally demand lip-sync motion QA and same-identity evidence',()=>{
  const role=(key,id,avatarType='digital_twin')=>{
    const p=proposedPresenters[key];
    return {actorName:p.name,lookId:id,groupId:p.groupId,voiceId:p.auditionVoiceId,
      avatarType,completed:true,actualOutfitReviewed:true,faceMatchedExistingActor:true,
      approvedBy:'User reviewed real source',previewUrl:'https://example.org/real-preview'};
  };
  const looks={
    ANCHOR:role('ANCHOR','feedfeedfeedfeedfeedfeedfeedfeed','photo_avatar'),
    ANALYST:role('ANALYST','deadbeefdeadbeefdeadbeefdeadbeef')
  };
  let a=auditFormalWardrobe(looks);
  assert.equal(a.ready,false);
  assert.ok(a.roles.ANCHOR.blockers.some(x=>x.includes('motion/lip-sync QA')));
  looks.ANCHOR.motionQualityApproved=true;
  a=auditFormalWardrobe(looks);
  assert.equal(a.ready,true);
  assert.equal(a.status,'READY_FOR_SEPARATE_PAID_MASTER_APPROVAL');
  assert.equal(a.paidVideoAuthorized,false);
  looks.ANALYST.groupId='bad-identity';
  assert.equal(auditFormalWardrobe(looks).ready,false);
});
