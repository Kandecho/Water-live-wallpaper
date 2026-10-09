/* Browser/engine lifecycle and input only. Apache-2.0. */
'use strict';
(async function(){
  const config=WaterSettings,canvas=document.getElementById('water');
  const query=new URLSearchParams(location.search),isPreview=query.has('preview');
  const previewScript=new URL('preview-controls.js',document.currentScript.src).href;
  const options=Object.fromEntries(config.features.map(f=>[f.key,f.enabled]));options.paused=false;
  const world=new WaterHD.World(innerWidth/innerHeight);
  world.breezeEnabled=options.breeze;
  let preview,renderer,enginePaused=false,fpsLimit=config.render.maxFPS,last=0,budget=0,meterStart=0,draws=0,pointer=null;
  function resetClock(){last=0;budget=0;meterStart=0;draws=0;pointer=null;}
  function inactive(){return options.paused||enginePaused||document.hidden;}
  window.wallpaperPropertyListener={
    setPaused(value){enginePaused=!!value;resetClock();},
    applyGeneralProperties(p){if(p.fps>0){fpsLimit=Math.min(config.render.maxFPS,p.fps);resetClock();}}
  };
  document.addEventListener('visibilitychange',resetClock);
  function point(e){const r=canvas.getBoundingClientRect();return {u:(e.clientX-r.left)/r.width,v:(e.clientY-r.top)/r.height,t:world.time};}
  canvas.addEventListener('pointerdown',e=>{
    if(e.button!==0||inactive())return;
    pointer=point(e);pointer.id=e.pointerId;world.drop(pointer.u,pointer.v,config.input.clickStrength);
    canvas.setPointerCapture(e.pointerId);e.preventDefault();
  });
  canvas.addEventListener('pointermove',e=>{
    if(!pointer||pointer.id!==e.pointerId||inactive())return;
    const p=point(e),distance=Math.hypot((p.u-pointer.u)*world.width,(p.v-pointer.v)*world.height);
    if(p.t-pointer.t>config.input.cadence&&distance>config.input.spacing){world.drop(p.u,p.v,config.input.dragStrength);pointer={...p,id:e.pointerId};}
  });
  for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,()=>{pointer=null;});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();enginePaused=true;resetClock();});
  canvas.addEventListener('webglcontextrestored',()=>location.reload());
  if(isPreview){
    await new Promise((resolve,reject)=>{
      const script=document.createElement('script');script.src=previewScript;
      script.onload=resolve;script.onerror=()=>reject(new Error('预览控件加载失败'));document.head.append(script);
    });
    preview=WaterPreview.create({config,world,options,onChange(reset){if(reset)resetClock();renderer?.draw();}});
  }
  renderer=await WaterRenderer.create(canvas,world,options);
  function resize(){renderer.resize(innerWidth,innerHeight,devicePixelRatio||1);resetClock();renderer.draw();}
  window.addEventListener('resize',resize);resize();
  function frame(now){
    requestAnimationFrame(frame);
    if(inactive()){resetClock();return;}
    if(!last){last=now;meterStart=now;return;}
    const dt=Math.min((now-last)/1000,.2);last=now;world.update(dt);budget+=dt;
    const interval=1/fpsLimit;
    if(budget+1e-5>=interval){renderer.draw();preview?.updateWind();draws++;budget=Math.max(0,budget-interval)%interval;}
    if(now-meterStart>=1000){preview?.updateFPS(Math.round(draws*1000/(now-meterStart)));draws=0;meterStart=now;}
  }
  requestAnimationFrame(frame);
})().catch(e=>{const box=document.getElementById('error');box.hidden=false;box.textContent='水面暂时无法显示：'+e.message;console.error(e);});
