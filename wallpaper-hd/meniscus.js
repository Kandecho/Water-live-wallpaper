/* Alpha-derived capillary contact field. No fluid solver or replacement artwork. Apache-2.0. */
(function(root){
  'use strict';
  const CELL=128,PAD=32,TILE=CELL+PAD*2,RANGE=32;
  // Eight-neighbour distance transform, built once. Padding isolates atlas cells.
  function distance(alpha,width,height){
    const d=new Float32Array(width*height);
    for(let i=0;i<d.length;i++)d[i]=alpha[i]>=128?0:1e4;
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
    const width=TILE*8,height=TILE,data=new Uint8ClampedArray(width*height*4);
    for(let cell=0;cell<8;cell++){
      const alpha=new Uint8Array(TILE*TILE);
      for(let y=0;y<CELL;y++)for(let x=0;x<CELL;x++)alpha[(y+PAD)*TILE+x+PAD]=rgba[(y*CELL*8+cell*CELL+x)*4+3];
      const raw=distance(alpha,TILE,TILE),smooth=new Float32Array(raw.length);
      // Smooth the low-resolution silhouette's distance, without touching the art.
      for(let y=0;y<TILE;y++)for(let x=0;x<TILE;x++){
        let sum=0;
        for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)sum+=raw[Math.max(0,Math.min(TILE-1,y+dy))*TILE+Math.max(0,Math.min(TILE-1,x+dx))];
        smooth[y*TILE+x]=sum/9;
      }
      for(let y=0;y<TILE;y++)for(let x=0;x<TILE;x++){
        const i=y*TILE+x,o=(y*width+cell*TILE+x)*4;
        const gx=(smooth[y*TILE+Math.min(TILE-1,x+1)]-smooth[y*TILE+Math.max(0,x-1)])/2;
        const gy=(smooth[Math.min(TILE-1,y+1)*TILE+x]-smooth[Math.max(0,y-1)*TILE+x])/2;
        data[o]=Math.min(1,smooth[i]/RANGE)*255;
        data[o+1]=(Math.max(-1,Math.min(1,gx))*.5+.5)*255;
        data[o+2]=(Math.max(-1,Math.min(1,gy))*.5+.5)*255;data[o+3]=255;
      }
    }
    return {width,height,data};
  }
  const api={CELL,PAD,TILE,RANGE,distance,atlas};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.WaterContact=api;
})(typeof globalThis!=='undefined'?globalThis:this);
