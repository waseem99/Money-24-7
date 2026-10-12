/**
 * SIGNAL 1080p 3-minute finished demo editorial manifest.
 * Financial numbers are SIMULATED, never live quotes or trading advice.
 * Speaker identities, looks and voices are frozen and exact.
 */
export const identity = Object.freeze({
  LIZA: Object.freeze({name:'Liza',role:'LEAD ANCHOR',look:'5ee67ac453c34ffebd71e8eedb47b2fe',group:'3727ecd034ef4248afea2a3443f7d2b7',voice:'330290724a1b470fb63153f34d4c0183',voiceName:'Annie — Lifelike',source:'Liza Office 6 · business blazer',gender:'female'}),
  LASSE: Object.freeze({name:'Lasse',role:'MARKET ANALYST',look:'de9f36c26bd841c891489a0c9d6174de',group:'46782f6d3de64ed98cec7f47d3d21ae7',voice:'00e3d285aba44b27a83c47c02c9c2d9c',voiceName:'Orson — Firm & Measured',source:'Lasse Office 3 · business blazer',gender:'male'})
});

export const programme = Object.freeze({
  title:'SIGNAL | The Bigger Picture — a financial markets explainer',
  programmeId:'signal-best-demo-180-liza-lasse-20261012-v1',
  created:'2026-10-12',
  targetSeconds:180,
  minAllowedSeconds:180,
  maxAllowedSeconds:230,
  width:1920,height:1080,fps:30,
  engine:'avatar_iii',
  illustrative:true,
  disclosure:'AI PRESENTERS · SIMULATED MARKET DATA · NOT LIVE QUOTES OR INVESTMENT ADVICE',
  colours:{navy:'#07162A',ink:'#101F33',teal:'#2ABFB3',ice:'#EFF7F8',cream:'#FCF9F1',gold:'#DFAE5C',green:'#279F80',red:'#DA6472'},
  scenes:[
    {id:'intro',kind:'intro',duration:4.5,headline:'THE BIGGER PICTURE',sub:'MARKETS EXPLAINED. EVIDENCE FIRST.',layout:'intro'},
    {id:'liza_open',kind:'speaker',role:'LIZA',existingVideoId:'9180a425a289d33d75c4ef82178ce9a8',headline:'BEYOND THE HEADLINE',sub:'A sharper way to read the market',layout:'anchor',script:"Good evening, and welcome to Signal. I'm Liza. Market headlines are only the beginning. Lasse, where should a viewer start when interpreting a chart?"},
    {id:'lasse_open',kind:'speaker',role:'LASSE',existingVideoId:'d69f9b79b86a04dec1dee7473e9cf9db',headline:'TIMEFRAME FIRST',sub:'Before you interpret a price move',layout:'analyst',script:"Thanks, Liza. I always start with the timeframe and volume. Then I check whether the movement continues across several sessions. One candle isn't enough."},
    {id:'liza_board',kind:'speaker',role:'LIZA',headline:'THE CONTEXT COUNTS',sub:'Every number needs a date and comparison',layout:'market-board',script:"Let's use a deliberately simulated market board. Each instrument has a time, a comparison point, and a change. Without those labels, even a precise-looking percentage can mislead. Our role is to explain the evidence, not chase the biggest number."},
    {id:'lasse_candles',kind:'speaker',role:'LASSE',headline:'READING THE CANDLES',sub:'Open · High · Low · Close',layout:'candles',script:"Here's a candlestick chart. Each candle contains the open, high, low and close for one interval. The wick shows the extremes; the body shows the opening and closing prices. I look for patterns across many candles, never just one."},
    {id:'micro_chapter_1',kind:'interlude',duration:4.5,headline:'PRICE TELLS ONE STORY',sub:'VOLUME ADDS ANOTHER',layout:'interlude'},
    {id:'liza_question',kind:'speaker',role:'LIZA',headline:'THE QUESTION THAT MATTERS',sub:'Is participation broad or temporary?',layout:'anchor',script:"That's useful context. But a sharp price move can still be temporary. What would tell us whether a broader group of participants is involved? Let's put trading volume beside the price chart and examine the relationship."},
    {id:'lasse_volume',kind:'speaker',role:'LASSE',headline:'VOLUME AND TREND',sub:'Separate activity from conviction',layout:'volume',script:"Volume measures activity, not confidence. I compare it with previous periods, then add a moving average to understand the trend. A price rise on unusually thin trading may deserve a different explanation from a sustained move with broad participation."},
    {id:'lasse_momentum',kind:'speaker',role:'LASSE',headline:'INDICATORS ARE CONTEXT',sub:'RSI 14 · MACD 12 / 26 / 9',layout:'indicators',script:"Momentum indicators add another lens. RSI summarizes recent gains and losses. MACD compares two moving averages and helps visualize changes in momentum. Neither predicts tomorrow. They are best read with the timeframe, the price series, and volume already on screen."},
    {id:'micro_chapter_2',kind:'interlude',duration:4.5,headline:'SHOW THE EVIDENCE',sub:'AND THE LIMITS',layout:'interlude'},
    {id:'liza_evidence',kind:'speaker',role:'LIZA',headline:'EVIDENCE BEFORE CERTAINTY',sub:'Source. Window. Context. Limits.',layout:'summary',script:"A strong headline can capture attention. A strong explanation also tells you the source, the comparison window, and what remains uncertain. Every market figure in this programme is illustrative, not a live quotation. We're demonstrating a method, not making a prediction."},
    {id:'lasse_takeaway',kind:'speaker',role:'LASSE',headline:'THE MARKET ANALYST’S CHECKLIST',sub:'Source → Timeframe → Volume → Context',layout:'checklist',script:"So the discipline is simple: verify the source, define the timeframe, compare volume, and keep indicators in context. If the evidence is incomplete, say so. That makes the story more useful than a confident but unsupported claim."},
    {id:'liza_close',kind:'speaker',role:'LIZA',headline:'THE BIGGER PICTURE',sub:'Context in every frame',layout:'anchor-close',script:"That's the bigger picture. This has been Signal, a prepared financial-news demonstration with AI presenters and simulated market data. Thanks for watching."},
    {id:'outro',kind:'outro',duration:5,headline:'SIGNAL',sub:'CONTEXT MATTERS',layout:'outro'}
  ]
});

