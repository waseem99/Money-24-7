/** Non-billable composition of TWO EXISTING, separately approved HeyGen speaking clips.
 * Usage: node pilot/stocks/composite-proof.mjs path/to/nora.mp4 path/to/marcus.mp4 path/to/output.mp4
 * This script makes ZERO provider requests and never fabricates listener footage.
 */
import {spawnSync} from 'node:child_process';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import {renderStocksProofSVG} from './render-frame.mjs';
import {buildMotionProof,auditStocks} from './preflight.mjs';

function run(cmd,args){
  const result=spawnSync(cmd,args,{encoding:'utf8',maxBuffer:4*1024*1024,timeout:240000});
  if(result.error||result.status!==0)throw new Error(cmd+' failed: '+String(result.error||result.stderr).slice(-1000));
  return result.stdout;
}
function probe(file){
  const j=JSON.parse(run('ffprobe',['-v','error','-show_entries','format=duration','-show_entries','stream=codec_type,width,height','-of','json',file]));
  const video=j.streams.find(s=>s.codec_type==='video'),audio=j.streams.find(s=>s.codec_type==='audio');
  if(!video||!audio||video.width<720||video.height<720)throw new Error('Invalid input video/audio '+file);
  return {seconds:Number(j.format.duration),w:video.width,h:video.height};
}
async function main(){
  const [nora,marcus,target]=process.argv.slice(2);
  if(!nora||!marcus||!target)throw new Error('Two already rendered real MP4 clips and output path required');
  if(path.resolve(nora)===path.resolve(marcus))throw new Error('Cannot reuse one avatar video for both characters');
  const check=auditStocks();
  if(!check.pass)throw new Error(check.problems.join('; '));
  const spec=buildMotionProof();
  const infos=[probe(nora),probe(marcus)];
  if(infos.some(x=>x.seconds<3||x.seconds>23))throw new Error('Proof video duration is outside bounded short-test range');
  if(infos.reduce((n,x)=>n+x.seconds,0)>spec.plannedSeconds+2)throw new Error('Provider duration over the maximum planned 30s + 2s tolerance');
  const dir=path.dirname(path.resolve(target));await mkdir(dir,{recursive:true});
  const files=[];
  for(let i=0;i<2;i++){
    const speaker=i===0?'NORA':'MARCUS',slide=path.join(dir,'stocks-'+speaker.toLowerCase()+'-plate.png'),clip=path.join(dir,'stocks-'+speaker.toLowerCase()+'-proof.mp4');
    await sharp(Buffer.from(renderStocksProofSVG(speaker))).png().toFile(slide);
    run('ffmpeg',['-hide_banner','-loglevel','error','-y',
      '-loop','1','-framerate','30','-i',slide,'-i',i===0?nora:marcus,
      '-filter_complex','[1:v]fps=30,scale=1195:640:force_original_aspect_ratio=increase,crop=1195:640,setsar=1[p];[0:v][p]overlay=61:155:shortest=1:format=auto,format=yuv420p[v]',
      '-map','[v]','-map','1:a:0','-t',String(infos[i].seconds.toFixed(3)),'-r','30',
      '-c:v','libx264','-preset','veryfast','-crf','20','-pix_fmt','yuv420p',
      '-c:a','aac','-ar','48000','-b:a','160k','-movflags','+faststart',clip]);
    files.push(clip);
  }
  const list=path.join(dir,'stocks-proof-concat.txt');
  await writeFile(list,files.map(f=>"file '"+f.replaceAll("'","'\\''")+"'").join('\\n')+'\\n');
  run('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',list,
    '-c:v','libx264','-preset','veryfast','-crf','19','-r','30',
    '-c:a','aac','-ar','48000','-b:a','192k','-movflags','+faststart',target]);
  run('ffmpeg',['-v','error','-i',target,'-f','null','-']);
  const output=probe(target),sha256=createHash('sha256').update(await readFile(target)).digest('hex');
  const qa={proofHash:spec.hash,renderedSeconds:output.seconds,sha256,
    cast:spec.turns.map(t=>({name:t.onAirName,lookId:t.lookId,voiceId:t.voiceId})),
    audioVideoDecode:'pass',realismApproval:'human-review-required',
    twoPersonEyeLineAndReactions:'not-certified',productionMaster:'not-rendered',
    backgroundMarkCount:1,noOtherBrandedProps:true};
  await writeFile(target+'.qa.json',JSON.stringify(qa,null,2));
  console.log(JSON.stringify(qa,null,2));
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
