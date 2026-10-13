// AI-native virtual correspondent: exactly one original fictional identity.
// Paid image-generation guarded by an immutable GitHub ref; no real-person likeness or recording.
import {createHash} from 'node:crypto';
import {writeFileSync} from 'node:fs';
const key=process.env.HEYGEN_API_KEY, token=process.env.GH_TOKEN;
const repo=process.env.GITHUB_REPOSITORY, branch=process.env.GITHUB_HEAD_REF;
const out={role:'ALEX',fictional:true,paidPOSTs:0,avatarLookId:null,imageUrl:null,imageRepoPath:null,status:'starting'};
const save=()=>writeFileSync('stocks-remote-avatar-audit.json',JSON.stringify(out,null,2));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
try{
 if(!key||!token||!repo||!branch||!process.env.GITHUB_SHA)throw Error('Scoped credentials missing');
 const prompt="Entirely fictional adult female global-financial-news correspondent, mid thirties, warm medium complexion, long dark wavy hair, natural expressive but restrained facial features with stable realistic eyes, speaking-camera-ready calm professional expression, tailored dark grey business jacket, light neutral blouse, subtle lapel microphone. Photorealistic high-end London global financial correspondent remote-office video camera view, comfortable waist-up/medium shot with office tower architecture and blue-grey screens in soft bokeh behind; clear natural cinematic key lighting, lens perspective straight-on at eye height, professionally controlled framing and realistic anatomy. No signs, no marks, no readable words, no logos, no other people, no cartoon, not resembling any actual public figure.";
 const payload={type:'prompt',name:'Stocks Virtual Correspondent Alex - AI Original v1',prompt,aspect_ratio:'16:9'};
 const digest=createHash('sha256').update(JSON.stringify(payload)).digest('hex');
 const tag='stocks-remote-alex-'+digest.slice(0,20);out.tag=tag;
 const l=await fetch('https://api.github.com/repos/'+repo+'/git/refs',{
  method:'POST',headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','Content-Type':'application/json'},
  body:JSON.stringify({ref:'refs/tags/'+tag,sha:process.env.GITHUB_SHA}),signal:AbortSignal.timeout(16000)});
 if(l.status===422){out.status='ALREADY_LOCKED_NO_DUPLICATE';save();process.exit(0)}
 if(!l.ok)throw Error('Cannot secure one-shot correspondent generation');
 out.status='LOCKED';save();
 const result=await fetch('https://api.heygen.com/v3/avatars',{
  method:'POST',headers:{'x-api-key':key,'Content-Type':'application/json'},
  body:JSON.stringify(payload),signal:AbortSignal.timeout(45000)});
 const created=await result.json().catch(()=>({}));const body=created.data??created;const node=body.avatar_item||body.avatar||body;
 out.paidPOSTs=1;out.http=result.status;out.avatarLookId=node.id||body.id||null;
 out.providerCode=created.error_code||created.error?.code||null;
 if(!result.ok||!out.avatarLookId){out.status='FAILED_DO_NOT_RETRY';save();process.exit(0)}
 for(let i=0;i<36;i++){
  const a=await fetch('https://api.heygen.com/v3/avatars/looks/'+out.avatarLookId,{
   headers:{'x-api-key':key},signal:AbortSignal.timeout(16000)});
  const raw=await a.json().catch(()=>({}));const look=raw.data??raw;
  if(a.ok&&look.status==='completed'&&look.preview_image_url){out.imageUrl=look.preview_image_url;break}
  if(look.status==='failed')break;
  await wait(5000);
 }
 if(!out.imageUrl){out.status='SOURCE_IMAGE_NOT_READY';save();process.exit(0)}
 const photo=await fetch(out.imageUrl,{signal:AbortSignal.timeout(50000)});
 if(!photo.ok)throw Error('Fictional avatar source image not accessible');
 const bytes=new Uint8Array(await photo.arrayBuffer());
 if(bytes.length<20000||bytes.length>8000000)throw Error('Avatar asset unexpected length');
 const target='assets/stocks/reference/W7-ALEX-correspondent.webp';
 const api='https://api.github.com/repos/'+repo+'/contents/'+target;
 const existing=await fetch(api+'?ref='+encodeURIComponent(branch),{headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(15000)});
 if(existing.status===200){out.status='EXISTING_ASSET';out.imageRepoPath=target;save();process.exit(0)}
 if(existing.status!==404)throw Error('Cannot verify new private AI reference name is available');
 const pushed=await fetch(api,{method:'PUT',
  headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','Content-Type':'application/json'},
  body:JSON.stringify({message:'assets(stocks): original virtual correspondent portrait for remote segment',content:Buffer.from(bytes).toString('base64'),branch}),
  signal:AbortSignal.timeout(35000)});
 if(!pushed.ok)throw Error('Cannot persist new AI correspondent reference in own production repository');
 out.status='COMPLETE';out.imageRepoPath=target;
 out.rawImageUrl='https://raw.githubusercontent.com/'+repo+'/'+branch+'/'+target;
 save();console.log('STOCKS_REMOTE_IDENTITY='+JSON.stringify({status:out.status,lookId:out.avatarLookId,rawImageUrl:out.rawImageUrl,paidPOSTs:out.paidPOSTs}));
}catch(e){out.error=String(e.message||e).slice(0,220);out.status='STOP';save();console.log('STOCKS_REMOTE_IDENTITY='+JSON.stringify(out))}
