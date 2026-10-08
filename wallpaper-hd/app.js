/* Browser/engine lifecycle and input only. Apache-2.0. */
'use strict';
(async function(){
  const config=WaterSettings,canvas=document.getElementById('water'),panel=document.getElementById('controls');
  const options=Object.fromEntries(config.features.map(f=>[f.key,f.enabled]));options.paused=false;
  const world=new WaterHD.World(innerWidth/innerHeight);
  let renderer,enginePaused=false,fpsLimit=config.render.maxFPS,last=0,budget=0,meterStart=0,draws=0,pointer=null;
  function resetClock(){last=0;budget=0;meterStart=0;draws=0;pointer=null;}
  function inactive(){return options.paused||enginePaused||document.hidden;}
  function toggle(key){options[key]=!options[key];if(key==='paused')resetClock();syncControls();renderer?.draw();}
  const buttons=new Map(),host=document.getElementById('feature-controls');
  for(const group of [...new Set(config.features.map(f=>f.group))]){
    const row=document.createElement('div');row.className='control-group';
    const label=document.createElement('span');label.textContent=group;row.append(label);
    for(const feature of config.features.filter(f=>f.group===group)){
      const button=document.createElement('button');button.id=feature.key;
      button.onclick=()=>toggle(feature.key);row.append(button);buttons.set(feature.key,button);
    }
    host.append(row);
  }
  const pause=document.createElement('button');pause.id='pause';pause.onclick=()=>toggle('paused');host.lastElementChild.append(pause);
  function syncControls(){
    for(const f of config.features){const b=buttons.get(f.key);b.textContent=f.label+'：'+(options[f.key]?'开':'关');b.setAttribute('aria-pressed',String(options[f.key]));}
    pause.textContent=options.paused?'继续':'暂停';pause.setAttribute('aria-pressed',String(options.paused));
  }
  panel.hidden=!new URLSearchParams(location.search).has('preview');syncControls();
  window.addEventListener('keydown',e=>{
    if(e.repeat||(e.code==='Space'&&e.target.tagName==='BUTTON'))return;
    if(e.code==='Space'){toggle('paused');e.preventDefault();}
    if(e.code==='KeyH')panel.hidden=!panel.hidden;
    const feature=config.features.find(f=>f.code===e.code);if(feature)toggle(feature.key);
  });
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
  renderer=await WaterRenderer.create(canvas,world,options);
  function resize(){renderer.resize(innerWidth,innerHeight,devicePixelRatio||1);resetClock();renderer.draw();}
  window.addEventListener('resize',resize);resize();
  function frame(now){
    requestAnimationFrame(frame);
    if(inactive()){resetClock();return;}
    if(!last){last=now;meterStart=now;return;}
    const dt=Math.min((now-last)/1000,.2);last=now;world.update(dt);budget+=dt;
    const interval=1/fpsLimit;
    if(budget+1e-5>=interval){renderer.draw();draws++;budget=Math.max(0,budget-interval)%interval;}
    if(now-meterStart>=1000){document.getElementById('fps').textContent=Math.round(draws*1000/(now-meterStart))+' FPS';draws=0;meterStart=now;}
  }
  requestAnimationFrame(frame);
})().catch(e=>{const box=document.getElementById('error');box.hidden=false;box.textContent='水面暂时无法显示：'+e.message;console.error(e);});
