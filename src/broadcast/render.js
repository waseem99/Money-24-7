import {metrics,formatted as f} from './data.js';
import {sceneState,slots} from './timeline.js';
export const escapeXML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const text=(x,y,s,size=28,color='#f4f7fa',extra='')=>`<text x="${x}" y="${y}" fill="${color}" font-size="${size}" ${extra}>${escapeXML(s)}</text>`;
const rect=(x,y,w,h,fill,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
function lines(s,max=42){const out=[''];for(const w of s.split(/\s+/)){if((out.at(-1)+' '+w).trim().length>max)out.push(w);else out[out.length-1]+=(out.at(-1)?' ':'')+w;}return out;}
function chart(snapshot,{x,y,w,h},state,theme){
  let out=rect(x,y,w,h,'#07111f');const rows=snapshot.rows;const m=metrics(snapshot),left=x+65,right=x+w-75,top=y+70,priceBottom=y+h*.58,volumeBottom=y+h*.72,rsiBottom=y+h*.84,macdBottom=y+h-.08*h;
  const start=state.chartRange===undefined?0:Math.max(0,state.chartRange-25),visible=rows.slice(start),n=visible.length;
  const min=Math.min(...visible.map(r=>r.low)),max=Math.max(...visible.map(r=>r.high));
  const px=i=>left+(i+.5)/n*(right-left),py=v=>priceBottom-(v-min)/(max-min||1)*(priceBottom-top),cw=Math.max(2,(right-left)/n*.58);
  out+=text(x+24,y+36,snapshot.instrument,27,theme.ink,'font-weight="bold"')+text(x+w-22,y+36,`${snapshot.interval.toUpperCase()} / ${snapshot.kind==='synthetic'?'ILLUSTRATIVE':snapshot.currency}`,17,theme.muted,'text-anchor="end"');
  for(let i=0;i<5;i++){const value=min+(max-min)*i/4,yy=py(value);out+=`<path d="M${left} ${yy}H${right}" stroke="#1a3149"/>`+text(right+8,yy+6,f(value),15,theme.muted);}
  if(!state.chartVisible)return out+text(x+w/2,y+h/2,'CHART WILL FOLLOW THE EXPLANATION',22,theme.muted,'text-anchor="middle"');
  visible.forEach((r,i)=>{const colour=r.close>=r.open?theme.up:theme.down,xx=px(i);out+=`<path d="M${xx} ${py(r.high)}V${py(r.low)}" stroke="${colour}" stroke-width="1.5"/>`+rect(xx-cw/2,Math.min(py(r.open),py(r.close)),cw,Math.max(2,Math.abs(py(r.open)-py(r.close))),colour);out+=rect(xx-cw/2,volumeBottom-r.volume/Math.max(1,...visible.map(v=>v.volume))*h*.1,cw,r.volume/Math.max(1,...visible.map(v=>v.volume))*h*.1,colour,'opacity=".55"');});
  const line=(values,map,color)=>{const points=values.slice(start).map((v,i)=>v===null?null:[px(i),map(v)]).filter(Boolean);return `<path d="${points.map((v,i)=>(i?'L':'M')+v.join(',')).join(' ')}" fill="none" stroke="${color}" stroke-width="2"/>`;};
  out+=line(m.sma,py,'#efbf71')+line(m.ema,py,'#74aaff');
  out+=line(m.rsi,v=>rsiBottom-v/100*h*.1,theme.accent);
  const maxMacd=Math.max(.01,...m.macd.line.filter(v=>v!==null).map(Math.abs));
  out+=line(m.macd.line,v=>macdBottom-v/maxMacd*h*.035,'#74aaff')+line(m.macd.signal,v=>macdBottom-v/maxMacd*h*.035,'#efbf71');
  m.macd.histogram.slice(start).forEach((v,i)=>{if(v!==null){const height=Math.abs(v)/maxMacd*h*.025;out+=rect(px(i)-cw/2,v>=0?macdBottom-height:macdBottom,cw,height,v>=0?theme.up:theme.down,'opacity=".6"');}});
  for(const level of [30,70])out+=`<path d="M${left} ${rsiBottom-level/100*h*.1}H${right}" stroke="#304357" stroke-dasharray="3 6"/>`;
  for(const [label,yy]of [['VOLUME',priceBottom+24],['RSI 14',volumeBottom+18],['MACD 12 / 26 / 9',rsiBottom+20]])out+=text(x+14,yy,label,12,theme.muted);
  if(state.chartTarget!==undefined&&state.chartTarget>=start){const i=state.chartTarget-start,xx=px(i),yy=py(rows[state.chartTarget].close);out+=`<path d="M${xx} ${top}V${priceBottom}" stroke="${theme.accent}" stroke-dasharray="5 6"/><circle cx="${xx}" cy="${yy}" r="10" fill="none" stroke="${theme.accent}" stroke-width="3"/>`+text(Math.min(xx+16,right-145),Math.max(top+28,yy-18),'IN FOCUS',18,theme.accent,'font-weight="bold"');}
  out+=text(left,y+h-12,new Date(rows[start].time*1000).toISOString().slice(0,16).replace('T',' / '),15,theme.muted)+text(right,y+h-12,new Date(rows.at(-1).time*1000).toISOString().slice(11,16)+' UTC',15,theme.muted,'text-anchor="end"');return out;
}
function presenter(p,slot,state,theme,fixture){
  const {x,y,w,h}=slot,active=state.speakerId===p.id;let out=slot.kind==='alpha'&&!fixture?'':rect(x,y,w,h,'#10243a',`stroke="${active?theme.accent:'#28435c'}" stroke-width="2"`);
  if(slot.kind!=='alpha'||fixture)for(let i=0;i<6;i++)out+=rect(x+i*w/6,y+45,w/6-12,h*.5,i%2?'#142e48':'#193851');
  if(fixture){const cx=x+w*.5,cy=y+h*.35,r=Math.min(w*.13,h*.13);out+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="#344f68"/><path d="M${cx-w*.27} ${y+h*.84}Q${cx-w*.26} ${cy+r*1.05} ${cx} ${cy+r*1.15}Q${cx+w*.26} ${cy+r*1.05} ${cx+w*.27} ${y+h*.84}" fill="#29445e"/>`;out+=text(cx,y+h*.71,'PERFORMANCE PENDING',Math.min(21,w/22),theme.muted,'text-anchor="middle" letter-spacing="2"')+text(cx,y+h*.76,'LAYOUT REHEARSAL',16,theme.muted,'text-anchor="middle"');}
  out+=rect(x,y+h-78,w,78,'#0b1c30')+rect(x,y+h-78,5,78,active?theme.accent:'#42647e');
  out+=text(x+22,y+h-42,p.name.toUpperCase(),25,theme.ink,'font-weight="bold"')+text(x+22,y+h-17,p.role.toUpperCase(),15,theme.muted,'letter-spacing="1.5"');
  if(active)out+=text(x+w-18,y+h-30,fixture?'SCRIPT CUE':'SPEAKING',13,theme.accent,'text-anchor="end"');return out;
}
export function renderSVG(p,timeMs,timeline,{fixture=true,reducedMotion=false,overlays=true}={}) {
  const st=sceneState(p,timeMs,timeline,{reducedMotion}),s=st.scene,t=p.theme,snap=p.snapshots.find(x=>x.id===s.snapshotId);
  let out=`<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"><defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="${t.surface}"/><stop offset="1" stop-color="${t.background}"/></linearGradient><clipPath id="ticker"><rect x="210" y="1020" width="1660" height="60"/></clipPath></defs><g font-family="${escapeXML(t.font)}">`;
  out+=rect(0,0,1920,1080,'url(#bg)');for(let i=0;i<12;i++)out+=`<path d="M${650+i*110} 0L${i*120} 1080" stroke="#24415b" opacity=".22"/>`;
  out+=rect(0,0,1920,7,t.accent)+text(60,76,'SIGNAL',48,t.ink,'font-weight="bold" letter-spacing="9"')+text(347,74,'FINANCIAL NETWORK',19,t.muted,'letter-spacing="3"');
  out+=rect(1550,36,310,44,'#173c51')+text(1705,65,fixture?'DESIGN REHEARSAL':'PREPARED PROGRAMME',17,t.accent,'text-anchor="middle" letter-spacing="1.5"');
  out+=text(60,131,'THE BIGGER PICTURE',20,t.accent,'letter-spacing="4"')+text(1860,131,`${snap.kind==='synthetic'?'ILLUSTRATIVE':'AS OF'} / ${snap.asOf.slice(0,16).replace('T',' ')} UTC`,17,t.muted,'text-anchor="end"');
  const scale=fixture?.97+.03*st.reveal:1;out+=`<g transform="translate(${960*(1-scale)} ${500*(1-scale)}) scale(${scale})">`;
  if(s.template==='anchor-analyst-wall'){out+=rect(568,165,1292,690,'#142d44');for(let i=0;i<7;i++)out+=rect(580+i*180,168,2,680,'#2c455b');out+=chart(snap,{x:590,y:212,w:785,h:560},st,t);out+=rect(578,806,1262,49,'#0a1c2b');}
  if(s.template==='chart-full')out+=chart(snap,{x:60,y:165,w:1800,h:690},st,t);
  if(s.template==='presenter-board'){
    out+=rect(1000,165,860,690,'#0b2036')+rect(1000,165,860,70,t.blue)+text(1030,211,'MARKET SNAPSHOT',27,t.ink,'font-weight="bold"');
    p.snapshots.forEach((source,i)=>{const m=metrics(source),rowHeight=550/p.snapshots.length,y=255+i*rowHeight,colour=m.change>=0?t.up:t.down;out+=rect(1017,y,826,rowHeight-12,st.boardTarget===i?'#194954':'#12304a')+text(1040,y+30,source.instrument,24,t.ink,'font-weight="bold"')+text(1040,y+65,f(m.close),32,t.ink)+text(1815,y+65,`${m.changePct>=0?'+':''}${f(m.changePct)}%`,29,colour,'text-anchor="end"')+text(1815,y+29,`${m.change>=0?'+':''}${f(m.change)} ${source.unit}`,17,colour,'text-anchor="end"');if(rowHeight>115)out+=text(1040,y+100,`${source.asOf.slice(11,16)} UTC · ${source.currency}`,15,t.muted);});
    out+=text(1024,840,`${p.snapshots.every(x=>x.kind==='synthetic')?'ILLUSTRATIVE':'FIXED'} SNAPSHOT · COMPARISON: PRIOR CLOSE`,17,t.muted);
  }
  if(s.template==='anchor-full'){out+=text(1225,275,'IN FOCUS',22,t.accent,'letter-spacing="4"');lines(s.headline,19).forEach((l,i)=>out+=text(1216,352+i*66,l,52,t.ink,'font-weight="bold"'));out+=text(1220,593,'Evidence.',34,t.muted)+text(1220,645,'Context.',34,t.muted)+text(1220,697,'Perspective.',34,t.muted)+`<path d="M1220 770H1780" stroke="${t.accent}" stroke-width="3"/>`;}
  if(s.template==='story-visual'){out+=rect(60,165,1255,690,'#0d233b')+text(110,245,'THE QUESTION THAT MATTERS',20,t.accent,'letter-spacing="4"');['WHAT DOES','THE EVIDENCE','TELL US?'].forEach((l,i)=>out+=text(107,369+i*83,l,66,t.ink,'font-weight="bold"'));out+=text(110,694,'Read the timeframe. Compare the context.',27,t.muted)+text(110,742,'Separate observation from interpretation.',27,t.muted);}
  for(const slot of slots(s))out+=presenter(p.presenters.find(x=>x.id===slot.presenterId),slot,st,t,fixture);
  out+='</g>';
  if(overlays)out+=renderOverlay(p,st,{fixture});
  return out+'</g></svg>';
}
export function renderOverlay(p,st,{fixture=true}={}) {
  const t=p.theme;let out=rect(60,879,1800,111,'#eef3f6')+rect(60,879,8,111,t.accent);
  const headline=lines(st.headline,55);headline.slice(0,2).forEach((l,i)=>out+=text(90,925+i*39,l,34,'#10233a','font-weight="bold"'));
  out+=rect(1490,879,370,111,t.blue)+text(1675,924,'THE BRIEF',28,t.ink,'text-anchor="middle" font-weight="bold" letter-spacing="3"')+text(1675,963,'CONTEXT IN EVERY FRAME',14,t.ink,'text-anchor="middle" letter-spacing="1"');
  out+=text(60,1011,fixture?'SILENT LAYOUT TEST · PRESENTER FOOTAGE PENDING':'AI PRESENTERS · PREPARED DEMONSTRATION',15,t.muted)+text(1860,1011,p.snapshots.every(x=>x.kind==='synthetic')?'ILLUSTRATIVE FIGURES · NOT LIVE MARKET DATA':'FIXED SOURCE SNAPSHOT · SEE SOURCE RECORD',15,t.muted,'text-anchor="end"');
  out+=rect(0,1021,1920,59,'#040f1d')+rect(0,1021,210,59,t.blue)+text(105,1058,'REPLAY',19,t.ink,'text-anchor="middle" font-weight="bold" letter-spacing="3"');
  out+='<g clip-path="url(#ticker)">';
  for(let copy=0;copy<2;copy++)p.snapshots.forEach((s,i)=>{const row=s.rows.at(-1),change=(row.close-s.priorClose)/s.priorClose*100,x=240+i*640+copy*p.snapshots.length*640-st.tickerOffset;out+=text(x,1058,s.instrument,20,t.muted)+text(x+220,1058,f(row.close),24,t.ink,'font-weight="bold"')+text(x+376,1058,`${change>=0?'▲':'▼'} ${f(Math.abs(change))}%`,21,change>=0?t.up:t.down)+text(x+535,1058,new Date(row.time*1000).toISOString().slice(11,16),15,t.muted);});
  return out+'</g>';
}
