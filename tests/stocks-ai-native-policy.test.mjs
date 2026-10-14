import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {AI_MANDATE,auditAICast} from '../network/ai-native-policy.mjs';
import {auditBroadcastItem} from '../network/rundown-policy.mjs';

const doc=JSON.parse(readFileSync(new URL('../docs/stocks-network/ai-native-character-and-studio.example.json',import.meta.url),'utf8'));
const clone=o=>structuredClone(o);
test('AI-only original fictional anchored project is correctly configured as a DRAFT',()=>{
 const result=auditAICast(doc);
 assert.equal(result.pass,true,JSON.stringify(result.errors));
 assert.equal(result.releaseReady,false);
 assert.equal(result.newPaidGenerationAuthorized,false);
 assert.equal(result.onAirHumansPermitted,false);
 assert.equal(AI_MANDATE.characterMethod,'ORIGINAL_RIGGED_3D');
 assert.equal(AI_MANDATE.casting,'FICTIONAL_AI_CHARACTERS_ONLY');
 assert.equal(doc.studio.cameras.length,4);
});
test('Unbuilt characters and studio must not be declared broadcast-ready',()=>{
 const v=auditAICast(doc,{release:true});
 assert.equal(v.pass,false);
 assert.equal(v.releaseReady,false);
 assert.ok(v.errors.some(x=>x.includes('90-second')));
 assert.ok(v.errors.some(x=>x.includes('Unreal Level')));
 assert.ok(v.errors.some(x=>x.includes('meshSha256')));
});
test('Real human anchor or digital-twin source is prohibited even in DRAFT',()=>{
 const d=clone(doc);d.humanOnAir=true;
 assert.equal(auditAICast(d).pass,false);
 d.humanOnAir=false;d.characters.NORA.assetSource='HUMAN_FILMED_ACTOR';
 assert.equal(auditAICast(d).pass,false);
 d.characters.NORA.assetSource='HUMAN_DIGITAL_TWIN';
 assert.equal(auditAICast(d).pass,false);
});
test('All three studio cameras must share a single 3D Level',()=>{
 const d=clone(doc);d.studio.cameras[1].levelId='RandomDifferentStudio';
 assert.equal(auditAICast(d).pass,false);
 d.studio.cameras[1].levelId=d.studio.levelId;
 d.studio.cameras.pop();
 assert.equal(auditAICast(d).pass,false);
});
test('AI video billing and hidden human source require explicit safe flags',()=>{
 const d=clone(doc);d.automaticPaidProviderJobsEnabled=true;
 assert.equal(auditAICast(d).pass,false);
 d.automaticPaidProviderJobsEnabled=false;delete d.noHumanRepresentativesVisible;
 assert.equal(auditAICast(d).pass,false);
});

test('Studio must be free from AI-generated people, market data and extra marks',()=>{
 const d=clone(doc);d.studio.hasBakedMarketFigures=true;
 assert.equal(auditAICast(d).pass,false);
 d.studio.hasBakedMarketFigures=false;d.studio.hasBakedPresenters=true;
 assert.equal(auditAICast(d).pass,false);
 d.studio.hasBakedPresenters=false;d.graphicSystem.bugCount=2;
 assert.equal(auditAICast(d).pass,false);
});
test('Modelled 3D character cannot be a clone of a real person and must use synthetic TTS',()=>{
 const d=clone(doc);d.characters.MARCUS.isHumanLikenessClone=true;
 assert.equal(auditAICast(d).pass,false);
 d.characters.MARCUS.isHumanLikenessClone=false;d.characters.MARCUS.voice.kind='HUMAN_RECORDING';
 assert.equal(auditAICast(d).pass,false);
});
test('Broadcast queue rejects human presenters and 2D photo avatars',()=>{
 const item={id:'sample',title:'Example synthetic segment',mode:'original',market:'US',durationSec:180,
   startSec:0,onAirLabel:'RECORDED',recordedDateET:'2026-10-14',claims:[],
   hasVisiblePresenters:true,onAirPerformerType:'ORIGINAL_RIGGED_3D',
   aiCastManifestSha256:'a'.repeat(64),studioAssetSha256:'b'.repeat(64),
   hasHumanOnAir:false};
 assert.deepEqual(auditBroadcastItem(item),[]);
 assert.ok(auditBroadcastItem({...item,hasHumanOnAir:true}).some(e=>e.includes('prohibits human')));
 assert.ok(auditBroadcastItem({...item,onAirPerformerType:'HUMAN_DIGITAL_TWIN'}).some(e=>e.includes('human')));
 assert.ok(auditBroadcastItem({...item,onAirPerformerType:'PHOTO_AVATAR_OFFICE_CLIP'}).some(e=>e.includes('original fictional')));
 const denied=auditBroadcastItem({...item,aiCastManifestSha256:null},{release:true});
 assert.ok(denied.some(e=>e.includes('AI cast')));
});
