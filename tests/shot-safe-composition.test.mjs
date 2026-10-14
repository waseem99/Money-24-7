import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const studio=new URL('../studio/index.html',import.meta.url);
const compositor=new URL('../pilot/v2/assemble-r4plus-recovery.mjs',import.meta.url);

test('Stocks camera rehearsal implements six storyboard camera families with cast and dated labels',async()=>{
 const html=await readFile(studio,'utf8');
 for(const shot of ['A','B','C','D','R','F'])assert.ok(html.includes('data-shot="'+shot+'"'), 'missing camera '+shot);
 for(const label of ['NORA ELLERY','MARCUS VARDEN','REMOTE MARKET CORRESPONDENT'])assert.ok(html.includes(label),label);
 assert.match(html,/HEAD SAFE/);
 assert.match(html,/Show head-safe guides/);
 assert.match(html,/PREVIS.*NOT LIVE FOOTAGE/);
 assert.match(html,/PRE-RECORDED.*NOT LIVE/);
 assert.ok(!/\bLIVE NOW\b|\bBREAKING LIVE\b/.test(html));
});

test('R4+ compositor uses source-preserving fit, never forced centre-crop for faces',async()=>{
 const code=await readFile(compositor,'utf8');
 assert.match(code,/scale=772:405:force_original_aspect_ratio=decrease,pad=772:405:\(ow-iw\)\/2:\(oh-ih\)\/2:color=0x113255/);
 assert.ok(!code.includes('scale=772:405:force_original_aspect_ratio=increase,crop=772:405'));
});

test('Studio rehearsal keeps provider videos separate from placeholder art and locks brand',async()=>{
 const html=await readFile(studio,'utf8');
 assert.match(html,/illustrated stand-ins/i);
 assert.match(html,/one T \+ Stocks bug/i);
 assert.match(html,/12 OCT 2026/);
 assert.ok(!html.includes('HEYGEN_API_KEY='));
});
