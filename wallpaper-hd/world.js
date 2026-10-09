/* Water HD study. Apache-2.0. Original AOSP artwork and leaf behavior: NOTICE.txt. */
(function(root){
  'use strict';
  const S=typeof module!=='undefined'&&module.exports?require('./settings.js'):root.WaterSettings;
  const Wind=typeof module!=='undefined'&&module.exports?require('./wind.js'):root.WaterWind;
  const LEAF_SIZE=S.scene.leafSize,MAX_WAVES=S.waves.maxSources;
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  class World {
    constructor(aspect,random=Math.random,windRandom){
      this.random=random;this.time=0;this.waves=[];this.leaves=[];this.nextAmbient=2;
      this.breezeEnabled=S.features.find(f=>f.key==='breeze').enabled;
      this.breeze={time:NaN,enabled:null,strength:0,x:1,y:0};
      this.resize(aspect);
      for(let i=0;i<S.scene.leafCount;i++)this.leaves.push(this.newLeaf(false));
      this.wind=new Wind.Scheduler(windRandom||Wind.seeded(this.random()*4294967296));
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
        contactState:Math.floor(this.range(0,S.contact.poses.length)),restLift:this.range(...S.contact.liftRange),
        slopeX:0,slopeY:0,bob:0,wetness:1,breezeX:0,breezeY:0};
    }
    drop(u,v,strength=1){
      if(this.waves.length===MAX_WAVES)this.waves.shift();
      this.waves.push({x:(u-.5)*this.width,y:(.5-v)*this.height,born:this.time,strength});
    }
    triggerBreeze(kind='gentle'){
      this.wind.request(kind,this.time);this.breezeEnabled=true;this.breeze.time=NaN;
    }
    // Sampling is read-only: redraws never reschedule or reroll a gust.
    sampleBreeze(time=this.time){
      const b=this.breeze;
      if(b.time===time&&b.enabled===this.breezeEnabled)return b;
      b.time=time;b.enabled=this.breezeEnabled;this.wind.sample(time,b);
      if(!this.breezeEnabled)b.strength=0;
      return b;
    }
    // Height and exact derivatives of the same compact radial wave packet.
    // All distances are world units, so rings stay circular on every screen.
    sample(x,y,out,offset=0){
      const t=this.time,p=x*2.1+y*1.3-t*.55,q=x*.8-y*2.3+t*.37;
      let h=.0028*Math.sin(p)+.0018*Math.sin(q);
      let sx=.00588*Math.cos(p)+.00144*Math.cos(q);
      let sy=.00364*Math.cos(p)-.00414*Math.cos(q);
      const breeze=this.sampleBreeze(),g=this.wind.effect;
      if(breeze.strength>0){
        const phase=g.waveNumber*(x*breeze.x+y*breeze.y-g.waveSpeed*t);
        const amplitude=g.waveHeight*breeze.strength,gradient=amplitude*g.waveNumber*Math.cos(phase);
        h+=amplitude*Math.sin(phase);sx+=gradient*breeze.x;sy+=gradient*breeze.y;
      }
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
      const end=this.time+dt;
      this.wind.advance(this.time);
      while(this.time<end){
        // Split at exact gust boundaries so scheduling never depends on FPS.
        const until=Math.min(end,this.wind.boundary());
        this.step(until-this.time,until);this.wind.advance(this.time);
      }
      this.breeze.time=NaN;
    }
    step(dt,until){
      this.time=until;this.waves=this.waves.filter(w=>this.time-w.born<S.waves.lifetime);
      const a=new Float32Array(3),b=new Float32Array(3),ease=1-Math.exp(-dt/S.drift.settleTime);
      const {x:windX,y:windY,strength:windStrength}=this.sampleBreeze(this.time-dt*.5);
      const g=this.wind.effect,targetX=windX*windStrength*g.driftSpeed,targetY=windY*windStrength*g.driftSpeed;
      const windEase=1-Math.exp(-dt/g.responseTime);
      if(this.time>this.nextAmbient){
        const l=this.leaves[Math.floor(this.random()*this.leaves.length)];
        this.drop(l.x/this.width+.5,.5-l.y/this.height,S.waves.ambientStrength);
        this.nextAmbient=this.time+this.range(...S.waves.ambientInterval);
      }
      const recycled=[];
      for(const l of this.leaves){
        // Leaves catch up after the water responds and coast gently after a gust.
        // Integrate the eased velocity over the step, using the mid-step gust.
        const stepX=targetX*dt+(l.breezeX-targetX)*g.responseTime*windEase;
        const stepY=targetY*dt+(l.breezeY-targetY)*g.responseTime*windEase;
        l.breezeX+=(targetX-l.breezeX)*windEase;
        l.breezeY+=(targetY-l.breezeY)*windEase;
        if(l.altitude>0){
          // Airborne leaves turn with the gust; ease out before touching water.
          const air=clamp((l.altitude-S.drift.fallSpeed*dt*.5)/g.airSpinFadeHeight,0,1);
          const wind=dt>0?clamp(Math.hypot(stepX,stepY)/(dt*g.driftSpeed),0,1):0;
          const turn=Math.sign(l.spin||1)*g.airSpin*wind*air*air*(3-2*air);
          l.altitude=Math.max(0,l.altitude-S.drift.fallSpeed*dt);l.angle+=(l.spin+turn)*dt;
          if(l.altitude===0){this.drop(l.x/this.width+.5,.5-l.y/this.height,S.waves.landingStrength);l.spin*=.25;}
        }else{
          // Gentle flow with the original downward drift as its backbone.
          l.x+=(l.vx+S.drift.flow[0]*Math.sin(l.y*1.1+this.time*.15))*dt+stepX;
          l.y+=(l.vy+S.drift.flow[1]*Math.cos(l.x*.9-this.time*.12))*dt+stepY;
          l.angle+=l.spin*dt;
        }
        const reach=LEAF_SIZE*l.scale*.55,c=Math.cos(l.angle),s=Math.sin(l.angle);
        this.sample(l.x-c*reach,l.y-s*reach,a);
        this.sample(l.x+c*reach,l.y+s*reach,b);
        l.slopeX+=(clamp((a[0]+b[0])*.5,-.3,.3)-l.slopeX)*ease;
        l.slopeY+=(clamp((a[1]+b[1])*.5,-.3,.3)-l.slopeY)*ease;
        l.bob+=((a[2]+b[2])*.5-l.bob)*ease;
        // A delayed floater meets a passing crest more firmly; no independent oscillator.
        const wet=1+clamp(((a[2]+b[2])*.5-l.bob)*S.contact.waveGain,-S.contact.waveLimit,S.contact.waveLimit);
        l.wetness+=(wet-l.wetness)*ease;
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
