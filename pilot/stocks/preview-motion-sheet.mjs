/** Download and visually sample only HeyGen's PUBLIC, PRE-EXISTING studio-avatar preview URLs.
 * This is a read-only GET workflow: no video generation, no auth tokens and no API charges.
 * Output: eight-view seated/standing front/side expression contact sheet, candidate metadata, and optional silent 2-person clip.
 */
import sharp from 'sharp';
import {spawnSync} from 'node:child_process';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {MULTI_ANGLE_CANDIDATES} from './motion-qa.mjs';

const DEST=process.argv[2]||'/tmp/stocks-motion-previews';
await mkdir(DEST,{recursive:true});
function cmd(program,args,timeout=180000){
 const p=spawnSync(program,args,{encoding:'utf8',timeout,maxBuffer:4*1024*1024});
 if(p.status!==0||p.error)throw new Error(program+' failed: '+String(p.error||p.stderr).slice(-1000));
 return p.stdout;
}
const W=480,H=292,TOP=56;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const thumbs=[],records=[];
for(let i=0;i<MULTI_ANGLE_CANDIDATES.length;i++){
 const item=MULTI_ANGLE_CANDIDATES[i];
 if(item.type!=='studio_avatar'||!item.previewVideoUrl.startsWith('https://files2.heygen.ai/avatar/v3/'))throw new Error('Only exact public provider studio previews are authorized');
 const file=path.join(DEST,'public-'+i+'.mp4');
 cmd('curl',['-fsSL','--connect-timeout','20','--max-time','100','--max-filesize','30000000',item.previewVideoUrl,'-o',file],120000);
 const probe=JSON.parse(cmd('ffprobe',['-v','error','-show_entries','format=duration,size','-show_entries','stream=codec_type,width,height','-of','json',file]));
 const v=probe.streams.find(x=>x.codec_type==='video');
 const duration=Number(probe.format.duration);
 if(!v||!Number.isFinite(duration)||duration<2||duration>120)throw new Error('Invalid public preview: '+item.name);
 const offsets=[.15,.32,.59,.83].map(p=>Math.max(.12,Math.min(duration-.15,duration*p)));
 const frames=[];
 for(let j=0;j<offsets.length;j++){
   const frame=path.join(DEST,'public-'+i+'-'+j+'.png');
   cmd('ffmpeg',['-hide_banner','-loglevel','error','-y','-ss',offsets[j].toFixed(2),'-i',file,
     '-frames:v','1','-vf',`scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H}`,frame]);
   frames.push({input:await readFile(frame),left:j*W,top:TOP+i*(H+TOP)});
 }
 thumbs.push(...frames);
 records.push({name:item.name,lookId:item.lookId,publicPreview:item.previewVideoUrl,durationSeconds:duration,
   width:v.width,height:v.height,mediaSizeBytes:Number(probe.format.size),approved:false,source:'Existing HeyGen public provider preview, no generation'});
}
const height=(H+TOP)*MULTI_ANGLE_CANDIDATES.length;
const bg=sharp({create:{width:W*4,height,channels:3,background:'#05172a'}});
const labels=MULTI_ANGLE_CANDIDATES.map((x,i)=>{
 const y=i*(H+TOP);
 return `<text x="22" y="${y+38}" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="25">${esc(x.name)} — existing filmed studio preview • not approved</text>`;
}).join('');
thumbs.push({input:Buffer.from(`<svg width="${W*4}" height="${height}" xmlns="http://www.w3.org/2000/svg">${labels}</svg>`),left:0,top:0});
const contact=path.join(DEST,'STOCKS-VIDEO-TRAINED-CANDIDATE-MOTION-STRIP.jpg');
await bg.composite(thumbs).jpeg({quality:85}).toFile(contact);
// Two public samples only, silent (NO synthesized dialogue or implication of cast approval).
const first=path.join(DEST,'public-0.mp4'),second=path.join(DEST,'public-1.mp4');
const pair=path.join(DEST,'STOCKS-EXISTING-STUDIO-PREVIEWS-SIDE-BY-SIDE.mp4');
const seconds=Math.max(1.5,Math.min(10,records[0].durationSeconds,records[1].durationSeconds));
cmd('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',first,'-i',second,
 '-filter_complex',`[0:v]fps=24,scale=960:540:force_original_aspect_ratio=increase,crop=960:540,setsar=1[l];[1:v]fps=24,scale=960:540:force_original_aspect_ratio=increase,crop=960:540,setsar=1[r];[l][r]hstack=inputs=2[v]`,
 '-map','[v]','-an','-t',seconds.toFixed(3),'-r','24','-c:v','libx264','-preset','fast','-crf','23','-pix_fmt','yuv420p','-movflags','+faststart',pair],240000);
const metadata={source:'Existing provider public preview motion only',billedHeyGenJobs:0,
 userApprovedCast:false,recordedSourceDate:'2026-10-12',captures:records,
 contactSheet:path.basename(contact),sideBySideClip:path.basename(pair)};
await writeFile(path.join(DEST,'STOCKS-MOTION-PREVIEW-QA.json'),JSON.stringify(metadata,null,2));
console.log(JSON.stringify({status:'success',files:[path.basename(contact),path.basename(pair)],candidates:records.map(x=>({name:x.name,duration:x.durationSeconds}))},null,2));
