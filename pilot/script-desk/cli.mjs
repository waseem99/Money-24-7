import { readFileSync, writeFileSync, renameSync, openSync, closeSync, unlinkSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { makePack, validatePack, startReview, processReply, handoff, command, promptForBrief, validateEpisode } from './core.mjs';
import { dressHandoff, emptyWardrobeLedger, wardrobeReviewHTML } from './wardrobe.mjs';
const read = path => JSON.parse(readFileSync(path, 'utf8'));
const write = (path, value) => {
  mkdirSync(dirname(resolve(path)), { recursive: true, mode: 0o700 });
  const temp = `${path}.${process.pid}.tmp`;
  writeFileSync(temp, JSON.stringify(value, null, 2) + '\n', {mode: 0o600});
  renameSync(temp, path);
};
function configuredWardrobe(output, cataloguePath, ledgerPath) {
  cataloguePath ||= process.env.TAMASHA_WARDROBE_CATALOG;
  ledgerPath ||= process.env.TAMASHA_WARDROBE_LEDGER;
  if (!cataloguePath && !ledgerPath) return output;
  if (!output.episodes.length) return output;
  let fd, lock;
  try {
    if (!cataloguePath || !ledgerPath) throw new Error('Both wardrobe catalogue and ledger paths required');
    if (resolve(cataloguePath) === resolve(ledgerPath)) throw new Error('Catalogue and ledger must be different files');
    mkdirSync(dirname(resolve(ledgerPath)), {recursive: true, mode: 0o700});
    lock = `${ledgerPath}.lock`; fd = openSync(lock, 'wx', 0o600);
    let ledger;
    try { ledger = read(ledgerPath); } catch (error) { if (error.code !== 'ENOENT') throw error; ledger = emptyWardrobeLedger(); }
    const result = dressHandoff(output, read(cataloguePath), ledger);
    // Commit reservations first. A retry repairs any later handoff/HTML write failure.
    write(ledgerPath, result.ledger);
    return result.handoff;
  } catch (error) {
    return { ...output, wardrobe: {status: 'BLOCKED', reason: error.message} };
  } finally { if (fd !== undefined) { closeSync(fd); unlinkSync(lock); } }
}
function writeProduction(outputPath, output) {
  write(outputPath, output);
  const htmlPath = `${outputPath}.wardrobe.html`;
  const temp = `${htmlPath}.${process.pid}.tmp`;
  writeFileSync(temp, wardrobeReviewHTML(output), {mode: 0o600}); renameSync(temp, htmlPath);
}
function distinctPaths(paths) {
  const provided = paths.filter(Boolean).map(p => resolve(p));
  if (new Set(provided).size !== provided.length) throw new Error('Input, state, catalogue, ledger and output paths must be distinct');
}
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
    const [packPath, statePath, messagePath, handoffPath, cataloguePath, ledgerPath] = args;
    distinctPaths([packPath, statePath, messagePath, handoffPath, cataloguePath || process.env.TAMASHA_WARDROBE_CATALOG, ledgerPath || process.env.TAMASHA_WARDROBE_LEDGER]);
    const lock = `${statePath}.lock`; const fd = openSync(lock, 'wx', 0o600);
    try {
      const pack = read(packPath); const result = processReply(pack, read(statePath), read(messagePath));
      if (result.changed) write(statePath, result.state);
      // Always recompute: safely repairs a crash between the state and handoff writes.
      const output = configuredWardrobe(handoff(pack, result.state, new Date().toISOString()), cataloguePath, ledgerPath);
      writeProduction(handoffPath, output);
      console.log(JSON.stringify({changed: result.changed, reason: result.reason, status: result.state.status, wardrobe: output.wardrobe}));
    } finally { closeSync(fd); unlinkSync(lock); }
  } else if (op === 'wardrobe') {
    const [packPath, statePath, cataloguePath, ledgerPath, out] = args;
    if (!out) throw new Error('Usage: wardrobe PACK STATE CATALOG LEDGER OUT');
    distinctPaths([packPath, statePath, cataloguePath, ledgerPath, out]);
    const output = configuredWardrobe(handoff(read(packPath), read(statePath), new Date().toISOString()), cataloguePath, ledgerPath);
    writeProduction(out, output);
    console.log(JSON.stringify({wardrobe: output.wardrobe, review: `${out}.wardrobe.html`, paid_calls: 0}));
    if (output.wardrobe.status !== 'ASSIGNED') process.exitCode = 1;
  } else if (op === 'prompt') {
    console.log(promptForBrief(read(args[0])));
  } else if (op === 'generate') {
    if (args[2] !== '--allow-model-call') throw new Error('Explicit --allow-model-call required');
    if (!process.env.AI_GATEWAY_API_KEY || !process.env.AI_GATEWAY_MODEL) throw new Error('Set AI_GATEWAY_API_KEY and AI_GATEWAY_MODEL');
    const { generateText } = await import('ai');
    const result = await generateText({ model: process.env.AI_GATEWAY_MODEL, prompt: promptForBrief(read(args[0])), maxOutputTokens: 9000, maxRetries: 0, abortSignal: AbortSignal.timeout(120000) });
    const episode = JSON.parse(result.text.replace(/^```(?:json)?\s*|\s*```$/g, ''));
    validateEpisode(episode); write(args[1], episode); console.log('Unapproved draft written');
  } else throw new Error('Usage: pack ID A.json B.json OUT.json | check PACK | start-review PACK RECEIPT STATE | reply PACK STATE MESSAGE HANDOFF [CATALOG LEDGER] | wardrobe PACK STATE CATALOG LEDGER OUT | prompt BRIEF | generate BRIEF OUT --allow-model-call');
} catch (error) { console.error(error.message); process.exitCode = 1; }
