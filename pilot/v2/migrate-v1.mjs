import {validateEpisode,hash} from '../contracts.mjs';
import {validateProgramme} from '../../src/broadcast/contracts.js';
import {theme} from '../../src/broadcast/fixtures.js';
// V1 bar-card data is not OHLC history. A caller supplies explicit new source
// bindings and token cues; no synthetic candles are invented during migration.
export function migrateV1(v1,{snapshots,claims=[],bindings,cues=[]}={}){
  validateEpisode(v1);if(!snapshots?.length||!bindings)throw new Error('Supply normalized snapshots and explicit per-shot source/claim bindings');
  const map={ident:'story-visual',presenter:'anchor-full',split:'discussion-two',graphic:'chart-full'};
  const presenters=Object.entries(v1.presenters).map(([id,p])=>({id,name:p.name,role:p.role,look:p.direction,configRef:id.toUpperCase(),pronunciations:[...(v1.pronunciations||[]),...(p.pronunciations||[])]}));
  const scenes=v1.shots.map(s=>{if(!bindings[s.id]?.snapshotId)throw new Error('Missing migration source binding: '+s.id);return {id:s.id,template:map[s.layout]||'story-visual',startMs:Math.round(s.start*1000),durationMs:Math.round(s.duration*1000),snapshotId:bindings[s.id].snapshotId,presenterIds:presenters.map(p=>p.id),turnIds:s.speaker?[s.id+'-turn']:[],headline:s.headline};});
  const turns=v1.shots.filter(s=>s.speaker).map(s=>({id:s.id+'-turn',speakerId:s.speaker,startMs:Math.round(s.start*1000),durationMs:Math.round(s.duration*1000),text:s.text,claimIds:bindings[s.id].claimIds||[]}));
  const programme=validateProgramme({schemaVersion:2,id:v1.id+'-v2',revision:1,profile:'pilot',title:v1.title,disclosure:v1.disclosure,width:1920,height:1080,fps:30,durationMs:300000,theme,presenters,snapshots,claims,turns,scenes,cues});
  return {programme,report:{sourceVersion:1,sourceHash:hash(v1),mediaReused:false,editorialRequired:true,legacyCuesReplaced:v1.shots.reduce((n,s)=>n+(s.cues?.length||0),0),note:'V1 run and approved master remain unchanged. Validate new source/claim associations before production.'}};
}
