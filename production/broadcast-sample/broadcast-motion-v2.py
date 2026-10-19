"""Reference-led motion study. Software perspective projection, not a live 3D studio.
Run: python broadcast-motion-v2.py /absolute/output-directory
"""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont,ImageFilter
import numpy as np, math, subprocess,sys,re,base64,io
P=Path(sys.argv[1]);ROOT=Path(__file__).resolve().parent;W,H=1280,720;FPS=24;DURATION=28
FONT='/usr/share/fonts/opentype/urw-base35/NimbusSans-Regular.otf';BOLD=FONT.replace('Regular','Bold')
fonts={}
def tx(d,p,s,n=22,c='white',b=False):
 k=(n,b)
 if k not in fonts:fonts[k]=ImageFont.truetype(BOLD if b else FONT,n)
 d.text(p,s,font=fonts[k],fill=c)
def ease(x):x=max(0,min(1,x));return x*x*(3-2*x)
logo=Image.open(io.BytesIO(base64.b64decode(re.search('base64,([^\x27]+)',(ROOT/'brand.mjs').read_text()).group(1)))).convert('RGBA');logo.thumbnail((27,35))
def base():
 yy,xx=np.mgrid[:H,:W];v=np.maximum(0,1-np.sqrt(((xx-850)/1000)**2+((yy-230)/660)**2))
 a=np.zeros((H,W,3),np.uint8)
 for k,(low,amp) in enumerate([(5,18),(12,24),(20,30)]):a[:,:,k]=low+v*amp
 return Image.fromarray(a)
BG=base()
PLATE=Image.open(io.BytesIO(base64.b64decode((ROOT/'broadcast-identity-plate.b64').read_text()))).convert('RGBA')
def plate(t):
 z=1.0+.035*ease(t/5);a=PLATE.resize((int(W*z),int(H*z)),Image.Resampling.LANCZOS);return a.crop((0,0,W,H))
def proj(p,cam):
 x,y,z=p;cx,cy,cz=cam;z-=cz
 return (640+(x-cx)*850/z,330-(y-cy)*850/z)
def plane(im,pts,col,cam,edge=None):
 d=ImageDraw.Draw(im);q=[proj(p,cam) for p in pts];d.polygon(q,fill=col)
 if edge:d.line(q+[q[0]],fill=edge,width=2)
def texture(im,tex,pts,cam):
 dst=[proj(p,cam) for p in pts];src=[(0,0),(tex.width,0),(tex.width,tex.height),(0,tex.height)];A=[];B=[]
 for (x,y),(u,v) in zip(dst,src):A.extend([[x,y,1,0,0,0,-u*x,-u*y],[0,0,0,x,y,1,-v*x,-v*y]]);B.extend([u,v])
 coef=np.linalg.solve(np.array(A),np.array(B));warp=tex.convert('RGBA').transform((W,H),Image.Transform.PERSPECTIVE,coef,Image.Resampling.BICUBIC)
 im.alpha_composite(warp)
def architecture(t,opening=False):
 im=BG.copy().convert('RGBA');cam=(math.sin(t*.15)*.28,0,-3.8 if not opening else -3.1-.28*ease(t/4))
 # A real projected set of wall panels, floor tiles and luminous battens.
 plane(im,[(-8,-2,0),(8,-2,0),(8,-2,12),(-8,-2,12)],'#18232c',cam)
 for x in range(-8,9):
  d=ImageDraw.Draw(im);d.line([proj((x,-2,0),cam),proj((x,-2,12),cam)],fill='#35424a',width=1)
 for z in range(0,13,2):ImageDraw.Draw(im).line([proj((-8,-2,z),cam),proj((8,-2,z),cam)],fill='#303c44',width=1)
 for i in range(-4,5):
  x=i*1.7;z=3.8+abs(i)*.15
  plane(im,[(x-.78,2.6,z),(x+.78,2.6,z),(x+.78,-1.9,z),(x-.78,-1.9,z)],'#142c3c' if i%2 else '#203440',cam,'#52636c')
  plane(im,[(x-.77,2.6,z-.02),(x-.73,2.6,z-.02),(x-.73,-1.9,z-.02),(x-.77,-1.9,z-.02)],'#4a9fa8' if i%2 else '#ad8255',cam)
 for y in [-1.8,2.45]:plane(im,[(-8,y,3.65),(8,y,3.65),(8,y+.025,3.65),(-8,y+.025,3.65)],'#bcd4dc',cam)
 return im,cam

