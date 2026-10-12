/**
 * No-spend broadcast-grade 3-minute pilot editorial + budget design.
 * Not an instruction to render, not a provider-backed film or a paid release.
 * This is the next-stage master plan for the user-locked Rumi/Annie and Kevin/Orson pair.
 */
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {proposedPresenters} from './budget-preflight.mjs';

const shots=[
  {id:'s01',length:5,layout:'intro-logo',presenter:null,headline:'SIGNAL | THE BIGGER PICTURE',
    script:null,edit:'5-second branded motion bumper, restrained audio signature, no paid avatar'},
  {id:'s02',length:18,layout:'anchor-full',presenter:'ANCHOR',headline:'BEYOND THE HEADLINE',
    script:"Welcome to Signal. I'm Rumi. A market headline can be exciting, but movement alone isn't the story. We're breaking down how to read price, volume and momentum without confusing a single session for a lasting trend.",
    edit:'Rumi framed professionally at a navy newsroom desk, understated lower third; avoid overdone hand motions'},
  {id:'s03',length:20,layout:'presenter-board',presenter:'ANCHOR',headline:'THE CONTEXT COUNTS',
    script:"On this board, the figures are simulated for demonstration. Every number is paired with a comparison period and a timestamp. A move that seems dramatic over minutes may look very different when you step back and examine several sessions.",
    edit:'Continue Rumi voice from genuine speaking footage; cut over clean, animated data-board graphic. Simulated badge visible'},
  {id:'s04',length:20,layout:'presenter-board',presenter:'ANALYST',headline:'TIMEFRAME FIRST',
    script:"Start with the timeframe. Then compare the size of the move with typical activity. When volume is thin, price can shift quickly without telling us much about conviction. That's why I prefer to start with the broader chart.",
    edit:'Kevin medium shot beside large chart; no synthetic listener or fake standing alpha'},
  {id:'s05',length:20,layout:'chart-full',presenter:'ANALYST',headline:'READ THE PRICE ACTION',
    script:"Each candle represents one time interval. Its body shows where that interval opened and closed, while its wick shows the extreme prices. No single candle can tell the whole story, and it certainly cannot guarantee what happens next.",
    edit:'Full-frame candlesticks with subtle time-synced highlights; keep authentic Kevin audio under the chart'},
  {id:'s06',length:16,layout:'anchor-full',presenter:'ANCHOR',headline:'ASK A BETTER QUESTION',
    script:"So where does that leave someone trying to understand momentum? It's easy to stare at the sharpest point on a chart and assume it explains everything. Kevin, what should we compare?",
    edit:'Rumi camera only, then graphic establishing Kevin; never insert an invented silent reaction shot'},
  {id:'s07',length:23,layout:'chart-full',presenter:'ANALYST',headline:'VOLUME AND TREND',
    script:"First, compare trading volume across several similar periods, not one isolated bar. Then look at the shorter and longer moving averages. They summarize historical prices, but with a delay. Good analysis describes what those measures show, and acknowledges what remains uncertain.",
    edit:'Real Kevin spoken audio under evidence overlays: volume bars, moving averages, readable labels'},
  {id:'s08',length:21,layout:'chart-full',presenter:'ANALYST',headline:'INDICATORS ARE CONTEXT',
    script:"Momentum indicators can add another angle. RSI summarizes the relative size of recent gains and losses. MACD compares trends built from moving averages. Neither promises direction. Together with price and volume, they provide context, not certainty.",
    edit:'Motion graphics for RSI and MACD; highlight definitions, not predictions; continue actual Kevin audio'},
  {id:'s09',length:22,layout:'anchor-full',presenter:'ANCHOR',headline:'EVIDENCE BEFORE CERTAINTY',
    script:"The headline is a starting point, not a conclusion. The details that matter are the source, the time window, and whether the wider evidence supports the explanation. In this demonstration, all the charts use illustrative numbers, not live market quotes.",
    edit:'Return to Rumi anchor, elegant two-second chart-to-studio transition, reinforce illustrative-data footer'},
  {id:'s10',length:11,layout:'presenter-board',presenter:'ANALYST',headline:'THE TAKEAWAY',
    script:"Exactly. Good analysis begins with a question and ends with a clear limit. Here's the context, and here's what we still don't know.",
    edit:'Kevin concise conclusion, medium frame, one matching chart cue'},
  {id:'s11',length:4,layout:'end-slate',presenter:null,headline:'SIGNAL — CONTEXT MATTERS',
    script:null,edit:'Simple branded end slate, no paid avatar, clean music-out'}
];

