/* WebGL resources and ordered draw passes only. Apache-2.0. */
const WaterRenderer={async create(canvas,world,options){
  const gl=canvas.getContext('webgl',{alpha:false,antialias:false,depth:false,stencil:false});
  if(!gl)throw Error('需要支持 WebGL 的浏览器或壁纸引擎。');
  const S=WaterSettings,LEAF_SIZE=S.scene.leafSize;
  const LIGHT=new Float32Array(S.light.direction);
  function shader(type,source){
    const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;
  }
  function program({vertex:vs,fragment:fs,attributes,uniforms}){
    const p=gl.createProgram();gl.attachShader(p,shader(gl.VERTEX_SHADER,vs));gl.attachShader(p,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);
    if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));
    const r={p};for(const n of attributes)r[n]=gl.getAttribLocation(p,n);for(const n of uniforms)r[n]=gl.getUniformLocation(p,n);return r;
  }
  const water=program(WaterShaders.water);
  const contact=program(WaterShaders.contact);
  const leaf=program(WaterShaders.leaf);
  async function load(src){const image=new Image();await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(Error('素材加载失败'));image.src=src;});return image;}
  function texture(image,mipmaps=false){
    const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
    for(const key of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,key,gl.LINEAR);
    for(const key of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,key,gl.CLAMP_TO_EDGE);
    if(mipmaps){gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);}
    return tex;
  }
  const [pondImage,leafImage,canopyImage,contactImage,shadowImage]=await Promise.all([
    load(WaterAssets.pond),load(WaterAssets.leaves),load(WaterMaps.canopy),load(WaterMaps.contact),load(WaterMaps.shadow)
  ]);
  const pond=texture(pondImage,true),leaves=texture(leafImage,true),waterSnapshot=gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D,waterSnapshot);
  for(const key of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,key,gl.LINEAR);
  for(const key of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,key,gl.CLAMP_TO_EDGE);
  const canopy=texture(canopyImage),contactField=texture(contactImage),shadows=texture(shadowImage);
  const contactSurface=gl.createBuffer(),contactSamples=new Float32Array(12);
  gl.bindBuffer(gl.ARRAY_BUFFER,contactSurface);gl.bufferData(gl.ARRAY_BUFFER,contactSamples.byteLength,gl.DYNAMIC_DRAW);
  const positions=gl.createBuffer(),surfaces=gl.createBuffer(),indices=gl.createBuffer(),quad=gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,quad);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  let count,crop;
  function resize(width,height,pixelRatio){
    const ratio=width/height,dpr=Math.min(pixelRatio,S.render.maxDPR);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);gl.viewport(0,0,canvas.width,canvas.height);
    gl.bindTexture(gl.TEXTURE_2D,waterSnapshot);
    // Match the opaque (alpha:false) drawing buffer for WebGL 1 copy compatibility.
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,canvas.width,canvas.height,0,gl.RGB,gl.UNSIGNED_BYTE,null);
    world.resize(ratio);const {cols,rows}=world,p=[],ix=[];
    for(let y=0;y<=rows;y++)for(let x=0;x<=cols;x++)p.push(x/cols*2-1,y/rows*2-1);
    for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
      const a=y*(cols+1)+x,b=a+1,c=a+cols+1,d=c+1;ix.push(a,b,c,b,d,c);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER,positions);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(p),gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER,surfaces);gl.bufferData(gl.ARRAY_BUFFER,world.surface.byteLength,gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indices);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(ix),gl.STATIC_DRAW);count=ix.length;
    const cw=Math.min(960,800*ratio),ch=Math.min(800,960/ratio);
    crop=[(960-cw)/2048,(224+(800-ch)/2)/1024,cw/1024,ch/1024];
  }
  function attribute(location,buffer,size){gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,size,gl.FLOAT,false,0,0);}
  // Shared by art, shadow and meniscus: one persistent resting pose + the same wave response.
  function pose(l){
    const axis=S.leaf.axes[l.sprite],state=l.contactState,rest=S.contact.poses[state];
    const lift=[axis[0]*rest[0]-axis[1]*rest[1],axis[1]*rest[0]+axis[0]*rest[1]];
    const resting=l.altitude===0?S.contact.restTilt*l.restLift:0;
    const c=Math.cos(l.angle),s=Math.sin(l.angle);
    const tiltX=(options.motion&&l.altitude===0?l.slopeX:0)+(lift[0]*c+lift[1]*s)*resting;
    const tiltY=(options.motion&&l.altitude===0?l.slopeY:0)+(lift[0]*s-lift[1]*c)*resting;
    return {lift,tiltX,tiltY,angle:l.angle+tiltX*S.leaf.turn,
      y:l.y+(options.motion&&l.altitude===0?l.bob*S.leaf.bob:0)};
  }
  function drawLeaf(l,p,shadow){
    const a=l.altitude,opacity=Math.min(1,Math.max(0,(.65-a)/.24));
    const contact=a===0,{lift,tiltX,tiltY,angle,y}=p;
    const offsetX=shadow?-LIGHT[0]*(.02+a*.24):0;
    const offsetY=shadow?-LIGHT[1]*(.02+a*.24):0;
    gl.uniform2f(leaf.center,l.x+offsetX,y+offsetY);
    gl.uniform2f(leaf.tilt,tiltX,tiltY);
    gl.uniform1f(leaf.angle,angle);
    gl.uniform2fv(leaf.liftAxis,lift);gl.uniform1f(leaf.restLift,contact?l.restLift:0);
    gl.uniform1f(leaf.size,LEAF_SIZE*l.scale*(shadow?1.025+a*.12:1));
    gl.uniform1f(leaf.perspective,shadow?1:2/(2-a));
    gl.uniform1f(leaf.sprite,l.sprite);gl.uniform1f(leaf.shadow,shadow?1:0);
    gl.uniform2fv(leaf.veinOrigin,S.leaf.origins[l.sprite]);gl.uniform2fv(leaf.veinAxis,S.leaf.axes[l.sprite]);
    gl.uniform1f(leaf.opacity,opacity*(shadow?(contact?S.leaf.contactShadow:S.leaf.airShadow):1));
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  }
  function drawContact(l,p){
    const {tiltX,tiltY,angle,y}=p,size=LEAF_SIZE*l.scale,c=Math.cos(angle),s=Math.sin(angle),extent=size*191/127;
    let i=0;
    for(const [px,py] of [[-1,-1],[1,-1],[-1,1],[1,1]]){
      let qx=(px*c-py*s)*extent,qy=(px*s+py*c)*extent;
      qx+=qy*tiltX*S.leaf.shear;qy*=1-Math.abs(tiltY)*S.leaf.squash;
      world.sample(l.x+qx,y+qy,contactSamples,i);i+=3;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER,contactSurface);gl.bufferSubData(gl.ARRAY_BUFFER,0,contactSamples);
    gl.uniform2f(contact.center,l.x,y);gl.uniform2f(contact.tilt,tiltX,tiltY);
    gl.uniform1f(contact.angle,angle);gl.uniform1f(contact.size,size);gl.uniform1f(contact.sprite,l.sprite);
    gl.uniform1f(contact.contactState,l.contactState);gl.uniform1f(contact.wetness,options.motion?l.wetness:1);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  }
  function drawWater(){
    gl.disable(gl.BLEND);gl.useProgram(water.p);
    attribute(water.position,positions,2);attribute(water.surface,surfaces,3);
    gl.bufferSubData(gl.ARRAY_BUFFER,0,world.mesh());
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,pond);gl.uniform1i(water.image,0);
    gl.uniform4fv(water.crop,crop);gl.uniform2f(water.worldSize,world.width,world.height);
    gl.uniform3fv(water.light,LIGHT);gl.uniform1f(water.lighting,options.lighting?1:0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indices);gl.drawElements(gl.TRIANGLES,count,gl.UNSIGNED_SHORT,0);
    gl.disableVertexAttribArray(water.surface);
  }
  function drawContacts(poses){
    gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
    if(options.contact){
      gl.bindTexture(gl.TEXTURE_2D,waterSnapshot);
      gl.copyTexSubImage2D(gl.TEXTURE_2D,0,0,0,0,0,canvas.width,canvas.height);
      gl.useProgram(contact.p);attribute(contact.position,quad,2);attribute(contact.surface,contactSurface,3);
      gl.uniform1i(contact.image,0);gl.uniform1i(contact.field,1);
      gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,contactField);gl.activeTexture(gl.TEXTURE0);
      gl.uniform2f(contact.pixel,.5/canvas.width,.5/canvas.height);gl.uniform2f(contact.worldSize,world.width,world.height);
      gl.uniform3fv(contact.light,LIGHT);gl.uniform1f(contact.lighting,options.lighting?1:0);
      world.leaves.forEach((l,i)=>{if(l.altitude===0)drawContact(l,poses[i]);});
      gl.disableVertexAttribArray(contact.surface);
    }
  }
  function drawLeaves(poses){
    gl.useProgram(leaf.p);attribute(leaf.position,quad,2);gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.uniform1i(leaf.image,0);
    gl.uniform1i(leaf.canopy,1);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,canopy);gl.activeTexture(gl.TEXTURE0);
    gl.uniform4fv(leaf.crop,crop);gl.uniform1f(leaf.canopyStrength,options.canopy?S.light.canopyStrength:0);
    gl.uniform2f(leaf.worldSize,world.width,world.height);gl.uniform3fv(leaf.light,LIGHT);gl.uniform1f(leaf.lighting,options.lighting?1:0);
    gl.bindTexture(gl.TEXTURE_2D,shadows);
    gl.uniform2f(leaf.atlasSize,shadowImage.width,shadowImage.height);
    world.leaves.forEach((l,i)=>drawLeaf(l,poses[i],true));
    gl.bindTexture(gl.TEXTURE_2D,leaves);
    gl.uniform2f(leaf.atlasSize,leafImage.width,leafImage.height);
    world.leaves.forEach((l,i)=>drawLeaf(l,poses[i],false));
  }
  function draw(){
    drawWater();
    if(options.leaves){const poses=world.leaves.map(pose);drawContacts(poses);drawLeaves(poses);}
  }
  return {resize,draw};
}};
