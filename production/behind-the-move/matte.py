import cv2,mediapipe as mp,numpy as np,subprocess,sys
from pathlib import Path
p=Path(__file__).resolve().parent/'sources'
for speaker in ['Amina','Dexter']:
 src=p/speaker/'source.webm';out=p/speaker/'matte.mp4'
 norm=p/speaker/'normalized.mp4'
 subprocess.run(['ffmpeg','-v','error','-y','-i',str(src),'-vf','fps=25','-an','-c:v','libx264','-preset','fast','-crf','18',str(norm)],check=True)
 cap=cv2.VideoCapture(str(norm));fps=cap.get(cv2.CAP_PROP_FPS) or 25;w=int(cap.get(3));h=int(cap.get(4));print(speaker,w,h,fps,flush=True)
 enc=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','bgr24','-s',f'{w}x{h}','-r',str(fps),'-i','-','-an','-c:v','libx264','-preset','fast','-crf','17','-pix_fmt','yuv420p',str(out)],stdin=subprocess.PIPE)
 model=mp.solutions.selfie_segmentation.SelfieSegmentation(model_selection=1);last=None;n=0
 while True:
  ok,f=cap.read()
  if not ok:break
  m=model.process(cv2.cvtColor(f,cv2.COLOR_BGR2RGB)).segmentation_mask
  m=np.clip((m-.12)/.65,0,1);m=cv2.GaussianBlur(m,(5,5),0)
  if last is not None:m=.8*m+.2*last
  last=m
  green=np.zeros_like(f);green[:,:,1]=255
  f=(f*m[:,:,None]+green*(1-m[:,:,None])).astype('uint8');enc.stdin.write(f.tobytes());n+=1
  if n%250==0:print(speaker,n,flush=True)
 enc.stdin.close();enc.wait();cap.release();model.close();print('done',speaker,n,flush=True)
