/** Pixel-precise, source-attributed TV news graphics for SIGNAL MARKET WATCH R4.
 * Unlike the previous paired info-cards, each reported story has its own contrast and hierarchy.
 * Pure SVG: no API requests, no media purchases.
 */
import sharp from 'sharp';
import {mkdir} from 'node:fs/promises';
import {SHOW,CAST,SOURCES} from './newsroom-r4-plan.mjs';
const W=1920,H=1080;
const C={night:'#0B1725',ink:'#102335',slate:'#1A2D3D',paper:'#F6F8F6',cream:'#FFF7E8',mint:'#00A99C',mintLight:'#DDF5EF',white:'#FFFFFF',grey:'#587083',soft:'#AEC2D0',gold:'#E3AF5A',orange:'#DF8153',coral:'#C85B53',purple:'#625F99',lavender:'#EAE7F3',ice:'#E7F1F5'};
const s=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const tx=(x,y,value,size=26,fill=C.ink,opts='')=>`<text x="${Math.round(x)}" y="${Math.round(y)}" font-family="DejaVu Sans,Arial,sans-serif" font-size="${size}" fill="${fill}" ${opts}>${s(value)}</text>`;
const r=(x,y,w,h,fill,opts='')=>`<rect x="${Math.round(x)}" y="${Math.round(y)}" width="${Math.round(w)}" height="${Math.round(h)}" fill="${fill}" ${opts}/>`;
const ln=(x1,y1,x2,y2,col,width=2,opts='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="${width}" ${opts}/>`;
const cap=x=>Math.max(0,Math.min(1,x));
const ease=x=>{let u=cap(x);return u*u*(3-2*u)};
const colorOf=scene=>({gold:C.gold,mint:C.mint,purple:C.purple,amber:C.orange,coral:C.coral}[scene.accent]||C.mint);
const lineClamp=(txt,chars=54)=>{
 const words=txt.trim().split(/\s+/),out=[''];
 for(const word of words){const last=out.length-1;if((out[last]+' '+word).trim().length>chars&&out[last])out.push(word);else out[last]=(out[last]+' '+word).trim();}
 return out;
};
function marker(x,y,str,{fg=C.ink,bg=C.mintLight,width=null}={}){
 const w=width||Math.max(116,str.length*12+26);
 return r(x,y,w,37,bg,'rx="3"')+tx(x+14,y+26,str,17,fg,'font-weight="700" letter-spacing=".8"');
}
function masthead(scene,time,sec){
 const accent=colorOf(scene),w=1920;
 let out=r(0,0,w,114,C.night)+r(0,0,10,114,accent)+r(0,109,1920,5,accent);
 out+=tx(43,77,'SIGNAL',52,C.white,'font-weight="800" letter-spacing="7"');
 out+=tx(329,76,'MARKET WATCH',27,'#DDE6EB','font-weight="700" letter-spacing="3"');
 out+=tx(1222,74,'MONDAY  ·  12 OCT 2026',22,'#DBE1E5','font-weight="600" letter-spacing="1.1"');
 out+=r(1680,35,194,43,'#29424E','rx="5"')+tx(1700,63,'NEWS BULLETIN',16,'#F3FFFD','font-weight="700" letter-spacing=".5"');
 out+=r(0,109,1920*Math.min(1,time/200),5,C.gold);
 return out;
}
function mainHeading(scene){
 const dark=['rates','watchlist'].includes(scene.layout);
 const ink=dark?C.white:C.ink,secondary=dark?'#B6CADA':C.grey;
 let out=tx(64,160,scene.eyebrow,20,dark?'#F5C77E':colorOf(scene),'font-weight="800" letter-spacing="2.2"');
 const lines=lineClamp(scene.headline,scene.headline.length>39?38:44);
 lines.slice(0,2).forEach((line,i)=>out+=tx(60,219+i*46,line,36,ink,'font-weight="800" letter-spacing="-.6"'));
 out+=tx(64,271+(lines.length>1?29:0),scene.sub,19,secondary,'font-weight="600" letter-spacing="1.2"');
 return out;
}
function cite(source,x,y,opts={}){
 const col=opts.dark?'#E2EAF0':C.grey;
 return tx(x,y,`${source.source} · ${source.date} · ${source.status}`,15,col,'font-weight="650" letter-spacing=".2"');
}
function stat(source,{x=0,y=0,w=600,h=250,bg=C.white,accent=C.mint,big=64,dark=false}={}){
 let o=r(x,y,w,h,bg,'rx="11"')+r(x,y,8,h,accent);
 const fg=dark?C.white:C.ink,sub=dark?'#BBC8D3':C.grey;
 o+=tx(x+33,y+54,source.label,19,sub,'font-weight="800" letter-spacing=".8"');
 o+=tx(x+29,y+146,source.value,big,fg,'font-weight="800" letter-spacing="-1.6"');
 o+=cite(source,x+32,y+h-21,{dark});
 return o;
}
function panelHeader(scene){return tx(900,337,scene.eyebrow,22,'#0A796F','font-weight="800" letter-spacing="1.3"');}
function presenterFrame(scene,t){
 const a=colorOf(scene);let o=r(47,309,794,504,'#1A3245','rx="9"')+r(47,309,794,6,a)+r(47,730,794,83,C.night);
 const person=CAST[scene.role];
 o+=tx(82,770,person.name.toUpperCase(),29,C.white,'font-weight="800" letter-spacing=".4"');
 o+=tx(82,798,person.role,16,'#D3E0E5','font-weight="700" letter-spacing="1.1"');
 o+=r(48,308,793,421,'#152B3B','opacity=".11"');
 return o;
}
function panelRect(bg=C.paper){return r(876,308,994,505,bg,'rx="10"');}
function getNewsSource(scene,i=0){return SOURCES[scene.sourceIds?.[i]||'BRENT'];}
function storyCard(scene,t){
 const phase=ease(t*2.4);let o='';
 switch(scene.layout){
  case 'top-story':{
    o+=panelRect(C.white);
    const stories=[['01','GLOBAL MARKETS','CAUTIOUSLY HIGHER',C.mint],['02','WALL STREET','BANK EARNINGS AHEAD',C.purple],['03','INFLATION','CPI DUE WEDNESDAY',C.orange]];
    stories.forEach(([num,a,b,col],i)=>{const y=347+i*149,alpha=ease(t*1.8-i*.11);
      o+=r(904+(1-alpha)*60,y,941,128,i===1?'#F5F1F9':i===2?'#FFF1E8':'#ECF8F4','rx="5"')+r(904+(1-alpha)*60,y,9,128,col);
      o+=tx(937+(1-alpha)*60,y+46,num,29,col,'font-weight="800"')+tx(1008+(1-alpha)*60,y+46,a,20,C.grey,'font-weight="700" letter-spacing=".7"');
      o+=tx(1004+(1-alpha)*60,y+97,b,32,C.ink,'font-weight="800"');
    });break;
  }
  case 'market-moves':{
    o+=panelRect(C.night);
    o+=tx(915,373,'OIL MARKETS · REUTERS',23,'#D2DCE2','font-weight="700"');
    o+=tx(905,519,'$104.37',102,C.gold,'font-weight="800" letter-spacing="-4"');
    o+=tx(914,568,'BRENT CRUDE / REPORTED OCT 12',22,C.white,'font-weight="650"');
    o+=r(912,604,908,1,'#4B697A')+marker(909,634,'OIL PULLED BACK',{bg:'#203E46',fg:'#DAF5EF',width:270});
    o+=tx(915,720,'ASIAN MARKETS MIXED  ·  US FUTURES UP',22,'#D3DEE4','font-weight="700"');
    o+=cite(SOURCES.BRENT,916,785,{dark:true});break;
  }
  case 'earnings':{
    o+=panelRect('#FBFAF6');
    o+=tx(917,365,'EARNINGS WEEK / RESULTS NOT YET RELEASED',19,C.grey,'font-weight="800"');
    o+=tx(911,465,'BIG BANKS',66,C.ink,'font-weight="800"');
    const firms=['JPMORGAN','CITIGROUP','GOLDMAN SACHS'];
    firms.forEach((q,i)=>{const y=514+i*76,fade=ease(t*1.8-i*.12);
      o+=r(917,y,885,64,i%2?'#EBECF7':'#E2F0EA','rx="4"')+r(917,y,7,64,i%2?C.purple:C.mint);
      o+=tx(948+36*(1-fade),y+44,q,28,C.ink,'font-weight="800"');
      o+=tx(1695,y+44,'DUE',22,C.grey,'font-weight="700"');
    });o+=cite(SOURCES.BANKS,921,786);break;
  }
  case 'rates':{
    o+=panelRect('#162333');
    o+=tx(917,366,'FINANCING AND VALUATIONS',20,'#ACBFCC','font-weight="800"');
    o+=tx(908,483,'3.75–4.00%',73,'#F4BE6A','font-weight="800"');
    o+=tx(917,527,'FED FUNDS TARGET RANGE / SEP 16',19,'#D1DEE7','font-weight="700"');
    o+=r(921,562,880,3,'#2D495B');
    o+=tx(913,673,'~5.24%',75,'#FBFDFC','font-weight="800"');
    o+=tx(919,713,'10Y US YIELD / REUTERS OCT 9',19,'#D1DEE7','font-weight="700"');
    o+=cite(SOURCES.YIELD,923,786,{dark:true});break;
  }
  case 'energy':{
    o+=panelRect(C.cream)+r(876,308,994,9,C.coral);
    o+=tx(915,367,'BRENT CRUDE · REUTERS REPORTED',20,'#7E6155','font-weight="800"');
    o+=tx(911,518,'$104.37',101,C.ink,'font-weight="800" letter-spacing="-3"');
    o+=tx(920,565,'PER BARREL · REPORTED OCT 12',22,C.grey,'font-weight="700"');
    o+=r(918,602,903,3,'#E1C5A6');
    o+=marker(920,643,'EASED MONDAY',{bg:'#FCE2D8',fg:'#9C4835',width:260});
    o+=tx(919,735,'ENERGY COSTS STILL ELEVATED',24,C.ink,'font-weight="800"');
    o+=cite(SOURCES.BRENT,923,785);break;
  }
  case 'inflation':{
    o+=panelRect('#F6F3EB');
    o+=r(907,340,304,371,C.night,'rx="5"');
    o+=tx(946,411,'OCT',35,C.gold,'font-weight="800"');
    o+=tx(934,560,'14',133,C.white,'font-weight="800"');
    o+=tx(943,629,'WEDNESDAY',22,'#DFE6E8','font-weight="700"');
    o+=tx(1250,407,'US CPI RELEASE',34,C.ink,'font-weight="800"');
    o+=tx(1250,454,'8:30 AM ET  /  US BLS',23,C.grey,'font-weight="700"');
    o+=r(1248,486,570,2,'#D9CBAE');
    o+=tx(1244,588,'3.7%',73,C.purple,'font-weight="800"');
    o+=tx(1250,635,'REUTERS HEADLINE FORECAST',18,C.grey,'font-weight="700"');
    o+=marker(1250,670,'NOT YET PUBLISHED',{bg:'#F8E6D6',fg:'#8E5334',width:330});
    o+=cite(SOURCES.CPI,1252,783);break;
  }
  case 'calendar':{
    o+=panelRect('#F4F5FA');
    o+=tx(915,369,'GLOBAL ECONOMIC CALENDAR',20,C.grey,'font-weight="800"');
    o+=r(916,412,890,158,C.purple,'rx="8"')+tx(947,460,'TUE 13 OCT',27,C.white,'font-weight="800"');
    o+=tx(946,521,'IMF WORLD ECONOMIC OUTLOOK',27,C.white,'font-weight="700"');
    o+=r(916,589,890,153,C.white,'rx="8"')+r(916,589,8,153,C.gold);
    o+=tx(950,640,'WED 14 OCT',27,C.ink,'font-weight="800"');
    o+=tx(949,706,'SEPTEMBER US INFLATION',27,C.ink,'font-weight="700"');
    o+=cite(SOURCES.IMF,924,781);break;
  }
  case 'watchlist':{
    o+=panelRect('#141F2E');
    o+=tx(921,368,'MARKET WATCH · THE NEXT 48 HOURS',22,'#C1CED8','font-weight="800"');
    const watch=[['01','BANKS','LOAN LOSSES & GUIDANCE'],['02','CPI','ACTUAL DATA VS FORECAST'],['03','OIL','ABOVE $100 / BBL']];
    watch.forEach(([no,key,v],i)=>{const y=411+i*120,progress=ease(t*2.1-i*.14);
      o+=r(924,y,870,103,i%2?'#243342':'#1D2C3B','rx="6"')+r(924,y,8,103,[C.mint,C.gold,C.coral][i]);
      o+=tx(945+20*(1-progress),y+48,no,31,C.gold,'font-weight="800"');
      o+=tx(1020+20*(1-progress),y+40,key,19,'#BCD1DB','font-weight="700"');
      o+=tx(1018+20*(1-progress),y+81,v,28,C.white,'font-weight="800"');
    });break;
  }
  case 'signoff':{
    o+=panelRect(C.night)+r(876,308,994,8,C.gold);
    o+=tx(919,397,'SIGNAL MARKET WATCH',32,C.gold,'font-weight="800" letter-spacing="2"');
    o+=tx(912,508,'THANK YOU',73,C.white,'font-weight="800"');
    o+=tx(914,587,'FOR WATCHING.',58,C.white,'font-weight="800"');
    o+=r(921,625,883,2,'#36576A');
    o+=tx(919,688,'LIZA  ·  LASSE',29,'#CBD9DE','font-weight="700"');
    o+=tx(921,746,'SEE YOU AT THE NEXT UPDATE',24,'#E3B76A','font-weight="700"');
    break;
  }
  default:o+=panelRect(C.white)+panelHeader(scene)+stat(getNewsSource(scene),{x:919,y:415,w:876,h:280,accent:colorOf(scene)});
 }
 return o;
}
function newscastCaption(scene,t,speechDuration){
 // Dedicated subtitle zone, beneath video and story. Do not compete with the headline cards.
 if(scene.kind!=='speaker'||speechDuration<=0||t>speechDuration)return '';
 const words=scene.script.trim().split(/\s+/),chunkSize=10,n=Math.ceil(words.length/chunkSize),i=Math.min(n-1,Math.floor(t/speechDuration*n));
 const line=words.slice(i*chunkSize,(i+1)*chunkSize).join(' '),lens=lineClamp(line,79);
 let y=915;
 let out=r(67,867,1790,116,'#162636','rx="6"')+r(67,867,6,116,C.gold);
 lens.slice(0,2).forEach((item,j)=>out+=tx(99,y+40*j,item,25,'#FCFFFF','font-weight="600"'));
 return out;
}
function newsTicker(globalT){
 const items=[['BRENT',SOURCES.BRENT.value],['US 10Y',SOURCES.YIELD.value],['FED RANGE',SOURCES.FED.value],['CPI DUE',SOURCES.CPI.value],['IMF WEO',SOURCES.IMF.value]];
 let out=r(0,997,1920,83,C.night)+r(0,997,232,83,C.gold)+tx(29,1050,'MARKET WATCH',21,C.night,'font-weight="800"');
 out+='<g clip-path="url(#scrollClip)">';
 const span=2050,offset=(globalT*130)%span;
 for(let k=0;k<3;k++)items.forEach(([key,value],i)=>{const xx=257+k*span+i*412-offset;
  out+=tx(xx,1051,key,19,'#C2D1D9','font-weight="650"')+tx(xx+140,1050,value,22,C.white,'font-weight="800"');});
 return out+'</g>';
}
function titleFrame(scene,t){
 const col=scene.kind==='end'?C.night:'#151F2B',text=scene.kind==='end'?C.white:C.white;
 let o=r(0,114,1920,883,col)+r(0,114,1920,8,C.gold);
 for(let i=0;i<10;i++){const x=180+i*197+(t*32)%310;o+=ln(x,115,x-350,866,'#34495B',2,'opacity=".22"');}
 o+=marker(72,239,scene.eyebrow,{bg:'#30414D',fg:C.gold,width:410});
 const h=scene.kind==='ident'?['SIGNAL','MARKET WATCH']:['MARKET','WATCH'];
 h.forEach((str,i)=>o+=tx(73+40*(1-ease(t*1.5)),418+i*142,str,scene.kind==='ident'?117:125,text,'font-weight="800" letter-spacing="-1.6"'));
 o+=r(77,728,760*ease(t),6,C.gold)+tx(78,782,scene.sub,30,'#D6E4E9','font-weight="700" letter-spacing="1.5"');
 o+=tx(75,830,scene.kind==='ident'?'TODAY: OIL  ·  BANK EARNINGS  ·  US INFLATION':'MONDAY 12 OCT 2026',22,C.gold,'font-weight="700"');
 return o;
}
export function renderFrame(scene,time=0,duration=20,{globalSeconds=0,audioDuration=18,includePresenterWindow=true}={}){
 if(!scene||!SHOW.scenes.some(x=>x.id===scene.id))throw Error('Unknown locked broadcast segment');
 let out=`<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"><defs><clipPath id="scrollClip"><rect x="240" y="997" width="1680" height="83"/></clipPath><clipPath id="photoClip"><rect x="58" y="322" width="772" height="405" rx="8"/></clipPath></defs>`;
 const stageColor={rates:'#1B2939',watchlist:'#172636',energy:'#FFF4E1',inflation:'#E4F0EB',calendar:'#EFF0FA',earnings:'#F5F5F0'}[scene.layout]||C.paper;
 out+=r(0,0,W,H,stageColor)+masthead(scene,globalSeconds,duration);
 if(scene.kind==='ident'||scene.kind==='end')out+=titleFrame(scene,time);
 else{
  out+=mainHeading(scene);
  out+=panelRect(C.white);
  out+=storyCard(scene,time/Math.max(4,duration));
  if(includePresenterWindow)out+=presenterFrame(scene,time);
  out+=newscastCaption(scene,time,audioDuration);
  if(scene.kind==='speaker'&&scene.sourceIds?.length)out+=tx(1620,831,'SOURCE: '+getNewsSource(scene).source+' / '+getNewsSource(scene).date,16,['rates','watchlist'].includes(scene.layout)?'#C9D6E0':C.grey,'text-anchor="end" font-weight="650"');
 }
 out+=newsTicker(globalSeconds);
 return out+'</svg>';
}
export async function exportFrame(scene,t=5,{dest,globalSeconds=0}={}){
 const s=renderFrame(scene,t,scene.duration,{globalSeconds,audioDuration:scene.duration});
 return sharp(Buffer.from(s)).png().toFile(dest);
}
export async function previewContactSheet(dest='/mnt/data/signal_r4/NEWSROOM-R4-contact-sheet.png'){
 const scenes=SHOW.scenes.slice(0,-1),images=[];await mkdir('/mnt/data/signal_r4/previews',{recursive:true});
 for(let i=0;i<scenes.length;i++){
  const scene=scenes[i],png=await sharp(Buffer.from(renderFrame(scene,Math.min(scene.duration/2,8),scene.duration,{globalSeconds:i*18,audioDuration:scene.duration}))).resize(710,400).png().toBuffer();
  images.push({input:png,left:15+(i%2)*728,top:15+Math.floor(i/2)*418});
 }
 const height=15+Math.ceil(scenes.length/2)*418;
 await sharp({create:{width:1460,height,channels:3,background:C.night}}).composite(images).png().toFile(dest);
 return {dest,scenes:scenes.length,width:1460,height};
}
if(process.argv[1]?.endsWith('newsroom-r4-graphics.mjs')){
 const output=await previewContactSheet();console.log(JSON.stringify(output));
}