/**
 * User-locked Rumi/Annie and Kevin/Orson casting for the 3–5 minute pilot.
 * Historical Araj visual rejection is preserved as a negative safety test.
 * Catalog metadata was read from the user's connected HeyGen on 2026-10-10.
 * An AI-generated face's apparent ethnicity, age, nationality and accent are
 * not confirmed by the provider catalog; do not invent those attributes.
 */
import {proposedPresenters} from './budget-preflight.mjs';

export const finalCast=Object.freeze({
  status:'locked-ru-mi-and-kevin-preview-approved-performance-pending',
  accountPurchaseAuthorized:false,
  liveVideoProduced:true, // Prior Araj/Annie clip completed but was rejected; no Rumi+Annie film has been generated.
  dialogueApprovalPending:true,
  anchor:Object.freeze({
    ...proposedPresenters.ANCHOR,
    videoPreviewUrl:'https://resource2.heygen.ai/avatar/v3/efa5d7cf738a4efd84b1dac501d9aef8/half/2.2/preview_video_target.mp4',
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
    'Use locked public Starfish voice Annie for Rumi and Orson for Kevin. Never fall back to the original look-assigned default voices.',
    'No two-person fake listener loops; show active speaker or verified chart.',
    'Display the programme as AI-presented illustrative footage; do not claim live financial facts.',
    'Only the user-approved public video preview for Rumi (not HeyGen gender metadata) qualifies for an initial short paid visual test. Further paid footage and final programme need separate quality review, exact hash, account checks and spend limits.'
  ])
});

export function realismComparison(){
  const a=finalCast;
  return {
    selectedPair:['Rumi','Kevin'],rejectedPriorLook:'425825d6465b4ba4bd261d334d530430',femaleLead:true,maleAnalyst:true,reason:'Rumi and Kevin locked by user after free visual previews; voices Annie and Orson locked independently; no accepted new footage yet',
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
