import {parseArgs} from 'node:util';
import {loadEnvFile} from 'node:process';
import {
  auditNativePlan,initNative,loadNative,nativeStatus,lookCheckNative,
  produceNativeTurn,reconcileNative,assembleNative
} from './native-audition.mjs';

try{loadEnvFile('.env.local');}catch(e){if(e.code!=='ENOENT')throw e;}
const {values:o,positionals:[cmd,name]}=parseArgs({allowPositionals:true,options:{
  paid:{type:'boolean'},turn:{type:'string'},'video-id':{type:'string'}
}});
const help=[
  'Signal native HeyGen-only audition (Araj / Kevin / Araj)',
  '  audit                            # free, pure, no account call',
  '  init                             # free, private immutable run',
  '  status RUN                       # free local job/budget report',
  '  look-check RUN                   # read-only direct API look + voice checks',
  '  produce RUN --turn araj-open --paid   # PAID, requires exact hash/cap release',
  '  produce RUN --turn kevin-analysis --paid',
  '  produce RUN --turn araj-close --paid',
  '  reconcile RUN --turn ID --video-id ID # free, after manual provider verification',
  '  assemble RUN                     # local FFmpeg, after three real clips',
  '',
  'Defaults to no paid calls. Never set release variables before stakeholder approval.',
  'Keys live in private .env.local, never in GitHub or front-end VITE_ settings.'
].join('\n');
try{
  if(cmd==='audit')console.log(JSON.stringify(auditNativePlan(),null,2));
  else if(cmd==='init'){const run=await initNative();console.log(JSON.stringify({name:run.name,planHash:run.manifest.planHash,paid:false},null,2));}
  else if(['status','look-check','produce','reconcile','assemble'].includes(cmd)){
    if(!name)throw new Error('Exact run ID required. Run init first.');
    const run=await loadNative(name);
    if(cmd==='status')console.log(JSON.stringify(await nativeStatus(run),null,2));
    if(cmd==='look-check')console.log(JSON.stringify(await lookCheckNative(run),null,2));
    if(cmd==='produce')console.log(JSON.stringify(await produceNativeTurn(run,o.turn,{paid:o.paid}),null,2));
    if(cmd==='reconcile')console.log(JSON.stringify(await reconcileNative(run,o.turn,o['video-id']),null,2));
    if(cmd==='assemble')console.log(JSON.stringify(await assembleNative(run),null,2));
  }else console.log(help);
}catch(e){console.error(e.message);process.exitCode=1;}
