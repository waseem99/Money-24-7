/** SIGNAL Market Watch R4+ bright 1080p recovery master.
 * Uses ONLY previously generated, authorized Liza/Annie and Lasse/Orson footage.
 * No HeyGen API calls, voice cloning, or additional credit use.
 */
import sharp from 'sharp';
import {SHOW,CAST,SOURCES} from './newsroom-r4plus-plan.mjs';
import {renderFrame} from './newsroom-r4plus-graphics.mjs';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {mkdir,writeFile,stat,readFile} from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
const root='/mnt/data/signal_r4plus',sources=path.join(root,'sources'),rendered=path.join(root,'rendered');
await mkdir(rendered,{recursive:true});
const PROG_FPS=30, GRAPHICS_FPS=15;
const clipSpec=[
 {id:'ident',kind:'ident',duration:3.6},
 {id:'top_stories',clip:'top_stories.mp4',role:'LIZA'},
 {id:'global_market',clip:'global_market.mp4',role:'LASSE'},
 {id:'earnings',clip:'earnings.mp4',role:'LIZA'},
 {id:'market_pulse',clip:'news_open.mp4',role:'LIZA',new:true},
 {id:'rates',clip:'rates.mp4',role:'LASSE'},
 {id:'energy',clip:'oil.mp4',role:'LIZA'},
 {id:'inflation',clip:'cpi.mp4',role:'LASSE'},
 {id:'world_outlook',kind:'interlude',duration:7.5},
 {id:'watchlist',kind:'interlude',duration:7.5},
 {id:'signoff',clip:'liza_close.mp4',role:'LIZA',trimStart:8.33,trimLength:1.05,silentTail:2.7},
 {id:'end',kind:'end',duration:3.5}
];
const marketPulse={id:'market_pulse',kind:'speaker',role:'LIZA',duration:18.73,layout:'watchlist',
 eyebrow:'MARKET PRESSURE',headline:'PROFITS MEET HIGHER BORROWING COSTS',
 sub:'EARNINGS · INFLATION · ENERGY',sourceIds:['BANKS','YIELD','BRENT'],accent:'gold',
 script:"Markets are facing a real test this week. Bank earnings are about to arrive, inflation data are due Wednesday, and oil is still above one hundred dollars a barrel. Technology shares have powered expectations higher. But can those profits withstand expensive money? Lasse, what is the tension investors need to understand?"};
