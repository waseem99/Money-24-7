/**
 * Real-media-only Stocks broadcast capture.
 *
 * Draws a deterministic UHD/FullHD 16:9 programme from an approved blank room,
 * chroma-keyed provider video frames and local graphic overlays.
 * captureStream+MediaRecorder never initiates an avatar/provider session.
 * No visible actor -> no real-media capture. Not a broadcast streaming encoder.
 */
export const FRAME = Object.freeze({width:1920,height:1080,fps:30});
export const MAX_RECORD_SECONDS=90;
export const CAMERAS = Object.freeze(['C_NORA','B_MARCUS','D_GRAPHICS','A_WIDE']);

export function validateCaptureInputs({roomReady=false,logoReady=false,camera='',sources={},seconds=30,marketStatus='RECORDED_DEMO',sourceFactApproved=false}={}){
  const issues=[];
  if(!roomReady)issues.push('Load an approved empty newsroom background first');
  if(!logoReady)issues.push('Load the original authorized Tamasha bug');
  if(!CAMERAS.includes(camera))issues.push('Unknown camera');
  if(!(Number.isInteger(seconds)&&seconds>=5&&seconds<=MAX_RECORD_SECONDS))
    issues.push('Recording must be an integer between 5 and 90 seconds');
  if(marketStatus==='LIVE')issues.push('This pilot cannot claim an on-air LIVE market feed');
  if(sourceFactApproved!==true&&marketStatus==='VERIFIED_LIVE_QUOTES')
    issues.push('No approved current market-data feed');
  const active=Object.keys(sources).filter(r=>sources[r]?.connected&&sources[r]?.frames>=10&&sources[r]?.hasVideoTrack);
  if(active.length===0)issues.push('No actual moving provider frames: static images are not video proof');
  if(camera==='C_NORA'&&!active.includes('NORA'))issues.push('Nora moving source unavailable');
  if(camera==='B_MARCUS'&&!active.includes('MARCUS'))issues.push('Marcus moving source unavailable');
  if(camera==='A_WIDE'&&active.length<2)issues.push('Cannot assert two-person wide without two moving sources');
  if(camera==='D_GRAPHICS'&&active.length===0)issues.push('No source-narration for real-media verification');
  return {pass:issues.length===0,issues,active};
}
export function graphicFramePolicy(x={}){
  const errors=[];
  if(x.bugCount!==1||x.brandPosition!=='TOP_LEFT')errors.push('One small Stocks bug only');
  if(x.bakedStockQuotes||x.bakedStudioPeople)errors.push('Baked source content forbidden');
  if(x.coverage!=='US')errors.push('US financial network only');
  if(x.recorded&&x.status==='LIVE')errors.push('Recorded footage falsely labelled LIVE');
  if(x.quotePanelType==='UNVERIFIED_NUMBERS')errors.push('Financial figures lack evidence');
  return errors;
}
function ratioFrame(ctx,img,x,y,w,h) {
  if(!img||!img.width||!img.height)return;
  const ratio=Math.min(w/img.width,h/img.height);
  const dw=img.width*ratio,dh=img.height*ratio;
  ctx.drawImage(img,x+(w-dw)/2,y+(h-dh)/2,dw,dh);
}
function drawText(ctx,str,x,y,size=28,color='#fff',weight=700) {
  ctx.fillStyle=color;ctx.font=weight+' '+size+'px Arial,sans-serif';ctx.fillText(str,x,y);
}
function drawSource(ctx,canvas,frame){
  if(!canvas?.width||!canvas?.height)return;
  const {x,y,w,h}=frame;
  ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
  const r=Math.max(w/canvas.width,h/canvas.height);
  const rw=canvas.width*r,rh=canvas.height*r;
  ctx.drawImage(canvas,x+(w-rw)/2,y+(h-rh)/2,rw,rh);ctx.restore();
}
export function drawProgramFrame(ctx,{room,logo,sources={},camera='C_NORA',labels=null,clockMs=0,headline='U.S. MARKET WATCH',subline='Dated, editor-verified financial reporting',ticker='STOCKS • U.S. MARKETS • RECORDED DEMONSTRATION',status='RECORDED DEMO'}={}){
  const W=FRAME.width,H=FRAME.height;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#071e3b';ctx.fillRect(0,0,W,H);
  if(room)ctx.drawImage(room,0,0,W,H);
  ctx.fillStyle='rgba(1,16,41,.63)';ctx.fillRect(0,0,W,140);
  if(logo)ratioFrame(ctx,logo,44,22,83,92);
  drawText(ctx,'STOCKS',140,80,51);
  drawText(ctx,'MARKETS   BUSINESS   PEOPLE',141,116,16,'#c6e9fc');
  ctx.fillStyle='#09213dc9';ctx.fillRect(1560,55,326,60);
  drawText(ctx,status,1588,94,24,'#cfe6fb');
  ctx.fillStyle='#03152bdc';ctx.fillRect(1578,148,342,622);
  ctx.fillStyle='#26b5fa';ctx.fillRect(1578,148,4,622);
  drawText(ctx,'U.S. MARKETS',1610,198,28);
  drawText(ctx,'NO APPROVED',1608,308,25,'#c3def0');
  drawText(ctx,'QUOTE FEED',1608,345,25,'#c3def0');
  drawText(ctx,'ATTACHED',1608,382,25,'#c3def0');
  drawText(ctx,'Market figures appear',1610,480,17,'#b0c8dd',400);
  drawText(ctx,'only after verification.',1610,512,17,'#b0c8dd',400);
  const active=Object.fromEntries(Object.entries(sources).filter(([_,s])=>s?.canvas&&s.canvas.width>0));
  const roleStyle={NORA:{x:210,y:140,w:630,h:665},MARCUS:{x:900,y:140,w:630,h:665}};
  if(camera==='C_NORA'){
    if(active.NORA)drawSource(ctx,active.NORA.canvas,{x:375,y:142,w:950,h:666});
    drawText(ctx,labels?.NORA||'NORA · AI ANCHOR',95,795,24);
  } else if(camera==='B_MARCUS'){
    if(active.MARCUS)drawSource(ctx,active.MARCUS.canvas,{x:375,y:142,w:950,h:666});
    drawText(ctx,labels?.MARCUS||'MARCUS · AI ANCHOR',95,795,24);
  } else if(camera==='A_WIDE'){
    for(const [name,frame] of Object.entries(roleStyle))if(active[name])drawSource(ctx,active[name].canvas,frame);
    drawText(ctx,labels?.NORA||'NORA',210,795,25);drawText(ctx,labels?.MARCUS||'MARCUS',900,795,25);
  } else {
    drawText(ctx,'SOURCE-VERIFIED',180,490,50,'#addffd');
    drawText(ctx,'MARKET GRAPHICS',180,550,50,'#ffffff');
  }
  ctx.fillStyle='rgba(1,20,51,.97)';ctx.fillRect(0,810,W,190);
  ctx.fillStyle='#16a3e2';ctx.fillRect(0,810,13,190);
  drawText(ctx,headline.slice(0,70),40,891,46);
  drawText(ctx,subline.slice(0,110),42,950,25,'#c6e1f5',400);
  ctx.fillStyle='#021124';ctx.fillRect(0,1000,W,80);
  ctx.fillStyle='#087fc5';ctx.fillRect(0,1000,198,80);
  drawText(ctx,'STOCKS',40,1052,29);
  const safeTicker=(' • '+ticker+' • ').repeat(3);
  const pxOffset=(clockMs/1000*165)%1600;
  drawText(ctx,safeTicker,220-pxOffset,1052,25,'#d5edf9',500);
}
export class ProgramRecorder {
  constructor({canvas,room,logo,sources,labels=null,status='RECORDED DEMO',onProgress=()=>{}}){
    if(!canvas||!room||!logo)throw Error('Programme canvas, licensed room and brand logo are required');
    this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});
    if(!this.ctx)throw Error('Browser Canvas2D not supported');
    canvas.width=FRAME.width;canvas.height=FRAME.height;
    this.room=room;this.logo=logo;this.sources=sources;this.status=status;this.labels=labels;this.onProgress=onProgress;
    this.camera='C_NORA';this.audioRole='NORA';this.startClock=null;this.raf=null;this.recorder=null;this.chunks=[];
    this.audioContext=null;this.audioDestination=null;this.mixed=[];
  }
  cameraCut(camera){
    if(!CAMERAS.includes(camera))throw Error('Unsupported camera');
    this.camera=camera;
    if(camera==='C_NORA')this.audioRole='NORA';
    if(camera==='B_MARCUS')this.audioRole='MARCUS';
    // Keep the last approved narrator active underneath chart cutaways.
    for(const item of this.mixed)item.gain.gain.value=item.role===this.audioRole?1:0;
  }
  async begin(seconds){
    if(this.recorder)throw Error('Recording already in progress');
    const readiness=validateCaptureInputs({
      roomReady:!!this.room,logoReady:!!this.logo,camera:this.camera,
      sources:this.sources,seconds});
    if(!readiness.pass)throw Error(readiness.issues.join('; '));
    if(!this.canvas.captureStream||!globalThis.MediaRecorder)throw Error('Requires browser MediaRecorder + canvas.captureStream');
    this.audioContext=new (globalThis.AudioContext||globalThis.webkitAudioContext)();
    this.audioDestination=this.audioContext.createMediaStreamDestination();
    for(const role of readiness.active){
      const s=this.sources[role];
      if(!s?.stream?.getAudioTracks().length)continue;
      const source=this.audioContext.createMediaStreamSource(s.stream);
      const gain=this.audioContext.createGain();
      gain.gain.value=role===this.audioRole?1:0;
      source.connect(gain).connect(this.audioDestination);
      this.mixed.push({role,source,gain});
    }
    if(this.mixed.length===0)throw Error('No actual provider audio tracks. Do not record silent pseudo-presenter sample');
    await this.audioContext.resume();
    const stream=this.canvas.captureStream(FRAME.fps);
    for(const track of this.audioDestination.stream.getAudioTracks())stream.addTrack(track);
    const mimeTypes=['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'];
    const mimeType=mimeTypes.find(t=>MediaRecorder.isTypeSupported(t));
    if(!mimeType)throw Error('No supported WebM recording format');
    this.startClock=performance.now();this.chunks=[];
    this.recorder=new MediaRecorder(stream,{mimeType,videoBitsPerSecond:8_000_000,audioBitsPerSecond:160_000});
    const recorder=this.recorder;
    recorder.ondataavailable=e=>{if(e.data?.size>0)this.chunks.push(e.data)};
    const complete=new Promise((resolve,reject)=>{
      recorder.onerror=e=>reject(e.error||Error('Recording failure'));
      recorder.onstop=async()=>{
        const blob=new Blob(this.chunks,{type:mimeType});
        const duration=(performance.now()-this.startClock)/1000;
        const result={blob,durationSeconds:duration,bytes:blob.size,mimeType,recordedFromActualSource:true,creativeReviewRequired:true};
        this.recorder=null;this.stopDrawing();this.mixed.forEach(x=>{x.source.disconnect();x.gain.disconnect()});this.mixed=[];
        if(this.audioContext){await this.audioContext.close();this.audioContext=null;}
        resolve(result);
      };
    });
    const run=()=>{if(!this.recorder)return;drawProgramFrame(this.ctx,{room:this.room,logo:this.logo,sources:this.sources,camera:this.camera,labels:this.labels,clockMs:performance.now()-this.startClock,status:this.status});this.raf=requestAnimationFrame(run)};
    run();recorder.start(1000);
    this.timer=setTimeout(()=>this.stop(),Math.min(MAX_RECORD_SECONDS,seconds)*1000);
    this.onProgress('Recording real provider stream for '+seconds+'s');
    return complete;
  }
  stop(){if(this.timer)clearTimeout(this.timer);if(this.recorder?.state==='recording')this.recorder.stop();}
  stopDrawing(){if(this.raf!=null)cancelAnimationFrame(this.raf);this.raf=null;this.timer=null;}
}