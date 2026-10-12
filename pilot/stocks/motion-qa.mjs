/**
 * Human-motion acceptance record and strictly read-only candidate shortlist.
 * No provider calls, billed generations, AI face replacement, or background processing.
 *
 * User explicitly rejected Nora's Avatar IV 720p on 2026-10-12.
 * Original approved Liza/Lasse public Photo Avatars remain LOCKED as historical identity references.
 * Alternative public studio avatars are research candidates, NOT approved replacements.
 */
export const MOTION_REVIEW=Object.freeze({
  reviewDate:'2026-10-12',
  qualityGate:'FAILED_REALISM',
  userFeedback:'Expression exaggerated and speech looks forced; not convincingly natural',
  renderPermission:'BLOCKED',
  newPaidRequestsAuthorized:0,
  retainedBalanceStatus:'User reports +$5 Pay-As-You-Go top-up; available API balance not independently readable',
  rejected:{
    role:'NORA',
    avatarId:'5ee67ac453c34ffebd71e8eedb47b2fe',
    engine:'avatar_iv',
    expressiveness:'low',
    videoId:'df8eba2ec9c124e500c2ee0b11e1de3e',
    resolution:'720p',
    durationSeconds:10.8931,
    humanApproved:false
  },
  comparison:{
    olderAvatarIII:{
      videoId:'9180a425a289d33d75c4ef82178ce9a8',
      engine:'avatar_iii',
      resolution:'1080p',
      durationSeconds:8.12408,
      samePhotoLookAndVoice:true,
      sameScript:false,
      source:'GitHub workflow artifact 11730311697; existing 17.008s Liza/Lasse composite inspected',
      finding:'Visible broad hand gestures and an office-style source background; not a passed naturalness benchmark'
    },
    limitation:'The rejected IV source has been validated by provider metadata and human reviewer, but not independently decoded frame-by-frame in this audit. The two clips use different scripts: not a controlled engine A/B.',
    lizaCatalogue:{totalLooks:28,photoLooks:28,videoTrainedLooks:0}
  }
});
export const VIDEO_TRAINED_CANDIDATES=Object.freeze([
  {role:'female-anchor',name:'Freja in Grey blazer',lookId:'Freja_public_6',type:'studio_avatar',engine:'avatar_iii',preferredOrientation:'landscape',previewVideoUrl:'https://files2.heygen.ai/avatar/v3/c85726249c114102ba83a6393b1b156d_62620/preview_video_target.mp4',approved:false},
  {role:'male-analyst',name:'Bryce in Grey blazer',lookId:'Bryce_public_2',type:'studio_avatar',engine:'avatar_iii',preferredOrientation:'landscape',previewVideoUrl:'https://files2.heygen.ai/avatar/v3/90f19ae257644acdbc7f814d60a3adc3_63030/preview_video_target.mp4',approved:false},
  {role:'female-anchor-alt',name:'Daphne in Grey blazer',lookId:'Daphne_public_1',type:'studio_avatar',engine:'avatar_iii',preferredOrientation:'portrait',previewVideoUrl:'https://files2.heygen.ai/avatar/v3/180f7fceee0f4548acead17f466c267c_63120/preview_video_target.mp4',approved:false},
  {role:'male-analyst-alt',name:'Albert in Blue suit',lookId:'Albert_public_1',type:'studio_avatar',engine:'avatar_iii',preferredOrientation:'landscape',previewVideoUrl:'https://files2.heygen.ai/avatar/v3/57a701a3f0af49e6bda8cf47f1f7c7df_62550/preview_video_target.mp4',approved:false}
]);
export function paidGenerationRelease({candidateLookId=null,userApprovedReplacement=false,validatedAvailableAPIUSD=null,qualityEvidenceReviewed=false}={}){
 const blockers=[];
 if(!userApprovedReplacement)blockers.push('User has not approved a new presenter face; preserve Liza and Lasse');
 if(!candidateLookId||!VIDEO_TRAINED_CANDIDATES.some(c=>c.lookId===candidateLookId))blockers.push('No supported studio-avatar alternative has been selected');
 if(!qualityEvidenceReviewed)blockers.push('Motion preview / on-air suitability not approved');
 if(validatedAvailableAPIUSD===null)blockers.push('Direct HeyGen Pay-As-You-Go balance unreadable; user top-up not yet reconciled through provider');
 if(candidateLookId===MOTION_REVIEW.rejected.avatarId)blockers.push('Rejected Photo Avatar IV look must not be paid again');
 return {allowed:blockers.length===0,blockers,estimatedChargeUSD:null,submittedJobs:0};
}
if(process.argv[1]?.endsWith('/motion-qa.mjs')){
 const summary={status:MOTION_REVIEW.qualityGate,candidates:VIDEO_TRAINED_CANDIDATES.map(x=>({name:x.name,lookId:x.lookId,approved:x.approved})),paidRelease:paidGenerationRelease()};
 process.stdout.write(JSON.stringify(summary,null,2)+'\n');
}
