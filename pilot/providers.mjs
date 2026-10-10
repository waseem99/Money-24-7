import {readFile,writeFile} from 'node:fs/promises';
import {realSetting,validateDirector,validateAlignment} from './contracts.mjs';

export function required(env,name) {if(!realSetting(env[name])) throw new Error(`Configure ${name}; dummy values cannot start provider calls`);return env[name];}
export class Providers {
  constructor(env=process.env,fetcher=fetch) {this.env=env;this.fetch=fetcher;}
  async json(url,options={}) {
    const r=await this.fetch(url,{...options,signal:AbortSignal.timeout(120000)});
    if(!r.ok) throw new Error(`Provider HTTP ${r.status}`); // Never persist provider bodies/credentials.
    return r.json();
  }
  async speech(text,speaker,file) {
    const voice=required(this.env,`ELEVENLABS_${speaker.toUpperCase()}_VOICE_ID`);
    const result=await this.json(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}/with-timestamps?output_format=mp3_44100_128`,{
      method:'POST',headers:{'xi-api-key':required(this.env,'ELEVENLABS_API_KEY'),'Content-Type':'application/json'},
      body:JSON.stringify({text,model_id:required(this.env,'ELEVENLABS_MODEL_ID'),voice_settings:{stability:0.5,similarity_boost:0.75}})
    });
    const alignment=result.alignment || result.normalized_alignment;
    if(!result.audio_base64)throw new Error('Missing voice response');validateAlignment(alignment);
    await writeFile(file,Buffer.from(result.audio_base64,'base64'),{mode:0o600});
    return {alignment,provider:'elevenlabs',voiceId:voice};
  }
  async upload(file) {
    const bytes=await readFile(file); if(bytes.length>32*1024*1024) throw new Error('HeyGen audio exceeds 32 MB');
    const form=new FormData();form.set('file',new Blob([bytes],{type:'audio/mpeg'}),'voice.mp3');
    const r=await this.json('https://api.heygen.com/v3/assets',{method:'POST',headers:{'x-api-key':required(this.env,'HEYGEN_API_KEY')},body:form});
    if(!r.data?.id) throw new Error('Missing uploaded asset ID');return {assetId:r.data.id};
  }
  async avatar(assetId,speaker,callbackId,{alpha=false}={}) {
    const r=await this.json('https://api.heygen.com/v3/videos',{method:'POST',headers:{'x-api-key':required(this.env,'HEYGEN_API_KEY'),'Content-Type':'application/json'},body:JSON.stringify({
      type:'avatar',avatar_id:required(this.env,`HEYGEN_${speaker.toUpperCase()}_AVATAR_ID`),audio_asset_id:assetId,
      aspect_ratio:alpha?'9:16':'16:9',resolution:'1080p',...(alpha?{output_format:'webm',fit:'contain'}:{background:{type:'color',value:'#101c2d'}}),title:`Signal ${callbackId}`,callback_id:callbackId
    })});
    if(!r.data?.video_id) throw new Error('Missing provider video ID');return {videoId:r.data.video_id};
  }
  // HeyGen-native text+voice path: no ElevenLabs, uploaded audio, custom voice, or motion.
  // This is a PAID POST and must only be invoked by a separately gated, one-turn operator run.
  async avatarScript(text,avatarId,voiceId,callbackId,{engine='avatar_iv',aspectRatio='16:9',fit='cover'}={}) {
    if(typeof text!=='string'||!text.trim()||text.length>5000)throw new Error('Valid bounded spoken script required');
    if(!/^[a-zA-Z0-9_-]{8,128}$/.test(avatarId)||!/^[a-zA-Z0-9_-]{8,128}$/.test(voiceId))throw new Error('Exact approved public avatar look and voice required');
    if(!['avatar_iv','avatar_iii'].includes(engine))throw new Error('Direct API paid audition is restricted to published pay-as-you-go Avatar III/IV; Avatar V is not budgeted');
    if(!['16:9','9:16'].includes(aspectRatio)||!['cover','contain'].includes(fit))throw new Error('Unsupported verified audition orientation/fit');
    const payload={type:'avatar',avatar_id:avatarId,script:text,voice_id:voiceId,engine:{type:engine},
      aspect_ratio:aspectRatio,resolution:'1080p',fit,
      background:{type:'color',value:'#102944'},output_format:'mp4',
      caption:{file_format:'srt'},title:`Signal native audition ${callbackId}`,callback_id:callbackId};
    const r=await this.json('https://api.heygen.com/v3/videos',{
      method:'POST',headers:{'x-api-key':required(this.env,'HEYGEN_API_KEY'),'Content-Type':'application/json'},
      body:JSON.stringify(payload)
    });
    if(!r.data?.video_id)throw new Error('Missing provider video ID');
    return {videoId:r.data.video_id};
  }
  // Read-only account/asset verification. This must not generate footage or spend credits.
  async avatarLook(lookId) {
    if(!/^[a-zA-Z0-9_-]{8,128}$/.test(lookId))throw new Error('Invalid look ID');
    const r=await this.json(`https://api.heygen.com/v3/avatars/looks/${encodeURIComponent(lookId)}`,{
      headers:{'x-api-key':required(this.env,'HEYGEN_API_KEY')}
    });
    if(!r.data?.id)throw new Error('Look lookup unavailable');return r.data;
  }
  async voiceInfo(voiceId) {
    if(!/^[a-zA-Z0-9_-]{8,128}$/.test(voiceId))throw new Error('Invalid voice ID');
    const r=await this.json(`https://api.heygen.com/v3/voices/${encodeURIComponent(voiceId)}`,{
      headers:{'x-api-key':required(this.env,'HEYGEN_API_KEY')}
    });
    if(!r.data?.voice_id)throw new Error('Voice lookup unavailable');return r.data;
  }
  async status(videoId) {
    const r=await this.json(`https://api.heygen.com/v3/videos/${encodeURIComponent(videoId)}`,{headers:{'x-api-key':required(this.env,'HEYGEN_API_KEY')}});
    if(!r.data?.status) throw new Error('Missing video status');return r.data;
  }
  async download(url,file) {
    // URL comes only from authenticated provider status, never from a public API user.
    const u=new URL(url); if(u.protocol!=='https:' || u.username || u.password) throw new Error('Unsafe provider media URL');
    const r=await this.fetch(url,{signal:AbortSignal.timeout(180000),redirect:'error'});if(!r.ok) throw new Error('Media download failed');
    const chunks=[]; let size=0;
    for await (const chunk of r.body) {size+=chunk.length;if(size>512*1024*1024) throw new Error('Media too large');chunks.push(chunk);}
    await writeFile(file,Buffer.concat(chunks),{mode:0o600});
  }
  async direct(episode) {
    required(this.env,'AI_GATEWAY_API_KEY');const model=required(this.env,'AI_GATEWAY_MODEL');
    const {generateText,Output,jsonSchema}=await import('ai');
    const schema={type:'object',properties:{shots:{type:'array',items:{type:'object',properties:{id:{type:'string'},text:{type:'string'},imagePrompt:{type:'string'}},required:['id','text','imagePrompt'],additionalProperties:false}}},required:['shots'],additionalProperties:false};
    const system=await readFile(new URL('./prompts/director.txt',import.meta.url),'utf8');
    const result=await generateText({model,system,prompt:JSON.stringify(episode),output:Output.object({schema:jsonSchema(schema)}),maxOutputTokens:7000,maxRetries:0,abortSignal:AbortSignal.timeout(120000)});
    return {episode:validateDirector(episode,result.output),model,usage:result.usage,promptVersion:1};
  }
  async illustration(prompt,file) {
    required(this.env,'AI_GATEWAY_API_KEY');const model=required(this.env,'AI_IMAGE_MODEL');
    const {generateImage}=await import('ai');
    const result=await generateImage({model,prompt,aspectRatio:'16:9',n:1,maxRetries:0,abortSignal:AbortSignal.timeout(180000)});
    if(!result.image?.uint8Array)throw new Error('No generated illustration');
    // Normalize actual image bytes regardless of provider's original format.
    const {default:sharp}=await import('sharp');await sharp(result.image.uint8Array).png().toFile(file);
    return {provider:'ai-gateway',model,prompt,synthetic:true};
  }
}
