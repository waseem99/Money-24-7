import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const workflows=[
 'stocks-paid-marcus-once.yml','stocks-paid-nora-once.yml','stocks-r5-liza-one.yml','stocks-r5-lasse-one.yml'
];
for(const filename of workflows){
 test('G1 paid-generation legacy workflow disabled: '+filename,()=>{
  const content=readFileSync(new URL('../.github/workflows/'+filename,import.meta.url),'utf8');
  assert.match(content,/on:\s*\n\s*workflow_dispatch:/,'Only manual trigger allowed');
  assert.doesNotMatch(content,/\bpull_request\s*:/,'Pull request cannot submit paid media');
  assert.doesNotMatch(content,/\bpush\s*:/,'Push cannot submit paid media');
  assert.match(content,/if:\s*\$\{\{ false \}\}/,'Production billing remains unconditionally disabled');
 });
}

test('Camera rehearsal is available without uploading approved source footage to public repository',()=>{
 const data=readFileSync(new URL('../studio/index.html',import.meta.url),'utf8');
 assert.match(data,/STOCKS|Stocks/);
 assert.match(data,/HEAD SAFE/);
 for(const shot of ['A','B','C','D','R','F'])assert.ok(data.includes('data-shot="'+shot+'"'));
 assert.doesNotMatch(data,/public\/NORA\.mp4|public\/MARCUS\.mp4|HEYGEN_API_KEY=/);
});
