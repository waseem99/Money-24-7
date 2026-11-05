import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {exportPack} from './pack.mjs';
import {buildDay,productionGate} from './core.mjs';
const args=process.argv.slice(2);
const option=name=>{const i=args.indexOf(name); return i<0 ? undefined : args[i+1];};
try {
  const command=args[0];
  if(command === 'plan') {
    const calendar=JSON.parse(await readFile(new URL('./calendar.json',import.meta.url),'utf8'));
    const day=buildDay(calendar,option('--date'),{marketState:option('--market-state'),calendarSource:option('--calendar-source')});
    const out=option('--out');
    if(out) { await mkdir(out,{recursive:true,mode:0o700}); await writeFile(`${out}/rundown.json`,JSON.stringify(day,null,2),{mode:0o600}); }
    console.log(JSON.stringify(day,null,2));
  } else if(command === 'pack') {
    if(!option('--script') || !option('--out')) throw new Error('pack requires --script FILE --out PRIVATE_DIR');
    const script=JSON.parse(await readFile(option('--script'),'utf8'));
    console.log(JSON.stringify(await exportPack(script,option('--out')),null,2));
  } else if(command === 'doctor') {
    const required=['MW_REVIEWER_EMAIL','MW_DRIVE_ROOT_ID','MW_ASSETS_ROOT_ID','MW_GOOGLE_OAUTH_CLIENT_ID','MW_GOOGLE_OAUTH_CLIENT_SECRET','MW_GOOGLE_REFRESH_TOKEN','MW_SCRIPT_API_KEY','MW_VIDEO_API_KEY','MW_VIDEO_MODEL'];
    const configured=Object.fromEntries(required.map(k=>[k,!!process.env[k] && !/DUMMY|CHANGE_ME/.test(process.env[k])]));
    console.log(JSON.stringify({mode:'FOUNDATION_ONLY',configured,production:productionGate(),live_transports_implemented:false},null,2));
  } else throw new Error('Use doctor or plan --date YYYY-MM-DD --market-state trading --calendar-source HTTPS_URL [--out DIR]');
} catch(e) { console.error(e.message); process.exitCode=1; }
