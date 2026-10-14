/**
 * Local operator-supplied WAV/MP3 -> 24kHz mono signed PCM16 for LiveAvatar LITE.
 * This file has zero network, billing, avatar-generation or playback side effects.
 * The SDK requires the byte string returned in pcm24kBinary.
 *
 * IMPORTANT: Some older LiveAvatar SDK versions had raw-string ↔ base64 wire bugs.
 * Provider-side actual speech/lip events MUST be verified on the selected SDK
 * version; do not claim a successful talking avatar solely from SDK return.
 */
export const LITE_AUDIO = Object.freeze({sampleRate:24000,channels:1,signedBits:16,maxSeconds:35,minSeconds:5});

export function float32ToPcm16Binary(samples){
 if(!(samples instanceof Float32Array)||!samples.length)throw Error('Non-empty mono Float32 audio required');
 let chunks=[];
 const count=8192;
 for(let o=0;o<samples.length;o+=count){
  const chunk=[];
  for(let j=o;j<Math.min(o+count,samples.length);j++){
   const v=Math.max(-1,Math.min(1,samples[j]));
   const signed=v<0?Math.round(v*32768):Math.round(v*32767);
   const unsigned=signed&0xffff;
   chunk.push(String.fromCharCode(unsigned&255,unsigned>>8));
  }
  chunks.push(chunk.join(''));
 }
 return chunks.join('');
}
/**
 * LiveAvatar official LITE events require Base64-encoded 24kHz PCM16.
 * Send 1-second chunks, never a 20-second raw binary string or >1MB packet.
 * SDK repeatAudio accepts the payload string but does not certify speech delivery.
 */
export function pcm16Base64Chunks(pcmBinary,{sampleRate=LITE_AUDIO.sampleRate,secondsPerChunk=1,encode=globalThis.btoa}={}){
 if(typeof pcmBinary!=='string'||pcmBinary.length<2||pcmBinary.length%2)
   throw Error('PCM16 binary string must contain an even, nonzero number of bytes');
 if(sampleRate!==LITE_AUDIO.sampleRate||secondsPerChunk!==1)
   throw Error('Only tested 1-second 24kHz PCM chunks');
 if(typeof encode!=='function')throw Error('Base64 encoder missing');
 const chunkBytes=sampleRate*2*secondsPerChunk;
 const result=[];
 for(let offset=0;offset<pcmBinary.length;offset+=chunkBytes){
  const block=pcmBinary.slice(offset,offset+chunkBytes);
  const payload=encode(block);
  if(payload.length>1024*1024)throw Error('Provider 1MB WebSocket packet limit exceeded');
  result.push(payload);
 }
 return result;
}

export function audioProofPolicy({durationSeconds=0,sampleRate=0,channels=0,byteLength=0,sourceApproved=false}={}){
 const errors=[];
 if(!(durationSeconds>=LITE_AUDIO.minSeconds&&durationSeconds<=LITE_AUDIO.maxSeconds))
  errors.push('Audio must be 5–35 seconds, not a silent or multi-hour clip');
 if(sampleRate!==LITE_AUDIO.sampleRate||channels!==LITE_AUDIO.channels)
  errors.push('LiveAvatar LITE needs mono 24kHz PCM');
 if(!Number.isInteger(byteLength)||Math.abs(byteLength-durationSeconds*sampleRate*2)>4)
  errors.push('PCM16 length inconsistent with audio duration');
 if(!sourceApproved)errors.push('Synthetic Nora speech source not approved');
 return {pass:errors.length===0,errors};
}
export async function prepareLiteAudioFile(file,{AudioContextImpl,OfflineAudioContextImpl}={}){
 if(!file||!Number.isFinite(file.size)||file.size<1000||file.size>10*1024*1024)
  throw Error('Expected a short local WAV/MP3 file smaller than 10MB');
 if(!/^audio\/|\.wav$|\.mp3$/i.test(file.type||file.name||''))throw Error('Audio/WAV only');
 const AudioCtor=AudioContextImpl||globalThis.AudioContext||globalThis.webkitAudioContext;
 const OfflineCtor=OfflineAudioContextImpl||globalThis.OfflineAudioContext||globalThis.webkitOfflineAudioContext;
 if(!AudioCtor||!OfflineCtor)throw Error('Browser audio decode/resampling unavailable');
 const context=new AudioCtor();
 let decoded;
 try{decoded=await context.decodeAudioData((await file.arrayBuffer()).slice(0));}
 finally{await context.close();}
 if(!decoded||!Number.isFinite(decoded.duration)||decoded.duration<LITE_AUDIO.minSeconds
    ||decoded.duration>LITE_AUDIO.maxSeconds)
  throw Error('Audio duration outside bounded 5–35 second test');
 const frames=Math.ceil(decoded.duration*LITE_AUDIO.sampleRate);
 const offline=new OfflineCtor(LITE_AUDIO.channels,frames,LITE_AUDIO.sampleRate);
 const src=offline.createBufferSource();src.buffer=decoded;src.connect(offline.destination);src.start();
 const audio=await offline.startRendering();
 const channel=audio.getChannelData(0);
 const pcm24kBinary=float32ToPcm16Binary(channel);
 return {pcm24kBinary,sampleRate:LITE_AUDIO.sampleRate,channels:1,
  durationSeconds:frames/LITE_AUDIO.sampleRate,byteLength:pcm24kBinary.length,
  fullScriptAudioReady:true,certifiedAvatarLipSync:false};
}
