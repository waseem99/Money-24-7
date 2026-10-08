import {parseArgs} from 'node:util';
import {loadEnvFile} from 'node:process';
import path from 'node:path';
import {init,loadRun,editorial,direct,produce,render,importTake,configuration,reconcile,unlock,illustration} from './workflow.mjs';
import {command} from './media.mjs';
import {setTimeout as delay} from 'node:timers/promises';
try{loadEnvFile('.env.local');}catch(e){if(e.code!=='ENOENT')throw e;}
const {values:o,positionals:[cmd,name]}=parseArgs({allowPositionals:true,options:{fixture:{type:'boolean'},paid:{type:'boolean'},watch:{type:'boolean'},episode:{type:'string'},reviewer:{type:'string'},shot:{type:'string'},file:{type:'string'},provenance:{type:'string'},alignment:{type:'string'},job:{type:'string'},'video-id':{type:'string'}}});
try {
  if(cmd==='doctor'){
    const checks=await Promise.all(['ffmpeg','ffprobe'].map(async bin=>({tool:bin,available:await command(bin,['-version']).then(()=>true,()=>false)})));
    console.log(JSON.stringify({node:process.version,tools:checks,settings:configuration(),fixtureNeedsKeys:false},null,2));
  }else if(cmd==='init'){
    const run=await init(o.episode||'pilot/episodes/pilot.json',{fixture:o.fixture});console.log(run.name);
  }else if(cmd==='serve'){
    const {serve}=await import('./server.mjs');await serve();
  }else if(['status','estimate','editorial','direct','produce','render','import','reconcile','unlock','illustration'].includes(cmd)){
    if(!name)throw new Error('Supply run ID from init');const run=await loadRun(name);
    if(cmd==='status')console.log(JSON.stringify(run.manifest,null,2));
    if(cmd==='estimate'){
      const shots=run.episode.shots.filter(s=>s.speaker&&(!o.shot||s.id===o.shot)&&!run.manifest.assets[s.id]);
      const voice=Number(process.env.PILOT_SPEECH_ESTIMATE_USD),avatar=Number(process.env.PILOT_AVATAR_ESTIMATE_USD);
      console.log(JSON.stringify({shots:shots.length,spokenCharacters:shots.reduce((sum,s)=>sum+s.text.length,0),targetSeconds:shots.reduce((sum,s)=>sum+s.duration,0),estimatedUSD:voice>0&&avatar>0?shots.length*(voice+avatar):null,capUSD:Number(process.env.PILOT_MAX_ESTIMATED_USD)||null,note:'Operator estimates only. Unknown prices block paid production. Provider account limits remain authoritative.'},null,2));
    }
    if(cmd==='editorial'){await editorial(run,o.reviewer);console.log('Editorial approval saved for this exact episode.');}
    if(cmd==='direct')console.log('Draft saved:',await direct(run,{paid:o.paid}));
    if(cmd==='illustration')await illustration(run,{paid:o.paid});
    if(cmd==='produce'){
      const deadline=Date.now()+30*60*1000;
      do{
        await produce(run,{paid:o.paid,onProgress:console.log,shotId:o.shot});
        const done=o.shot?Boolean(run.manifest.assets[o.shot]):run.manifest.state==='media-ready';
        if(done||!o.watch)break;
        if(Date.now()>=deadline)throw new Error('30-minute polling window ended. Jobs are saved; run produce --watch again to resume.');
        await delay(15000);
      }while(true);
    }
    if(cmd==='render'){const qa=await render(run,console.log);console.log(JSON.stringify({output:path.join(run.root,'output/master.mp4'),fixture:qa.fixture,checks:qa.checks},null,2));}
    if(cmd==='import'){await importTake(run,o.shot,o.file,{provenance:o.provenance,alignmentFile:o.alignment});console.log('Take imported; previous approval invalidated.');}
    if(cmd==='reconcile')await reconcile(run,o.job,o['video-id']);
    if(cmd==='unlock')await unlock(run.root);
  }else console.log(`Signal pilot worker (Node 24, FFmpeg)\n\nnode pilot/cli.mjs doctor\nnode pilot/cli.mjs init [--fixture] [--episode path.json]\nnode pilot/cli.mjs status RUN\nnode pilot/cli.mjs direct RUN --paid\nnode pilot/cli.mjs editorial RUN --reviewer NAME\nnode pilot/cli.mjs produce RUN --paid\nnode pilot/cli.mjs import RUN --shot ID --file take.mp4 --provenance TEXT [--alignment timing.json]\nnode pilot/cli.mjs render RUN\nnode pilot/cli.mjs reconcile RUN --job avatar-HASH --video-id ID\nnode pilot/cli.mjs unlock RUN\nnode pilot/cli.mjs serve\n\nDirector drafts must be reviewed, then initialized as a NEW run. Paid commands never accept dummy keys. See PILOT_RUNBOOK.md.`);
}catch(e){console.error(e.message);process.exitCode=1;}
