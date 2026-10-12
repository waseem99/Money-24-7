import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {CAST,SOURCES,SHOW,auditShow} from '../pilot/v2/newsroom-r4plus-plan.mjs';
import {renderFrame} from '../pilot/v2/newsroom-r4plus-graphics.mjs';

test('show follows newsroom bulletin structure, with Liza greeting and signing off',()=>{
 const a=auditShow();
 assert.equal(a.show,'SIGNAL MARKET WATCH');
 assert.equal(a.speakerSegments,9);
 assert.equal(a.billablePermission,false);
 assert.ok(a.targetSeconds>=170&&a.targetSeconds<=220);
 assert.equal(CAST.LIZA.lookId,'5ee67ac453c34ffebd71e8eedb47b2fe');
 assert.equal(CAST.LIZA.voiceId,'330290724a1b470fb63153f34d4c0183');
 assert.equal(CAST.LASSE.lookId,'de9f36c26bd841c891489a0c9d6174de');
 assert.equal(CAST.LASSE.voiceId,'00e3d285aba44b27a83c47c02c9c2d9c');
 assert.match(SHOW.scenes[1].script,/Welcome to Signal Market Watch/);
 assert.match(SHOW.scenes.at(-2).script,/Thanks for watching Signal Market Watch/);
 assert.ok(!SHOW.scenes.some(sc=>/\bRSI\b|\bMACD\b|how to read candlesticks/i.test(sc.script||'')));
});

test('all sources carry provenance; BLS scheduled CPI and Reuters estimate are not presented as released results',()=>{
 assert.equal(SOURCES.CPI.status,'UPCOMING RELEASE');
 assert.equal(SOURCES.CPIFORECAST.status,'FORECAST ONLY');
 assert.equal(SOURCES.CPI.value,'WED 14 OCT');
 assert.ok(SOURCES.FED.url.includes('federalreserve.gov'));
 assert.ok(SOURCES.BANKS.url.includes('reuters.com'));
 assert.ok(SOURCES.BRENT.value.includes('$104.37'));
 assert.ok(Object.values(SOURCES).every(s=>s.url.startsWith('https://')&&s.date&&s.source));
});

test('scene-specific contrasts and readable captions stay separate from ticker/role lower-third',()=>{
 const samples=['top_stories','global_market','earnings','rates','energy','inflation','world_outlook','watchlist','signoff'];
 const arr=samples.map(id=>SHOW.scenes.find(s=>s.id===id));
 assert.ok(arr.every(Boolean));
 const distinct=new Set(arr.map(s=>s.layout));
 assert.ok(distinct.size>=8);
 for(const s of arr){
  const svg=renderFrame(s,Math.min(5,s.duration/2),s.duration,{audioDuration:s.duration,globalSeconds:33});
  assert.ok(svg.includes('SIGNAL'));
  assert.ok(svg.includes('MARKET WATCH'));
  assert.ok(svg.includes(s.eyebrow));
  assert.ok(svg.includes('height="1080"'));
  assert.ok(svg.includes('scrollClip'));
  assert.ok(svg.includes('x="67" y="867"')); // separate legible subtitles
  assert.ok(svg.includes('x="0" y="997"')); // moving ticker below subtitle
  assert.ok(!svg.includes('DEMO DATA')&&!svg.includes('AI PRESENTED')&&!svg.includes('AI-PRESENTED'));
  assert.ok(!svg.includes('MARKET DEMO'));
 }
 const open=renderFrame(arr[0],3,18,{audioDuration:18});
 const rates=renderFrame(arr[3],3,18,{audioDuration:18});
 assert.notEqual(open,rates);
 assert.ok(rates.includes('3.75–4.00%'));
 const calendar=renderFrame(arr[5],5,20,{audioDuration:20});
 assert.ok(calendar.includes('NOT YET PUBLISHED'));
});

test('svg can render to genuine 1080p; moving ticker and animations change over time',async()=>{
 const rates=SHOW.scenes.find(s=>s.id==='rates');
 const a=renderFrame(rates,2,20,{globalSeconds:32,audioDuration:20});
 const b=renderFrame(rates,4,20,{globalSeconds:34,audioDuration:20});
 assert.notEqual(a,b);
 const info=await sharp(Buffer.from(a)).png().metadata();
 assert.equal(info.width,1920);
 assert.equal(info.height,1080);
});

test('real source-consistent chart cutaways and bright bulletin header do not expose unapproved promo labels',()=>{
 const scene=SHOW.scenes.find(x=>x.id==='global_market');
 const frame=renderFrame(scene,5,17.3,{globalSeconds:33.4,audioDuration:17.1,cutaway:true});
 assert.ok(frame.includes('AT A GLANCE'));
 assert.ok(frame.includes('GLOBAL MARKETS'));
 assert.ok(frame.includes('#165DFF'));
 assert.ok(frame.includes('MONDAY'));
 for(const label of ['AI-PRESENTED','DEMO DATA','MARKET DEMO','AI PRESENTERS'])
  assert.equal(frame.includes(label),false);
});