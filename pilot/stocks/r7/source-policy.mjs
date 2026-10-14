// Stocks R7 fail-closed approval policy for selecting existing media for broadcast.
// Pure JS: no provider API, billing, filesystem writes or background tasks.
// A valid 'voiceover' segment has NO visible speaking face to mismatch the audio.
export const STUDIO_POLICY=Object.freeze({
  network:'STOCKS',scope:'US_MARKETS_ONLY',edition:'2026-10-12-early-session',
  live:false,requiresHumanReview:true,autoPaidMediaGeneration:false,
  approvedPresenters:Object.freeze({
    NORA:'f0a2771ab6e9cfdd82306b9c4aff5e33',
    MARCUS:'d8808e9850b76dd38d550d5b5f0ccaf7'
  }),
  sourceTypes:Object.freeze(['native-speaking','voiceover-graphics','animated-ident']),
  approvalLabel:'RECORDED EDITORIAL PILOT'
});
const allowedMarkets=new Set(['US','US_MARKETS']);
export function auditShot(shot){
 const issues=[];
 if(!shot||typeof shot!=='object')return {pass:false,issues:['Missing shot']};
 if(!STUDIO_POLICY.sourceTypes.includes(shot.type))issues.push('Unrecognized source kind');
 if(!allowedMarkets.has(shot.market))issues.push('Non-US market');
 if(shot.live===true||/\bLIVE\b/i.test(shot.onAirStatus||''))issues.push('False LIVE badge');
 if(shot.reusedVoicesFromDifferentEdition)issues.push('Cross-edition narration mismatch');
 if(shot.unknownFinancialFigures)issues.push('Generated or unproven financial figures');
 if(shot.randomBackgroundImageHasActorsOrText)issues.push('Unapproved baked-in actor or graphics');
 if(shot.type==='native-speaking'){
   if(!Object.hasOwn(STUDIO_POLICY.approvedPresenters,shot.role))issues.push('Unapproved speaker identity');
   if(shot.providerVideoId!==STUDIO_POLICY.approvedPresenters[shot.role])issues.push('Original face/voice source mismatch');
   if(shot.voiceSourceVideoId!==shot.providerVideoId)issues.push('Visible lip sync does not match source audio');
   if(shot.containsOldOfficeFrame===true)issues.push('Unwanted original office baked into on-air video');
   if(shot.pose==='shared-desk'&&!shot.sameSceneActingCertified)issues.push('Fake shared desk: unverified geometry/listening');
 }
 if(shot.type==='voiceover-graphics'){
   if(shot.onScreenTalkingFace===true)issues.push('Voiceover graphics cannot use unmatched moving faces');
   if(shot.containsOldOfficeFrame===true)issues.push('Voiceover still shows legacy office');
   if(!shot.audioProviderId)issues.push('No verified recorded voice');
 }
 if(shot.type==='animated-ident'&&shot.hasTalkingFace)issues.push('Ident may not falsely show a speaking anchor');
 if(shot.clientApproved===true && !shot.humanCreativeReviewSha)issues.push('Release label has no immutable human approval');
 return {pass:issues.length===0,issues};
}
export function auditShow(shots){
 const errors=[];
 if(!Array.isArray(shots)||!shots.length)return {pass:false,errors:['Empty shot list']};
 const ids=new Set();
 for(const s of shots){
   if(!s.id||ids.has(s.id))errors.push('Duplicate or missing shot ID');
   ids.add(s.id);
   const check=auditShot(s);
   for(const problem of check.issues)errors.push(s.id+': '+problem);
 }
 return {pass:errors.length===0,errors,releaseApproved:false,newPaidMediaAuthorized:false};
}
