const assert=require('node:assert/strict');
const S=require('../wallpaper-hd/settings.js');
const {World}=require('../wallpaper-hd/world.js');
const {seeded}=require('../wallpaper-hd/wind.js');
function scene(){
 const w=new World(16/9,()=>.42,seeded(32));w.waves=[];w.nextAmbient=Infinity;
 w.leaves=w.leaves.slice(0,1);Object.assign(w.leaves[0],{x:0,y:1});w.width=w.height=100;return w;
}
for(const kind of ['gentle','strong']){
 const w=scene();w.triggerBreeze(kind);const duration=S.wind.gusts[kind].duration;
 w.update(duration/2);
 assert.equal(w.sampleBreeze().strength,1);
 const p=[.23,-.4],on=w.sample(...p,[]),epsilon=1e-5;
 for(let axis=0;axis<2;axis++){
  const a=p.slice(),b=p.slice();a[axis]+=epsilon;b[axis]-=epsilon;
  const derivative=(w.sample(...a,[])[2]-w.sample(...b,[])[2])/(2*epsilon);
  assert.ok(Math.abs(derivative-on[axis])<1e-8,'wind normals match water height');
 }
 const before=JSON.stringify(w.wind.active);w.breezeEnabled=false;
 assert.notDeepEqual(w.sample(...p,[]),on);w.breezeEnabled=true;
 assert.deepEqual(w.sample(...p,[]),on);assert.equal(JSON.stringify(w.wind.active),before);
 const state=JSON.stringify(w.leaves),time=w.time;w.triggerBreeze(kind);
 assert.equal(JSON.stringify(w.leaves),state);assert.equal(w.time,time);assert.equal(w.sampleBreeze().strength,1,'repeated preview request never restarts active pulse');
}
const drift=[];
for(const kind of ['gentle','strong']){
 const windy=scene(),still=scene();windy.triggerBreeze(kind);still.triggerBreeze(kind);still.breezeEnabled=false;
 for(let i=0;i<600;i++){
  windy.update(1/60);still.update(1/60);
  assert.ok(Math.hypot(windy.leaves[0].breezeX,windy.leaves[0].breezeY)<=windy.wind.effect.driftSpeed+1e-9);
 }
 drift.push(Math.hypot(windy.leaves[0].x-still.leaves[0].x,windy.leaves[0].y-still.leaves[0].y));
 windy.breezeEnabled=false;const speed=Math.hypot(windy.leaves[0].breezeX,windy.leaves[0].breezeY);
 windy.update(.1);assert.ok(Math.hypot(windy.leaves[0].breezeX,windy.leaves[0].breezeY)<speed);
}
assert.ok(drift[1]>drift[0]*1.7,'strong gust visibly increases drift');
const runs=[];
for(const fps of [15,30,60,144]){
 const w=scene(),samples=[];
 for(let i=0;i<fps*360;i++){
  w.update(1/fps);
  if((i+1)%fps===0){const l=w.leaves[0];samples.push([l.x,l.y,l.breezeX,l.breezeY]);}
 }
 runs.push(samples);
}
for(const run of runs)for(let i=0;i<run.length;i++)for(let axis=0;axis<4;axis++)
 assert.ok(Math.abs(run[i][axis]-runs[3][i][axis])<.003,'mixed random gusts preserve frame-rate independent drift');
const turns=[];
for(const fps of [15,30,60,144]){
 const windy=scene(),still=scene();windy.triggerBreeze('strong');still.breezeEnabled=false;
 for(const w of [windy,still])Object.assign(w.leaves[0],{altitude:.65,spin:-.12});
 for(let i=0;i<fps*5;i++){windy.update(1/fps);still.update(1/fps);}
 turns.push(windy.leaves[0].angle-still.leaves[0].angle);
 assert.equal(windy.leaves[0].altitude,0);assert.equal(windy.waves.length,1);
 const angle=windy.leaves[0].angle;windy.update(1/fps);
 assert.ok(Math.abs(windy.leaves[0].angle-angle-windy.leaves[0].spin/fps)<1e-12,'extra spin stops on water');
}
assert.ok(turns[3]<-.2,'airborne leaves turn with the gust');
for(const turn of turns)assert.ok(Math.abs(turn-turns[3])<.003);
console.log('PASS: both gust strengths, analytic normals, paused comparison, repeat requests, bounded drift, mixed-wind 15–144 Hz trajectories and airborne rotation/landing.');
