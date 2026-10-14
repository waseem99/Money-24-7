import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const script = readFileSync(new URL('../pilot/stocks/ident_animation.py', import.meta.url), 'utf8');
const doc = readFileSync(new URL('../docs/stocks/R4-ANIMATED-IDENT-R5-STUDIO-GATES-20261014.md', import.meta.url), 'utf8');

test('Animated Stocks intro and tail are locally reproducible with explicit approved asset inputs', () => {
  for (const flag of ['--source', '--logo', '--outdir']) assert.ok(script.includes(flag));
  assert.ok(script.includes('render("opening", 3.6, opening)'));
  assert.ok(script.includes('render("closing", 4.5, closing)'));
  assert.ok(script.includes('1920:1080'));
  assert.ok(script.includes('"[v]", "-map", "1:a:0"'));
  assert.ok(script.includes('"-c:a", "copy"'));
});
test('No paid generation or synthesized market quotes are introduced by local channel animation', () => {
  assert.doesNotMatch(script, /api\.heygen\.com|movio\.ai|openai\.com\/v1|https?:\/\//);
  assert.doesNotMatch(script, /LIVE NOW|BREAKING LIVE/);
  assert.match(script, /12 OCT 2026/);
  assert.match(script, /REPLAY/);
  assert.match(doc, /no new HeyGen/i);
});
test('Photoreal physical newsroom and full narration remain distinct unapproved production gates', () => {
  assert.match(doc, /not a green G3/);
  assert.match(doc, /empty studio plate/);
  assert.match(doc, /actual approved/);
  assert.match(doc, /source-media generation/);
  assert.match(doc, /19\.94 seconds/);
});
