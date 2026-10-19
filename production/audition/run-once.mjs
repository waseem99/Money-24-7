import {mkdirSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {speechRequests,prepareVideos} from './prepare.mjs';
const dir='audition-output';mkdirSync(dir,{recursive:true});
const key=process.env.HEYGEN_API_KEY;if(!key)throw Error('Missing provider credential');
const ledger=[];function save(){writeFileSync(`${dir}/ledger.json`,JSON.stringify(ledger,null,2));}
async function api(path,body){const r=await fetch('https://api.heygen.com'+path,{method:body?'POST':'GET',headers:{'x-api-key':key,...(body?{'content-type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(90000)});if(!r.ok)throw Error(`Provider HTTP ${r.status} at ${path}`);const j=await r.json();return j.data??j;}
async function download(url,path){if(new URL(url).protocol!=='https:')throw Error('Non HTTPS asset');const r=await fetch(url,{signal:AbortSignal.timeout(90000)});if(!r.ok)throw Error('Asset download failed');const b=Buffer.from(await r.arrayBuffer());writeFileSync(path,b);return createHash('sha256').update(b).digest('hex');}
const records=[];
for(const s of speechRequests()){
 ledger.push({kind:'speech',id:s.id,state:'submitting'});save();
 const a=await api(s.endpoint,s.body);if(!a.audio_url)throw Error('Speech response missing audio');
 const file=`${dir}/${s.id}.mp3`;const hash=await download(a.audio_url,file);
 const seconds=Number(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','default=nw=1:nk=1',file],{encoding:'utf8'}).trim());
 records.push({id:s.id,text:s.body.text,voiceId:s.body.voice_id,assetId:'external-audio',seconds,sha256:hash,url:a.audio_url});
 ledger.at(-1).state='completed';ledger.at(-1).seconds=seconds;save();
 if(seconds>15||records.reduce((n,a)=>n+a.seconds,0)>40)throw Error('Audio duration limit exceeded');
}
const plan=prepareVideos(records,{usdPerMinute:2.31});
for(const r of plan.requests){
 const body={...r.body,audio_url:records.find(a=>a.id===r.id).url};delete body.audio_asset_id;
 ledger.push({kind:'video',id:r.id,state:'submitting',audioSha256:r.audioSha256});save();
 const v=await api(r.endpoint,body);if(!v.video_id)throw Error('Video ID missing; reconcile before retry');
 Object.assign(ledger.at(-1),{state:'submitted',videoId:v.video_id});save();console.log(JSON.stringify({id:r.id,videoId:v.video_id,state:'submitted'}));
}
for(const entry of ledger.filter(x=>x.kind==='video')){
 for(let n=0;n<30;n++){
 const v=await api('/v3/videos/'+entry.videoId);
 if(v.status==='failed'||v.status==='cancelled'){entry.state=v.status;save();throw Error('Render failed; no retry');}
 if(v.status==='completed'){entry.sha256=await download(v.video_url,`${dir}/${entry.id}.mp4`);entry.state='completed';save();console.log(JSON.stringify({id:entry.id,videoId:entry.videoId,state:'completed'}));break;}
 await new Promise(r=>setTimeout(r,10000));
 }
 if(entry.state!=='completed')throw Error('Render pending; recover existing ID without resubmission');
}
writeFileSync(`${dir}/concat.txt`,plan.requests.map(r=>`file '${r.id}.mp4'`).join('\n'));
execFileSync('ffmpeg',['-y','-f','concat','-safe','0','-i',`${dir}/concat.txt`,'-c:v','libx264','-preset','fast','-crf','18','-c:a','aac','-movflags','+faststart',`${dir}/stocks-identity-audition.mp4`],{stdio:'ignore'});
console.log('AUDITION_COMPLETED');
