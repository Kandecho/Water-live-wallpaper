'use strict';
const assert=require('node:assert/strict');
const {distance,atlas,TILE,PAD}=require('../wallpaper-hd/meniscus.js');
const alpha=new Uint8Array(11*11);alpha[5*11+5]=255;
const d=distance(alpha,11,11);
assert.equal(d[5*11+5],0);assert.equal(d[5*11+9],4);
assert.ok(Math.abs(d[8*11+8]-3*Math.SQRT2)<1e-5);
// A square silhouette makes wet/dry coverage and field derivatives measurable.
const rgba=new Uint8ClampedArray(1024*128*4);
for(let y=0;y<128;y++)for(let x=0;x<128;x++)rgba[(y*1024+x)*4+3]=255;
const result=atlas(rgba);
const pixel=(x,y)=>result.data.slice((y*result.width+x)*4,(y*result.width+x)*4+4);
// Unoccupied cells and the outer padding contain no height or gradient.
for(let y=0;y<TILE;y++)for(let x=TILE;x<result.width;x++)assert.deepEqual([...pixel(x,y)],[0,128,128,255]);
for(let y=0;y<TILE;y++)for(let x=0;x<TILE;x++)if(x<PAD-9||x>PAD+136||y<PAD-9||y>PAD+136)assert.deepEqual([...pixel(x,y)],[0,128,128,255]);
// Most of the boundary is dry; a few genuine nonzero contact patches remain.
let wet=0,total=0;
for(let i=0;i<128;i++)for(const [x,y]of[[PAD+i,PAD-1],[PAD+i,PAD+128],[PAD-1,PAD+i],[PAD+128,PAD+i]]){total++;if(pixel(x,y)[0]>8)wet++;}
assert.ok(wet>20&&wet/total<.35,`contact coverage ${wet}/${total}`);
// GB differentiates the entire depression, including the tangential ends.
for(let y=1;y<TILE-1;y++)for(let x=1;x<TILE-1;x++){
  const p=pixel(x,y),gx=(pixel(x-1,y)[0]-pixel(x+1,y)[0])/510,gy=(pixel(x,y-1)[0]-pixel(x,y+1)[0])/510;
  assert.ok(Math.abs((p[1]-128)/127*.5-gx)<.006);
  assert.ok(Math.abs((p[2]-128)/127*.5-gy)<.006);
}
console.log(`PASS: compact contact field, dry edge coverage (${wet}/${total}), height derivatives and atlas isolation`);
