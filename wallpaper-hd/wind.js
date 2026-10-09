/* Random gust scheduling only. All times are simulation seconds. Apache-2.0. */
(function(root){
  'use strict';
  const S=typeof module!=='undefined'&&module.exports?require('./settings.js'):root.WaterSettings;
  // Separate stream: leaf recycling and rendering cannot change future gusts.
  function seeded(seed){let n=seed>>>0;return ()=>((n=(Math.imul(n,1664525)+1013904223)>>>0)/4294967296);}
  class Scheduler {
    constructor(random=Math.random,config=S.wind){
      this.random=random;this.config=config;this.active=null;this.readyAt=0;
      this.effect=config;this.next=Object.fromEntries(Object.entries(config.gusts).map(([kind,g])=>[kind,this.range(g.wait)]));
    }
    range([low,high]){return low+(high-low)*this.random();}
    firstDue(){return Object.keys(this.next).reduce((a,b)=>this.next[a]<=this.next[b]?a:b);}
    boundary(){return this.active?this.active.end:Math.max(this.readyAt,this.next[this.firstDue()]);}
    advance(time){
      while(this.boundary()<=time){
        const at=this.boundary();
        if(this.active){
          const kind=this.active.kind;
          this.next[kind]=at+this.range(this.config.gusts[kind].wait);
          this.readyAt=at+this.range(this.config.gap);this.active=null;
        }else{
          const kind=this.firstDue(),effect={...this.config,...this.config.gusts[kind]};
          const direction=this.range(this.config.direction);
          this.effect=effect;
          this.active={kind,start:at,end:at+effect.duration,direction,x:Math.cos(direction),y:Math.sin(direction)};
          this.next[kind]=Infinity;
        }
      }
    }
    // Preview requests use the same queue, duration and gap as automatic gusts.
    // Repeated requests cannot interrupt a gust or build an unbounded backlog.
    request(kind,time){
      if(!Object.hasOwn(this.next,kind))throw Error('Unknown gust: '+kind);
      this.advance(time);
      if(this.active?.kind===kind)return;
      this.next[kind]=Math.min(this.next[kind],time);this.advance(time);
    }
    sample(time,out){
      const gust=this.active;
      out.strength=0;out.x=gust?.x??1;out.y=gust?.y??0;
      if(gust&&time>gust.start&&time<gust.end){
        const pulse=Math.sin(Math.PI*(time-gust.start)/(gust.end-gust.start));
        out.strength=pulse*pulse;
      }
      return out;
    }
  }
  const api={Scheduler,seeded};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.WaterWind=api;
})(typeof globalThis!=='undefined'?globalThis:this);
