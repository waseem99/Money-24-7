// Only authorized GETs of previously completed source, plus commits of public AI-created reference frames to the user's own public repo.
// No video generation or use of unknown third-party people.
import {writeFileSync,readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const env=process.env,key=env.HEYGEN_API_KEY,token=env.GH_TOKEN,repo=env.GITHUB_REPOSITORY,branch=env.GITHUB_HEAD_REF;
const videoId='47a1fe8aad834decb010a30c9e4cf56d';
const report={project:'Stocks',videoId,mode:'GET existing W3 film + commit derived exact reference frames',paidGenerationRequests:0,images:[]};
const run=(cmd,args)=>{const o=spawnSync(cmd,args,{encoding:'utf8',timeout:90000});if(o.status!==0)throw Error('Media tool failed '+cmd+' '+String(o.stderr).slice(-350));return o.stdout};
try{
 if(!key||!token||!repo||!branch)throw Error('Missing scoped authenticated source/branch');
 const x=await fetch('https://api.heygen.com/v3/videos/'+videoId,{headers:{'x-api-key':key},signal:AbortSignal.timeout(16000)});
 const a=await x.json().catch(()=>({}));const data=a.data??a;
 if(!x.ok||data.status!=='completed'||!data.video_url)throw Error('Approved W3 source not accessible');
 const b=await fetch(data.video_url,{signal:AbortSignal.timeout(90000)});
 if(!b.ok)throw Error('W3 video GET failed');
 writeFileSync('/tmp/w3.mp4',new Uint8Array(await b.arrayBuffer()));
 run('ffmpeg',['-hide_banner','-loglevel','error','-y','-ss','2.0','-i','/tmp/w3.mp4','-frames:v','1','-update','1','/tmp/full-scene.png']);
 for(const [name,filter] of [['NORA','crop=680:383:0:36,scale=1280:720:flags=lanczos'],['MARCUS','crop=680:383:600:36,scale=1280:720:flags=lanczos']]){
  run('ffmpeg',['-hide_banner','-loglevel','error','-y','-i','/tmp/full-scene.png','-vf',filter,'-frames:v','1','-update','1','/tmp/'+name+'.png']);
 }
 const files=[['W3-full-scene.png','/tmp/full-scene.png'],['W3-NORA-close.png','/tmp/NORA.png'],['W3-MARCUS-close.png','/tmp/MARCUS.png']];
 for(const [file,path] of files){
  const fileBody=readFileSync(path);
  if(fileBody.length<30000||fileBody.length>4_000_000)throw Error('Unacceptable image bytes');
  const target='assets/stocks/reference/'+file;
  const url='https://api.github.com/repos/'+repo+'/contents/'+target;
  const existing=await fetch(url+'?ref='+encodeURIComponent(branch),{headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(18000)});
  if(existing.status===200){const e=await existing.json();report.images.push({name:file,path:target,existing:true,url:'https://raw.githubusercontent.com/'+repo+'/'+branch+'/'+target,sha:e.sha});continue}
  if(existing.status!==404)throw Error('Cannot confirm target absent: '+existing.status);
  const sent=await fetch(url,{method:'PUT',headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','Content-Type':'application/json'},
   body:JSON.stringify({message:'assets(stocks): freeze actual approved W3 AI-generated newsroom photo references',content:fileBody.toString('base64'),branch}),
   signal:AbortSignal.timeout(55000)});
  const response=await sent.json().catch(()=>({}));
  if(!sent.ok)throw Error('Failed to save known AI reference asset '+file+', HTTP '+sent.status);
  report.images.push({name:file,path:target,existing:false,url:'https://raw.githubusercontent.com/'+repo+'/'+branch+'/'+target,
    commit:response.commit?.sha,sha256:createHash('sha256').update(fileBody).digest('hex')});
 }
 writeFileSync('stocks-reference-publish.json',JSON.stringify(report,null,2));
 console.log('STOCKS_REFERENCE_PUBLISH='+JSON.stringify(report));
}catch(e){report.error=String(e.message||e).slice(0,200);writeFileSync('stocks-reference-publish.json',JSON.stringify(report,null,2));console.log('STOCKS_REFERENCE_PUBLISH='+JSON.stringify(report))}
