export function waitForVideo(video,timeoutMs=15000){
  return new Promise((resolve,reject)=>{
    const ready=()=>video.readyState>=2&&video.videoWidth>0&&video.videoHeight>0;
    let timer;
    const cleanup=()=>{clearTimeout(timer);video.removeEventListener('loadeddata',check);video.removeEventListener('playing',check);video.removeEventListener('resize',check);};
    const check=()=>{if(ready()){cleanup();resolve();}};
    timer=setTimeout(()=>{cleanup();reject(new Error('Provider connected, but no video frames arrived. Check the media connection and try again.'));},timeoutMs);
    video.addEventListener('loadeddata',check);video.addEventListener('playing',check);video.addEventListener('resize',check);check();
  });
}
