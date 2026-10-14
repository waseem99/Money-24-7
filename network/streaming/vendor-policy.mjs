/**
 * Vendor-neutral safety rules for a PRIVATE LiveAvatar LITE integration proof.
 * This module is offline and never opens a paid session.
 */
export const STOCKS_STREAM_GATE = Object.freeze({
  provider: 'liveavatar',
  mode: 'LITE',
  status: 'PREPRODUCTION',
  market: 'US_MARKETS_ONLY',
  talent: 'ORIGINAL_FICTIONAL_AI_ONLY',
  operatorOnly: true,
  startAutomatically: false,
  defaultMaximumSeconds: 60,
  absoluteMaximumSeconds: 90,
  perViewerAvatarSessionsAllowed: false,
  replayClaimsLive: false,
  publishToTamasha: false,
  paidGenerationAuthorized: false,
});
export const ROLES = Object.freeze(['NORA', 'MARCUS']);
export const FREE_PRESET_TRIAL=Object.freeze({
  NORA:'Amina',MARCUS:'Dexter',
  maxSimultaneousSources:1,maxSeconds:45,
  watermarked:true,publicBroadcastApproved:false
});

export function sessionPreflight(input) {
  const errors=[];
  if (!input || typeof input !== 'object') return {pass:false,errors:['Session preflight missing']};
  if (!ROLES.includes(input.role)) errors.push('Only approved Nora or Marcus role may start');
  if (input.mode !== 'LITE') errors.push('LITE test only; FULL conversational mode is not authorized');
  const freePreset=input.sourceKind==='PROVIDER_PUBLIC_PRESET_FOR_PRIVATE_FREE_TRIAL';
  if (!freePreset && input.sourceKind !== 'ORIGINAL_FICTIONAL_CUSTOM_AVATAR')
    errors.push('Unverified source; no human or office avatar may enter test');
  if (freePreset && (!input.presetTrial || input.presetName!==FREE_PRESET_TRIAL[input.role]))
    errors.push('Free preset must be Amina for Nora stand-in or Dexter for Marcus stand-in');
  if (freePreset && (input.maximumSeconds>FREE_PRESET_TRIAL.maxSeconds ||
      input.activeOtherSessions>0 || input.rendererOnAirStatus!=='TEST ONLY'))
    errors.push('Free plan: max one active source, short watermarked PRIVATE test only');
  if (input.sourceApproved !== true) errors.push('Original fictional identity approval missing');
  if (input.providerEligibilityVerified !== true) errors.push('Provider avatar eligibility not verified');
  if (input.commercialTestRightsApproved !== true) errors.push('Custom avatar/voice test licence not confirmed');
  if (input.operatorSession !== true || input.viewerDriven === true) errors.push('Only one private producer session; no per-viewer paid session');
  if (input.explicitCreditApproval !== true) errors.push('Paid session needs explicit approval');
  if (input.manualStart !== true) errors.push('No automatic startup');
  if (typeof input.sessionToken !== 'string' || input.sessionToken.trim().length<24)
    errors.push('Existing authorized session token required; no token will be minted here');
  if (!Number.isInteger(input.maximumSeconds) || input.maximumSeconds < 5
    || input.maximumSeconds > STOCKS_STREAM_GATE.absoluteMaximumSeconds)
    errors.push('Invalid capped session duration');
  if (input.isCurrentNews === true && input.verifiedUSMarketClaim !== true)
    errors.push('No unverified breaking U.S. financial claim');
  if (input.rendererOnAirStatus === 'LIVE' && input.realTransmissionConfirmed !== true)
    errors.push('No fake LIVE broadcast status');
  return {pass:errors.length===0,errors,approvedForPublicBroadcast:false,
    sourceCategory:freePreset?'TEMPORARY_WATERMARKED_PRESET_TEST':'APPROVED_CUSTOM_SOURCE',
    noAutomaticPaidSession:true,maximumSeconds:input.maximumSeconds};
}

export function qualityGate(input) {
  const issues=[];
  if (!input || typeof input!=='object') return {pass:false,issues:['Missing streaming QA']};
  for (const k of ['originalFaceStable','actualLipsyncVerified','realMovingFootage',
    'backgroundKeyClean','studioFramingApproved','audioVideoAligned',
    'sourceVoiceApproved','sourceRightsApproved','recordingReviewed']) {
      if(input[k]!==true)issues.push('Missing '+k);
  }
  if(input.fixedOfficeBackgroundVisible===true)issues.push('Old office background leaked');
  if(input.generatedFinancialFiguresVisible===true)issues.push('Illustrative numbers used as market data');
  if(input.frozenPicturePretendsToSpeak===true)issues.push('Static image used instead of speaking avatar');
  if(input.falseSharedDeskInteractions===true)issues.push('Unproven physical anchor interactions');
  return {pass:issues.length===0,issues,publishApproved:false};
}

export function latencySummary(samples) {
  const n=Array.isArray(samples)?samples.filter(x=>Number.isFinite(x)&&x>=0):[];
  if(!n.length)return {count:0,p50:null,p95:null};
  n.sort((a,b)=>a-b);
  const pct=p=>n[Math.min(n.length-1,Math.max(0,Math.ceil((p/100)*n.length)-1))];
  return {count:n.length,p50:pct(50),p95:pct(95)};
}
