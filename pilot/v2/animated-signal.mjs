/** Premium animated 1080p graphical compositor for Signal demo.
 * Pure deterministic visuals. Simulated series only, never live data.
 * Executed by the trusted GitHub media worker. No paid service calls.
 */
import {once} from 'node:events';
import {spawn} from 'node:child_process';
import sharp from 'sharp';
import {programme,identity} from './demo-master-plan.mjs';

const W=1920,H=1080;
const P={navy:'#081728',night:'#09111E',muted:'#7E92A7',light:'#F5F7F8',paper:'#FAFAF8',cream:'#FBF7EF',teal:'#2ABBAE',ice:'#E9F5F5',gold:'#E1B66E',up:'#168B77',down:'#CD5669',ink:'#102137',slate:'#243D55',grey:'#667A8C'};
const ESC=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const txt=(x,y,value,size=28,color=P.ink,opts='')=>`<text x="${Math.round(x)}" y="${Math.round(y)}" fill="${color}" font-family="DejaVu Sans, Arial, sans-serif" font-size="${size}" ${opts}>${ESC(value)}</text>`;
const box=(x,y,w,h,fill,other='')=>`<rect x="${Math.round(x)}" y="${Math.round(y)}" width="${Math.round(w)}" height="${Math.round(h)}" fill="${fill}" ${other}/>`;
const line=(x1,y1,x2,y2,color='#CAD5DC',width=1,other='')=>`<path d="M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="${color}" stroke-width="${width}" fill="none" ${other}/>`;
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const ease=t=>{t=clamp(t);return t*t*(3-2*t);};
const fmt=n=>n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const WORDS=`<!-- All values simulated and fixed by code; not financial quotes -->`;

export const simulated=Array.from({length:52},(_,i)=>{
  const s=Math.sin(i*.35)*1.3+Math.sin(i*.9)*.6;
  const trend=i*.115, base=112.519+trend+s+Math.cos(i*.17)*.5;
  const open=base-.28*Math.sin(i*.83),close=base+.35*Math.cos(i*.74),hi=Math.max(open,close)+.22+Math.abs(Math.sin(i))*.28,
  lo=Math.min(open,close)-.19-Math.abs(Math.cos(i*.6))*.29;
  const volume=180+Math.round(72*Math.abs(Math.sin(i*.63))+37*Math.abs(Math.sin(i*.22+2)));
  return {open,close,high:hi,low:lo,volume};
});
function movingAverage(period=12){return simulated.map((_,i)=>i<period-1?null:simulated.slice(i-period+1,i+1).reduce((s,c)=>s+c.close,0)/period);}
const sma=movingAverage(12);
function rsi(values,period=14){let gain=0,loss=0;return values.map((v,i)=>{if(!i)return null;const d=v-values[i-1];if(i<=period){gain+=Math.max(0,d)/period;loss+=Math.max(0,-d)/period;}else{gain=(gain*(period-1)+Math.max(0,d))/period;loss=(loss*(period-1)+Math.max(0,-d))/period;}return i<period?null:loss===0?100:100-100/(1+gain/loss);});}
const rsiValues=rsi(simulated.map(c=>c.close));
function ema(values,period){let val=null;const a=2/(period+1);return values.map((v,i)=>{if(i<period-1)return null;val=val===null?values.slice(0,period).reduce((x,y)=>x+y,0)/period:val+a*(v-val);return val;});}
const closePrices=simulated.map(x=>x.close);
const fast=ema(closePrices,12),slow=ema(closePrices,26),macd=fast.map((v,i)=>v!==null&&slow[i]!==null?v-slow[i]:null);
const macdV=macd.filter(v=>v!==null),signalV=ema(macdV,9);let sigIdx=0;const signal=macd.map(v=>v===null?null:signalV[sigIdx++]);

