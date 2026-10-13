import {createHash} from 'node:crypto';
import {writeFileSync} from 'node:fs';
const key=process.env.HEYGEN_API_KEY,ghtoken=process.env.GH_TOKEN;
const report={name:'Stocks-native-full-scene-cinematic-test',requestedSeconds:5,paidVideoRequests:0,videoId:null};
const save=()=>writeFileSync('stocks-cinematic-report.json',JSON.stringify(report,null,2));
try {
 if(!key||!ghtoken)throw Error('Missing private credentials');
 const prompt='Broadcast-grade 5-second silent establishing shot inside a PHOTOREALIST financial TV newsroom. Realistically seated adult female business news anchor in a charcoal formal blazer on camera left, adult male anchor in navy suit on camera right. They sit NATURALLY in two clearly visible chairs behind the SAME curved glass anchor desk, arms and hands properly contacting tabletop, waist physically behind the desk, comfortable body separation. One continuous physically consistent room, no compositing of separate characters or floating body parts. Dusk city skyline and softly blurred real-looking trading-floor monitors behind the desk. Restrained professional facial expressions, natural blink and breathing, heads stay proportionate. Fixed eye-level wide broadcast camera, professionally balanced key lights, extremely subtle movement, realistic studio depth-of-field. NO speaking, NO broadcast text, NO logos, NO watermark, NO captions, NO chart labels, NO graphics over the people.';
 const body={type:'cinematic_avatar',prompt,avatar_id:['Caroline_Business_Sitting_Front_public','Brandon_Business_Sitting_Front_public'],aspect_ratio:'16:9',resolution:'720p',duration:5,title:'Stocks physically-integrated newsroom establishing proof W1'};
 const digest=createHash('sha256').update(JSON.stringify(body)).digest('hex');
 report.payloadHash=digest;
 const tag='stocks-cinematic-native-w1-'+digest.slice(0,20);
 report.tag=tag;
 const gr=await fetch('https://api.github.com/repos/'+process.env.GITHUB_REPOSITORY+'/git/refs',{
  method:'POST',headers:{Authorization:'Bearer '+ghtoken,Accept:'application/vnd.github+json','Content-Type':'application/json'},
  body:JSON.stringify({ref:'refs/tags/'+tag,sha:process.env.GITHUB_SHA}),signal:AbortSignal.timeout(16000)
 });
 if(gr.status===422){report.status='PREVIOUSLY_SUBMITTED_DO_NOT_DUPLICATE';save();process.exit(0)}
 if(!gr.ok)throw Error('No one-shot idempotency tag, HTTP '+gr.status);
 report.status='ONE_SHOT_LOCK_ACQUIRED';save();
 const r=await fetch('https://api.heygen.com/v3/videos',{
  method:'POST',headers:{'x-api-key':key,'Content-Type':'application/json'},
  body:JSON.stringify(body),signal:AbortSignal.timeout(50000)
 });
 const raw=await r.json().catch(()=>({}));
 const p=raw.data??raw;
 report.paidVideoRequests=1;report.http=r.status;
 report.videoId=p.video_id||null;
 report.providerCode=raw.error_code||raw.error?.code||null;
 report.providerMessage=String(raw.message||raw.error?.message||'').slice(0,220);
 if(!r.ok||!report.videoId){report.status='UNSUPPORTED_OR_UNFUNDED_NO_RETRY';save();console.log('NATIVE_STUDIO_RESULT='+JSON.stringify(report));process.exit(0)}
 report.status='SUBMITTED_PROCESSING';save();
 let resolved=null;
 for(let i=0;i<75;i++){
  await new Promise(done=>setTimeout(done,8500));
  const q=await fetch('https://api.heygen.com/v3/videos/'+report.videoId,{headers:{'x-api-key':key},signal:AbortSignal.timeout(25000)});
  const qr=await q.json().catch(()=>({}));
  const v=qr.data??qr;
  report.pollCount=i+1;
  report.status=v.status||'unknown';
  report.duration=v.duration||null;
  if(['completed','failed','error','cancelled'].includes(report.status)){resolved=v;break}
  save();
 }
 if(report.status==='completed'&&resolved?.video_url){
  const mr=await fetch(resolved.video_url,{signal:AbortSignal.timeout(120000)});
  if(!mr.ok)throw Error('Generated native studio returned undownloadable video');
  const buf=new Uint8Array(await mr.arrayBuffer());
  if(buf.length<100000||buf.length>100000000)throw Error('Generated media size abnormal');
  writeFileSync('stocks-cinematic-w1-completed.mp4',buf);
  report.downloadBytes=buf.length;
 } else if(report.status==='completed'){report.status='COMPLETED_MEDIA_URL_UNAVAILABLE'}
 else if(!resolved){report.status='TIMEOUT_NO_RETRY'}
 save();console.log('NATIVE_STUDIO_RESULT='+JSON.stringify(report));
} catch(e){report.status='BLOCKED_OR_UNCERTAIN_NO_RETRY';report.error=String(e.message||e).slice(0,220);save();console.log('NATIVE_STUDIO_RESULT='+JSON.stringify(report))}
