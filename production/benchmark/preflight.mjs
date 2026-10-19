import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// Offline evidence tooling only. No provider calls, credentials or generation.
export function estimateCost(minutes, share, days, attempts, rate, layers = 1) {
  const values = [minutes, share, days, attempts, rate, layers];
  if (values.some(v => typeof v !== 'number' || !Number.isFinite(v) || v < 0) || share > 1 || attempts < 1 || layers < 1) {
    throw new Error('Expected nonnegative finite values, share 0..1, attempts/layers >=1');
  }
  const billedMinutes = minutes * share * days * attempts * layers;
  return { billedMinutes, estimatedUsd: Math.round(billedMinutes * rate * 100) / 100,
    excludes: ['voice', 'cinematic shots', 'data rights', 'infrastructure', 'labour', 'tax'],
    pricingStatus: 'caller-supplied estimate; not a provider quote' };
}

export async function inspectReference(file) {
  const metadata = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', resolve(file)], {encoding: 'utf8'}));
  const video = metadata.streams.find(s => s.codec_type === 'video');
  if (!video || !Number.isFinite(Number(metadata.format.duration))) throw new Error('Readable video with finite duration required');
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return { sha256: hash.digest('hex'), durationSeconds: Number(metadata.format.duration),
    width: video.width, height: video.height, frameRate: video.avg_frame_rate,
    hasAudio: metadata.streams.some(s => s.codec_type === 'audio'),
    original1080Master: video.width >= 1920 && video.height >= 1080,
    qualityStatus: 'metadata only; human audiovisual review required' };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const [command, ...args] = process.argv.slice(2);
    if (command === 'cost' && [5, 6].includes(args.length) && args.every(x => x.trim())) console.log(JSON.stringify(estimateCost(...args.map(Number)), null, 2));
    else if (command === 'inspect' && args.length === 1) console.log(JSON.stringify(await inspectReference(args[0]), null, 2));
    else throw new Error('Usage: preflight.mjs inspect VIDEO | cost MINUTES SHARE DAYS ATTEMPTS USD_PER_MIN [LAYERS]');
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
