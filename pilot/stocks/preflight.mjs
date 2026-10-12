import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {EDITION,SHOTS,PROOF} from './episode.mjs';
import {MOTION_REVIEW,paidGenerationRelease} from './motion-qa.mjs';

const money = n => Math.round(n*100)/100;
const digest = data => createHash('sha256').update(JSON.stringify(data)).digest('hex');
const forbiddenOnAir = /\b(?:stalks|stocks gpt|chatgpt|signal market watch|demo data|illustrative figures|example market data)\b/i;

export function buildMotionProof() {
  const turns = PROOF.shots.map(id => {
    const shot=SHOTS.find(s=>s.id===id);
    if(!shot||!EDITION.mainCast[shot.speaker]) throw new Error('Missing approved speaker in motion proof');
    return {id:shot.id,speaker:shot.speaker,onAirName:EDITION.mainCast[shot.speaker].onAirName,
      lookId:EDITION.mainCast[shot.speaker].heygenLookId,
      voiceId:EDITION.mainCast[shot.speaker].voiceId,
      engine:PROOF.avatarEngine,
      script:shot.script,sourceIds:shot.sources};
  });
  const hash=digest({version:1,edition:EDITION.date,network:EDITION.network,turns});
  return {show:'Stocks',edition:EDITION.date,hash,turns,engine:PROOF.avatarEngine,
    resolution:PROOF.resolution,plannedSeconds:PROOF.maxPlannedGeneratedSeconds,
    estimatedSpendUSD:money(PROOF.maxPlannedGeneratedSeconds/60*3),
    paidReleaseAllowed:false,humanQualityGate:MOTION_REVIEW.qualityGate,
    NOTE:'Planning estimate, not an actual HeyGen wallet cap or charged amount.'};
}
export function auditStocks({mode='proof',providerBalanceUSD=null,correspondentApproved=false,
  listenerTestPassed=false,standingTestPassed=false,sourceVideoReady=false}={}) {
  const problems=[],warnings=[];
  if(EDITION.network!=='Stocks')problems.push('Wrong network wordmark');
  if(EDITION.live!==false)problems.push('Prepared programme cannot claim live transmission');
  if(EDITION.logoPlacement!=='top-left-only'||EDITION.backgroundLogo!==false)problems.push('Background/duplicate logo prohibited');
  if(SHOTS.length!==17||EDITION.totalSeconds!==260)problems.push('Storyboard count or duration changed');
  let end=0;
  for(const shot of SHOTS){
    if(shot.start!==end||shot.end<=shot.start||shot.id!==SHOTS.indexOf(shot)+1) problems.push('Non-contiguous or unordered shot '+shot.id);
    if(shot.speaker&&!['NORA','MARCUS','REMOTE'].includes(shot.speaker)) problems.push('Unknown speaker '+shot.id);
    if(!shot.speaker&&shot.script)problems.push('Unexpected speech on ident');
    if(shot.speaker&&!shot.script.trim())problems.push('Missing speech '+shot.id);
    if(forbiddenOnAir.test(shot.graphic)||forbiddenOnAir.test(shot.script))problems.push('Forbidden old/demo branding in shot '+shot.id);
    if(!shot.sources.length||shot.sources.some(x=>!EDITION.sources[x]))problems.push('Missing citation in shot '+shot.id);
    if(/\bLIVE\b/i.test(shot.graphic))problems.push('False LIVE slate in shot '+shot.id);
    const words=shot.script.trim()?shot.script.trim().split(/\s+/).length:0;
    const wpm=words*60/(shot.end-shot.start);
    if(words&&wpm>150)warnings.push('Review spoken pace for shot '+shot.id+': '+Math.round(wpm)+' WPM');
    end=shot.end;
  }
  if(end!==EDITION.totalSeconds)problems.push('Film does not end at 04:20');
  if(!EDITION.sources.BLS.includes('bls.gov'))problems.push('BLS primary source missing');
  const snap=EDITION.marketSnapshot;
  if(snap.status!=='reported-snapshot-not-live'||snap.source!=='R1'||snap.observedAt!=='2026-10-12T09:40:00-04:00')problems.push('Snapshot date/source provenance mismatched');
  if(snap.indexes.length!==3||snap.sectors.length!==3||snap.indexes.some(x=>!Number.isFinite(x.value)||!Number.isFinite(x.changePct)))problems.push('Invalid verified market data');
  const proof=buildMotionProof();
  if(proof.turns.length!==2||proof.turns[0].speaker!=='NORA'||proof.turns[1].speaker!=='MARCUS')problems.push('Two-person handoff must be Nora then Marcus');
  if(proof.estimatedSpendUSD>1.5)problems.push('Motion-test estimated spend above isolated proof budget');
  if(providerBalanceUSD===null)warnings.push('HeyGen connector does not expose direct API pay-as-you-go balance; user reports $5 top-up');
  if(mode==='full'){
    if(!correspondentApproved)problems.push('Remote contributor look/voice/video not approved');
    if(!listenerTestPassed)problems.push('Natural two-anchor listener behavior not certified');
    if(!standingTestPassed)problems.push('Standing shot not certified or replaced with approved PIP');
    if(!sourceVideoReady)problems.push('17 source-bound dialogue and video takes not complete');
  }
  return {mode,pass:problems.length===0,edition:EDITION.date,network:EDITION.network,
    plannedRuntimeSeconds:EDITION.totalSeconds,shots:SHOTS.length,speechTurns:SHOTS.filter(s=>!!s.script).length,
    totalSpokenWords:SHOTS.reduce((n,s)=>n+(s.script.trim()?s.script.trim().split(/\s+/).length:0),0),
    cast:[EDITION.mainCast.NORA.onAirName,EDITION.mainCast.MARCUS.onAirName],
    proofHash:proof.hash,proofBudgetUSD:proof.estimatedSpendUSD,
    paidRequestsMade:0,paidRelease:paidGenerationRelease(),
    humanMotionQA:MOTION_REVIEW.qualityGate,problems,warnings};
}
const thisFile=fileURLToPath(import.meta.url);
if(process.argv[1]===thisFile){
  const mode=process.argv.includes('--full')?'full':'proof';
  const report=auditStocks({mode});
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
  if(!report.pass)process.exitCode=2;
}
