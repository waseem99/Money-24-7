import numpy as np, json, wave, os
root=os.environ.get('SIGNAL_R4_OUTPUT','/mnt/data/signal_r4_final')
a=json.load(open(root+'/SIGNAL-R4-plus-timeline.json'))
T=a['totalDuration'];sr=48000
boundaries=[s['start'] for s in a['segments']]
with wave.open(root+'/SIGNAL-original-news-bed.wav','wb') as f:
 f.setnchannels(2);f.setsampwidth(2);f.setframerate(sr)
 for offset in range(0,int(np.ceil(T*sr)),sr*4):
  n=min(sr*4,int(np.ceil(T*sr))-offset)
  t=(np.arange(n,dtype=np.float64)+offset)/sr
  pattern=np.floor(t/12).astype('int32')%4
  roots=np.choose(pattern,[130.8128,146.8324,110.0,164.8138])
  base=.0042*np.sin(2*np.pi*roots*t)+.0022*np.sin(2*np.pi*roots*1.5*t)+.0011*np.sin(2*np.pi*roots*2*t)
  percussion=.0013*np.exp(-np.mod(t,1.2)*14)*np.sin(2*np.pi*410*t)
  sting=np.zeros(n,dtype=np.float64)
  for mark in boundaries:
   if mark>t[-1]+2 or mark<t[0]-2:continue
   dx=t-mark;mask=(dx>=0)&(dx<1.4)
   d=dx[mask]
   sting[mask]+=.016*np.sin(2*np.pi*880*d)*np.exp(-4*d)+.006*np.sin(2*np.pi*1319*d)*np.exp(-6*d)
  # Brief opening theme, then keep music under the news noticeably quieter.
  amp=(base+percussion+sting)*np.minimum(1.0,np.maximum(0.0,t/1.2))*np.minimum(1.0,np.maximum(0.0,(T-t)/2))
  amp=np.clip(amp,-.7,.7)
  pcm=np.empty((n,2),dtype=np.int16)
  pcm[:,0]=(amp*32767).astype('<i2');pcm[:,1]=(amp*.92*32767).astype('<i2')
  f.writeframes(pcm.tobytes())
print('NEWS BED',T,'seconds',os.path.getsize(root+'/SIGNAL-original-news-bed.wav'),'bytes')