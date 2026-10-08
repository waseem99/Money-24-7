import {writeFile} from 'node:fs/promises';
// Original procedural ident/bed: no licensed recording, no external provider.
// Low sustained harmonics under speech; a restrained swell in the opening.
export async function soundtrack(file,duration=300) {
  const rate=48000,count=Math.round(duration*rate);const bytes=Buffer.alloc(44+count*4);
  bytes.write('RIFF',0);bytes.writeUInt32LE(bytes.length-8,4);bytes.write('WAVEfmt ',8);bytes.writeUInt32LE(16,16);bytes.writeUInt16LE(1,20);bytes.writeUInt16LE(2,22);bytes.writeUInt32LE(rate,24);bytes.writeUInt32LE(rate*4,28);bytes.writeUInt16LE(4,32);bytes.writeUInt16LE(16,34);bytes.write('data',36);bytes.writeUInt32LE(count*4,40);
  for(let n=0;n<count;n++) {
    const t=n/rate;const fade=Math.min(1,t/2,(duration-t)/2);const level=t<15?.045*(.4+.6*Math.sin(Math.PI*t/30)):.002;
    const frequencies=[130.8128,195.9977,261.6256,293.6648];
    const value=frequencies.reduce((sum,f,i)=>sum+Math.sin(2*Math.PI*f*t)*(.7+.3*Math.sin(t*.7+i))/(i+2),0)*level*fade;
    bytes.writeInt16LE(Math.round(value*32767),44+n*4);bytes.writeInt16LE(Math.round(value*.96*32767),46+n*4);
  }
  await writeFile(file,bytes,{mode:0o600});
}
