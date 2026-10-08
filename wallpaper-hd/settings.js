/* Water HD artistic controls. Reload after editing; no runtime build step. Apache-2.0. */
(function(root){
  'use strict';
  const settings={
    render:{maxFPS:60,maxDPR:2,gridRows:96,maxColumns:600},
    scene:{leafCount:14,leafSize:.55,leafScale:[.4,.5]},
    waves:{maxSources:12,lifetime:6,speed:.85,height:.018,frequency:19,width:14,rise:9,decay:.68,
      ambientInterval:[2.4,4.5],ambientStrength:.13,landingStrength:.75},
    drift:{velocityX:[-.006,.006],velocityY:[-.044,-.036],spin:[-.09,.09],fallSpeed:.15,settleTime:.24,flow:[.012,.006]},
    water:{refraction:.10,normalScale:.85,diffuse:.13,sheen:.15,sheenPower:42},
    light:{direction:[-.38,.54,.751],ambient:[.60,.65,.70],keyColor:[1.04,1.,.91],keyStrength:.50,canopyStrength:.60},
    leaf:{ridge:.32,curl:.22,normalTilt:.9,shear:.20,squash:.24,turn:.22,bob:.45,
      contactShadow:.07,airShadow:.17,
      // Original atlas leaf roots and main-vein axes, in image coordinates.
      origins:[[.5,.53],[.51,.68],[.34,.64],[.52,.69],[.34,.34],[.51,.72],[.52,.69],[.34,.60]],
      axes:[[0,-1],[-.12,-.99],[.2,-.98],[0,-1],[.5,-.866],[0,-1],[0,-1],[.42,-.908]]},
    contact:{depth:.0045,directionalLight:.10},
    input:{spacing:.085,cadence:.075,clickStrength:1,dragStrength:.55},
    // One definition drives defaults, panel grouping and keyboard shortcuts.
    features:[
      {key:'lighting',label:'光照',group:'光影',code:'KeyC',enabled:true},
      {key:'canopy',label:'树荫',group:'光影',code:'KeyS',enabled:true},
      {key:'motion',label:'轻摆',group:'水面',code:'KeyB',enabled:true},
      {key:'contact',label:'叶缘接触',group:'水面',code:'KeyT',enabled:true},
      {key:'leaves',label:'叶子',group:'画面',code:'KeyL',enabled:true}
    ]
  };
  if(typeof module!=='undefined'&&module.exports)module.exports=settings;else root.WaterSettings=settings;
})(typeof globalThis!=='undefined'?globalThis:this);
