"""Render the reusable Stocks programme package from a JSON rundown and existing media."""
from pathlib import Path
import importlib.util,json,subprocess,sys,math
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parent
OUT=Path(sys.argv[1]).resolve();OUT.mkdir(parents=True,exist_ok=True)
MEDIA=Path(sys.argv[2]).resolve()
config=json.loads(Path(sys.argv[3]).read_text())
spec=importlib.util.spec_from_file_location('orbit',ROOT/'stocks-orbit.py');g=importlib.util.module_from_spec(spec);spec.loader.exec_module(g)
def run(args):subprocess.run(['ffmpeg','-v','error','-y',*args],check=True)
def probe(p):return float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','default=nw=1:nk=1',str(p)]))
# Fail before rendering if a source is missing, too short, or a label would overflow.
for s in config['segments']:
 p=MEDIA/s.get('source',s.get('audio'));assert p.is_file(),p
 if 'source' in s:assert probe(p)+.05>=s['duration'],f'Source too short: {p}'
 else:assert probe(p)<=s['duration']+.05,f'Voice would be cut: {p}'
 for key,size,limit in [('headline',36,1160),('strap',18,850),('topics',15,1040)]:
  if key in s:assert g.font(size,True).getlength(s[key])<limit,f'Label too long: {key}'

def crawl(im,t):
 d=ImageDraw.Draw(im);d.rectangle((0,673,1280,720),fill=g.INK)
 message=config['ticker'];stride=d.textlength(message,font=g.font(20));x=210-(t*95)%stride
 for i in range(3):g.txt(d,(x+i*stride,688),message,20,'white')
 d.rectangle((0,673,210,720),fill=g.TEAL);g.txt(d,(18,689),'STOCKS / EXPLAINER',16,'white',True)
def strap(im,s,t):
 d=ImageDraw.Draw(im);x=int(-1280*(1-g.ease(t/.55)))
 d.rectangle((x+42,541,x+942,578),fill=g.GOLD);g.txt(d,(x+61,550),s['strap'],18,g.INK,True)
 d.rectangle((x+34,578,x+1238,636),fill='#faf8f2');g.txt(d,(x+60,588),s['headline'],36,g.INK,True)
 d.rectangle((x+42,636,x+1110,664),fill=g.TEAL);g.txt(d,(x+61,643),s['topics'],15,'white',True)

time=0;rundown=[]
for ix,s in enumerate(config['segments']):
 count=round(s['duration']*24);seconds=count/24;raw=OUT/f'{ix:02d}-silent.mp4';final=OUT/f'{ix:02d}.mp4'
 reader=None
 if s['kind']=='studio':
  reader=subprocess.Popen(['ffmpeg','-v','error','-threads','2','-i',str(MEDIA/s['source']),'-vf','scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,setsar=1,fps=24','-f','rawvideo','-pix_fmt','rgb24','-'],stdout=subprocess.PIPE)
 writer=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s','1280x720','-r','24','-i','-','-an','-c:v','libx264','-threads','2','-preset','fast','-crf','18','-pix_fmt','yuv420p',str(raw)],stdin=subprocess.PIPE)
 for n in range(count):
  t=n/24
  if reader:
   b=reader.stdout.read(1280*720*3)
   if len(b)!=1280*720*3:raise RuntimeError('Incomplete source frame')
   im=Image.frombytes('RGB',(1280,720),b).convert('RGBA');g.bug(im);strap(im,s,t);crawl(im,time+t)
   # Give the presenter a relevant formula overlay, retaining the actual moving footage.
   if ix==2 and 3<t<9:
    d=ImageDraw.Draw(im);d.rectangle((42,471,630,539),fill=g.INK)
    g.txt(d,(60,478),'OPERATING MARGIN',17,g.GOLD,True)
    g.txt(d,(60,506),'Operating profit / Revenue × 100',23,'white',True)
  else:
   im=g.globe_identity(t,s['kind']!='opener')
   if s['kind']=='next':
    d=ImageDraw.Draw(im);d.rectangle((645,210,1100,249),fill='#f0eee8');g.txt(d,(650,221),'EARNINGS EXPLAINED',21,g.TEAL,True)
  if ix in [1,5] and t<.45:
   x=int(-1500+g.ease(t/.45)*3700);d=ImageDraw.Draw(im)
   for width,col in [(640,g.TEAL),(570,g.GOLD),(500,g.WHITE)]:d.ellipse((x-width,-440,x+width,1140),fill=col)
  if n==min(72,count-1):im.convert('RGB').save(OUT/f'review-{ix:02d}.jpg')
  writer.stdin.write(im.convert('RGB').tobytes())
 writer.stdin.close()
 if writer.wait():raise RuntimeError('Encoder failed')
 if reader:
  reader.stdout.close();reader.wait()
 audio=MEDIA/s.get('source',s.get('audio'))
 run(['-i',str(raw),'-i',str(audio),'-map','0:v','-map','1:a','-af','apad,aresample=48000','-t',str(seconds),'-c:v','copy','-c:a','aac','-b:a','192k','-ac','2',str(final)])
 rundown.append({**s,'start':time,'duration':seconds});time+=seconds
 print(f'Completed {ix+1}/{len(config["segments"])}: {s["kind"]}',flush=True)
(OUT/'concat.txt').write_text(''.join(f"file '{i:02d}.mp4'\n" for i in range(len(rundown))))
run(['-f','concat','-safe','0','-i',str(OUT/'concat.txt'),'-c','copy','-movflags','+faststart',str(OUT/'Stocks-Programme-Preview.mp4')])
(OUT/'rundown.json').write_text(json.dumps({'duration':time,'segments':rundown,'status':'Educational programme preview; reused presenter footage; not live data.'},indent=2))
print(f'Completed programme: {time:.3f}s',flush=True)
