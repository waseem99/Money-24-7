import {EDITION,SHOTS} from './episode.mjs';
import {T_SYMBOL_DATA_URI,CHANNEL_MARK_COUNT} from './brand.mjs';

const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const fmt=n=>n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const t=(x,y,value,size=28,color='#f6f9fc',attributes='')=>'<text x="'+x+'" y="'+y+'" fill="'+color+'" font-size="'+size+'" '+attributes+'>'+escape(value)+'</text>';
const rect=(x,y,w,h,fill,attrs='')=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+fill+'" '+attrs+'/>';
export function renderStocksProofSVG(speaker='NORA'){
  if(!EDITION.mainCast[speaker])throw new Error('Unknown approved presenter');
  if(CHANNEL_MARK_COUNT!==1||EDITION.logoPlacement!=='top-left-only'||EDITION.backgroundLogo)throw new Error('More than one mark is prohibited');
  const src=EDITION.marketSnapshot,person=EDITION.mainCast[speaker];
  let svg='<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">';
  svg+='<defs><linearGradient id="bg" x2="0" y2="1"><stop stop-color="#091d33"/><stop offset="1" stop-color="#041021"/></linearGradient><linearGradient id="glass" x2="1" y2=".2"><stop stop-color="#112e4b"/><stop offset="1" stop-color="#07182c"/></linearGradient></defs>';
  svg+=rect(0,0,1920,1080,'url(#bg)');
  // Layered trading floor texture and architecture; no branding on scenery.
  for(let i=0;i<9;i++)svg+=rect(i*231,110,2,740,'#233d59','opacity=".38"');
  for(let i=0;i<18;i++){
    const x=i*114+10,hei=45+(i*17)%70;
    svg+=rect(x,700-hei,64,hei,i%2?'#142b42':'#0d273d','opacity=".4"');
    svg+=rect(x+6,700-hei+6,45,9,'#235575','opacity=".4"');
  }
  svg+=rect(0,0,1920,107,'#041020')+rect(0,106,1920,3,'#2dc8e7');
  // Original T logo is placed ONCE, inside the upper-left on-air bug.
  svg+='<image href="'+T_SYMBOL_DATA_URI+'" x="44" y="26" width="48" height="61"/>';
  svg+=t(104,67,'Stocks',38,'#ffffff','font-family="Arial, sans-serif" font-weight="700"');
  svg+=t(1835,62,'MON 12 OCT 2026',19,'#bbd0e5','font-family="Arial, sans-serif" text-anchor="end"');
  svg+=rect(61,155,1195,640,'#051321','rx="4" stroke="#2d5577" stroke-width="3"');
  svg+=t(86,479,'PRESENTER SOURCE VIDEO',26,'#708da6','font-family="Arial" letter-spacing="3"');
  svg+=rect(1269,155,591,640,'url(#glass)','rx="4" stroke="#245178" stroke-width="2"');
  svg+=rect(1292,182,7,39,'#17c8e8')+t(1320,210,'WALL STREET SNAPSHOT',26,'#fff','font-family="Arial" font-weight="700"');
  svg+=t(1320,255,'REUTERS · 09:40 ET · OCT 12',18,'#a9c2d5','font-family="Arial"');
  src.indexes.forEach((s,i)=>{
    const y=328+i*130,pct=s.changePct,abs=Math.abs(pct),w=Math.max(7,Math.min(192,abs*730));
    svg+=t(1320,y,s.name.toUpperCase(),21,'#b9d3e7','font-family="Arial"');
    svg+=t(1830,y,fmt(s.value),27,'#fff','font-family="Arial" font-weight="700" text-anchor="end"');
    svg+=rect(1320,y+25,260,8,'#263d53','rx="3"');
    svg+=rect(pct>=0?1320:1570-w,y+25,w,8,pct>=0?'#29d3ae':'#f06a78','rx="3"');
    svg+=t(1320,y+69,(pct>=0?'+':'')+fmt(pct)+'%',35,pct>=0?'#32e2b7':'#f07785','font-family="Arial" font-weight="700"');
  });
  const scene=SHOTS.find(s=>s.id===(speaker==='NORA'?15:16));
  svg+=rect(61,812,1800,115,'#edf3f7');
  svg+=rect(61,812,8,115,'#1cbbec');
  svg+=t(91,863,'OIL · BANK EARNINGS · INFLATION',38,'#0d2841','font-family="Arial" font-weight="700"');
  svg+=t(93,901,speaker==='NORA'?'WALL STREET FACES A BUSY WEEK':'WHAT TO WATCH NEXT',20,'#375875','font-family="Arial"');
  svg+=rect(61,938,1800,82,'#051220');
  svg+=t(91,974,person.onAirName.toUpperCase(),27,'#ffffff','font-family="Arial" font-weight="700"');
  svg+=t(91,1005,person.role.toUpperCase(),18,'#90b6cf','font-family="Arial"');
  svg+=t(1840,985,'REPORTED MARKET SNAPSHOT · NOT A STREAMING QUOTE',17,'#b4cbd9','font-family="Arial" text-anchor="end"');
  svg+='</svg>';
  return svg;
}
