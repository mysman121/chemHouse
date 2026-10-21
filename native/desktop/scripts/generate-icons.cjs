'use strict';
// Native app icon derived from the website's green chemistry mark; no external assets.
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const out = path.join(__dirname, '../build'); fs.mkdirSync(out, { recursive: true });
function crc32(data) {
  let crc = 0xffffffff;
  for (const byte of data) { crc ^= byte; for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0); }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const name = Buffer.from(type), length = Buffer.alloc(4), crc = Buffer.alloc(4);
  length.writeUInt32BE(data.length); crc.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, crc]);
}
function png(size) {
  const pixels = Buffer.alloc((size * 4 + 1) * size);
  const points = Array.from({ length: 6 }, (_, i) => ({ x: .5 + .29 * Math.cos(Math.PI / 3 * i - Math.PI / 6), y: .5 + .29 * Math.sin(Math.PI / 3 * i - Math.PI / 6) }));
  const lineDistance = (x,y,a,b) => { const vx=b.x-a.x,vy=b.y-a.y,t=Math.max(0,Math.min(1,((x-a.x)*vx+(y-a.y)*vy)/(vx*vx+vy*vy)));return Math.hypot(x-a.x-t*vx,y-a.y-t*vy); };
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const px=(x+.5)/size,py=(y+.5)/size;
    const cx=Math.max(.19,Math.min(.81,px)),cy=Math.max(.19,Math.min(.81,py));
    const inside=Math.hypot(px-cx,py-cy)<.18;
    const ring=points.some((p,i)=>lineDistance(px,py,p,points[(i+1)%6])<.022);
    const center=Math.hypot(px-.5,py-.5);
    const accent=ring||(center>.095&&center<.13);
    const color=accent?[204,231,143]:[33,75,61];
    const offset=y*(size*4+1)+1+x*4;
    pixels.set([...color,inside?255:0],offset);
  }
  const header=Buffer.alloc(13);header.writeUInt32BE(size);header.writeUInt32BE(size,4);header[8]=8;header[9]=6;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',zlib.deflateSync(pixels)),chunk('IEND',Buffer.alloc(0))]);
}
const icon=png(512);fs.writeFileSync(path.join(out,'icon.png'),icon);
const small=png(256),ico=Buffer.alloc(22);ico.writeUInt16LE(1,2);ico.writeUInt16LE(1,4);ico.writeUInt16LE(1,10);ico.writeUInt16LE(32,12);ico.writeUInt32LE(small.length,14);ico.writeUInt32LE(22,18);
fs.writeFileSync(path.join(out,'icon.ico'),Buffer.concat([ico,small]));
const high=png(1024),icnsPart=(name,data)=>{const h=Buffer.alloc(8);h.write(name);h.writeUInt32BE(data.length+8,4);return Buffer.concat([h,data]);};
const pieces=Buffer.concat([icnsPart('ic09',icon),icnsPart('ic10',high)]),head=Buffer.alloc(8);head.write('icns');head.writeUInt32BE(pieces.length+8,4);
fs.writeFileSync(path.join(out,'icon.icns'),Buffer.concat([head,pieces]));
console.log('Generated PNG, ICO and ICNS icons.');