def bug(im):
 d=ImageDraw.Draw(im);d.rectangle((1100,26,1250,69),fill='#102735');im.alpha_composite(logo,(1111,30));tx(d,(1147,31),'Stocks',28,b=True)

def crawl(im,t):
 d=ImageDraw.Draw(im);d.rectangle((0,677,W,H),fill='#0b1720');d.rectangle((0,677,W,679),fill='#7c9ba9')
 message='EARNINGS EXPLAINED    /    Revenue is only the starting point    /    Compare margins, cash flow and outlook    /    '
 f=ImageFont.truetype(FONT,20);stride=ImageDraw.Draw(im).textlength(message,font=f);x=170-(t*92)%stride
 for i in range(3):d.text((x+i*stride,691),message,font=f,fill='#e4eaf0')
 d.rectangle((0,679,169,H),fill='#166478');tx(d,(22,691),'BUSINESS BRIEF',17,b=True)

def strap(im,t):
 d=ImageDraw.Draw(im);p=ease(t/.35);x=int(-1020*(1-p))
 d.polygon([(x+36,572),(x+285,572),(x+301,602),(x+36,602)],fill='#b67937');tx(d,(x+49,579),'THE BUSINESS BRIEF',17,b=True)
 d.rectangle((x+36,604,x+1058,665),fill='#102735');d.rectangle((x+36,604,x+42,665),fill='#69c8d0');tx(d,(x+58,616),'BEYOND THE REVENUE HEADLINE',32,b=True)

def screen(t):
 im=Image.new('RGB',(1100,550),'#102735');d=ImageDraw.Draw(im)
 tx(d,(38,24),'EARNINGS EXPLAINED',22,'#6ed5d9',True);tx(d,(38,64),'More sales. Less profit.',52,b=True)
 tx(d,(38,133),'HYPOTHETICAL COMPANY  /  USD MILLIONS',18,'#bdcbd4')
 # Zero baseline, directly labelled periods; no 3D distortion of data values.
 for x,vals,label,col in [(80,[100,120],'REVENUE','#64ccd0'),(590,[12,9.6],'OPERATING PROFIT','#edb075')]:
  tx(d,(x,187),label,23,col,True);q=ease((t-.4)/1.3);mx=max(vals);baseline=450
  d.line((x,baseline,x+410,baseline),fill='#899faa',width=2)
  for j,v in enumerate(vals):
   px=x+55+j*205;ht=v/mx*175*q;d.rectangle((px,baseline-ht,px+92,baseline),fill=col if j else '#718999')
   tx(d,(px,baseline-ht-41),f'{v:g}',31,'white',True);tx(d,(px-2,466),f'PERIOD {j+1}',17,'#cad6dd')
  tx(d,(x+265,188),'+20%' if x==80 else '-20%',28,col,True)
 tx(d,(38,518),'Illustrative values only. Operating margin: 12% → 8%.',18,'#bdcbd4')
 return im

