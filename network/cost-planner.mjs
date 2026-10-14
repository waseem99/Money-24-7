/** Stocks capacity planning (USD unless explicit EUR). Pure arithmetic, no provider calls.
 * Vendor actual session minutes and TV-rights costs must be contract verified.
 */
export const DEFAULT_INPUT={days:30,broadcastMinutesPerDay:210,activeAvatarFraction:0.4,simultaneousAvatarFactor:1.2};
export const LIVEAVATAR_BUSINESS={monthlyUsd:475,monthlyCredits:6000,liteCreditsPerMinute:1,custom1080Included:1};
export const COST_BANDS={
  approvalDemoUsd:[1500,4000],platformBuildUsd:[15000,40000],
  // Broad estimate ONLY for cloud playout, synthetic TTS/voice, graphics, storage,
  // monitoring, editing and editorial staffing; excludes market data and 3rd-party rights.
  pilotMonthlyOperationsUsd:[1500,4500],
  matureMonthlyOperationsUsd:[5000,18000]
};
export function estimateAvatarDemand({days=30,broadcastMinutesPerDay=210,activeAvatarFraction=.4,simultaneousAvatarFactor=1.2}={}){
 for(const x of [days,broadcastMinutesPerDay,activeAvatarFraction,simultaneousAvatarFactor])
   if(typeof x!=='number'||!Number.isFinite(x)||x<0)throw Error('Invalid capacity assumption');
 if(activeAvatarFraction>1||simultaneousAvatarFactor<1||simultaneousAvatarFactor>4)
   throw Error('Avatar usage or concurrent-source multiplier invalid');
 const programmeMinutes=days*broadcastMinutesPerDay;
 const activeWallClockMinutes=programmeMinutes*activeAvatarFraction;
 const billableAvatarMinutes=activeWallClockMinutes*simultaneousAvatarFactor;
 return {programmeMinutes,programmeHours:programmeMinutes/60,activeWallClockMinutes,billableAvatarMinutes,
   illustrativeLiveAvatarLiteCredits:billableAvatarMinutes,
   differenceToIncludedBusinessCredits:billableAvatarMinutes-LIVEAVATAR_BUSINESS.monthlyCredits,
   note:'Cannot price extra avatar slots, overages, output rights, licence or taxes without written quote'};
}
export function monthlyCostScenario(name,inputs=DEFAULT_INPUT){
 const demand=estimateAvatarDemand(inputs);
 return {name,assumptions:inputs,demand,businessSubscriptionUsd:LIVEAVATAR_BUSINESS.monthlyUsd,
  businessCustom1080AvatarIncluded:LIVEAVATAR_BUSINESS.custom1080Included,
  additionalCharactersRequireQuotation:true,overagePriceUnknown:true,
  excludes:['market quote TV retransmission rights','news rights','extra 1080p custom avatar slots','creator/editor work','taxes'],
  goLiveApproved:false};
}
export const SCENARIOS=[
 monthlyCostScenario('Graphics-heavy / limited speaking',{...DEFAULT_INPUT,activeAvatarFraction:.2,simultaneousAvatarFactor:1.1}),
 monthlyCostScenario('Hybrid-dense AI presenting',DEFAULT_INPUT),
 monthlyCostScenario('High avatar utilisation',{...DEFAULT_INPUT,activeAvatarFraction:.75,simultaneousAvatarFactor:1.5})
];
