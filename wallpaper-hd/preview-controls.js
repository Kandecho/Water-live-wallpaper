/* Preview-only comparison controls. Never loaded by the ordinary wallpaper. Apache-2.0. */
'use strict';
(function(){
  const stylesheet=new URL('preview-controls.css',document.currentScript.src).href;
  window.WaterPreview={create({config,world,options,onChange}){
    const style=document.createElement('link');style.rel='stylesheet';style.href=stylesheet;document.head.append(style);
    const template=document.createElement('template');
    template.innerHTML='<aside id="controls" aria-label="预览对照面板"><p><strong>WATER HD · RANDOM WIND</strong><span id="fps">— FPS</span><br>随机轻风与强风 · G 开关 · 点击 / 拖动 · 空格暂停 · H 隐藏</p><div id="feature-controls"></div></aside>';
    const panel=template.content.firstElementChild;document.body.append(panel);
    const buttons=new Map(),host=panel.querySelector('#feature-controls');
    function toggle(key){options[key]=!options[key];syncControls();onChange(key==='paused');}
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
    const windRow=buttons.get('breeze').parentElement;
    for(const [kind,gust] of Object.entries(config.wind.gusts)){
      const button=document.createElement('button');button.id='trigger-'+kind;button.textContent='吹一阵'+gust.label;
      button.title=`请求一阵${gust.label}，持续 ${gust.duration} 秒。已有风时排队，重复点击不叠加；用户暂停时继续播放。`;
      button.onclick=()=>{world.triggerBreeze(kind);options.breeze=true;options.paused=false;syncControls();onChange(true);};
      windRow.append(button);
    }
    const windStatus=document.createElement('p');windStatus.id='breeze-status';windStatus.setAttribute('role','status');windRow.after(windStatus);
    function syncWindStatus(){
      const active=world.wind.active;
      const pending=Object.keys(world.wind.next).filter(kind=>world.wind.next[kind]<=world.time).map(kind=>config.wind.gusts[kind].label);
      const text=!options.breeze?'风已关闭':active?
        `${config.wind.gusts[active.kind].label} ${Math.round(world.sampleBreeze().strength*100)}% · 风向 ${Math.round(active.direction*180/Math.PI)}°`:'平静';
      const status=text+(options.breeze&&pending.length?' · '+pending.join('、')+'等待中':'');
      if(windStatus.textContent!==status)windStatus.textContent=status;
    }
    function syncControls(){
      world.breezeEnabled=options.breeze;
      for(const f of config.features){const b=buttons.get(f.key);b.textContent=f.label+'：'+(options[f.key]?'开':'关');b.setAttribute('aria-pressed',String(options[f.key]));}
      pause.textContent=options.paused?'继续':'暂停';pause.setAttribute('aria-pressed',String(options.paused));syncWindStatus();
    }
    syncControls();
    window.addEventListener('keydown',e=>{
      if(e.repeat||e.ctrlKey||e.altKey||e.metaKey||e.target.closest?.('button,select,input,textarea,[contenteditable]'))return;
      if(e.code==='Space'){toggle('paused');e.preventDefault();}
      if(e.code==='KeyH')panel.hidden=!panel.hidden;
      const feature=config.features.find(f=>f.code===e.code);if(feature)toggle(feature.key);
    });
    return {updateWind(){if(!panel.hidden)syncWindStatus();},updateFPS(value){panel.querySelector('#fps').textContent=value+' FPS';}};
  }};
})();
