import sharp from 'sharp';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {mkdir,writeFile,readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {SHOW} from './newsroom-r4-plan.mjs';
import {renderFrame} from './newsroom-r4-graphics.mjs';
const OUT=process.env.SIGNAL_R4_OUTPUT||'/mnt/data/signal_r4_final';
const SRC=process.env.SIGNAL_R4_SOURCES||path.join(OUT,'sources');
const RENDER=path.join(OUT,'rendered');
const FPS=30,GRAPHIC_FPS=Number(process.env.SIGNAL_R4_GRAPHIC_FPS||12);
const base=id=>{
 const x=SHOW.scenes.find(s=>s.id===id);if(!x)throw Error('Unknown original news scene '+id);
 return structuredClone(x);
};
const script={
 top_stories:SHOW.scenes.find(x=>x.id==='top_stories').script,
 global_market:SHOW.scenes.find(x=>x.id==='global_market').script,
 earnings:SHOW.scenes.find(x=>x.id==='earnings').script,
 rates:"Two powerful forces are colliding. Big technology profits look promising. Yet borrowing is costly. In September the Federal Reserve raised its policy range to three and three quarters through four percent. Treasury yields have climbed to multi-decade highs. That's a serious valuation test, even for companies delivering good results.",
 energy:"And now energy is complicating the picture. Brent crude has been above one hundred dollars, according to Monday's market reports. That can raise shipping and manufacturing costs. If profits look strong but households and businesses face higher bills, where do you look for the warning signs?",
 inflation:"Start with the major banks. Watch loan demand, credit losses, and what executives say about customers. Then Wednesday's consumer inflation report. A hotter reading could keep pressure on bond yields and highly valued shares. A cooler one could ease it. Neither outcome is certain. That's why this week matters.",
 recap:"Markets are facing a real test this week. Bank earnings are about to arrive, inflation data are due Wednesday, and oil is still above one hundred dollars a barrel. Technology shares have powered expectations higher. But can those profits withstand expensive money? Lasse, what is the tension investors need to understand?",
 watchlist:"So the discipline is simple: verify the source, define the timeframe, compare volume, and keep indicators in context. If the evidence is incomplete, say so. That makes the story more useful than a confident but unsupported claim.",
 signoff:'Thanks for watching.'
};
function custom(id, changes={}){return Object.assign(base(id),changes);}
const profile=[
 {id:'intro',scene:base('ident'),type:'graphics',duration:8},
 {id:'top_stories',scene:base('top_stories'),type:'voice',src:'r4/top_stories.mp4',speed:1.04,words:script.top_stories},
 {id:'global_market',scene:base('global_market'),type:'voice',src:'r4/global_market.mp4',speed:1.02,words:script.global_market},
 {id:'transition_market',scene:custom('global_market',{headline:'WALL STREET IN FOCUS',sub:'MAJOR BANKS REPORT THIS WEEK'}),type:'graphics',duration:3},
 {id:'earnings',scene:base('earnings'),type:'voice',src:'r4/earnings.mp4',speed:1.04,words:script.earnings},
 {id:'recap',scene:custom('world_outlook',{role:'LIZA',layout:'top-story',eyebrow:'THE BIGGER PICTURE',headline:'A RALLY FACES HIGHER COSTS',sub:'BANKS · ENERGY · INTEREST RATES',sourceIds:['BANKS','BRENT','FED'],script:script.recap,accent:'gold'}),type:'voice',src:'r2/news_open.mp4',speed:1.04,words:script.recap},
 {id:'midpoint',scene:custom('earnings',{eyebrow:'NEWS IN FOCUS',headline:'EARNINGS AND THE CREDIT TEST',sub:'Q3 EXPECTATIONS · RESULTS AHEAD',sourceIds:['BANKS']}),type:'graphics',duration:6},
 {id:'rates',scene:Object.assign(base('rates'),{script:script.rates}),type:'voice',src:'r2/rates.mp4',speed:1.02,words:script.rates},
 {id:'transition_rates',scene:custom('rates',{eyebrow:'BOND MARKET WATCH',headline:'HIGHER BORROWING COSTS',sub:'FEDERAL RESERVE · TREASURY YIELDS'}),type:'graphics',duration:3},
 {id:'energy',scene:Object.assign(base('energy'),{script:script.energy}),type:'voice',src:'r2/oil.mp4',speed:1.04,words:script.energy},
 {id:'inflation',scene:Object.assign(base('inflation'),{script:script.inflation}),type:'voice',src:'r2/cpi.mp4',speed:1.02,words:script.inflation},
 {id:'world_outlook',scene:custom('world_outlook',{headline:'NEXT: THE GLOBAL OUTLOOK',sub:'IMF TUESDAY · US CPI WEDNESDAY',sourceIds:['IMF','CPI'],script:''}),type:'graphics',duration:12},
 {id:'transition_calendar',scene:custom('inflation',{eyebrow:'THE NEXT TWO DAYS',headline:'REPORTS THAT COULD MOVE MARKETS',sub:'IMF · INFLATION · EARNINGS'}),type:'graphics',duration:3},
 {id:'watchlist',scene:Object.assign(base('watchlist'),{script:script.watchlist}),type:'voice',src:'r3/lasse_takeaway.mp4',speed:1.02,words:script.watchlist},
 {id:'signoff',scene:Object.assign(base('signoff'),{script:script.signoff}),type:'voice',src:'r3/liza_close.mp4',speed:1.0,words:script.signoff,trimFrom:8.32,trimSeconds:1.08},
 {id:'outro',scene:base('end'),type:'graphics',duration:6}
];
function rnd(s){return Math.round(s*FPS)/FPS;}
async function probe(src){
 const {stdout}=await command('ffprobe',['-v','error','-show_entries','format=duration','-of','default=nokey=1:noprint_wrappers=1',src],{verbose:false});
 return Number(stdout.trim());
}
function hh(t){let h=Math.floor(t/3600),m=Math.floor(t%3600/60),s=Math.floor(t%60),ms=Math.floor((t%1)*1000);return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(ms).padStart(3,'0')}`;}
function cmdFile(s){return path.join(RENDER,s+'.mp4');}
async function command(cmd,args,{verbose=false,timeoutMs=480000}={}){
 const ch=spawn(cmd,args,{stdio:['ignore','pipe','pipe']});let stdout='',stderr='';
 ch.stdout.on('data',b=>stdout+=b.toString().slice(-1600));ch.stderr.on('data',b=>stderr+=b.toString().slice(-2000));
 let timeout=false;
 const timer=setTimeout(()=>{timeout=true;ch.kill('SIGKILL')},timeoutMs);
 const code=await new Promise((res,rej)=>{ch.on('error',rej);ch.on('close',(exit,signal)=>res({exit,signal}));});clearTimeout(timer);
 if(code.exit!==0||timeout)throw Error(`${cmd} failed ${JSON.stringify({code,timeout,err:stderr.slice(-2500),args:args.slice(0,18)})}`);
 if(verbose)console.log(stdout.slice(-400));return {stdout,stderr};
}
const schedule=[];let cursor=0;
await mkdir(RENDER,{recursive:true});
for(const x of profile){
 let d=x.duration;
 if(x.type==='voice'){
  const full=await probe(path.join(SRC,x.src));x.sourceDuration=full;
  const trim=x.trimFrom!==undefined?x.trimSeconds:full;
  d=trim/x.speed;
 }
 x.duration=rnd(d);x.start=rnd(cursor);x.end=rnd(cursor+x.duration);cursor=x.end;
 schedule.push({id:x.id,kind:x.type,showSceneId:x.scene.id,start:x.start,duration:x.duration,end:x.end,source:x.src??null,role:x.scene.role??null,sourceDuration:x.sourceDuration??null,words:x.words??null,playbackSpeed:x.speed??null});
}
const total=cursor;
console.log('TARGET TOTAL',total,'segments',profile.length);
if(total<171||total>187)throw Error('Unexpected final duration target: '+total);
await writeFile(path.join(OUT,'SIGNAL-R4-plus-timeline.json'),JSON.stringify({edition:'2026-10-12',totalDuration:total,segments:schedule,paidGenerationInThisProcess:0,sourceProvenance:'Six current reports + two recorded R2 reporting segments + one older newsroom summary and broadcaster signoff'},null,2));
let vtt='WEBVTT\n\n',c=0;
for(const x of profile){
 if(x.type!=='voice')continue;
 const words=x.words.trim().split(/\s+/),n=Math.ceil(words.length/9),d=x.duration/n;
 for(let i=0;i<n;i++){
  const seg=words.slice(i*9,(i+1)*9).join(' ');
  vtt+=`${++c}\n${hh(x.start+i*d)} --> ${hh(x.start+Math.min((i+1)*d,x.duration))}\n${seg}\n\n`;
 }
}
await writeFile(path.join(OUT,'SIGNAL-Market-Watch-R4+-captions.vtt'),vtt);
async function makeBackdrop(x){
 const output=path.join(RENDER,x.id+'-bg.mp4');
 const count=Math.ceil(x.duration*GRAPHIC_FPS);
 const cmd=['-hide_banner','-loglevel','error','-y','-f','rawvideo','-pix_fmt','rgba','-s','1920x1080','-framerate',String(GRAPHIC_FPS),'-i','pipe:0','-an','-r','30','-c:v','libx264','-preset','veryfast','-crf','21','-pix_fmt','yuv420p','-movflags','+faststart',output];
 const child=spawn('ffmpeg',cmd,{stdio:['pipe','ignore','pipe']});let err='';child.stderr.on('data',b=>err+=(b.toString()).slice(-1300));
 const faceEnd=x.type==='voice'?Math.min(3.1,x.duration):0;
 try{
  for(let i=0;i<count;i++){
   const elapsed=i/GRAPHIC_FPS;
   const svg=renderFrame(x.scene,elapsed,x.duration,{globalSeconds:x.start+elapsed,audioDuration:x.type==='voice'?x.duration:0,includePresenterWindow:elapsed<faceEnd&&x.type==='voice'});
   const frame=await sharp(Buffer.from(svg),{density:72}).ensureAlpha().raw().toBuffer();
   if(frame.length!==1920*1080*4)throw Error('Bad frame byte length '+frame.length);
   if(!child.stdin.write(frame))await once(child.stdin,'drain');
   if(i%90===0&&i)console.log('FRAME '+x.id+' '+(i/GRAPHIC_FPS).toFixed(1)+'/'+x.duration+'s');
  }
  child.stdin.end();const [code]=await once(child,'close');if(code!==0)throw Error('ffmpeg BG '+x.id+' '+err.slice(-1300));
  return output;
 }catch(e){child.kill('SIGKILL');throw e;}
}
async function makeScene(x,bg){
 const output=cmdFile(x.id),duration=x.duration.toFixed(3);
 if(x.type==='graphics'){
  await command('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',bg,'-f','lavfi','-i','anullsrc=r=48000:cl=stereo','-t',duration,'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','128k','-ar','48000','-movflags','+faststart',output],{timeoutMs:300000});
  return output;
 }
 const s=path.join(SRC,x.src),rate=x.speed||1;const start=x.trimFrom||0;
 const useClips=x.trimSeconds!==undefined;
 const trimVideo=useClips?`trim=start=${start.toFixed(3)}:duration=${x.trimSeconds.toFixed(3)},`:'';
 const trimAudio=useClips?`atrim=start=${start.toFixed(3)}:duration=${x.trimSeconds.toFixed(3)},`:'';
 const faceSecs=Math.min(3.06,x.duration-.1).toFixed(2);
 const filt=`[1:v]${trimVideo}setpts=(PTS-STARTPTS)/${rate.toFixed(4)},fps=30,scale=772:405:force_original_aspect_ratio=increase,crop=772:405,setsar=1,format=yuv420p[f];`+
   `[0:v][f]overlay=x=58:y=322:enable='lt(t,${faceSecs})':eof_action=pass:shortest=0,format=yuv420p[v];`+
   `[1:a]${trimAudio}asetpts=PTS-STARTPTS,aresample=48000,atempo=${rate.toFixed(4)},highpass=f=75,acompressor=threshold=-18dB:ratio=1.4:attack=9:release=130,volume=1.04,apad,atrim=duration=${duration},asetpts=PTS-STARTPTS[a]`;
 await command('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',bg,'-i',s,'-filter_complex',filt,'-map','[v]','-map','[a]','-t',duration,'-r','30','-c:v','libx264','-preset','veryfast','-crf','21','-pix_fmt','yuv420p','-c:a','aac','-ar','48000','-b:a','160k','-movflags','+faststart',output],{timeoutMs:450000});
 return output;
}
// Start with one preview; all scene assembly is deliberately deterministic and purely local.
const startIndex=Number(process.env.START_SCENE||0),limit=Number(process.env.LIMIT_SCENES||profile.length);
for(let i=startIndex;i<Math.min(profile.length,startIndex+limit);i++){
 const x=profile[i];const stamp=Date.now();
 const existing=cmdFile(x.id);
 if(process.env.CACHE_APPROVED_SCENES==='1'){
  try{const p=await probe(existing);if(Math.abs(p-x.duration)<.15){console.log('REUSE '+x.id);continue;}}catch{}
 }
 console.log('RENDER '+(i+1)+'/'+profile.length,x.id,x.type,x.duration+'s');
 const bg=await makeBackdrop(x);await makeScene(x,bg);
 const p=await probe(existing);
 if(Math.abs(p-x.duration)>.18)throw Error('Rendered scene '+x.id+' duration mismatch '+p+' vs '+x.duration);
 console.log('SUCCESS '+x.id,p.toFixed(2)+'s','elapsed '+((Date.now()-stamp)/1000).toFixed(1)+'s');
}
if(startIndex+limit>=profile.length){
 const lines=profile.map(x=>`file '${cmdFile(x.id)}'`).join('\n')+'\n';
 await writeFile(path.join(RENDER,'concat.txt'),lines);
 await command('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',path.join(RENDER,'concat.txt'),'-c','copy','-movflags','+faststart',path.join(OUT,'SIGNAL-R4plus-prebed.mp4')],{timeoutMs:240000});
 console.log('COMPLETE PRE-BED VIDEO '+total.toFixed(2)+'s');
}