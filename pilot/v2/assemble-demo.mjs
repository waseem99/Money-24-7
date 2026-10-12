/**
 * SIGNAL 1080p animated editorial master assembler.
 * Requires exact completed licensed provider clips, or explicit --sample mode.
 * NO provider calls. All media originates from separate account-controlled workflow.
 */
import {readFile,writeFile,mkdir,stat} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {spawn} from 'node:child_process';
import sharp from 'sharp';
import {programme,identity,auditPlan} from './demo-master-plan.mjs';
import {renderSceneBackground} from './animated-signal.mjs';

const MEDIA_ROOT=resolve(process.env.SIGNAL_DEMO_WORKDIR || '/mnt/data/jazz_production/media');
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
 const fixed=plan.scenes.filter(s=>s.kind!=='speaker').reduce((a,s)=>a+s.duration,0);
 const spoken=plan.scenes.filter(s=>s.kind==='speaker').reduce((a,s)=>{
   const z=sources[s.id];if(!z||!Number.isFinite(z.duration))throw Error('Missing exact provider source metadata for '+s.id);
   return a+z.duration;
 },0);
 const baseTarget=Math.max(plan.targetSeconds,Math.ceil((fixed+spoken+2)/5)*5);
 if(baseTarget<MIN||baseTarget>MAX)throw Error('Generated voices would require an unacceptable film duration '+baseTarget);
 const speakerCount=plan.scenes.filter(s=>s.kind==='speaker').length;
 const spare=Math.max(0,baseTarget-fixed-spoken);
 const frames=[];let cursor=0,extraFrameBudget=Math.round(spare*30);
 // Allocate all spare editing breathing room among speaker sections, never stretch speech.
 const avgExtra=extraFrameBudget/speakerCount;
 let speakerIndex=0;
 for(const s of plan.scenes){
   const sp=s.kind==='speaker';const minFrames=Math.ceil((sp?sources[s.id].duration:s.duration)*30);
   let extraFrames=0;
   if(sp){const next=Math.round((speakerIndex+1)*avgExtra)-Math.round(speakerIndex*avgExtra);extraFrames=next;speakerIndex++;}
   const count=minFrames+extraFrames;
   if(count<60)throw Error('Invalid timeline frame allocation');
   const start=cursor/30;cursor+=count;
   frames.push({id:s.id,startSeconds:roundFrame(start),durationSeconds:count/30,endSeconds:cursor/30,
     kind:s.kind,speaker:s.role||null,audioDuration:sp?sources[s.id].duration:0,frames:count});
 }
 // Audio-driven durations quantize upward by less than 1 frame per scene.
 const excess=cursor-Math.round(baseTarget*30);
 if(excess>0){for(let i=frames.length-1;i>=0&&cursor>Math.round(baseTarget*30);i--){
   let item=frames[i];if(item.kind!=='speaker')continue;
   const minFrames=Math.ceil(sources[item.id].duration*30)+3;
   const removable=Math.min(item.frames-minFrames,cursor-Math.round(baseTarget*30));
   if(removable>0){item.frames-=removable;cursor-=removable;}
 }}
 let pos=0;for(const item of frames){item.startSeconds=pos/30;pos+=item.frames;item.durationSeconds=item.frames/30;item.endSeconds=pos/30;}
 const totalSeconds=pos/30;
 if(totalSeconds<MIN-.1||totalSeconds>MAX+.1)throw Error('Timeline exceeds permissible output duration');
 return {targetSeconds:baseTarget,totalSeconds,frames:pos,entries:frames,fixedSeconds:fixed,spokenSeconds:spoken};
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
 await renderSceneBackground(scene,entry.durationSeconds,{destination:bg,fps:fpsGraphics,audioDuration:entry.audioDuration,globalStart});
 const out=join(outDir,id+'-final.mp4');
 if(scene.kind!=='speaker'){
   await command('ffmpeg',['-hide_banner','-v','error','-y','-i',bg,'-f','lavfi','-i','anullsrc=r=48000:cl=stereo',
     '-t',sec(entry.durationSeconds),'-map','0:v:0','-map','1:a:0','-r','30',
     '-c:v','libx264','-preset','veryfast','-crf','22','-pix_fmt','yuv420p',
     '-c:a','aac','-ar','48000','-b:a','160k','-movflags','+faststart',out],{timeout:600000});
 }else{
   // Anchor appears at start of the turn, then the compositor reveals a full animated chart;
   // the *original, genuine* voice continues under the graphics without any listener loops.
   const faceSeconds=Math.min(Math.max(4.5,source.duration*.58),8.8);
   const filt=`[1:v]fps=30,scale=860:515:force_original_aspect_ratio=increase,crop=860:515,setsar=1,format=yuv420p[face];`+
     `[0:v][face]overlay=x=69:y=202:enable='between(t,0,${sec(faceSeconds-.08)})':eof_action=pass:shortest=0:format=auto,format=yuv420p[v];`+
     `[1:a]aresample=48000,volume=1.02,apad,atrim=duration=${sec(entry.durationSeconds)},asetpts=PTS-STARTPTS[a]`;
   await command('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',bg,'-i',source.file,'-filter_complex',filt,
     '-map','[v]','-map','[a]','-t',sec(entry.durationSeconds),'-r','30',
     '-c:v','libx264','-preset','veryfast','-crf','22','-pix_fmt','yuv420p',
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
async function contactSheet(master,outDir){const shots=[6,24,53,75,111,149,171].map((s,i)=>({s,i}));const images=[];
 for(const {s,i} of shots){const file=join(outDir,`thumb-${String(i+1).padStart(2,'0')}.jpg`);
  await command('ffmpeg',['-hide_banner','-v','error','-y','-ss',sec(s),'-i',master,'-frames:v','1','-update','1','-q:v','3',file],{timeout:40000});
  const img=await sharp(file).resize(560,315).jpeg({quality:83}).toBuffer();images.push({input:img,left:24+(i%2)*580,top:24+Math.floor(i/2)*349});
 }
 await sharp({create:{width:1184,height:24+Math.ceil(images.length/2)*349,channels:3,background:'#091A2E'}}).composite(images).png().toFile(join(outDir,'SIGNAL-scene-contact-sheet.png'));
}

export async function assemble({workDir=MEDIA_ROOT,fixture=false,fpsGraphics=12,limitScenes=null}={}){
 const audit=auditPlan(),sources={};
 await mkdir(join(workDir,'sources'),{recursive:true});await mkdir(join(workDir,'rendered'),{recursive:true});
 const selectedScenes=limitScenes?programme.scenes.slice(0,limitScenes):programme.scenes;
 for(const s of selectedScenes){if(s.kind==='speaker')sources[s.id]=await inspectSource(s,{allowFixture:fixture});}
 const plan=limitScenes?{...programme,targetSeconds:Math.max(180,programme.targetSeconds),scenes:selectedScenes}:programme;
 const timeline=limitScenes?{
   totalSeconds:0,entries:selectedScenes.map(s=>({id:s.id,durationSeconds:s.kind==='speaker'?sources[s.id].duration+2:s.duration,audioDuration:s.kind==='speaker'?sources[s.id].duration:0,kind:s.kind})),
 }:allocateTimeline(plan,sources);
 if(limitScenes){let cursor=0;for(let s of timeline.entries){s.startSeconds=cursor;s.endSeconds=cursor+s.durationSeconds;cursor=s.endSeconds;}timeline.totalSeconds=cursor;}
 const files=[];
 for(let i=0;i<selectedScenes.length;i++){
   let s=selectedScenes[i],t=timeline.entries[i];
   console.log(`Rendering ${i+1}/${selectedScenes.length} ${s.id} — ${t.durationSeconds.toFixed(2)}s`);
   files.push(await composeScene(s,t,sources[s.id],{fpsGraphics,globalStart:t.startSeconds}));
 }
 const lines=files.map(x=>"file '"+x.replace(/'/g,"'\\''")+"'").join('\n')+'\n';
 const concat=join(workDir,'rendered','concat.txt');await writeFile(concat,lines);
 const filename=fixture?'SIGNAL-TECHNICAL-NOT-APPROVED.mp4':'SIGNAL-Financial-News-3min-1080p-FINAL-DEMO.mp4';
 const master=join(workDir,filename),preMaster=join(workDir,'signal-pre-master-visual.mp4');
 await command('ffmpeg',['-hide_banner','-v','error','-y','-f','concat','-safe','0','-i',concat,
    '-c:v','libx264','-preset','fast','-crf','19','-r','30','-pix_fmt','yuv420p',
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
 await writeFile(join(workDir,'SIGNAL-captions.vtt'),captions);
 const report={status:fixture?'TECHNICAL_ONLY_NOT_FINAL':'RENDERED_REQUIRES_HUMAN_REVIEW',id:programme.programmeId,generatedAt:DATE,
   dimensions:'1920x1080',fps:30,codec:'H.264 + AAC',durationSeconds:verified.duration,
   captioning:'scene voice-duration proportional estimate; verify speech exact timing by human review',
   soundtrack:'Original very low-level locally composed instrumental broadcast bed; no external music/licensing or additional AI credit usage',
   chartData:'DETERMINISTIC SIMULATED illustrative data only',liveMarketDataUsed:false,
   originalCasualPresentersUsed:false,actors:[identity.LIZA.name,identity.LASSE.name],voices:[identity.LIZA.voiceName,identity.LASSE.voiceName],
   fullHumanApproval:false,sceneTiming:timeline.entries};
 await writeFile(join(workDir,'SIGNAL-technical-QA.json'),JSON.stringify(report,null,2));
 if(!limitScenes)await contactSheet(master,workDir);
 console.log('MASTER COMPLETE '+master+' duration='+verified.duration.toFixed(2)+'s');
 return {master,report,timeline};
}

if(import.meta.url===`file://${process.argv[1]}`){
 const fixture=process.argv.includes('--fixture'),limit=process.argv.find(x=>/^--scenes=/.test(x));
 await assemble({fixture,limitScenes:limit?Number(limit.split('=')[1]):null,fpsGraphics:Number(process.env.SIGNAL_GRAPHICS_FPS||12)});
}