import test from 'node:test';
import assert from 'node:assert/strict';
import {EDITION,SHOTS,PROOF} from '../pilot/stocks/episode.mjs';
import {auditStocks,buildMotionProof} from '../pilot/stocks/preflight.mjs';
import {renderStocksProofSVG} from '../pilot/stocks/render-frame.mjs';

test('Stocks is a sourced continuous 17-shot four-minute-twenty programme',()=>{
  const report=auditStocks();
  assert.equal(report.pass,true,JSON.stringify(report.problems));
  assert.equal(report.shots,17);
  assert.equal(report.plannedRuntimeSeconds,260);
  assert.equal(SHOTS.at(-1).end,260);
  assert.equal(EDITION.logoPlacement,'top-left-only');
  assert.equal(EDITION.backgroundLogo,false);
  assert.equal(EDITION.live,false);
  assert.ok(report.totalSpokenWords>450);
});
test('Only the locked formal Liza and Lasse faces and Annie / Orson voices enter paid proof',()=>{
  const proof=buildMotionProof();
  assert.deepEqual(proof.turns.map(t=>t.speaker),['NORA','MARCUS']);
  assert.equal(proof.turns[0].lookId,'5ee67ac453c34ffebd71e8eedb47b2fe');
  assert.equal(proof.turns[1].lookId,'de9f36c26bd841c891489a0c9d6174de');
  assert.equal(proof.turns[0].voiceId,'330290724a1b470fb63153f34d4c0183');
  assert.equal(proof.turns[1].voiceId,'00e3d285aba44b27a83c47c02c9c2d9c');
  assert.equal(proof.engine,'avatar_iv');
  assert.ok(proof.hash.length===64);
  assert.ok(proof.estimatedSpendUSD<=1.5);
});
test('No pretend LIVE broadcast, old Signal branding or invented tick-series',()=>{
  for(const s of SHOTS){
    assert.doesNotMatch(s.graphic,/STALKS|STOCKS GPT|SIGNAL|DEMO DATA|LIVE/i);
  }
  assert.equal(EDITION.marketSnapshot.status,'reported-snapshot-not-live');
  assert.equal(EDITION.marketSnapshot.observedAt,'2026-10-12T09:40:00-04:00');
  assert.deepEqual(EDITION.marketSnapshot.indexes.map(x=>x.changePct),[.21,.08,-.04]);
  assert.deepEqual(EDITION.marketSnapshot.sectors.map(x=>x.changePct),[1.8,1.1,-.2]);
});
test('Master must remain blocked until remote, standing, eye-lines and footage pass',()=>{
  const report=auditStocks({mode:'full'});
  assert.equal(report.pass,false);
  assert.ok(report.problems.some(x=>x.includes('Remote')));
  assert.ok(report.problems.some(x=>x.includes('listener')));
  assert.equal(report.paidRequestsMade,0);
});
test('Actual original T icon embedded once into layout: no desk or background duplicates',()=>{
  for(const person of ['NORA','MARCUS']){
    const svg=renderStocksProofSVG(person);
    assert.equal((svg.match(/data:image\\/png;base64,/g)||[]).length,1);
    assert.ok(svg.includes('Stocks'));
    assert.ok(svg.includes('REUTERS'));
    assert.ok(svg.includes('51,761.98'));
    assert.doesNotMatch(svg,/SIGNAL MARKET|STALKS|STOCKS GPT|AI PRESENTED|LIVE<\\/text>/i);
    assert.ok(svg.startsWith('<svg'));
  }
});
