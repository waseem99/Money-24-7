/**
 * Final user-specified Liza and Lasse casting.
 * The Office 6 / Office 3 looks are PREEXISTING public Photo Avatars.
 * Never conflate outfit suitability with mouth/eye/gesture realism.
 * No paid provider calls here.
 */
import {proposedPresenters} from './budget-preflight.mjs';

export const finalCast=Object.freeze({
  status:'liza-and-lasse-locked-formal-outfits-previewed-motion-qa-pending',
  accountPurchaseAuthorized:false,
  selectedCastVideoProduced:false,
  historicOtherCastVideosProduced:true,
  reviewRequired:true,
  anchor:Object.freeze({
    ...proposedPresenters.ANCHOR,
    videoPreviewUrl:'https://resource2.heygen.ai/public-avatars/Liza/image_videos/office83_p3_a1.mp4',
    imagePreviewUrl:'https://resource2.heygen.ai/public-avatars/Liza/paos/angles/office83_p3_a1.jpg',
    sourceWidth:1920,sourceHeight:1080,
    characterDirection:'Credible professional female financial-news lead wearing the existing grey blazer and white blouse. Annie Lifelike voice. Warm but restrained expression, measured pace, no forced gestures.',
    cameraDirection:'16:9 Office 6 source; compose in actual SIGNAL V2 anchor panel and render legitimate ticker/headline overlays. Do not imply source is a filmed digital twin.'
  }),
  analyst:Object.freeze({
    ...proposedPresenters.ANALYST,
    videoPreviewUrl:'https://resource2.heygen.ai/public-avatars/Lasse/image_videos/office120_p3_a1.mp4',
    imagePreviewUrl:'https://resource2.heygen.ai/public-avatars/Lasse/paos/angles/office120_p3_a1.jpg',
    sourceWidth:1920,sourceHeight:1080,
    characterDirection:'Mature male markets analyst wearing pre-existing grey business blazer and blue shirt; Orson Firm & Measured voice. Thoughtful, natural cadence.',
    cameraDirection:'16:9 Office 3 source with blurred corporate background; integrate in professional SIGNAL data board, never fake offscreen reactions.'
  }),
  auditionEngine:'avatar_iii',
  photoIIIUsdPerGeneratedMinute:1,
  premiumTrialEngine:'avatar_iv',
  photoIVUsdPerGeneratedMinute:3,
  sharedRules:Object.freeze([
    'The user explicitly locked Liza and Lasse. Do not silently substitute Rumi, Kevin, Araj or other faces.',
    'Annie and Orson are the last user-approved voices, retained unless explicitly changed.',
    'Never use unapproved default voices simply because the public avatar look advertises one.',
    'Already-formal public Office 6 and Office 3 images are not evidence of human-quality movement; first render samples must be reviewed.',
    'No new paid render without same-key authenticated look and Starfish voice availability, immutable script+cast hash and budget.',
    'Full film must use existing SIGNAL V2 logo/header/headline/lower-third/ticker/charts and correct simulated-data disclosure.'
  ])
});

export function realismComparison(){
  const {anchor,analyst}=finalCast;
  return {
    selectedPair:[anchor.name,analyst.name],femaleLead:true,maleAnalyst:true,
    selectedVoicePair:[anchor.auditionVoiceName,analyst.auditionVoiceName],
    type:'pre-existing public HeyGen Photo Avatars wearing photographed business-formal outfits',
    wardrobeApproved:anchor.wardrobeApprovalStatus==='approved'&&analyst.wardrobeApprovalStatus==='approved',
    motionQualityApproved:false,
    reviewRequired:['real speaker facial naturalness','eye movement and blinking','Annie/Orson lip sync','16:9 Signal graphics composition and transitions'],
    avatarIIIPricePerMinuteUSD:1,avatarIVPhotoPricePerMinuteUSD:3,
    fortyFiveSecondIIIEstimateUSD:.75,
    threeMinuteSpeakingIIIEstimateUSD:3,
    durationAndProviderChargesNotGuaranteed:true,
    noAutomaticRetakes:true,readyForFullLengthRelease:false
  };
}
if(process.argv[1]?.endsWith('realism-casting.mjs'))console.log(JSON.stringify(realismComparison(),null,2));
