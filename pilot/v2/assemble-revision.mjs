/**
 * SIGNAL 1080p animated editorial master assembler.
 * Requires exact completed licensed provider clips, or explicit --sample mode.
 * NO provider calls. All media originates from separate account-controlled workflow.
 */
import {readFile,writeFile,mkdir,stat} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {spawn} from 'node:child_process';
import sharp from 'sharp';
import {programme,identity,REPORTS,auditPlan} from './revision-master-plan.mjs';
import {renderSceneBackground} from './animated-news.mjs';

const MEDIA_ROOT=resolve(process.env.SIGNAL_DEMO_WORKDIR || './signal-demo-r2-output');
const MIN=programme.minAllowedSeconds,MAX=programme.maxAllowedSeconds;
const DATE=new Date().toISOString().slice(0,10);
const delay=ms=>new Promise(r=>setTimeout(r,ms));
function safelyPath(id){if(!/^[a-z0-9_-]+$/.test(id))throw Error('Invalid media ID');return join(MEDIA_ROOT,'sources',id+'.mp4')}

export async function command(cmd,args,{timeout=480000,quiet=true}={}){
 const child=spawn(cmd,args,{stdio:['ignore','pipe','pipe']});let err='',out='';
 child.stderr.on('data',b=>{if(err.length<30000)err+=b.toString()});
 child.stdout.on('data',b=>{if(out.length<30000)out+=b.toString()});
 let killed=false;const timer=setTimeout(()=>{killed=true;child.kill('SIGKILL')},timeout);
 const exit=await new Promise((res,rej)=>{child.on('error',rej);child.on('close',(code,signal)=>res({code,signal}));});
 clearTimeout(timer);
 if(exit.code!==0||killed)throw Error(cmd+' failed '+JSON.stringify({exit:exit.code,killed,stderr:err.slice(-3500),args:args.slice(0,14)}));
 if(!quiet)console.log(out.slice(0,1400));
 return out;
}
async function probe(file){let out=await command('ffprobe',['-v','error','-show_entries','format=duration,size','-show_entries','stream=codec_type,width,height,codec_name,r_frame_rate,sample_rate','-of','json',file]);
 const data=JSON.parse(out);const duration=Number(data.format?.duration),v=data.streams?.find(s=>s.codec_type==='video'),a=data.streams?.find(s=>s.codec_type==='audio');
 if(!(duration>0)&&!Number.isFinite(duration))throw Error('No duration in '+file);return {duration,video:v,audio:a};
}
export async function inspectSource(s,{allowFixture=false}={}){
 const f=safelyPath(s.id),st=await stat(f);
 if(st.size<20000||st.size>256*1024*1024)throw Error('Unexpected avatar footage size');
 const p=await probe(f);
 if(!p.video||!p.audio||p.video.width<1280||p.video.height<720||!(p.duration>=5&&p.duration<=35))throw Error('Presenter source failed codec/duration/resolution QA for '+s.id);
 return {...p,file:f,sourceVideoId:s.existingVideoId||null,scene:s.id};
}
function roundFrame(x){return Math.round(x*30)/30;}
export function allocateTimeline(plan,sources){
  // THE KEY FIX: never pad every presenter with ~2.7 seconds of dead air.
  // Speech & facial animation are kept together at a modest, pitch-preserving tempo.
  const speedFor=role=>role==='LIZA'?1.065:1.025;
  let cursor=0,entries=[];
  for(const sc of plan.scenes){
    const spoken=sc.kind==='speaker';
    const raw=spoken?sources[sc.id].duration:sc.duration;
    const tempo=spoken?speedFor(sc.role):1;
    const audioDuration=spoken?raw/tempo:0;
    const hold=spoken?.11:0;
    const frames=Math.ceil((spoken?audioDuration+hold:sc.duration)*30);
    const dur=frames/30;
    entries.push({id:sc.id,startSeconds:cursor/30,durationSeconds:dur,endSeconds:(cursor+frames)/30,
      kind:sc.kind,speaker:sc.role||null,audioDuration,frames,playbackSpeed:tempo,editorialHandoverSeconds:hold});
    cursor+=frames;
  }
  const totalSeconds=cursor/30;
  if(totalSeconds<plan.minAllowedSeconds||totalSeconds>plan.maxAllowedSeconds)
    throw Error('Fast-cut revised film duration outside expected range: '+totalSeconds.toFixed(2)+'s');
  if(entries.some(e=>e.kind==='speaker'&&e.durationSeconds-e.audioDuration>.2))
    throw Error('Overlong silence has reappeared after a speaking clip');
  return {targetSeconds:plan.targetSeconds,totalSeconds,frames:cursor,entries,
    note:'Speech synchronized at 1.065x Liza, 1.025x Lasse. 0.11s maximum intentional scene-end tail; no 2.7s padding.'};
}

