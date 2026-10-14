/**
 * STOCKS illustrative provider fees, observed 2026-10-14.
 * Rates here are VERSIONED ASSUMPTIONS, never billing authorizations or quotes.
 * LiveAvatar Business official: https://www.liveavatar.com/ ($475, 6000 LITE min, $0.09/min overage)
 * LiveAvatar additional slot listed by HeyGen: $49/mo, exact 1080p eligibility confirm.
 * BeyondPresence Scale official: https://www.beyondpresence.ai/pricing (€349, 4000 speech-to-video min, €0.0875/min overage, 10 custom)
 */
export const PUBLIC_PLAN_SNAPSHOTS=Object.freeze({
  liveavatar_business:Object.freeze({
    provider:'LiveAvatar',label:'Business / LITE',currency:'USD',
    monthlyBase:475,includedAvatarMinutes:6000,extraMinute:0.09,
    includedCustomAvatars:1,additionalAvatarMonthly:49,
    maxSessionMinutes:60,
    imageToAvatarPublished:true,avatarResolution:'1080p',
    source:'https://www.liveavatar.com/',
    caveat:'Extra custom 1080p slot eligibility/broadcast licence not yet contract-verified.'
  }),
  beyondpresence_scale:Object.freeze({
    provider:'Beyond Presence',label:'Scale / Speech-to-video',currency:'EUR',
    monthlyBase:349,includedAvatarMinutes:4000,extraMinute:0.0875,
    includedCustomAvatars:10,additionalAvatarMonthly:0,
    maxSessionMinutes:null,
    imageToAvatarPublished:true,avatarResolution:'1080p',
    source:'https://www.beyondpresence.ai/pricing',
    caveat:'Image-to-avatar and 1080p eligible; verify exact fictional identity, export and TV rights.'
  })
});
export function modelAvatarCosts({
  plan='liveavatar_business',days=30,hoursPerDay=3.5,
  activeSpeakerFraction=0.4,concurrentStreamFactor=1.2,avatarCount=4
}={}){
  const p=PUBLIC_PLAN_SNAPSHOTS[plan];
  if(!p)throw new Error('Unknown provider/plan');
  const fail = msg=>{throw new RangeError(msg)};
  if(!Number.isInteger(days)||days<1||days>31)fail('days 1–31');
  if(typeof hoursPerDay!=='number'||hoursPerDay<=0||hoursPerDay>24)fail('hoursPerDay 0–24');
  if(typeof activeSpeakerFraction!=='number'||activeSpeakerFraction<0||activeSpeakerFraction>1)
    fail('activeSpeakerFraction 0–1');
  if(typeof concurrentStreamFactor!=='number'||concurrentStreamFactor<1||concurrentStreamFactor>avatarCount)
    fail('concurrentStreamFactor 1–avatarCount');
  if(!Number.isInteger(avatarCount)||avatarCount<2||avatarCount>4)fail('avatarCount 2–4');
  const onAirMinutes=days*hoursPerDay*60;
  const avatarStreamingMinutes=Math.ceil(onAirMinutes*activeSpeakerFraction*concurrentStreamFactor);
  const excessMinutes=Math.max(0,avatarStreamingMinutes-p.includedAvatarMinutes);
  const additionalAvatars=Math.max(0,avatarCount-p.includedCustomAvatars);
  const additionalAvatarMonthly=additionalAvatars*p.additionalAvatarMonthly;
  const excessFees=Math.round(excessMinutes*p.extraMinute*100)/100;
  const total=Math.round((p.monthlyBase+additionalAvatarMonthly+excessFees)*100)/100;
  return {plan,provider:p.provider,avatarCount,currency:p.currency,
    airtimeMinutes:onAirMinutes,avatarStreamingMinutes,
    includedStreamingMinutes:p.includedAvatarMinutes,excessMinutes,
    baseSubscription:p.monthlyBase,additionalAvatarMonthly,
    excessFees,estimatedMonthlyAvatarVendorCost:total,
    includesTts:false,includesLiveMarketLicensing:false,includesBroadcastPlayout:false,
    includesEditorialStaff:false,includesTaxes:false,
    commercialQuoteVerified:false,
    source:p.source,caveat:p.caveat};
}
