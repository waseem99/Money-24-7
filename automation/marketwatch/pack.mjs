import {mkdir,writeFile,readFile} from 'node:fs/promises';
import path from 'node:path';
import {sealScript} from './core.mjs';

// Private local export for Drive transport to upload unchanged in phase 2.
// Never upload these packs as public GitHub Actions artifacts.
export async function exportPack(script, outputRoot) {
  const {hash}=sealScript(script);
  const root=path.resolve(outputRoot,script.episode_id,`v${script.version}-${hash.slice(0,12)}`);
  const folders=['Scripts','Flow Prompts and Assets','Review and Approvals','Generated Clips and Final Video'];
  for(const folder of folders) await mkdir(path.join(root,folder),{recursive:true,mode:0o700});
  const voice=script.scenes.map(s=>`${s.id}\n${s.dialogue}`).join('\n\n');
  const prompts=script.scenes.map(s=>`SCENE ${s.id}\nPresenter: ${script.presenter}\nLanguage: ${script.language}\nExact dialogue: ${s.dialogue}\nFlow instructions: ${s.flow_prompt}\nVisual/editing cue: ${s.visual_cue}\nReferences (operator must load files):\n${s.asset_refs.map(a=>`${a.filename}: ${a.url}`).join('\n')}\n`).join('\n');
  const files={
    'Scripts/script.json':JSON.stringify(script,null,2),
    'Scripts/voice-copy.txt':voice,
    'Scripts/sources.json':JSON.stringify(script.sources,null,2),
    'Flow Prompts and Assets/scene-prompts.txt':prompts,
    'Flow Prompts and Assets/scenes.json':JSON.stringify(script.scenes,null,2),
    'Review and Approvals/manifest.json':JSON.stringify({episode_id:script.episode_id,version:script.version,script_hash:hash,review_status:'NOT_SENT',paid_calls_authorized:false,publish_authorized:false},null,2)
  };
  for(const [name,content] of Object.entries(files)) {
    const file=path.join(root,name);
    try { await writeFile(file,content,{flag:'wx',mode:0o600}); }
    catch(e) { if(e.code!=='EEXIST') throw e; if(await readFile(file,'utf8') !== content) throw new Error('Existing pack file differs; refusing overwrite'); }
  }
  return {root,script_hash:hash,files:Object.keys(files),status:'LOCAL_EXPORT_ONLY'};
}
