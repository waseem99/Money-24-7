import {createHash} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
const env=process.env,key=env.HEYGEN_API_KEY,token=env.GH_TOKEN;
const root='https://raw.githubusercontent.com/waseem99/Money-24-7/experiment/stocks-native-newsroom-producer-20261013/assets/stocks/reference/';
const id=process.env.STOCKS_SHOT; const allowed={'05':'MARCUS','09':'MARCUS','14':'NORA','16':'MARCUS','18':'NORA','20':'MARCUS'};
const audio=JSON.parse(await readFile('pilot/stocks/voice-150-20261013.json','utf8')).segments.find(s=>s.id===id);
if(!allowed[id]||!audio||audio.role!==allowed[id])throw Error('Unapproved shot or incorrect cast pairing');
const duration=Math.max(5,Math.min(12,Math.ceil(audio.providerDuration+0.5)));
const path='stocks-w6-'+id+'-review.json';
const report={version:'W6',shot:id,model:'heygen-video-1',mode:'reference_to_video',speaker:allowed[id],
  source:'W3 physically integrated original financial newsroom close-up',outputPlannedSeconds:duration,videoPostsMade:0};
const save=()=>writeFile(path,JSON.stringify(report,null,2));
const wait=ms=>new Promise(f=>setTimeout(f,ms));
try{
 if(!key||!token||!env.GITHUB_SHA||!env.GITHUB_REPOSITORY)throw Error('Private API/repository credentials missing');
 const user=await fetch('https://api.heygen.com/v3/users/me',{headers:{'x-api-key':key},signal:AbortSignal.timeout(16000)});
 const ur=await user.json().catch(()=>({}));const bal=Number((ur.data??ur).wallet?.remaining_balance);
 if(!user.ok||!Number.isFinite(bal)||bal<2)throw Error('Direct wallet not readable or below $3');report.walletBefore=bal;
 const refImage=root+(allowed[id]==='NORA'?'W3-NORA-close.png':'W3-MARCUS-close.png');
 const img=await fetch(refImage,{method:'GET',signal:AbortSignal.timeout(25000)});
 if(!img.ok||!img.headers.get('content-type')?.includes('image'))throw Error('Public image reference not readable by the model');
 report.inputImageBytes=Number(img.headers.get('content-length')||0);
 const tts=await fetch(audio.url,{method:'GET',signal:AbortSignal.timeout(25000)});
 if(!tts.ok)throw Error('Existing TTS reference audio unavailable');report.inputAudioBytes=Number(tts.headers.get('content-length')||0);
 const payload={model:'heygen-video-1',mode:'reference_to_video',duration,resolution:'768p',aspect_ratio:'16:9',seed:198300+Number(id)*17,
   prompt:'Image <Picture 1> is the EXACT fictional '+(allowed[id]==='NORA'?'female lead anchor':'male news analyst')+' and newsroom identity. The ONLY spoken line is the previously recorded dialogue from <Audio 1>, word-for-word: '+JSON.stringify(audio.script)+'. Animate natural breathing and restrained professional television delivery with lips precisely synchronized to <Audio 1>; preserve the ORIGINAL actor face, haircut, fitted business outfit, realistic eyes, correct body anatomy, and every architectural studio detail in <Picture 1>. Camera remains anchored eye-level, medium close-up, professional broadcast key lighting and blue news studio behind. Minimal believable head motion and blinks, no broad gestures, no big smiles or exaggerated brows, no face drift or morphology errors. This is a fully integrated studio-camera video, not a green-screen cutout. Do not generate new music, dialogue, tickers, watermarks, subtitles, logos, invented facts, charts or text.',
   reference_images:[{type:'url',url:refImage}],reference_audio:[{type:'url',url:audio.url}]};
 const hash=createHash('sha256').update(JSON.stringify({...payload,reference_audio:[{type:'url',url:audio.url}]})).digest('hex');
 const tag='stocks-w6-'+id+'-'+hash.slice(0,18);report.oneShotHash=hash;report.tag=tag;
 const l=await fetch('https://api.github.com/repos/'+env.GITHUB_REPOSITORY+'/git/refs',{method:'POST',
  headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','Content-Type':'application/json'},
  body:JSON.stringify({ref:'refs/tags/'+tag,sha:env.GITHUB_SHA}),signal:AbortSignal.timeout(16000)});
 if(l.status===422){report.status='ALREADY_LOCKED_NO_RETRY';await save();process.exit(0)}
 if(!l.ok)throw Error('Immutable anti-duplicate tag unavailable');
 report.status='LOCKED_PREPAID';await save();
 const x=await fetch('https://api.heygen.com/v3/models/videos',{method:'POST',
  headers:{'x-api-key':key,'Content-Type':'application/json','Idempotency-Key':tag},
  body:JSON.stringify(payload),signal:AbortSignal.timeout(45000)});
 const obj=await x.json().catch(()=>({}));const made=obj.data??obj;
 report.videoPostsMade=1;report.http=x.status;report.videoId=made.video_id||null;
 report.providerErrorCode=obj.error_code||obj.error?.code||null;
 report.providerError=String(obj.message||obj.error?.message||'').slice(0,230);
 if(!x.ok||!report.videoId){report.status='REQUEST_REFUSED_NO_RETRY';await save();console.log('STOCKS_W6='+JSON.stringify(report));process.exit(0)}
 report.status='QUEUED';await save();
 let ready=null;
 for(let i=0;i<105;i++){
  await wait(6000);
  const y=await fetch('https://api.heygen.com/v3/models/videos/'+report.videoId,{headers:{'x-api-key':key},signal:AbortSignal.timeout(20000)});
  const yr=await y.json().catch(()=>({}));const v=yr.data??yr;
  report.status=v.status||'unknown';report.pollCount=i+1;report.duration=v.duration||null;
  if(['completed','failed','cancelled'].includes(report.status)){ready=v;break}
  if(i%7===0)await save();
 }
 if(ready?.status==='completed'&&ready.video_url){
  const resp=await fetch(ready.video_url,{signal:AbortSignal.timeout(90000)});
  if(!resp.ok)throw Error('Provider generated film but download was denied');
  const b=new Uint8Array(await resp.arrayBuffer());
  if(b.length<50000||b.length>150000000)throw Error('Unexpected media length');
  await writeFile('stocks-w6-shot-'+id+'.mp4',b);report.byteLength=b.length;
  const u=await fetch('https://api.heygen.com/v3/users/me',{headers:{'x-api-key':key},signal:AbortSignal.timeout(16000)});
  const raw=await u.json().catch(()=>({}));const left=Number((raw.data??raw).wallet?.remaining_balance);
  if(Number.isFinite(left)){report.walletAfter=left;report.walletDebit=Math.round((bal-left)*100)/100}
 }else if(!ready){report.status='TIMEOUT_NO_RETRY'}
 else if(ready.status==='completed'){report.status='NO_OUTPUT_URL'}
 await save();console.log('STOCKS_W6='+JSON.stringify(report));
}catch(e){report.status=report.status||'BLOCKED';report.error=String(e.message||e).slice(0,240);await save();console.log('STOCKS_W6='+JSON.stringify(report))}
