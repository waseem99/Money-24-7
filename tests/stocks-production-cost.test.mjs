import test from 'node:test';
import assert from 'node:assert/strict';
import {estimateCost} from '../production/benchmark/preflight.mjs';

test('cost includes rejected attempts and independently billed presenter layers', () => {
  const one = estimateCost(60, .4, 30, 1.25, 4.83);
  assert.equal(one.billedMinutes, 900);
  assert.equal(one.estimatedUsd, 4347);
  assert.equal(estimateCost(60, .4, 30, 1.25, 4.83, 2).estimatedUsd, 8694);
});
test('invalid cost inputs cannot silently understate spending', () => {
  for (const args of [[60,1.1,30,1,4], [60,.4,30,.5,4], [60,.4,30,1,NaN], [60,.4,30,1,-1], [60,.4,30,1,4,0]]) {
    assert.throws(() => estimateCost(...args));
  }
});
