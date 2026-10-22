import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { planWardrobe, dressHandoff, wardrobeReviewHTML } from '../pilot/script-desk/wardrobe.mjs';
import { makePack, startReview, command } from '../pilot/script-desk/core.mjs';

const catalogue = (count = 8) => ({schema: 1, timezone: 'Asia/Karachi', hosts: [{
  host_id: 'host', language: 'ur-PK', status: 'APPROVED', approval_ref: 'fixture-identity-approval',
  avatar_identity_id: 'fixture-identity', voice_id: 'fixture-voice',
  looks: Array.from({length: count}, (_, i) => ({look_id: `L${i}`, outfit_id: `O${i}`, label: `Fixture outfit ${i}`,
    provider_avatar_id: `fixture-provider-look-${i}`, avatar_identity_id: 'fixture-identity', programmes: ['*'],
    status: 'APPROVED', approval_ref: `fixture-look-approval-${i}`, qa_passed: true})),
}]});
const request = (n, date = '2026-01-01', programme = 'Brief') => ({episode_id: `edition${n}`, script_hash: `hash-${n}`,
  host_id: 'host', language: 'ur-PK', broadcast_date: date, programme});
const output = requests => ({stage: 'PREPRODUCTION_ONLY', render_authorized: false, paid_calls_authorized: false,
  episodes: requests.map(r => ({...r, hosts: [{host_id:r.host_id, language:r.language}], needs_source_refresh: false,
    needs_date_refresh: false, blockers: ['Select and approve V11 avatar and voice', 'Measure speech'],
    scenes: [1,2,3].map(n => ({id:`scene${n}`, speaker:r.host_id, spoken_text:`Unchanged ${n}`}))}))});

test('four daily editions use distinct outfits and exclude the previous broadcast day', () => {
  const c = catalogue();
  const first = planWardrobe([1,2,3,4].map(n => request(n)), c);
  const second = planWardrobe([5,6,7,8].map(n => request(n, '2026-01-02')), c, first.ledger);
  assert.equal(new Set(first.assignments.map(a => a.outfit_id)).size, 4);
  assert.equal(new Set([...first.assignments,...second.assignments].map(a => a.outfit_id)).size, 8);
  assert.equal(planWardrobe([request(9,'2026-01-03')], c, second.ledger).assignments.length, 1);
});
test('previous broadcast day means previous appearance even over a holiday gap', () => {
  const c = catalogue(2), first = planWardrobe([request(1)], c);
  const next = planWardrobe([request(2, '2026-01-10')], c, first.ledger);
  assert.notEqual(first.assignments[0].outfit_id, next.assignments[0].outfit_id);
});
test('retries keep exact outfit, identity and voice; partial additions preserve reservations', () => {
  const c = catalogue(), first = planWardrobe([request(1)], c);
  const again = planWardrobe([request(1),request(2)], c, first.ledger);
  assert.deepEqual(again.assignments[0], first.assignments[0]);
  const replay = planWardrobe([request(2),request(1)], c, again.ledger);
  assert.deepEqual(replay.ledger, again.ledger);
});
test('different camera looks in the same outfit do not count as different clothing', () => {
  const c = catalogue(2); c.hosts[0].looks[1].outfit_id = 'O0';
  assert.throws(() => planWardrobe([request(1),request(2)], c), /shortage/);
  const duplicate = catalogue(2); duplicate.hosts[0].looks[1].provider_avatar_id = duplicate.hosts[0].looks[0].provider_avatar_id;
  assert.throws(() => planWardrobe([request(1),request(2)], duplicate), /multiple outfits/);
});
test('allocation finds eligible combinations instead of consuming a restricted programme look', () => {
  const c = catalogue(2); c.hosts[0].looks[0].programmes = ['Brief','Close']; c.hosts[0].looks[1].programmes = ['Brief'];
  const result = planWardrobe([request(1),request(2,'2026-01-01','Close')], c);
  assert.equal(result.assignments[1].outfit_id, 'O0');
  assert.equal(result.assignments[0].outfit_id, 'O1');
});
test('insufficient inventory is atomic and cannot silently relax the repeat rules', () => {
  const c = catalogue(2), first = planWardrobe([request(1),request(2)], c), before = structuredClone(first.ledger);
  assert.throws(() => planWardrobe([request(3,'2026-01-02')], c, first.ledger), /No outfit was silently repeated/);
  assert.deepEqual(first.ledger, before);
  c.policy = {avoid_previous_broadcast_days:0};
  assert.throws(() => planWardrobe([request(3)], c), /1–14/);
});
test('unapproved, untested, wrong-identity and incompatible-language looks are blocked', () => {
  for (const mutate of [c => c.hosts[0].status='PENDING', c => c.hosts[0].voice_id='',
    c => c.hosts[0].looks[0].qa_passed=false, c => c.hosts[0].looks[0].status='PENDING',
    c => c.hosts[0].looks[0].avatar_identity_id='someone-else', c => c.hosts[0].language='en-US']) {
    const c = catalogue(1); mutate(c); assert.throws(() => planWardrobe([request(1)], c));
  }
});
test('script revisions, changed voices, revoked looks and tampered saved bindings cannot reuse a reservation', () => {
  const c = catalogue(), first = planWardrobe([request(1)], c);
  assert.throws(() => planWardrobe([{...request(1),script_hash:'new'}], c, first.ledger), /changed after/);
  const voice = structuredClone(c); voice.hosts[0].voice_id='new-voice';
  assert.throws(() => planWardrobe([request(1)], voice, first.ledger), /changed or/);
  const revoked = structuredClone(c); revoked.hosts[0].looks.find(l=>l.look_id===first.assignments[0].look_id).status='REVOKED';
  assert.throws(() => planWardrobe([request(1)], revoked, first.ledger), /no longer approved/);
  const tampered = structuredClone(first.ledger); tampered.assignments[0].provider_avatar_id='wrong-look';
  assert.throws(() => planWardrobe([request(1)], c, tampered), /binding/);
});
test('new older dates cannot invalidate a future reservation; existing older editions can replay', () => {
  const c = catalogue(), first = planWardrobe([request(1)], c);
  const second = planWardrobe([request(2,'2026-01-02')], c, first.ledger);
  assert.throws(() => planWardrobe([request(3)], c, second.ledger), /older wardrobe date/);
  assert.deepEqual(planWardrobe([request(1)], c, second.ledger).assignments[0], first.assignments[0]);
});
test('handoff binds every scene to the same outfit without changing scripts or granting render permission', () => {
  const h = output([request(1)]), original = structuredClone(h), result = dressHandoff(h, catalogue());
  assert.deepEqual(h, original);
  assert.equal(result.handoff.render_authorized, false); assert.equal(result.handoff.paid_calls_authorized, false);
  assert.equal(result.handoff.wardrobe.status, 'ASSIGNED');
  for (const scene of result.handoff.episodes[0].scenes) {
    assert.equal(scene.presenter.outfit_id, result.assignments[0].outfit_id);
    assert.equal(scene.presenter.voice_id, 'fixture-voice');
  }
  assert.deepEqual(result.handoff.episodes[0].blockers, ['Measure speech']);
});
test('stale scripts cannot be dressed and HTML escapes supplied labels', () => {
  const h = output([request(1)]); h.episodes[0].needs_date_refresh = true;
  assert.throws(() => dressHandoff(h, catalogue()), /stale/);
  const unknownSpeaker = output([request(1)]); unknownSpeaker.episodes[0].scenes[0].speaker='unknown';
  assert.throws(() => dressHandoff(unknownSpeaker, catalogue()), /registered episode host/);
  const c = catalogue(); c.hosts[0].looks.forEach(l => l.label='<script>alert(1)</script>');
  const html = wardrobeReviewHTML(dressHandoff(output([request(1)]), c).handoff);
  assert.ok(!html.includes('<script>')); assert.ok(html.includes('&lt;script&gt;'));
});