function priceChart({x,y,w,h,t,mode='candles',light=true,label='SIMULATED PRICE · 5 MINUTES'}){
  const N=simulated.length;let progress=clamp((t-.12)/.87),visible=Math.max(3,Math.round(N*progress)),top=y+56,bottom=y+h*.70,margin=52,left=x+margin,right=x+w-53;
  const min=Math.min(...simulated.map(c=>c.low))-.25,max=Math.max(...simulated.map(c=>c.high))+.25;
  const xx=i=>left+(i+.5)*(right-left)/N, yy=p=>bottom-(p-min)/(max-min)*(bottom-top),cw=(right-left)/N*.61;
  let out=box(x,y,w,h,light?P.paper:'#11283C','rx="18"')+txt(x+35,y+35,label,17,light?P.grey:P.ice,'font-weight="700" letter-spacing="1.5"');
  for(let k=0;k<=4;k++){const gy=top+k*(bottom-top)/4;out+=line(left,gy,right,gy,light?'#D9E4E7':'#31506A',1)+txt(right+9,gy+5,fmt(max-(max-min)*k/4),13,light?P.grey:'#B0C6D5');}
  for(let i=0;i<visible;i++){
    const q=simulated[i],isUp=q.close>=q.open,color=isUp?P.up:P.down,cx=xx(i),open=yy(q.open),close=yy(q.close);
    out+=line(cx,yy(q.high),cx,yy(q.low),color,1.9);
    out+=box(cx-cw/2,Math.min(open,close),cw,Math.max(2,Math.abs(close-open)),color,'rx="1"');
  }
  if(mode!=='plain'){
    const vY=y+h*.87,barSpace=(right-left)/N, maxV=Math.max(...simulated.map(q=>q.volume));
    for(let i=0;i<visible;i++){
      const q=simulated[i],height=clamp(q.volume/maxV)*h*.12;
      out+=box(xx(i)-barSpace*.3,vY-height,barSpace*.6,height,q.close>=q.open?P.up:P.down,'opacity=".48"');
    }
    out+=txt(left,y+h-11,'VOLUME / ACTIVITY',14,light?P.grey:'#BDD1DC','letter-spacing="1"');
  }
  if(['candles','moving-average','volume'].includes(mode)){
    let pts=[];for(let i=0;i<visible;i++)if(sma[i]!=null)pts.push((pts.length?'L':'M')+xx(i).toFixed(1)+' '+yy(sma[i]).toFixed(1));
    out+=`<path d="${pts.join(' ')}" fill="none" stroke="${P.gold}" stroke-width="4" stroke-linecap="round"/>`;
    out+=box(right-125,y+19,12,12,P.gold,'rx="2"')+txt(right-104,y+30,'SMA 12',14,light?P.grey:'#D2E1E9');
  }
  if(visible>3){const q=simulated[visible-1],cx=xx(visible-1),cy=yy(q.close);
    out+=line(cx,top,cx,bottom,P.teal,1,'stroke-dasharray="5 7" opacity=".8"')+`<circle cx="${cx}" cy="${cy}" r="7" fill="${P.teal}" stroke="#fff" stroke-width="2"/>`;
    out+=box(Math.max(left,cx-84),cy-38,130,25,light?'#E6F6F2':'#1B5D62','rx="4"')+txt(Math.max(left,cx-80),cy-21,fmt(q.close)+' SIM.',12,light?P.ink:'#fff','font-weight="700"');
  }
  return out;
}
function volumeGraph(x,y,w,h,t){let s=box(x,y,w,h,P.paper,'rx="18"')+txt(x+28,y+40,'TRADING VOLUME',19,P.ink,'font-weight="700" letter-spacing="1"');let n=32,minX=x+30,space=(w-65)/n;
  for(let i=0;i<n;i++){
    const v=simulated[i+15].volume,desired=(v/300)*(h-105),d=clamp(t*2.1-i*.065),h2=desired*d;
    s+=box(minX+i*space,y+h-27-h2,space*.55,h2,i%6<3?P.up:P.teal,'rx="2"');
  }
  return s+txt(x+28,y+h-11,'SIMULATED • HISTORICAL CONTEXT',13,P.grey,'letter-spacing="1"');
}
function momentumGraph(x,y,w,h,t){
  let out=box(x,y,w,h,P.cream,'rx="18"')+txt(x+30,y+42,'MOMENTUM  /  RSI 14',21,P.ink,'font-weight="700"')+txt(x+w-30,y+42,'ILLUSTRATIVE',14,P.grey,'text-anchor="end"');
  const left=x+62,right=x+w-56,top=y+84,bottom=y+h-45;
  for(const level of [30,50,70]){const py=bottom-level/100*(bottom-top);out+=line(left,py,right,py,level===50?'#D4DCE1':'#DFC3B6',1,'stroke-dasharray="5 6"')+txt(x+14,py+5,String(level),16,P.grey);}
  const end=Math.min(simulated.length,Math.max(2,Math.round(simulated.length*clamp(t))));const pts=[];
  for(let i=0;i<end;i++)if(rsiValues[i]!=null){const xx=left+i*(right-left)/(simulated.length-1),yy=bottom-rsiValues[i]/100*(bottom-top);pts.push((pts.length?'L':'M')+xx.toFixed(1)+' '+yy.toFixed(1));}
  out+=`<path d="${pts.join(' ')}" fill="none" stroke="${P.teal}" stroke-width="5" stroke-linecap="round"/>`;
  return out;
}
function macdGraph(x,y,w,h,t){let out=box(x,y,w,h,P.paper,'rx="18"')+txt(x+28,y+38,'MACD 12 / 26 / 9',18,P.ink,'font-weight="700"');const left=x+43,right=x+w-33,cy=y+h*.58;
 const max=Math.max(.1,...macd.filter(n=>n!=null).map(Math.abs));const end=Math.min(52,Math.max(3,Math.round(52*clamp(t))));
 const py=v=>cy-v/max*h*.24,xx=i=>left+i*(right-left)/51;
 out+=line(left,cy,right,cy,'#CDDADE',1);
 for(const [vals,col] of [[macd,P.teal],[signal,P.gold]]){const pts=[];for(let i=0;i<end;i++)if(vals[i]!=null)pts.push((pts.length?'L':'M')+xx(i).toFixed(1)+' '+py(vals[i]).toFixed(1));out+=`<path d="${pts.join(' ')}" fill="none" stroke="${col}" stroke-width="3.5"/>`;}
 return out;
}
function badge(x,y,label,dark=false){const w=label.length*11+35;return box(x,y,w,35,dark?'#234A54':'#DEF2E9','rx="6"')+txt(x+16,y+24,label,16,dark?'#D5FFEC':P.ink,'font-weight="700" letter-spacing="1"');}
function ticker(globalTime){
 const labels=[['SIGNAL 500','117.84','+0.58%',P.up],['TECH 100','143.61','+0.91%',P.up],['INDUSTRIAL 30','168.22','−0.23%',P.down],['SMALL CAP','203.41','+0.37%',P.up]];
 let out=box(0,1004,W,76,'#0B1523')+box(0,1004,233,76,P.ink)+box(233,1004,7,76,P.gold)+txt(30,1052,'MARKET DEMO',21,'#F9F8F3','font-weight="700" letter-spacing="1.1"');
 out+='<clipPath id="tkclip"><rect x="251" y="1004" width="1656" height="74"/></clipPath><g clip-path="url(#tkclip)">';
 let dx=(globalTime*95)%2720;
 for(let copy=0;copy<3;copy++)labels.forEach(([name,val,pct,col],i)=>{
   let x=275+copy*2720+i*680-dx;
   out+=txt(x,1051,name,22,'#B9C9D2','font-weight="600"')+txt(x+236,1051,val,24,'#FAFDFF','font-weight="700"')+txt(x+390,1051,pct,22,col,'font-weight="700"');
 });
 return out+'</g>';
}
function masthead(globalTime){
 let out=box(0,0,W,151,P.navy)+box(0,0,W,7,P.teal);
 out+=txt(65,79,'SIGNAL',59,'#FFFFFF','font-weight="800" letter-spacing="10"');
 out+=box(337,40,2,48,'#477A82')+txt(365,70,'FINANCIAL NEWSROOM',23,'#D3E9EA','letter-spacing="2.3" font-weight="600"');
 out+=badge(1510,36,'AI-PRESENTED',true)+badge(1718,36,'DEMO DATA',true);
 out+=txt(66,125,'THE BIGGER PICTURE',20,'#6ED7C7','font-weight="600" letter-spacing="3"');
 out+=txt(1852,124,'PREPARED EDITORIAL • 1080P',16,'#AEC9CF','text-anchor="end" letter-spacing="1"');
 out+=box(0,146,clamp(globalTime/180)*W,5,P.gold);
 return out;
}
function captionText(scene,elapsed,audioDuration){
 if(scene.kind!=='speaker'||!(audioDuration>0)||elapsed>=audioDuration+.15)return null;
 const words=scene.script.trim().split(/\s+/);
 const count=10,n=Math.ceil(words.length/count),i=Math.min(n-1,Math.floor(elapsed/audioDuration*n));
 const chunk=words.slice(i*count,(i+1)*count).join(' ');
 return chunk.length>85?chunk.slice(0,85):chunk;
}
function lowerThird(scene,elapsed,audioDuration,globalTime){
 let out=box(0,859,W,145,P.paper)+box(0,859,16,145,P.teal);
 const role=scene.role?identity[scene.role]:null;
 out+=txt(70,906,scene.headline,38,P.ink,'font-weight="800" letter-spacing=".4"');
 out+=txt(72,947,scene.sub||'THE BIGGER PICTURE',21,P.grey,'font-weight="500"');
 out+=badge(1575,885,role?role.name.toUpperCase()+' / '+role.role.split(' ')[0]:'SIGNAL / EDITORIAL');
 out+=txt(70,988,programme.disclosure,13,'#5D7181','letter-spacing=".2"');
 const cap=captionText(scene,elapsed,audioDuration);
 if(cap){
  out+=box(65,809,Math.min(1790,Math.max(540,cap.length*19+70)),48,'#08192A','rx="8" opacity=".96"');
  out+=txt(89,842,cap,22,'#FBFDFD','font-weight="600"');
 }
 out+=ticker(globalTime);
 return out;
}
function faceBox(scene){
 let out=box(57,190,885,624,'#D0DFE1','rx="17"')+box(69,202,860,515,'#13344D','rx="11"');
 out+=box(69,717,860,84,'#11283C')+box(69,717,8,84,P.teal);
 const p=identity[scene.role];
 out+=txt(102,758,p.name.toUpperCase(),34,'#FFFFFF','font-weight="800" letter-spacing="1"');
 out+=txt(102,784,p.role,18,'#A8D2D6','font-weight="600" letter-spacing="1"');
 out+=txt(905,782,p.source.includes('Office 6')?'OFFICE 6':'OFFICE 3',14,'#BFD2D9','text-anchor="end" letter-spacing="2"');
 return out;
}
function narrativeCard(scene,progress){let out=box(968,189,890,629,P.cream,'rx="16"');
 out+=box(968,189,890,12,P.gold)+txt(1004,257,'THE BRIEF',19,P.grey,'font-weight="700" letter-spacing="2"');
 const mode=scene.layout;
 if(mode==='anchor'||mode==='anchor-close'||mode==='summary'){
   const msgs=mode==='anchor'?['READ THE','CONTEXT','NOT JUST','THE MOVE']:
     mode==='summary'?['SOURCE','TIMEFRAME','EVIDENCE','LIMITS']:['CONTEXT','IS THE','BIG PICTURE'];
   msgs.forEach((m,i)=>{const dx=(1-ease(progress*1.7-i*.09))*35;out+=txt(1004+dx,350+i*92,m,61,i===1?P.teal:P.ink,'font-weight="800" letter-spacing="-1"');});
   out+=line(1004,735,1806,735,P.gold,3);
 }else if(mode==='market-board'){
   const instruments=[['SIGNAL 500','117.84','+0.58%',P.up],['TECH 100','143.61','+0.91%',P.up],['INDUSTRIAL 30','168.22','−0.23%',P.down],['SMALL CAP','203.41','+0.37%',P.up]];
   instruments.forEach(([name,v,ch,c],i)=>{const a=ease(progress*2.5-i*.2);const y=300+i*115;out+=box(995+40*(1-a),y,830,96,i%2?'#F0F5F3':'#FFFFFF','rx="8" opacity="'+a+'"');out+=txt(1025+40*(1-a),y+37,name,23,P.ink,'font-weight="700"')+txt(1025+40*(1-a),y+76,v,30,P.ink,'font-weight="800"')+txt(1783,y+68,ch,28,c,'text-anchor="end" font-weight="700"');});
 }else if(mode==='candles'||mode==='volume'||mode==='indicators'){
   const prog=clamp(progress*1.55);
   out+=priceChart({x:987,y:280,w:850,h:505,t:prog,mode:mode==='volume'?'volume':'candles',label:mode==='indicators'?'PRICE MOVEMENT / SIMULATED':'PRICE AND VOLUME / SIMULATED'});
 }else if(mode==='checklist'){
   ['VERIFY THE SOURCE','DEFINE THE TIMEFRAME','COMPARE VOLUME','SHOW UNCERTAINTY'].forEach((s,i)=>{const a=ease(progress*1.8-i*.13),y=326+i*105;out+=box(1004,y,53,52,a>.3?P.teal:'#B4CBD0','rx="12"')+txt(1030,y+35,'✓',34,'#FFFFFF','text-anchor="middle" font-weight="900"')+txt(1087,y+35,s,31,P.ink,'font-weight="800"');});
 }
 return out;
}
function fullGraphic(scene,progress){
 let out=box(50,192,1818,636,scene.layout==='indicators'?P.cream:P.paper,'rx="18"');
 switch(scene.layout){
 case 'market-board':
   out+=txt(100,265,'MARKET SNAPSHOT',35,P.ink,'font-weight="800"')+txt(100,303,'SIMULATED · 5-MINUTE INTERVALS',17,P.grey,'letter-spacing="1"');
   [['SIGNAL 500','117.84','+0.58%',P.up],['TECH 100','143.61','+0.91%',P.up],['INDUSTRIAL 30','168.22','−0.23%',P.down],['SMALL CAP','203.41','+0.37%',P.up]].forEach(([name,v,ch,c],i)=>{
     const col=i%2,row=Math.floor(i/2),x=96+col*866,y=352+row*216,a=ease(progress*2.0-i*.16);
     out+=box(x+30*(1-a),y,800,181,i%2?'#ECF7F4':'#EFF2F5','rx="12"')+txt(x+30,y+64,name,31,P.ink,'font-weight="800"')+txt(x+30,y+126,v,44,P.ink,'font-weight="800"')+txt(x+756,y+122,ch,36,c,'text-anchor="end" font-weight="800"');
   });break;
 case 'indicators':
   out+=momentumGraph(83,223,861,557,progress)+macdGraph(977,223,857,557,progress);break;
 case 'volume':
   out+=priceChart({x:83,y:224,w:1127,h:560,t:progress,mode:'volume',light:true})+volumeGraph(1236,224,597,560,progress);break;
 case 'checklist':
 case 'summary':
   ['SOURCE','TIMEFRAME','VOLUME','INDICATOR','UNCERTAINTY'].forEach((s,i)=>{let x=130+i*350,a=ease(progress*2-i*.1);out+=box(x,410+25*(1-a),318,218,i%2===0?'#E6F3EF':'#EDF0F5','rx="17"')+txt(x+32,487,i<3?'0'+(i+1):'0'+(i+1),39,P.gold,'font-weight="800"')+txt(x+25,562,s,28,P.ink,'font-weight="800"');});break;
 case 'candles':
 default:out+=priceChart({x:80,y:216,w:1746,h:581,t:progress,mode:'candles',light:true});
 }
 return out;
}
function splash(scene,elapsed,globalTime){
 const t=clamp(elapsed/(scene.duration||5));
 let out=box(0,151,W,707,scene.kind==='intro'?P.cream:P.navy);
 const dark=scene.kind==='outro'||scene.kind==='interlude',textCol=dark?'#FFFFFF':P.ink;
 for(let i=0;i<8;i++){const off=((globalTime*25)+i*210)%1920;out+=line(off,150,off-400,853,dark?'#214758':'#DDE9E5',2,'opacity=".45"');}
 out+=txt(111,297,scene.kind==='intro'?'WELCOME TO SIGNAL':scene.kind==='outro'?'A SIGNAL ORIGINAL':'THE BIGGER PICTURE',27,dark?'#82DDD1':P.teal,'font-weight="700" letter-spacing="4"');
 const h=scene.headline,words=h==='SIGNAL'?['SIGNAL']:h.includes('PRICE')?['PRICE TELLS','ONE STORY']:h.includes('SHOW')?['SHOW THE','EVIDENCE']:['THE BIGGER','PICTURE'];
 words.forEach((s,i)=>out+=txt(109+(1-ease(t*2))*100,460+i*136,s,h==='SIGNAL'?168:105,textCol,'font-weight="800" letter-spacing="-3"'));
 out+=txt(114,760,scene.sub,32,dark?'#A9D5DA':P.grey,'letter-spacing="3"');
 if(scene.kind==='intro'||scene.kind==='outro'){
   out+=box(1210,272,600,440,dark?'#1B3E50':'#E8F2F0','rx="14"');
   out+=priceChart({x:1235,y:305,w:543,h:344,t:Math.max(.09,t),mode:'plain',light:!dark,label:'ILLUSTRATIVE MARKET SERIES'});
 }
 return out;
}
export function renderFrame(scene,elapsed,duration,{globalSeconds=0,audioDuration=0}={}){
 if(!scene?.kind||!Number.isFinite(elapsed)||duration<=0)throw Error('Bad scene frame');
 const progress=clamp(elapsed/Math.max(.5,duration)),speaker=scene.kind==='speaker';
 // Cut away from the narrator mid-explanation so the display evolves with the speech.
 const avatarWindow= speaker ? Math.min(Math.max(4.5,audioDuration*.58),8.8) : 0;
 const onCamera=speaker&&elapsed<avatarWindow;
 let out=`<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">${WORDS}<defs><clipPath id="stage"><rect x="0" y="151" width="1920" height="708"/></clipPath></defs>`;
 if(!speaker){out+=splash(scene,elapsed,globalSeconds);}
 else if(onCamera){out+=box(0,151,W,708,scene.layout==='indicators'?P.ice:'#E7EDEE');out+=faceBox(scene)+narrativeCard(scene,progress);}
 else {out+=box(0,151,W,708,'#DBE8E7')+fullGraphic(scene,progress);}
 out+=masthead(globalSeconds)+lowerThird(scene,elapsed,audioDuration,globalSeconds);
 return out+'</svg>';
}

