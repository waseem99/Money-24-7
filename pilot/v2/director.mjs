import path from 'node:path';
import {readFile} from 'node:fs/promises';
import {validateProgramme,templates,actions} from '../../src/broadcast/contracts.js';
import {Store,chargedJob,jobKey} from '../store.mjs';
import {hash,atomicJSON} from '../contracts.mjs';
import {required} from '../providers.mjs';
import {withLock} from '../workflow.mjs';

export function claimSentence(c){return `${c.subject}: ${c.metric==='changePct'?'change from prior close':c.metric==='change'?'change from prior close':'closing value'} ${c.value.toFixed(2)} ${c.unit}, as of ${c.asOf}.`;}
export function validateDraft(base,draft){
  if(!Array.isArray(draft?.turns)||draft.turns.length!==base.turns.length||!Array.isArray(draft.scenes)||draft.scenes.length!==base.scenes.length||!Array.isArray(draft.cues))throw new Error('Director must preserve all scene and turn IDs');
  const p=structuredClone(base);p.revision++;
  for(const t of p.turns){
    const rows=draft.turns.filter(x=>x.id===t.id);if(rows.length!==1)throw new Error('Unknown or duplicate turn');
    let text=rows[0].text;if(typeof text!=='string')throw new Error('Text required');
    const used=[];text=text.replace(/\{\{claim:([\w-]+)\}\}/g,(_,id)=>{const c=p.claims.find(x=>x.id===id);if(!c||!t.claimIds.includes(id))throw new Error('Claim not authorized for this turn');used.push(id);return `§${used.length-1}§`;});
    // Facts are inserted by code as complete entity/unit/time statements.
    if(/[\d%$€£]|\{\{|\bguarantees?\b|\bwill definitely\b|\bcaused by\b|\bbecause of\b/i.test(text.replace(/§\d+§/g,'')))throw new Error('Use authorized claim placeholders; unsupported numerical/causal assertions require editorial input');
    if(t.claimIds.some(id=>!used.includes(id)))throw new Error('Required claim omitted');
    t.text=text.replace(/§(\d+)§/g,(_,i)=>claimSentence(p.claims.find(c=>c.id===used[Number(i)])));
    const wpm=t.text.trim().split(/\s+/).length/(t.durationMs/60000);if(wpm>190||wpm<65)throw new Error('Dialogue outside 65–190 words/minute planning range');
  }
  for(const s of p.scenes){const rows=draft.scenes.filter(x=>x.id===s.id);if(rows.length!==1)throw new Error('Unknown or duplicate scene');const x=rows[0];if(/[\d%$€£]/.test(x.headline))throw new Error('Headlines must be qualitative; exact figures belong to validated graphics');s.template=x.template;s.headline=x.headline;}
  p.cues=draft.cues;return validateProgramme(p);
}
export async function requestDirection(base,errors){
  const {generateText,Output,jsonSchema}=await import('ai');
  const schema={type:'object',additionalProperties:false,required:['turns','scenes','cues'],properties:{turns:{type:'array',items:{type:'object',additionalProperties:false,required:['id','text'],properties:{id:{type:'string'},text:{type:'string'}}}},scenes:{type:'array',items:{type:'object',additionalProperties:false,required:['id','template','headline'],properties:{id:{type:'string'},template:{type:'string',enum:templates},headline:{type:'string'}}}},cues:{type:'array',items:{type:'object',additionalProperties:false,required:['id','turnId','action','tokenStart','tokenEnd','targetIndex','offsetMs'],properties:{id:{type:'string'},turnId:{type:'string'},action:{type:'string',enum:actions.filter(x=>x.startsWith('chart.')||x==='board.highlight')},tokenStart:{type:'integer'},tokenEnd:{type:'integer'},targetIndex:{type:'integer'},offsetMs:{type:'integer'}}}}}};
  const system=await readFile(new URL('./director.txt',import.meta.url),'utf8');
  const r=await generateText({model:required(process.env,'AI_GATEWAY_MODEL'),system,prompt:JSON.stringify({programme:base,validationErrors:errors}),output:Output.object({schema:jsonSchema(schema)}),maxRetries:0,maxOutputTokens:9000,abortSignal:AbortSignal.timeout(120000)});
  return {draft:r.output,usage:r.usage};
}
export async function directV2(run,{paid=false,env=process.env,request=requestDirection}={}){
  if(!paid||run.manifest.fixture)throw new Error('Director needs a real run and --paid');required(env,'AI_GATEWAY_API_KEY');required(env,'AI_GATEWAY_MODEL');
  return withLock(run.root,async()=>{const db=new Store(run.root),errors=[];try{
    for(let attempt=0;attempt<3;attempt++){
      const key=jobKey('director-v2',{programme:hash(run.episode),model:env.AI_GATEWAY_MODEL,promptVersion:2,attempt,errors});
      const result=await chargedJob(db,key,{amount:Number(env.PILOT_DIRECTOR_ESTIMATE_USD),cap:Number(env.PILOT_MAX_ESTIMATED_USD),category:'director'},()=>request(run.episode,errors));
      try{const draft=validateDraft(run.episode,result.draft);await atomicJSON(path.join(run.root,'director-draft.json'),draft);await atomicJSON(path.join(run.root,'director-report.json'),{key,attempts:attempt+1,errors,inputHash:hash(run.episode),promptVersion:2,model:env.AI_GATEWAY_MODEL,usage:result.usage,editorialRequired:true});return draft;}catch(e){errors.push(e.message);}
    }
    await atomicJSON(path.join(run.root,'director-report.json'),{errors,attempts:3,status:'needs-review'});throw new Error('Director exhausted two repairs: '+errors.at(-1));
  }finally{db.close();}});
}
