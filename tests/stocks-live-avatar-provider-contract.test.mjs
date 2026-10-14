import test from 'node:test';import assert from 'node:assert/strict';import {validatePresenterSource,validateLiveSession,auditStudioFrame} from '../network/live-avatar/provider-contract.mjs';
test('No paid session or per-viewer avatar allocation can start',()=>{
const request={mode:'LITE',sharedChannel:true,role:'NORA',durationSeconds:60,scriptApproved:true,voiceApproved:true,costCeilingApproved:true,providerRightsApproved:true,customAvatarApproved:true,sessionIdempotencyKey:'a'.repeat(64)};
assert.ok(validateLiveSession(request).includes('Paid LiveAvatar generation DISABLED'));
assert.deepEqual(validateLiveSession(request,{paidEnabled:true}),[]);
assert.ok(validateLiveSession({...request,oneSessionPerViewer:true},{paidEnabled:true}).length);
});
test('Only source-approved original fictional high-res portraits are eligible',()=>{
const a={role:'NORA',origin:'FICTIONAL_AI',realPersonLikeness:false,imageIdentityApproved:true,portraitHash:'b'.repeat(64),singleFace:true,straightOn:true,neutralMouth:true,width:1920,height:1080,avatarAssetApproved:true,broadcastRightsApproved:true};
assert.deepEqual(validatePresenterSource(a),[]);
assert.ok(validatePresenterSource({...a,realPersonLikeness:true}).length);
assert.ok(validatePresenterSource({...a,avatarAssetApproved:false}).length);
assert.ok(validatePresenterSource({...a,singleFace:false}).length);
});
test('Do not present incorrect studio frames',()=>{
const frame={usOnly:true,bugCount:1,bugLocation:'TOP_LEFT',presenterVisible:true,presenterRole:'MARCUS',sourceFrameLipAudioMatched:true,providerGreenscreenEnabled:true,chromaKeyReviewPassed:true,recorded:true,onAirStatus:'REPLAY'};
assert.deepEqual(auditStudioFrame(frame),[]);
assert.ok(auditStudioFrame({...frame,hasImaginedPrices:true}).length);
assert.ok(auditStudioFrame({...frame,recorded:true,onAirStatus:'LIVE'}).length);
assert.ok(auditStudioFrame({...frame,chromaKeyReviewPassed:false}).length);
});