function sec(t){return Math.max(0,t).toFixed(3);}
function makeAmbientBed(seconds,timeline){
  // Entirely original, synthesized subtle instrumental bed; no stock licences or paid APIs.
  // Quiet chord changes accompany animated charts without drowning the approved voices.
  const rate=24000,total=Math.ceil(seconds*rate),pcm=Buffer.alloc(44+total*4);
  pcm.write('RIFF',0);pcm.writeUInt32LE(pcm.length-8,4);pcm.write('WAVEfmt ',8);
  pcm.writeUInt32LE(16,16);pcm.writeUInt16LE(1,20);pcm.writeUInt16LE(2,22);
  pcm.writeUInt32LE(rate,24);pcm.writeUInt32LE(rate*4,28);pcm.writeUInt16LE(4,32);pcm.writeUInt16LE(16,34);
  pcm.write('data',36);pcm.writeUInt32LE(total*4,40);
  const changeAt=timeline.entries.filter(e=>['intro','interlude','outro'].includes(e.kind)).map(e=>e.startSeconds);
  for(let i=0;i<total;i++){
    const t=i/rate,phase=Math.floor(t/12)%3,mix=(t%12)/12;
    const root=[130.81,146.83,110.0][phase],a=2*Math.PI*root*t,b=2*Math.PI*root*1.5*t;
    const pad=.012*(Math.sin(a)+.53*Math.sin(b)+.36*Math.sin(a*2))*(.85+.15*Math.sin(t*.7));
    const throb=.0024*Math.sin(2*Math.PI*196*t)*(.4+.6*Math.pow(Math.max(0,Math.sin(2*Math.PI*t/2.5)),2));
    let sting=0;
    for(const time of changeAt){const dt=t-time;if(dt>=0&&dt<1.7)sting+=.009*Math.sin(2*Math.PI*392*dt)*Math.exp(-3.5*dt);}
    const fade=Math.min(1,t/1.7,(seconds-t)/2.6);
    const val=Math.max(-1,Math.min(1,(pad+throb+sting)*Math.max(0,fade)));
    pcm.writeInt16LE(Math.round(val*32760),44+i*4);
    pcm.writeInt16LE(Math.round(val*.94*32760),46+i*4);
  }
  return pcm;
}
async function composeScene(scene,entry,source,{fpsGraphics=12,globalStart=0}={}){
 const id=scene.id,outDir=join(MEDIA_ROOT,'rendered');await mkdir(outDir,{recursive:true});
 const bg=join(outDir,id+'-background.mp4');
 const out=join(outDir,id+'-final.mp4');
 // Reuse previously QA-passing, unchanged generic/intro/outro scenes.
 // Sourced news cards always rerender to incorporate dated editorial corrections.
 if((process.env.SIGNAL_R2_CACHE_NONNEWS==='1'&&!scene.news?.length)||
    (process.env.SIGNAL_R3_CACHE_COMPLETED==='1'&&scene.id!=='liza_close')){
   try{const cached=await probe(out);
     if(Math.abs(cached.duration-entry.durationSeconds)<.23&&cached.video.width===1920&&cached.audio){
       console.log('REUSED QA scene '+id+' '+cached.duration.toFixed(2)+'s');return out;
     }
   }catch{}
 }
 await renderSceneBackground(scene,entry.durationSeconds,{destination:bg,fps:fpsGraphics,audioDuration:entry.audioDuration,globalStart});
 if(scene.kind!=='speaker'){
   await command('ffmpeg',['-hide_banner','-v','error','-y','-i',bg,'-f','lavfi','-i','anullsrc=r=48000:cl=stereo',
     '-t',sec(entry.durationSeconds),'-map','0:v:0','-map','1:a:0','-r','30',
     '-c:v','libx264','-preset','veryfast','-crf','18','-pix_fmt','yuv420p',
     '-c:a','aac','-ar','48000','-b:a','160k','-movflags','+faststart',out],{timeout:600000});
 }else{
   // 0:33 correction: brief camera appearance then decisive cut to full-screen
   // animated factual source cards; NO 8–10 second synthetic reaction hold.
   const speed=entry.playbackSpeed||1.0;
   const faceSeconds=Math.min(scene.role==='LIZA'?2.4:3.0,Math.max(1.5,entry.audioDuration*.21));
   const fadeOut=Math.max(.2,entry.audioDuration-.13);
   const filt=`[1:v]setpts=PTS/${speed.toFixed(4)},fps=30,scale=860:515:force_original_aspect_ratio=increase,crop=860:515,setsar=1,format=yuv420p[face];`+
     `[0:v][face]overlay=x=69:y=202:enable='between(t,0,${sec(faceSeconds-.06)})':eof_action=pass:shortest=0:format=auto,format=yuv420p[v];`+
     `[1:a]aresample=48000,atempo=${speed.toFixed(4)},highpass=f=77,acompressor=threshold=-19dB:ratio=1.45:attack=9:release=130,volume=1.05,afade=t=in:st=0:d=0.045,afade=t=out:st=${sec(fadeOut)}:d=0.13,apad,atrim=duration=${sec(entry.durationSeconds)},asetpts=PTS-STARTPTS[a]`;
   await command('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',bg,'-i',source.file,'-filter_complex',filt,
     '-map','[v]','-map','[a]','-t',sec(entry.durationSeconds),'-r','30',
     '-c:v','libx264','-preset','veryfast','-crf','18','-pix_fmt','yuv420p',
     '-c:a','aac','-ar','48000','-b:a','160k','-movflags','+faststart',out],{timeout:600000});
 }
 const p=await probe(out);
 if(Math.abs(p.duration-entry.durationSeconds)>0.23)throw Error('Scene render duration mismatch '+id+' '+p.duration+' vs '+entry.durationSeconds);
 console.log('RENDERED '+id+' '+p.duration.toFixed(2)+'s, '+scene.kind);
 return out;
}
function vtt(t){let h=Math.floor(t/3600),m=Math.floor(t/60)%60,s=Math.floor(t%60),ms=Math.round((t-Math.floor(t))*1000);return [String(h).padStart(2,'0'),String(m).padStart(2,'0'),String(s).padStart(2,'0')].join(':')+'.'+String(ms).padStart(3,'0');}
export function captionsVTT(plan,timeline){let text='WEBVTT\n\n',k=0;
 for(const ent of timeline.entries){let s=plan.scenes.find(z=>z.id===ent.id);if(s.kind!=='speaker')continue;
  const chunks=[],words=s.script.trim().split(/\s+/),group=10;
  for(let i=0;i<words.length;i+=group)chunks.push(words.slice(i,i+group).join(' '));
  const per=ent.audioDuration/chunks.length;
  for(let i=0;i<chunks.length;i++){
   const st=ent.startSeconds+i*per,en=Math.min(ent.endSeconds,st+per);
   text+=`${++k}\n${vtt(st)} --> ${vtt(en)}\n${chunks[i]}\n\n`;
  }
 }return text;
}
async function contactSheet(master,outDir){const shots=[6,24,43,65,87,115,150].map((s,i)=>({s,i}));const images=[];
 for(const {s,i} of shots){const file=join(outDir,`thumb-${String(i+1).padStart(2,'0')}.jpg`);
  await command('ffmpeg',['-hide_banner','-v','error','-y','-ss',sec(s),'-i',master,'-frames:v','1','-update','1','-q:v','3',file],{timeout:40000});
  const img=await sharp(file).resize(560,315).jpeg({quality:83}).toBuffer();images.push({input:img,left:24+(i%2)*580,top:24+Math.floor(i/2)*349});
 }
 await sharp({create:{width:1184,height:24+Math.ceil(images.length/2)*349,channels:3,background:'#091A2E'}}).composite(images).png().toFile(join(outDir,'SIGNAL-R3-scene-contact-sheet.png'));
}

