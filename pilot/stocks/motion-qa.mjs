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
// Same licensed video-trained identity across front / side and seated / standing shots.
// These are unapproved casting options, not approved new presenter faces.
export const MULTI_ANGLE_CANDIDATES=Object.freeze([
  {role:'female-anchor-sitting-front',name:'Caroline Business Sitting Front',lookId:'Caroline_Business_Sitting_Front_public',groupId:'977b1ab85dba4eefb159a6072677effd',type:'studio_avatar',preferredOrientation:'landscape',engine:'avatar_iii',supportedEngines:['avatar_v','avatar_iv','avatar_iii'],previewVideoUrl:'https://files2.heygen.ai/avatar/v3/75e4f326918c45028fe06bc9dc0c45da_56520/preview_video_talk_2.mp4',approved:false},
  {role:'male-analyst-sitting-front',name:'Brandon Business Sitting Front',lookId:'Brandon_Business_Sitting_Front_public',groupId:'d08c85e6cff84d78b6dc41d83a2eccce',type:'studio_avatar',preferredOrientation:'landscape',engine:'avatar_iii',supportedEngines:['avatar_v','avatar_iv','avatar_iii'],previewVideoUrl:'https://files2.heygen.ai/avatar/v3/4fd0dacf93e74e9ea1c8f9029bf16b25_56470/preview_video_talk_1.mp4',approved:false},
  {role:'female-anchor-standing-front',name:'Caroline Business Standing Front',lookId:'Caroline_Business_Standing_Front_public',groupId:'977b1ab85dba4eefb159a6072677effd',type:'studio_avatar',preferredOrientation:'landscape',engine:'avatar_iii',supportedEngines:['avatar_v','avatar_iv','avatar_iii'],previewVideoUrl:'https://files2.heygen.ai/avatar/v3/0b2e86f53a914241bed4a852044c1a07_56520/preview_video_talk_3.mp4',approved:false},
  {role:'male-analyst-standing-front',name:'Brandon Business Standing Front',lookId:'Brandon_Business_Standing_Front_public',groupId:'d08c85e6cff84d78b6dc41d83a2eccce',type:'studio_avatar',preferredOrientation:'landscape',engine:'avatar_iii',supportedEngines:['avatar_v','avatar_iv','avatar_iii'],previewVideoUrl:'https://files2.heygen.ai/avatar/v3/acdd45e9119c4c068e9685cdf93c687b_56470/preview_video_target.mp4',approved:false},
  {role:'female-anchor-sitting-side',name:'Caroline Business Sitting Side',lookId:'Caroline_Business_Sitting_Side_public',groupId:'977b1ab85dba4eefb159a6072677effd',type:'studio_avatar',preferredOrientation:'landscape',engine:'avatar_iii',supportedEngines:['avatar_v','avatar_iv','avatar_iii'],previewVideoUrl:'https://files2.heygen.ai/avatar/v3/888acf282a044ad5a782bae81896a2e5_56500/preview_video_target.mp4',approved:false},
  {role:'male-analyst-sitting-side',name:'Brandon Business Sitting Side',lookId:'Brandon_Business_Sitting_Side_public',groupId:'d08c85e6cff84d78b6dc41d83a2eccce',type:'studio_avatar',preferredOrientation:'landscape',engine:'avatar_iii',supportedEngines:['avatar_v','avatar_iv','avatar_iii'],previewVideoUrl:'https://files2.heygen.ai/avatar/v3/73bd9bd18fc54d569badd2d51e87636c_56430/preview_video_target.mp4',approved:false},
  {role:'female-anchor-standing-side',name:'Caroline Business Standing Side',lookId:'Caroline_Business_Standing_Side_public',groupId:'977b1ab85dba4eefb159a6072677effd',type:'studio_avatar',preferredOrientation:'landscape',engine:'avatar_iii',supportedEngines:['avatar_v','avatar_iv','avatar_iii'],previewVideoUrl:'https://files2.heygen.ai/avatar/v3/f3fcaa4f09e7472a852114b590fa2a8d_56530/preview_video_talk_1.mp4',approved:false},
  {role:'male-analyst-standing-side',name:'Brandon Business Standing Side',lookId:'Brandon_Business_Standing_Side_public',groupId:'d08c85e6cff84d78b6dc41d83a2eccce',type:'studio_avatar',preferredOrientation:'landscape',engine:'avatar_iii',supportedEngines:['avatar_v','avatar_iv','avatar_iii'],previewVideoUrl:'https://files2.heygen.ai/avatar/v3/2b501d62780243a78391bcd935f42a28_56480/preview_video_target.mp4',approved:false}
]);

export function paidGenerationRelease({candidateLookId=null,userApprovedReplacement=false,validatedAvailableAPIUSD=null,qualityEvidenceReviewed=false}={}){
 const blockers=[];
 if(!userApprovedReplacement)blockers.push('User has not approved a new presenter face; preserve Liza and Lasse');
 if(!candidateLookId||![...VIDEO_TRAINED_CANDIDATES,...MULTI_ANGLE_CANDIDATES].some(c=>c.lookId===candidateLookId))blockers.push('No supported studio-avatar alternative has been selected');
 if(!qualityEvidenceReviewed)blockers.push('Motion preview / on-air suitability not approved');
 if(validatedAvailableAPIUSD===null)blockers.push('Direct HeyGen Pay-As-You-Go balance unreadable; user top-up not yet reconciled through provider');
 if(candidateLookId===MOTION_REVIEW.rejected.avatarId)blockers.push('Rejected Photo Avatar IV look must not be paid again');
 return {allowed:blockers.length===0,blockers,estimatedChargeUSD:null,submittedJobs:0};
}
if(process.argv[1]?.endsWith('/motion-qa.mjs')){
 const summary={status:MOTION_REVIEW.qualityGate,candidates:VIDEO_TRAINED_CANDIDATES.map(x=>({name:x.name,lookId:x.lookId,approved:x.approved})),paidRelease:paidGenerationRelease()};
 process.stdout.write(JSON.stringify(summary,null,2)+'\n');
}
