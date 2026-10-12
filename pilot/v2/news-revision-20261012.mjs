/**
 * October 12, 2026 verified financial current-affairs editorial patch.
 * The programme MUST disclose that it was prepared, not live.
 * Four new licensed spoken avatar clips; all other film material is reusable.
 * No provider payments, network access, or automatic retries here.
 */
export const storyV2=Object.freeze({
  id:'signal-markets-at-a-crossroads-20261012-r2',
  issueDate:'2026-10-12',
  display:'AS OF 12 OCT 2026',
  topic:'The Earnings–Rates–Energy Squeeze',
  masterHeadline:'MARKETS AT A CROSSROADS',
  subhead:'Big earnings. High yields. Costly energy.',
  speechSourceType:'attributed-current-affairs-editorial',
  noLiveFeeds:true,
  noInvestmentAdvice:true,
  displayCaveat:'REPORTED SNAPSHOT · 12 OCT 2026 · NOT LIVE PRICES',
  verifiedFacts:[
    {id:'fed',label:'FED POLICY RANGE',value:'3.75–4.00%',asOf:'16 SEP 2026',source:'Federal Reserve',url:'https://www.federalreserve.gov/newsevents/pressreleases/monetary20260916a.htm',
      explanation:'Federal Reserve FOMC voted on September 16 to raise the target range by 0.25 percentage points to 3¾–4%.'},
    {id:'rates',label:'US 10Y TREASURY YIELD',value:'~5.24%',asOf:'REPORTED 9 OCT',source:'Reuters',url:'https://www.reuters.com/business/wall-st-week-ahead-bank-earnings-cpi-headline-busy-markets-week-sp-500-hovers-2026-10-09/',
      explanation:'Reuters week-ahead reported 10-year Treasury yields near 5.24%; an historical reported level, NOT a live quote.'},
    {id:'oil',label:'BRENT CRUDE',value:'>$100 / BBL',asOf:'REPORTED 12 OCT',source:'Reuters',url:'https://www.reuters.com/world/china/global-markets-wrapup-1-2026-10-12/',
      explanation:'Brent crude was reported above $100 a barrel October 12; price can change after article publication.'},
    {id:'cpi',label:'US CPI RELEASE',value:'WED · 14 OCT',asOf:'SCHEDULED',source:'US Bureau of Labor Statistics',url:'https://www.bls.gov/schedule/2026/10_sched_list.htm',
      explanation:'September 2026 CPI scheduled October 14, 2026 at 8:30 a.m. ET; not yet published on October 12.'},
    {id:'bank',label:'BANK EARNINGS',value:'THIS WEEK',asOf:'OCT 12–16',source:'Reuters',url:'https://www.reuters.com/business/wall-st-week-ahead-bank-earnings-cpi-headline-busy-markets-week-sp-500-hovers-2026-10-09/',
      explanation:'US major banks start third-quarter earnings week; no results should be quoted before publication.'},
    {id:'imf',label:'IMF WORLD OUTLOOK',value:'TUE · 13 OCT',asOf:'SCHEDULED',source:'IMF',url:'https://www.imf.org/en/publications/weo/issues/2026/10/13/world-economic-outlook-october-2026',
      explanation:'October 2026 World Economic Outlook is scheduled to publish October 13; no future projections are asserted.'}
  ],
  takes:[
    {id:'news_open',role:'LIZA',headline:'HIGH-STAKES WEEK ON WALL STREET',
     sub:'BANK EARNINGS · CPI · OIL · BOND YIELDS',
     script:"Markets are facing a real test this week. Bank earnings are about to arrive, inflation data are due Wednesday, and oil is still above one hundred dollars a barrel. Technology shares have powered expectations higher. But can those profits withstand expensive money? Lasse, what is the tension investors need to understand?",
     sourceIds:['bank','cpi','oil']},
    {id:'rates',role:'LASSE',headline:'TECH PROFITS VERSUS COST OF CAPITAL',
     sub:'THE FED HIKED IN SEPTEMBER',
     script:"Two powerful forces are colliding. Big technology profits look promising. Yet borrowing is costly. In September the Federal Reserve raised its policy range to three and three quarters through four percent. Treasury yields have climbed to multi-decade highs. That's a serious valuation test, even for companies delivering good results.",
     sourceIds:['fed','rates']},
    {id:'oil',role:'LIZA',headline:'ENERGY ADDS PRESSURE',
     sub:'OIL ABOVE $100 / BARREL',
     script:"And now energy is complicating the picture. Brent crude has been above one hundred dollars, according to Monday's market reports. That can raise shipping and manufacturing costs. If profits look strong but households and businesses face higher bills, where do you look for the warning signs?",
     sourceIds:['oil','bank']},
    {id:'cpi',role:'LASSE',headline:'WHAT COMES NEXT',
     sub:'BANK RESULTS · WEDNESDAY CPI',
     script:"Start with the major banks. Watch loan demand, credit losses, and what executives say about customers. Then Wednesday's consumer inflation report. A hotter reading could keep pressure on bond yields and highly valued shares. A cooler one could ease it. Neither outcome is certain. That's why this week matters.",
     sourceIds:['bank','cpi']}
  ],
  provider:{engine:'avatar_iii',resolution:'1080p',ratio:'16:9',newTakeCount:4,maximumSecondsEach:26,
    maxEstimatedNewSpendUSD:1.76,actualCostProviderMetered:true,neverAutoTopUp:true},
  production:{trimExcessSilence:true,idealHandoverSeconds:0.16,lizaSpeedFactor:1.065,lasseSpeedFactor:1.025,
    avoidLizaFacialHoldAt:'00:33',maxSpeakingFaceContinuousSeconds:3.4,
    displayNewsSourcesInVisual:true,removeDefectiveMastheadFinancialLabel:true,preventFakeLiveQuotes:true}
});

export function auditStoryV2(plan=storyV2){
  if(plan.issueDate!=='2026-10-12'||!plan.noLiveFeeds||!plan.noInvestmentAdvice||plan.takes.length!==4)throw Error('Invalid dated-news editorial plan');
  if(plan.provider.engine!=='avatar_iii'||plan.provider.newTakeCount!==4||plan.provider.maxEstimatedNewSpendUSD>1.76)throw Error('Unexpected billable exposure');
  for(const t of plan.takes){
    if(!['LIZA','LASSE'].includes(t.role)||!t.script||t.script.trim().split(/\s+/).length>54)throw Error('Unapproved cast or oversized spoken take');
    if(!t.sourceIds?.length||!t.sourceIds.every(k=>plan.verifiedFacts.some(f=>f.id===k)))throw Error('Unsupported current-affairs claim source');
  }
  if(!plan.verifiedFacts.every(f=>f.url.startsWith('https://')&&f.asOf&&f.source))throw Error('Missing source provenance');
  return {safe:true,readyForPaidRelease:false,takes:plan.takes.length,maxEstimatedNewSpendUSD:plan.provider.maxEstimatedNewSpendUSD,
    facts:plan.verifiedFacts.length,disclosure:plan.displayCaveat};
}
if(process.argv[1]?.endsWith('news-revision-20261012.mjs'))console.log(JSON.stringify(auditStoryV2(),null,2));
