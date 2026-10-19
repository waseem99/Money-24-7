"""Composite a natively matted presenter over a clean studio plate.

Usage: python composite-studio-presenter.py presenter.webm studio.png output.mp4
Rejects opaque footage; never keys grey skin/clothing or regenerates faces.
"""
from pathlib import Path
import argparse, io, json, subprocess
from PIL import Image

def run(args):
 return subprocess.check_output(args)

def main():
 p=argparse.ArgumentParser();p.add_argument('presenter',type=Path);p.add_argument('plate',type=Path);p.add_argument('output',type=Path);a=p.parse_args()
 if a.output.exists():raise SystemExit('Output already exists; choose a new path')
 meta=json.loads(run(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(a.presenter)]))
 video=next(s for s in meta['streams'] if s['codec_type']=='video')
 decoder=['-c:v','libvpx-vp9'] if video['codec_name']=='vp9' else []
 duration=float(meta['format']['duration'])
 # Check actual decoded alpha at start and middle, not only container tags.
 for time in [0,duration/2]:
  png=run(['ffmpeg','-v','error','-threads','2',*decoder,'-i',str(a.presenter),'-ss',str(time),'-frames:v','1','-f','image2pipe','-c:v','png','-pix_fmt','rgba','-threads','2','-'])
  alpha=Image.open(io.BytesIO(png)).getchannel('A');lo,hi=alpha.getextrema()
  if lo>8 or hi<247:raise SystemExit('No usable native alpha: obtain transparent presenter output; opaque background will not be keyed')
 plate=Image.open(a.plate)
 if plate.size!=(1920,1080):raise SystemExit('Studio plate must be 1920x1080')
 if not any(s['codec_type']=='audio' for s in meta['streams']):raise SystemExit('Presenter audio missing')
 a.output.parent.mkdir(parents=True,exist_ok=True)
 subprocess.run(['ffmpeg','-v','error','-n','-loop','1','-i',str(a.plate),'-threads','2',*decoder,'-i',str(a.presenter),'-filter_complex_threads','1','-filter_complex','[1:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=black@0,format=rgba[p];[0:v][p]overlay=0:0:shortest=1,format=yuv420p[v]','-map','[v]','-map','1:a:0','-t',str(duration),'-c:v','libx264','-threads','2','-preset','fast','-crf','18','-c:a','aac','-b:a','192k','-movflags','+faststart',str(a.output)],check=True)
if __name__=='__main__':main()
