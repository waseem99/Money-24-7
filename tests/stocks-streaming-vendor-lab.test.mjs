import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {sessionPreflight,qualityGate,latencySummary,STOCKS_STREAM_GATE} from '../network/streaming/vendor-policy.mjs';
import {greenPixelOpacity,GREEN_KEY} from '../network/streaming/keyer.js';

const ok={
 role:'NORA',mode:'LITE',sourceKind:'ORIGINAL_FICTIONAL_CUSTOM_AVATAR',
 sourceApproved:true,providerEligibilityVerified:true,commercialTestRightsApproved:true,
 operatorSession:true,viewerDriven:false,explicitCreditApproval:true,manualStart:true,
 sessionToken:'validated-provider-token-placeholder-123',maximumSeconds:60,
 isCurrentNews:false,rendererOnAirStatus:'TEST ONLY'
};
const clone=o=>structuredClone(o);
test('vendor stream can only start after existing token, manual producer and explicit credit approval',()=>{
 assert.equal(sessionPreflight(ok).pass,true);
 for(const [key,bad] of [['role','UNAPPROVED'],['mode','FULL'],['sourceKind','HUMAN_DIGITAL_TWIN'],
   ['sourceApproved',false],['providerEligibilityVerified',false],['commercialTestRightsApproved',false],
   ['explicitCreditApproval',false],['manualStart',false],['operatorSession',false],
   ['viewerDriven',true],['sessionToken','short'],['maximumSeconds',91],
   ['maximumSeconds',2]]) {
   const x=clone(ok);x[key]=bad;
   assert.equal(sessionPreflight(x).pass,false,key+' must block');
 }
 assert.equal(STOCKS_STREAM_GATE.startAutomatically,false);
 assert.equal(STOCKS_STREAM_GATE.paidGenerationAuthorized,false);
 assert.equal(STOCKS_STREAM_GATE.perViewerAvatarSessionsAllowed,false);
});

test('Live session is not permission to show fake LIVE financial news',()=>{
 assert.equal(sessionPreflight({...ok,rendererOnAirStatus:'LIVE'}).pass,false);
 assert.equal(sessionPreflight({...ok,rendererOnAirStatus:'LIVE',realTransmissionConfirmed:true}).pass,true);
 assert.equal(sessionPreflight({...ok,isCurrentNews:true}).pass,false);
 assert.equal(sessionPreflight({...ok,isCurrentNews:true,verifiedUSMarketClaim:true}).pass,true);
});

test('streaming QA requires actual lip-sync/identity/hair edges and clean studio video',()=>{
 const good={};
 for(const k of ['originalFaceStable','actualLipsyncVerified','realMovingFootage','backgroundKeyClean','studioFramingApproved','audioVideoAligned','sourceVoiceApproved','sourceRightsApproved','recordingReviewed'])good[k]=true;
 const g=qualityGate(good);
 assert.equal(g.pass,true);
 assert.equal(g.publishApproved,false);
 assert.equal(qualityGate({...good,actualLipsyncVerified:false}).pass,false);
 assert.equal(qualityGate({...good,fixedOfficeBackgroundVisible:true}).pass,false);
 assert.equal(qualityGate({...good,generatedFinancialFiguresVisible:true}).pass,false);
 assert.equal(qualityGate({...good,frozenPicturePretendsToSpeak:true}).pass,false);
 assert.equal(qualityGate({...good,falseSharedDeskInteractions:true}).pass,false);
});

test('No provider connections triggered by page load or external assets in public build',()=>{
 const ui=readFileSync(new URL('../stocks-streaming-lab.html',import.meta.url),'utf8');
 const operator=readFileSync(new URL('../network/streaming/operator.js',import.meta.url),'utf8');
 const vite=readFileSync(new URL('../vite.config.js',import.meta.url),'utf8');
 assert.ok(ui.includes('NO LICENSED MARKET FEED'));
 assert.ok(ui.includes('NO PUBLIC STREAM'));
 assert.ok(operator.includes("addEventListener('click',()=>void connect(role))"));
 assert.ok(operator.includes('session.start()'));
 assert.ok(operator.includes('session.stop()'));
 assert.ok(operator.includes('token=input.value.trim()'));
 assert.ok(operator.includes('input.value='));
 assert.ok(!operator.includes('/api/avatar-token'));
 assert.ok(!operator.includes('/v1/sessions/token'));
 assert.ok(!operator.includes("create_video_from"));
 assert.ok(vite.includes("process.env.STOCKS_BUILD_OPERATOR_LAB==='true'"));
});

test('Green-screen shader removes green but never keys skin, blue studio, or white clothing',()=>{
 assert.equal(greenPixelOpacity(3,245,8,GREEN_KEY),0);
 assert.equal(greenPixelOpacity(25,78,200,GREEN_KEY),1);
 assert.equal(greenPixelOpacity(180,155,124,GREEN_KEY),1);
 assert.equal(greenPixelOpacity(250,250,250,GREEN_KEY),1);
 assert.ok(greenPixelOpacity(42,140,58,GREEN_KEY)>=0);
});

test('Timing sample telemetry remains deterministic and never implies live transmission',()=>{
 assert.deepEqual(latencySummary([]),{count:0,p50:null,p95:null});
 assert.deepEqual(latencySummary([50,75,100,125,150]),{count:5,p50:100,p95:150});
});
