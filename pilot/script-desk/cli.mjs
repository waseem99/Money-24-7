import { readFileSync, writeFileSync, renameSync, openSync, closeSync, unlinkSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { makePack, validatePack, startReview, processReply, handoff, command, promptForBrief, validateEpisode } from './core.mjs';
const read = path => JSON.parse(readFileSync(path, 'utf8'));
const write = (path, value) => {
  mkdirSync(dirname(resolve(path)), { recursive: true, mode: 0o700 });
  const temp = `${path}.${process.pid}.tmp`;
  writeFileSync(temp, JSON.stringify(value, null, 2) + '\n', {mode: 0o600});
  renameSync(temp, path);
};
const [op, ...args] = process.argv.slice(2);
try {
  if (op === 'pack') {
    const [pilotId, first, second, out] = args;
    const pack = makePack(pilotId, [read(first), read(second)], new Date().toISOString());
    write(out, pack); console.log(JSON.stringify({pack_hash: validatePack(pack), approve: command(pack)}));
  } else if (op === 'check') {
    const pack = read(args[0]); console.log(JSON.stringify({pack_hash: validatePack(pack), approve: command(pack)}));
  } else if (op === 'start-review') {
    const [pack, receipt, out] = args; write(out, startReview(read(pack), read(receipt))); console.log('Review recorded');
  } else if (op === 'reply') {
    const [packPath, statePath, messagePath, handoffPath] = args;
    const lock = `${statePath}.lock`; const fd = openSync(lock, 'wx', 0o600);
    try {
      const pack = read(packPath); const result = processReply(pack, read(statePath), read(messagePath));
      if (result.changed) write(statePath, result.state);
      // Always recompute: safely repairs a crash between the state and handoff writes.
      write(handoffPath, handoff(pack, result.state, new Date().toISOString()));
      console.log(JSON.stringify({changed: result.changed, reason: result.reason, status: result.state.status}));
    } finally { closeSync(fd); unlinkSync(lock); }
  } else if (op === 'prompt') {
    console.log(promptForBrief(read(args[0])));
  } else if (op === 'generate') {
    if (args[2] !== '--allow-model-call') throw new Error('Explicit --allow-model-call required');
    if (!process.env.AI_GATEWAY_API_KEY || !process.env.AI_GATEWAY_MODEL) throw new Error('Set AI_GATEWAY_API_KEY and AI_GATEWAY_MODEL');
    const { generateText } = await import('ai');
    const result = await generateText({ model: process.env.AI_GATEWAY_MODEL, prompt: promptForBrief(read(args[0])), maxOutputTokens: 9000, maxRetries: 0, abortSignal: AbortSignal.timeout(120000) });
    const episode = JSON.parse(result.text.replace(/^```(?:json)?\s*|\s*```$/g, ''));
    validateEpisode(episode); write(args[1], episode); console.log('Unapproved draft written');
  } else throw new Error('Usage: pack ID A.json B.json OUT.json | check PACK | start-review PACK RECEIPT STATE | reply PACK STATE MESSAGE HANDOFF | prompt BRIEF | generate BRIEF OUT --allow-model-call');
} catch (error) { console.error(error.message); process.exitCode = 1; }
