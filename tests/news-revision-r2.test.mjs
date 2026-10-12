import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {programme,identity,REPORTS,auditPlan} from '../pilot/v2/revision-master-plan.mjs';
import {renderFrame} from '../pilot/v2/animated-news.mjs';
import {allocateTimeline} from '../pilot/v2/assemble-revision.mjs';
const sourceDurations={news_open:18.73,rates:20.09,oil:16.20,cpi:18.70,liza_question:12.04,lasse_open:8.85,liza_board:14.94,lasse_volume:15.96,lasse_momentum:19.36,liza_evidence:15.96,lasse_takeaway:15.57,liza_close:9.40};
const media=Object.fromEntries(Object.entries(sourceDurations).map(([id,duration])=>[id,{duration}]));
test('locked Liza+Annie and Lasse+Orson, finite source budgets, dated reported facts',()=>{
  assert.equal(identity.LIZA.voice,'330290724a1b470fb63153f34d4c0183');
  assert.equal(identity.LASSE.voice,'00e3d285aba44b27a83c47c02c9c2d9c');
  assert.equal(identity.LIZA.look,'5ee67ac453c34ffebd71e8eedb47b2fe');
  assert.equal(identity.LASSE.look,'de9f36c26bd841c891489a0c9d6174de');
  assert.equal(auditPlan().newLicensedNewsSegments,4);
  assert.equal(auditPlan().reusedCompletedGenericSegments,8);
  assert.equal(programme.editionDate,'12 OCT 2026');
  assert.equal(programme.scenes.length,14);
  assert.equal(Object.keys(REPORTS).length,6);
  assert.ok(Object.values(REPORTS).every(r=>r.url.startsWith('https://')&&r.date));
});
test('the full film runs ~3 minutes WITHOUT mandatory multi-second presenter padding',()=>{
  const t=allocateTimeline(programme,media);
  assert.ok(t.totalSeconds>=180&&t.totalSeconds<=193);
  assert.equal(t.entries.length,14);
  for(const e of t.entries.filter(x=>x.kind==='speaker')){
    assert.ok(e.durationSeconds-e.audioDuration<.17);
    assert.ok(e.playbackSpeed===1.065||e.playbackSpeed===1.025);
  }
  for(let i=1;i<t.entries.length;i++)assert.equal(t.entries[i].startSeconds,t.entries[i-1].endSeconds);
});
test('news graphics are dynamic and the broken FINANCIAL NEWSROOM divider is removed',()=>{
  const scene=programme.scenes.find(s=>s.id==='rates');
  const before=renderFrame(scene,.3,19,{globalSeconds:20,audioDuration:18});
  const after=renderFrame(scene,9,19,{globalSeconds:29,audioDuration:18});
  assert.ok(before.includes('FED POLICY RANGE'));
  assert.ok(after.includes('3.75–4.00%'));
  assert.ok(after.includes('~5.24%'));
  assert.notEqual(before,after);
  assert.equal(after.includes('FINANCIAL NEWSROOM'),false);
  assert.equal(after.includes('MARKET WATCH'),true);
  assert.equal(after.includes('SIGNAL MARKETS'),false); // cut away from photo after ~3 sec
  assert.ok(after.includes('REPORTED SOURCES'));
});
test('short female camera exposure avoids another ten-second 00:33-style artificial-face hold',()=>{
  const scene=programme.scenes.find(s=>s.id==='news_open');
  const onCamera=renderFrame(scene,1.2,19,{globalSeconds:8,audioDuration:18});
  const graphic=renderFrame(scene,6,19,{globalSeconds:13,audioDuration:18});
  assert.ok(onCamera.includes('SIGNAL MARKETS'));
  assert.ok(!graphic.includes('SIGNAL MARKETS'));
});