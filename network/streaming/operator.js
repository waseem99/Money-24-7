/**
 * Private LiveAvatar LITE integration lab for Stocks.
 * This module does NOT mint sessions, buy credits, generate avatars or create a public feed.
 * An operator may connect an ALREADY-issued provider token only after manual approvals.
 * Do not deploy publicly without upstream operator authentication and durable session accounting.
 */
import {sessionPreflight,ROLES,STOCKS_STREAM_GATE} from './vendor-policy.mjs';
import {startGreenKey} from './keyer.js';

const $=id=>document.getElementById(id);
const live=new Map();
let studioObjectURL=null,selectedCamera='A_WIDE';
function report(message){
 const el=$('statusText');
 el.textContent=new Date().toLocaleTimeString()+' — '+message+'\n'+el.textContent.slice(0,1800);
}
function state(role,status){
 $(role+'-status').textContent=status;
}
function safeSource(video,canvas,role){
 try{
  const processor=startGreenKey(video,canvas,{
   onError:()=>{report(role+': WebGL video processing failed, composited source blocked');canvas.style.display='none';}
  });
  return processor;
 }catch(e){
  report(role+': WebGL unavailable; raw diagnostic stream only, not ready for production');
  canvas.style.display='none';video.style.display='block';
  return {stop(){},getFrames:()=>0};
 }
}
function view(camera){
 selectedCamera=camera;
 $('camera-status').textContent=camera+' · STREAMING SOURCE TEST (NOT LIVE BROADCAST)';
 const visible=camera==='A_WIDE'?new Set(ROLES):
   camera==='B_MARCUS'?new Set(['MARCUS']):
   camera==='C_NORA'?new Set(['NORA']):new Set();
 for(const role of ROLES){
  const stage=document.querySelector('.actor[data-role="'+role+'"]');
  const strap=document.querySelector('.name.'+role.toLowerCase());
  const shown=visible.has(role);
  stage.style.display=shown?'block':'none';
  strap.style.display=shown?'block':'none';
  const video=$(role+'-video');
  video.muted=!(shown&&(camera==='A_WIDE'?role==='NORA':true));
 }
 $('stage-label').textContent='PRODUCER TEST · '+(camera==='D_GRAPHICS'?'CHART CUTAWAY':camera);
 report('Camera switched to '+camera+'; both avatars are separate sources, not a proven physical shared desk');
}
async function stop(role,{byDisconnect=false}={}){
 const current=live.get(role);
 if(!current)return;
 live.delete(role);
 current.closed=true;
 if(current.timer)clearTimeout(current.timer);
 current.keyer?.stop();
 const stage=document.querySelector('.actor[data-role="'+role+'"]');
 stage.classList.remove('connected');
 const video=$(role+'-video'),canvas=$(role+'-canvas');
 video.style.display='none';canvas.style.display='none';
 if(!byDisconnect){
  try{await current.session.stop();}catch{report(role+': provider stop could not be verified; inspect provider session dashboard');}
 }
 try{video.pause();video.srcObject=null;}catch{}
 state(role,'DISCONNECTED');
 report(role+': session ended; verify provider billing stop receipt separately');
}
async function connect(role){
 if(live.has(role)){report(role+': already connected; no second session started');return;}
 if(!studioObjectURL){
  report(role+': no clean licensed newsroom background selected. Load a source plate before billable test.');
  state(role,'BLOCKED · NO STUDIO');return;
 }
 const capability=document.createElement('canvas').getContext('webgl');
 if(!capability){report(role+': this machine has no WebGL compositing; refusing to spend for an unusable key test.');state(role,'BLOCKED · GPU');return;}
 const input=$(role+'-token');
 const token=input.value.trim();input.value='';
 const secs=Number($('session-cap').value);
 const approved=$(role+'-approved').checked;
 const credit=$(role+'-credit').checked;
 const gate=sessionPreflight({
  role,mode:'LITE',sourceKind:'ORIGINAL_FICTIONAL_CUSTOM_AVATAR',
  sourceApproved:approved,providerEligibilityVerified:approved,
  commercialTestRightsApproved:approved,
  operatorSession:true,viewerDriven:false,manualStart:true,explicitCreditApproval:credit,
  sessionToken:token,maximumSeconds:secs,
  isCurrentNews:false,rendererOnAirStatus:'TEST ONLY'
 });
 if(!gate.pass){
  state(role,'BLOCKED');
  report(role+' start rejected: '+gate.errors.join('; '));
  return;
 }
 state(role,'CONNECTING');
 report(role+': importing SDK locally and starting *previously authorised* LITE session; time cap '+secs+' sec');
 let entry;
 try{
  const {LiveAvatarSession,SessionEvent}=await import('@heygen/liveavatar-web-sdk');
  const session=new LiveAvatarSession(token,{apiUrl:location.origin+'/api/liveavatar',voiceChat:false});
  entry={session,closed:false,mediaReady:false,keyer:null,timer:null,createdAt:Date.now()};
  live.set(role,entry);
  session.on(SessionEvent.SESSION_STREAM_READY,()=>{
   if(entry.closed||live.get(role)!==entry)return;
   const video=$(role+'-video'),canvas=$(role+'-canvas');
   session.attach(video);
   video.play().catch(()=>report(role+': browser autoplay blocked; interact with source player'));
   entry.keyer?.stop();
   entry.keyer=safeSource(video,canvas,role);
   entry.mediaReady=true;
   document.querySelector('.actor[data-role="'+role+'"]').classList.add('connected');
   state(role,'STREAM CONNECTED · NOT QA APPROVED');
   report(role+': media tracks attached; observe real face motion, background key, audio and glasses/hair edges');
   view(selectedCamera);
  });
  session.on(SessionEvent.SESSION_DISCONNECTED,()=>{
   if(live.get(role)===entry)void stop(role,{byDisconnect:true});
  });
  entry.timer=setTimeout(()=>{report(role+': operator test time cap reached; stopping session');void stop(role);},secs*1000);
  await session.start();
  if(live.get(role)!==entry)return;
  if(!entry.mediaReady)state(role,'PROVIDER CONNECTED · WAITING FOR MEDIA');
  // A token is not proof of video: only SESSION_STREAM_READY qualifies as connected media.
 }catch(error){
  if(entry){await stop(role);}
  state(role,'FAILED');
  report(role+': provider connection failed. Check account token/entitlements. No automatic retry.');
 }
}
$('background-file').addEventListener('change',event=>{
 const file=event.target.files?.[0];
 if(!file)return;
 if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>25*1024*1024){
  report('Studio plate rejected: use clean PNG/JPEG/WebP smaller than 25 MB');event.target.value='';return;
 }
 if(studioObjectURL)URL.revokeObjectURL(studioObjectURL);
 studioObjectURL=URL.createObjectURL(file);
 $('background').src=studioObjectURL;
 $('background').style.display='block';
 report('Local clean room candidate loaded for camera tests. Not a signed/approved broadcast asset.');
});
$('cut-nora').addEventListener('click',()=>view('C_NORA'));
$('cut-marcus').addEventListener('click',()=>view('B_MARCUS'));
$('cut-wide').addEventListener('click',()=>view('A_WIDE'));
$('cut-charts').addEventListener('click',()=>view('D_GRAPHICS'));
for(const role of ROLES){
 $(role+'-start').addEventListener('click',()=>void connect(role));
 $(role+'-stop').addEventListener('click',()=>void stop(role));
}
window.addEventListener('pagehide',()=>{
 if(studioObjectURL)URL.revokeObjectURL(studioObjectURL);
 for(const role of [...live.keys()])void stop(role);
});
view('A_WIDE');
report('NO billable provider work was started at load; manual custom-portrait and session approvals are required.');
