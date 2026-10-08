/* Copyright (C) 2009 The Android Open Source Project
 * Desktop adaptation, 2026. Licensed under Apache-2.0; see LICENSE.txt.
 * Based on Basic/res/raw/fall.rs at 74e84e6cbea39c5946d86d93460f753e03a90607.
 * Changes: explicit dt for rotation; bounded grid edges; desktop framing.
 */
(function (root) {
  'use strict';
  const STEP = 0.03; // Original root script requested a 30 ms frame interval.
  const LEAF_SIZE = 0.55;
  const rand = (a, b) => a + Math.random() * (b - a);

  class WaterWorld {
    constructor(aspect) {
      this.drops = Array.from({length:10}, () => ({x:0,y:0,amp:0,radius:1}));
      this.leaves = [];
      this.resize(aspect);
      this.leaves = Array.from({length:14}, () => this.newLeaf(false));
      this.addDrop(rand(.25,.75), rand(.25,.75), 2);
    }
    resize(aspect) {
      const oldW = this.width, oldH = this.height;
      // A portrait retains the original 2-unit width. Desktop stays upright,
      // with the same leaf size/speed relative to a Galaxy S's 800-pixel height.
      this.height = aspect >= 1 ? 10/3 : 2/aspect;
      this.width = this.height * aspect;
      this.cols = Math.ceil(this.width * 24);
      this.rows = Math.ceil(this.height * 24);
      this.dx = this.width / this.cols;
      this.dy = this.height / this.rows;
      this.heights = new Float32Array((this.cols+2)*(this.rows+2));
      this.uv = new Float32Array((this.cols+1)*(this.rows+1)*2);
      if (oldW) {
        for (const l of this.leaves) { l.x *= this.width/oldW; l.y *= this.height/oldH; }
        // Drop positions use normalized screen coordinates and survive resize.
      }
    }
    newLeaf(falling) {
      return {
        x:rand(-this.width/2, this.width/2), y:rand(-this.height/2,this.height/2),
        scale:rand(.4,.5), angle:rand(0,360), sprite:Math.floor(rand(0,8)),
        spin:rand(-.02,.02)*180/Math.PI*(falling ? .35 : .25),
        altitude:falling ? .7 : -1, landed:!falling,
        vx:rand(-.02,.02)/2, vy:-.08*rand(.9,1.1)/2
      };
    }
    addDrop(u, v, amp=2) {
      let weakest = this.drops[0];
      for (const d of this.drops) if (d.amp/d.radius < weakest.amp/weakest.radius) weakest=d;
      Object.assign(weakest,{x:u,y:v,amp,radius:30*STEP});
    }
    leafDrop(l, amp) { this.addDrop(l.x/this.width+.5, .5-l.y/this.height, amp); }
    update(dt) {
      for (const d of this.drops) d.radius += 30*dt;
      // The original adds subtle disturbances at leaves whenever a slot fades.
      if (this.drops.some(d => d.amp/d.radius < .005)) {
        this.leafDrop(this.leaves[Math.floor(Math.random()*14)], rand(.1,.4));
      }
      const recycled = [];
      for (const l of this.leaves) {
        if (l.altitude > 0) {
          l.altitude -= .15*dt;
          l.angle += l.spin*2*dt/STEP;
        } else {
          if (!l.landed) { this.leafDrop(l,1.5); l.spin/=4; l.landed=true; }
          l.x += l.vx*dt; l.y += l.vy*dt; l.angle += l.spin*dt/STEP;
        }
        const edge = LEAF_SIZE*l.scale;
        if (l.x-edge > this.width/2 || l.x+edge < -this.width/2 || l.y+edge < -this.height/2) {
          Object.assign(l,this.newLeaf(true)); recycled.push(l);
        }
      }
      // New falling leaves are painted last, just like gNextLeaves in fall.rs.
      if (recycled.length) this.leaves = this.leaves.filter(l=>!recycled.includes(l)).concat(recycled);
    }
    rippleMesh() {
      const {cols,rows,heights:h,uv,dx,dy} = this;
      const stride=cols+2;
      for (let y=0;y<=rows+1;y++) for (let x=0;x<=cols+1;x++) {
        let z=0;
        for (const d of this.drops) {
          const ampE=d.amp/d.radius;
          if (ampE<=.01) continue;
          const rx=d.x*cols-x, ry=(1-d.y)*rows-y, distance2=rx*rx+ry*ry;
          if (distance2<d.radius*d.radius) {
            const distance=Math.sqrt(distance2);
            z+=Math.sin(d.radius-distance)*ampE*distance/d.radius;
          }
        }
        h[y*stride+x]=z;
      }
      for (let y=0;y<=rows;y++) for (let x=0;x<=cols;x++) {
        const i=y*stride+x, k=(y*(cols+1)+x)*2;
        const a=h[i], b=h[i+1], c=h[i+stride], d=h[i+stride+1];
        // Sum of the two triangle cross products from the original script.
        uv[k]=x/cols-dy*(b+d-a-c);
        uv[k+1]=y/rows-2*dx*(c-a);
      }
      return uv;
    }
  }
  const api={WaterWorld,STEP,LEAF_SIZE};
  if (typeof module !== 'undefined') module.exports=api;
  else root.WaterSimulation=api;
})(typeof window !== 'undefined' ? window : globalThis);
