"""Original broadcast motion study; no purchased template assets are used."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont,ImageFilter
import numpy as np,math,sys,subprocess,base64,re,io,wave
P=Path(sys.argv[1]);R=Path(__file__).resolve().parent;W,H=1280,720;FPS=24;DURATION=30.25
GOLD='#dfa733';INK='#111d2b';TEAL='#147e8d';WHITE='#f4f5f5';fonts={}
def font(n,b=False):
 k=(n,b)
 if k not in fonts:fonts[k]=ImageFont.truetype('/usr/share/fonts/opentype/urw-base35/NimbusSans-'+('Bold' if b else 'Regular')+'.otf',n)
 return fonts[k]
def txt(d,p,s,n=22,c=INK,b=False):d.text(p,s,font=font(n,b),fill=c)
def ease(x):x=max(0,min(1,x));return 1-(1-x)**4
logo=Image.open(io.BytesIO(base64.b64decode(re.search('base64,([^\x27]+)',(R/'brand.mjs').read_text()).group(1)))).convert('RGBA');logo.thumbnail((30,38))
land=np.asarray(Image.open(io.BytesIO(base64.b64decode((R/'orbit-land-mask.b64').read_text()))).convert('L'))
# Render a rotating geographic sphere from a public-domain Natural Earth mask.
SIZE=560;yy,xx=np.mgrid[:SIZE,:SIZE];nx=(xx-SIZE/2)/(SIZE/2-4);ny=-(yy-SIZE/2)/(SIZE/2-4);rr=nx*nx+ny*ny;inside=rr<1;nz=np.sqrt(np.maximum(0,1-rr));lat=np.arcsin(np.clip(ny,-1,1));lon=np.arctan2(nx,nz)
light=np.maximum(0,-.35*nx+.4*ny+.85*nz);shine=np.clip((-.42*nx+.38*ny+.82*nz),0,1)**45
rows=np.clip(((math.pi/2-lat)/math.pi*799).astype(int),0,799)
def globe(t):
 cols=(((lon+t*.12+.4)%(2*math.pi))/(2*math.pi)*1599).astype(int);mask=land[rows,cols]/255
 rgb=np.empty((SIZE,SIZE,4),dtype=np.uint8)
 for k,(sea,earth) in enumerate(zip([209,221,225],[196,139,36])):
  val=(sea*(1-mask)+earth*mask)*(.5+.5*light)+shine*52
  rgb[:,:,k]=np.clip(val,0,255)
 rgb[:,:,3]=inside.astype(np.uint8)*255
 return Image.fromarray(rgb)
# Quiet dotted geographic texture, not decorative invented prices.
bg=Image.new('RGB',(W,H),'#eceff0');bd=ImageDraw.Draw(bg)
for y in range(16,650,8):
 for x in range(0,1280,8):
  if land[min(799,int(y/650*799)),min(1599,int(x/1280*1599))]>128:bd.ellipse((x,y,x+1,y+1),fill='#d5dade')

def bug(im):
 d=ImageDraw.Draw(im);d.rectangle((1095,24,1253,76),fill=INK);im.alpha_composite(logo,(1106,30));txt(d,(1146,35),'Stocks',29,'white',True)
def background(t):
 im=bg.convert('RGBA');d=ImageDraw.Draw(im)
 for i in range(3):
  x=650+int(math.sin(t*.2+i)*50)+i*160;d.polygon([(x,0),(x+20,0),(x-250,H),(x-270,H)],fill=(255,255,255,100))
 return im

def globe_identity(t,nextshow=False):
 im=background(t);d=ImageDraw.Draw(im)
 # Offset rings and a photographic shadow give the sphere a coherent depth cue.
 shadow=Image.new('RGBA',(W,H));sd=ImageDraw.Draw(shadow);sd.ellipse((60,590,550,650),fill=(34,49,61,45));shadow=shadow.filter(ImageFilter.GaussianBlur(18));im.alpha_composite(shadow)
 d=ImageDraw.Draw(im);d.arc((-50,12,650,694),210+t*15,430+t*15,fill=GOLD,width=5);d.arc((-29,37,625,672),-70+t*8,125+t*8,fill='#b8c5ca',width=2)
 im.alpha_composite(globe(t),(-4,73));bug(im);d=ImageDraw.Draw(im)
 x=650+int((1-ease(t/.9))*100)
 txt(d,(x,221),'COMING UP' if nextshow else 'GLOBAL BUSINESS',21,TEAL,True)
 for i,s in enumerate(['EARNINGS','EXPLAINED'] if nextshow else ['THE BUSINESS','BRIEF']):txt(d,(x-3,268+i*73),s,58,INK,True)
 d.rectangle((x,441,x+int(470*ease((t-.25)/.8)),446),fill=GOLD)
 txt(d,(x,478),'Inside the numbers.' if nextshow else 'Context. Conversation. Clarity.',25,INK)
 txt(d,(x,610),'STOCKS  /  ORIGINAL PROGRAMMING',16,TEAL,True)
 return im

def ticker(im,t):
 d=ImageDraw.Draw(im);d.rectangle((0,673,1280,720),fill=INK)
 message='ILLUSTRATIVE EXAMPLE    •    REVENUE $100m → $120m    •    OPERATING PROFIT $12m → $9.6m    •    MARGIN 12% → 8%    •    '
 stride=d.textlength(message,font=font(20));x=180-(t*95)%stride
 for i in range(3):txt(d,(x+i*stride,688),message,20,'white')
 d.rectangle((0,673,179,720),fill=TEAL);txt(d,(20,689),'EARNINGS / GUIDE',17,'white',True)
def lower(im,u):
 d=ImageDraw.Draw(im);x=int(-1220*(1-ease(u/.6)))
 # Independently animated accent ribbon, opaque headline and smaller context band.
 d.rectangle((x+42,541,x+942,578),fill=GOLD);txt(d,(x+61,550),'THE BUSINESS BRIEF',18,INK,True)
 d.rectangle((x+34,578,x+1238,636),fill='#f9faf9');txt(d,(x+60,588),'What matters beyond revenue?',36,INK,True)
 d.rectangle((x+42,636,x+1110,664),fill=TEAL);txt(d,(x+61,643),'MARGINS  /  CASH FLOW  /  OUTLOOK',15,'white',True)
 # A small moving sheen remains within the accent stripe.
 sx=x+42+int(u*90)%900;d.rectangle((sx,541,min(sx+32,x+942),545),fill='#f1d890')

def analysis(u,t):
 im=background(t);d=ImageDraw.Draw(im);bug(im)
 # A distinct segment board with a smaller moving globe and content-led reveal.
 small=globe(t).resize((270,270),Image.Resampling.LANCZOS);im.alpha_composite(small,(-80,120));d=ImageDraw.Draw(im)
 d.rectangle((220,104,1235,151),fill=TEAL);txt(d,(242,118),'EARNINGS EXPLAINED  /  OPERATING MARGIN',20,'white',True)
 txt(d,(241,188),'How much of each sales dollar',38,INK,True);txt(d,(241,235),'becomes operating profit?',38,INK,True)
 if u<4.3:
  q=ease(u/.7);x=244+int((1-q)*90)
  txt(d,(x,336),'OPERATING PROFIT',30,INK,True);d.line((x,389,x+496,389),fill=GOLD,width=5);txt(d,(x+126,416),'REVENUE',30,INK,True)
  txt(d,(815,368),'× 100',48,TEAL,True);txt(d,(245,548),'One measure of business profitability',23,TEAL)
 else:
  q=ease((u-4.3)/.65)
  for i,(tag,rev,profit,margin) in enumerate([('PERIOD 1','$100m','$12m','12%'),('PERIOD 2','$120m','$9.6m','8%')]):
   x=245+i*485;y=320+int((1-q)*50);txt(d,(x,y),tag,18,TEAL,True)
   txt(d,(x-5,y+37),margin,94,INK if i==0 else TEAL,True)
   d.rectangle((x,y+150,x+385,y+154),fill=GOLD)
   txt(d,(x,y+177),'REVENUE',17,'#617079');txt(d,(x+205,y+174),rev,24,INK,True)
   txt(d,(x,y+216),'OPERATING PROFIT',17,'#617079');txt(d,(x+205,y+212),profit,24,INK,True)
  txt(d,(595,375),'→',65,GOLD,True)
 txt(d,(242,616),'Illustrative example • Not market data',18,'#596873');ticker(im,t);return im

def frame(t):
 if t<5:im=globe_identity(t)
 elif t<13:
  im=Image.open(P.parent/'broadcast-motion-v2/frames'/f'{min(192,int((t-5)*24)+1):03d}.jpg').convert('RGBA');bug(im);lower(im,t-5);ticker(im,t)
 elif t<25.25:im=analysis(t-13,t)
 else:im=globe_identity(t-25.25,True)
 # A shared curved sweep bridges all scene changes.
 for cut in [5,13,25.25]:
  u=t-cut
  if 0<=u<.5:
   x=int(-1500+ease(u/.5)*3700);d=ImageDraw.Draw(im);d.ellipse((x-640,-420,x+640,1140),fill=TEAL);d.ellipse((x-570,-430,x+570,1130),fill=GOLD);d.ellipse((x-500,-440,x+500,1120),fill=WHITE)
 return im.convert('RGB')
proc=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s','1280x720','-r','24','-i','-','-an','-c:v','libx264','-threads','2','-preset','fast','-crf','18','-pix_fmt','yuv420p',str(P/'silent.mp4')],stdin=subprocess.PIPE)
for n in range(round(DURATION*FPS)):
 im=frame(n/FPS)
 if n in [72,168,480]:im.save(P/f'frame-{n}.png')
 proc.stdin.write(im.tobytes())
proc.stdin.close()
if proc.wait():raise RuntimeError('render failed')
# Keep original approved speech. The new graphics do not alter presenter identity or audio.
subprocess.run(['ffmpeg','-v','error','-y','-i',str(P/'silent.mp4'),'-i',str(P.parent/'program-package/open.mp3'),'-i',str(P.parent/'full-frame-review/source.mp4'),'-i',str(P.parent/'segment-review/scene-1.mp4'),'-i',str(P.parent/'program-package/next.mp3'),'-filter_complex','[1:a]apad,atrim=0:30.25[a];[2:a]atrim=0:8,asetpts=PTS-STARTPTS,adelay=5000|5000,apad,atrim=0:30.25[b];[3:a]atrim=0:12.25,asetpts=PTS-STARTPTS,adelay=13000|13000,apad,atrim=0:30.25[c];[4:a]adelay=25250|25250,apad,atrim=0:30.25[d];[a][b][c][d]amix=inputs=4:normalize=0[m]','-map','0:v','-map','[m]','-c:v','copy','-c:a','aac','-b:a','160k','-t','30.25','-movflags','+faststart',str(P/'Stocks-Original-Broadcast-Concept.mp4')],check=True)
print('Completed 30.25 seconds')
