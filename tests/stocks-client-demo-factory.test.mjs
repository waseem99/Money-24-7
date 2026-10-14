import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {modelAvatarCosts} from '../network/demo/cost-model.mjs';
import {validateClientDemo} from '../network/demo/demo-policy.mjs';
import {triageViewerQuestion,authorizeViewerAnswer} from '../network/demo/interaction-policy.mjs';
import {ChannelSwitcher} from '../network/demo/channel-switcher.mjs';

const manifest=JSON.parse(readFileSync(new URL('../docs/stocks-network/client-demo-155s.manifest.json',import.meta.url),'utf8'));
const clone=v=>structuredClone(v);
test('Client presentation is an exact 155s four AI-host US-only DEMO scaffold, not client-ready film',()=>{
 const x=validateClientDemo(manifest);
 assert.equal(x.pass,true,JSON.stringify(x.failures));
 assert.equal(x.durationSeconds,155);assert.equal(x.avatarCount,4);
 assert.equal(x.ready,false);assert.equal(x.newBillableGenerationAuthorized,false);
 assert.equal(validateClientDemo(manifest,{release:true}).pass,false);
});
test('Timeline, no real talent, no false LIVE and real moving-lip evidence remain required',()=>{
 let a=clone(manifest);a.shots[4].startSec++;
 assert.equal(validateClientDemo(a).pass,false);
 a=clone(manifest);a.noRealPeopleOnScreen=false;
 assert.equal(validateClientDemo(a).pass,false);
 a=clone(manifest);a.liveClaimsAllowed=true;
 assert.equal(validateClientDemo(a).pass,false);
 a=clone(manifest);a.avatars[2].commercialRight=true;
 assert.equal(validateClientDemo(a,{release:true}).pass,false);
});
test('LiveAvatar Business 2–4 custom anchors cost snapshot is explicit and excludes licensing/staff',()=>{
 const two=modelAvatarCosts({avatarCount:2});
 const four=modelAvatarCosts({avatarCount:4});
 assert.equal(two.baseSubscription,475);
 assert.equal(two.additionalAvatarMonthly,49);
 assert.equal(two.estimatedMonthlyAvatarVendorCost,524);
 assert.equal(four.estimatedMonthlyAvatarVendorCost,622);
 assert.equal(four.includedStreamingMinutes,6000);
 assert.equal(four.avatarStreamingMinutes,3024);
 const long=modelAvatarCosts({avatarCount:4,days:30,hoursPerDay:4,activeSpeakerFraction:1,concurrentStreamFactor:2});
 assert.equal(long.avatarStreamingMinutes,14400);
 assert.equal(long.excessMinutes,8400);
 assert.equal(long.excessFees,756);
 assert.equal(long.estimatedMonthlyAvatarVendorCost,1378);
 assert.equal(four.commercialQuoteVerified,false);
});
test('BeyondPresence Scale alternative carries EUR terms and separately reviewed compatibility',()=>{
 const a=modelAvatarCosts({plan:'beyondpresence_scale'});
 assert.equal(a.currency,'EUR');assert.equal(a.baseSubscription,349);
 assert.equal(a.additionalAvatarMonthly,0);assert.equal(a.includedStreamingMinutes,4000);
 assert.equal(a.commercialQuoteVerified,false);
 assert.throws(()=>modelAvatarCosts({avatarCount:5}),RangeError);
});
test('Viewer audience requests are human moderated; no direct financial recommendations or unverified price',()=>{
 const q={text:'How might higher Treasury yields affect U.S. technology stocks?',category:'EDUCATIONAL',status:'RECEIVED'};
 assert.equal(triageViewerQuestion(q).eligibleForEditorialReview,true);
 assert.equal(authorizeViewerAnswer(q).approved,false);
 const done={...q,status:'EDITOR_APPROVED',approvedScriptSha256:'a'.repeat(64),speakerId:'MARCUS',
  originalAudioAssetId:'tts-v1',voiceAndLipSyncMediaSha256:'b'.repeat(64),broadcastRightsApproved:true};
 assert.equal(authorizeViewerAnswer(done).approved,true);
 assert.equal(authorizeViewerAnswer({...done,answerProvidesPersonalizedTradingAdvice:true}).approved,false);
 assert.equal(triageViewerQuestion({...q,personalDataPresent:true}).eligibleForEditorialReview,false);
});
test('Validated moving stream handoff is source specific and fails safe when heartbeat disappears',()=>{
 let now=100000;const switcher=new ChannelSwitcher({clock:()=>now,timeoutMs:1500});
 const src={origin:'FICTIONAL_AI',approved:true,broadcastRights:true,lipsyncApproved:true,transport:'WEBRTC',width:1920,height:1080};
 switcher.registerSource('NORA',src);
 assert.equal(switcher.take('NORA',{mode:'RECORDED',editionDate:'2026-10-14'}).accepted,true);
 assert.equal(switcher.takeDual('NORA','MARCUS',{interactionApproved:true,editionDate:'2026-10-14'}).accepted,false);
 switcher.registerSource('MARCUS',src);
 assert.equal(switcher.takeDual('NORA','MARCUS',{interactionApproved:false,editionDate:'2026-10-14'}).accepted,false);
 assert.equal(switcher.takeDual('NORA','MARCUS',{interactionApproved:true,editionDate:'2026-10-14'}).accepted,true);
 now+=2000;
 assert.equal(switcher.healthCheck().type,'SLATE');
 assert.equal(switcher.take('NORA',{mode:'LIVE',producerApproved:false}).accepted,false);
});
test('Graphics cutaways require explicit readiness; never fake a LIVE look',()=>{
 const a=new ChannelSwitcher();
 assert.equal(a.takeGraphics({headline:'SEC Filings',mode:'RECORDED',editionDate:'2026-10-14',readiness:false}).accepted,false);
 assert.equal(a.takeGraphics({headline:'SEC Filings',mode:'RECORDED',editionDate:'2026-10-14',readiness:true}).accepted,true);
 assert.equal(a.takeGraphics({headline:'Breaking',mode:'LIVE',editionDate:'2026-10-14',readiness:true}).accepted,false);
});
