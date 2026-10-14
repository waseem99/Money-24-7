import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {sessionPreflight,FREE_PRESET_TRIAL,qualityGate} from '../network/streaming/vendor-policy.mjs';

const base={role:'NORA',mode:'LITE',sourceKind:'PROVIDER_PUBLIC_PRESET_FOR_PRIVATE_FREE_TRIAL',
 presetTrial:true,presetName:'Amina',activeOtherSessions:0,
 sourceApproved:true,providerEligibilityVerified:true,commercialTestRightsApproved:true,
 operatorSession:true,viewerDriven:false,manualStart:true,explicitCreditApproval:true,
 sessionToken:'fake-token-which-is-at-least-24-characters',maximumSeconds:35,
 isCurrentNews:false,rendererOnAirStatus:'TEST ONLY'};
test('Public Free Amina can substitute in the NORA test slot, but NEVER be approved for on-air launch',()=>{
 const r=sessionPreflight(base);
 assert.equal(r.pass,true,JSON.stringify(r.errors));
 assert.equal(r.approvedForPublicBroadcast,false);
 assert.equal(r.sourceCategory,'TEMPORARY_WATERMARKED_PRESET_TEST');
 assert.equal(FREE_PRESET_TRIAL.NORA,'Amina');
 assert.equal(FREE_PRESET_TRIAL.MARCUS,'Dexter');
});
test('Only one active Free preset stream, no unapproved full LIVE show',()=>{
 const b={...base,role:'MARCUS',presetName:'Dexter'};
 assert.equal(sessionPreflight(b).pass,true);
 assert.equal(sessionPreflight({...b,activeOtherSessions:1}).pass,false);
 assert.equal(sessionPreflight({...b,maximumSeconds:60}).pass,false);
 assert.equal(sessionPreflight({...b,rendererOnAirStatus:'LIVE'}).pass,false);
 assert.equal(sessionPreflight({...b,presetName:'fake-marcus'}).pass,false);
 assert.equal(sessionPreflight({...b,explicitCreditApproval:false}).pass,false);
});
test('Free preset mode UI cannot quietly portray Amina and Dexter as original locked Nora/Marcus assets',()=>{
 const html=readFileSync(new URL('../stocks-streaming-lab.html',import.meta.url),'utf8');
 const js=readFileSync(new URL('../network/streaming/operator.js',import.meta.url),'utf8');
 assert.ok(html.includes('Use <strong>Amina</strong>'));
 assert.ok(html.includes('<strong>Dexter</strong>'));
 assert.ok(html.includes('Free is watermarked'));
 assert.ok(js.includes('AMINA · FREE WATERMARKED TEST'));
 assert.ok(js.includes('DEXTER · FREE WATERMARKED TEST'));
 assert.ok(js.includes('BLOCKED · ONE FREE SESSION'));
 assert.ok(js.includes('Free plan permits one avatar session only.'));
});
test('A rendered video still requires actual moving lip/audio/rights QA',()=>{
 const result=qualityGate({originalFaceStable:false,actualLipsyncVerified:false,realMovingFootage:false});
 assert.equal(result.pass,false);
 assert.equal(result.publishApproved,false);
});
