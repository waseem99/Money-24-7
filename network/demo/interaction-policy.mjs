/**
 * Audience interaction safety for a financially focused AI-presented channel.
 * Models never autonomously put unreviewed prices, advice or trades onto the air.
 */
const sha=s=>typeof s==='string'&&/^[a-f0-9]{64}$/i.test(s);
const nonempty=s=>typeof s==='string'&&s.trim().length>0;
const prohibitedPatterns=[
  /\b(buy|sell|short|go all in|guaranteed profit|double your money)\s+(?:me\s+)?(?:on\s+)?(?:now|today|immediately|this stock|shares)\b/i,
  /\bmy\s+(?:tax\s+)?(?:financial\s+)?(?:portfolio|retirement|bank account)\b/i,
  /\b(insider information|nonpublic earnings|secret market tip)\b/i
];
export function triageViewerQuestion(question){
  const errors=[];
  const text=question?.text?.trim()||'';
  if(text.length<12||text.length>350)errors.push('Question length must be 12–350 chars');
  if(!['US_STOCKS','US_MACRO','US_EARNINGS','EDUCATIONAL'].includes(question?.category))
    errors.push('Question is outside approved US markets coverage');
  if(prohibitedPatterns.some(rx=>rx.test(text)))errors.push('Individualized investment/insider content must be held');
  if(question?.personalDataPresent===true||question?.unverifiedMarketPrices===true)
    errors.push('Unverified PII/prices must not be broadcast');
  return {eligibleForEditorialReview:errors.length===0,errors,
    readyToBroadcast:false,requiresHumanMarketEditor:true};
}
export function authorizeViewerAnswer(q){
  const check=triageViewerQuestion(q);
  const errors=[...check.errors];
  if(q?.status!=='EDITOR_APPROVED')errors.push('Question not approved by editor');
  if(!sha(q?.approvedScriptSha256))errors.push('Exact spoken answer not approved');
  if(!nonempty(q?.speakerId)||!['NORA','MARCUS','AVERY','JORDAN'].includes(q?.speakerId))
    errors.push('Speaker not from approved synthetic cast');
  if(q?.answerHasPriceNumbers===true && q?.sourceClaimsValidated!==true)
    errors.push('Numerical financial answer missing source validation');
  if(q?.answerProvidesPersonalizedTradingAdvice===true)
    errors.push('Personalized stock trading advice cannot be aired');
  if(!nonempty(q?.originalAudioAssetId))errors.push('AI TTS production asset missing');
  if(!sha(q?.voiceAndLipSyncMediaSha256))errors.push('No audited matching AI video/voice');
  if(q?.broadcastRightsApproved!==true)errors.push('Audience contribution rights not approved');
  return {approved:errors.length===0,errors};
}
export function fallbackForAudienceQuestion(q){
 const {eligibleForEditorialReview}=triageViewerQuestion(q);
 return eligibleForEditorialReview
  ? 'Your question has been received and is awaiting editorial review. We will return to the topic in a later update.'
  : 'We cannot address individual investment decisions. Our channel provides general U.S. markets education and verified analysis.';
}
