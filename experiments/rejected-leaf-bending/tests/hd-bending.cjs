const assert=require('node:assert/strict');
const S=require('../wallpaper-hd/settings.js'),{World}=require('../wallpaper-hd/world.js');
function scene(){
  let n=720;const w=new World(16/9,()=>((n=(Math.imul(n,1664525)+1013904223)>>>0)/4294967296));
  w.nextAmbient=Infinity;w.waves=[];w.leaves=w.leaves.slice(0,8);
  w.leaves.forEach((l,i)=>Object.assign(l,{x:(i%4-1.5)*.6,y:i<4?.4:-.4,sprite:i,contactState:i%3}));
  return w;
}
const windy=scene(),quiet=scene();windy.triggerBreeze();quiet.breezeEnabled=false;
for(let i=0;i<180;i++){windy.update(1/60);quiet.update(1/60);}
for(let i=0;i<8;i++)assert.ok(windy.leaves[i].bend>quiet.leaves[i].bend+.04,'every sprite responds visibly to the shared gust');
const before=windy.leaves.map(l=>l.bend);windy.breezeEnabled=false;
for(let i=0;i<600;i++)windy.update(1/60);
for(let i=0;i<8;i++)assert.ok(windy.leaves[i].bend<before[i],'curvature relaxes when the gust ends');
const waves=scene(),flat=scene();waves.breezeEnabled=flat.breezeEnabled=false;
waves.drop(.5,.5,1);let response=0;
for(let i=0;i<240;i++){
  waves.update(1/60);flat.update(1/60);
  response=Math.max(response,...waves.leaves.map((l,j)=>Math.abs(l.bend-flat.leaves[j].bend)));
}
assert.ok(response>.005,'passing waves also drive local curvature');
const snapshots=[];
for(const fps of [15,30,60,144]){
  const w=scene();w.triggerBreeze();const samples=[];
  for(let i=0;i<fps*12;i++){
    w.update(1/fps);
    for(const l of w.leaves)assert.ok(Number.isFinite(l.bend)&&l.bend>=0&&l.bend<=S.bend.max,'curvature stays finite and bounded');
    if((i+1)%fps===0)samples.push(w.leaves.map(l=>l.bend));
  }
  snapshots.push(samples);
}
for(const samples of snapshots)for(let t=0;t<samples.length;t++)for(let i=0;i<8;i++)
  assert.ok(Math.abs(samples[t][i]-snapshots[3][t][i])<.01,'curvature remains visually consistent at 15–144 Hz');
console.log(`PASS: eight leaf types follow gusts, relax, respond to waves (${response.toFixed(4)}), and keep bounded 15–144 Hz curvature.`);
