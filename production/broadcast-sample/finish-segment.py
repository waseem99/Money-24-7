from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import re,base64,io,subprocess,sys,json
root=Path(__file__).resolve().parent
p=Path(sys.argv[1]); p.mkdir(exist_ok=True,parents=True)
f='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'; b='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
def run(a):subprocess.run(['ffmpeg','-v','error','-y',*a],check=True)
for i in range(4):
 run(['-i',str(p/f'scene-{i}.mp4'),'-vf','scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=24','-af','aresample=48000','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-c:a','aac','-ar','48000','-ac','2',str(p/f'normalized-{i}.mp4')])
(p/'concat.txt').write_text(''.join(f"file 'normalized-{i}.mp4'\n" for i in range(4)))
run(['-f','concat','-safe','0','-i',str(p/'concat.txt'),'-c','copy',str(p/'joined.mp4')])
im=Image.new('RGBA',(1920,1080));d=ImageDraw.Draw(im)
def text(x,y,s,size=24): d.text((x,y),s,font=ImageFont.truetype(b,size),fill='white')
logo=Image.open(io.BytesIO(base64.b64decode(re.search('base64,([^\x27]+)',(root/'brand.mjs').read_text()).group(1)))).convert('RGBA');logo.thumbnail((34,42));d.rounded_rectangle((1640,25,1880,88),10,fill=(5,24,44,225));im.alpha_composite(logo,(1657,35));text(1709,39,'Stocks',29)
d.rectangle((0,990,1920,1080),fill='#071b30');d.rectangle((0,990,1920,994),fill='#b88e49');text(30,1003,'THE BUSINESS BRIEF',23);text(30,1043,'AI PRESENTERS / EXPLAINER',14)
im.save(p/'overlay.png')
(p/'ticker.txt').write_text(('EARNINGS CHECKLIST    /    REVENUE    /    OPERATING MARGIN    /    OPERATING CASH FLOW    /    MANAGEMENT OUTLOOK    /    EDUCATIONAL STUDIO DEMO    /    ')*10)
labels=[('BEYOND THE REVENUE HEADLINE','NORA  /  THE BUSINESS BRIEF'),('OPERATING MARGIN = OPERATING PROFIT / REVENUE','MARCUS  /  PROFITABILITY'),('PROFIT AND CASH FLOW CAN DIFFER','NORA  /  CASH GENERATION'),('REVENUE  /  MARGINS  /  CASH FLOW  /  OUTLOOK','MARCUS  /  YOUR EARNINGS CHECKLIST')]
for i,(headline,sub) in enumerate(labels):
 card=Image.new('RGBA',(1920,1080));c=ImageDraw.Draw(card);c.rectangle((24,865,1500,975),fill=(7,27,48,235));c.rectangle((24,865,30,975),fill='#b88e49');c.text((48,879),sub,font=ImageFont.truetype(b,18),fill='#e4c390');c.text((48,916),headline,font=ImageFont.truetype(b,29),fill='white');card.save(p/f'card-{i}.png')
args=['-i',str(p/'joined.mp4'),'-i',str(p/'overlay.png')]
for i in range(4):args+=['-i',str(p/f'card-{i}.png')]
durations=[]
for i in range(4):
 info=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','json',str(p/f'normalized-{i}.mp4')]))
 durations.append(float(info['format']['duration']))
bounds=[0]
for duration in durations:bounds.append(bounds[-1]+duration)
fc='[0:v][1:v]overlay=0:0[v0];'
for i in range(4):fc+=f"[v{i}][{i+2}:v]overlay=0:0:enable='between(t,{bounds[i]+0.5},{bounds[i+1]-0.25})'[v{i+1}];"
fc+=f"color=c=0x071b30:s=1500x80:r=24,drawtext=fontfile={f}:textfile={p/'ticker.txt'}:fontsize=25:fontcolor=white:x='-t*95':y=28[tick];[v4][tick]overlay=420:998:shortest=1[out]"
run([*args,'-filter_complex_threads','1','-filter_complex',fc,'-map','[out]','-map','0:a','-t',str(bounds[-1]),'-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-movflags','+faststart',str(p/'Stocks-The-Business-Brief.mp4')])
