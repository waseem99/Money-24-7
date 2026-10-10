import {loadV2,approveV2,defectV2} from './v2/workflow.mjs';
import http from 'node:http';
import {randomBytes,timingSafeEqual} from 'node:crypto';
import path from 'node:path';
import {readFile,readdir,stat,mkdir,writeFile} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {runBase,loadRun,approve,exists} from './workflow.mjs';
import {readJSON,id,realSetting} from './contracts.mjs';

const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.mp4':'video/mp4','.vtt':'text/vtt'};
const eq=(a,b)=>typeof a==='string'&&Buffer.byteLength(a)===Buffer.byteLength(b)&&timingSafeEqual(Buffer.from(a),Buffer.from(b));
async function body(req){let result='';for await(const chunk of req){result+=chunk;if(Buffer.byteLength(result)>16384)throw new Error('Request too large');}return JSON.parse(result||'{}');}
export async function sendFile(req,res,file,{privateFile=false}={}) {
  const info=await stat(file);if(!info.isFile())throw new Error('Missing file');let start=0,end=info.size-1;
  res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.setHeader('Accept-Ranges','bytes');res.setHeader('Cache-Control',privateFile?'no-store':'no-cache');
  if(req.headers.range){const match=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range);if(!match){res.writeHead(416,{'Content-Range':`bytes */${info.size}`});return res.end();}start=Number(match[1]);end=match[2]?Number(match[2]):end;if(start>end||start>=info.size||end>=info.size){res.writeHead(416,{'Content-Range':`bytes */${info.size}`});return res.end();}res.statusCode=206;res.setHeader('Content-Range',`bytes ${start}-${end}/${info.size}`);}
  res.setHeader('Content-Length',end-start+1);if(req.method==='HEAD')return res.end();
  const stream=createReadStream(file,{start,end});stream.on('error',()=>res.destroy());stream.pipe(res);
}
export function createReviewServer({token,dist=path.resolve('dist')}={}) {
  if(!realSetting(token)||token.length<32)throw new Error('Review token must be at least 32 characters');
  const sessions=new Map();
  return http.createServer(async(req,res)=>{
    res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Frame-Options','DENY');
    res.setHeader('Content-Security-Policy',"default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src 'self' blob:; connect-src 'self'; frame-ancestors 'none'");
    const json=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
    try {
      // Local-only review host: reject DNS rebinding and cross-site mutation.
      const host=req.headers.host||'';if(!/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(host))return json(403,{error:'Local review only'});
      const url=new URL(req.url,`http://${host}`);const p=url.pathname;
      if(!['GET','HEAD','POST'].includes(req.method))return json(405,{error:'Method not allowed'});
      if(req.method==='POST'&&req.headers.origin!==`http://${host}`)return json(403,{error:'Same-origin request required'});
      if(p==='/api/pilot/login'&&req.method==='POST') {
        const input=await body(req);if(!eq(input.token,token))return json(401,{error:'Invalid review token'});
        const sid=randomBytes(32).toString('hex');const expires=Date.now()+8*3600000;
        for(const [key,value] of sessions)if(value<Date.now())sessions.delete(key);
        if(sessions.size>100)sessions.clear();sessions.set(sid,expires);
        res.setHeader('Set-Cookie',`signal_review=${sid}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800`);return json(200,{ok:true});
      }
      if(p.startsWith('/api/pilot')||p.startsWith('/media/')) {
        const sid=req.headers.cookie?.match(/(?:^|; )signal_review=([a-f0-9]{64})(?:;|$)/)?.[1];
        if(!sid||!(sessions.get(sid)>Date.now()))return json(401,{error:'Sign in to the local review worker'});
        if(p==='/api/pilot/logout'&&req.method==='POST'){sessions.delete(sid);res.setHeader('Set-Cookie','signal_review=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');return json(200,{ok:true});}
        if(p==='/api/pilot/runs'&&req.method==='GET'){
          const entries=await readdir(runBase()).catch(()=>[]);const runs=[];
          for(const name of entries){try{const run=await loadRun(name);runs.push({name,title:run.episode.title,fixture:run.manifest.fixture,state:run.manifest.state});}catch{}}
          return json(200,runs);
        }
        if(p==='/api/pilot/v2/runs'&&req.method==='GET'){const runs=[];for(const name of await readdir(runBase()).catch(()=>[])){try{const r=await loadV2(name);runs.push({name,title:r.episode.title,fixture:r.manifest.fixture,state:r.manifest.state});}catch{}}return json(200,runs);}
        const v2=/^\/api\/pilot\/v2\/runs\/([\w-]+)(\/approve|\/defects)?$/.exec(p);
        if(v2){const run=await loadV2(v2[1]);if(v2[2]==='/approve'&&req.method==='POST')return json(200,await approveV2(run,await body(req)));if(v2[2]==='/defects'&&req.method==='POST')return json(200,await defectV2(run,await body(req)));if(!v2[2]&&req.method==='GET')return json(200,{episode:run.episode,manifest:run.manifest,qa:await readJSON(path.join(run.root,'output/qa.json')).catch(()=>null),approval:await readJSON(path.join(run.root,'approval.json')).catch(()=>null),defects:await readJSON(path.join(run.root,'defects.json')).catch(()=>[])});}
        const m=/^\/api\/pilot\/runs\/([\w-]+)(\/approve)?$/.exec(p);
        if(m){const run=await loadRun(m[1]);
          if(m[2]&&req.method==='POST')return json(200,await approve(run,await body(req)));
          if(!m[2]&&req.method==='GET')return json(200,{episode:run.episode,manifest:run.manifest,qa:await readJSON(path.join(run.root,'output/qa.json')).catch(()=>null),approval:await readJSON(path.join(run.root,'approval.json')).catch(()=>null),editorial:await readJSON(path.join(run.root,'editorial.json')).catch(()=>null)});
        }
        const media=/^\/media\/([\w-]+)\/(master\.mp4|captions\.vtt|[\w-]+\.png)$/.exec(p);
        if(media&&['GET','HEAD'].includes(req.method)){const info=await readJSON(path.join(runBase(),media[1],'manifest.json'));const run=await (info.version===2?loadV2:loadRun)(media[1]);return await sendFile(req,res,path.join(run.root,'output',media[2]),{privateFile:true});}
        return json(404,{error:'Not found'});
      }
      if(!['GET','HEAD'].includes(req.method))return json(405,{error:'Method not allowed'});
      // Serve only compiled review assets; never serve worker data, keys or source files.
      if(p==='/broadcast-preview.html')return await sendFile(req,res,path.join(dist,'broadcast-preview.html'));
      if(p==='/'||p==='/pilot'||p==='/pilot.html')return await sendFile(req,res,path.join(dist,'pilot.html'));
      if(/^\/assets\/[\w.-]+\.(js|css|png|svg)$/.test(p))return await sendFile(req,res,path.join(dist,p.slice(1)));
      if(p==='/favicon.svg')return await sendFile(req,res,path.join(dist,'favicon.svg'));
      return json(404,{error:'Not found'});
    }catch(e){if(res.headersSent)return res.destroy();return json(400,{error:e.code==='ENOENT'?'Artifact not available':e.message.slice(0,240)});}
  });
}
export async function serve(){
  const root=runBase();await mkdir(root,{recursive:true,mode:0o700});const tokenFile=path.join(root,'review-token');
  let token=process.env.PILOT_REVIEW_TOKEN;
  if(!token){if(!await exists(tokenFile))await writeFile(tokenFile,randomBytes(32).toString('hex'),{mode:0o600});token=(await readFile(tokenFile,'utf8')).trim();}
  const port=Number(process.env.PILOT_REVIEW_PORT||4310);if(!Number.isInteger(port)||port<1024||port>65535)throw new Error('Invalid port');
  const server=createReviewServer({token});server.listen(port,'127.0.0.1',()=>console.log(`Signal review: http://127.0.0.1:${port}/pilot\nLocal sign-in token file: ${tokenFile}\nUse an SSH tunnel for remote review. Worker never binds publicly.`));return server;
}
