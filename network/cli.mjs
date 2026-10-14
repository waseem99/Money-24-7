#!/usr/bin/env node
/**
 * Safe offline controls for a future Stocks broadcast system.
 * No video generation, no data-source access, no GitHub deployment, no encoder.
 */
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {auditDailyRundown,NETWORK_CONTRACT} from './rundown-policy.mjs';
import {auditAICast,AI_MANDATE} from './ai-native-policy.mjs';
const [command='doctor',...rest]=process.argv.slice(2);
const example='docs/stocks-network/daily-rundown.example.json';
const out=o=>console.log(JSON.stringify(o,null,2));
try{
 if(command==='doctor'){
   const raw=JSON.parse(await readFile(example,'utf8'));
   const draft=auditDailyRundown(raw,{release:false});
   const release=auditDailyRundown(raw,{release:true});
   const aiSpec=JSON.parse(await readFile('docs/stocks-network/ai-native-character-and-studio.example.json','utf8'));
   const castDraft=auditAICast(aiSpec),castRelease=auditAICast(aiSpec,{release:true});
   const result={service:'Stocks Broadcast OS',stage:'ARCHITECTURE_DEVELOPMENT_ONLY',
     hypotheticalChannelNeverProvisioned:!NETWORK_CONTRACT.broadcastProvisioned,
     exampleScheduleMinutes:draft.minutes,exampleDraftPass:draft.pass,
     safeToBroadcast:false,releaseBlockers:release.errors.length,
     noPaidGeneration:true,sourceFile:example,
     aiOnlyPresentersRequired:true,onAirHumanPermitted:AI_MANDATE.onAirHumansPermitted,
     aiCastStructureValid:castDraft.pass,aiCastProofReady:castRelease.releaseReady,
     aiCastBlockers:castRelease.errors.length,
     aiCastSourceFile:'docs/stocks-network/ai-native-character-and-studio.example.json'};
   out(result);
   if(!draft.pass||release.pass||!castDraft.pass||castRelease.releaseReady)process.exitCode=1;
 }else if(command==='validate'){
   const release=rest.includes('--release');
   const filename=rest.find(x=>!x.startsWith('--'))||example;
   const p=path.resolve(filename);
   const json=JSON.parse(await readFile(p,'utf8'));
   const report=auditDailyRundown(json,{release});
   out({file:p,mode:release?'RELEASE_PREFLIGHT':'DRAFT_STRUCTURE',...report});
   if(!report.pass)process.exitCode=2;
 }else{
   console.error('Usage: node network/cli.mjs doctor | validate [path.json] [--release]');
   process.exitCode=2;
 }
}catch(error){
 console.error('Stocks Broadcast OS offline verification failed: '+String(error?.message||error));
 process.exitCode=2;
}
