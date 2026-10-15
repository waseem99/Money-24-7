import {mkdir,writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
import {executeDirect} from './direct-setup.mjs';

const sandbox=process.env.STOCKS_CAPTURE_SANDBOX==='true';
const dexter=process.env.STOCKS_CAPTURE_PRESENTER==='Dexter';
const out='pilot-runs/liveavatar-capture';
await mkdir(out,{recursive:true});
const report={presenter:sandbox?'Wayne zero-credit sandbox':dexter?'Dexter Lawyer':'Amina in Blue Suit',kind:'WATERMARKED TECHNICAL DIAGNOSTIC',audioIdentity:'Approved Nora narration reused for lip-sync protocol only; presenter name and voice not approved',sessionRequested:false,sessionStopped:false,passed:false};
const audioUrl='https://resource2.heygen.ai/text_to_speech/71bf0d29eee949f398aaa5204fce059e/080f8e5cb3ae424989242b0efe5205e6/id=798a6ffc-d122-44fb-9cc1-d386a1855a37.wav';
let browser,server,sessionToken;
try{
 const audioResponse=await fetch(audioUrl,{signal:AbortSignal.timeout(20000)});
 if(!audioResponse.ok)throw Error('Approved audio unavailable; no session requested');
 const audio=Buffer.from(await audioResponse.arrayBuffer());
 if(audio.length<1000)throw Error('Approved audio empty');
 server=spawn(process.execPath,['dev.mjs'],{env:{...process.env,STOCKS_BUILD_OPERATOR_LAB:'true'},stdio:'ignore'});
 for(let n=0;n<50;n++){
  try{if((await fetch('http://127.0.0.1:3000/stocks-streaming-lab.html')).ok)break;}catch{}
  if(n===49)throw Error('Local lab did not start');
  await new Promise(r=>setTimeout(r,200));
 }
 browser=await chromium.launch({channel:'chrome',headless:true,args:['--autoplay-policy=no-user-gesture-required','--disable-dev-shm-usage']});
 const page=await browser.newPage();
 await page.addInitScript(()=>{globalThis.__capturePeers=[];const Original=globalThis.RTCPeerConnection;globalThis.RTCPeerConnection=class extends Original{constructor(...args){super(...args);globalThis.__capturePeers.push(this);}};});
 await page.goto('http://127.0.0.1:3000/stocks-streaming-lab.html');
 // Validate browser video decoder and SDK before minting any token.
 report.videoCodecs=await page.evaluate(()=>RTCRtpReceiver.getCapabilities('video').codecs.map(c=>c.mimeType));
 if(!report.videoCodecs.some(c=>c.toLowerCase()==='video/h264'))throw Error('Browser lacks required H264 decoder; no session requested');
 await page.evaluate(async()=>{const m=await import('/stocks-capture-sdk.js');if(!m.LiveAvatarSession)throw Error('SDK unavailable');});
 const balance=await executeDirect({command:'credits'});report.creditsBefore=balance.creditsLeft;
 if(!sandbox&&Number(balance.creditsLeft)<5)throw Error('Credit reserve reached; no further session');
 const minted=await executeDirect({command:sandbox?'sandbox-token':'free-preset-token',avatarId:sandbox?'dd73ea75-1218-4ef3-92ce-606d5f7fbc0a':dexter?'0930fd59-c8ad-434d-ad53-b391a1768720':'bfed3e3e-7d44-4fdb-b2be-ce9a9fd0b9b5',confirmed:true,confirmIncludedCredits:!sandbox});
 sessionToken=minted.token;report.sessionRequested=true;
 const result=await page.evaluate(async({token,audioBase64})=>{
  const {LiveAvatarSession,SessionEvent}=await import('/stocks-capture-sdk.js');
  const {observeLiteSpeechEvents,sendApprovedLiteAudio}=await import('/network/streaming/lite-speech-wire.mjs');
  const {prepareLiteAudioFile}=await import('/network/streaming/lite-audio.mjs');
  const bytes=Uint8Array.from(atob(audioBase64),c=>c.charCodeAt(0));
  const prepared=await prepareLiteAudioFile(new File([bytes],'approved.wav',{type:'audio/wav'}));
  const session=new LiveAvatarSession(token,{apiUrl:location.origin+'/api/liveavatar',voiceChat:false});
  session.room.options.adaptiveStream=false;
  const video=document.createElement('video');video.autoplay=true;video.playsInline=true;video.muted=true;
  video.style.cssText='position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;display:block!important;visibility:visible!important;opacity:1!important;z-index:999999!important';document.body.replaceChildren(video);
  const result={providerConnected:false,frames:0,speechStarted:false,speechEnded:false,providerError:false,audioTracks:0,videoTracks:0,stopped:false};
  let recorder,observer,watchdog;
  const chunks=[];
  const startedAt=Date.now();result.samples=[];
  session.on(SessionEvent.SESSION_DISCONNECTED,()=>{result.disconnectedAfterMs=Date.now()-startedAt;});
  const probe=setInterval(async()=>{const track=session._remoteVideoTrack;let stats=null;try{const all=await track?.receiver?.getStats();if(all)for(const x of all.values())if(x.type==='inbound-rtp')stats={bytes:x.bytesReceived,frames:x.framesDecoded,packets:x.packetsReceived};}catch{}result.samples.push({ms:Date.now()-startedAt,width:video.videoWidth,height:video.videoHeight,paused:video.paused,videoState:track?.mediaStreamTrack?.readyState,stats,kind:track?.mediaStreamTrack?.kind,enabled:track?.mediaStreamTrack?.enabled,muted:track?.isMuted,receiver:Boolean(track?.receiver),peers:await Promise.all(globalThis.__capturePeers.map(async pc=>{const stats=await pc.getStats();const inbound=[];for(const x of stats.values())if(x.type==='inbound-rtp')inbound.push({kind:x.kind,bytes:x.bytesReceived,packets:x.packetsReceived,frames:x.framesDecoded});return{ice:pc.iceConnectionState,inbound};}))});},2000);
  const connectSocket=session.connectWebSocket.bind(session);
  session.connectWebSocket=async url=>{const pending=connectSocket(url);session._sessionEventSocket.addEventListener('message',e=>{try{const m=JSON.parse(e.data);if(m.type==='session.state_updated'&&m.state==='connected')result.providerConnected=true;}catch{}});await pending;};
  const frame=()=>{result.frames++;video.requestVideoFrameCallback(frame);};
  const deadline=(promise,ms)=>Promise.race([promise,new Promise((_,reject)=>setTimeout(()=>reject(Error('Bounded capture timeout')),ms))]);
  const ready=new Promise(resolve=>session.on(SessionEvent.SESSION_STREAM_READY,()=>{session.attach(video);for(const p of session.room.remoteParticipants.values())for(const pub of p.videoTrackPublications.values())pub.setEnabled(true);resolve();}));
  watchdog=setTimeout(()=>{void session.stop();},40000);
  try{
   await deadline(session.start(),18000);
   await deadline(ready,8000);
   // Do not await video playback before first LITE audio: provider may expose a placeholder until speaking.
   video.requestVideoFrameCallback(frame);
   void video.play().catch(()=>{});
   for(let n=0;n<30&&!result.providerConnected;n++)await new Promise(r=>setTimeout(r,100));
   if(!result.providerConnected)throw Error('Provider connected event not observed; audio blocked');
   const stream=video.srcObject;
   result.audioTracks=stream.getAudioTracks().length;result.videoTracks=stream.getVideoTracks().length;
   observer=observeLiteSpeechEvents(session,()=>{});
   const mime=MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')?'video/webm;codecs=vp8,opus':'video/webm';
   recorder=new MediaRecorder(stream,{mimeType:mime});
   recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
   const done=new Promise(resolve=>recorder.onstop=resolve);
   recorder.start(500);
   sendApprovedLiteAudio(session,prepared.pcm24kBinary,{mediaReady:true,frames:result.frames,sourceApproved:true,providerConnectedForBootstrap:result.providerConnected});
   await new Promise(r=>setTimeout(r,24500));
   Object.assign(result,{videoWidth:video.videoWidth,videoHeight:video.videoHeight,videoStats:await session._remoteVideoTrack.getRTCStatsReport().then(stats=>stats?{bytesReceived:stats.bytesReceived,framesDecoded:stats.framesDecoded,framesReceived:stats.framesReceived}:null).catch(()=>null)});
   recorder.stop();await done;
   Object.assign(result,{speechStarted:observer.status.speakStarted,speechEnded:observer.status.speakEnded,providerError:observer.status.providerError});
  }catch(e){result.error=String(e.message);}
  finally{
   observer?.stop();clearTimeout(watchdog);clearInterval(probe);
   if(recorder?.state==='recording'){const done=new Promise(resolve=>recorder.onstop=resolve);recorder.stop();await done;}
   try{const r=await fetch(location.origin+'/api/liveavatar/v1/sessions/stop',{method:'POST',headers:{Authorization:'Bearer '+token}});const body=await r.json();result.stopped=r.ok&&body.code===1000;}catch{}
   try{await session.stop();}catch{}
  }
  const buffer=new Uint8Array(await new Blob(chunks,{type:'video/webm'}).arrayBuffer());
  let binary='';for(let p=0;p<buffer.length;p+=8192)binary+=String.fromCharCode(...buffer.subarray(p,p+8192));
  return {...result,webm:btoa(binary)};
 },{token:sessionToken,audioBase64:audio.toString('base64')});
 await page.screenshot({path:out+'/source-inspection.png'});
 const {webm,...proof}=result;
 if(webm)await writeFile(out+'/source.webm',Buffer.from(webm,'base64'));
 Object.assign(report,proof,{sessionStopped:proof.stopped});
 report.passed=proof.frames>100&&proof.speechStarted&&proof.speechEnded&&!proof.providerError&&proof.audioTracks>0&&proof.stopped;
}catch(e){report.error=String(e.message).replaceAll(sessionToken||'UNUSED_TOKEN','[PRIVATE]');}
finally{
 if(sessionToken&&!report.sessionStopped){
  try{const r=await fetch('https://api.liveavatar.com/v1/sessions/stop',{method:'POST',headers:{Authorization:'Bearer '+sessionToken},signal:AbortSignal.timeout(15000)});const body=await r.json();report.providerStopHttp=r.status;report.sessionStopped=r.ok&&body.code===1000;}catch{}
 }
 await browser?.close();server?.kill();
 report.passed=report.passed&&report.sessionStopped;
 await writeFile(out+'/capture-report.json',JSON.stringify(report,null,2));
 console.log(JSON.stringify(report));
}
if(!report.passed)process.exitCode=1;
