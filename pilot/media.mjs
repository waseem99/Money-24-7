import {spawn} from 'node:child_process';
import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {hash} from './contracts.mjs';

export async function command(bin,args) {
  return new Promise((resolve,reject)=>{
    const child=spawn(bin,args,{stdio:['ignore','pipe','pipe']});let stdout='',stderr='';
    child.stdout.on('data',x=>stdout+=x);child.stderr.on('data',x=>{stderr=(stderr+x).slice(-30000);});
    child.on('error',()=>reject(new Error(`${bin} is required on the worker`)));
    child.on('close',code=>code===0?resolve({stdout,stderr}):reject(new Error(`${bin} failed (${code}): ${stderr.slice(-1400)}`)));
  });
}
export async function probe(file) {
  const {stdout}=await command('ffprobe',['-v','error','-show_format','-show_streams','-of','json',file]);
  const p=JSON.parse(stdout);const video=p.streams.find(x=>x.codec_type==='video');const audio=p.streams.find(x=>x.codec_type==='audio');
  const timing=s=>({duration:Number(s.duration||p.format.duration),start:Number(s.start_time||0)});
  return {duration:Number(p.format.duration),bytes:Number(p.format.size),video:video?{width:video.width,height:video.height,codec:video.codec_name,fps:video.avg_frame_rate,...timing(video)}:null,audio:audio?{codec:audio.codec_name,sampleRate:Number(audio.sample_rate),channels:audio.channels,...timing(audio)}:null};
}
export async function mediaRecord(file,metadata={}) {return {file:path.basename(file),sha256:hash(await readFile(file)),...await probe(file),...metadata};}
export function checkTake(shot,record,{voice=false}={}) {
  if(!record.audio) throw new Error(`${shot.id}: audible source track required`);
  if(!voice && (!record.video || record.video.width<1280 || record.video.height<720)) throw new Error(`${shot.id}: minimum source resolution is 1280×720`);
  if(!voice&&Number.isFinite(record.audio.duration)&&Number.isFinite(record.video.duration)&&(Math.abs(record.audio.duration-record.video.duration)>.15||Math.abs(record.audio.start-record.video.start)>.12))throw new Error(`${shot.id}: audio/video timing mismatch`);
  if(!Number.isFinite(record.duration)||record.duration>shot.duration-0.15 || record.duration<shot.duration-3) throw new Error(`${shot.id}: ${record.duration.toFixed(2)}s take must fit ${shot.duration}s slot with 0.15–3s breathing room. Revise text or import a better-paced take; no speech trimming/stretching.`);
}
export function vttTime(t) {return new Date(Math.round(t*1000)).toISOString().slice(11,23);}
export function timedCues(shot,asset,{fixture=false}={}) {
  const alignment=asset?.alignment;
  const cues=(shot.cues||[]).map(cue=>{
    if(!cue.phrase||!alignment||fixture)return {...cue};
    const index=alignment.characters.join('').toLowerCase().indexOf(cue.phrase.toLowerCase());
    if(index<0)throw new Error(`Cannot align graphic cue in ${shot.id}; supply corrected timing/phrase`);
    const at=alignment.character_start_times_seconds[index];
    if(!Number.isFinite(at)||at<0||at>=shot.duration)throw new Error('Invalid measured cue time');
    return {...cue,at};
  });
  return cues.sort((a,b)=>a.at-b.at);
}
export async function writeCaptions(episode,assets,file,{fixture=false}={}) {
  let output='WEBVTT\n\n';
  for(const s of episode.shots.filter(s=>s.text)) {
    const a=assets[s.id]?.alignment;
    if(a) {
      let start=0;
      for(let i=0;i<a.characters.length;i++) {
        if((i-start>=52 && a.characters[i]===' ') || i===a.characters.length-1) {
          output+=`${vttTime(s.start+a.character_start_times_seconds[start])} --> ${vttTime(s.start+a.character_end_times_seconds[i])}\n${a.characters.slice(start,i+1).join('').replace(/[<>]/g,'')}\n\n`;start=i+1;
        }
      }
    } else if(fixture) {
      const words=s.text.split(/\s+/);const chunks=[];for(let i=0;i<words.length;i+=12)chunks.push(words.slice(i,i+12).join(' '));
      chunks.forEach((chunk,i)=>output+=`${vttTime(s.start+i*s.duration/chunks.length)} --> ${vttTime(s.start+(i+1)*s.duration/chunks.length)}\n[Unvoiced rehearsal] ${chunk}\n\n`);
    }
  }
  await writeFile(file,output);
}
export async function measureLoudness(file) {
  const {stderr}=await command('ffmpeg',['-hide_banner','-i',file,'-af','loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json','-f','null','-']);
  const match=stderr.match(/\{\s*"input_i"[\s\S]*?\}/);if(!match) throw new Error('Loudness analysis missing');return JSON.parse(match[0]);
}
export async function verifyAudible(file) {
  const measured=await measureLoudness(file);
  if(!Number.isFinite(Number(measured.input_i))||Number(measured.input_i)<-45||Number(measured.input_tp)<-35)throw new Error('Presenter source is silent or too quiet; supply an audible voice take');
  return measured;
}
export function parseAnomalies(log,duration){
  const black=[...log.matchAll(/black_start:([\d.]+) black_end:([\d.]+) black_duration:([\d.]+)/g)].map(m=>({start:+m[1],end:+m[2],duration:+m[3]}));
  const ranges=kind=>{let start=null;const out=[];for(const m of log.matchAll(new RegExp(`${kind}_(start|end):\\s*([\\d.]+)`,'g'))){if(m[1]==='start')start=+m[2];else if(start!==null){out.push({start,end:+m[2],duration:+m[2]-start});start=null;}}if(start!==null)out.push({start,end:duration,duration:duration-start});return out;};
  return {black,freeze:ranges('freeze'),silence:ranges('silence')};
}
export async function inspectMedia(file,{freeze=true,silence=true}={}) {
  const media=await probe(file);const filters=['blackdetect=d=0.25:pix_th=0.10:pic_th=0.98'];if(freeze)filters.push('freezedetect=n=-60dB:d=2');
  const args=['-hide_banner','-xerror','-i',file,'-vf',filters.join(',')];if(silence&&media.audio)args.push('-af','silencedetect=noise=-45dB:d=2');args.push('-f','null','-');
  const {stderr}=await command('ffmpeg',args);const events=parseAnomalies(stderr,media.duration);
  return {...events,pass:!events.black.length&&(!freeze||!events.freeze.length)&&(!silence||!events.silence.some(e=>!(e.end>=media.duration-.15&&e.duration<=3)))};
}
