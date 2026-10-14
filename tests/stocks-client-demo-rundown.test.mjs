import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const demo=JSON.parse(readFileSync(new URL('../docs/stocks-network/client-demo-165sec-rundown.json',import.meta.url),'utf8'));
test('Client demo must be precisely 165 seconds, sequential and US-only',()=>{
 assert.equal(demo.targetDurationSec,165);assert.equal(demo.marketScope,'US_ONLY');assert.equal(demo.mode,'RECORDED_DEMO_NOT_LIVE');
 let clock=0;
 for(const s of demo.scenes){assert.equal(s.startSec,clock);assert.ok(s.durationSec>0);clock+=s.durationSec;assert.equal(s.ready,false);assert.equal(s.fullMotionQAApproved,false);}
 assert.equal(clock,165);assert.equal(demo.scenes.length,10);
});
test('2 approved anchors proposed, extra characters are future-only',()=>{
 assert.equal(demo.castSlots.NORA.providerCustomAvatarReady,false);
 assert.equal(demo.castSlots.MARCUS.providerCustomAvatarReady,false);
 assert.equal(demo.castSlots.MACRO_GUEST.futureOnly,true);
 assert.equal(demo.castSlots.CORRESPONDENT.futureOnly,true);
 assert.ok(demo.scenes.every(s=>s.sourceMediaId===null&&!s.ready));
});
test('No filmed person, illustrative LIVE ticker or spontaneous paid avatar submission',()=>{
 assert.equal(demo.brand.smallTamashaBug,true);
 assert.equal(demo.brand.backgroundLogoRepeated,false);
 assert.equal(demo.providerChargeAuthorization,false);
 assert.equal(demo.status,'BLOCKED_PENDING_REAL_MOVING_AVATAR_ASSETS');
 assert.ok(!demo.scenes.some(x=>x.onAirState==='LIVE'));
});
