import {mkdir,writeFile,readFile} from 'node:fs/promises';
const out='pilot-runs/behind-move';await mkdir(out,{recursive:true});
const key=process.env.HEYGEN_API_KEY,gh=process.env.GH_TOKEN;
const lock=await fetch('https://api.github.com/repos/'+process.env.GITHUB_REPOSITORY+'/git/refs',{method:'POST',headers:{Authorization:'Bearer '+gh,Accept:'application/vnd.github+json','Content-Type':'application/json'},body:JSON.stringify({ref:'refs/tags/stocks-behind-move-remaining-v1',sha:process.env.GITHUB_SHA})});
if(lock.status===422){console.log('ALREADY SUBMITTED');process.exit(0)}
if(!lock.ok)throw Error('Lock failed');
const lines=JSON.parse(await readFile('network/live-avatar/behind-move-lines.json','utf8')).filter(x=>Number(x.id)>=7);
const receipts=JSON.parse(await readFile(out+'/speech.json','utf8')).filter(x=>x.http===200);
for(const l of lines){
 l.engine='heygen_voice';
 const r=await fetch('https://api.heygen.com/v3/voices/speech',{method:'POST',headers:{'x-api-key':key,'Content-Type':'application/json'},body:JSON.stringify({text:l.text,voice_id:l.voice_id,engine:l.engine,speed:1,language:'en'}),signal:AbortSignal.timeout(90000)});
 const data=await r.json(),d=data.data??data;receipts.push({...l,http:r.status,...d});await writeFile(out+'/speech.json',JSON.stringify(receipts,null,2));
 console.log(JSON.stringify({line:l.id,speaker:l.speaker,http:r.status,duration:d.duration,error:data.error}));
 if(!r.ok||!d.audio_url)throw Error('Generation failed, no retry');
 const a=await fetch(d.audio_url);await writeFile(out+'/'+l.id+'.wav',Buffer.from(await a.arrayBuffer()));
}
