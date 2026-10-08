/* Water HD study 01. Small mesh + analytic waves + premultiplied sprites. Apache-2.0. */
'use strict';
const canvas=document.getElementById('water'),panel=document.getElementById('controls');
const options={fusion:true,leaves:true,paused:false};
let enginePaused=false,fpsLimit=60,last=0,budget=0,redraw=()=>{};
panel.hidden=!new URLSearchParams(location.search).has('preview');
window.wallpaperPropertyListener={
  setPaused(value){enginePaused=!!value;last=0;budget=0;},
  applyGeneralProperties(p){if(p.fps>0){fpsLimit=Math.min(60,p.fps);budget=0;}}
};
document.addEventListener('visibilitychange',()=>{last=0;budget=0;});
function controls(){
  for(const key of ['fusion','leaves','pause']){
    const value=key==='pause'?options.paused:options[key],button=document.getElementById(key);
    button.setAttribute('aria-pressed',String(value));
    button.textContent=key==='fusion'?'融合效果：'+(value?'开':'关'):key==='leaves'?'叶子：'+(value?'显示':'隐藏'):(value?'继续':'暂停');
  }
}
function toggle(key){options[key]=!options[key];if(key==='paused'){last=0;budget=0;}controls();redraw();}
document.getElementById('fusion').onclick=()=>toggle('fusion');
document.getElementById('leaves').onclick=()=>toggle('leaves');
document.getElementById('pause').onclick=()=>toggle('paused');
window.addEventListener('keydown',e=>{
  if(e.repeat||e.target.tagName==='BUTTON')return;
  if(e.code==='Space'){toggle('paused');e.preventDefault();}
  if(e.code==='KeyH')panel.hidden=!panel.hidden;
  if(e.code==='KeyC')toggle('fusion');if(e.code==='KeyL')toggle('leaves');
});
async function start(){
  const gl=canvas.getContext('webgl',{alpha:false,antialias:false,depth:false,stencil:false});
  if(!gl)throw Error('需要支持 WebGL 的浏览器或壁纸引擎。');
  const {World,LEAF_SIZE}=WaterHD,world=new World(innerWidth/innerHeight);
  const LIGHT=new Float32Array([-.38,.54,.751]);
  function shader(type,source){
    const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;
  }
  function program(vs,fs,attributes,uniforms){
    const p=gl.createProgram();gl.attachShader(p,shader(gl.VERTEX_SHADER,vs));gl.attachShader(p,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);
    if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));
    const r={p};for(const n of attributes)r[n]=gl.getAttribLocation(p,n);for(const n of uniforms)r[n]=gl.getUniformLocation(p,n);return r;
  }
  const water=program(`
    attribute vec2 position;attribute vec3 surface;varying vec2 uv;varying vec3 wave;
    void main(){gl_Position=vec4(position,0.,1.);uv=position*.5+.5;wave=surface;}`,`
    precision mediump float;uniform sampler2D image;uniform vec4 crop;
    uniform vec2 worldSize;uniform vec3 light;uniform float fusion;
    varying vec2 uv;varying vec3 wave;
    void main(){
      vec2 displaced=uv-wave.xy*.10/worldSize;
      vec2 p=crop.xy+vec2(displaced.x,1.-displaced.y)*crop.zw;
      p=clamp(p,vec2(.5/1024.,224.5/1024.),vec2(957.5/1024.,1023.5/1024.));
      vec3 color=texture2D(image,p).rgb;
      vec3 n=normalize(vec3(-wave.xy*.85,1.));
      vec3 halfLight=normalize(light+vec3(0.,0.,1.));
      float diffuse=dot(n,light)-light.z;
      float sheen=pow(max(dot(n,halfLight),0.),42.)-pow(halfLight.z,42.);
      // A modest film of light above the reflection, not glowing wave outlines.
      color+=fusion*(color*diffuse*.13+vec3(.78,.87,.96)*sheen*.15);
      gl_FragColor=vec4(color,1.);
    }`,['position','surface'],['image','crop','worldSize','light','fusion']);
  const leaf=program(`
    attribute vec2 position;uniform vec2 center;uniform vec2 worldSize;uniform mediump vec2 tilt;
    uniform float angle;uniform float size;uniform float perspective;varying vec2 uv;
    void main(){
      vec2 q=position*size;
      q=mat2(cos(angle),sin(angle),-sin(angle),cos(angle))*q;
      q.x+=q.y*tilt.x*.20;q.y*=1.-abs(tilt.y)*.24;
      gl_Position=vec4((center+q)*perspective*2./worldSize,0.,1.);
      uv=vec2(position.x*.5+.5,.5-position.y*.5);
    }`,`
    precision mediump float;uniform sampler2D image;uniform float sprite;uniform float opacity;
    uniform float shadow;uniform float fusion;uniform vec2 tilt;uniform vec3 light;varying vec2 uv;
    void main(){
      vec2 p=vec2((sprite*128.+.5+uv.x*127.)/1024.,(.5+uv.y*127.)/128.);
      vec4 c=texture2D(image,p);
      if(shadow>.5){gl_FragColor=vec4(vec3(.035,.065,.085)*c.a,c.a)*opacity;return;}
      vec3 n=normalize(vec3(-tilt*.9,1.));
      float illumination=1.+fusion*(-.035+.30*(dot(n,light)-light.z));
      vec3 lit=c.rgb*illumination+fusion*c.a*vec3(0.,.004,.009);
      gl_FragColor=vec4(lit,c.a)*opacity;
    }`,['position'],['image','center','worldSize','tilt','angle','size','perspective','sprite','opacity','shadow','fusion','light']);
  async function load(src){const image=new Image();await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(Error('素材加载失败'));image.src=src;});return image;}
  function texture(image){
    const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
    for(const key of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,key,gl.LINEAR);
    for(const key of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,key,gl.CLAMP_TO_EDGE);
    return tex;
  }
  const [pondImage,leafImage]=await Promise.all([load(WaterAssets.pond),load(WaterAssets.leaves)]);
  const pond=texture(pondImage),leaves=texture(leafImage);
  // Prepare one soft alpha atlas at startup; no per-frame blur or new art assets.
  const shadowCanvas=document.createElement('canvas');shadowCanvas.width=1024;shadowCanvas.height=128;
  const ctx=shadowCanvas.getContext('2d');
  for(let i=0;i<8;i++){
    ctx.save();ctx.beginPath();ctx.rect(i*128,0,128,128);ctx.clip();ctx.filter='blur(2.6px)';
    ctx.drawImage(leafImage,i*128,0,128,128,i*128,0,128,128);ctx.restore();
  }
  const shadows=texture(shadowCanvas);
  const positions=gl.createBuffer(),surfaces=gl.createBuffer(),indices=gl.createBuffer(),quad=gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,quad);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  let count,crop;
  function resize(){
    const ratio=innerWidth/innerHeight,dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.round(innerWidth*dpr);canvas.height=Math.round(innerHeight*dpr);gl.viewport(0,0,canvas.width,canvas.height);
    world.resize(ratio);const {cols,rows}=world,p=[],ix=[];
    for(let y=0;y<=rows;y++)for(let x=0;x<=cols;x++)p.push(x/cols*2-1,y/rows*2-1);
    for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
      const a=y*(cols+1)+x,b=a+1,c=a+cols+1,d=c+1;ix.push(a,b,c,b,d,c);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER,positions);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(p),gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER,surfaces);gl.bufferData(gl.ARRAY_BUFFER,world.surface.byteLength,gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indices);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(ix),gl.STATIC_DRAW);count=ix.length;
    const cw=Math.min(960,800*ratio),ch=Math.min(800,960/ratio);
    crop=[(960-cw)/2048,(224+(800-ch)/2)/1024,cw/1024,ch/1024];last=0;
  }
  function attribute(location,buffer,size){gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,size,gl.FLOAT,false,0,0);}
  function drawLeaf(l,shadow){
    const a=l.altitude,opacity=Math.min(1,Math.max(0,(.65-a)/.24));
    const fusion=options.fusion,contact=fusion&&a===0;
    const tiltX=fusion&&a===0?l.slopeX:0,tiltY=fusion&&a===0?l.slopeY:0;
    const offsetX=shadow?(.008-LIGHT[0]*a*.24):0;
    const offsetY=shadow?(-.012-LIGHT[1]*a*.24):(fusion?l.bob*.45:0);
    gl.uniform2f(leaf.center,l.x+offsetX,l.y+offsetY);
    gl.uniform2f(leaf.tilt,tiltX,tiltY);
    gl.uniform1f(leaf.angle,l.angle+(fusion?tiltX*.22:0));
    gl.uniform1f(leaf.size,LEAF_SIZE*l.scale*(shadow?1.025+a*.12:1));
    gl.uniform1f(leaf.perspective,shadow?1:2/(2-a));
    gl.uniform1f(leaf.sprite,l.sprite);gl.uniform1f(leaf.shadow,shadow?1:0);
    gl.uniform1f(leaf.opacity,opacity*(shadow?(contact?.25:.17):1));
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  }
  function draw(){
    gl.disable(gl.BLEND);gl.useProgram(water.p);
    attribute(water.position,positions,2);attribute(water.surface,surfaces,3);
    gl.bufferSubData(gl.ARRAY_BUFFER,0,world.mesh());
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,pond);gl.uniform1i(water.image,0);
    gl.uniform4fv(water.crop,crop);gl.uniform2f(water.worldSize,world.width,world.height);
    gl.uniform3fv(water.light,LIGHT);gl.uniform1f(water.fusion,options.fusion?1:0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indices);gl.drawElements(gl.TRIANGLES,count,gl.UNSIGNED_SHORT,0);
    gl.disableVertexAttribArray(water.surface);
    if(!options.leaves)return;
    gl.useProgram(leaf.p);attribute(leaf.position,quad,2);gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.uniform1i(leaf.image,0);
    gl.uniform2f(leaf.worldSize,world.width,world.height);gl.uniform3fv(leaf.light,LIGHT);gl.uniform1f(leaf.fusion,options.fusion?1:0);
    gl.bindTexture(gl.TEXTURE_2D,shadows);
    for(const l of world.leaves)if(options.fusion||l.altitude>0)drawLeaf(l,true);
    gl.bindTexture(gl.TEXTURE_2D,leaves);for(const l of world.leaves)drawLeaf(l,false);
  }
  let pointer=null;
  function point(e){const r=canvas.getBoundingClientRect();return {u:(e.clientX-r.left)/r.width,v:(e.clientY-r.top)/r.height,t:world.time};}
  canvas.addEventListener('pointerdown',e=>{
    if(e.button!==0||options.paused||enginePaused)return;
    pointer=point(e);pointer.id=e.pointerId;world.drop(pointer.u,pointer.v,1);
    canvas.setPointerCapture(e.pointerId);e.preventDefault();
  });
  canvas.addEventListener('pointermove',e=>{
    if(!pointer||pointer.id!==e.pointerId||options.paused||enginePaused)return;
    const p=point(e),distance=Math.hypot((p.u-pointer.u)*world.width,(p.v-pointer.v)*world.height);
    if(p.t-pointer.t>.075&&distance>.085){world.drop(p.u,p.v,.55);pointer={...p,id:e.pointerId};}
  });
  for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,()=>{pointer=null;});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();enginePaused=true;});
  canvas.addEventListener('webglcontextrestored',()=>location.reload());
  redraw=draw;window.addEventListener('resize',()=>{resize();draw();});resize();draw();
  let meterStart=0,draws=0;
  function frame(now){
    requestAnimationFrame(frame);
    if(options.paused||enginePaused||document.hidden){last=0;budget=0;pointer=null;return;}
    if(!last){last=now;return;}
    const dt=Math.min((now-last)/1000,.2);last=now;world.update(dt);budget+=dt;
    const interval=1/fpsLimit;
    if(budget+1e-5>=interval){draw();draws++;budget=Math.max(0,budget-interval)%interval;}
    if(now-meterStart>=1000){document.getElementById('fps').textContent=Math.round(draws*1000/(now-meterStart))+' FPS';draws=0;meterStart=now;}
  }
  requestAnimationFrame(frame);
}
start().catch(e=>{const box=document.getElementById('error');box.hidden=false;box.textContent='水面暂时无法显示：'+e.message;console.error(e);});