test('CLI approval automatically allocates configured wardrobe, writes readable review, and replays without duplicate reservations', t => {
  const root = mkdtempSync(path.join(tmpdir(),'wardrobe-cli-')); t.after(()=>rmSync(root,{recursive:true,force:true}));
  const now = Date.now(), broadcastDate = new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Karachi'}).format(new Date(now));
  const episode = n => ({episode_id:`demo_${n}`, version:1, programme:'Brief', timezone:'Asia/Karachi', broadcast_date:broadcastDate,
    source_cutoff:new Date(now-3600000).toISOString(), expires_at:new Date(now+86400000).toISOString(), status:'DRAFTED',
    target_editorial_seconds:300, hosts:[{host_id:'host',language:'ur-PK'}], blocks:[1,2,3].map(i=>({id:`b${i}`,speaker:'host',
      editorial_seconds:100,spoken_text:'لفظ '.repeat(210).trim(),subtitle_en:'Fixture translation',visual_cue:'Fixture cue',claim_ids:['c1']})),
    sources:[{id:'s1',url:'https://example.org/source',publisher:'Fixture',supports:'Fixture',checked_at:new Date(now-3600000).toISOString()}],
    claims:[{id:'c1',kind:'fact',text:'Fixture',source_ids:['s1']}],disclosure:'AI presenter',blockers:[],timing_basis:'estimated_not_measured'});
  const p = makePack('FIXTURE',[episode(1),episode(2)],new Date(now-30000).toISOString());
  const s = startReview(p,{reviewer:'reviewer@example.org',thread_id:'t',sent_message_id:'sent',sent_at:new Date(now-20000).toISOString()});
  const m = {id:'reply',thread_id:'t',from_address:'reviewer@example.org',sent_at:new Date(now-10000).toISOString(),text:command(p)};
  const files = Object.fromEntries(['pack','state','message','catalogue','ledger','handoff'].map(k=>[k,path.join(root,`${k}.json`)]));
  for (const [k,v] of Object.entries({pack:p,state:s,message:m,catalogue:catalogue()})) writeFileSync(files[k],JSON.stringify(v));
  const args = ['pilot/script-desk/cli.mjs','reply',files.pack,files.state,files.message,files.handoff,files.catalogue,files.ledger];
  const run = () => spawnSync(process.execPath,args,{cwd:path.resolve(import.meta.dirname,'..'),encoding:'utf8'});
  const first = run(); assert.equal(first.status,0,first.stderr);
  const ledger = readFileSync(files.ledger,'utf8');
  assert.equal(JSON.parse(readFileSync(files.handoff)).wardrobe.status,'ASSIGNED');
  assert.ok(existsSync(`${files.handoff}.wardrobe.html`));
  assert.equal(run().status,0); assert.equal(readFileSync(files.ledger,'utf8'),ledger);
  // A held ledger lock is never removed by a different process, and no repeat is allocated.
  writeFileSync(`${files.ledger}.lock`,'held');
  assert.equal(run().status,0);
  assert.equal(JSON.parse(readFileSync(files.handoff)).wardrobe.status,'BLOCKED');
  assert.ok(existsSync(`${files.ledger}.lock`)); assert.equal(readFileSync(files.ledger,'utf8'),ledger);
  assert.equal(JSON.parse(readFileSync(files.state)).status.P01,'SCRIPT_APPROVED');
});
