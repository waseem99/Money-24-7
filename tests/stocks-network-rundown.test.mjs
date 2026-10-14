import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {auditDailyRundown,auditBroadcastClaim,auditBroadcastItem,NETWORK_CONTRACT} from '../network/rundown-policy.mjs';

const example=JSON.parse(readFileSync(new URL('../docs/stocks-network/daily-rundown.example.json',import.meta.url),'utf8'));
const copy=v=>structuredClone(v);

test('Broadcast OS example covers precisely 210 mins in contiguous US-exclusive editorial blocks',()=>{
 const result=auditDailyRundown(example);
 assert.equal(result.pass,true,JSON.stringify(result.errors));
 assert.equal(result.minutes,210);
 assert.equal(example.durationSec,12600);
 assert.equal(result.ready,false);
 assert.equal(result.paidGenerationAuthorized,false);
 assert.equal(example.items.length,6);
 assert.equal(NETWORK_CONTRACT.newPaidModelCalls,0);
});

test('A timeline that is valid in planning CANNOT automatically be published',()=>{
 const r=auditDailyRundown(example,{release:true});
 assert.equal(r.pass,false);
 assert.equal(r.ready,false);
 assert.ok(r.errors.some(e=>e.includes('approval missing')||e.includes('broadcast rights')));
 assert.ok(r.errors.some(e=>e.includes('Tamasha')));
});

test('Reject gaps, overlapping segments, false branding and non-US editorial coverage',()=>{
 const gap=copy(example);gap.items[2].startSec+=30;
 assert.equal(auditDailyRundown(gap).pass,false);
 const foreign=copy(example);foreign.items[1].market='PK';
 assert.equal(auditDailyRundown(foreign).pass,false);
 const bug=copy(example);bug.bug.count=3;
 assert.equal(auditDailyRundown(bug).pass,false);
 const missing=copy(example);missing.items[0].durationSec=0;
 assert.equal(auditDailyRundown(missing).pass,false);
});

test('Never label recorded footage LIVE or use a nonexistent live feed',()=>{
 const i=copy(example.items[0]);i.onAirLabel='LIVE';
 assert.ok(auditBroadcastItem(i).some(e=>e.includes('Incorrect')));
 const live={...i,mode:'live',onAirLabel:'LIVE',liveProof:null};
 assert.ok(auditBroadcastItem(live).some(e=>e.includes('independently verified live')));
 const good={...live,liveProof:{producerAuthorized:true,sourceHealthy:true,sessionId:'operator-channel-session-1'}};
 assert.equal(auditBroadcastItem(good).length,0);
});

test('No unlicensed exchange quotes or made-up market figures on air',()=>{
 const claim={id:'quote-1',sourceId:'licensed-provider-1',sourceUrl:'https://data-provider.example/paid-feed',
   sourceType:'licensed_market',kind:'market_quote',symbol:'SPY',value:470.24,unit:'USD',
   observedAtUtc:'2026-10-14T13:30:00Z',redistributionBroadcastRight:false,
   exchangeEntitlementVerified:false,dataMode:'LIVE',displayAsOf:null};
 assert.ok(auditBroadcastClaim(claim,{requireReady:true,asOfUtc:'2026-10-14T13:32:00Z'}).length>0);
 assert.ok(auditBroadcastClaim({...claim,dataMode:'SNAPSHOT',displayAsOf:'As of 9:30 AM ET'}, {requireReady:true}).some(e=>e.includes('redistribution')));
 assert.equal(auditBroadcastClaim({...claim,redistributionBroadcastRight:true,exchangeEntitlementVerified:true},{requireReady:true,asOfUtc:'2026-10-14T13:30:20Z'}).length,0);
 assert.ok(auditBroadcastItem({...example.items[0],hasImageGeneratedQuote:true}).length>0);
});

test('Presenter studio performance cannot include face/voice mismatch or generated background actor',()=>{
 const a=example.items[0];
 assert.ok(auditBroadcastItem({...a,mismatchedPresenterVoice:true}).some(x=>x.includes('identity')));
 assert.ok(auditBroadcastItem({...a,falseTwoPresenterInteraction:true}).some(x=>x.includes('identity')));
 assert.ok(auditBroadcastItem({...a,hasBakedBackgroundPresenters:true}).some(x=>x.includes('imagery')));
});

test('Release demands studio/feed/source/rights/human and signed media approval, beyond CI',()=>{
 const d=copy(example);
 d.studioApproved=true;d.dataLicensingApproved=true;d.tamashaIngestAccepted=true;
 d.primaryFeedHealthy=true;d.backupFeedTested=true;d.monitoringEnabled=true;
 d.standbyPlaylistId='rights-cleared-standby-playlist';
 d.producerApproved=true;d.marketEditorApproved=true;d.runSheetApprovalSha256='a'.repeat(64);
 for(const item of d.items){
  item.asset={sha256:'b'.repeat(64),uri:'s3://verified-private-media/'+item.id+'.mp4',fullDecodeVerified:true};
  item.reviewStatus='APPROVED';
  item.rights={footage:true,broadcast:true,marketDataRedistribution:true};
  item.qa={visual:true,editorial:true,audio:true,captions:true,approvalSha256:'c'.repeat(64)};
 }
 assert.equal(auditDailyRundown(d,{release:true}).pass,false,'Metadata alone cannot bypass unprovisioned channel');
 assert.equal(auditDailyRundown(d,{release:true}).ready,false,'Unprovisioned service cannot be called READY');
 d.broadcastProvisioned=true;d.runStatus='APPROVED_FOR_AIR';
 assert.equal(auditDailyRundown(d,{release:true}).pass,true,'Synthetic test fixture: policy gate only, not actual source validation');
 assert.equal(auditDailyRundown(d,{release:true}).ready,true);
 d.items[0].rights.broadcast=false;
 assert.equal(auditDailyRundown(d,{release:true}).pass,false);
});
