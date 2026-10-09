/* GLSL only. Shared pose and artistic constants come from settings.js. Apache-2.0. */
const WaterShaders=(()=>{
  const S=WaterSettings,f=n=>Number(n).toFixed(8),v=a=>'vec3('+a.map(f).join(',')+')';
  const precision=`#ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
    #else
    precision mediump float;
    #endif`;
  const pose=`vec2 leafPose(vec2 q,float angle,vec2 tilt){
    q=mat2(cos(angle),sin(angle),-sin(angle),cos(angle))*q;
    q.x+=q.y*tilt.x*${f(S.leaf.shear)};q.y*=1.-abs(tilt.y)*${f(S.leaf.squash)};return q;
  }`;
  return {
  water:{vertex:`
    attribute vec2 position;attribute vec3 surface;varying vec2 uv;varying vec3 wave;
    void main(){gl_Position=vec4(position,0.,1.);uv=position*.5+.5;wave=surface;}`,fragment:`
    ${precision}
    uniform sampler2D image;uniform vec4 crop;
    uniform vec2 worldSize;uniform vec3 light;uniform float lighting;
    varying vec2 uv;varying vec3 wave;
    void main(){
      vec2 displaced=uv-wave.xy*${f(S.water.refraction)}/worldSize;
      vec2 p=crop.xy+vec2(displaced.x,1.-displaced.y)*crop.zw;
      p=clamp(p,vec2(.5/4096.,896.5/4096.),vec2(3831.5/4096.,4095.5/4096.));
      vec3 color=texture2D(image,p).rgb;
      vec3 n=normalize(vec3(-wave.xy*${f(S.water.normalScale)},1.));
      vec3 halfLight=normalize(light+vec3(0.,0.,1.));
      float diffuse=dot(n,light)-light.z;
      float sheen=pow(max(dot(n,halfLight),0.),${f(S.water.sheenPower)})-pow(halfLight.z,${f(S.water.sheenPower)});
      // A modest film of light above the reflection, not glowing wave outlines.
      color+=lighting*(color*diffuse*${f(S.water.diffuse)}+vec3(.78,.87,.96)*sheen*${f(S.water.sheen)});
      gl_FragColor=vec4(color,1.);
    }`,attributes:['position','surface'],uniforms:['image','crop','worldSize','light','lighting']},
  contact:{vertex:`
    attribute vec2 position;attribute vec3 surface;
    uniform vec2 center;uniform mediump vec2 worldSize;uniform mediump vec2 tilt;
    uniform mediump float angle;uniform mediump float size;
    varying vec2 uv;varying vec2 screen;varying vec3 wave;
    ${pose}
    void main(){
      vec2 q=position*size*(191./127.);
      q=leafPose(q,angle,tilt);
      screen=(center+q)/worldSize+.5;gl_Position=vec4(screen*2.-1.,0.,1.);
      uv=vec2(position.x*.5+.5,.5-position.y*.5);wave=surface;
    }`,fragment:`
    ${precision}
    uniform sampler2D image;uniform sampler2D field;
    uniform vec2 pixel;uniform mediump vec2 worldSize;uniform vec3 light;
    uniform float sprite;uniform mediump float angle;uniform mediump float size;uniform mediump vec2 tilt;uniform float lighting;
    uniform float contactState;uniform float wetness;
    varying vec2 uv;varying vec2 screen;varying vec3 wave;
    void main(){
      vec4 f=texture2D(field,vec2((sprite*192.+.5+uv.x*191.)/1536.,(contactState*192.+.5+uv.y*191.)/${f(192*S.contact.poses.length)}));
      float mask=smoothstep(0.,.025,f.r);if(mask<.001)discard;
      // R: local depression weight. GB: derivatives including the wet/dry ends.
      // A stable wet/dry pose selects one baked row; raised parts remain dry.
      vec2 grad=((f.gb*255.-128.)/127.)*.5*vec2(1.,-1.);
      grad*=${f(S.contact.depth)}*wetness/(2.*size/127.);
      grad=mat2(cos(angle),sin(angle),-sin(angle),cos(angle))*grad;
      // Inverse transpose of the same shear/squash used for the leaf pose.
      grad.y=(grad.y-tilt.x*${f(S.leaf.shear)}*grad.x)/(1.-abs(tilt.y)*${f(S.leaf.squash)});
      // Warp a copy of the rendered water: zero local slope gives the exact base
      // pixel, even when a strong ripple crosses the patch. No rectangular seams.
      vec3 c=texture2D(image,clamp(screen-grad*${f(S.water.refraction)}/worldSize,pixel,1.-pixel)).rgb;
      vec3 n=normalize(vec3(-(wave.xy+grad)*${f(S.water.normalScale)},1.)),base=normalize(vec3(-wave.xy*${f(S.water.normalScale)},1.));
      vec3 halfLight=normalize(light+vec3(0.,0.,1.));
      float diffuse=dot(n,light)-dot(base,light);
      float sheen=pow(max(dot(n,halfLight),0.),${f(S.water.sheenPower)})-pow(max(dot(base,halfLight),0.),${f(S.water.sheenPower)});
      c+=lighting*(c*diffuse*${f(S.water.diffuse)}+vec3(.78,.87,.96)*sheen*${f(S.water.sheen)});
      // Contact remains legible against smooth sky, with a directional light/dark pair.
      c+=lighting*vec3(.65,.77,.82)*(dot(n,light)-dot(base,light))*${f(S.contact.directionalLight)};
      gl_FragColor=vec4(c*mask,mask);
    }`,attributes:['position','surface'],uniforms:['image','field','pixel','worldSize','light','center','tilt','angle','size','sprite','lighting','contactState','wetness']},
  leaf:{vertex:`
    attribute vec2 position;uniform vec2 center;uniform vec2 worldSize;uniform mediump vec2 tilt;
    uniform mediump float angle;uniform float size;uniform float perspective;varying vec2 uv;varying vec2 sceneUV;
    ${pose}
    void main(){
      vec2 q=position*size;
      q=leafPose(q,angle,tilt);
      gl_Position=vec4((center+q)*perspective*2./worldSize,0.,1.);
      sceneUV=(center+q)*perspective/worldSize+.5;
      uv=vec2(position.x*.5+.5,.5-position.y*.5);
    }`,fragment:`
    ${precision}
    uniform sampler2D image;uniform float sprite;uniform float opacity;
    uniform float shadow;uniform float lighting;uniform mediump vec2 tilt;uniform vec3 light;varying vec2 uv;varying vec2 sceneUV;
    uniform sampler2D canopy;uniform vec4 crop;uniform float canopyStrength;uniform mediump float angle;
    uniform vec2 liftAxis;uniform float restLift;uniform float size;
    uniform vec2 veinOrigin;uniform vec2 veinAxis;
    void main(){
      if(shadow>.5){
        float lifted=smoothstep(.015,.28,dot(uv-veinOrigin,liftAxis))*restLift;
        vec2 offset=mat2(cos(angle),-sin(angle),sin(angle),cos(angle))*light.xy*(lifted*.025)/(2.*size);
        vec2 sampleUV=uv+vec2(offset.x,-offset.y);
        if(any(lessThan(sampleUV,vec2(0.)))||any(greaterThan(sampleUV,vec2(1.))))discard;
        vec2 p=vec2((sprite*128.+.5+sampleUV.x*127.)/1024.,(.5+sampleUV.y*127.)/256.);
        float alpha=mix(texture2D(image,p).a,texture2D(image,p+vec2(0.,.5)).a,lifted);
        alpha*=opacity*(1.-lifted*.4);
        gl_FragColor=vec4(vec3(.035,.065,.085)*alpha,alpha);return;
      }
      vec2 p=vec2((sprite*128.+.5+uv.x*127.)/1024.,(.5+uv.y*127.)/128.);
      vec4 c=texture2D(image,p);
      vec2 q=uv-veinOrigin,across=vec2(-veinAxis.y,veinAxis.x);
      float side=dot(q,across),along=dot(q,veinAxis);
      // A rounded main vein and shallow fold; no detail inferred from albedo.
      vec2 gradUV=-${f(S.leaf.ridge)}*side/sqrt(side*side+.0025)*across-${f(S.leaf.curl)}*(along+.18)*veinAxis;
      vec2 normalXY=mat2(cos(angle),sin(angle),-sin(angle),cos(angle))*vec2(-gradUV.x,gradUV.y);
      vec3 n=normalize(vec3(normalXY-tilt*${f(S.leaf.normalTilt)},1.));
      // World-locked canopy: same base crop, without ripple displacement or leaf UV.
      vec2 pondUV=crop.xy+vec2(sceneUV.x,1.-sceneUV.y)*crop.zw;
      vec2 canopyUV=(pondUV-vec2(0.,224./1024.))/vec2(958./1024.,800./1024.);
      float shade=texture2D(canopy,clamp(canopyUV,0.,1.)).r;
      float direct=max(dot(n,light),0.)*(1.-canopyStrength*shade);
      vec3 illumination=${v(S.light.ambient)}+${v(S.light.keyColor)}*direct*${f(S.light.keyStrength)};
      vec3 lit=mix(c.rgb,c.rgb*illumination,lighting);
      gl_FragColor=vec4(lit,c.a)*opacity;
    }`,attributes:['position'],uniforms:['image','canopy','crop','canopyStrength','veinOrigin','veinAxis','liftAxis','restLift','center','worldSize','tilt','angle','size','perspective','sprite','opacity','shadow','lighting','light']}
  };
})();