export const newVideoScenes = programme.scenes.filter(s=>s.kind==='speaker'&&!s.existingVideoId);
export const existingVideoScenes=programme.scenes.filter(s=>s.kind==='speaker'&&s.existingVideoId);
export function auditPlan(p=programme){
  if(p.programmeId!==programme.programmeId||p.targetSeconds!==180||p.engine!=='avatar_iii'||p.width!==1920||p.height!==1080||p.fps!==30)throw Error('Unapproved master identity/output');
  if(p.scenes.length!==14||new Set(p.scenes.map(s=>s.id)).size!==p.scenes.length)throw Error('Scene integrity failed');
  if(!p.illustrative||!p.disclosure.includes('SIMULATED'))throw Error('Must disclose synthetic data');
  for(const s of p.scenes){
    if(s.kind==='speaker'){
      if(!identity[s.role]||!s.script||s.script.trim().split(/\s+/).length>53||s.script.length>420)throw Error('Unapproved speaker or unbounded script');
      if(/real-time prices|live market move|buy now|sell now/i.test(s.script))throw Error('Unsupported market claim');
      if(s.existingVideoId&&!['liza_open','lasse_open'].includes(s.id))throw Error('Only known exact source samples may be reused');
    }else if(!['intro','interlude','outro'].includes(s.kind)||!(s.duration>=3&&s.duration<=6))throw Error('Invalid graphics scene');
  }
  if(newVideoScenes.length!==8||existingVideoScenes.length!==2)throw Error('Exactly eight new single-use provider requests permitted');
  const fixed=p.scenes.filter(s=>s.kind!=='speaker').reduce((n,s)=>n+s.duration,0);
  return {safeDryRun:true,readyForBatch:false,totalScenes:p.scenes.length,newPaidClips:newVideoScenes.length,reusedCompletedClips:existingVideoScenes.length,targetSeconds:p.targetSeconds,fixedGraphicSeconds:fixed,
    reservedAdditionalAvatarUSD:3.20,estimatedAvatarIIIUSDPerMinute:1.0,chargesDependOnProviderMetering:true,
    note:'Separate one-shot locks per new clip. No purchases, topping up, IV, external AI or automatic retries authorized.'};
}

if(process.argv[1]?.endsWith('demo-master-plan.mjs'))console.log(JSON.stringify({audit:auditPlan(),scenes:programme.scenes.map(s=>({id:s.id,role:s.role||null,words:s.script?.trim().split(/\s+/).length||0}))},null,2));