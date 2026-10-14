/**
 * Stocks R6 — source-preserving, no-API newsroom compositing operator.
 * Requires separately authorized private media; never fetches/generates actors.
 *
 * node pilot/stocks/r6/render.mjs --source /private/R5-original \
 *   --plates /private/R6-approved-plates --output /private/R6-review
 *
 * Each plate directory must contain R6-BG-NORA.png, R6-BG-MARCUS.png,
 * R6-FG-NORA.png, R6-FG-MARCUS.png and R6-TICKER-SOURCE.png.
 * Motion must come from R5 original speaker matte files.
 */
import {spawnSync} from 'node:child_process';
import {readFile,access,writeFile,mkdir,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

export const FILM_FORMAT=Object.freeze({width:1920,height:1080,fps:30,codec:'h264',audio:'aac',sampleRate:48000});
export const SAFE_PLACEMENTS=Object.freeze({
 NORA:Object.freeze({w:1530,h:861,x:-294,y:116,sourceId:'f0a2771ab6e9cfdd82306b9c4aff5e33'}),
 MARCUS:Object.freeze({w:1100,h:619,x:194,y:166,sourceId:'d8808e9850b76dd38d550d5b5f0ccaf7'})
});
export const LOCK=Object.freeze({
 programme:'Stocks',format:'REPLAY',edition:'2026-10-12',asOf:'09:40 ET',
 market:'U.S. equities only',source:'Reuters',newPaidVideoCalls:0,
 castIdentity:'Liza/Annie and Lasse/Orson original R5 source',
 humanRealismApproved:false,finalReleaseApproved:false
});

function parse(argv){
 const options={};
 for(let i=0;i<argv.length;i++){
  const name=argv[i];
  if(name==='--help'){options.help=true;continue;}
  if(!['--source','--plates','--output'].includes(name))throw Error('Unknown argument '+name);
  if(!argv[i+1]||argv[i+1].startsWith('--'))throw Error('Missing value for '+name);
  options[name.slice(2)]=path.resolve(argv[++i]);
 }
 return options;
}
function command(bin,args){
 const p=spawnSync(bin,args,{encoding:'utf8',maxBuffer:8_000_000,timeout:300_000});
 if(p.error)throw p.error;
 if(p.status!==0)throw Error(bin+' failure: '+(p.stderr||'').slice(-1300));
 return p.stdout;
}
function probe(file){
 return JSON.parse(command('ffprobe',['-v','error','-show_entries',
  'format=duration,size:stream=codec_name,codec_type,width,height,sample_rate',
  '-of','json',file]));
}
async function digest(file){
 return createHash('sha256').update(await readFile(file)).digest('hex');
}
async function doctor(source,plates){
 const mandatory=[];
 for(const role of Object.keys(SAFE_PLACEMENTS)){
  mandatory.push(path.join(source,role+'.mp4'),path.join(source,role+'-matte.webm'));
  mandatory.push(path.join(plates,'R6-BG-'+role+'.png'),path.join(plates,'R6-FG-'+role+'.png'));
 }
 mandatory.push(path.join(plates,'R6-TICKER-SOURCE.png'));
 for(const f of mandatory)await access(f);
 for(const role of Object.keys(SAFE_PLACEMENTS)){
  const q=probe(path.join(source,role+'.mp4'));
  const v=q.streams.find(x=>x.codec_type==='video'),a=q.streams.find(x=>x.codec_type==='audio');
  if(v?.width!==1920||v?.height!==1080||a?.codec_name!=='aac')throw Error(role+' wrong original A/V');
  const matte=probe(path.join(source,role+'-matte.webm'));
  const m=matte.streams.find(x=>x.codec_type==='video');
  if(m?.codec_name!=='vp9'||m.width!==960||m.height!==540)throw Error(role+' wrong alpha source');
 }
 return mandatory;
}
export async function compose(options){
 if(!options.source||!options.plates||!options.output)throw Error('Requires --source --plates --output; do not download/generate new actors');
 await doctor(options.source,options.plates);
 await mkdir(options.output,{recursive:true});
 const complete={programme:LOCK,sourceOnly:true,technicalDecodeOnly:true,roles:{}};
 for(const [role,g] of Object.entries(SAFE_PLACEMENTS)){
  const source=path.join(options.source,role+'.mp4');
  const matte=path.join(options.source,role+'-matte.webm');
  const background=path.join(options.plates,'R6-BG-'+role+'.png');
  const foreground=path.join(options.plates,'R6-FG-'+role+'.png');
  const ticker=path.join(options.plates,'R6-TICKER-SOURCE.png');
  const target=path.join(options.output,'R6-'+role+'-MOVING-TECHNICAL-REVIEW.mp4');
  const seconds=Number(probe(source).format.duration);
  const filter='[1:v]format=rgba,scale='+g.w+':'+g.h+':flags=lanczos[m];'+
   '[0:v][m]overlay=x='+g.x+':y='+g.y+':format=auto:shortest=0[people];'+
   '[people][3:v]overlay=0:0:format=auto:shortest=0[ui];'+
   "[ui][4:v]overlay=x='250-mod(t*113,1900)':y=981:format=auto:shortest=0,format=yuv420p[v]";
  command('ffmpeg',['-hide_banner','-loglevel','error','-y',
   '-loop','1','-framerate','30','-i',background,
   '-c:v','libvpx-vp9','-i',matte,
   '-i',source,
   '-loop','1','-framerate','30','-i',foreground,
   '-loop','1','-framerate','30','-i',ticker,
   '-filter_complex',filter,'-map','[v]','-map','2:a:0',
   '-t',String(seconds),'-r','30','-c:v','libx264','-preset','veryfast','-crf','20',
   '-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-ar','48000',
   '-movflags','+faststart',target]);
  command('ffmpeg',['-v','error','-i',target,'-f','null','-']);
  const info=probe(target);
  const video=info.streams.find(x=>x.codec_type==='video');
  if(video.width!==1920||video.height!==1080||Math.abs(Number(info.format.duration)-seconds)>.2)
   throw Error('Render mismatch '+role);
  complete.roles[role]={duration:Number(info.format.duration),sha256:await digest(target),
   bytes:(await stat(target)).size,sourceId:g.sourceId,fullDecode:true,humanApproved:false};
 }
 await writeFile(path.join(options.output,'R6-RENDER-RECEIPT.json'),JSON.stringify(complete,null,2));
 return complete;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 try{
  const opts=parse(process.argv.slice(2));
  if(opts.help)console.log('Usage: node pilot/stocks/r6/render.mjs --source PRIVATE_R5 --plates PRIVATE_R6 --output PRIVATE_DEST');
  else console.log(JSON.stringify(await compose(opts),null,2));
 }catch(e){console.error(String(e.message||e));process.exitCode=1;}
}
