/* Input regressions run the real app with rendering stubbed out. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=process.env.WATER_TEST_ROOT||path.join(__dirname,'..');
const source=fs.readFileSync(path.join(root,'wallpaper-hd/app.js'),'utf8');
const config=require(path.join(root,'wallpaper-hd/settings.js'));
function target(){
  const listeners=new Map();
  return {
    addEventListener(name,fn){if(!listeners.has(name))listeners.set(name,[]);listeners.get(name).push(fn);},
    emit(name,event={}){for(const fn of listeners.get(name)||[])fn(event);}
  };
}
async function boot(){
  const canvas=Object.assign(target(),{getBoundingClientRect:()=>({left:0,top:0,width:1000,height:1000}),setPointerCapture(){}});
  const error={hidden:true};
  const document=Object.assign(target(),{hidden:false,currentScript:{src:'file:///wallpaper-hd/app.js'},getElementById:id=>id==='water'?canvas:error});
  const window=target(),drops=[];let world;
  const context={document,window,location:{search:''},URL,URLSearchParams,innerWidth:1000,innerHeight:1000,devicePixelRatio:1,
    console,requestAnimationFrame(){},WaterSettings:config,
    WaterHD:{World:class{constructor(){world=this;this.time=0;this.width=2;this.height=2;}drop(...values){drops.push(values);}}},
    WaterRenderer:{create:async()=>({resize(){},draw(){}})}};
  await vm.runInNewContext(source,context);
  assert.equal(error.hidden,true,'app initialization succeeds');
  return {canvas,document,window,world,drops};
}
function pointer(buttons,x=100,extra={}){
  return {button:0,buttons,pointerId:1,pointerType:'mouse',clientX:x,clientY:100,preventDefault(){},...extra};
}
(async()=>{
  for(const pointerType of ['mouse','touch','pen']){
    const h=await boot();
    h.canvas.emit('pointermove',pointer(0,100,{pointerType}));assert.equal(h.drops.length,0,'hover alone does not ripple');
    h.canvas.emit('pointerdown',pointer(1,100,{pointerType}));assert.equal(h.drops[0][2],config.input.clickStrength);
    h.world.time=1;h.canvas.emit('pointermove',pointer(1,500,{pointerType}));
    assert.equal(h.drops.length,2,`${pointerType}: held primary button drags`);
    assert.equal(h.drops[1][2],config.input.dragStrength);
    h.world.time=2;h.canvas.emit('pointermove',pointer(0,800,{pointerType}));
    assert.equal(h.drops.length,2,`${pointerType}: missing pointerup does not leave hover ripples`);
    h.world.time=3;h.canvas.emit('pointermove',pointer(1,900,{pointerType}));
    assert.equal(h.drops.length,2,'cleared drag cannot resume without a new press');
    h.canvas.emit('pointerdown',pointer(1,100,{pointerType}));
    h.world.time=4;h.canvas.emit('pointermove',pointer(1,500,{pointerType}));
    assert.equal(h.drops.length,4,'a new press can drag again');
  }
  for(const reason of ['pointerup','pointercancel','lostpointercapture','blur','visibilitychange','engine-pause']){
    const h=await boot();h.canvas.emit('pointerdown',pointer(1));
    if(reason==='blur')h.window.emit('blur');
    else if(reason==='visibilitychange')h.document.emit(reason);
    else if(reason==='engine-pause'){h.window.wallpaperPropertyListener.setPaused(true);h.window.wallpaperPropertyListener.setPaused(false);}
    else h.canvas.emit(reason,pointer(0));
    h.world.time=1;h.canvas.emit('pointermove',pointer(1,500));
    assert.equal(h.drops.length,1,`${reason}: stale drag is cleared even if the next event reports a held button`);
  }
  const h=await boot();h.canvas.emit('pointerdown',pointer(1));
  h.world.time=1;h.canvas.emit('pointermove',pointer(0,500,{pointerId:2}));
  h.canvas.emit('pointermove',pointer(1,500));assert.equal(h.drops.length,2,'another pointer cannot clear the active drag');
  h.world.time=2;h.canvas.emit('pointermove',pointer(2,900));assert.equal(h.drops.length,2,'right button alone cannot continue a left drag');
  const timing=await boot();timing.canvas.emit('pointerdown',pointer(1));
  timing.world.time=config.input.cadence/2;timing.canvas.emit('pointermove',pointer(1,500));assert.equal(timing.drops.length,1,'drag cadence remains enforced');
  timing.world.time=1;timing.canvas.emit('pointermove',pointer(1,101));assert.equal(timing.drops.length,1,'drag spacing remains enforced');
  timing.canvas.emit('pointermove',pointer(1,500));assert.equal(timing.drops.length,2,'valid drag still ripples');
  console.log('PASS: missed release, blur, lifecycle resets, pointer isolation, mouse/touch/pen drag, cadence and spacing.');
})().catch(error=>{console.error(error);process.exitCode=1;});
