import {createHash} from 'node:crypto';
import {writeFileSync} from 'node:fs';
const key=process.env.HEYGEN_API_KEY,token=process.env.GH_TOKEN;
const report={phase:'ai-generated fictitious characters for native Stocks cinematic shot',characters:[],paidPosts:0,cinematicVideoId:null};
const save=()=>writeFileSync('stocks-fictional-character-native-result.json',JSON.stringify(report,null,2));
try{
 if(!key||!token)throw Error('No private direct API credentials');
 const characters=[
 {role:'NORA',name:'Stocks Nora Fictional TV News Anchor V1',
 prompt:'Entirely fictional adult female American broadcast journalist in her late thirties. Photorealistic human facial features, believable natural eyelids and forehead, shoulder-length softly styled brown hair, calm serious attentive newsroom expression, warm brown eyes, understated makeup. Tailored navy-gray business blazer and white blouse, discreet lapel microphone. Camera at eye level, medium chest-up studio portrait. Natural anatomical body, hands relaxed out of view. Premium soft professional broadcast key lighting, restrained studio pose with a slightly blurred dark blue financial TV newsroom as background. No text, no logo, no watermark, no props. Not resembling any famous or real person.'},
 {role:'MARCUS',name:'Stocks Marcus Fictional TV News Analyst V1',
 prompt:'Entirely fictional adult male American financial-news television analyst in his early forties. Photorealistic original face with realistic calm restrained expression, neatly combed medium brown hair, subtle natural skin detail, realistic eyes, understated newsroom presence. Tailored charcoal navy suit jacket, white shirt and subtle blue tie, discreet lapel microphone. Camera at eye level, medium chest-up studio portrait. Correct human anatomy, hands relaxed out of view. Professionally balanced key and edge lighting, softly defocused dark blue financial television newsroom behind. No text, logo, watermark, props. Original person, not resembling any famous or real person.'}
 ];
 const lookup=async(id)=>{
  for(let i=0;i<22;i++){
   const x=await fetch('https://api.heygen.com/v3/avatars/looks/'+id,{headers:{'x-api-key':key},signal:AbortSignal.timeout(17000)});
   const raw=await x.json().catch(()=>({}));
   const d=raw.data??raw;
   if(x.ok&&d?.status==='completed')return d;
   if(d?.status==='failed'||(x.status!==404&&!x.ok))return {id,status:'failed',http:x.status};
   await new Promise(resolve=>setTimeout(resolve,7000));
  }
  return {id,status:'processing_timeout'};
 };
 for(const z of characters) {
  const body={type:'prompt',name:z.name,prompt:z.prompt,aspect_ratio:'16:9'};
  const hash=createHash('sha256').update(JSON.stringify(body)).digest('hex');
  const tag='stocks-fictional-'+z.role.toLowerCase()+'-'+hash.slice(0,19);
  const lock=await fetch('https://api.github.com/repos/'+process.env.GITHUB_REPOSITORY+'/git/refs',{
   method:'POST',headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','Content-Type':'application/json'},
   body:JSON.stringify({ref:'refs/tags/'+tag,sha:process.env.GITHUB_SHA}),signal:AbortSignal.timeout(15000)});
  if(lock.status===422){report.characters.push({role:z.role,status:'ALREADY_LOCKED',tag});save();throw Error('Previous character POST locked; no duplicate')}
  if(!lock.ok)throw Error('Cannot protect '+z.role+' against duplicate POST');
  report.characters.push({role:z.role,status:'LOCKED_BEFORE_POST',tag});
  save();
  const a=await fetch('https://api.heygen.com/v3/avatars',{
    method:'POST',headers:{'x-api-key':key,'Content-Type':'application/json'},
    body:JSON.stringify(body),signal:AbortSignal.timeout(45000)});
  const rr=await a.json().catch(()=>({}));
  const d=rr.data??rr;
  const item=d.avatar_item||d.avatar||d;
  const entry=report.characters.at(-1);
  report.paidPosts+=1;entry.http=a.status;entry.lookId=item.id||d.id||null;entry.groupId=(d.avatar_group?.id)||item.avatar_group_id||null;
  entry.providerCode=rr.error_code||rr.error?.code||null;entry.providerReason=String(rr.message||rr.error?.message||'').slice(0,180);
  entry.status=a.ok&&entry.lookId?'CREATED':'PROVIDER_REJECTED_NO_RETRY';
  save();
  if(entry.status!=='CREATED')throw Error('Prompt fictional avatar generation failed for '+z.role);
  const look=await lookup(entry.lookId);
  entry.status=look.status;entry.type=look.avatar_type||null;
  save();
  if(look.status!=='completed')throw Error('Created '+z.role+' not yet ready');
 }
 report.status='TWO_GENERATED_CHARACTERS_READY';
 const looks=report.characters.map(z=>z.lookId);
 const videoBody={
  type:'cinematic_avatar',
  prompt:'A 5-second physically coherent cinematic financial television newsroom wide shot with TWO realistic news presenters at ONE real glass news desk: a professionally dressed fictional female journalist on the left and a male in navy suit on the right. BOTH characters are naturally seated with matching chairs, body proportions and desk contact. Serious believable facial expressions, restrained blink and subtle breathing, slight mutual acknowledgement, no talking. Camera fixed at eye level, premium blue/amber lighting, blurred Manhattan skyline and subtle trading floor monitors behind. Absolutely no fake floating torso, no green screen, no pasted layers, no text, no logos, no overlaid charts, no subtitles, no moving camera.',
  avatar_id:looks,aspect_ratio:'16:9',resolution:'720p',duration:5,title:'Stocks native scene W2 AI characters with integrated desk'
 };
 const hash=createHash('sha256').update(JSON.stringify(videoBody)).digest('hex');
 const tag='stocks-native-film-w2-'+hash.slice(0,19);
 const lock=await fetch('https://api.github.com/repos/'+process.env.GITHUB_REPOSITORY+'/git/refs',{
   method:'POST',headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','Content-Type':'application/json'},
   body:JSON.stringify({ref:'refs/tags/'+tag,sha:process.env.GITHUB_SHA}),signal:AbortSignal.timeout(17000)});
 if(lock.status===422)throw Error('Native video already locked, refusing duplicate request');
 if(!lock.ok)throw Error('Cannot lock native video attempt');
 report.nativeVideoLock=tag;save();
 const out=await fetch('https://api.heygen.com/v3/videos',{method:'POST',headers:{'x-api-key':key,'Content-Type':'application/json'},body:JSON.stringify(videoBody),signal:AbortSignal.timeout(55000)});
 const raw=await out.json().catch(()=>({}));
 const d=raw.data??raw;
 report.paidPosts+=1;report.cinematicHttp=out.status;report.cinematicVideoId=d.video_id||null;
 report.cinematicCode=raw.error_code||raw.error?.code||null;
 report.cinematicReason=String(raw.message||raw.error?.message||'').slice(0,200);
 report.status=out.ok&&report.cinematicVideoId?'CINEMATIC_SUBMITTED':'CINEMATIC_REFUSED_NO_RETRY';save();
 if(report.status==='CINEMATIC_SUBMITTED'){
  for(let n=0;n<65;n++){
   await new Promise(done=>setTimeout(done,9000));
   const q=await fetch('https://api.heygen.com/v3/videos/'+report.cinematicVideoId,{headers:{'x-api-key':key},signal:AbortSignal.timeout(20000)});
   const data=await q.json().catch(()=>({}));const v=data.data??data;
   report.videoStatus=v.status;report.videoDuration=v.duration||null;
   if(v.status==='completed'&&v.video_url){
    const f=await fetch(v.video_url,{signal:AbortSignal.timeout(120000)});
    if(f.ok){const b=new Uint8Array(await f.arrayBuffer());if(b.length>100000&&b.length<200000000){writeFileSync('stocks-native-film-W2.mp4',b);report.videoBytes=b.length}}
    break;
   }
   if(['failed','cancelled','error'].includes(v.status))break;
   save();
  }
  save();
 }
 console.log('STOCKS_NATIVE_W2_RESULT='+JSON.stringify(report));
}catch(e){report.error=String(e.message||e).slice(0,200);save();console.log('STOCKS_NATIVE_W2_RESULT='+JSON.stringify(report))}