def ident(t,nextshow=False):
 im=plate(t)
 d=ImageDraw.Draw(im);shade=Image.new('RGBA',(W,H));sd=ImageDraw.Draw(shade);sd.rectangle((0,0,950,H),fill=(3,12,20,50));im.alpha_composite(shade);d=ImageDraw.Draw(im)
 y=240+int((1-ease(t/.7))*28);tx(d,(73,y-65),'STOCKS  /  NEXT' if nextshow else 'STOCKS  /  GLOBAL BUSINESS',23,'#88d7db',True)
 for n,s in enumerate(['EARNINGS','EXPLAINED'] if nextshow else ['THE BUSINESS','BRIEF']):tx(d,(68,y+n*85),s,76,b=True)
 d.rectangle((73,y+191,610,y+195),fill='#dca464');tx(d,(73,y+223),'Beyond the headline. Inside the business.',25,'#d3e1e8');bug(im)
 return im

def frame(t):
 if t<5:im=ident(t)
 elif t<13:
  idx=min(192,int((t-5)*24)+1);im=Image.open(P/'frames'/f'{idx:03d}.jpg').convert('RGBA');bug(im);strap(im,t-5);crawl(im,t)
 elif t<23:
  u=t-13;im=plate(u);cam=(math.sin(u*.15)*.10,0,-3.8)
  for x in [-2.6,2.6]:
   plane(im,[(x-.12,-1.35,2.7),(x+.12,-1.35,2.7),(x+.12,-2.35,2.7),(x-.12,-2.35,2.7)],'#7c8b92',cam,'#b7c4cb')
   plane(im,[(x-.4,-2.35,2.4),(x+.4,-2.35,2.4),(x+.4,-2.35,3.1),(x-.4,-2.35,3.1)],'#67777e',cam)
  plane(im,[(-3.98,1.92,2.55),(3.98,1.92,2.55),(3.98,-1.62,2.55),(-3.98,-1.62,2.55)],'#b5c2c8',cam,'#f1eee8')
  plane(im,[(-3.93,1.87,2.52),(3.93,1.87,2.52),(3.93,-1.57,2.52),(-3.93,-1.57,2.52)],'#030a10',cam)
  texture(im,screen(u),[(-3.83,1.77,2.5),(3.83,1.77,2.5),(3.83,-1.47,2.5),(-3.83,-1.47,2.5)],cam);bug(im);crawl(im,t)
 else:im=ident(t-23,True)
 # Short wipe across the picture; channel crawl remains uninterrupted on chart transition.
 for cut in [5,13,23]:
  u=t-cut
  if 0<=u<.35:
   x=int(-500+ease(u/.35)*2100);d=ImageDraw.Draw(im);d.polygon([(x,0),(x+170,0),(x-130,H),(x-300,H)],fill='#a6c5cf');d.polygon([(x+180,0),(x+225,0),(x-75,H),(x-120,H)],fill='#c79051')
 return im.convert('RGB')
proc=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s','1280x720','-r','24','-i','-','-an','-c:v','libx264','-threads','2','-preset','fast','-crf','19','-pix_fmt','yuv420p',str(P/'silent.mp4')],stdin=subprocess.PIPE)
for f in range(DURATION*FPS):
 im=frame(f/FPS)
 if f in [72,168,432]:im.save(P/f'review-{f}.png')
 proc.stdin.write(im.tobytes())
proc.stdin.close()
if proc.wait():raise RuntimeError('encoder failed')
# Existing approved speech only; the ten-second data-wall section is an unvoiced motion study.
subprocess.run(['ffmpeg','-v','error','-y','-i',str(P/'silent.mp4'),'-i',str(P.parent/'program-package/open.mp3'),'-i',str(P.parent/'full-frame-review/source.mp4'),'-i',str(P.parent/'program-package/next.mp3'),'-filter_complex','[1:a]apad,atrim=0:28[a];[2:a]atrim=0:8,asetpts=PTS-STARTPTS,adelay=5000|5000,apad,atrim=0:28[b];[3:a]adelay=23000|23000,apad,atrim=0:28[c];[a][b][c]amix=inputs=3:normalize=0[m]','-map','0:v','-map','[m]','-c:v','copy','-c:a','aac','-b:a','160k','-t','28','-movflags','+faststart',str(P/'Stocks-Broadcast-Motion-V2.mp4')],check=True)
print('rendered 28 seconds')
