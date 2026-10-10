import path from 'node:path';
import {mkdir,writeFile,readFile,rename} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import sharp from 'sharp';
import {renderSVG} from '../../src/broadcast/render.js';
import {compileTimeline,sceneState,slots} from '../../src/broadcast/timeline.js';
import {hash,atomicJSON} from '../contracts.mjs';
import {command,mediaRecord,inspectMedia,vttTime,measureLoudness} from '../media.mjs';
import {withLock} from '../workflow.mjs';
import {invalidateOutput} from '../archive.mjs';
import {loadV2,readiness,verifyAsset,requireEditorial} from './workflow.mjs';

export async function graphicsFilm(p,timeline,file,{fixture=true,onProgress=()=>{}}={}){
  const child=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','image2pipe','-vcodec','mjpeg','-r',String(p.fps),'-i','pipe:0','-an','-c:v','libx264','-preset','veryfast','-crf','19','-pix_fmt','yuv420p','-threads','2','-movflags','+faststart',file],{stdio:['pipe','ignore','pipe']});
  let error='',failure;child.stderr.on('data',x=>error=(error+x).slice(-3000));child.stdin.on('error',e=>{failure=e;});
  const finished=new Promise((resolve,reject)=>{child.on('error',reject);child.on('close',code=>code===0?resolve():reject(new Error('Graphics encoder failed: '+error)));});finished.catch(()=>{});
  const total=p.durationMs*p.fps/1000,start=Date.now();
  try{for(let frame=0;frame<total;frame+=4){
    const batch=await Promise.all(Array.from({length:Math.min(4,total-frame)},(_,i)=>sharp(Buffer.from(renderSVG(p,(frame+i)*1000/p.fps,timeline,{fixture}))).jpeg({quality:90,chromaSubsampling:'4:4:4'}).toBuffer()));
    for(const bytes of batch){if(failure)throw failure;if(!child.stdin.write(bytes))await once(child.stdin,'drain');}
    if(frame%300===0)onProgress(`Graphics ${Math.round(frame/total*100)}%`);
  }child.stdin.end();await finished;}catch(e){child.kill('SIGTERM');await finished.catch(()=>{});throw e;}
  return {frames:total,elapsedMs:Date.now()-start};
}
export function compositionSegments(run,timeline){
  const p=run.episode,frame=ms=>Math.round(ms*p.fps/1000),endFrame=frame(p.durationMs);
  const boundaries=new Set([0,endFrame]);
  for(const s of p.scenes){boundaries.add(frame(s.startMs));boundaries.add(frame(s.startMs+s.durationMs));}
  for(const t of p.turns){boundaries.add(frame(t.startMs));boundaries.add(frame(t.startMs+t.durationMs));if(run.manifest.assets[t.id])boundaries.add(frame(t.startMs+run.manifest.assets[t.id].duration*1000));}
  for(const c of timeline.filter(c=>['camera.cut','listener.react'].includes(c.action)))boundaries.add(c.frame);
  const points=[...boundaries].filter(f=>f>=0&&f<=endFrame).sort((a,b)=>a-b);
  return points.slice(0,-1).map((first,i)=>{
    const last=points[i+1],at=(first+.5)*1000/p.fps,st=sceneState(p,at,timeline),turn=st.turn;
    const active=turn&&at<turn.startMs+run.manifest.assets[turn.id].duration*1000?run.manifest.assets[turn.id]:null;
    const layers=slots(st.scene).map(slot=>{
      const isSpeaker=active&&slot.presenterId===turn.speakerId;
      const reaction=st.reaction?.presenterId===slot.presenterId?st.reaction.reaction:'neutral';
      const asset=isSpeaker?active:run.manifest.listeners[`${st.scene.id}-${slot.presenterId}-${reaction}`];
      if(!asset)throw new Error('Missing listener or presenter layer');
      if(slot.kind==='alpha'&&!asset.alpha)throw new Error('Standing layer requires decoded transparency');
      return {slot,asset,offset:Math.max(0,(first*1000/p.fps-(isSpeaker?turn.startMs:st.scene.startMs))/1000)};
    });
    return {first,frames:last-first,start:first/p.fps,duration:(last-first)/p.fps,layers,audio:active?{asset:active,offset:Math.max(0,(first*1000/p.fps-turn.startMs)/1000)}:null};
  });
}
async function composeSegment(run,base,segment,file){
  const args=['-hide_banner','-loglevel','error','-y','-ss',String(segment.start),'-i',base],filters=[];let input=1,current='0:v';
  for(const layer of segment.layers){
    if(layer.asset.alpha)args.push('-c:v','libvpx-vp9');args.push('-ss',String(layer.offset),'-i',path.join(run.root,'assets',layer.asset.file));
    const {x,y,h,kind}=layer.slot,w=2*Math.floor(layer.slot.w/2),hh=2*Math.floor((h-78)/2);
    const fit=layer.asset.alpha?`scale=${w}:${hh}:force_original_aspect_ratio=decrease:force_divisible_by=2,pad=${w}:${hh}:(ow-iw)/2:(oh-ih)/2:color=black@0`:`scale=${w}:${hh}:force_original_aspect_ratio=increase,crop=${w}:${hh}`;
    filters.push(`[${input}:v]setpts=PTS-STARTPTS,fps=30,format=rgba,${fit},setsar=1[v${input}]`);
    filters.push(`[${current}][v${input}]overlay=${x}:${y}:eof_action=pass:repeatlast=0[o${input}]`);current=`o${input}`;input++;
  }
  if(segment.audio){args.push('-ss',String(segment.audio.offset),'-i',path.join(run.root,'assets',segment.audio.asset.file));filters.push(`[${input}:a]asetpts=PTS-STARTPTS,aresample=48000,aformat=channel_layouts=stereo,apad,atrim=duration=${segment.duration}[audio]`);}
  else{args.push('-f','lavfi','-i','anullsrc=r=48000:cl=stereo');filters.push(`[${input}:a]atrim=duration=${segment.duration}[audio]`);}
  if(current==='0:v')filters.push('[0:v]null[video]');else filters.push(`[${current}]null[video]`);
  args.push('-filter_complex_threads','1','-filter_complex',filters.join(';'),'-map','[video]','-map','[audio]','-t',String(segment.duration),'-frames:v',String(segment.frames),'-c:v','libx264','-preset','veryfast','-crf','18','-pix_fmt','yuv420p','-r','30','-threads','2','-c:a','pcm_s16le',file);
  await command('ffmpeg',args);
}
async function captions(run,file){
  let result='WEBVTT\n\n';
  for(const t of run.episode.turns){const asset=run.manifest.assets[t.id];const words=t.text.trim().split(/\s+/);
    for(let n=0;n<words.length;n+=10){let start,end;
      if(run.manifest.fixture){start=t.startMs+n/words.length*t.durationMs;end=t.startMs+Math.min(words.length,n+10)/words.length*t.durationMs;}
      else{const a=asset.alignment,startIndex=asset.tokenOffsets[n],endIndex=n+10<words.length?asset.tokenOffsets[n+10]-1:a.characters.length-1;start=t.startMs+(a.character_start_times_seconds[startIndex]*1000)+asset.offsetMs;end=t.startMs+(a.character_end_times_seconds[Math.max(startIndex,endIndex)]*1000)+asset.offsetMs;}
      result+=`${vttTime(start/1000)} --> ${vttTime(end/1000)}\n${run.manifest.fixture?'[Unvoiced rehearsal] ':''}${words.slice(n,n+10).join(' ').replace(/[<>]/g,'')}\n\n`;
    }
  }await writeFile(file,result);
}
export async function renderV2(run,onProgress=()=>{}){
  return withLock(run.root,async()=>{
    Object.assign(run,await loadV2(run.manifest.name));const ready=readiness(run);if(!ready.ready)throw new Error('Not ready: '+ready.missing.join(', '));
    if(!run.manifest.fixture)await requireEditorial(run);
    for(const a of [...Object.values(run.manifest.assets),...Object.values(run.manifest.listeners)])await verifyAsset(run,a);
    const timeline=compileTimeline(run.episode,run.manifest.assets,{fixture:run.manifest.fixture}),out=path.join(run.root,'output'),cache=path.join(run.root,'render-cache');await mkdir(out,{recursive:true});await mkdir(cache,{recursive:true});
    const rendererFiles=['../../src/broadcast/render.js','../../src/broadcast/timeline.js','../../src/broadcast/data.js','./render.mjs'];
    const runtime={node:process.version,sharp:sharp.versions,lockfile:hash(await readFile(new URL('../../package-lock.json',import.meta.url))),ffmpeg:(await command('ffmpeg',['-version'])).stdout.split('\n')[0]};
    const rendererHash=hash({sources:await Promise.all(rendererFiles.map(f=>readFile(new URL(f,import.meta.url),'utf8'))),runtime});
    const fingerprint=hash({programme:run.episode,timeline,fixture:run.manifest.fixture,assetDurations:Object.fromEntries(Object.entries(run.manifest.assets).map(([id,a])=>[id,a.duration])),rendererHash}),base=path.join(cache,`${fingerprint}.mp4`),started=Date.now();
    const visualProgramme=run.manifest.fixture?run.episode:{...run.episode,turns:run.episode.turns.map(t=>({...t,durationMs:Math.min(t.durationMs,Math.round(run.manifest.assets[t.id].duration*1000))}))};
    let graphics;
    try{const cached=await mediaRecord(base);if(Math.abs(cached.duration-run.episode.durationMs/1000)>.04)throw new Error('Incomplete cache');graphics={cached:true};}catch{graphics=await graphicsFilm(visualProgramme,timeline,base,{fixture:run.manifest.fixture,onProgress});}
    const staging=path.join(out,'master-pending.mp4');
    if(run.manifest.fixture)await command('ffmpeg',['-v','error','-y','-i',base,'-f','lavfi','-i','anullsrc=r=48000:cl=stereo','-t',String(run.episode.durationMs/1000),'-c:v','copy','-c:a','aac','-movflags','+faststart',staging]);
    else{
      const segments=compositionSegments(run,timeline),files=[];
      for(const [i,segment]of segments.entries()){const file=path.join(cache,`part-${i}.mkv`);await composeSegment(run,base,segment,file);files.push(file);onProgress(`Composition ${i+1}/${segments.length}`);}
      const list=path.join(cache,'concat.txt');await writeFile(list,files.map(f=>`file '${f.replace(/'/g,"'\\''")}'`).join('\n'));
      await command('ffmpeg',['-v','error','-y','-f','concat','-safe','0','-i',list,'-t',String(run.episode.durationMs/1000),'-c:v','libx264','-preset','veryfast','-crf','18','-r','30','-fps_mode','cfr','-threads','2','-af','loudnorm=I=-16:TP=-1.5:LRA=11','-ar','48000','-c:a','aac','-b:a','192k','-movflags','+faststart',staging]);
    }
    const record=await mediaRecord(staging),anomalies=await inspectMedia(staging,{freeze:false,silence:false}),loudness=run.manifest.fixture?null:await measureLoudness(staging);
    const checks={duration:Math.abs(record.duration-run.episode.durationMs/1000)<=.05,format:record.video?.width===1920&&record.video?.height===1080&&record.video?.fps==='30/1'&&record.video?.codec==='h264',audio:record.audio?.sampleRate===48000,decode:anomalies.pass,measuredCues:run.manifest.fixture||timeline.every(c=>c.timing==='measured'),loudness:run.manifest.fixture||Number(loudness.input_i)>=-17&&Number(loudness.input_i)<=-15&&Number(loudness.input_tp)<=-1};
    if(Object.values(checks).some(x=>!x))throw new Error('Master failed technical QA: '+JSON.stringify(checks));
    await invalidateOutput(run.root);await rename(staging,path.join(out,'master.mp4'));await captions(run,path.join(out,'captions.vtt'));
    const qa={version:2,fixture:run.manifest.fixture,synthetic:run.manifest.fixture||[...Object.values(run.manifest.assets),...Object.values(run.manifest.listeners)].some(a=>a.synthetic),pass:true,checks,anomalies,loudness,episodeHash:run.manifest.episodeHash,assetHash:hash({assets:run.manifest.assets,listeners:run.manifest.listeners}),masterHash:record.sha256,record,runtime,rendererHash,graphics,elapsedMs:Date.now()-started,at:new Date().toISOString(),humanReviewRequired:true};
    await atomicJSON(path.join(out,'qa.json'),qa);await atomicJSON(path.join(out,'episode.json'),run.episode);await atomicJSON(path.join(out,'timeline.json'),timeline);
    const db=new (await import('../store.mjs')).Store(run.root);try{await atomicJSON(path.join(out,'production-report.json'),{qa,timeline,sourceHashes:run.episode.snapshots.map(s=>({id:s.id,hash:hash(s)})),costs:db.summary(),latencyClaim:null});}finally{db.close();}
    for(const s of run.episode.scenes)await command('ffmpeg',['-v','error','-y','-ss',String((s.startMs+s.durationMs/2)/1000),'-i',path.join(out,'master.mp4'),'-frames:v','1','-update','1',path.join(out,`${s.id}.png`)]);
    run.manifest.state='rendered';await atomicJSON(path.join(run.root,'manifest.json'),run.manifest);return qa;
  });
}
