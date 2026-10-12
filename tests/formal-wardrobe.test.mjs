import test from 'node:test';
import assert from 'node:assert/strict';
import {auditFormalWardrobe,formalWardrobeBrief} from '../pilot/v2/formal-wardrobe.mjs';
import {proposedPresenters} from '../pilot/v2/budget-preflight.mjs';

const look=(role,overrides={})=>{
  const p=proposedPresenters[role];
  const brief=formalWardrobeBrief.cast[role];
  return {
    actorName:p.name,lookId:p.lookId,groupId:p.groupId,voiceId:p.auditionVoiceId,
    avatarType:p.avatarType,completed:true,formalOutfitReviewed:true,
    previewUrl:brief.visualSource,motionQualityApproved:false,...overrides
  };
};

test('user-selected formal Office Photo Looks pass wardrobe inspection but do not pass lip-sync QA',()=>{
  const a=auditFormalWardrobe();
  assert.equal(a.wardrobeReady,true);
  assert.equal(a.photoMotionApproved,false);
  assert.equal(a.ready,false);
  assert.equal(a.status,'HOLD_PHOTO_AVATAR_MOTION_QA');
  assert.equal(a.paidVideoAuthorized,false);
  assert.equal(a.roles.ANCHOR.identity,'Liza');
  assert.equal(a.roles.ANALYST.identity,'Lasse');
  assert.equal(formalWardrobeBrief.cast.ANCHOR.selectedFormalLookId,'5ee67ac453c34ffebd71e8eedb47b2fe');
  assert.equal(formalWardrobeBrief.cast.ANALYST.selectedFormalLookId,'de9f36c26bd841c891489a0c9d6174de');
  assert.ok(a.blockers.every(x=>/motion|lip-sync/i.test(x)));
  assert.throws(()=>auditFormalWardrobe(null,{strict:true}),/HOLD_PHOTO_AVATAR_MOTION_QA/);
});

test('only exact pre-approved Liza/Lasse public Office look and original locked voices can proceed',()=>{
  const looks={ANCHOR:look('ANCHOR',{motionQualityApproved:true}),ANALYST:look('ANALYST',{motionQualityApproved:true})};
  const good=auditFormalWardrobe(looks);
  assert.equal(good.ready,true);
  assert.equal(good.paidVideoAuthorized,false);
  const invalid=structuredClone(looks);
  invalid.ANCHOR.lookId='425825d6465b4ba4bd261d334d530430';
  assert.equal(auditFormalWardrobe(invalid).ready,false);
  const changedVoice=structuredClone(looks);
  changedVoice.ANALYST.voiceId='invalid-default-voice';
  assert.equal(auditFormalWardrobe(changedVoice).ready,false);
  const wrongGroup=structuredClone(looks);
  wrongGroup.ANCHOR.groupId='wrong';
  assert.equal(auditFormalWardrobe(wrongGroup).ready,false);
  const noMotion=structuredClone(looks);
  noMotion.ANALYST.motionQualityApproved=false;
  assert.equal(auditFormalWardrobe(noMotion).ready,false);
});
