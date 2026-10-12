import test from 'node:test';
import assert from 'node:assert/strict';
import {audit, EDITION, LOCKED_CAST, PROOF} from '../pilot/stocks/r5/original-cast.mjs';

test('the original cast and original voices are restored',()=>{
  assert.equal(LOCKED_CAST.NORA.providerName,'Liza Office 6');
  assert.equal(LOCKED_CAST.NORA.avatarId,'5ee67ac453c34ffebd71e8eedb47b2fe');
  assert.equal(LOCKED_CAST.NORA.voiceId,'330290724a1b470fb63153f34d4c0183');
  assert.equal(LOCKED_CAST.MARCUS.providerName,'Lasse Office 3');
  assert.equal(LOCKED_CAST.MARCUS.avatarId,'de9f36c26bd841c891489a0c9d6174de');
  assert.equal(LOCKED_CAST.MARCUS.voiceId,'00e3d285aba44b27a83c47c02c9c2d9c');
  assert.notEqual(LOCKED_CAST.NORA.avatarId,'Caroline_Business_Sitting_Front_public');
  assert.notEqual(LOCKED_CAST.MARCUS.avatarId,'Brandon_Business_Sitting_Front_public');
});
test('the R5 script is concise, genuinely sourced and consistent with the show',()=>{
  const a=audit();
  assert.equal(a.pass,true,JSON.stringify(a.errors));
  assert.equal(a.fullMasterAuthorized,false);
  assert.equal(a.paidVideoPostsMadeByAudit,0);
  assert.deepEqual(PROOF.scriptOrder,['NORA','MARCUS']);
  assert.equal(EDITION.allLogoPlacements.length,1);
  assert.equal(EDITION.noWallLogo,true);
  assert.equal(EDITION.date,'2026-10-12');
  assert.deepEqual(EDITION.sectors.map(x=>x.percent),[1.8,-0.2]);
  assert.ok(PROOF.editingPlaybackRate>=1.05&&PROOF.editingPlaybackRate<=1.12);
  assert.ok(a.estimatedMaximumBothUSD<=0.55);
});
