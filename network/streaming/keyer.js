/**
 * Zero-API, browser-side WebGL key for already-authorized LiveAvatar raw streams.
 * Shader is a quality-test candidate, not certified hair/glasses compositing.
 */
export const GREEN_KEY = Object.freeze({low:0.075,high:0.24,minGreen:0.19});
export function greenPixelOpacity(r,g,b,settings=GREEN_KEY){
  const R=r/255,G=g/255,B=b/255;
  const d=G-Math.max(R,B);
  if(G<settings.minGreen || d<=settings.low)return 1;
  if(d>=settings.high)return 0;
  const t=(d-settings.low)/(settings.high-settings.low);
  return Math.max(0,Math.min(1,1-t*t*(3-2*t)));
}
const VS=[
 'attribute vec2 a_pos;',
 'varying vec2 v_uv;',
 'void main(){ gl_Position=vec4(a_pos,0.0,1.0); v_uv=(a_pos+1.0)*0.5; }'
].join('\n');
const FS=[
 'precision mediump float;',
 'varying vec2 v_uv;',
 'uniform sampler2D u_frame;',
 'uniform vec3 u_key;',
 'void main(){',
 ' vec4 px=texture2D(u_frame,v_uv);',
 ' float d=px.g-max(px.r,px.b);',
 ' float mask=smoothstep(u_key.x,u_key.y,d);',
 ' mask*=step(u_key.z,px.g);',
 ' float alpha=1.0-mask;',
 ' gl_FragColor=vec4(px.rgb*alpha,alpha);',
 '}'
].join('\n');
function shader(gl,type,src){
 const s=gl.createShader(type);
 gl.shaderSource(s,src);gl.compileShader(s);
 if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){
  const e=gl.getShaderInfoLog(s);gl.deleteShader(s);throw new Error(e);
 }
 return s;
}
export function startGreenKey(video,canvas,{settings=GREEN_KEY,onError=()=>{}}={}){
 if(!video||!canvas)throw new Error('Video and canvas required');
 const gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:false,antialias:false});
 if(!gl)throw new Error('WebGL unavailable; raw stream is NOT an approved composite');
 const v=shader(gl,gl.VERTEX_SHADER,VS),f=shader(gl,gl.FRAGMENT_SHADER,FS);
 const program=gl.createProgram();
 gl.attachShader(program,v);gl.attachShader(program,f);gl.linkProgram(program);
 if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('WebGL shader link failed');
 gl.useProgram(program);
 const buffer=gl.createBuffer();
 gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
 gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
 const pos=gl.getAttribLocation(program,'a_pos');
 gl.enableVertexAttribArray(pos);
 gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
 const tex=gl.createTexture();
 gl.bindTexture(gl.TEXTURE_2D,tex);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
 gl.uniform1i(gl.getUniformLocation(program,'u_frame'),0);
 gl.uniform3f(gl.getUniformLocation(program,'u_key'),settings.low,settings.high,settings.minGreen);
 gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
 let active=true,raf=0,frames=0;
 function draw(){
  if(!active)return;
  if(video.readyState>=2&&video.videoWidth>0){
   try{
    if(canvas.width!==video.videoWidth||canvas.height!==video.videoHeight){
     canvas.width=video.videoWidth;canvas.height=video.videoHeight;
     gl.viewport(0,0,canvas.width,canvas.height);
    }
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D,tex);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,video);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);frames++;
   }catch(e){onError(e);stop();return;}
  }
  raf=requestAnimationFrame(draw);
 }
 function stop(){
  if(!active)return;
  active=false;cancelAnimationFrame(raf);
  gl.deleteBuffer(buffer);gl.deleteTexture(tex);
  gl.deleteProgram(program);gl.deleteShader(v);gl.deleteShader(f);
 }
 raf=requestAnimationFrame(draw);
 return {stop,getFrames:()=>frames};
}
