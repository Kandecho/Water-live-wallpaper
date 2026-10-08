const assert=require('node:assert/strict');
const {World,MAX_WAVES}=require('../wallpaper-hd/world.js');
function seeded(){let n=420;return ()=>((n=(Math.imul(n,1664525)+1013904223)>>>0)/4294967296);}
const world=new World(16/9,seeded());
world.waves=[];world.drop(.5,.5);world.time=.8;
const p=[.5,.12],s=world.sample(...p,new Float64Array(3)),eps=1e-5;
for(let axis=0;axis<2;axis++){
  const a=p.slice(),b=p.slice();a[axis]+=eps;b[axis]-=eps;
  const dh=(world.sample(...a,[])[2]-world.sample(...b,[])[2])/(2*eps);
  assert.ok(Math.abs(dh-s[axis])<1e-6,'normal must agree with wave height derivative');
}
for(let i=0;i<50;i++)world.drop(.99,.5);
assert.equal(world.waves.length,MAX_WAVES);
const results=[];
for(const fps of [15,30,60,144]){
  const w=new World(16/9,seeded());
  for(let i=0;i<fps*10;i++)w.update(1/fps);
  assert.ok(Math.abs(w.time-10)<1e-9);
  results.push(w.leaves.map(l=>[l.x,l.y,l.angle]));
}
for(const leaves of results)for(let i=0;i<14;i++)for(let j=0;j<3;j++)
  assert.ok(Math.abs(leaves[i][j]-results[3][i][j])<.002,'drift must not depend on frame rate');
const fall=new World(16/9,seeded());fall.nextAmbient=Infinity;fall.waves=[];
fall.leaves[0].altitude=.001;fall.update(.03);assert.equal(fall.waves.length,1);
fall.update(.03);assert.equal(fall.waves.length,1,'one landing, one ripple');
for(let i=0;i<36000;i++)world.update(1/60);
assert.equal(world.leaves.length,14);
for(const aspect of [480/800,16/9,21/9,32/9]){
  world.resize(aspect);assert.ok(world.mesh().every(Number.isFinite));
  assert.ok((world.cols+1)*(world.rows+1)<65536);
  for(const l of world.leaves)for(const key of ['x','y','angle','altitude','slopeX','slopeY','bob'])assert.ok(Number.isFinite(l[key]));
}
console.log('PASS: analytic normals, 15/30/60/144 Hz timing, bounded waves, single landing, 10-minute state, portrait through 32:9.');
