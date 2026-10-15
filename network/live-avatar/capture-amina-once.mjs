import {mkdir,writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
import {executeDirect} from './direct-setup.mjs';

const out='pilot-runs/liveavatar-amina';
await mkdir(out,{recursive:true});
const report={presenter:'Amina in Blue Suit',kind:'WATERMARKED TECHNICAL DIAGNOSTIC',audioIdentity:'Approved Nora narration; not client-facing Amina identity',sessionRequested:false,sessionStopped:false,passed:false};
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
 browser=await chromium.launch({headless:true,args:['--autoplay-policy=no-user-gesture-required','--disable-dev-shm-usage']});
 const page=await browser.newPage();
 await page.goto('http://127.0.0.1:3000/stocks-streaming-lab.html');
 // Validate browser and SDK before minting any credit-consuming token.
 await page.evaluate(async()=>{const m=await import('/stocks-capture-sdk.js');if(!m.LiveAvatarSession)throw Error('SDK unavailable');});
 const minted=await executeDirect({command:'free-preset-token',avatarId:'bfed3e3e-7d44-4fdb-b2be-ce9a9fd0b9b5',confirmed:true,confirmIncludedCredits:true});
 sessionToken=minted.token;report.sessionRequested=true;
 const result=await page.evaluate(async({token,audioBase64})=>{
  const {LiveAvatarSession,SessionEvent}=await import('/stocks-capture-sdk.js');
  const {observeLiteSpeechEvents,sendApprovedLiteAudio}=await import('/network/streaming/lite-speech-wire.mjs');
  const {prepareLiteAudioFile}=await import('/network/streaming/lite-audio.mjs');
  const bytes=Uint8Array.from(atob(audioBase64),c=>c.charCodeAt(0));
  const prepared=await prepareLiteAudioFile(new File([bytes],'approved.wav',{type:'audio/wav'}));
  const session=new LiveAvatarSession(token,{apiUrl:location.origin+'/api/liveavatar',voiceChat:false});
  const video=document.createElement('video');video.autoplay=true;video.playsInline=true;document.body.append(video);
  const result={frames:0,speechStarted:false,speechEnded:false,providerError:false,audioTracks:0,videoTracks:0,stopped:false};
  let recorder,observer,watchdog;
  const chunks=[];
  const frame=()=>{result.frames++;video.requestVideoFrameCallback(frame);};
  const deadline=(promise,ms)=>Promise.race([promise,new Promise((_,reject)=>setTimeout(()=>reject(Error('Bounded capture timeout')),ms))]);
  const ready=new Promise(resolve=>session.on(SessionEvent.SESSION_STREAM_READY,()=>{session.attach(video);resolve();}));
  watchdog=setTimeout(()=>{void session.stop();},35000);
  try{
   await deadline(session.start(),18000);
   await deadline(ready,8000);
   await video.play();
   video.requestVideoFrameCallback(frame);
   await new Promise(r=>setTimeout(r,1200));
   if(result.frames<10)throw Error('No genuine incoming video frames');
   const stream=video.srcObject;
   result.audioTracks=stream.getAudioTracks().length;result.videoTracks=stream.getVideoTracks().length;
   observer=observeLiteSpeechEvents(session,()=>{});
   const mime=MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')?'video/webm;codecs=vp8,opus':'video/webm';
   recorder=new MediaRecorder(stream,{mimeType:mime});
   recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
   const done=new Promise(resolve=>recorder.onstop=resolve);
   recorder.start(500);
   sendApprovedLiteAudio(session,prepared.pcm24kBinary,{mediaReady:true,frames:result.frames,sourceApproved:true});
   await new Promise(r=>setTimeout(r,24500));
   recorder.stop();await done;
   Object.assign(result,{speechStarted:observer.status.speakStarted,speechEnded:observer.status.speakEnded,providerError:observer.status.providerError});
  }catch(e){result.error=String(e.message);}
  finally{
   observer?.stop();clearTimeout(watchdog);
   if(recorder?.state==='recording'){const done=new Promise(resolve=>recorder.onstop=resolve);recorder.stop();await done;}
   try{await session.stop();result.stopped=true;}catch{}
  }
  const buffer=new Uint8Array(await new Blob(chunks,{type:'video/webm'}).arrayBuffer());
  let binary='';for(let p=0;p<buffer.length;p+=8192)binary+=String.fromCharCode(...buffer.subarray(p,p+8192));
  return {...result,webm:btoa(binary)};
 },{token:sessionToken,audioBase64:audio.toString('base64')});
 const {webm,...proof}=result;
 if(webm)await writeFile(out+'/amina-source.webm',Buffer.from(webm,'base64'));
 Object.assign(report,proof,{sessionStopped:proof.stopped});
 report.passed=proof.frames>100&&proof.speechStarted&&proof.speechEnded&&!proof.providerError&&proof.audioTracks>0&&proof.stopped;
}catch(e){report.error=String(e.message).replaceAll(sessionToken||'UNUSED_TOKEN','[PRIVATE]');}
finally{
 if(sessionToken){
  try{const r=await fetch('https://api.liveavatar.com/v1/sessions/stop',{method:'POST',headers:{Authorization:'Bearer '+sessionToken},signal:AbortSignal.timeout(15000)});const body=await r.json();report.providerStopHttp=r.status;report.sessionStopped=r.ok&&body.code===1000;}catch{}
 }
 await browser?.close();server?.kill();
 report.passed=report.passed&&report.sessionStopped;
 await writeFile(out+'/capture-report.json',JSON.stringify(report,null,2));
 console.log(JSON.stringify(report));
}
if(!report.passed)process.exitCode=1;