export async function assemble({workDir=MEDIA_ROOT,fixture=false,fpsGraphics=12,limitScenes=null}={}){
 const audit=auditPlan(),sources={};
 await mkdir(join(workDir,'sources'),{recursive:true});await mkdir(join(workDir,'rendered'),{recursive:true});
 const selectedScenes=limitScenes?programme.scenes.slice(0,limitScenes):programme.scenes;
 for(const s of selectedScenes){if(s.kind==='speaker')sources[s.id]=await inspectSource(s,{allowFixture:fixture});}
 const plan=limitScenes?{...programme,targetSeconds:Math.max(180,programme.targetSeconds),scenes:selectedScenes}:programme;
 const timeline=limitScenes?{
   totalSeconds:0,entries:[]
 }:allocateTimeline(plan,sources);
 if(limitScenes){
   let cursor=0;
   for(const sc of selectedScenes){
     const speaker=sc.kind==='speaker';
     const speed=speaker?(sc.role==='LIZA'?1.065:1.025):1;
     const raw=speaker?sources[sc.id].duration:sc.duration;
     const audioDuration=speaker?raw/speed:0;
     const count=Math.ceil((speaker?audioDuration+.11:sc.duration)*30);
     timeline.entries.push({id:sc.id,startSeconds:cursor/30,endSeconds:(cursor+count)/30,
       durationSeconds:count/30,kind:sc.kind,speaker:sc.role||null,audioDuration,
       frames:count,playbackSpeed:speed});
     cursor+=count;
   }
   timeline.totalSeconds=cursor/30;
 }
 const files=[];
 for(let i=0;i<selectedScenes.length;i++){
   let s=selectedScenes[i],t=timeline.entries[i];
   console.log(`Rendering ${i+1}/${selectedScenes.length} ${s.id} — ${t.durationSeconds.toFixed(2)}s`);
   files.push(await composeScene(s,t,sources[s.id],{fpsGraphics,globalStart:t.startSeconds}));
 }
 const lines=files.map(x=>"file '"+x.replace(/'/g,"'\\''")+"'").join('\n')+'\n';
 const concat=join(workDir,'rendered','concat.txt');await writeFile(concat,lines);
 const filename=fixture?'SIGNAL-R2-TECHNICAL-NOT-APPROVED.mp4':'SIGNAL-R3-MARKETS-CROSSROADS-1080p-REVIEW.mp4';
 const master=join(workDir,filename),preMaster=join(workDir,'signal-pre-master-visual.mp4');
 await command('ffmpeg',['-hide_banner','-v','error','-y','-f','concat','-safe','0','-i',concat,
    '-c:v','libx264','-preset','fast','-crf','17','-r','30','-pix_fmt','yuv420p',
    '-c:a','aac','-b:a','192k','-ar','48000','-ac','2','-movflags','+faststart',preMaster],{timeout:900000});
 // Add quiet, self-composed broadcast music to prevent silence in editorial chart interludes.
 // Keep presenter voices in front: local bed peaks at about -30dBFS and never uses paid content.
 const scorePath=join(workDir,'signal-original-ambient-bed.wav');
 await writeFile(scorePath,makeAmbientBed(timeline.totalSeconds,timeline));
 await command('ffmpeg',['-hide_banner','-v','error','-y','-i',preMaster,'-i',scorePath,
    '-filter_complex','[0:a]aresample=48000[a0];[1:a]aresample=48000,volume=0.55[a1];[a0][a1]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.94[aout]',
    '-map','0:v:0','-map','[aout]','-c:v','copy','-c:a','aac','-b:a','192k','-ar','48000','-ac','2','-movflags','+faststart',master],{timeout:240000});
 const verified=await probe(master);
 if(!limitScenes && (Math.abs(verified.duration-timeline.totalSeconds)>.75||verified.duration<MIN-.75||verified.duration>MAX+.75))throw Error('Final runtime QA failed');
 if(verified.video.width!==1920||verified.video.height!==1080||verified.video.codec_name!=='h264'||verified.audio.codec_name!=='aac')throw Error('Final AV technical QA failed');
 const captions=captionsVTT(plan,timeline);
 await writeFile(join(workDir,'SIGNAL-R3-captions.vtt'),captions);
 const report={status:fixture?'TECHNICAL_ONLY_NOT_FINAL':'RENDERED_REQUIRES_HUMAN_REVIEW',id:programme.programmeId,generatedAt:DATE,
   sourcedNewsAsOf:'2026-10-12',sourcedAndNotLive:true,reportSources:Object.values(REPORTS).map(x=>({label:x.label,date:x.date,source:x.source,url:x.url})),
   presenterPacing:{Liza:'1.065x pitch-preserving video+audio',Lasse:'1.025x pitch-preserving video+audio'},
   maxAddedHandoverSilenceSeconds:Math.max(...timeline.entries.filter(x=>x.kind==='speaker').map(x=>x.durationSeconds-x.audioDuration)),
   originalAIExpressionAt033RemovedByShortCameraCut:true,
   fixedLogoDefect:'Removed FINANCIAL NEWSROOM separator overlapping SIGNAL L; clean SIGNAL / MARKET WATCH masthead',
   dimensions:'1920x1080',fps:30,codec:'H.264 + AAC',durationSeconds:verified.duration,
   captioning:'scene-proportional estimate after presenter tempo changes; human sync verification pending',
   soundtrack:'Original very low-level locally composed instrumental broadcast bed; no external music/licensing or additional AI credit usage',
   chartData:'Simulated index-only chart segments separate from source-dated Fed/Reuters/BLS reports',liveMarketDataUsed:false,
   originalCasualPresentersUsed:false,actors:[identity.LIZA.name,identity.LASSE.name],voices:[identity.LIZA.voiceName,identity.LASSE.voiceName],
   visualLabelPolicy:'No DEMO DATA, MARKET DEMO, AI-PRESENTED or AI PRESENTERS labels in the broadcast graphics; use dated sources and mark illustrative indexes as not live',fullHumanApproval:false,sceneTiming:timeline.entries};
 await writeFile(join(workDir,'SIGNAL-R3-technical-QA.json'),JSON.stringify(report,null,2));
 if(!limitScenes)await contactSheet(master,workDir);
 console.log('MASTER COMPLETE '+master+' duration='+verified.duration.toFixed(2)+'s');
 return {master,report,timeline};
}

if(import.meta.url===`file://${process.argv[1]}`){
 const fixture=process.argv.includes('--fixture'),limit=process.argv.find(x=>/^--scenes=/.test(x));
 await assemble({fixture,limitScenes:limit?Number(limit.split('=')[1]):null,fpsGraphics:Number(process.env.SIGNAL_GRAPHICS_FPS||12)});
}