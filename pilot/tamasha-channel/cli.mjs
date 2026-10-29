#!/usr/bin/env node
import {rm} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {runFullM1} from './m1.mjs';
import {twoDistinctEditions} from './fixtures.mjs';
import {DeskService} from './service.mjs';
import {FileStore} from './store.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.data/tamasha-channel');

function usage() {
  console.log(`Tamasha MarketWatch M1 (Node)

node pilot/tamasha-channel/cli.mjs seed-editions [--data DIR]
node pilot/tamasha-channel/cli.mjs demo-m1 [--data DIR]
node pilot/tamasha-channel/cli.mjs show EPISODE_ID [--version N] [--data DIR]
`);
}

function argValue(argv, name, fallback = null) {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : fallback;
}

async function main(argv = process.argv.slice(2)) {
  const cmd = argv[0];
  if (!cmd || cmd === '-h' || cmd === '--help') {
    usage();
    return 0;
  }
  const data = path.resolve(argValue(argv, '--data', root));
  const store = await new FileStore(data).init();

  if (cmd === 'seed-editions') {
    const [a, b] = twoDistinctEditions();
    await store.savePack(a);
    await store.savePack(b);
    console.log(JSON.stringify({saved: [a.episodeId, b.episodeId], data}, null, 2));
    return 0;
  }

  if (cmd === 'demo-m1') {
    const target = path.join(data, 'demo-m1');
    await rm(target, {recursive: true, force: true});
    const result = await runFullM1(target);
    console.log(JSON.stringify(result, null, 2));
    return 0;
  }

  if (cmd === 'show') {
    const episodeId = argv[1];
    if (!episodeId) throw new Error('episode id required');
    const version = argValue(argv, '--version');
    const pack = await store.loadPack(episodeId, version ? Number(version) : null);
    console.log(JSON.stringify({
      episodeId: pack.episodeId,
      programme: pack.programme,
      edition: pack.edition,
      version: pack.version,
      state: pack.state,
      scriptSha: pack.scriptSha,
      hashToken: pack.hashToken,
      versions: await store.listVersions(pack.episodeId),
      changeNotes: pack.changeNotes,
    }, null, 2));
    return 0;
  }

  usage();
  return 1;
}

main().then(code => process.exit(code)).catch(err => {
  console.error(err.message || err);
  process.exit(1);
});