SHOW.scenes.splice(4,0,marketPulse); // Runtime-only: must match real previously paid audio.
const showScene=id=>SHOW.scenes.find(s=>s.id===id);
for(const s of SHOW.scenes){if(s.id==='world_outlook'||s.id==='watchlist'){
  s.kind='interlude';s.script=null;s.role=null;
  s.duration=7.5;
}if(s.id==='signoff'){s.script='Thanks for watching.';s.duration=3.7;}}
function node(command,args,{timeoutMs=900000,verbose=false}={}){
 return new Promise((resolve,reject)=>{
  const p=spawn(command,args,{stdio:['ignore','pipe','pipe']});let stderr='',stdout='';
  const timeout=setTimeout(()=>{p.kill('SIGKILL');},timeoutMs);
  p.stdout.on('data',d=>{stdout+=d.toString();if(verbose)process.stdout.write(d)});
  p.stderr.on('data',d=>{stderr+=d.toString();if(verbose)process.stderr.write(d)});
  p.on('error',e=>{clearTimeout(timeout);reject(e)});
  p.on('close',code=>{clearTimeout(timeout);if(code===0)resolve(stdout);else reject(new Error(command+' failed '+code+' '+stderr.slice(-1700)));});
 });
}
async function probe(file){const text=await node('ffprobe',['-v','error','-show_entries','format=duration,size','-show_entries','stream=codec_type,width,height,sample_rate','-of','json',file]);const j=JSON.parse(text);return {duration:Number(j.format.duration),bytes:Number(j.format.size),video:j.streams.find(s=>s.codec_type==='video'),audio:j.streams.find(s=>s.codec_type==='audio')};}
function sec(t){return Math.max(0,t).toFixed(3)}
function vtt(t){const h=Math.floor(t/3600),m=Math.floor(t/60)%60,s=Math.floor(t%60);return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(Math.round((t%1)*1000)).padStart(3,'0')}`}
const entries=[];let cursor=0;
for(const spec of clipSpec){
 const scene=showScene(spec.id);if(!scene)throw Error('Unknown scene '+spec.id);
 let p=null,tempo=1,audioDuration=0,duration=0;
 if(spec.clip){
  p=await probe(path.join(sources,spec.clip));if(!p.video||!p.audio||p.video.width<1280||p.video.height<720)throw Error('Source video incomplete '+spec.id);
  tempo=spec.role==='LIZA'?1.047:1.018;
  const original=spec.trimLength?Math.min(spec.trimLength,p.duration-spec.trimStart):p.duration;
  audioDuration=original/tempo;
  duration=Math.ceil((audioDuration+(spec.silentTail??.105))*PROG_FPS)/PROG_FPS;
 }else duration=Math.ceil(spec.duration*PROG_FPS)/PROG_FPS;
 entries.push({...spec,scene,duration,sourceDuration:p?.duration||null,audioDuration,tempo,start:cursor,end:cursor+duration});
 cursor+=duration;
}
console.log('EXPECTED MASTER DURATION',cursor.toFixed(3)+'s',entries.map(x=>`${x.id}:${x.duration.toFixed(2)}`).join(', '));
if(cursor<130||cursor>210)throw Error('Master timing outside legitimate news bulletin range');
async function renderBackground(entry,destination){
 const ff=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','image2pipe','-r',String(GRAPHICS_FPS),'-vcodec','png','-i','pipe:0','-t',sec(entry.duration),'-r',String(PROG_FPS),'-an','-c:v','libx264','-preset','ultrafast','-crf','19','-pix_fmt','yuv420p','-movflags','+faststart',destination],{stdio:['pipe','ignore','pipe']});
 let stderr='';ff.stderr.on('data',d=>stderr+=d.toString());
 const n=Math.ceil(entry.duration*GRAPHICS_FPS);
 for(let k=0;k<n;k++){
  const t=Math.min(entry.duration,(k+.2)/GRAPHICS_FPS);
  const shouldCut=entry.id==='signoff'?t>1.07:Boolean(entry.clip&&t>3.35&&t<entry.audioDuration-1.25);
  const svg=renderFrame(entry.scene,t,entry.duration,{globalSeconds:entry.start+t,audioDuration:entry.audioDuration,includePresenterWindow:true,cutaway:shouldCut});
  const png=await sharp(Buffer.from(svg)).png({compressionLevel:1}).toBuffer();
  if(!ff.stdin.write(png))await once(ff.stdin,'drain');
  if(k%Math.max(1,Math.floor(n/5))===0)console.log('GRAPHICS '+entry.id+': '+Math.round(k/n*100)+'%');
 }
 ff.stdin.end();const [code]=await once(ff,'close');
 if(code!==0)throw Error('Graphic encode '+entry.id+' status '+code+' '+stderr.slice(-1300));
}
async function composite(entry,dest,bg){
 if(!entry.clip){
  // Silent bed will be mixed globally — no blank voice at transitions.
  await node('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',bg,
   '-f','lavfi','-i','anullsrc=r=48000:cl=stereo', '-t',sec(entry.duration),'-map','0:v:0','-map','1:a:0',
   '-c:v','copy','-c:a','aac','-b:a','128k','-ar','48000',dest]);return;
 }
 const input=path.join(sources,entry.clip),enable=entry.id==='signoff'?`between(t,0,${sec(entry.audioDuration)})`:
  `between(t,0,3.35)+between(t,${sec(Math.max(3.36,entry.audioDuration-1.22))},${sec(entry.audioDuration)})`;
 const trim=entry.trimStart?`-ss,${sec(entry.trimStart)},-t,${sec(entry.trimLength)}`:'';
 const pre=['-hide_banner','-loglevel','error','-y','-i',bg];
 if(entry.trimStart)pre.push('-ss',sec(entry.trimStart),'-t',sec(entry.trimLength));
 pre.push('-i',input);
 // Preserve the entire source frame instead of centre-cropping HeyGen faces; dark matte fills width differences.\n const filter=`[1:v]setpts=PTS/${entry.tempo.toFixed(4)},fps=30,scale=772:405:force_original_aspect_ratio=decrease,pad=772:405:(ow-iw)/2:(oh-ih)/2:color=0x113255,setsar=1,format=yuv420p[face];`+
  `[0:v][face]overlay=x=58:y=322:enable='${enable}':eof_action=pass:shortest=0:format=auto,format=yuv420p[v];`+
  `[1:a]aresample=48000,atempo=${entry.tempo.toFixed(4)},highpass=f=75,acompressor=threshold=-20dB:ratio=1.5:attack=10:release=110,volume=1.05,afade=t=in:st=0:d=0.055,afade=t=out:st=${sec(Math.max(.2,entry.audioDuration-.18))}:d=0.14,apad,atrim=duration=${sec(entry.duration)},asetpts=PTS-STARTPTS[a]`;
 await node('ffmpeg',[...pre,'-filter_complex',filter,'-map','[v]','-map','[a]','-t',sec(entry.duration),'-r','30',
 '-c:v','libx264','-preset','veryfast','-crf','20','-pix_fmt','yuv420p',
 '-c:a','aac','-b:a','160k','-ar','48000','-movflags','+faststart',dest]);
}
const complete=[];
for(let i=0;i<entries.length;i++){
 const e=entries[i];const bg=path.join(rendered,e.id+'-bg.mp4'),out=path.join(rendered,e.id+'-full.mp4');
 try{const cached=await probe(out);if(cached.bytes>50000&&Math.abs(cached.duration-e.duration)<.22){console.log('REUSED SCENE',i+1+'/'+entries.length,e.id,cached.duration+'s');complete.push(out);continue;}}catch{}
 await renderBackground(e,bg);
 await composite(e,out,bg);
 const info=await probe(out);
 if(Math.abs(info.duration-e.duration)>.22)throw Error('Bad scene duration '+e.id+' '+info.duration+' vs '+e.duration);
 console.log('FINISHED SCENE',i+1+'/'+entries.length,e.id,sec(info.duration)+'s');complete.push(out);
}
const concatPath=path.join(rendered,'concat.txt');await writeFile(concatPath,complete.map(f=>`file '${f.replaceAll("'","'\\''")}'`).join('\n')+'\n');
const raw=path.join(root,'SIGNAL-R4plus-uncorrected-audio.mp4');
await node('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',concatPath,
 '-c:v','libx264','-preset','veryfast','-crf','19','-pix_fmt','yuv420p','-r','30','-c:a','aac','-b:a','192k','-ar','48000','-movflags','+faststart',raw],{timeoutMs:900000});
// Original stereo background bed; no external music/synthesis service.
const toneFile=path.join(root,'signal-marketwatch-original-bed.wav');
const rate=24000,samples=Math.ceil(cursor*rate),b=Buffer.alloc(44+samples*4);
b.write('RIFF',0);b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(2,22);b.writeUInt32LE(rate,24);b.writeUInt32LE(rate*4,28);b.writeUInt16LE(4,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(samples*4,40);
for(let i=0;i<samples;i++){const t=i/rate,rootFreq=[130.81,146.83,123.47][Math.floor(t/12)%3],low=(Math.sin(2*Math.PI*rootFreq*t)+.43*Math.sin(2*Math.PI*rootFreq*1.5*t))*.009;let sting=0;
 for(const e of entries){const dt=t-e.start;if(dt>=0&&dt<.9)sting+=.007*Math.sin(2*Math.PI*440*dt)*Math.exp(-5.1*dt);}
 const fade=Math.min(1,t/1.4,(cursor-t)/2.3),x=Math.max(-1,Math.min(1,(low+sting)*Math.max(0,fade)));
 b.writeInt16LE(Math.round(x*32000),44+4*i);b.writeInt16LE(Math.round(x*.97*32000),46+4*i);
}
await writeFile(toneFile,b);
const final=path.join(root,'SIGNAL-MARKET-WATCH-R4PLUS-BRIGHT-1080P-FINAL.mp4');
await node('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',raw,'-i',toneFile,
 '-filter_complex','[0:a][1:a]amix=inputs=2:duration=first:dropout_transition=0,alimiter=limit=0.96[a]',
 '-map','0:v:0','-map','[a]','-c:v','copy','-c:a','aac','-b:a','192k','-ar','48000','-movflags','+faststart',final],{timeoutMs:600000});
// Caption file based only on authentic speech, even for the previously reused narration.
let captions='WEBVTT\n\n',cue=0;
for(const e of entries){if(!e.clip)continue;const words=e.scene.script.trim().split(/\s+/),chunks=[];
 for(let i=0;i<words.length;i+=9)chunks.push(words.slice(i,i+9).join(' '));const span=e.audioDuration/chunks.length;
 for(let i=0;i<chunks.length;i++){const st=e.start+i*span,finish=Math.min(e.end,st+span);captions+=`${++cue}\n${vtt(st)} --> ${vtt(finish)}\n${chunks[i]}\n\n`}
}
const capFile=path.join(root,'SIGNAL-MARKET-WATCH-R4PLUS-CAPTIONS.vtt');await writeFile(capFile,captions);
const qr=await probe(final);if(!qr.audio||qr.video.width!==1920||qr.video.height!==1080||Math.abs(qr.duration-cursor)>.25)throw Error('Final technical QA failed');
const stages=[8,22,41,68,96,118,qr.duration-6].filter(x=>x<qr.duration-0.5),frames=[];
for(let i=0;i<stages.length;i++){
 const filename=path.join(root,'frame-'+i+'.jpg');await node('ffmpeg',['-hide_banner','-loglevel','error','-y','-ss',sec(stages[i]),'-i',final,'-frames:v','1','-update','1','-vf','scale=960:540',filename]);
 frames.push({input:await sharp(filename).resize(960,540).png().toBuffer(),left:(i%2)*980,top:Math.floor(i/2)*555});
}
const height=Math.ceil(frames.length/2)*555;await sharp({create:{width:1960,height,channels:3,background:'#061b3b'}}).composite(frames).jpeg({quality:82}).toFile(path.join(root,'SIGNAL-R4PLUS-SCENE-CONTACT-SHEET.jpg'));
const sha=crypto.createHash('sha256').update(await readFile(final)).digest('hex');
const qa={title:'SIGNAL Market Watch — October 12 Bright News Bulletin',release:'R4plus budget recovery',
 finalMp4:final,durationSeconds:qr.duration,format:'1920x1080 H264/AAC 30fps',sha256:sha,contactSheet:'SIGNAL-R4PLUS-SCENE-CONTACT-SHEET.jpg',
 clipsReused:['rates','energy','inflation','market_pulse','signoff-tail'],freshCompleted:['top_stories','global_market','earnings'],
 paidFailedDueToInsufficientCredit:['world_outlook','watchlist','signoff-full'],
 generatedAgain:false,allSourceSpeakersAuthorized:true,labels:['NEWS BULLETIN','SOURCE','AS OF 12 OCT 2026'],noFakeLiveQuotes:true,
 finalCreativeReviewPending:true,totalSegments:entries.length,segments:entries.map(e=>({id:e.id,begin:sec(e.start),seconds:sec(e.duration),source:e.clip||null}))};
await writeFile(path.join(root,'SIGNAL-R4PLUS-TECHNICAL-QA.json'),JSON.stringify(qa,null,2));
console.log('FINAL_MASTER_SUCCESS',JSON.stringify({duration:qr.duration,sha,size:qr.bytes,frames:stages,sourceCount:entries.filter(x=>x.clip).length}));