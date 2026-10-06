import test from 'node:test';
import assert from 'node:assert/strict';
import {parseFeed,feeds} from '../lib/news.js';
const date='Mon, 05 Oct 2026 12:00:00 GMT',now=Date.parse('2026-10-06');
const rss=(link,published=date)=>`<rss><channel><item><title>Policy release</title><link>${link}</link><pubDate>${published}</pubDate></item></channel></rss>`;
test('normalizes official RSS with source and publication time',()=>{assert.equal(parseFeed(rss('https://www.federalreserve.gov/newsevents/a.htm'),feeds[0],now)[0].source,'Federal Reserve');});
test('rejects lookalike hosts, credentials, unsafe schemes and future dates',()=>{for(const url of ['https://federalreserve.gov.evil.test/a','javascript:alert(1)','https://user@federalreserve.gov/a'])assert.equal(parseFeed(rss(url),feeds[0],now).length,0);assert.equal(parseFeed(rss('https://federalreserve.gov/a','2028-01-01'),feeds[0],now).length,0);});
test('normalizes Atom alternate link',()=>{const xml='<feed><entry><title>Jobs release</title><updated>2026-10-05T12:00:00Z</updated><link rel="alternate" href="https://www.bls.gov/news.release/empsit.htm"/></entry></feed>';assert.equal(parseFeed(xml,feeds[1],now).length,1);});
test('rejects entity declarations',()=>assert.throws(()=>parseFeed('<!DOCTYPE rss><rss/>',feeds[0],now)));
