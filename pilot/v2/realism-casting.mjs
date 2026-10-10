/**
 * User-delegated final casting decision; no paid video or provider credit calls.
 * Catalog metadata was read from the user's connected HeyGen on 2026-10-10.
 * An AI-generated face's apparent ethnicity, age, nationality and accent are
 * not confirmed by the provider catalog; do not invent those attributes.
 */
import {proposedPresenters} from './budget-preflight.mjs';

export const finalCast=Object.freeze({
  status:'cast-selected-for-audition',
  accountPurchaseAuthorized:false,
  liveVideoProduced:false,
  dialogueApprovalPending:true,
  anchor:Object.freeze({
    ...proposedPresenters.ANCHOR,
    videoPreviewUrl:'https://resource2.heygen.ai/avatar/v3/425825d6465b4ba4bd261d334d530430/half/2.2/preview_video_target.mp4',
    sourceWidth:720,sourceHeight:1280,
    characterDirection:'Warm, poised, clear financial-news presenter; short questions, small expressions, natural pauses, not an advertisement voice.',
    cameraDirection:'9:16 source preserved inside a branded vertical portrait window in the 16:9 show; no facial stretch or harsh widescreen crop.'
  }),
  analyst:Object.freeze({
    ...proposedPresenters.ANALYST,
    videoPreviewUrl:'https://resource2.heygen.ai/avatar/v3/c8f428c549ea448488fdb2214dbcad57/half/2.2/preview_video_target.mp4',
    sourceWidth:1280,sourceHeight:720,
    characterDirection:'Measured market analyst, concise, conversational, thoughtful speech and a distinct cadence from the anchor.',
    cameraDirection:'16:9 full landscape frame, with chart/data cutaways; no unsupported pointing or theatrical gestures.'
  }),
  auditionEngine:'avatar_iii',
  estimatedEngineUsdPerGeneratedMinute:1,
  upgradeEngine:'avatar_iv',
  estimatedUpgradeEngineUsdPerGeneratedMinute:4,
  avatarVDirectApiPriceConfirmed:false,
  sharedRules:Object.freeze([
    'No extra avatar expressions or motion prompts in the first paid audition.',
    'No voice-cloning or likeness claims; reuse the licensed public default voices if available in API.',
    'No two-person fake listener loops; show active speaker or verified chart.',
    'Display the programme as AI-presented illustrative footage; do not claim live financial facts.',
    'No paid render until exact script hash, two look/voice account reads and an explicit wallet ceiling are verified.'
  ])
});

export function realismComparison(){
  const a=finalCast;
  return {
    selectedPair:['Araj','Kevin'],femaleLead:true,maleAnalyst:true,
    type:'video-trained public digital twins',reviewRequired:['appearance and suitable diversity','American-accent suitability','lip sync and speaker movement','portrait-safe newsroom composition'],
    avatarIIICostPerMinuteUSD:1,avatarIVCostPerMinuteUSD:4,avatarVDirectApiPriceConfirmed:false,
    hypothetical45SecondIIIUSD:0.75,hypothetical45SecondIVUSD:3,
    hypotheticalFiveMinuteSpeakingIIIUSD:5,hypotheticalFiveMinuteSpeakingIVUSD:20,
    includedInQuotes:'Avatar speech video seconds only.',
    excluded:'retakes, silent listener footage, standing/matting, editorial/data licensing, hosting, other models and account-level billing',
    payAsYouGoMinTopUpUSD:5,noSpend:true,readyForPaidRelease:false
  };
}

if(process.argv[1]?.endsWith('realism-casting.mjs'))console.log(JSON.stringify(realismComparison(),null,2));
