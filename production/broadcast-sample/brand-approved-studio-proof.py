from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import subprocess,base64,re,io,sys
p=Path(sys.argv[1]).resolve(); root=Path(sys.argv[2]).resolve()
im=Image.new('RGBA',(1920,1080));d=ImageDraw.Draw(im)
navy='#101e30';ivory='#faf8f2';gold='#bfa36b';teal='#226b72'
def txt(x,y,s,n,c=ivory,b=False):
 f=ImageFont.truetype('/usr/share/fonts/opentype/urw-base35/NimbusSans-'+('Bold' if b else 'Regular')+'.otf',n);d.text((x,y),s,font=f,fill=c)
logo=Image.open(io.BytesIO(base64.b64decode(re.search('base64,([^\x27]+)',(root/'brand.mjs').read_text()).group(1)))).convert('RGBA');logo.thumbnail((44,57))
d.rectangle((1620,36,1878,115),fill=navy);im.alpha_composite(logo,(1638,46));txt(1698,54,'Stocks',45,b=True)
d.rectangle((50,40,420,80),fill=navy);txt(66,50,'PRESENTER / BRANDING PROOF',20)
d.rectangle((52,861,960,904),fill=gold);txt(78,873,'DAPHNE | STOCKS PRESENTER',25,navy,True)
d.rectangle((52,904,1868,974),fill=ivory);txt(78,919,'The business behind the numbers',40,navy,True)
d.rectangle((52,974,1868,1009),fill=teal);txt(78,984,'REVENUE  /  MARGINS  /  CASH FLOW',20)
d.rectangle((0,1010,1920,1080),fill=navy)
im.save(p/'overlay.png')
(p/'ticker.txt').write_text('STOCKS   •   Clear reporting starts with evidence   •   Revenue  /  Margins  /  Cash flow   •   AI presenter demonstration   •   ')
f=f"[0:v][1:v]overlay=0:0,drawtext=fontfile=/usr/share/fonts/opentype/urw-base35/NimbusSans-Regular.otf:textfile={p/'ticker.txt'}:fontsize=30:fontcolor=white:x=250-mod(t*130\\,tw):y=1031,drawtext=fontfile=/usr/share/fonts/opentype/urw-base35/NimbusSans-Regular.otf:textfile={p/'ticker.txt'}:fontsize=30:fontcolor=white:x=250+tw-mod(t*130\\,tw):y=1031,drawbox=x=0:y=1010:w=250:h=70:color=0x226b72:t=fill,drawtext=fontfile=/usr/share/fonts/opentype/urw-base35/NimbusSans-Bold.otf:text='STOCKS / BRIEF':fontsize=25:fontcolor=white:x=24:y=1033[v]"
subprocess.run(['ffmpeg','-v','error','-y','-threads','2','-i',str(p/'Daphne-approved-source.mp4'),'-i',str(p/'overlay.png'),'-filter_complex_threads','1','-filter_complex',f,'-map','[v]','-map','0:a','-c:v','libx264','-threads','2','-preset','fast','-crf','18','-pix_fmt','yuv420p','-c:a','copy','-movflags','+faststart',str(p/'Stocks-Daphne-Branded-Proof.mp4')],check=True)
