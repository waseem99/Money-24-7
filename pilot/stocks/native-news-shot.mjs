// Reusable one-shot reference-to-video renderer with actual pre-recorded Stocks financial-news narration.
// Does NOT add numbers, alter stage geometry or fabricate an actor by cutout.
import {createHash} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
const env=process.env,key=env.HEYGEN_API_KEY,token=env.GH_TOKEN,id=String(env.STOCKS_SHOT||'');
const valid={05:'MARCUS',09:'MARCUS',14:'NORA',16:'MARCUS',18:'NORA',20:'MARCUS'};
const m=JSON.parse(await readFile('pilot/stocks/voice-150-20261013.json','utf8'));
const line=m.segments.find(x=>x.id===id);
const root='https://raw.githubusercontent.com/waseem99/Money-24-7/experiment/stocks-native-newsroom-producer-20261013/assets/stocks/reference/';
const report={shot:id,model:'heygen-video-1',mode:'reference_to_video',speaker:valid[id]||null,videoId:null,paidPosts:0};
const outReport='stocks-shot-'+id+'.json',outVideo='stocks-shot-'+id+'.mp4';
const save=()=>writeFile(outReport,JSON.stringify(report,null,2));
const wait=x=>new Promise(resolve=>setTimeout(resolve,x));
try{
 if(!valid[id]||line?.role!==valid[id])throw Error('Invalid approved shot/role');
 if(!key||!token||!env.GITHUB_SHA||!env.GITHUB_REPOSITORY)throw Error('No private direct API credentials');
 if(!line.url||!line.script||line.providerDuration>12)throw Error('Original sourced news narration missing');
 const who=valid[id];
 const duration=Math.max(5,Math.min(15,Math.ceil(line.providerDuration+.5)));
 report.requestedSeconds=duration;report.actualSourceAudioSeconds=line.providerDuration;
 const imageUrl=root+'W3-'+who+'-close.png';
 const p=await fetch(imageUrl,{method:'GET',signal:AbortSignal.timeout(21000)});
 if(!p.ok||!p.headers.get('content-type')?.includes('image'))throw Error('Frozen newsroom camera not publicly readable');
 const a=await fetch(line.url,{method:'GET',signal:AbortSignal.timeout(21000)});
 if(!a.ok)throw Error('Exact generated financial-news narration not readable');
 const wallet=await fetch('https://api.heygen.com/v3/users/me',{headers:{'x-api-key':key},signal:AbortSignal.timeout(16000)});
 const wbody=await wallet.json().catch(()=>({}));const money=Number((wbody.data??wbody).wallet?.remaining_balance);
 report.walletBefore=money;
 if(!wallet.ok||!Number.isFinite(money)||money<2.5)throw Error('Direct API wallet inaccessible or below safe minimum');
 const roleName=who==='NORA'?'female lead financial-news anchor':'male finance-news analyst';
 const isSignoff=id==='20';
 const prompt=`Preserve <Picture 1> EXACTLY as the first frame: identical fictional ${roleName}, identical hair, facial proportions, clothing, newsroom skyline and TV lighting. Photoreal financial television broadcast, eye-level fixed medium close-up; one speaker only. This precise person speaks the EXACT recorded line from <Audio 1>, no extra words, no substitutions: "${line.script}". Synchronize all facial speech movement to the PROVIDED original <Audio 1> including pauses. Mouth natural and small, expression restrained, no exaggerated smile or big facial changes. Subtle human blinks, micro head movements and professional calm financial-news delivery. Hands and torso remain consistent; no waves, no impossible gestures, no extra fingers, no camera jitter. The studio remains photographically identical to <Picture 1> in all frames, no other people crossing behind, no logo or text, no ticker, no caption, no charts over the face. No cutout, no compositing overlay, no cartoon, no face swap. ${isSignoff?'Subtle confident concluding tone and soft head nod.':'Smooth serious analytical broadcast expression.'} The only speech/audio should be the provided original <Audio 1>; no extra sound effects or music.`;
 const seed=251000+Number(id)*351;
 const payload={model:'heygen-video-1',mode:'reference_to_video',prompt,duration,resolution:'768p',aspect_ratio:'16:9',seed,
  reference_images:[{type:'url',url:imageUrl}],reference_audio:[{type:'url',url:line.url}]};
 const hash=createHash('sha256').update(JSON.stringify(payload)).digest('hex');
 const tag='stocks-native-shot-'+id+'-'+hash.slice(0,18);report.lockTag=tag;report.hash=hash;
 const lock=await fetch('https://api.github.com/repos/'+env.GITHUB_REPOSITORY+'/git/refs',{method:'POST',
  headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','Content-Type':'application/json'},
  body:JSON.stringify({ref:'refs/tags/'+tag,sha:env.GITHUB_SHA}),signal:AbortSignal.timeout(18000)});
 if(lock.status===422){report.status='ALREADY_LOCKED_NO_PAID_REPEAT';await save();console.log('STOCKS_SHOT='+JSON.stringify(report));process.exit(0)}
 if(!lock.ok)throw Error('Failed to acquire unique shot submission lock');
 report.status='LOCKED_BEFORE_PAID_POST';await save();
 const res=await fetch('https://api.heygen.com/v3/models/videos',{method:'POST',
  headers:{'x-api-key':key,'Content-Type':'application/json','Idempotency-Key':tag},
  body:JSON.stringify(payload),signal:AbortSignal.timeout(50000)});
 const made=await res.json().catch(()=>({}));const v=made.data??made;
 report.paidPosts=1;report.http=res.status;report.videoId=v.video_id||null;
 report.errorCode=made.error_code||made.error?.code||null;
 report.errorMessage=String(made.message||made.error?.message||'').slice(0,250);
 if(!res.ok||!report.videoId){report.status='PROVIDER_REJECTED_NO_RETRY';await save();console.log('STOCKS_SHOT='+JSON.stringify(report));process.exit(0)}
 report.status='PROCESSING';await save();
 let final=null;
 for(let i=0;i<95;i++){
  await wait(5500);
  const q=await fetch('https://api.heygen.com/v3/models/videos/'+report.videoId,{headers:{'x-api-key':key},signal:AbortSignal.timeout(18000)});
  const raw=await q.json().catch(()=>({}));const t=raw.data??raw;
  report.status=t.status||'unknown';report.poll=i+1;report.actualDuration=t.duration||null;
  if(['completed','failed','cancelled'].includes(report.status)){final=t;break}
  if(i%8===0)await save();
 }
 if(final?.status==='completed'&&final.video_url){
  const media=await fetch(final.video_url,{signal:AbortSignal.timeout(110000)});
  if(!media.ok)throw Error('Completed shot inaccessible');
  const b=new Uint8Array(await media.arrayBuffer());
  if(b.length<45000||b.length>125000000)throw Error('Shot source size invalid');
  await writeFile(outVideo,b);report.outputBytes=b.length;
  const after=await fetch('https://api.heygen.com/v3/users/me',{headers:{'x-api-key':key},signal:AbortSignal.timeout(18000)});
  const response=await after.json().catch(()=>({}));const remaining=Number((response.data??response).wallet?.remaining_balance);
  if(Number.isFinite(remaining)){report.walletAfter=remaining;report.estimatedDebitUSD=Math.round((money-remaining)*100)/100}
 } else if(!final)report.status='TIMEOUT_NO_RETRY';
 else if(final.status==='completed')report.status='OUTPUT_URL_MISSING';
 await save();console.log('STOCKS_SHOT='+JSON.stringify(report));
}catch(e){report.status=report.status||'BLOCKED';report.error=String(e.message||e).slice(0,240);await save();console.log('STOCKS_SHOT='+JSON.stringify(report))}
