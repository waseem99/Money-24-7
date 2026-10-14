/**
 * Private LiveAvatar LITE integration lab for Stocks.
 * This module does NOT mint sessions, buy credits, generate avatars or create a public feed.
 * An operator may connect an ALREADY-issued provider token only after manual approvals.
 * Do not deploy publicly without upstream operator authentication and durable session accounting.
 */
import {sessionPreflight,ROLES,STOCKS_STREAM_GATE} from './vendor-policy.mjs';
import {startGreenKey} from './keyer.js';
import {ProgramRecorder,validateCaptureInputs} from './program-capture.mjs';
import {prepareLiteAudioFile,audioProofPolicy} from './lite-audio.mjs';

const $=id=>document.getElementById(id);
const live=new Map();
let studioObjectURL=null,selectedCamera='A_WIDE';
let studioBitmap=null,brandBitmap=null,recorder=null;
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
 if(recorder)recorder.cameraCut(camera);
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
 if(recorder)recorder.stop();
 const stage=document.querySelector('.actor[data-role="'+role+'"]');
 stage.classList.remove('connected');
 const video=$(role+'-video'),canvas=$(role+'-canvas');
 video.style.display='none';canvas.style.display='none';
 if(!byDisconnect){
  try{await current.session.stop();}catch{report(role+': provider stop could not be verified; inspect provider session dashboard');}
 }
 try{video.pause();video.srcObject=null;}catch{}
 if(role==='NORA')$('NORA-speak').disabled=true;
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
  if(role==='NORA')$('NORA-speak').disabled=false;
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

// Local-only original T logo and authorized empty newsroom; neither is transmitted.
$('brand-file').addEventListener('change',async e=>{
 const file=e.target.files?.[0];if(!file)return;
 if(file.size>25*1024*1024||!['image/png','image/webp'].includes(file.type)){
  report('Logo rejected: transparent PNG or WebP under 25MB required');return;
 }
 try{
  brandBitmap?.close?.();brandBitmap=await createImageBitmap(file);
  report('Tamasha brand source loaded locally. No fake/repeated studio logo is generated.');
 }catch{report('Original logo could not be decoded; capture remains blocked');}
});
$('background-file').addEventListener('change',async e=>{
 const file=e.target.files?.[0];if(!file)return;
 try{
  studioBitmap?.close?.();studioBitmap=await createImageBitmap(file);
  report('Room source decoded for 1080p compositor; source rights/creative approval still required.');
 }catch{studioBitmap=null;report('Room could not be decoded for recording');}
});
function currentSources(){
 const result={};
 for(const role of ROLES){
  const entry=live.get(role),video=$(role+'-video');
  const source=video?.srcObject;
  result[role]={connected:!!entry?.mediaReady,frames:entry?.keyer?.getFrames?.()||0,
    hasVideoTrack:Boolean(source?.getVideoTracks?.().some(t=>t.readyState==='live')),
    canvas:$(role+'-canvas'),stream:source};
 }
 return result;
}
async function startProgramCapture(){
 if(recorder){report('An authorized real video capture is already running');return;}
 const sources=currentSources();
 const seconds=Number($('record-seconds').value);
 const check=validateCaptureInputs({roomReady:!!studioBitmap,logoReady:!!brandBitmap,
  camera:selectedCamera,sources,seconds,marketStatus:'RECORDED_DEMO'});
 if(!check.pass){
  $('record-status').textContent='BLOCKED · '+check.issues.join(' · ');
  report('Real-source capture denied: '+check.issues.join('; '));return;
 }
 $('record-start').disabled=true;$('record-stop').disabled=false;
 $('program-capture-preview').style.display='block';
 try{
  recorder=new ProgramRecorder({canvas:$('program-capture-preview'),room:studioBitmap,
   logo:brandBitmap,sources,status:'RECORDED DEMO',onProgress:report});
  recorder.cameraCut(selectedCamera);
  $('record-status').textContent='CAPTURING VERIFIED MOVING INPUT';
  const result=await recorder.begin(seconds);
  if(result.blob.size<100_000)throw Error('Invalid empty media capture; review required');
  const url=URL.createObjectURL(result.blob);
  const a=document.createElement('a');
  a.href=url;a.download='STOCKS-ACTUAL-LIVEAVATAR-RECORDING-REVIEW.webm';
  document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),15000);
  $('record-status').textContent='SOURCE VIDEO FILE SAVED · REVIEW REQUIRED';
  report('Captured '+result.durationSeconds.toFixed(2)+' sec / '+result.bytes+' bytes. This confirms captured motion only, NOT creative or financial QA.');
 }catch(error){
  $('record-status').textContent='RECORD FAILED — NO APPROVAL';
  report('Capture failed: '+String(error?.message||error));
 }finally{
  recorder?.stop();recorder=null;
  $('record-start').disabled=false;$('record-stop').disabled=true;
 }
}

// Production test: one short licensed synthetic WAV goes to one pre-authorized LiveAvatar LITE session.
// Use browser's own File API and OfflineAudioContext; no speech / image regeneration occurs here.
async function speakNoraOnce(){
 const entry=live.get('NORA');
 if(!entry||entry.closed||!entry.mediaReady||!entry.session){
  report('Nora speaking blocked: no active real moving LiveAvatar LITE video session');return;
 }
 if(entry.oneSpeechSubmitted){
  report('Nora speaking was already submitted in this session; no automatic retry on an unknown provider state');
  return;
 }
 const file=$('NORA-audio-file').files?.[0];
 if(!file){report('Load Nora 20.9s approved voice WAV using the local input first');return;}
 if(!$('NORA-approved').checked||!$('NORA-credit').checked){
  report('Voice send denied: provider eligibility and bounded credit authorizations must be checked');return;
 }
 const button=$('NORA-speak');button.disabled=true;
 try{
  const audio=await prepareLiteAudioFile(file);
  const p=audioProofPolicy({...audio,sourceApproved:true});
  if(!p.pass)throw Error(p.errors.join('; '));
  if(entry.closed||live.get('NORA')!==entry)throw Error('Nora session ended during local audio conversion');
  if(typeof entry.session.repeatAudio!=='function')throw Error('SDK does not expose LITE repeatAudio');
  entry.oneSpeechSubmitted=true;
  entry.session.repeatAudio(audio.pcm24kBinary);
  report('Sent exactly one '+audio.durationSeconds.toFixed(2)+'s synthetic-audio take to Nora. This is NOT proof of audible output or lip sync. Verify real provider speech events and complete a moving video recording. No retry if provider state is unknown.');
 }catch(error){
  report('Nora speech submission failed. Verify provider status and SDK audio protocol before another attempt. '+String(error?.message||error));
 }finally{
  if(!entry.oneSpeechSubmitted && !entry.closed)button.disabled=false;
 }
}
$('NORA-speak').addEventListener('click',()=>void speakNoraOnce());

$('record-start').addEventListener('click',()=>void startProgramCapture());
$('record-stop').addEventListener('click',()=>recorder?.stop());

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
