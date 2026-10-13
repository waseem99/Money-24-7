import {createHash} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
const env=process.env,key=env.HEYGEN_API_KEY,token=env.GH_TOKEN;
const root='https://raw.githubusercontent.com/waseem99/Money-24-7/experiment/stocks-native-newsroom-producer-20261013/assets/stocks/reference/';
const audio=JSON.parse(await readFile('pilot/stocks/voice-150-20261013.json','utf8')).segments.find(s=>s.id==='03');
const path='stocks-w5-review.json';
const report={version:'W5',model:'heygen-video-1',mode:'reference_to_video',speaker:'NORA',
  source:'W3 integrated physical newsroom close-up + matching existing 6.478s real narration',outputPlannedSeconds:7,videoPostsMade:0};
const save=()=>writeFile(path,JSON.stringify(report,null,2));
const wait=ms=>new Promise(f=>setTimeout(f,ms));
try{
 if(!key||!token||!env.GITHUB_SHA||!env.GITHUB_REPOSITORY)throw Error('Private API/repository credentials missing');
 const user=await fetch('https://api.heygen.com/v3/users/me',{headers:{'x-api-key':key},signal:AbortSignal.timeout(16000)});
 const ur=await user.json().catch(()=>({}));const bal=Number((ur.data??ur).wallet?.remaining_balance);
 if(!user.ok||!Number.isFinite(bal)||bal<3)throw Error('Direct wallet not readable or below $3');report.walletBefore=bal;
 const refImage=root+'W3-NORA-close.png';
 const img=await fetch(refImage,{method:'GET',signal:AbortSignal.timeout(25000)});
 if(!img.ok||!img.headers.get('content-type')?.includes('image'))throw Error('Public image reference not readable by the model');
 report.inputImageBytes=Number(img.headers.get('content-length')||0);
 const tts=await fetch(audio.url,{method:'GET',signal:AbortSignal.timeout(25000)});
 if(!tts.ok)throw Error('Existing TTS reference audio unavailable');report.inputAudioBytes=Number(tts.headers.get('content-length')||0);
 const payload={model:'heygen-video-1',mode:'reference_to_video',duration:7,resolution:'768p',aspect_ratio:'16:9',seed:198300,
   prompt:`Image <Picture 1> is the EXACT anchor and background identity. A single professional fictional female anchor (same face, hairstyle, blazer) speaks the exact already-recorded seven-second line in <Audio 1>: "${audio.script}" with her mouth closely aligned to <Audio 1>; use its voice unchanged, no new speech. Keep the original entire photographic newsroom background and studio lighting from <Picture 1> unchanged. Camera absolutely locked at the same eye level and crop. Restrained broadcast expressions: subtle blinks and head movements, no smile, no hand gestures, no wide mouth or exaggerated brow. Same stable face and natural anatomical proportions through all frames, no ghosting, no morph, no extra people, no watermarks, no tickers, no added lettering, no glass panel overlays. Professional TV anchor speaking confidently, natural speed. The only audio should be the reference <Audio 1>; no music or additional narration.`,
   reference_images:[{type:'url',url:refImage}],reference_audio:[{type:'url',url:audio.url}]};
 const hash=createHash('sha256').update(JSON.stringify({...payload,reference_audio:[{type:'url',url:audio.url}]})).digest('hex');
 const tag='stocks-w5-native-03-'+hash.slice(0,18);report.oneShotHash=hash;report.tag=tag;
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
 if(!x.ok||!report.videoId){report.status='REQUEST_REFUSED_NO_RETRY';await save();console.log('STOCKS_W5='+JSON.stringify(report));process.exit(0)}
 report.status='QUEUED';await save();
 let ready=null;
 for(let i=0;i<90;i++){
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
  await writeFile('stocks-w5-Nora-spoken-768p.mp4',b);report.byteLength=b.length;
  const u=await fetch('https://api.heygen.com/v3/users/me',{headers:{'x-api-key':key},signal:AbortSignal.timeout(16000)});
  const raw=await u.json().catch(()=>({}));const left=Number((raw.data??raw).wallet?.remaining_balance);
  if(Number.isFinite(left)){report.walletAfter=left;report.walletDebit=Math.round((bal-left)*100)/100}
 }else if(!ready){report.status='TIMEOUT_NO_RETRY'}
 else if(ready.status==='completed'){report.status='NO_OUTPUT_URL'}
 await save();console.log('STOCKS_W5='+JSON.stringify(report));
}catch(e){report.status=report.status||'BLOCKED';report.error=String(e.message||e).slice(0,240);await save();console.log('STOCKS_W5='+JSON.stringify(report))}
