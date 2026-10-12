import test from 'node:test';
import assert from 'node:assert/strict';
import {MOTION_REVIEW,VIDEO_TRAINED_CANDIDATES,MULTI_ANGLE_CANDIDATES,paidGenerationRelease} from '../pilot/stocks/motion-qa.mjs';
import {auditStocks,buildMotionProof} from '../pilot/stocks/preflight.mjs';

test('human rejected Nora IV cannot release another paid clip',()=>{
  assert.equal(MOTION_REVIEW.qualityGate,'FAILED_REALISM');
  assert.equal(MOTION_REVIEW.rejected.expressiveness,'low');
  assert.equal(MOTION_REVIEW.rejected.videoId,'df8eba2ec9c124e500c2ee0b11e1de3e');
  assert.equal(MOTION_REVIEW.rejected.humanApproved,false);
  assert.equal(buildMotionProof().paidReleaseAllowed,false);
  const audit=auditStocks();
  assert.equal(audit.paidRelease.allowed,false);
  assert.equal(audit.paidRequestsMade,0);
});

test('prior Avatar III footage is not falsely claimed to be a controlled comparison',()=>{
  assert.equal(MOTION_REVIEW.comparison.olderAvatarIII.videoId,'9180a425a289d33d75c4ef82178ce9a8');
  assert.equal(MOTION_REVIEW.comparison.olderAvatarIII.sameScript,false);
  assert.equal(MOTION_REVIEW.comparison.lizaCatalogue.photoLooks,28);
  assert.equal(MOTION_REVIEW.comparison.lizaCatalogue.videoTrainedLooks,0);
  assert.match(MOTION_REVIEW.comparison.limitation,/not a controlled engine A\/B/);
});

test('video-trained alternative research does not silently recast the approved presenters',()=>{
  assert.equal(VIDEO_TRAINED_CANDIDATES.length,4);
  assert.ok(VIDEO_TRAINED_CANDIDATES.every(c=>c.type==='studio_avatar'&&!c.approved&&c.previewVideoUrl.startsWith('https://')));
  assert.ok(VIDEO_TRAINED_CANDIDATES.every(c=>c.engine==='avatar_iii'));
  assert.equal(paidGenerationRelease().allowed,false);
  assert.equal(paidGenerationRelease({candidateLookId:'Freja_public_6',userApprovedReplacement:true}).allowed,false);
  assert.equal(paidGenerationRelease({candidateLookId:'5ee67ac453c34ffebd71e8eedb47b2fe',userApprovedReplacement:true,qualityEvidenceReviewed:true,validatedAvailableAPIUSD:5}).allowed,false);
});


test('existing studio alternatives provide matching seated and standing camera angles without auto recasting',()=>{
  assert.equal(MULTI_ANGLE_CANDIDATES.length,8);
  const females=MULTI_ANGLE_CANDIDATES.filter(c=>c.role.startsWith('female'));
  const males=MULTI_ANGLE_CANDIDATES.filter(c=>c.role.startsWith('male'));
  assert.equal(females.length,4);
  assert.equal(males.length,4);
  assert.equal(new Set(females.map(c=>c.groupId)).size,1);
  assert.equal(new Set(males.map(c=>c.groupId)).size,1);
  assert.notEqual(females[0].groupId,males[0].groupId);
  assert.ok(MULTI_ANGLE_CANDIDATES.every(c=>c.type==='studio_avatar' && !c.approved && c.preferredOrientation==='landscape'));
  assert.ok(MULTI_ANGLE_CANDIDATES.every(c=>c.supportedEngines.includes('avatar_iii')));
  assert.equal(paidGenerationRelease({candidateLookId:'Caroline_Business_Sitting_Front_public'}).allowed,false);
});
