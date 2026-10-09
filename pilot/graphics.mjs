import sharp from 'sharp';
import {readFile} from 'node:fs/promises';

const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const text = (x,y,t,size=28,color='#eeeae2',extra='') => `<text x="${x}" y="${y}" fill="${color}" font-family="DejaVu Sans" font-size="${size}" ${extra}>${esc(t)}</text>`;
function wrap(value,width) {
  const lines=[''];for(const word of value.split(' ')){let n=lines.length-1;if((lines[n]+' '+word).length>width) lines.push(word);else lines[n]+=(lines[n]?' ':'')+word;} return lines;
}
export function frameSVG(episode,shot,{fixture=false}={}) {
  const ident=shot.layout==='ident';const graphic=shot.layout==='graphic';
  let art=`<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"><defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#12293b"/><stop offset=".5" stop-color="#0b1523"/><stop offset="1" stop-color="#16243a"/></linearGradient><linearGradient id="glass"><stop stop-color="#1e3749"/><stop offset="1" stop-color="#132436"/></linearGradient></defs><rect width="1920" height="1080" fill="url(#bg)"/>`;
  for(let i=0;i<10;i++) art+=`<path d="M${920+i*90} 0 L${420+i*140} 910" stroke="#294456" stroke-width="1" opacity=".32"/>`;
  art+=`<rect x="0" y="0" width="1920" height="8" fill="#60d4c0"/>`;
  art+=text(96,93,'S I G N A L',36,'#f6f2e9','font-weight="bold"')+text(374,92,'/   FINANCIAL NETWORK',18,'#849cac');
  art+=text(1824,90,fixture?'FIXTURE REHEARSAL':'PREPARED PROGRAMME',19,fixture?'#ecc98d':'#68d8c6','text-anchor="end" letter-spacing="3"');
  art+=`<line x1="96" y1="124" x2="1824" y2="124" stroke="#34505e"/>`;
  if(ident) {
    art+=text(98,295,'THE BRIEF / 001',25,'#6cddc8','letter-spacing="5"');
    art+=text(89,449,'The bigger',116,'#f3efe6')+text(89,579,'picture.',116,'#f3efe6');
    art+=text(100,676,'Markets move. Context matters.',35,'#a9bfcc');
    for(let i=0;i<5;i++) art+=`<circle cx="1530" cy="510" r="${110+i*55}" fill="none" stroke="${i===0?'#67d9c6':'#39576a'}" stroke-width="${i===0?3:1}"/><path d="M1310 600 L1420 540 L1520 580 L1625 430 L1745 363" fill="none" stroke="#64d9c5" stroke-width="4"/>`;
    art+=text(100,788,'MAYA  /  ANCHOR',22,'#b5c5cc')+text(535,788,'DANIEL  /  MARKETS ANALYST',22,'#b5c5cc');
  } else {
    art+=text(96,180,shot.segment,20,'#66dac5','letter-spacing="4"');
    if(!graphic) {
      art+=`<rect x="96" y="212" width="960" height="600" rx="3" fill="url(#glass)" stroke="#385364"/>`;
      if(fixture) {
        art+=`<circle cx="576" cy="428" r="84" fill="#2b4b5c"/><path d="M408 661 Q408 532 576 532 Q744 532 744 661" fill="#2b4b5c"/>`;
        art+=text(576,720,episode.presenters[shot.speaker].name,40,'#edf2ed','text-anchor="middle"')+text(576,762,'MOVING PRESENTER FOOTAGE PENDING',18,'#91afbd','text-anchor="middle" letter-spacing="2"');
      }
      art+=text(1120,246,'IN FOCUS',19,'#809faa','letter-spacing="3"');
      const lines=wrap(shot.headline,28);lines.forEach((l,i)=>art+=text(1120,301+i*43,l,36));
      shot.cards.forEach((card,i)=>{const y=400+i*126;art+=`<line x1="1120" y1="${y-30}" x2="1824" y2="${y-30}" stroke="#34505e"/>`+text(1120,y,card.label,18,'#91aeba','letter-spacing="2"')+text(1120,y+56,card.value,card.value.length>22?28:42,'#6fdec8');});
    } else {
      art+=text(96,291,shot.headline,56);
      if(shot.chart){
        const c=shot.chart;for(const tick of [0,c.max/2,c.max]){const y=715-tick/c.max*270;art+=`<line x1="155" y1="${y}" x2="1824" y2="${y}" stroke="#365366"/>`+text(134,y+7,String(tick),18,'#89a6b6','text-anchor="end"');}
        c.series.forEach((point,i)=>{const x=245+i*525,height=point.value/c.max*270;art+=text(x+165,394,point.label,21,'#a7c0ca','text-anchor="middle"')+`<rect x="${x}" y="${715-height}" width="330" height="${height}" fill="${i===1?'#3e7784':'#5fae9a'}"/>`+text(x+165,715-height+60,String(point.value),48,'#eff8ee','text-anchor="middle"');});
      }else shot.cards.forEach((card,i)=> {const x=96+i*584;art+=`<rect x="${x}" y="389" width="550" height="310" fill="url(#glass)" stroke="#385364"/>`+text(x+36,454,card.label,22,'#a1b8c3')+text(x+36,588,card.value,card.value.length>12?38:76,'#78e0ca');if(i<2)art+=text(x+553,567,'›',44,'#86a5b3');});
      art+=text(100,781,'ILLUSTRATIVE EXAMPLE  /  NOT LIVE MARKET DATA',21,'#97aeba','letter-spacing="2"');
    }
  }
  if(shot.layout==='split')for(const [role,x] of [[shot.speaker,96],[shot.listener,984]]){
    art+=`<rect x="${x}" y="212" width="840" height="600" fill="url(#glass)" stroke="#385364"/>`;
    if(fixture)art+=text(x+420,482,episode.presenters[role].name,56,'#edf2ed','text-anchor="middle"')+text(x+420,548,role===shot.speaker?'SPEAKING TAKE PENDING':'LISTENING TAKE PENDING',21,'#91afbd','text-anchor="middle"');
  }
  art+=`<rect x="0" y="870" width="1920" height="142" fill="#eae7df"/><rect x="0" y="870" width="15" height="142" fill="#68d6c3"/>`;
  art+=text(96,916,shot.speaker?`${episode.presenters[shot.speaker].name.toUpperCase()}  /  ${episode.presenters[shot.speaker].role.toUpperCase()}`:'SIGNAL  /  THE BRIEF',19,'#476473','letter-spacing="2"');
  art+=text(96,973,shot.headline,39,'#142638');
  art+=text(96,1054,'AI PRESENTERS  •  ILLUSTRATIVE DATA  •  PREPARED PILOT',19,'#9bb1be','letter-spacing="2"');
  art+=text(1824,1054,fixture?'SILENT TEST MEDIA • NOT FOR APPROVAL':'SIGNAL / THE BIGGER PICTURE',18,fixture?'#ecc98d':'#9bb1be','text-anchor="end"');
  return art+'</svg>';
}
export async function renderFrame(episode,shot,file,options) {
  let frame=sharp(Buffer.from(frameSVG(episode,shot,options)));
  if(options?.illustration && shot.layout==='ident'){
    const art=await sharp(await readFile(options.illustration)).resize(700,480,{fit:'cover'}).png().toBuffer();
    frame=frame.composite([{input:art,left:1100,top:290}]);
  }
  await frame.png().toFile(file);
}
export async function renderCue(label,file) {
  await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1728" height="44"><rect width="1728" height="44" fill="#0b1523"/>${text(16,30,label,21,'#8edecd')}</svg>`)).png().toFile(file);
}
