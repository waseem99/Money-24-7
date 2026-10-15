/**
 * LiveAvatar LITE audio delivery via provider-documented WebSocket events.
 *
 * LiveAvatar Web SDK 0.0.19's repeatAudio may send raw chunk strings rather than
 * documented Base64 over agent.speak. We intentionally DO NOT call repeatAudio.
 * The SDK still owns the same authenticated LITE session/WebRTC video; its
 * existing session WebSocket is used for the official agent.speak protocol.
 *
 * NO session minting, network connection, provider purchase or retries happen
 * here. The caller must supply an already connected, approved live session.
 */
import {pcm16Base64Chunks,LITE_AUDIO} from './lite-audio.mjs';

export function getProviderLiteSocket(session,{requireOpen=true}={}){
  const socket=session?._sessionEventSocket;
  if(!socket||typeof socket.send!=='function'||typeof socket.addEventListener!=='function')
    throw Error('LiveAvatar SDK does not expose an event WebSocket; cannot safely send LITE audio');
  if(requireOpen&&socket.readyState!==1)
    throw Error('LiveAvatar LITE WebSocket is not OPEN; do not spend audio/test credits');
  return socket;
}
export function observeLiteSpeechEvents(session,onEvent=()=>{}){
  const socket=getProviderLiteSocket(session);
  const status={connectedObserved:false,speakStarted:false,speakEnded:false,providerError:false};
  const fn=(event)=>{
    if(typeof event?.data!=='string')return;
    let msg;try{msg=JSON.parse(event.data)}catch{return}
    if(msg.type==='session.state_updated'&&msg.state==='connected')status.connectedObserved=true;
    if(msg.type==='agent.speak_started')status.speakStarted=true;
    if(msg.type==='agent.speak_ended')status.speakEnded=true;
    if(msg.type==='error')status.providerError=true;
    if(['agent.speak_started','agent.speak_ended','session.state_updated','error'].includes(msg.type))
      onEvent({type:msg.type,state:msg.state||null,hasError:msg.type==='error'});
  };
  socket.addEventListener('message',fn);
  return {status,stop:()=>socket.removeEventListener('message',fn)};
}
export function sendApprovedLiteAudio(session,pcmBinary,{
  mediaReady=false,frames=0,sourceApproved=false,providerConnectedForBootstrap=false,
  uuid=()=>globalThis.crypto?.randomUUID?.(),
  encode=globalThis.btoa
}={}){
  const bootstrapReady=providerConnectedForBootstrap===true &&
    session?._remoteVideoTrack?.mediaStreamTrack?.readyState==='live' &&
    session?._remoteAudioTrack?.mediaStreamTrack?.readyState==='live';
  if(!mediaReady||(!bootstrapReady&&frames<10)||sourceApproved!==true)
    throw Error('Require approved TTS and rendered frames or provider-connected live A/V tracks for the first utterance');
  if(typeof pcmBinary!=='string'||!pcmBinary.length||pcmBinary.length%2)
    throw Error('PCM16 audio source is empty or damaged');
  const durationSeconds=pcmBinary.length/(LITE_AUDIO.sampleRate*2);
  if(durationSeconds<LITE_AUDIO.minSeconds||durationSeconds>LITE_AUDIO.maxSeconds)
    throw Error('Audio duration outside 5–35s pilot limit');
  const socket=getProviderLiteSocket(session);
  const eventId=uuid();
  if(typeof eventId!=='string'||!eventId.match(/^[0-9a-f-]{16,64}$/i))
    throw Error('Secure unique event ID unavailable');
  const chunks=pcm16Base64Chunks(pcmBinary,{encode});
  // Pre-build *every* packet before sending the first one. Fail before
  // spending credits if an encoder or schema problem exists.
  const payloads=chunks.map(audio=>JSON.stringify({type:'agent.speak',event_id:eventId,audio}));
  payloads.push(JSON.stringify({type:'agent.speak_end',event_id:eventId}));
  for(const p of payloads){
    if(socket.readyState!==1)throw Error('LITE socket disconnected mid-utterance: no automatic retry');
    socket.send(p);
  }
  return {eventId,packetCount:chunks.length,durationSeconds,
    sourceAudioFormat:'PCM16_MONO_24000_BASE64',
    sentOnce:true,speakingVerified:false};
}
