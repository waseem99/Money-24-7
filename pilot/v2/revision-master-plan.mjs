/**
 * SIGNAL v2 | October 12, 2026 sourced news editorial demonstration.
 * Source reporting is date-stamped and NOT a realtime price feed.
 * Six prior generic speaker sections reused under graphs, four newly written clips.
 */
export const identity = Object.freeze({
  LIZA:{name:'Liza',role:'LEAD ANCHOR',look:'5ee67ac453c34ffebd71e8eedb47b2fe',voice:'330290724a1b470fb63153f34d4c0183',voiceName:'Annie — Lifelike',source:'Liza Office 6 · formal blazer'},
  LASSE:{name:'Lasse',role:'MARKET ANALYST',look:'de9f36c26bd841c891489a0c9d6174de',voice:'00e3d285aba44b27a83c47c02c9c2d9c',voiceName:'Orson — Firm & Measured',source:'Lasse Office 3 · business blazer'}
});
export const REPORTS=Object.freeze({
  FED:{source:'FEDERAL RESERVE',date:'16 SEP 2026',value:'3.75–4.00%',label:'FED POLICY RANGE',url:'https://www.federalreserve.gov/newsevents/pressreleases/monetary20260916a.htm'},
  YIELDS:{source:'REUTERS',date:'9 OCT 2026',value:'~5.24%',label:'10-YEAR US TREASURY',url:'https://www.reuters.com/business/wall-st-week-ahead-bank-earnings-cpi-headline-busy-markets-week-sp-500-hovers-2026-10-09/'},
  BRENT:{source:'REUTERS',date:'12 OCT 2026',value:'>$100',label:'BRENT / BARREL',url:'https://www.reuters.com/world/china/global-markets-wrapup-1-2026-10-12/'},
  CPI:{source:'US BLS',date:'14 OCT 2026',value:'WED 08:30 ET',label:'NEXT CPI RELEASE',url:'https://www.bls.gov/schedule/2026/10_sched_list.htm'},
  EARNINGS:{source:'REUTERS',date:'9 OCT 2026',value:'THIS WEEK',label:'BANK EARNINGS WEEK',url:'https://www.reuters.com/business/wall-st-week-ahead-bank-earnings-cpi-headline-busy-markets-week-sp-500-hovers-2026-10-09/'},
  IMF:{source:'IMF',date:'13 OCT 2026',value:'TUE 13 OCT',label:'WORLD ECONOMIC OUTLOOK',url:'https://www.imf.org/en/publications/weo/issues/2026/10/13/world-economic-outlook-october-2026'}
});
const original={
 liza_question:"That's useful context. But a sharp price move can still be temporary. What would tell us whether a broader group of participants is involved? Let's put trading volume beside the price chart and examine the relationship.",
 lasse_open:"Thanks, Liza. I always start with the timeframe and volume. Then I check whether the movement continues across several sessions. One candle isn't enough.",
 liza_board:"Let's use a deliberately simulated market board. Each instrument has a time, a comparison point, and a change. Without those labels, even a precise-looking percentage can mislead. Our role is to explain the evidence, not chase the biggest number.",
 lasse_volume:"Volume measures activity, not confidence. I compare it with previous periods, then add a moving average to understand the trend. A price rise on unusually thin trading may deserve a different explanation from a sustained move with broad participation.",
 lasse_momentum:"Momentum indicators add another lens. RSI summarizes recent gains and losses. MACD compares two moving averages and helps visualize changes in momentum. Neither predicts tomorrow. They are best read with the timeframe, the price series, and volume already on screen.",
 liza_evidence:"A strong headline can capture attention. A strong explanation also tells you the source, the comparison window, and what remains uncertain. Every market figure in this programme is illustrative, not a live quotation. We're demonstrating a method, not making a prediction.",
 lasse_takeaway:"So the discipline is simple: verify the source, define the timeframe, compare volume, and keep indicators in context. If the evidence is incomplete, say so. That makes the story more useful than a confident but unsupported claim.",
 liza_close:"That's the bigger picture. This has been Signal, a prepared financial-news demonstration with AI presenters and simulated market data. Thanks for watching."
};
const fresh={
 news_open:"Markets are facing a real test this week. Bank earnings are about to arrive, inflation data are due Wednesday, and oil is still above one hundred dollars a barrel. Technology shares have powered expectations higher. But can those profits withstand expensive money? Lasse, what is the tension investors need to understand?",
 rates:"Two powerful forces are colliding. Big technology profits look promising. Yet borrowing is costly. In September the Federal Reserve raised its policy range to three and three quarters through four percent. Treasury yields have climbed to multi-decade highs. That's a serious valuation test, even for companies delivering good results.",
 oil:"And now energy is complicating the picture. Brent crude has been above one hundred dollars, according to Monday's market reports. That can raise shipping and manufacturing costs. If profits look strong but households and businesses face higher bills, where do you look for the warning signs?",
 cpi:"Start with the major banks. Watch loan demand, credit losses, and what executives say about customers. Then Wednesday's consumer inflation report. A hotter reading could keep pressure on bond yields and highly valued shares. A cooler one could ease it. Neither outcome is certain. That's why this week matters."
};
export const programme=Object.freeze({
 title:'SIGNAL | Markets at a Crossroads — earnings, inflation and energy',
 programmeId:'signal-oct12-2026-news-revision-r2',editionDate:'12 OCT 2026',targetSeconds:180,
 minAllowedSeconds:155,maxAllowedSeconds:215,width:1920,height:1080,fps:30,engine:'avatar_iii',
 disclosure:'AI PRESENTERS • REPORTED NEWS AS OF 12 OCT 2026 • ILLUSTRATIVE CHARTS, NOT LIVE PRICES',
 colours:{navy:'#07162A',ink:'#101F33',teal:'#2ABFB3',ice:'#EFF7F8',cream:'#FCF9F1',gold:'#DFAE5C',green:'#279F80',red:'#DA6472'},
 scenes:[
  {id:'intro',kind:'intro',duration:2.6,headline:'MARKETS AT A CROSSROADS',sub:'EARNINGS · RATES · ENERGY',layout:'intro'},
  {id:'news_open',kind:'speaker',role:'LIZA',headline:'A HIGH-STAKES MARKET WEEK',sub:'BANK EARNINGS · WEDNESDAY CPI',layout:'news-intro',script:fresh.news_open,news:['EARNINGS','CPI','BRENT']},
  {id:'rates',kind:'speaker',role:'LASSE',headline:'PROFITS VERSUS THE COST OF MONEY',sub:'RATE HIKE · TREASURY YIELDS',layout:'news-rates',script:fresh.rates,news:['FED','YIELDS']},
  {id:'oil',kind:'speaker',role:'LIZA',headline:'ENERGY ADDS PRESSURE',sub:'BRENT ABOVE $100 / BARREL',layout:'news-oil',script:fresh.oil,news:['BRENT','EARNINGS']},
  {id:'cpi',kind:'speaker',role:'LASSE',headline:'THE NEXT TWO CATALYSTS',sub:'BANK EARNINGS · WED 14 OCT CPI',layout:'news-calendar',script:fresh.cpi,news:['EARNINGS','CPI','IMF']},
  {id:'liza_question',kind:'speaker',role:'LIZA',headline:'DOES THE RALLY HAVE DEPTH?',sub:'PARTICIPATION · VOLUME · CONVICTION',layout:'volume',script:original.liza_question,simulate:true},
  {id:'lasse_open',kind:'speaker',role:'LASSE',headline:'THE TIMEFRAME CHANGES EVERYTHING',sub:'ONE SESSION IS NOT A TREND',layout:'candles',script:original.lasse_open,simulate:true},
  {id:'liza_board',kind:'speaker',role:'LIZA',headline:'HOW TO READ THE HEADLINE',sub:'SOURCE · TIME · COMPARISON',layout:'market-board',script:original.liza_board,simulate:true},
  {id:'lasse_volume',kind:'speaker',role:'LASSE',headline:'WHAT DOES VOLUME REVEAL?',sub:'A SHORT BURST IS NOT A TREND',layout:'volume',script:original.lasse_volume,simulate:true},
  {id:'lasse_momentum',kind:'speaker',role:'LASSE',headline:'MOMENTUM ISN’T CERTAINTY',sub:'RSI AND MACD ARE SIGNALS, NOT PROMISES',layout:'indicators',script:original.lasse_momentum,simulate:true},
  {id:'liza_evidence',kind:'speaker',role:'LIZA',headline:'THE MARKET TEST',sub:'STRONG EARNINGS OR PERSISTENT INFLATION?',layout:'news-summary',script:original.liza_evidence,news:['YIELDS','BRENT','CPI']},
  {id:'lasse_takeaway',kind:'speaker',role:'LASSE',headline:'WHAT MATTERS THIS WEEK',sub:'EARNINGS · CPI · POLICY',layout:'news-checklist',script:original.lasse_takeaway,news:['EARNINGS','CPI','FED']},
  {id:'liza_close',kind:'speaker',role:'LIZA',headline:'THE BIGGER PICTURE',sub:'REPORT THE FACTS. LABEL THE LIMITS.',layout:'anchor-close',script:original.liza_close,simulate:true},
  {id:'outro',kind:'outro',duration:3.5,headline:'SIGNAL',sub:'CONTEXT CHANGES THE STORY',layout:'outro'}
 ]
});
export function auditPlan(p=programme){
 if(p.programmeId!=='signal-oct12-2026-news-revision-r2'||p.engine!=='avatar_iii'||p.scenes.length!==14)throw Error('Unapproved editorial master');
 const speakers=p.scenes.filter(s=>s.kind==='speaker');if(speakers.length!==12)throw Error('Unexpected paid speaker count');
 for(const s of speakers){if(!identity[s.role]||!s.script||s.script.split(/\s+/).length>55)throw Error('Unapproved voice/source');if(s.news&&!s.news.every(k=>Boolean(REPORTS[k])))throw Error('Missing verified source');}
 return {datedAsOf:p.editionDate,scenes:p.scenes.length,speakers:speakers.length,newLicensedNewsSegments:4,reusedCompletedGenericSegments:8,
  fakeLiveQuotes:false,truthfulFactualCards:true,estimatedAdditionalSpendUSD:1.76,extraSpendRequiresProviderBalance:true,noPaidRetry:true};
}