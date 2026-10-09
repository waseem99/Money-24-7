import {createHash} from 'node:crypto';
import {readFile, writeFile, rename, mkdir} from 'node:fs/promises';
import path from 'node:path';
import {spokenText} from './pronunciation.mjs';

export const hash = value => createHash('sha256').update(typeof value === 'string' || Buffer.isBuffer(value) ? value : JSON.stringify(value)).digest('hex');
export const id = value => {
  if (typeof value !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(value)) throw new Error('Invalid identifier');
  return value;
};
export async function readJSON(file) { return JSON.parse(await readFile(file, 'utf8')); }
export async function atomicJSON(file, value) {
  await mkdir(path.dirname(file), {recursive:true});
  const temp = `${file}.${process.pid}.tmp`;
  await writeFile(temp, `${JSON.stringify(value, null, 2)}\n`, {mode:0o600});
  await rename(temp, file);
}
export function realSetting(value) {
  return typeof value === 'string' && value.trim().length > 2 && !/dummy|placeholder|your_|replace|example|changeme/i.test(value);
}
export function validateAlignment(a,limit=Infinity) {
  if(!Array.isArray(a?.characters)||!a.characters.length||a.characters.length!==a.character_start_times_seconds?.length||a.characters.length!==a.character_end_times_seconds?.length)throw new Error('Invalid speech alignment');
  let previous=0;
  for(let i=0;i<a.characters.length;i++){
    const start=a.character_start_times_seconds[i],end=a.character_end_times_seconds[i];
    if(typeof a.characters[i]!=='string'||!Number.isFinite(start)||!Number.isFinite(end)||start<previous||end<start||end>limit)throw new Error('Invalid speech timing');
    previous=start;
  }
  return a;
}
export function validateEpisode(e) {
  if (e.version !== 1 || !e.title || e.language !== 'en' || !Array.isArray(e.shots)) throw new Error('Invalid episode contract');
  id(e.id);
  if (e.disclosure !== 'Prepared programme · AI presenters · Illustrative data') throw new Error('Disclosure must be explicit');
  if (!Array.isArray(e.sources) || !e.sources.length) throw new Error('Missing evidence snapshot');
  const sources = new Set(e.sources.map(s => id(s.id)));
  if (sources.size !== e.sources.length) throw new Error('Duplicate source');
  for (const s of e.sources) if (!s.summary || !s.capturedAt || !s.kind || (s.kind === 'reference' && !/^https:\/\//.test(s.url))) throw new Error('Invalid source');
  if (Object.keys(e.presenters || {}).sort().join() !== 'analyst,anchor') throw new Error('Two presenter definitions required');
  const seen = new Set(); let time = 0;
  for (const shot of e.shots) {
    id(shot.id);
    if (seen.has(shot.id)) throw new Error('Duplicate shot'); seen.add(shot.id);
    if (shot.start !== time || !Number.isInteger(shot.duration) || shot.duration < 3 || shot.duration > 90) throw new Error('Timeline gap/overlap or invalid duration');
    time += shot.duration;
    if (!['ident','presenter','graphic','split'].includes(shot.layout) || !['anchor','analyst',null].includes(shot.speaker)) throw new Error('Invalid shot direction');
    if(shot.layout==='split'&&(!shot.speaker||!['anchor','analyst'].includes(shot.listener)||shot.listener===shot.speaker))throw new Error('Split scene requires a different listener');
    if(shot.speaker)spokenText(shot.text,[...(e.pronunciations||[]),...(e.presenters[shot.speaker].pronunciations||[])]);
    if (!shot.headline || shot.headline.length > 70 || !shot.segment || !Array.isArray(shot.cards) || shot.cards.length > 3) throw new Error('Invalid graphics');
    for (const card of shot.cards) if (!card.label || !card.value || card.label.length > 35 || card.value.length > 30) throw new Error('Graphic text exceeds safe area');
    if (!Array.isArray(shot.sourceIds) || shot.sourceIds.some(s=>!sources.has(s))) throw new Error('Unknown evidence reference');
    if (typeof shot.text !== 'string' || (shot.speaker && (!shot.text.trim() || !shot.sourceIds.length))) throw new Error('Missing dialogue or grounding');
    if (shot.text.length > 1800 || (!shot.speaker && shot.text)) throw new Error('Invalid dialogue length');
    const wpm = shot.text.trim().split(/\s+/).filter(Boolean).length / shot.duration * 60;
    if (shot.speaker && (wpm < 70 || wpm > 170)) throw new Error(`Unnatural planned pace in ${shot.id}: ${Math.round(wpm)} wpm`);
    for (const cue of shot.cues || []) if (!(cue.at >= 0 && cue.at < shot.duration) || !cue.label || cue.label.length > 80 || (cue.phrase&&!shot.text.toLowerCase().includes(cue.phrase.toLowerCase()))) throw new Error('Invalid graphic cue');
    if(shot.chart){const c=shot.chart;if(c.type!=='bar'||!Number.isFinite(c.max)||c.max<=0||c.series?.length!==3||c.series.some(p=>!p.label||p.label.length>30||!Number.isFinite(p.value)||p.value<0||p.value>c.max))throw new Error('Invalid chart scale or series');}
  }
  if (time !== 300) throw new Error('Pilot must be exactly 300 seconds');
  if (new Set(e.shots.filter(s=>s.speaker).map(s=>s.speaker)).size !== 2) throw new Error('Both presenters must speak');
  return e;
}
export function validateDirector(base, output) {
  if (!Array.isArray(output.shots) || output.shots.length !== base.shots.length) throw new Error('Director changed shot count');
  const next = structuredClone(base);
  next.shots = base.shots.map((s,i)=> {
    const item = output.shots[i];
    if (item.id !== s.id || typeof item.text !== 'string' || typeof item.imagePrompt !== 'string') throw new Error('Invalid director shot');
    // Numerical claims and labels are immutable. Reject additions AND omissions.
    const numbers = text => (text.match(/\b\d+(?:[.,]\d+)*(?:%|\b)/g)||[]).sort().join('|');
    if (numbers(item.text) !== numbers(s.text)) throw new Error(`Director changed numerical claims in ${s.id}`);
    return {...s,text:item.text,imagePrompt:item.imagePrompt};
  });
  return validateEpisode(next);
}
