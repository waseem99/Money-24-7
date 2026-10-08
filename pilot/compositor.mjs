import path from 'node:path';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {renderFrame,renderCue} from './graphics.mjs';
import {command,mediaRecord,measureLoudness,writeCaptions,checkTake,probe,verifyAudible,timedCues} from './media.mjs';
import {atomicJSON,hash,readJSON} from './contracts.mjs';
import {soundtrack} from './soundtrack.mjs';

export async function compose(episode,manifest,root,{fixture=false,onProgress=()=>{}}={}) {
  const output=path.join(root,'output');await mkdir(output,{recursive:true});
  const bed=path.join(output,'soundtrack.wav');if(!fixture)await soundtrack(bed);
  let illustration;
  if(!fixture&&manifest.illustration){illustration=path.join(root,'assets',manifest.illustration.file);if(hash(await readFile(illustration))!==manifest.illustration.sha256)throw new Error('Illustration changed');}
  const files=[];const sources=[];
  const rendererHash=hash(await readFile(new URL('./compositor.mjs',import.meta.url)))+hash(await readFile(new URL('./graphics.mjs',import.meta.url)));
  for(const shot of episode.shots) {
    onProgress(`Composing ${shot.id}`);
    const frame=path.join(output,`${shot.id}.png`);await renderFrame(episode,shot,frame,{fixture,illustration});
    const asset=manifest.assets[shot.id];const hasClip=Boolean(shot.speaker && !fixture);
    if(hasClip) {
      if(!asset || asset.fixture || asset.kind!=='presenter')throw new Error(`Real presenter clip missing: ${shot.id}`);
      const actual=await mediaRecord(path.join(root,'assets',asset.file));if(actual.sha256!==asset.sha256)throw new Error('Source media changed since verification');checkTake(shot,actual);
      await verifyAudible(path.join(root,'assets',asset.file));
      sources.push({shot:shot.id,...asset});
    }
    const file=path.join(output,`${shot.id}.mkv`);
    const fingerprint=hash({rendererHash,shot,fixture,asset,illustration:manifest.illustration});
    const cached=await readJSON(`${file}.json`).catch(()=>null);
    if(cached?.fingerprint===fingerprint){const actual=await mediaRecord(file).catch(()=>null);if(actual?.sha256===cached.sha256&&Math.abs(actual.duration-shot.duration)<=.05){files.push(file);continue;}}
    const args=['-hide_banner','-loglevel','error','-y','-loop','1','-framerate','30','-i',frame];
    if(hasClip) args.push('-i',path.join(root,'assets',asset.file));
    else args.push('-f','lavfi','-i','anullsrc=r=48000:cl=stereo');
    const filters=[];
    if(hasClip && shot.layout==='presenter') {
      filters.push('[1:v]scale=960:600:force_original_aspect_ratio=decrease,pad=960:600:(ow-iw)/2:(oh-ih)/2:color=0x101c2d,setsar=1,tpad=stop_mode=clone:stop_duration=3[face]');
      filters.push('[0:v][face]overlay=96:212:shortest=1[base]');
    } else filters.push('[0:v]null[base]');
    let prior='base';
    const cues=timedCues(shot,asset,{fixture});
    for(const [i,cue] of cues.entries()) {
      const cueFile=path.join(output,`${shot.id}-cue-${i}.png`);await renderCue(cue.label,cueFile);args.push('-loop','1','-framerate','30','-i',cueFile);
      const end=cues[i+1]?.at??shot.duration;
      filters.push(`[${prior}][${i+2}:v]overlay=96:819:enable='gte(t,${cue.at})*lt(t,${end})'[cue${i}]`);prior=`cue${i}`;
    }
    filters.push(`[${prior}]drawbox=x=0:y=1074:w=1920:h=6:color=0x274757:t=fill,format=yuv420p[v]`);
    if(fixture)filters.push('[1:a]aresample=48000,apad[a]');
    else{
      const musicIndex=2+cues.length;args.push('-ss',String(shot.start),'-t',String(shot.duration),'-i',bed);
      filters.push('[1:a]aresample=48000,apad[voice]');filters.push(`[voice][${musicIndex}:a]amix=inputs=2:normalize=0:duration=shortest[a]`);
    }
    // PCM intermediates avoid AAC encoder-priming overlap at every edit.
    args.push('-filter_complex_threads','1','-filter_complex',filters.join(';'),'-map','[v]','-map','[a]','-t',String(shot.duration),'-r','30','-c:v','libx264','-preset',fixture?'ultrafast':'medium','-crf',fixture?'23':'18','-threads','2','-c:a','pcm_s16le','-ar','48000',file);
    await command('ffmpeg',args);
    // A successful encoder exit alone is insufficient: truncated containers must
    // never make the concat demuxer silently stop the programme early.
    const check=await probe(file);
    if(Math.abs(check.duration-shot.duration)>.05||check.video?.fps!=='30/1')throw new Error(`Invalid rendered shot: ${shot.id}`);
    await atomicJSON(`${file}.json`,{fingerprint,sha256:hash(await readFile(file))});
    files.push(file);
  }
  // Only worker-generated, validated basenames enter the concat file.
  const concat=path.join(output,'concat.txt');await writeFile(concat,files.map(f=>`file '${path.basename(f)}'`).join('\n')+'\n');
  const joined=path.join(output,'assembled.mkv');await command('ffmpeg',['-hide_banner','-loglevel','error','-xerror','-y','-f','concat','-safe','1','-i',concat,'-c','copy',joined]);
  const master=path.join(output,'master.mp4');let loudness=null;
  if(fixture) await command('ffmpeg',['-hide_banner','-loglevel','error','-xerror','-y','-i',joined,'-c:v','libx264','-preset','ultrafast','-crf','23','-threads','2','-r','30','-c:a','aac','-ar','48000','-t','300','-movflags','+faststart',master]);
  else {
    onProgress('Measuring and normalizing programme audio');const m=await measureLoudness(joined);
    if(!Number.isFinite(Number(m.input_i)))throw new Error('Programme audio is silent');
    const filter=`loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`;
    await command('ffmpeg',['-hide_banner','-loglevel','error','-xerror','-y','-i',joined,'-af',filter,'-c:v','libx264','-preset','medium','-crf','18','-threads','2','-r','30','-c:a','aac','-b:a','192k','-ar','48000','-t','300','-movflags','+faststart',master]);loudness=await measureLoudness(master);
  }
  await writeCaptions(episode,manifest.assets,path.join(output,'captions.vtt'),{fixture});
  const record=await mediaRecord(master);
  const qa={version:1,fixture,episodeHash:hash(episode),master:record,sources,loudness,checks:{duration:Math.abs(record.duration-300)<=2,canvas:record.video?.width===1920&&record.video?.height===1080,codecs:record.video?.codec==='h264'&&record.audio?.codec==='aac',frameRate:record.video?.fps==='30/1',realPresenters:!fixture&&sources.length===episode.shots.filter(s=>s.speaker).length,loudness:!fixture&&Math.abs(Number(loudness?.input_i)+16)<=1&&Number(loudness?.input_tp)<=-1},review:{status:'pending',items:['Voice naturalness and pronunciation','Lip sync and facial artifacts','Identity/wardrobe/eyeline continuity','Graphic accuracy and timing','Pacing, gaps and handovers','Sources and illustrative disclosures','Music/footage/voice usage rights','Full programme watched by stakeholder']}};
  qa.technicalPass=Object.values(qa.checks).every(Boolean);
  await atomicJSON(path.join(output,'qa.json'),qa);await atomicJSON(path.join(output,'episode.json'),episode);
  if(!qa.checks.duration||!qa.checks.canvas||!qa.checks.codecs||!qa.checks.frameRate)throw new Error('Master failed export quality gates; see output/qa.json');
  return qa;
}
