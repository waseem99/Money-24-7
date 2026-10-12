"""No-cost segmentation of an already-generated paid Marcus MP4 using RVM.
Reference model: PeterL1n/RobustVideoMatting, GPL-3.0; public pre-trained TorchScript model.
Does not call HeyGen. Video retains original playback rate but audio remains in source MP4.
"""
import os
import json
import subprocess
import sys
import numpy as np
import torch

if len(sys.argv) != 4:
    raise SystemExit("Usage: python matte-marcus.py input.mp4 model.torchscript output.webm")
video, weight, dest = sys.argv[1:4]
torch.set_num_threads(3)
model = torch.jit.load(weight, map_location="cpu").eval()
if not os.path.isfile(video):raise SystemExit("Missing already-generated Marcus MP4")
info = subprocess.check_output(
    ["ffprobe","-v","error","-show_entries","format=duration","-of","json",video],
    text=True)
duration = float(json.loads(info)["format"]["duration"])
if not 5 < duration < 18:
    raise SystemExit("Existing source duration outside quality-test range")
w,h,fps=960,540,30
decode = subprocess.Popen(["ffmpeg","-v","error","-i",video,"-vf",f"fps={fps},scale={w}:{h}",
  "-f","rawvideo","-pix_fmt","rgb24","-"], stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
encode = subprocess.Popen(["ffmpeg","-hide_banner","-loglevel","error","-y",
  "-f","rawvideo","-pix_fmt","rgba","-s",f"{w}x{h}","-r",str(fps),"-i","pipe:0",
  "-an","-c:v","libvpx-vp9","-b:v","1.7M","-deadline","realtime","-cpu-used","5",
  "-pix_fmt","yuva420p","-auto-alt-ref","0","-movflags","+faststart",dest],
  stdin=subprocess.PIPE, stderr=subprocess.PIPE)
rec=[None]*4
count=0
minAlpha=1.0
try:
    with torch.inference_mode():
        while True:
            frame = decode.stdout.read(w*h*3)
            if len(frame)!=w*h*3:break
            rgb=np.frombuffer(frame,dtype=np.uint8).reshape(h,w,3).copy()
            src=torch.from_numpy(rgb).permute(2,0,1).unsqueeze(0).float().div_(255)
            fg,alpha,*rec=model(src,*rec,0.5)
            rgba=torch.cat([fg,alpha],dim=1)[0].mul(255).clamp(0,255).byte()
            out=rgba.permute(1,2,0).contiguous().numpy().tobytes()
            encode.stdin.write(out)
            count+=1
            if count%60==0: print("MATTED_FRAMES",count,flush=True)
except Exception as e:
    print("MATTING_EXCEPTION",str(e)[:300],file=sys.stderr)
    raise
finally:
    try: decode.stdout.close()
    except:pass
    try: encode.stdin.close()
    except:pass
exitCode=encode.wait(timeout=120)
decode.wait(timeout=20)
if exitCode!=0 or count<140:
    raise SystemExit("Video output failed: "+str(exitCode)+" frames "+str(count)+" "+encode.stderr.read().decode(errors="ignore")[-400:])
p=subprocess.check_output(["ffprobe","-v","error","-show_entries","stream=width,height:stream_tags=alpha_mode","-of","json",dest],text=True)
info=json.loads(p)
print("STOCKS_MARCUS_MATTE_QA="+json.dumps({"frames":count,"inputDuration":duration,
  "output":os.path.basename(dest),"video":info,"paidHeyGenRequests":0}),flush=True)