export const threeMinutePlan=Object.freeze({
  schemaVersion:1,
  id:'signal-rumi-kevin-editorial-master-180',
  kind:'prepared-illustrative-financial-news-film',
  targetSeconds:180,
  output:{width:1920,height:1080,fps:30,codec:'H.264',audio:'AAC 48kHz',captions:'WebVTT sidecar'},
  disclosure:'AI presenters · Prepared demonstration · Illustrative market data, not live prices',
  cast:{
    anchor:{name:'Rumi',lookId:proposedPresenters.ANCHOR.lookId,voiceName:'Annie - Lifelike',voiceId:proposedPresenters.ANCHOR.auditionVoiceId},
    analyst:{name:'Kevin',lookId:proposedPresenters.ANALYST.lookId,voiceName:'Orson - Firm & Measured',voiceId:proposedPresenters.ANALYST.auditionVoiceId}
  },
  engine:'avatar_iii',
  providerRateUSDPerGeneratedMinute:1,
  reservationPaddingSecondsPerPaidShot:3,
  minHumanPasses:['Rumi correct on-screen face and natural lip sync','Kevin natural mouth/jaw movement and Orson voice',
    'accurate visuals, source labels, no invented live financial facts','no fake listeners, artificial loops, standing matting or unapproved paid retakes'],
  state:'EDITORIAL_READY_NOT_RENDERED',
  paidReleaseAuthorized:false,
  shots
});

const usd=x=>Math.ceil(x*100-1e-9)/100;
export function auditThreeMinutePlan(plan=threeMinutePlan){
  if(plan.targetSeconds!==180||plan.engine!=='avatar_iii'||plan.providerRateUSDPerGeneratedMinute!==1)
    throw new Error('Unapproved three-minute master format or rate');
  if(plan.paidReleaseAuthorized)throw new Error('Editorial plan must never itself authorize provider billing');
  if(plan.cast.anchor.lookId!==proposedPresenters.ANCHOR.lookId||
     plan.cast.anchor.voiceId!==proposedPresenters.ANCHOR.auditionVoiceId||
     plan.cast.analyst.lookId!==proposedPresenters.ANALYST.lookId||
     plan.cast.analyst.voiceId!==proposedPresenters.ANALYST.auditionVoiceId)
    throw new Error('Final Rumi/Annie or Kevin/Orson cast changed');
  let offset=0;const timeline=[];
  for(const shot of plan.shots){
    if(!shot.id||!Number.isInteger(shot.length)||shot.length<4||shot.length>25)
      throw new Error('Shot timing invalid');
    if(shot.presenter!==null&&!['ANCHOR','ANALYST'].includes(shot.presenter))
      throw new Error('Unapproved speaker');
    if((shot.presenter===null)!==(shot.script===null))
      throw new Error('Speaking avatar requires an actual approved text script');
    if(shot.script){
      if(/real[- ]time quotes|today.s actual prices|breaking financial news/i.test(shot.script))
        throw new Error('Unverified live market claims are not allowed');
      const words=shot.script.trim().split(/\s+/).length;
      if(words>60)throw new Error('Script length exceeds bounded single-take scope');
    }
    timeline.push({id:shot.id,startSeconds:offset,endSeconds:offset+shot.length,
      presenter:shot.presenter,layout:shot.layout,headline:shot.headline,
      speakingWords:shot.script?shot.script.trim().split(/\s+/).length:0});
    offset+=shot.length;
  }
  if(offset!==180||new Set(plan.shots.map(s=>s.id)).size!==plan.shots.length)
    throw new Error('Film must be exactly 180 seconds with unique continuous scenes');
  const paidShots=plan.shots.filter(s=>s.presenter!==null),spokenSeconds=paidShots.reduce((n,s)=>n+s.length,0);
  const reservedSeconds=spokenSeconds+paidShots.length*plan.reservationPaddingSecondsPerPaidShot;
  return {
    planId:plan.id,
    outputSeconds:offset,
    totalShots:plan.shots.length,
    paidSingleSpeakerShots:paidShots.length,
    estimatedGeneratedSpeakerSeconds:spokenSeconds,
    estimatedSpeakerCostUSD:usd(spokenSeconds*plan.providerRateUSDPerGeneratedMinute/60),
    conservativeInternalReserveUSD:usd(reservedSeconds*plan.providerRateUSDPerGeneratedMinute/60),
    notIncluded:'First audition clips, retries, actual HeyGen billing rounding, voice/matting, external music licensing, hosting or infrastructure',
    providerHardSpendCap:false,
    disclosure:plan.disclosure,
    readyToPay:false,
    timeline
  };
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))
  console.log(JSON.stringify(auditThreeMinutePlan(),null,2));
