const assert=require('node:assert/strict');
const {WaterWorld,STEP}=require('../wallpaper/simulation.js');
const w=new WaterWorld(16/9);
assert.equal(w.leaves.length,14); assert.equal(w.drops.length,10);
// Independent analytic reference and two triangle cross products.
for(const d of w.drops) d.amp=0;
Object.assign(w.drops[0],{x:.5,y:.5,amp:2,radius:12});
function reference(x,y) {
  const r=Math.hypot(.5*w.cols-x,.5*w.rows-y);
  return r<12?Math.sin(12-r)*2*r/144:0;
}
const x=Math.floor(w.cols/2)+4,y=Math.floor(w.rows/2)+2;
const a=reference(x,y),b=reference(x+1,y),c=reference(x,y+1),d=reference(x+1,y+1);
const cross=(p,q)=>[p[1]*q[2]-p[2]*q[1],p[2]*q[0]-p[0]*q[2]];
const n1=cross([w.dx,0,b-a],[0,w.dy,c-a]);
const n2=cross([w.dx,w.dy,d-a],[0,w.dy,c-a]);
const uv=w.rippleMesh(),k=(y*(w.cols+1)+x)*2;
assert.ok(Math.abs(uv[k]-(x/w.cols+n1[0]+n2[0]))<1e-6);
assert.ok(Math.abs(uv[k+1]-(y/w.rows+n1[1]+n2[1]))<1e-6);
// A falling leaf produces one landing ripple, reduces spin once, then drifts.
const l=w.leaves[0]; l.altitude=.001;l.landed=false;l.spin=.4;
w.update(STEP);w.update(STEP);
assert.equal(l.landed,true);assert.equal(l.spin,.1);
const oldY=l.y;w.update(STEP);assert.ok(l.y<oldY);assert.equal(l.spin,.1);
// Recycling + sustained state: ten simulated minutes, assorted aspect ratios.
let recycled=0;
for(let i=0;i<20000;i++) {
  w.update(STEP);
  if(i%100===0) {w.addDrop(Math.random(),Math.random());recycled+=w.leaves.filter(l=>l.altitude>0).length;}
}
assert.ok(recycled>0);
for(const aspect of [480/800,16/9,21/9,32/9]) {
  w.resize(aspect);
  assert.ok(w.rippleMesh().every(Number.isFinite));
  assert.ok((w.cols+1)*(w.rows+1)<65536);
  for(const l of w.leaves) assert.ok([l.x,l.y,l.angle,l.altitude].every(Number.isFinite));
}
console.log('PASS: analytic ripple / triangle normals, landing once, drift, recycling, 10-minute state, portrait/16:9/21:9/32:9 grids.');
