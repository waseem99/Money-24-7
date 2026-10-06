import test from 'node:test';
import assert from 'node:assert/strict';
import {withTimeout} from '../src/session-timeout.js';
test('late connections invoke cleanup after timeout',async()=>{
  let finish;let cleaned=false;
  const pending=new Promise(resolve=>finish=resolve);
  await assert.rejects(withTimeout(pending,5,'startup timed out',()=>{cleaned=true;}),/startup timed out/);
  finish();await new Promise(resolve=>setTimeout(resolve,0));assert.equal(cleaned,true);
});
test('successful startup is returned without cleanup',async()=>{
  let cleaned=false;assert.equal(await withTimeout(Promise.resolve('connected'),100,'timeout',()=>{cleaned=true;}),'connected');assert.equal(cleaned,false);
});
