const assert=require('node:assert/strict');
const S=require('../wallpaper-hd/settings.js');
const {Scheduler,seeded}=require('../wallpaper-hd/wind.js');
const config=structuredClone(S.wind);
config.gap=[3,3];config.gusts.gentle.wait=config.gusts.strong.wait=[1,1];
const queue=new Scheduler(()=>.5,config);
queue.advance(1);assert.equal(queue.active.kind,'gentle');
const first=queue.active;queue.request('strong',2);queue.request('gentle',3);
assert.equal(queue.active,first,'manual requests never restart or interrupt active wind');
queue.advance(14);assert.equal(queue.active,null);assert.equal(queue.next.strong,1,'overdue gust remains pending');
queue.advance(16.99);assert.equal(queue.active,null,'quiet gap is respected');
queue.advance(17);assert.equal(queue.active.kind,'strong');assert.equal(queue.active.start,17);
queue.advance(30);assert.equal(queue.active.kind,'gentle','oldest pending type wins without starvation');
assert.equal(queue.active.start,30);

const w=new Scheduler(seeded(47)),ends={gentle:0,strong:0},counts={gentle:0,strong:0};
let previousEnd=-Infinity,lastDirection,changes=0;
for(let i=0;i<500;i++){
 const at=w.boundary(),ending=w.active;
 w.advance(at);
 if(ending){
  ends[ending.kind]=at;previousEnd=at;
  const wait=w.next[ending.kind]-at,[low,high]=S.wind.gusts[ending.kind].wait;
  assert.ok(wait>=low-1e-9&&wait<=high+1e-9,'next wait starts at this type’s actual end');
  assert.ok(w.readyAt-at>=2-1e-9&&w.readyAt-at<=5+1e-9);
 }else{
  const gust=w.active,g=S.wind.gusts[gust.kind];counts[gust.kind]++;
  assert.ok(gust.start>=previousEnd+2-1e-9,'gusts never overlap and always leave quiet time');
  assert.ok(gust.start>=ends[gust.kind]+g.wait[0]-1e-9);
  assert.equal(gust.end-gust.start,g.duration);
  assert.ok(gust.direction>=0&&gust.direction<Math.PI*2);
  if(lastDirection!==undefined&&lastDirection!==gust.direction)changes++;
  lastDirection=gust.direction;
  const before=JSON.stringify({next:w.next,active:w.active}),out={};
  for(let j=0;j<20;j++){w.sample(at+j*g.duration/20,out);assert.equal(out.x,gust.x);assert.equal(out.y,gust.y);}
  assert.equal(JSON.stringify({next:w.next,active:w.active}),before,'sampling never changes scheduling or direction');
  w.sample(at,out);assert.equal(out.strength,0);w.sample(at+g.duration/2,out);assert.equal(out.strength,1);
  w.sample(at+g.duration,out);assert.equal(out.strength,0);
 }
}
assert.ok(counts.gentle>counts.strong*2&&counts.strong>20,'both types recur with strong wind rarer');
assert.ok(changes>200,'successive gusts choose new directions');
const events=[];
for(const fps of [15,30,60,144]){
 const scheduler=new Scheduler(seeded(17)),record=[];let last=null;
 for(let i=0;i<fps*600;i++){
  scheduler.advance((i+1)/fps);
  if(scheduler.active&&scheduler.active!==last){record.push({...scheduler.active});last=scheduler.active;}
 }
 events.push(record);
}
for(const record of events)assert.deepEqual(record,events[0],'event times, kinds and directions are identical at every FPS');
const preview=new Scheduler(()=>.42);preview.request('strong',0);const active=preview.active;
for(let i=0;i<50;i++){preview.request('strong',0);preview.request('gentle',0);}
assert.equal(preview.active,active);assert.equal(preview.next.gentle,0);
preview.advance(10);const ready=preview.readyAt;preview.request('strong',10);
assert.equal(preview.active,null,'manual requests also respect the quiet gap');
preview.advance(ready);assert.equal(preview.active.kind,'gentle','repeated clicks cannot jump the pending order');
assert.throws(()=>preview.request('rare',ready),/Unknown gust/);
console.log(`PASS: random waits and directions, mutual exclusion, deferred queue, quiet gaps, no starvation/backlog, read-only sampling and identical 15–144 Hz schedules (${counts.gentle} gentle / ${counts.strong} strong).`);
