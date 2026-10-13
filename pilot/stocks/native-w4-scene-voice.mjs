// Stocks W4: test true scene-anchored reference-to-video with original exact female narration.
// This endpoint is model_videos, NOT green-screen talking photos.
import {createHash} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import {readFile} from 'node:fs/promises';
const env=process.env,key=env.HEYGEN_API_KEY,token=env.GH_TOKEN;
const sourceId='47a1fe8aad834decb010a30c9e4cf56d';
const data=JSON.parse(await readFile('pilot/stocks/voice-150-20261013.json','utf8'));
const voice=data.segments.find(x=>x.id==='03');
const report={phase:'W4 native reference-to-video dialogue QA',source:'W3 coherent two-person studio',sourceId,
  voicedLine:'03',durationRequested:7,model:'heygen-video-1',generatedPosts:0,videoId:null,outputCostUSD:null};
const save=()=>writeFileSync('stocks-w4-audit.json',JSON.stringify(report,null,2));
const wait=t=>new Promise(done=>setTimeout(done,t));
try{
 if(!key||!token||!env.GITHUB_REPOSITORY||!env.GITHUB_SHA)throw Error('Missing authorized direct API credential');
 if(voice?.role!=='NORA'||voice?.providerDuration>7||!voice.url)throw Error('Audio source not verified for W4');
 const a=await fetch('https://api.heygen.com/v3/users/me',{headers:{'x-api-key':key},signal:AbortSignal.timeout(18000)});
 const ap=await a.json().catch(()=>({}));const account=ap.data??ap;const balance=Number(account.wallet?.remaining_balance);
 if(!a.ok||!Number.isFinite(balance)||balance<5)throw Error('Direct API balance unavailable or below $5');
 report.beforeBalanceUSD=balance;
 const v=await fetch('https://api.heygen.com/v3/videos/'+sourceId,{headers:{'x-api-key':key},signal:AbortSignal.timeout(18000)});
 const raw=await v.json().catch(()=>({}));const source=raw.data??raw;
 if(!v.ok||source.status!=='completed'||!source.video_url)throw Error('Single-scene film reference not completed');
 const p={
  model:'heygen-video-1',mode:'reference_to_video',
  duration:7,resolution:'768p',aspect_ratio:'16:9',seed:418073,
  prompt:`A professional photorealistic financial NEWS broadcast shot from <Video 1>. Preserve EXACT same fictional presenters and physical newsroom, blue and warm studio lighting, glass desk, natural body seated positions, face identity, realistic hands and camera perspective of <Video 1>. The FEMALE anchor on camera LEFT speaks into camera the EXACT seven-second line from <Audio 1> without paraphrasing or adding dialogue: "${voice.script}". Her mouth follows <Audio 1> precisely. Male anchor on camera RIGHT listens quietly and makes only tiny natural blinks. Professional restrained expressions and newsroom tone, no exaggerated gestures, no scenery or wardrobe change, no warping, no extra person, no edited/talking lips on the silent listener. Camera is a subtle closer two-shot focusing on female anchor but retaining the man in the right side at least shoulders, no fake cropping of actors. Film on the same camera plane, realistic studio environment. NO text, logos, lower-thirds, tickers, subtitles, invented data, watermarks or graphic panels. Natural live-action video style. The actual audio is the exact provided <Audio 1>, no added voice, no music.`,
  reference_videos:[{type:'url',url:source.video_url}],
  reference_audio:[{type:'url',url:voice.url}]
 };
 const digest=createHash('sha256').update(JSON.stringify({...p,reference_videos:[sourceId]})).digest('hex');
 const tag='stocks-w4-native-dialogue-'+digest.slice(0,18);report.requestHash=digest;report.oneTimeTag=tag;
 const lock=await fetch('https://api.github.com/repos/'+env.GITHUB_REPOSITORY+'/git/refs',{method:'POST',
   headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','Content-Type':'application/json'},
   body:JSON.stringify({ref:'refs/tags/'+tag,sha:env.GITHUB_SHA}),signal:AbortSignal.timeout(16000)});
 if(lock.status===422){report.state='LOCKED_ALREADY_NO_RETRY';save();process.exit(0)}
 if(!lock.ok)throw Error('No one-time protection for model generation');
 report.state='LOCKED_PREPAID';save();
 const response=await fetch('https://api.heygen.com/v3/models/videos',{method:'POST',
   headers:{'x-api-key':key,'Content-Type':'application/json','Idempotency-Key':tag},
   body:JSON.stringify(p),signal:AbortSignal.timeout(55000)});
 const created=await response.json().catch(()=>({}));const info=created.data??created;
 report.generatedPosts=1;report.http=response.status;report.videoId=info.video_id||null;
 report.providerCode=created.error_code||created.error?.code||null;
 report.providerMessage=String(created.message||created.error?.message||'').slice(0,300);
 if(!response.ok||!report.videoId){report.state='REFUSED_NO_RETRY';save();console.log('STOCKS_W4='+JSON.stringify(report));process.exit(0)}
 report.state='PROCESSING';save();
 let finish=null;
 for(let i=0;i<60;i++){
  await wait(7000);
  const q=await fetch('https://api.heygen.com/v3/models/videos/'+report.videoId,{headers:{'x-api-key':key},signal:AbortSignal.timeout(20000)});
  const rq=await q.json().catch(()=>({}));const body=rq.data??rq;
  report.poll=i+1;report.state=body.status||'unknown';report.generatedDuration=body.duration||null;
  if(['completed','failed','cancelled','error'].includes(report.state)){finish=body;break}
  if(i%6===0)save();
 }
 if(finish?.status==='completed'&&finish.video_url){
  const movie=await fetch(finish.video_url,{signal:AbortSignal.timeout(150000)});
  if(!movie.ok)throw Error('Completed W4 model film URL unavailable');
  const b=new Uint8Array(await movie.arrayBuffer());
  if(b.length<100000||b.length>100000000)throw Error('W4 media length outside range');
  writeFileSync('stocks-w4-anchor-native-voice.mp4',b);
  report.outputBytes=b.length;
  const u=await fetch('https://api.heygen.com/v3/users/me',{headers:{'x-api-key':key},signal:AbortSignal.timeout(18000)});
  const ur=await u.json().catch(()=>({}));const bal=Number((ur.data??ur).wallet?.remaining_balance);
  if(Number.isFinite(bal)){report.afterBalanceUSD=bal;report.estimatedDebitUSD=Math.round(100*(balance-bal))/100}
 } else if(finish?.status==='completed')report.state='COMPLETED_NO_MEDIA';
 else if(!finish)report.state='PROCESSING_TIMEOUT_NO_RETRY';
 save();console.log('STOCKS_W4='+JSON.stringify(report));
}catch(e){report.state=report.state||'BLOCKED';report.error=String(e.message||e).slice(0,270);save();console.log('STOCKS_W4='+JSON.stringify(report))}
