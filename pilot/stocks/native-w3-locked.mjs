// Stocks W3: single guarded native full-scene proof. Do not repeat or silently substitute faces.
import {createHash} from 'node:crypto';
import {writeFileSync} from 'node:fs';
const KEY=process.env.HEYGEN_API_KEY, GITHUB=process.env.GH_TOKEN;
const roleA='0852fdb93d09d8e03143c26179e220f2',roleB='6f83829368a02bd69bf5c03705058d93';
const report={project:'Stocks',stage:'W3 integrated real-newsroom camera test',shots:1,
  durationRequestedSeconds:5,renderRequestsSubmitted:0,currency:'USD',preflight:null,videoId:null,videoStatus:null,renderCostUSD:null};
const save=()=>writeFileSync('stocks-w3-audit.json',JSON.stringify(report,null,2));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
try{
 if(!KEY||!GITHUB||!process.env.GITHUB_REPOSITORY||!process.env.GITHUB_SHA)throw Error('No direct API credentials or repo scope. Do not bill.');
 const profile=await fetch('https://api.heygen.com/v3/users/me',{headers:{'x-api-key':KEY},signal:AbortSignal.timeout(19000)});
 const profileData=await profile.json().catch(()=>({})); const p=profileData.data??profileData;
 const bal=Number(p.wallet?.remaining_balance);
 report.preflight={http:profile.status,billingType:p.billing_type,walletUSD:Number.isFinite(bal)?bal:null};
 if(!profile.ok||!Number.isFinite(bal)||bal<10)throw Error('Preflight requires a readable USD wallet >= $10');
 for(const id of [roleA,roleB]){
   const r=await fetch('https://api.heygen.com/v3/avatars/looks/'+id,{headers:{'x-api-key':KEY},signal:AbortSignal.timeout(16000)});
   const a=await r.json().catch(()=>({}));const look=a.data??a;
   if(!r.ok||look.id!==id||look.status!=='completed'||look.avatar_type!=='photo_avatar')throw Error('AI generated cast did not pass GET-only validation');
 }
 const prompt=`ONE physically integrated premium financial-television NEWSROOM. Single 5-second cinematic wide two-shot, 16:9, eye-level studio camera, no cuts. Use the two supplied ORIGINAL fictional AI-generated character appearances consistently: FEMALE lead presenter on the LEFT and MALE financial analyst on the RIGHT. Both adults physically seated with NATURAL anatomy, correctly positioned in real visibly separated chairs behind a single dark glass curved television anchor desk. Their chests, arms, elbows and hands have correct realistic relative size and actual contact with the desk; do not float or sink into furniture. Professional broadcast suits, polished visual realism, natural micro-expressions, a few blinks, subtle breathing and restrained listener behavior, no exaggerated smiles, talking, clapping or gesturing. Rear wall is a believable softly focused trading floor with New York skyline at evening, cinematic warm keylight and blue accent light, realistic glass reflections. Keep EVERYTHING including actors, chairs, desk, newsroom and camera geometry in this one model-rendered scene, NEVER paste separate presenters onto a desk or use green screen. Clean uncluttered studio. Background TV monitors show very subtle abstract shapes ONLY, no text and no invented market data. No logos, no subtitles, no ticker, no panels, no watermark. Silent anchor-pair establishing shot.`;
 const payload={type:'cinematic_avatar',avatar_id:[roleA,roleB],prompt,aspect_ratio:'16:9',resolution:'720p',duration:5,title:'Stocks W3 AI-native integrated newsroom two shot - one only'};
 const hash=createHash('sha256').update(JSON.stringify(payload)).digest('hex');
 report.payloadHash=hash;const tag='stocks-w3-native-'+hash.slice(0,20);report.oneShotTag=tag;
 const locked=await fetch('https://api.github.com/repos/'+process.env.GITHUB_REPOSITORY+'/git/refs',{
   method:'POST',headers:{Authorization:'Bearer '+GITHUB,Accept:'application/vnd.github+json','Content-Type':'application/json'},
   body:JSON.stringify({ref:'refs/tags/'+tag,sha:process.env.GITHUB_SHA}),signal:AbortSignal.timeout(20000)});
 if(locked.status===422){report.videoStatus='ALREADY_LOCKED_NO_PAID_RETRY';save();console.log('STOCKS_W3='+JSON.stringify(report));process.exit(0)}
 if(!locked.ok)throw Error('Could not acquire immutable idempotency lock: HTTP '+locked.status);
 report.videoStatus='LOCKED_BEFORE_BILLING';save();
 const response=await fetch('https://api.heygen.com/v3/videos',{
   method:'POST',headers:{'x-api-key':KEY,'Content-Type':'application/json'},
   body:JSON.stringify(payload),signal:AbortSignal.timeout(65000)});
 report.renderRequestsSubmitted=1;report.submitHTTP=response.status;
 const raw=await response.json().catch(()=>({}));const data=raw.data??raw;
 report.videoId=data.video_id||null;
 report.errorCode=raw.error_code||raw.error?.code||null;
 report.errorMessage=String(raw.message||raw.error?.message||'').slice(0,260);
 if(!response.ok||!report.videoId){report.videoStatus='PROVIDER_REFUSED_DO_NOT_RETRY';save();console.log('STOCKS_W3='+JSON.stringify(report));process.exit(0)}
 report.videoStatus='SUBMITTED_PROCESSING';save();
 let final=null;
 for(let i=0;i<85;i++){
   await wait(9000);
   const status=await fetch('https://api.heygen.com/v3/videos/'+report.videoId,{headers:{'x-api-key':KEY},signal:AbortSignal.timeout(20000)});
   const body=await status.json().catch(()=>({})); const q=body.data??body;
   report.videoStatus=q.status||'unknown';report.poll=i+1;report.generatedDurationSeconds=q.duration||null;
   if(['completed','failed','cancelled','canceled','error'].includes(report.videoStatus)){final=q;break}
   if(i%4===0)save();
 }
 if(final?.status==='completed'&&final.video_url){
   const res=await fetch(final.video_url,{signal:AbortSignal.timeout(150000)});
   if(!res.ok)throw Error('Cinematic generated but media GET returned HTTP '+res.status);
   const bytes=new Uint8Array(await res.arrayBuffer());
   if(bytes.length<100000||bytes.length>160000000)throw Error('Unreasonable downloaded media length');
   writeFileSync('stocks-w3-native-integrated-newsroom.mp4',bytes);
   report.videoBytes=bytes.length;
   const after=await fetch('https://api.heygen.com/v3/users/me',{headers:{'x-api-key':KEY},signal:AbortSignal.timeout(17000)});
   const postData=await after.json().catch(()=>({}));
   const afterBal=Number((postData.data??postData).wallet?.remaining_balance);
   if(Number.isFinite(afterBal)){report.postWalletUSD=afterBal;report.estimatedWalletDebitUSD=Math.max(0,Math.round((bal-afterBal)*100)/100)}
 } else if(final?.status==='completed')report.videoStatus='MEDIA_URL_MISSING';
 else if(!final)report.videoStatus='PROCESSING_TIMEOUT_NO_RETRY';
 save();console.log('STOCKS_W3='+JSON.stringify(report));
}catch(e){report.videoStatus=report.videoStatus||'BLOCKED';report.error=String(e.message||e).slice(0,250);save();console.log('STOCKS_W3='+JSON.stringify(report))}
