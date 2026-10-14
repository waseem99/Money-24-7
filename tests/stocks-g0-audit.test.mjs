import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const audit=JSON.parse(readFileSync(new URL('../docs/stocks/G0-VERIFIED-VIDEO-INVENTORY-20261014.json',import.meta.url),'utf8'));
const master=JSON.parse(readFileSync(new URL('../docs/STOCKS-17-SHOT-READINESS-20261014.json',import.meta.url),'utf8'));

test('G0 media audit records 12 actual decoded videos, not just successful CI jobs',()=>{
 assert.equal(audit.qa_summary.archives_downloaded,5);
 assert.equal(audit.qa_summary.video_files_verified,12);
 assert.equal(audit.files.length,12);
 assert.equal(audit.qa_summary.full_decode_pass,12);
 assert.ok(audit.files.every(x=>x.full_decode==='PASS' && x.valid_asset && x.duration_seconds>0));
 assert.ok(audit.files.every(x=>/^[0-9a-f]{64}$/.test(x.sha256)));
 assert.equal(new Set(audit.files.map(x=>x.sha256)).size,audit.files.length);
 assert.equal(new Set(audit.files.map(x=>x.name)).size,audit.files.length);
 assert.ok(audit.files.every(x=>x.height>=540 && x.width>=960));
 assert.ok(audit.files.every(x=>!x.visual_approved));
});

test('Original Liza and Lasse media are separate from generated alternative identities',()=>{
 assert.equal(audit.files.filter(x=>x.bank==='R5').length,4);
 assert.equal(audit.files.filter(x=>x.bank!=='R5').length,8);
 assert.ok(audit.files.filter(x=>x.bank==='R5').every(x=>x.on_air_cast_approved));
 assert.ok(audit.files.filter(x=>x.bank!=='R5').every(x=>!x.on_air_cast_approved));
 assert.equal(master.cast.nora.look_id,'5ee67ac453c34ffebd71e8eedb47b2fe');
 assert.equal(master.cast.marcus.look_id,'de9f36c26bd841c891489a0c9d6174de');
 assert.equal(audit.editorial_version_decision_required,true);
});

test('Artifact expiry and missing W6 shot 20 block premature release',()=>{
 assert.equal(audit.source_artifacts.W3.expires,'2026-10-27T07:45:00Z');
 assert.ok(audit.missing.some(x=>x.expected_name==='stocks-w6-shot-20.mp4'));
 assert.ok(!audit.files.some(x=>x.name==='stocks-w6-shot-20.mp4'));
 assert.equal(audit.qa_summary.has_verified_offsite_backup,false);
 assert.equal(audit.broadcast_release_approved,false);
 assert.equal(audit.paid_generation_performed_during_recovery,false);
 assert.equal(master.release_state,'BLOCKED_PENDING_GATES');
 assert.equal(master.spend_guard.new_paid_submissions_enabled,false);
});