export async function renderSceneBackground(scene,duration,{destination,fps=12,audioDuration=0,globalStart=0,framesLimit=null}={}){
 if(!destination)throw Error('Output path required');
 const fr=Math.ceil(duration*fps),frames=framesLimit?Math.min(fr,framesLimit):fr;
 const cmd=['-hide_banner','-loglevel','error','-y','-f','rawvideo','-pix_fmt','rgba','-s','1920x1080','-framerate',String(fps),'-i','pipe:0',
   '-an','-r','30','-c:v','libx264','-preset','veryfast','-crf','25','-pix_fmt','yuv420p','-movflags','+faststart',destination];
 const child=spawn('ffmpeg',cmd,{stdio:['pipe','ignore','pipe']});let err='';child.stderr.on('data',b=>{err+=b.toString().slice(0,5000)});
 try{
 for(let i=0;i<frames;i++){
   const elapsed=i/fps;
   const svg=renderFrame(scene,elapsed,duration,{globalSeconds:globalStart+elapsed,audioDuration});
   const frame=await sharp(Buffer.from(svg),{density:72}).ensureAlpha().raw().toBuffer();
   if(frame.length!==W*H*4)throw Error('Unexpected RGBA frame dimensions');
   if(!child.stdin.write(frame))await once(child.stdin,'drain');
 }
 child.stdin.end();
 const [code]=await once(child,'close');if(code!==0)throw Error('Background encode failed: '+err.slice(-1200));
 return {destination,frames,seconds:frames/fps};
 }catch(e){child.kill('SIGKILL');throw e;}
}

if(process.argv[1]?.endsWith('animated-signal.mjs')){
 const fs=await import('node:fs/promises');
 const s=programme.scenes.find(x=>x.id==='lasse_momentum');
 const svg=renderFrame(s,4.7,18,{globalSeconds:104.7,audioDuration:15.2});
 await fs.writeFile('/mnt/data/jazz_production/signal-animated-frame.svg',svg);
 await sharp(Buffer.from(svg)).png().toFile('/mnt/data/jazz_production/signal-animated-frame.png');
 console.log('Wrote 1920x1080 animated financial broadcast still');
}