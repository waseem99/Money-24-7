/**
 * STOCKS Broadcast OS — source-safe linear programme rundown validator.
 * Pure offline code. Does not connect to data providers, publish video or incur charges.
 * An operator must approve EACH programme item and the entire channel launch separately.
 */
const HEX64=/^[a-f0-9]{64}$/i;
const ISO=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;
const SAFE_MODES=new Map([
 ['original','RECORDED'],
 ['replay','REPLAY'],
 ['evergreen','EVERGREEN'],
 ['live','LIVE'],
 ['standby','STANDBY']
]);
const SAFE_SCOPES=new Set(['US','US_MARKETS']);
export const NETWORK_CONTRACT=Object.freeze({
 network:'Stocks',
 market:'US_MARKETS',
 productionMinSeconds:3*3600,
 productionMaxSeconds:4*3600,
 allowedModes:Object.freeze([...SAFE_MODES.keys()]),
 approvedBugCount:1,
 bugPosition:'TOP_LEFT_ONLY',
 editionTimeZone:'America/New_York',
 newPaidModelCalls:0,
 broadcastProvisioned:false
});
function bool(v){return v===true}
function safeUtc(v){return typeof v==='string'&&ISO.test(v)&&Number.isFinite(Date.parse(v))}
function isMediaHash(v){return typeof v==='string'&&HEX64.test(v)}
function nonempty(v){return typeof v==='string'&&v.trim().length>0}
function finite(n){return typeof n==='number'&&Number.isFinite(n)}
export function auditBroadcastClaim(claim,{requireReady=false,asOfUtc}={}){
 const errors=[];
 if(!claim||typeof claim!=='object')return ['Claim missing'];
 if(!nonempty(claim.id)||!nonempty(claim.sourceId)||!nonempty(claim.sourceUrl))errors.push('Missing fact/source identity');
 if(!safeUtc(claim.observedAtUtc))errors.push('Missing UTC observation timestamp');
 if(!['government','issuer_filing','licensed_market','licensed_news'].includes(claim.sourceType))
   errors.push('Unrecognized source type');
 if(!['market_quote','economic','company_report','news_context'].includes(claim.kind))
   errors.push('Unsupported claim kind');
 if(claim.kind==='market_quote'){
   if(!finite(claim.value)||!nonempty(claim.unit)||!nonempty(claim.symbol))errors.push('Market quote missing number/unit/symbol');
   if(!['LIVE','DELAYED','SNAPSHOT','HISTORICAL'].includes(claim.dataMode))errors.push('Missing market quote display mode');
   if(requireReady&&!bool(claim.redistributionBroadcastRight))errors.push('No licensed market quote redistribution');
   if(claim.dataMode==='LIVE'){
     if(!bool(claim.exchangeEntitlementVerified))errors.push('No exchange live entitlement');
     if(!safeUtc(asOfUtc)||!safeUtc(claim.observedAtUtc)||
       Math.abs(Date.parse(asOfUtc)-Date.parse(claim.observedAtUtc))>60_000)
       errors.push('Live quote observation too old or future');
   }else if(!nonempty(claim.displayAsOf))errors.push('Nonlive quote needs clearly displayed as-of label');
 } else if(requireReady && !bool(claim.editorialApproved))errors.push('Claim missing editor approval');
 return errors;
}
export function auditBroadcastItem(item,{release=false,asOfUtc}={}){
 const errors=[];
 if(!item||typeof item!=='object')return ['Item missing'];
 if(!nonempty(item.id)||!nonempty(item.title))errors.push('Item missing ID or title');
 if(!SAFE_MODES.has(item.mode))errors.push('Unknown programme mode');
 if(!SAFE_SCOPES.has(item.market))errors.push('Non-US coverage is forbidden');
 if(!Number.isInteger(item.startSec)||item.startSec<0)errors.push('Invalid start seconds');
 if(!Number.isInteger(item.durationSec)||item.durationSec<=0)errors.push('Invalid duration seconds');
 if(item.onAirLabel!==SAFE_MODES.get(item.mode))errors.push('Incorrect LIVE/REPLAY/RECORDED/STANDBY label');
 if(item.mode==='live' && (!item.liveProof||!bool(item.liveProof.producerAuthorized)||
   !bool(item.liveProof.sourceHealthy)||!nonempty(item.liveProof.sessionId)))
   errors.push('No independently verified live source/producer');
 if(item.mode==='replay' && (!nonempty(item.recordedDateET)||!item.recordedDateET.match(/^\d{4}-\d{2}-\d{2}$/)))
   errors.push('Replay missing recording-date label');
 if(item.mode==='original' && item.onAirLabel==='LIVE')errors.push('False live label');
 if(item.hasImageGeneratedQuote===true||item.hasBakedBackgroundPresenters===true)
   errors.push('Uncontrolled AI imagery used for broadcast characters/market numerics');
 if(item.hasHumanOnAir===true||item.onAirPerformerType==='HUMAN_FILMED_ACTOR'||
    item.onAirPerformerType==='HUMAN_DIGITAL_TWIN')
   errors.push('AI-native channel prohibits human presenters or representatives on air');
 if(item.hasVisiblePresenters===true && item.onAirPerformerType!=='ORIGINAL_RIGGED_3D')
   errors.push('Visible presenter must render from the original fictional 3D rig');
 if(release && item.hasVisiblePresenters===true &&
     (!isMediaHash(item.aiCastManifestSha256)||!isMediaHash(item.studioAssetSha256)))
   errors.push('AI cast and single-room 3D studio lock SHA required');
 if(item.mismatchedPresenterVoice===true||item.falseTwoPresenterInteraction===true)
   errors.push('Face/lip/room identity QA failure');
 for(const claim of item.claims||[]){
  for(const error of auditBroadcastClaim(claim,{requireReady:release,asOfUtc}))
    errors.push('Claim '+(claim?.id||'?')+': '+error);
 }
 if(release){
  if(!item.asset || !isMediaHash(item.asset.sha256) || !/^((s3|r2|gs):\/\/)[a-zA-Z0-9_./-]+$/.test(item.asset.uri||''))
    errors.push('Approved private media URI and checksum missing');
  if(item.asset && !bool(item.asset.fullDecodeVerified))errors.push('Full video/audio media integrity not verified');
  if(item.reviewStatus!=='APPROVED')errors.push('Media item not editorially approved for playout');
  if(!item.rights || !bool(item.rights.footage)||!bool(item.rights.broadcast))
    errors.push('Footage/programme broadcast rights missing');
  const q=item.qa||{};
  if(!bool(q.visual)||!bool(q.editorial)||!bool(q.audio)||!bool(q.captions)||!isMediaHash(q.approvalSha256))
    errors.push('Human/editorial/technical/caption approval missing');
  if(item.mode!=='live' && !nonempty(item.recordedDateET) && item.mode!=='standby')
    errors.push('Recorded programme date missing');
  if(item.hasExternalMarketQuotes===true && !bool(item.rights?.marketDataRedistribution))
    errors.push('Broadcast market-data rights not verified');
 }
 return errors;
}
export function auditDailyRundown(rundown,{release=false,asOfUtc}={}){
 const errors=[];
 if(!rundown||typeof rundown!=='object')return {pass:false,ready:false,errors:['Missing rundown']};
 if(rundown.network!=='Stocks'||rundown.marketScope!=='US_MARKETS')
   errors.push('Network or U.S. market lock failed');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(rundown.dateET||''))
   errors.push('Missing U.S. market programming date');
 if(rundown.timeZone!=='America/New_York')errors.push('Must schedule in ET with recorded UTC timestamps');
 if(rundown.bug?.count!==1 || rundown.bug?.position!=='TOP_LEFT_ONLY' ||
    rundown.bug?.tagline!=='MARKETS BUSINESS PEOPLE') errors.push('Tamasha bug/brand contract failed');
 if(!Array.isArray(rundown.items)||!rundown.items.length)
   errors.push('No programmes scheduled');
 const items=Array.isArray(rundown.items)?rundown.items:[];
 let seconds=0,replaySec=0,originalSec=0;
 const seen=new Set();
 for(const item of items){
   if(item?.id && seen.has(item.id))errors.push('Duplicate programme ID '+item.id);
   if(item?.id)seen.add(item.id);
   if(item?.startSec!==seconds)errors.push('Timeline gap/overlap at '+(item?.id||'?'));
   for(const error of auditBroadcastItem(item,{release,asOfUtc}))
     errors.push((item?.id||'?')+': '+error);
   if(item?.mode==='replay'||item?.mode==='evergreen')replaySec+=item.durationSec||0;
   if(item?.mode==='original'||item?.mode==='live')originalSec+=item.durationSec||0;
   seconds+=Number.isInteger(item?.durationSec)?item.durationSec:0;
 }
 if(seconds<NETWORK_CONTRACT.productionMinSeconds||seconds>NETWORK_CONTRACT.productionMaxSeconds)
   errors.push('Rundown must cover 180–240 minutes for full-network launch');
 if(rundown.durationSec!==seconds)errors.push('Rundown target total mismatch');
 if(release){
   if(!bool(rundown.broadcastProvisioned)||rundown.runStatus!=='APPROVED_FOR_AIR')
     errors.push('Channel not provisioned or rundown not approved to air');
   if(!bool(rundown.studioApproved)||!bool(rundown.dataLicensingApproved)||
     !bool(rundown.tamashaIngestAccepted))errors.push('Studio/data/Tamasha upstream acceptance missing');
   if(!bool(rundown.primaryFeedHealthy)||!bool(rundown.backupFeedTested)||
     !bool(rundown.monitoringEnabled)||!nonempty(rundown.standbyPlaylistId))
     errors.push('No feed health, backup, watchdog or standby programme');
   if(!bool(rundown.producerApproved)||!bool(rundown.marketEditorApproved)||
      !isMediaHash(rundown.runSheetApprovalSha256))
     errors.push('Broadcast day signoff missing');
 }
 return {pass:errors.length===0,ready:release&&errors.length===0&&bool(rundown.broadcastProvisioned),
  errors,seconds,minutes:seconds/60,
  originalMinutes:originalSec/60,replayEvergreenMinutes:replaySec/60,
  paidGenerationAuthorized:false};
}
