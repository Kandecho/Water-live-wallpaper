/* Water HD study. Apache-2.0. Original AOSP artwork and leaf behavior: NOTICE.txt. */
(function(root){
  'use strict';
  const S=typeof module!=='undefined'&&module.exports?require('./settings.js'):root.WaterSettings;
  const LEAF_SIZE=S.scene.leafSize,MAX_WAVES=S.waves.maxSources;
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  class World {
    constructor(aspect,random=Math.random){
      this.random=random;this.time=0;this.waves=[];this.leaves=[];this.nextAmbient=2;
      this.resize(aspect);
      for(let i=0;i<S.scene.leafCount;i++)this.leaves.push(this.newLeaf(false));
      this.drop(.6,.45,.55);
    }
    range(a,b){return a+(b-a)*this.random();}
    resize(aspect){
      const oldW=this.width,oldH=this.height;
      this.height=aspect>=1?10/3:2/aspect;this.width=this.height*aspect;
      this.rows=S.render.gridRows;this.cols=Math.min(S.render.maxColumns,Math.ceil(this.rows*aspect));
      this.surface=new Float32Array((this.cols+1)*(this.rows+1)*3);
      if(oldW){
        for(const l of this.leaves){l.x*=this.width/oldW;l.y*=this.height/oldH;}
        for(const w of this.waves){w.x*=this.width/oldW;w.y*=this.height/oldH;}
      }
    }
    newLeaf(falling){
      return {x:this.range(-this.width/2,this.width/2),y:this.range(-this.height/2,this.height/2),
        scale:this.range(...S.scene.leafScale),angle:this.range(0,Math.PI*2),sprite:Math.floor(this.range(0,8)),
        spin:this.range(...S.drift.spin)*(falling?2:1),altitude:falling?.65:0,
        vx:this.range(...S.drift.velocityX),vy:this.range(...S.drift.velocityY),phase:this.range(0,Math.PI*2),
        slopeX:0,slopeY:0,bob:0};
    }
    drop(u,v,strength=1){
      if(this.waves.length===MAX_WAVES)this.waves.shift();
      this.waves.push({x:(u-.5)*this.width,y:(.5-v)*this.height,born:this.time,strength});
    }
    // Height and exact derivatives of the same compact radial wave packet.
    // All distances are world units, so rings stay circular on every screen.
    sample(x,y,out,offset=0){
      const t=this.time,p=x*2.1+y*1.3-t*.55,q=x*.8-y*2.3+t*.37;
      let h=.0028*Math.sin(p)+.0018*Math.sin(q);
      let sx=.00588*Math.cos(p)+.00144*Math.cos(q);
      let sy=.00364*Math.cos(p)-.00414*Math.cos(q);
      for(const w of this.waves){
        const age=t-w.born;if(age<=0||age>S.waves.lifetime)continue;
        const dx=x-w.x,dy=y-w.y,r=Math.hypot(dx,dy),d=r-S.waves.speed*age;
        if(Math.abs(d)>.75)continue;
        const envelope=S.waves.height*w.strength*(1-Math.exp(-age*S.waves.rise))*Math.exp(-age*S.waves.decay-d*d*S.waves.width);
        const s=Math.sin(d*S.waves.frequency),c=Math.cos(d*S.waves.frequency);
        h+=envelope*s;
        const dr=envelope*(S.waves.frequency*c-2*S.waves.width*d*s)/Math.max(r,.0001);
        sx+=dr*dx;sy+=dr*dy;
      }
      out[offset]=sx;out[offset+1]=sy;out[offset+2]=h;return out;
    }
    mesh(){
      const {cols,rows,width,height,surface}=this;
      for(let y=0;y<=rows;y++)for(let x=0;x<=cols;x++)
        this.sample((x/cols-.5)*width,(y/rows-.5)*height,surface,(y*(cols+1)+x)*3);
      return surface;
    }
    update(dt){
      this.time+=dt;this.waves=this.waves.filter(w=>this.time-w.born<S.waves.lifetime);
      const a=new Float32Array(3),b=new Float32Array(3),ease=1-Math.exp(-dt/S.drift.settleTime);
      if(this.time>this.nextAmbient){
        const l=this.leaves[Math.floor(this.random()*this.leaves.length)];
        this.drop(l.x/this.width+.5,.5-l.y/this.height,S.waves.ambientStrength);
        this.nextAmbient=this.time+this.range(...S.waves.ambientInterval);
      }
      const recycled=[];
      for(const l of this.leaves){
        if(l.altitude>0){
          l.altitude=Math.max(0,l.altitude-S.drift.fallSpeed*dt);l.angle+=l.spin*dt;
          if(l.altitude===0){this.drop(l.x/this.width+.5,.5-l.y/this.height,S.waves.landingStrength);l.spin*=.25;}
        }else{
          // Gentle flow with the original downward drift as its backbone.
          l.x+=(l.vx+S.drift.flow[0]*Math.sin(l.y*1.1+this.time*.15))*dt;
          l.y+=(l.vy+S.drift.flow[1]*Math.cos(l.x*.9-this.time*.12))*dt;
          l.angle+=l.spin*dt;
        }
        const reach=LEAF_SIZE*l.scale*.55,c=Math.cos(l.angle),s=Math.sin(l.angle);
        this.sample(l.x-c*reach,l.y-s*reach,a);
        this.sample(l.x+c*reach,l.y+s*reach,b);
        l.slopeX+=(clamp((a[0]+b[0])*.5,-.3,.3)-l.slopeX)*ease;
        l.slopeY+=(clamp((a[1]+b[1])*.5,-.3,.3)-l.slopeY)*ease;
        l.bob+=((a[2]+b[2])*.5-l.bob)*ease;
        const edge=LEAF_SIZE*l.scale;
        if(l.y+edge < -this.height/2 || Math.abs(l.x)-edge>this.width/2){
          Object.assign(l,this.newLeaf(true));recycled.push(l);
        }
      }
      if(recycled.length)this.leaves=this.leaves.filter(l=>!recycled.includes(l)).concat(recycled);
    }
  }
  const api={World,LEAF_SIZE,MAX_WAVES};
  if(typeof module!=='undefined')module.exports=api;else root.WaterHD=api;
})(typeof window!=='undefined'?window:globalThis);
