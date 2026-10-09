import path from 'node:path';
import {setTimeout as delay} from 'node:timers/promises';
import {readFile,unlink,copyFile} from 'node:fs/promises';
import {Store} from './store.mjs';
import {atomicJSON,hash,id} from './contracts.mjs';
import {produce,render,withLock,illustration,exists} from './workflow.mjs';
import {mediaRecord,inspectMedia} from './media.mjs';
import {invalidateOutput} from './archive.mjs';

export async function retake(run,shotId,reason){
  id(shotId);if(!reason?.trim()||!run.episode.shots.some(s=>s.id===shotId&&s.speaker))throw new Error('Valid speaking shot and retake reason required');
  return withLock(run.root,async()=>{
    const db=new Store(run.root);try{
      const pending=run.manifest.pending?.[shotId];
      for(const key of [pending?.speechKey,pending?.avatarKey].filter(Boolean)){const job=db.get(key);if(job&&['uncertain','submitting'].includes(job.state))throw new Error('Reconcile uncertain paid jobs before requesting a retake');}
      if(pending?.avatarKey&&!['completed','failed','error','canceled'].includes(pending.state))throw new Error('Existing avatar is still pending; collect or reconcile it before retaking');
      await invalidateOutput(run.root);
      run.manifest.history??=[];run.manifest.history.push({shotId,reason,at:new Date().toISOString(),asset:run.manifest.assets[shotId]||null,pending:pending||null});
      run.manifest.attempts??={};run.manifest.attempts[shotId]=(run.manifest.attempts[shotId]||0)+1;
      delete run.manifest.assets[shotId];if(run.manifest.pending)delete run.manifest.pending[shotId];run.manifest.state='retake-requested';
      await atomicJSON(path.join(run.root,'manifest.json'),run.manifest);
      for(const stale of ['approval.json','output/qa.json'])await unlink(path.join(run.root,stale)).catch(()=>{});
      return {shotId,attempt:run.manifest.attempts[shotId],paidCalls:0};
    }finally{db.close();}
  });
}
export async function importListener(run,shotId,file,provenance){
  const shot=run.episode.shots.find(s=>s.id===shotId&&s.layout==='split');if(!shot||!provenance?.trim())throw new Error('Split shot and listener provenance required');
  const record=await mediaRecord(file);if(!record.video||record.video.width<1280||record.video.height<720||record.duration<shot.duration)throw new Error('Listener must be moving 720p+ footage covering the full shot; no looping/freeze padding');
  const analysis=await inspectMedia(file,{silence:false});if(!analysis.pass)throw new Error('Listener contains black/frozen footage');
  return withLock(run.root,async()=>{await invalidateOutput(run.root);const dest=path.join(run.root,'assets',`${shotId}-listener-${record.sha256.slice(0,12)}.mp4`);await copyFile(file,dest);run.manifest.listeners??={};run.manifest.listeners[shotId]={...record,file:path.basename(dest),speaker:shot.listener,provenance,analysis};await atomicJSON(path.join(run.root,'manifest.json'),run.manifest);for(const stale of ['approval.json','output/qa.json'])await unlink(path.join(run.root,stale)).catch(()=>{});});
}
export async function pipeline(run,{paid=false,artwork=false,onProgress=console.log,pollMs=15000,maxWaitMs=1800000,producer=produce,renderer=render,artist=illustration}={}){
  const started=Date.now();
  if(!run.manifest.fixture){
    const missing=()=>run.episode.shots.some(s=>s.speaker&&!run.manifest.assets[s.id]);
    while(missing()){
      await producer(run,{paid,onProgress});if(!missing())break;
      if(Date.now()-started>=maxWaitMs)throw new Error('Polling window ended; pipeline can resume the saved provider jobs');await delay(pollMs);
    }
    for(const shot of run.episode.shots.filter(s=>s.layout==='split'))if(!run.manifest.listeners?.[shot.id])throw new Error(`Import approved listener footage for ${shot.id} before composition`);
    if(artwork&&!run.manifest.illustration)await artist(run,{paid});
  }
  const qa=await renderer(run,onProgress);
  const report={startedAt:new Date(started).toISOString(),finishedAt:new Date().toISOString(),elapsedMs:Date.now()-started,fixture:run.manifest.fixture,masterHash:qa.master.sha256,technicalPass:qa.technicalPass,stakeholderApproval:'pending'};
  const db=new Store(run.root);try{report.usage=db.summary();}finally{db.close();}
  await atomicJSON(path.join(run.root,'output/production-report.json'),report);return report;
}
