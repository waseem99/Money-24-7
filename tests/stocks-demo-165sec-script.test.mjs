import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const p=JSON.parse(readFileSync(new URL('../docs/stocks-network/STOCKS_CLIENT_DEMO_SCRIPT_AND_SHOTS_165S.json',import.meta.url),'utf8'));
const allowed=new Set(['NORA','MARCUS','NORA_VOICEOVER','MARCUS_VOICEOVER','NORA_QUESTION_MARCUS_ANSWER','MUSIC_ONLY']);
test('Editorial plan has exactly 2:45 source-safe coherent shots',()=>{
 assert.equal(p.exactRuntimeSeconds,165);
 assert.equal(p.scenes.length,10);
 let end=0;for(const s of p.scenes){assert.equal(s.startSec,end);assert.equal(s.endSec,s.startSec+s.sec);assert.ok(allowed.has(s.role));end=s.endSec;}
 assert.equal(end,165);
});
test('No illustrative prices or fake on-air LIVE while source rights/voice are pending',()=>{
 assert.equal(p.usOnly,true);
 assert.equal(p.marketQuotesRequirePublisherLicence,true);
 assert.equal(p.oneChannelBug,true);
 assert.equal(p.mediaOutputReady,false);
 assert.equal(p.providerAvatarIds.NORA,null);assert.equal(p.providerAvatarIds.MARCUS,null);
 assert.equal(p.voiceIds.NORA,null);
 assert.ok(p.scenes.every(s=>s.mode==='RECORDED'||s.mode==='STAGED_INTERACTION'));
 assert.ok(p.scenes.some(s=>s.mode==='STAGED_INTERACTION'));
 assert.equal(p.scenes.filter(s=>/\$\s*\d+/.test(s.script)).length,0);
});
test('Provider can synthesize approved audio later with consistent narrator roles',()=>{
 const spoken=p.scenes.filter(s=>s.script.trim().length>0);
 assert.ok(spoken.length>=7);
 assert.ok(spoken.some(s=>s.role==='NORA'));
 assert.ok(spoken.some(s=>s.role==='MARCUS'));
 assert.ok(spoken.reduce((sum,s)=>sum+s.script.trim().split(/\s+/).length,0)>280);
});
