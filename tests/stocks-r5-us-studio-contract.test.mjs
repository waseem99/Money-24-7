import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const lock=JSON.parse(readFileSync(new URL('../docs/stocks/R5-LOCKED-US-ON-AIR-CONTRACT-20261014.json',import.meta.url),'utf8'));
test('R5 is fixed to United States equities, correct dated snapshot, and cannot pretend to be LIVE',()=>{
 assert.match(lock.nonnegotiable.region,/United States/);
 assert.equal(lock.nonnegotiable.archive_format.live_flag_allowed,false);
 assert.equal(lock.nonnegotiable.archive_format.type,'PRE-RECORDED / REPLAY');
 assert.equal(lock.nonnegotiable.archive_format.edition_date,'2026-10-12');
 assert.equal(lock.nonnegotiable.archive_format.observed_at,'09:40 ET');
 assert.equal(lock.nonnegotiable.on_air_data.indexes.length,3);
 assert.deepEqual(lock.nonnegotiable.on_air_data.indexes.map(i=>i.name),['Dow Jones','S&P 500','Nasdaq Composite']);
 assert.equal(lock.video_QA.final_4m20,'BLOCKED');
 assert.equal(lock.video_QA.g3_fully_voiced_60s,'BLOCKED');
});
test('No foreign-market references, off-model duplicate logos, or invented live visual overlays',()=>{
 assert.deepEqual(lock.nonnegotiable.forbidden_geographies,['Pakistan','Karachi','Islamabad','KSE','PSX','Faisal Mosque']);
 assert.equal(lock.nonnegotiable.top_left_bug.source,'User-uploaded Tamasha logo(1).png');
 assert.equal(lock.nonnegotiable.top_left_bug.copy,'STOCKS');
 assert.equal(lock.nonnegotiable.top_left_bug.tagline,'MARKETS  BUSINESS  PEOPLE');
 assert.ok(lock.nonnegotiable.top_left_bug.max_total_width_px_at_1920<=250);
 assert.equal(lock.nonnegotiable.top_left_bug.duplicate_in_room,false);
 assert.equal(lock.nonnegotiable.background.no_large_T,true);
 assert.equal(lock.nonnegotiable.background.empty_no_people,true);
 assert.equal(lock.nonnegotiable.ticker.must_be_sourced,true);
 assert.equal(lock.nonnegotiable.ticker.as_of_required,true);
});
test('Current R5 is technical review, not licensed completed 60s film',()=>{
 assert.equal(lock.assets_and_artifacts.duration_seconds,28.066667);
 assert.equal(lock.assets_and_artifacts.clip_full_decode,'PASS');
 assert.equal(lock.assets_and_artifacts.on_air_only_us,true);
 assert.match(lock.assets_and_artifacts.R5_video_sha256,/^[a-f0-9]{64}$/);
 assert.equal(lock.video_QA.no_new_paid_calls,true);
 assert.equal(lock.nonnegotiable.cast.silent_recasting,false);
 assert.equal(lock.nonnegotiable.cast.third_reporter,'NOT APPROVED');
 assert.match(lock.next_gate.title,/empty photoreal newsroom/);
});
