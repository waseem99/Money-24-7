import test from 'node:test';
import assert from 'node:assert/strict';
import {STUDIO_POLICY,auditShot,auditShow} from '../pilot/stocks/r7/source-policy.mjs';

const NORA={
 id:'nora',type:'native-speaking',market:'US',live:false,role:'NORA',
 providerVideoId:'f0a2771ab6e9cfdd82306b9c4aff5e33',
 voiceSourceVideoId:'f0a2771ab6e9cfdd82306b9c4aff5e33',
 containsOldOfficeFrame:false,pose:'solo-anchored',onAirStatus:'REPLAY',clientApproved:false,
 unknownFinancialFigures:false
};
const INFO={
 id:'market-graphics',type:'voiceover-graphics',market:'US',live:false,
 audioProviderId:'existing-licensed-r4plus-recovery',onScreenTalkingFace:false,
 containsOldOfficeFrame:false,onAirStatus:'REPLAY',
 unknownFinancialFigures:false
};
test('Only explicitly approved identities can speak on camera with exact original synced audio',()=>{
 assert.equal(auditShot(NORA).pass,true);
 assert.equal(auditShot({...NORA,voiceSourceVideoId:'unrelated'}).pass,false);
 assert.equal(auditShot({...NORA,role:'OTHER'}).pass,false);
 assert.equal(auditShot({...NORA,containsOldOfficeFrame:true}).pass,false);
 assert.equal(auditShot({...NORA,pose:'shared-desk'}).pass,false);
});
test('Recorded voiceover news must cut to graphics, never a fake moving face',()=>{
 assert.equal(auditShot(INFO).pass,true);
 assert.equal(auditShot({...INFO,onScreenTalkingFace:true}).pass,false);
 assert.equal(auditShot({...INFO,containsOldOfficeFrame:true}).pass,false);
 assert.equal(auditShot({...INFO,audioProviderId:''}).pass,false);
});
test('Reject fake LIVE, non-US market and invented financial figures',()=>{
 assert.equal(auditShot({...INFO,live:true}).pass,false);
 assert.equal(auditShot({...INFO,onAirStatus:'LIVE'}).pass,false);
 assert.equal(auditShot({...INFO,market:'PK'}).pass,false);
 assert.equal(auditShot({...INFO,unknownFinancialFigures:true}).pass,false);
 assert.equal(auditShot({...INFO,randomBackgroundImageHasActorsOrText:true}).pass,false);
 assert.equal(auditShot({...INFO,reusedVoicesFromDifferentEdition:true}).pass,false);
});
test('No premature client release or paid generation on otherwise valid sources',()=>{
 assert.equal(STUDIO_POLICY.live,false);
 assert.equal(STUDIO_POLICY.autoPaidMediaGeneration,false);
 assert.equal(auditShot({...NORA,clientApproved:true}).pass,false);
 const s=auditShow([NORA,INFO]);
 assert.equal(s.pass,true);assert.equal(s.releaseApproved,false);assert.equal(s.newPaidMediaAuthorized,false);
});
