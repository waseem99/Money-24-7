import {validateSnapshot,metrics} from './data.js';
export const templates=['anchor-full','discussion-two','presenter-board','anchor-analyst-wall','chart-full','story-visual'];
export const actions=['chart.reveal','chart.highlight','chart.range','board.highlight','headline.set','camera.cut','listener.react'];
const identifier=x=>{if(typeof x!=='string'||!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/.test(x))throw new Error('Invalid stable ID');return x;};
const unique=(xs,label)=>{const s=new Set(xs.map(identifier));if(s.size!==xs.length)throw new Error('Duplicate '+label);return s;};
export function validateProgramme(p) {
  if(p?.schemaVersion!==2||!['sample','pilot','segment'].includes(p.profile))throw new Error('V2 programme/profile required');
  identifier(p.id);if(!Number.isInteger(p.revision)||p.revision<1||!p.title||!p.disclosure||!p.theme?.background||!p.theme?.accent)throw new Error('Programme identity/theme required');
  if(p.fps!==30||p.width!==1920||p.height!==1080||!Number.isInteger(p.durationMs)||p.durationMs<3000||p.durationMs>300000)throw new Error('Invalid programme format');
  if((p.profile==='sample'&&p.durationMs!==45000)||(p.profile==='pilot'&&p.durationMs!==300000))throw new Error('Duration/profile mismatch');
  for(const key of ['background','surface','accent','blue','ink','muted','up','down'])if(!/^#[0-9a-f]{6}$/i.test(p.theme[key]))throw new Error('Theme colours must be hex');
  if(typeof p.theme.font!=='string'||p.theme.font.length>120)throw new Error('Invalid font');
  const presenters=unique(p.presenters.map(x=>x.id),'presenter');if(presenters.size<2||presenters.size>6)throw new Error('Two to six presenter profiles required');
  for(const x of p.presenters)if(!x.name||!x.role||!x.look||!x.configRef||!/^[A-Z][A-Z0-9_]*$/.test(x.configRef))throw new Error('Invalid presenter configuration reference');
  if(!p.snapshots.length||p.snapshots.length>6||p.snapshots.some(s=>!Array.isArray(s.rows)||s.rows.length>4000))throw new Error('One to six bounded source histories required');
  const sources=unique(p.snapshots.map(x=>x.id),'snapshot');p.snapshots.forEach(validateSnapshot);
  const claims=unique(p.claims.map(x=>x.id),'claim');
  for(const c of p.claims){const s=p.snapshots.find(s=>s.id===c.snapshotId);if(!s||c.subject!==s.instrument||c.asOf!==s.asOf||!['close','change','changePct'].includes(c.metric)||c.unit!==(c.metric==='changePct'?'percent':s.unit)||!Number.isFinite(c.value)||Math.abs(c.value-metrics(s)[c.metric])>.000001)throw new Error('Claim subject/value/unit/timeframe mismatch');}
  const turns=unique(p.turns.map(t=>t.id),'turn');let end=0;
  for(const t of p.turns){if(!presenters.has(t.speakerId)||typeof t.text!=='string'||!t.text.trim()||t.text.length>1800||!Array.isArray(t.claimIds)||t.claimIds.some(c=>!claims.has(c))||!Number.isInteger(t.startMs)||!Number.isInteger(t.durationMs)||t.durationMs<1000||t.startMs<end||t.startMs+t.durationMs>p.durationMs)throw new Error('Invalid/overlapping dialogue turn');end=t.startMs+t.durationMs;}
  unique(p.scenes.map(s=>s.id),'scene');end=0;
  for(const s of p.scenes){if(!Number.isInteger(s.startMs)||!templates.includes(s.template)||s.startMs!==end||!Number.isInteger(s.durationMs)||s.durationMs<1000||!sources.has(s.snapshotId)||!s.headline||s.headline.length>95||!Array.isArray(s.turnIds)||s.turnIds.some(id=>!turns.has(id))||!Array.isArray(s.presenterIds)||new Set(s.presenterIds).size!==s.presenterIds.length||s.presenterIds.some(id=>!presenters.has(id))||s.template!=='chart-full'&&!s.presenterIds.length)throw new Error('Invalid scene/template/binding');end+=s.durationMs;
    for(const id of s.turnIds){const t=p.turns.find(t=>t.id===id);if(t.startMs<s.startMs||t.startMs+t.durationMs>end||!s.presenterIds.includes(t.speakerId)||t.claimIds.some(id=>p.claims.find(c=>c.id===id).snapshotId!==s.snapshotId))throw new Error('Turn crosses scene/source boundary');}
    if(['discussion-two','anchor-analyst-wall'].includes(s.template)&&s.presenterIds.length!==2)throw new Error('Two-person template requires two presenters');
  }
  if(end!==p.durationMs||p.turns.some(t=>p.scenes.filter(s=>s.turnIds.includes(t.id)).length!==1))throw new Error('Timeline gap or unbound turn');
  unique(p.cues.map(c=>c.id),'cue');
  for(const c of p.cues){if(Object.keys(c).some(k=>!['id','turnId','action','tokenStart','tokenEnd','targetIndex','offsetMs','label','template','presenterId','reaction'].includes(k)))throw new Error('Unknown cue field or series binding');const t=p.turns.find(t=>t.id===c.turnId),s=p.scenes.find(s=>s.turnIds.includes(c.turnId));if(!actions.includes(c.action)||!t||!Number.isInteger(c.tokenStart)||!Number.isInteger(c.tokenEnd)||c.tokenStart<0||c.tokenEnd<=c.tokenStart||c.tokenEnd>t.text.trim().split(/\s+/).length||!Number.isFinite(c.offsetMs)||Math.abs(c.offsetMs)>2000)throw new Error('Invalid action/token cue');if(c.action.startsWith('chart.')&&(!Number.isInteger(c.targetIndex)||c.targetIndex<0||c.targetIndex>=p.snapshots.find(x=>x.id===s.snapshotId).rows.length))throw new Error('Invalid chart target');if(c.action==='board.highlight'&&(!Number.isInteger(c.targetIndex)||c.targetIndex<0||c.targetIndex>=p.snapshots.length))throw new Error('Invalid board target');if(c.action==='camera.cut'&&(!templates.includes(c.template)||(['discussion-two','anchor-analyst-wall'].includes(c.template)&&s.presenterIds.length!==2)))throw new Error('Invalid camera template');if(c.action==='listener.react'&&(!s.presenterIds.includes(c.presenterId)||c.presenterId===t.speakerId||!['neutral','nod','attentive'].includes(c.reaction)))throw new Error('Invalid listener reaction');if(c.action==='headline.set'&&(!c.label||c.label.length>95))throw new Error('Invalid headline cue');}
  return p;
}
export const presenterFor=(p,id)=>p.presenters.find(x=>x.id===id);
