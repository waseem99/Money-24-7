import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SAFE_PLACEMENTS, LOCK, FILM_FORMAT} from '../pilot/stocks/r6/render.mjs';

test('R6 locks exact existing source look/takes and broadcast export dimensions',()=>{
 assert.deepEqual(Object.keys(SAFE_PLACEMENTS),['NORA','MARCUS']);
 assert.equal(SAFE_PLACEMENTS.NORA.sourceId,'f0a2771ab6e9cfdd82306b9c4aff5e33');
 assert.equal(SAFE_PLACEMENTS.MARCUS.sourceId,'d8808e9850b76dd38d550d5b5f0ccaf7');
 assert.equal(SAFE_PLACEMENTS.MARCUS.w,1100);
 assert.ok(SAFE_PLACEMENTS.NORA.y>=0&&SAFE_PLACEMENTS.MARCUS.y>=0);
 assert.equal(FILM_FORMAT.width,1920);
 assert.equal(FILM_FORMAT.height,1080);
 assert.equal(FILM_FORMAT.fps,30);
 assert.equal(FILM_FORMAT.sampleRate,48000);
});

test('R6 release and live-news claims remain forbidden',()=>{
 assert.equal(LOCK.programme,'Stocks');
 assert.equal(LOCK.market,'U.S. equities only');
 assert.equal(LOCK.format,'REPLAY');
 assert.equal(LOCK.asOf,'09:40 ET');
 assert.equal(LOCK.edition,'2026-10-12');
 assert.equal(LOCK.newPaidVideoCalls,0);
 assert.equal(LOCK.humanRealismApproved,false);
 assert.equal(LOCK.finalReleaseApproved,false);
});

test('R6 composition is offline and requires private approved inputs; avoids accidental new paid jobs',()=>{
 const src=readFileSync(new URL('../pilot/stocks/r6/render.mjs',import.meta.url),'utf8');
 assert.doesNotMatch(src,/api\.heygen\.com|api\.openai\.com|create_video|fetch\(/);
 assert.match(src,/doctor\(options\.source,options\.plates\)/);
 assert.match(src,/R6-BG-/);
 assert.match(src,/R6-FG-/);
 assert.match(src,/R6-TICKER-SOURCE/);
 assert.match(src,/libvpx-vp9/);
 assert.match(src,/format=rgba/);
 assert.match(src,/fullDecode:true,humanApproved:false/);
 assert.match(src,/sourceOnly:true,technicalDecodeOnly:true/);
});
