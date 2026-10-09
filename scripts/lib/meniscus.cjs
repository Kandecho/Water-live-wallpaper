/* Alpha-derived capillary contact field. No fluid solver or replacement artwork. Apache-2.0. */
(function(root){
  'use strict';
  const CELL=128,PAD=32,TILE=CELL+PAD*2;
  const S=require('../../wallpaper-hd/settings.js');
  // Short petiole sections, not the whole stalk; original atlas coordinates.
  const STEMS=[[[62,94],[63,113]],[[69,103],[73,120]],[[21,109],[35,95]],
    [[55,103],[54,118]],[[8,48],[27,45]],[[56,107],[49,121]],[[68,114],[72,125]],[[5,85],[22,80]]];
  const THRESHOLD=64;
  // Assumed low points of each curled leaf, in original atlas pixels (x,y,radius).
  // These are art-directed contact patches, not recovered 3D leaf geometry.
  const CONTACTS=[
    [[64,13,11],[102,64,16],[53,101,9]],
    [[48,10,10],[107,47,13],[25,77,15]],
    [[54,14,11],[99,48,13],[43,106,10]],
    [[65,10,10],[104,67,16],[29,72,12]],
    [[106,45,13],[72,99,14],[24,64,11]],
    [[67,15,11],[98,43,14],[45,111,10]],
    [[73,10,10],[114,77,14],[28,70,14]],
    [[79,17,12],[103,67,14],[52,102,11]]
  ];
  // Eight-neighbour distance transform, built once. Padding isolates atlas cells.
  function distance(alpha,width,height){
    const d=new Float32Array(width*height);
    for(let i=0;i<d.length;i++)d[i]=alpha[i]>=THRESHOLD?0:1e4;
    const relax=(x,y,dx,dy,cost)=>{
      const xx=x+dx,yy=y+dy;
      if(xx>=0&&xx<width&&yy>=0&&yy<height){const i=y*width+x;d[i]=Math.min(d[i],d[yy*width+xx]+cost);}
    };
    for(let y=0;y<height;y++)for(let x=0;x<width;x++){
      relax(x,y,-1,0,1);relax(x,y,0,-1,1);relax(x,y,-1,-1,Math.SQRT2);relax(x,y,1,-1,Math.SQRT2);
    }
    for(let y=height-1;y>=0;y--)for(let x=width-1;x>=0;x--){
      relax(x,y,1,0,1);relax(x,y,0,1,1);relax(x,y,1,1,Math.SQRT2);relax(x,y,-1,1,Math.SQRT2);
    }
    return d;
  }
  function atlas(rgba){
    const width=TILE*8,height=TILE*S.contact.poses.length,data=new Uint8ClampedArray(width*height*4);
    for(let state=0;state<S.contact.poses.length;state++)for(let cell=0;cell<8;cell++){
      const alpha=new Uint8Array(TILE*TILE);
      for(let y=0;y<CELL;y++)for(let x=0;x<CELL;x++)alpha[(y+PAD)*TILE+x+PAD]=rgba[(y*CELL*8+cell*CELL+x)*4+3];
      const raw=distance(alpha,TILE,TILE),smooth=new Float32Array(raw.length);
      // Smooth the low-resolution silhouette's distance, without touching the art.
      for(let y=0;y<TILE;y++)for(let x=0;x<TILE;x++){
        let sum=0;
        for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)sum+=raw[Math.max(0,Math.min(TILE-1,y+dy))*TILE+Math.max(0,Math.min(TILE-1,x+dx))];
        smooth[y*TILE+x]=sum/9;
      }
      const boundary=[];
      for(let y=1;y<TILE-1;y++)for(let x=1;x<TILE-1;x++){
        const i=y*TILE+x;
        if(alpha[i]>=THRESHOLD&&[i-1,i+1,i-TILE,i+TILE].some(n=>alpha[n]<THRESHOLD))boundary.push([x,y]);
      }
      const anchors=CONTACTS[cell].map(([x,y,r])=>{
        let nearest=[x+PAD,y+PAD],best=Infinity;
        for(const p of boundary){const d=(p[0]-x-PAD)**2+(p[1]-y-PAD)**2;if(d<best){best=d;nearest=p;}}
        return [...nearest,r];
      });
      const axis=S.leaf.axes[cell],pose=S.contact.poses[state],origin=S.leaf.origins[cell];
      const lift=[axis[0]*pose[0]-axis[1]*pose[1],axis[1]*pose[0]+axis[0]*pose[1]];
      // Raised parts stay dry. A coherent pose determines all contact patches.
      const dry=(x,y)=>{
        const t=Math.max(0,Math.min(1,(((x-PAD)/127-origin[0])*lift[0]+((y-PAD)/127-origin[1])*lift[1]-.015)/.22));
        return 1-t*t*(3-2*t);
      };
      const heightField=new Float32Array(raw.length);
      for(let y=1;y<TILE-1;y++)for(let x=1;x<TILE-1;x++){
        const i=y*TILE+x,d=smooth[i];if(d>=8||!boundary.length)continue;
        const gx=(smooth[i+1]-smooth[i-1])/2,gy=(smooth[i+TILE]-smooth[i-TILE])/2;
        const length=Math.hypot(gx,gy)||1,px=x-d*gx/length,py=y-d*gy/length;
        let weight=0;
        for(const [ax,ay,r] of anchors){
          const t=Math.max(0,1-((px-ax)**2+(py-ay)**2)/(r*r));
          weight=Math.max(weight,t*t*(3-2*t)*dry(ax,ay));
        }
        if(state!==1){
          const [a,b]=STEMS[cell],dx=b[0]-a[0],dy=b[1]-a[1];
          const t=Math.max(0,Math.min(1,((px-PAD-a[0])*dx+(py-PAD-a[1])*dy)/(dx*dx+dy*dy)));
          const ax=a[0]+dx*t+PAD,ay=a[1]+dy*t+PAD;
          const k=Math.max(0,1-((px-ax)**2+(py-ay)**2)/25);
          weight=Math.max(weight,k*k*(3-2*k)*dry(ax,ay)*(state===0?1:.75));
        }
        const fade=Math.min(1,(8-d)/2);
        heightField[i]=weight*Math.exp(-d/2.4)*fade*fade*(3-2*fade);
      }
      // Differentiate the whole local depression, including the patch ends.
      // This avoids chopped-off highlights where a wet edge becomes a dry edge.
      for(let y=0;y<TILE;y++)for(let x=0;x<TILE;x++){
        const i=y*TILE+x,o=((y+state*TILE)*width+cell*TILE+x)*4;
        const gx=(heightField[y*TILE+Math.max(0,x-1)]-heightField[y*TILE+Math.min(TILE-1,x+1)])/2;
        const gy=(heightField[Math.max(0,y-1)*TILE+x]-heightField[Math.min(TILE-1,y+1)*TILE+x])/2;
        data[o]=heightField[i]*255;
        data[o+1]=128+Math.max(-1,Math.min(1,gx/.5))*127;
        data[o+2]=128+Math.max(-1,Math.min(1,gy/.5))*127;data[o+3]=255;
      }
    }
    return {width,height,data};
  }
  const api={CELL,PAD,TILE,CONTACTS,STEMS,distance,atlas};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.WaterContact=api;
})(typeof globalThis!=='undefined'?globalThis:this);
