import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeStock,stockBulletin} from '../src/stock-data.js';
const now=Date.parse('2026-10-07T00:00:00Z');
test('stock normalization preserves provider timestamp and null missing change',()=>{const q=normalizeStock('AAPL',{c:200,t:now/1000},now);assert.equal(q.change,null);assert.equal(q.asOf,new Date(now).toISOString());});
test('rejects nonfinite and future quotes',()=>{for(const c of [0,-1,Infinity,'200'])assert.equal(normalizeStock('AAPL',{c,t:now/1000},now),null);assert.equal(normalizeStock('AAPL',{c:200,t:now/1000+600},now),null);});
test('stock bulletin explicitly identifies snapshots and omits old quotes',()=>{const q=normalizeStock('AAPL',{c:200,t:now/1000,dp:1},now);assert.match(stockBulletin([q],now),/not a streaming stock feed/);assert.doesNotMatch(stockBulletin([q],now+86400001),/200/);});
