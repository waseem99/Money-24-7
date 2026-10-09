import path from 'node:path';
import {copyFile,mkdir,readFile,unlink} from 'node:fs/promises';
import {readJSON,hash,atomicJSON} from './contracts.mjs';
export async function invalidateOutput(root){
  const approval=await readJSON(path.join(root,'approval.json')).catch(()=>null);
  if(approval?.masterHash){
    const master=path.join(root,'output/master.mp4');if(hash(await readFile(master))!==approval.masterHash)throw new Error('Approved master changed; preserve and reconcile before replacement');
    const folder=path.join(root,'archive',approval.masterHash);await mkdir(folder,{recursive:true});
    await copyFile(master,path.join(folder,'master.mp4'));await atomicJSON(path.join(folder,'approval.json'),approval);
    for(const name of ['qa.json','episode.json','captions.vtt','production-report.json'])await copyFile(path.join(root,'output',name),path.join(folder,name)).catch(e=>{if(e.code!=='ENOENT')throw e;});
  }
  for(const file of ['approval.json','output/qa.json'])await unlink(path.join(root,file)).catch(e=>{if(e.code!=='ENOENT')throw e;});
}
