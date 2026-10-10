/**
 * No-spend, preview-only casting brief. Do not switch actual presenter IDs
 * or unlock paid video creation on the basis of this shortlist.
 *
 * HeyGen public look metadata inspected 2026-10-10. Provider prices sourced from
 * https://help.heygen.com/en/articles/10060327-heygen-api-pricing-explained
 * Photo Avatar IV 1080p $3/min; Studio Avatar III 1080p $1/min.
 */
import {proposedPresenters} from './budget-preflight.mjs';
const freeze=obj=>Object.freeze(obj);

const keep=freeze({
  id:'keep-liza-lasse',approvalStatus:'already approved people; video realism not approved',
  approach:'Retain faces: minimize synthetic mannerisms and frame as a factual newsroom.',
  engine:'avatar_iv',rateUSDPerMinute:3,
  anchor:freeze({
    name:'Liza',role:'Anchor',lookId:proposedPresenters.ANCHOR.lookId,
    avatarType:'photo_avatar',defaultVoiceId:proposedPresenters.ANCHOR.defaultVoiceId,
    imagePreviewUrl:'https://resource2.heygen.ai/public-avatars/Liza/paos/angles/office80_p2_a1.jpg',
    videoPreviewUrl:'https://resource2.heygen.ai/public-avatars/Liza/image_videos/office80_p2_a1.mp4',
    voiceDirection:'Warm, calmly authoritative, subtle variation and pauses; no exaggerated promo-style enthusiasm.',
    motionDirection:'Natural mouth and eye movement, restrained expression; avoid repeated smiling or constant hand movement.',
    framing:'Seated newsroom anchor; medium close-up, clean eyeline, restrained side-lighting; cut to chart during longer explanation.'
  }),
  analyst:freeze({
    name:'Lasse',role:'Analyst',lookId:proposedPresenters.ANALYST.lookId,
    avatarType:'photo_avatar',defaultVoiceId:proposedPresenters.ANALYST.defaultVoiceId,
    imagePreviewUrl:'https://resource2.heygen.ai/public-avatars/Lasse/paos/angles/office120_p3_a1.jpg',
    videoPreviewUrl:'https://resource2.heygen.ai/public-avatars/Lasse/image_videos/office120_p3_a1.mp4',
    voiceDirection:'Conversational analyst, slightly measured tempo, concise language, thoughtful natural pauses.',
    motionDirection:'Minimal head motion and small reactions; no broad pointing, looping gestures or unnecessary hand movements.',
    framing:'Slight three-quarter analyst framing; wider chart space beside the face, frequent evidence cutaways.'
  }),
  constraints:freeze([
    'All available looks for these two public identities are photo_avatar: no filmed-motion reference was found.',
    'At this time prompt tuning cannot turn these identities into recorded human video looks.',
    'Do not use custom motion on 10+ second shots without a loop/hold check.',
    'Do not fake simultaneous listener reactions using a frozen photo.'
  ])
});

const filmed=freeze({
  id:'recast-filmed-studio',approvalStatus:'unapproved face and voice change: free preview review required',
  approach:'Two different public filmed studio-avatar identities instead of photo-animated faces.',
  engine:'avatar_iii',rateUSDPerMinute:1,
  anchor:freeze({
    name:'Daphne',role:'Anchor',lookId:'Daphne_public_1',
    avatarType:'studio_avatar',defaultVoiceId:'c9c03f392dcb449593b2b282701a7a17',
    imagePreviewUrl:'https://files2.heygen.ai/avatar/v3/180f7fceee0f4548acead17f466c267c_63120/preview_target.webp',
    videoPreviewUrl:'https://files2.heygen.ai/avatar/v3/180f7fceee0f4548acead17f466c267c_63120/preview_video_target.mp4',
    voiceDirection:'Confident and calm, warm short intros, unforced endings.',
    motionDirection:'Recorded-appearance studio footage: assess authentic head/eye/gesture continuity in the free preview.',
    framing:'Grey blazer; seated desk framing, clean camera-level eyeline, mid-shot crop in a 16:9 programme panel.'
  }),
  analyst:freeze({
    name:'Bryce',role:'Analyst',lookId:'Bryce_public_1',
    avatarType:'studio_avatar',defaultVoiceId:'536fee878bef49ca96bda0c2fdb0e68b',
    imagePreviewUrl:'https://files2.heygen.ai/avatar/v3/61b1f2295f114bcf9a467a28854ae7f5_63020/preview_target.webp',
    videoPreviewUrl:'https://files2.heygen.ai/avatar/v3/61b1f2295f114bcf9a467a28854ae7f5_63020/preview_video_target.mp4',
    voiceDirection:'Distinct conversational, analytical rhythm and a less-presenter-like delivery; avoid monotony.',
    motionDirection:'Assess source-based hand/body motion in free preview; do not claim gestures are dynamically controllable.',
    framing:'Blue blazer; wider analytical panel with chart graphics, complementary camera angle to the anchor.'
  }),
  constraints:freeze([
    'This option replaces the faces/names Liza and Lasse: an explicit casting approval is required.',
    'Both selected public studio looks advertise Avatar III API only, not Avatar IV/Avatar V.',
    'Source portrait/near-square footage should be contained in a designed programme frame, not blindly cropped to 16:9.',
    'Even filmed avatars may have lip-sync or facial artefacts; human review of a paid clip is still mandatory.',
    'Standing/matting and independent silent-listener motions remain unverified.'
  ])
});
export const castingShortlist=freeze({keep,filmed});
export function realismComparison(){
  const options=Object.values(castingShortlist);
  return {asOf:'2026-10-10',zeroSpend:true,noVideoGenerated:true,paymentStatus:'BLOCKED',
    approvedCast:'Liza/Lasse photo looks (appearance only)',recommendedForFirstHumanLikePreview:'recast-filmed-studio',
    userMustApproveChangingFaces:true,
    comparisons:options.map(o=>({
      id:o.id,engine:o.engine,presenters:[o.anchor.name,o.analyst.name],
      lookIds:[o.anchor.lookId,o.analyst.lookId],avatarTypes:[o.anchor.avatarType,o.analyst.avatarType],
      rateUSDPerMinute:o.rateUSDPerMinute,
      sample45SecSpokenVideoUSD:Math.round(.75*o.rateUSDPerMinute*100)/100,
      fiveMinSpokenVideoUSD:5*o.rateUSDPerMinute,
      three20SecMaxTurnEstimateUSD:o.rateUSDPerMinute,
      notes:o.constraints
    })),
    exclusions:'Prices are estimates for speaking-avatar footage only; exclude listener/standing layers, extra calls, retakes, licensing, paid speech models, data feeds, hosting and taxes.'
  };
}
if(process.argv[1]?.endsWith('realism-casting.mjs'))console.log(JSON.stringify(realismComparison(),null,2));
