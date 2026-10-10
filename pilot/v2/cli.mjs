import {parseArgs} from 'node:util';
import {loadEnvFile} from 'node:process';
import path from 'node:path';
import {initV2,loadV2,editorial,produceV2,importV2,readiness,retakeV2,reconcileV2} from './workflow.mjs';
import {renderV2} from './render.mjs';
import {directV2} from './director.mjs';
import {movementExperiment} from './movement.mjs';
import {migrateV1} from './migrate-v1.mjs';
import {atomicJSON,readJSON} from '../contracts.mjs';
import {unlock} from '../workflow.mjs';
try{loadEnvFile('.env.local');}catch(e){if(e.code!=='ENOENT')throw e;}
const {values:o,positionals:[cmd,name]}=parseArgs({allowPositionals:true,options:{fixture:{type:'boolean'},paid:{type:'boolean'},synthetic:{type:'boolean'},profile:{type:'string'},episode:{type:'string'},reviewer:{type:'string'},turn:{type:'string'},scene:{type:'string'},presenter:{type:'string'},reaction:{type:'string'},file:{type:'string'},alignment:{type:'string'},provenance:{type:'string'},reason:{type:'string'},job:{type:'string'},'video-id':{type:'string'},bindings:{type:'string'},output:{type:'string'}}});
try{
  if(cmd==='init')console.log((await initV2(o.episode,{fixture:o.fixture,profile:o.profile})).name);
  else if(cmd==='migrate'){const result=migrateV1(await readJSON(o.episode),await readJSON(o.bindings));if(!o.output)throw new Error('--output required');await atomicJSON(o.output,result.programme);await atomicJSON(o.output+'.migration.json',result.report);console.log(o.output);}
  else if(cmd==='serve')await (await import('../server.mjs')).serve();
  else if(['status','estimate','editorial','direct','produce','pipeline','render','import','retake','reconcile','movement','unlock'].includes(cmd)){
    const run=await loadV2(name);
    if(cmd==='status')console.log(JSON.stringify({manifest:run.manifest,readiness:readiness(run)},null,2));
    if(cmd==='estimate'){const turns=run.episode.turns.filter(t=>!run.manifest.assets[t.id]),voice=Number(process.env.PILOT_SPEECH_ESTIMATE_USD),avatar=Number(process.env.PILOT_AVATAR_ESTIMATE_USD);console.log(JSON.stringify({turns:turns.length,estimatedUSD:voice>0&&avatar>0?turns.length*(voice+avatar):null,capUSD:Number(process.env.PILOT_MAX_ESTIMATED_USD)||null,readiness:readiness(run),note:'Operator estimates, not provider quotes; excludes separate listener creation.'},null,2));}
    if(cmd==='editorial')await editorial(run,o.reviewer);
    if(cmd==='direct'){await directV2(run,{paid:o.paid});console.log(path.join(run.root,'director-draft.json')+' — review, then initialize this new revision.');}
    if(cmd==='produce'||cmd==='pipeline'&&!run.manifest.fixture)console.log(JSON.stringify(await produceV2(run,{paid:o.paid,turnId:o.turn,onProgress:console.log}),null,2));
    if(cmd==='render'||cmd==='pipeline'){const ready=readiness(run);if(ready.ready)console.log(JSON.stringify(await renderV2(run,console.log),null,2));else console.log(JSON.stringify({state:'awaiting-media',...ready},null,2));}
    if(cmd==='import')await importV2(run,{turnId:o.turn,sceneId:o.scene,presenterId:o.presenter,file:o.file,alignmentFile:o.alignment,provenance:o.provenance,reaction:o.reaction,synthetic:o.synthetic});
    if(cmd==='retake')await retakeV2(run,o.turn,o.reason);
    if(cmd==='reconcile')await reconcileV2(run,o.job,o['video-id']);
    if(cmd==='movement'){await atomicJSON(path.join(run.root,'movement-experiment.json'),movementExperiment(run.episode));console.log('Experiment specification saved; actual movement media remains required.');}
    if(cmd==='unlock')await unlock(run.root);
  }else console.log(`Signal Broadcast V2\n\ninit [--fixture] [--profile sample|pilot] [--episode file.json]\nstatus RUN\nestimate RUN\neditorial RUN --reviewer NAME\ndirect RUN --paid\nproduce RUN --paid [--turn ID]\npipeline RUN [--paid]\nrender RUN\nimport RUN --turn ID --file take.mp4 --alignment timing.json --provenance TEXT [--synthetic]\nimport RUN --scene ID --presenter ID --reaction neutral --file listener.webm --provenance TEXT\nretake RUN --turn ID --reason TEXT\nreconcile RUN --job ID --video-id ID\nmovement RUN\nmigrate --episode V1.json --bindings bindings.json --output V2.json\nserve\n\nSee docs/BROADCAST_V2_RUNBOOK.md. Dummy keys never invoke providers.`);
}catch(e){console.error(e.message);process.exitCode=1;}
