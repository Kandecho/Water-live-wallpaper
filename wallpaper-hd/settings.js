/* Water HD artistic controls. Reload after editing; no runtime build step. Apache-2.0. */
(function(root){
  'use strict';
  // Parameter reference: docs/configuration.zh-CN.md (package: CONFIGURATION.zh-CN.md).
  const settings={
    render:{maxFPS:60,maxDPR:2,gridRows:96,maxColumns:600},
    scene:{leafCount:14,leafSize:.55,leafScale:[.4,.5]},
    waves:{maxSources:12,lifetime:6,speed:.85,height:.018,frequency:19,width:14,rise:9,decay:.68,
      ambientInterval:[2.4,4.5],ambientStrength:.13,landingStrength:.75},
    drift:{velocityX:[-.006,.006],velocityY:[-.044,-.036],spin:[-.09,.09],fallSpeed:.15,settleTime:.24,flow:[.012,.006]},
    // Both gust types share one scene. Waits start at startup or that type's end.
    wind:{gap:[2,5],direction:[0,Math.PI*2],
      driftSpeed:.045,responseTime:.65,waveHeight:.010,waveNumber:5.2,waveSpeed:.65,
      airSpin:.5,airSpinFadeHeight:.18,
      gusts:{
        gentle:{label:'轻风',wait:[25,45],duration:13},
        strong:{label:'强风',wait:[150,240],duration:10,
          driftSpeed:.11,responseTime:.55,waveHeight:.030,airSpin:.85}
      }
    },
    water:{refraction:.10,normalScale:.85,diffuse:.13,sheen:.15,sheenPower:42},
    light:{direction:[-.38,.54,.751],ambient:[.61,.65,.69],keyColor:[1.04,1.,.91],keyStrength:.53,canopyStrength:.48,
      // Offline artistic projection. UV offsets use this same light direction.
      canopy:{resolution:512,dark:[18,58],chroma:[10,38],blur:7,
        levels:[.10,.64],projectionHeight:.055,scale:1.02}},
    leaf:{ridge:.32,curl:.22,normalTilt:.9,shear:.20,squash:.24,turn:.22,bob:.45,
      contactShadow:.07,airShadow:.17,
      // Original atlas leaf roots and main-vein axes, in image coordinates.
      origins:[[.5,.53],[.51,.68],[.34,.64],[.52,.69],[.34,.34],[.51,.72],[.52,.69],[.34,.60]],
      axes:[[0,-1],[-.12,-.99],[.2,-.98],[0,-1],[.5,-.866],[0,-1],[0,-1],[.42,-.908]]},
    contact:{depth:.0052,directionalLight:.12,waveGain:14,waveLimit:.16,
      restTilt:.045,liftRange:[.7,1],
      // 0: petiole wet / tip lifted; 1: petiole lifted; 2: side lifted.
      // Local UV axes are relative to the main vein, shared with offline maps.
      poses:[[1,0],[-1,0],[0,1]]},
    input:{spacing:.085,cadence:.075,clickStrength:1,dragStrength:.55},
    // Effect defaults; grouping and keyboard shortcuts are used only in preview.
    features:[
      {key:'lighting',label:'光照',group:'光影',code:'KeyC',enabled:true},
      {key:'canopy',label:'树荫',group:'光影',code:'KeyS',enabled:true},
      {key:'motion',label:'轻摆',group:'水面',code:'KeyB',enabled:true},
      {key:'breeze',label:'风',group:'风',code:'KeyG',enabled:true},
      {key:'contact',label:'叶缘接触',group:'水面',code:'KeyT',enabled:true},
      {key:'leaves',label:'叶子',group:'画面',code:'KeyL',enabled:true}
    ]
  };
  if(typeof module!=='undefined'&&module.exports)module.exports=settings;else root.WaterSettings=settings;
})(typeof globalThis!=='undefined'?globalThis:this);
