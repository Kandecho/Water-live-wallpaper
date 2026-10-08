/* Water / Fall desktop renderer. Apache-2.0; see LICENSE.txt and NOTICE.txt. */
'use strict';
const canvas = document.getElementById('water');
const errorBox = document.getElementById('error');
let enginePaused=false, userPaused=false, last=0, accumulator=0, lastDraw=0, fps=1000/30;
window.wallpaperPropertyListener = {
  setPaused(value) { enginePaused=!!value; last=0; },
  applyGeneralProperties(p) { if (p.fps>0) fps=Math.min(1000/30,p.fps); }
};
document.addEventListener('visibilitychange',()=>{last=0;});
window.addEventListener('keydown',e=>{
  if(e.code==='Space') { userPaused=!userPaused; last=0; e.preventDefault(); }
});
function fail(e) { errorBox.hidden=false; errorBox.textContent='Unable to display Water: '+e.message; console.error(e); }

async function start() {
  const gl=canvas.getContext('webgl',{alpha:false,antialias:false,depth:false,stencil:false});
  if(!gl) throw new Error('Please enable hardware acceleration in your browser or wallpaper engine.');
  const {WaterWorld,STEP,LEAF_SIZE}=WaterSimulation;
  const world=new WaterWorld(innerWidth/innerHeight);
  function program(vs,fs) {
    function shader(type,source) {
      const s=gl.createShader(type); gl.shaderSource(s,source); gl.compileShader(s);
      if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    }
    const p=gl.createProgram();
    gl.attachShader(p,shader(gl.VERTEX_SHADER,vs)); gl.attachShader(p,shader(gl.FRAGMENT_SHADER,fs));
    gl.linkProgram(p);
    if(!gl.getProgramParameter(p,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    return p;
  }
  const water=program(`
    attribute vec2 position; attribute vec2 texcoord; varying vec2 uv;
    void main(){gl_Position=vec4(position,0.,1.);uv=texcoord;}`,`
    precision mediump float; uniform sampler2D image; uniform vec4 crop; varying vec2 uv;
    void main(){
      vec2 p=crop.xy+vec2(uv.x,1.-uv.y)*crop.zw;
      // The source is padded above/right. Never sample its white padding.
      p=clamp(p,vec2(.5/1024.,224.5/1024.),vec2(959.5/1024.,1023.5/1024.));
      gl_FragColor=texture2D(image,p);
    }`);
  const leaf=program(`
    attribute vec2 position; uniform vec2 center; uniform vec2 worldSize;
    uniform float angle; uniform float size; uniform float perspective;
    varying vec2 uv;
    void main(){
      vec2 q=position*size;
      q=mat2(cos(angle),sin(angle),-sin(angle),cos(angle))*q;
      gl_Position=vec4((center+q)*perspective*2./worldSize,0.,1.);
      uv=vec2(position.x*.5+.5,.5-position.y*.5);
    }`, `
    precision mediump float; uniform sampler2D image; uniform float sprite;
    uniform vec4 tint; varying vec2 uv;
    void main(){
      vec2 p=vec2((sprite*128.+.5+uv.x*127.)/1024.,(.5+uv.y*127.)/128.);
      gl_FragColor=texture2D(image,p)*tint;
    }`);
  function locations(p,attributes,uniforms) {
    const r={p}; for(const n of attributes) r[n]=gl.getAttribLocation(p,n);
    for(const n of uniforms) r[n]=gl.getUniformLocation(p,n); return r;
  }
  const w=locations(water,['position','texcoord'],['image','crop']);
  const l=locations(leaf,['position'],['image','center','worldSize','angle','size','perspective','sprite','tint']);
  async function texture(src) {
    const img=new Image();
    await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error('Unable to load the original textures'));img.src=src;});
    const t=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,t);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE); return t;
  }
  const [pond,leaves]=await Promise.all([texture(WaterAssets.pond),texture(WaterAssets.leaves)]);
  const positions=gl.createBuffer(),uvs=gl.createBuffer(),indices=gl.createBuffer(),quad=gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,quad);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  let indexCount,crop;
  function resize() {
    const aspect=innerWidth/innerHeight;
    // Pixel rendering is full resolution; the small ripple mesh is independent.
    const dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.round(innerWidth*dpr); canvas.height=Math.round(innerHeight*dpr);
    gl.viewport(0,0,canvas.width,canvas.height);
    world.resize(aspect);
    const {cols,rows}=world, p=[], ix=[];
    for(let y=0;y<=rows;y++) for(let x=0;x<=cols;x++) p.push(x/cols*2-1,y/rows*2-1);
    for(let y=0;y<rows;y++) for(let x=0;x<cols;x++) {
      const a=y*(cols+1)+x,b=a+1,c=a+cols+1,d=c+1;
      ix.push(...(y%2 ? [a,d,c,a,b,d] : [a,b,c,b,d,c]));
    }
    gl.bindBuffer(gl.ARRAY_BUFFER,positions); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(p),gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER,uvs); gl.bufferData(gl.ARRAY_BUFFER,world.uv.byteLength,gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indices); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(ix),gl.STATIC_DRAW);
    indexCount=ix.length;
    // Preserve the original image's proportions; expose more pond on widescreen.
    const cw=Math.min(960,800*aspect),ch=Math.min(800,960/aspect);
    crop=[((960-cw)/2)/1024,(224+(800-ch)/2)/1024,cw/1024,ch/1024];
    last=0;
  }
  function attribute(location,buffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location,2,gl.FLOAT,false,0,0);
  }
  function drawLeaf(item,shadow) {
    const a=Math.max(0,item.altitude),alpha=Math.max(0,Math.min(1,1-(a-.4)/.1));
    gl.uniform2f(l.center,item.x+(shadow?a/10:0),item.y-(shadow?a/5:0));
    gl.uniform1f(l.size,LEAF_SIZE*item.scale);
    gl.uniform1f(l.angle,item.angle*Math.PI/180);
    gl.uniform1f(l.perspective,2/(2-a));
    gl.uniform1f(l.sprite,item.sprite);
    gl.uniform4f(l.tint,shadow?0:1,shadow?0:1,shadow?0:1,alpha*(shadow?.15:1));
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  }
  function draw() {
    gl.disable(gl.BLEND); gl.useProgram(w.p);
    attribute(w.position,positions); attribute(w.texcoord,uvs);
    gl.bufferSubData(gl.ARRAY_BUFFER,0,world.rippleMesh());
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,pond);gl.uniform1i(w.image,0);
    gl.uniform4fv(w.crop,crop);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indices);
    gl.drawElements(gl.TRIANGLES,indexCount,gl.UNSIGNED_SHORT,0);
    gl.disableVertexAttribArray(w.texcoord);
    gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.useProgram(l.p);
    attribute(l.position,quad);gl.bindTexture(gl.TEXTURE_2D,leaves);gl.uniform1i(l.image,0);
    gl.uniform2f(l.worldSize,world.width,world.height);
    for(const item of world.leaves) {if(item.altitude>0) drawLeaf(item,true);drawLeaf(item,false);}
  }
  canvas.addEventListener('pointerdown',e=>{
    if(e.button!==0) return;
    const rect=canvas.getBoundingClientRect();
    world.addDrop((e.clientX-rect.left)/rect.width,(e.clientY-rect.top)/rect.height,2);
  });
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();enginePaused=true;});
  canvas.addEventListener('webglcontextrestored',()=>location.reload());
  window.addEventListener('resize',resize);
  resize();draw();
  function frame(now) {
    requestAnimationFrame(frame);
    if(enginePaused||userPaused||document.hidden) {last=0;return;}
    if(!last) last=now;
    accumulator+=Math.min((now-last)/1000,.2);last=now;
    while(accumulator>=STEP) {world.update(STEP);accumulator-=STEP;}
    if(now-lastDraw>=1000/fps-1) {draw();lastDraw=now;}
  }
  requestAnimationFrame(frame);
}
start().catch(fail);
