import './stocks-operator.css';
import demo from '../docs/stocks-network/client-demo-155s.manifest.json';
import {validateClientDemo} from '../network/demo/demo-policy.mjs';
import {modelAvatarCosts} from '../network/demo/cost-model.mjs';

const $=id=>document.getElementById(id);
const fmt=seconds=>String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(Math.floor(seconds%60)).padStart(2,'0');
const roles=new Map(demo.avatars.map(x=>[x.id,x]));
const qa=validateClientDemo(demo);
const budget=modelAvatarCosts({avatarCount:4});
const sources=new Map();
const video=$('preview-video');
let selectedIndex=0,clockSec=0,running=false,lastFrame=0,frameId=0;
function el(tag,cls,contents){
 const node=document.createElement(tag);
 if(cls)node.className=cls;
 if(contents!==undefined)node.textContent=contents;
 return node;
}
for(const p of demo.avatars){
 const card=el('div','persona');card.id='persona-'+p.id;
 const row=el('div','row');row.append(el('b','',p.name));
 const state=el('span','state','NO MOVING SOURCE');state.id='state-'+p.id;row.append(state);card.append(row);
 card.append(el('small','',p.role));
 const label=el('label','','Local QA video only:');
 label.style.fontSize='11px';label.style.display='block';label.style.marginTop='10px';
 const input=el('input');input.type='file';input.accept='video/*';input.setAttribute('aria-label','Local video clip for '+p.name);
 input.addEventListener('change',()=>loadLocal(p.id,input.files?.[0]));
 label.append(input);card.append(label);
 const btn=el('button','mini','Preview '+p.name);
 btn.addEventListener('click',()=>{
   const idx=demo.shots.findIndex(s=>s.speakerId===p.id&&(s.kind==='ANCHOR'||s.kind==='INTERACTION'));
   if(idx>=0)selectShot(idx);
 });card.append(btn);
 $('personas').append(card);
}
for(const [i,s] of demo.shots.entries()){
 const btn=el('button','cue');btn.dataset.cue=i;
 const time=el('small','',fmt(s.startSec));
 const name=el('span','',s.headline);
 const role=el('em','',roles.get(s.speakerId)?.name||'Graphics');
 btn.append(time,name,role);btn.addEventListener('click',()=>selectShot(i));
 $('rundown').append(btn);
}
const qaRows=[
['Demo timeline',qa.pass?'VALID':'FAILED',qa.pass?'green':'red'],
['Source AI faces and motion','PENDING','red'],
['2–4 custom avatar subscriptions','NOT CONNECTED','red'],
['Presenter speech/lips sync','PENDING','red'],
['US data redistribution and rights','PENDING','red'],
['On-air studio visual acceptance','PENDING','red'],
['Final MP4 approval SHA','MISSING','red'],
['Estimated vendor monthly floor',budget.currency+' '+budget.estimatedMonthlyAvatarVendorCost,'']
];
for(const [key,value,state] of qaRows){
 const li=el('li');li.append(document.createTextNode(key+': '));
 li.append(el('span',state,value));$('qa-list').append(li);
}
function loadLocal(role,file){
 if(!file)return;
 if(!file.type.startsWith('video/')){alert('A real video file is required for source QA.');return;}
 const prior=sources.get(role);
 if(prior?.url)URL.revokeObjectURL(prior.url);
 sources.set(role,{url:URL.createObjectURL(file),filename:file.name,kind:'LOCAL_UNVERIFIED_VIDEO'});
 $('state-'+role).textContent='LOCAL VIDEO / UNAPPROVED';
 if(demo.shots[selectedIndex].speakerId===role)selectShot(selectedIndex);
}
function setNoSource(kind){
 video.pause();video.classList.remove('visible');
 $('no-source').style.display='grid';
 const words=kind==='GRAPHIC'?['US-MARKET GRAPHIC REHEARSAL','An approved audio narration and source-verified chart will be played here.']:
  ['NO VERIFIED MOVING AVATAR SOURCE','Only actual commercial-provider video with matched voice may replace this placeholder.'];
 $('no-source').querySelector('b').textContent=words[0];
 $('no-source').querySelector('span').textContent=words[1];
 $('screen-status').textContent='OFFLINE TECHNICAL REHEARSAL';
}
function selectShot(i,{autoplay=true}={}){
 const shot=demo.shots[i];if(!shot)return;
 selectedIndex=i;clockSec=shot.startSec;
 $('stage-headline').textContent=shot.headline;
 $('stage-subtitle').textContent=(roles.get(shot.speakerId)?.name||'Original Stocks Studio')+' / UNAPPROVED MOVING VIDEO';
 $('script').textContent=shot.script||'Brand opening/closing animation to be attached after licensing and QA.';
 $('reading-time').textContent=fmt(shot.startSec)+'—'+fmt(shot.startSec+shot.durationSec);
 $('seek').value=clockSec;$('time').textContent=fmt(clockSec)+' / 02:35';
 for(const p of demo.avatars)$('persona-'+p.id).classList.toggle('active',shot.speakerId===p.id);
 for(const b of $('rundown').querySelectorAll('button'))b.classList.toggle('current',Number(b.dataset.cue)===i);
 const source=sources.get(shot.speakerId);
 if(source && ['ANCHOR','INTERACTION','OUTRO'].includes(shot.kind)){
   if(video.src!==source.url){video.srcObject=null;video.src=source.url;}
   video.classList.add('visible');$('no-source').style.display='none';
   $('screen-status').textContent='LOCAL CLIP / NOT FOR AIR';
   if(autoplay)video.play().catch(()=>{});
 }else setNoSource(shot.kind);
}
function step(now){
 if(!running)return;
 const delta=lastFrame?Math.min(0.08,(now-lastFrame)/1000):0;
 lastFrame=now;clockSec+=delta;
 if(clockSec>=demo.durationSec){
  running=false;video.pause();$('start-btn').textContent='▶ Start rehearsal';
  clockSec=demo.durationSec;
 }else{
  const idx=demo.shots.findIndex(s=>clockSec>=s.startSec&&clockSec<s.startSec+s.durationSec);
  if(idx>=0&&idx!==selectedIndex){
    const preserve=clockSec;selectShot(idx);clockSec=preserve;
  }
 }
 $('seek').value=clockSec;$('time').textContent=fmt(clockSec)+' / 02:35';
 if(running)frameId=requestAnimationFrame(step);
}
$('start-btn').addEventListener('click',()=>{
 running=!running;
 $('start-btn').textContent=running?'❚❚ Pause rehearsal':'▶ Start rehearsal';
 if(running){
  if(clockSec>=demo.durationSec){selectShot(0);clockSec=0;}
  lastFrame=0;frameId=requestAnimationFrame(step);
  if(video.classList.contains('visible'))video.play().catch(()=>{});
 }else{cancelAnimationFrame(frameId);video.pause();}
});
$('pause-btn').addEventListener('click',()=>{
 running=false;cancelAnimationFrame(frameId);video.pause();
 $('start-btn').textContent='▶ Start rehearsal';
});
$('graphics-btn').addEventListener('click',()=>selectShot(demo.shots.findIndex(s=>s.kind==='GRAPHIC')));
$('standby-btn').addEventListener('click',()=>{
 running=false;cancelAnimationFrame(frameId);setNoSource('STANDBY');
 $('screen-status').textContent='STANDBY · RECORDED SAFE SLATE';
 $('start-btn').textContent='▶ Start rehearsal';
});
$('seek').addEventListener('input',e=>{
 const t=Number(e.target.value);
 const i=demo.shots.findIndex(s=>t>=s.startSec&&t<s.startSec+s.durationSec);
 if(i>=0){selectShot(i);clockSec=t;$('seek').value=t;$('time').textContent=fmt(t)+' / 02:35';}
});
window.addEventListener('beforeunload',()=>{
 for(const source of sources.values())if(source.url)URL.revokeObjectURL(source.url);
});
selectShot(0,{autoplay:false});
