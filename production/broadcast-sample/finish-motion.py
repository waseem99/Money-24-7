from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import re,base64,io,subprocess,sys
root=Path(__file__).resolve().parent
p=Path(sys.argv[1])
im=Image.new('RGBA',(1920,1080));d=ImageDraw.Draw(im)
f='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';b='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
def t(x,y,s,size=24):d.text((x,y),s,font=ImageFont.truetype(b,size),fill='white')
logo=Image.open(io.BytesIO(base64.b64decode(re.search('base64,([^\x27]+)',(root/'brand.mjs').read_text()).group(1)))).convert('RGBA');logo.thumbnail((34,42));d.rounded_rectangle((1640,25,1880,88),10,fill=(5,24,44,225));im.alpha_composite(logo,(1657,35));t(1709,39,'Stocks',29)
d.rectangle((0,990,1920,1080),fill='#071b30');d.rectangle((0,990,1920,994),fill='#b88e49');t(30,1003,'THE BUSINESS BRIEF',23);t(30,1043,'AI NEWSROOM • MOTION TEST',14)
im.save(p/'overlay.png');(p/'ticker.txt').write_text('BEYOND REVENUE    /    MARGINS    /    CASH FLOW    /    SUSTAINABLE GROWTH    /    STUDIO DEMONSTRATION    /    '*3)
filt=f"[0:v]crop=1102:620:394:0,scale=1920:1080[v];[v][1:v]overlay=0:0[base];color=c=0x071b30:s=1500x80:r=24,drawtext=fontfile={f}:textfile={p/'ticker.txt'}:fontsize=25:fontcolor=white:x='-t*95':y=28[tick];[base][tick]overlay=420:998:shortest=1[out]"
subprocess.run(['ffmpeg','-v','error','-y','-i',str(p/'source.mp4'),'-i',str(p/'overlay.png'),'-filter_complex_threads','1','-filter_complex',filt,'-map','[out]','-map','0:a','-t','8','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-c:a','copy','-movflags','+faststart',str(p/'Stocks-Newsroom-Motion-Proof.mp4')],check=True)
