'use strict';
const assert=require('node:assert/strict');
const {distance,atlas,TILE}=require('../wallpaper-hd/meniscus.js');
const alpha=new Uint8Array(11*11);alpha[5*11+5]=255;
const d=distance(alpha,11,11);
assert.equal(d[5*11+5],0);assert.equal(d[5*11+9],4);
assert.ok(Math.abs(d[8*11+8]-3*Math.SQRT2)<1e-5);
// All-transparent tiles must remain inactive, even beside a full opaque tile.
const rgba=new Uint8ClampedArray(1024*128*4);
for(let y=0;y<128;y++)for(let x=0;x<128;x++)rgba[(y*1024+x)*4+3]=255;
const result=atlas(rgba);
for(let y=0;y<TILE;y++)for(let x=TILE;x<result.width;x++)assert.equal(result.data[(y*result.width+x)*4],255);
// A padded contour retains the gradient direction on all four sides.
const pixel=(x,y)=>result.data.slice((y*result.width+x)*4,(y*result.width+x)*4+4);
assert.ok(pixel(20,96)[1]<10);assert.ok(pixel(171,96)[1]>245);
assert.ok(pixel(96,20)[2]<10);assert.ok(pixel(96,171)[2]>245);
for(let x=0;x<TILE;x++){assert.ok(pixel(x,0)[0]/255*32>=29);assert.ok(pixel(x,TILE-1)[0]/255*32>=29);}
assert.equal(pixel(96,96)[0],0);
console.log('PASS: contour distances, outward gradients, atlas padding and empty-cell isolation');
