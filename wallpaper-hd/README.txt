Water (Autumn Leaves) HD — Preview 1
Version: 0.1.0-preview.1 | Git tag: hd-v0.1.0-preview.1

An HD reinterpretation of the classic Android Water wallpaper. Original
composition and leaf shapes are retained, with a 4K pond, 512px reconstructed
leaves, positional canopy shade, subtle floating poses and local water contact.
This is a preview release. The classic 1.0.1 wallpaper remains separate.

INSTALL
Sucrose: import this ZIP into the library.
Lively: import this ZIP (native Lively testing is still pending).
Wallpaper Engine: extract and create a NEW web wallpaper from index.html.
Do not overwrite the classic Workshop project.
Browser: open index.html directly; no server or network is needed.

CONTROLS
Click / drag water: ripples. Space: pause. H: comparison panel.
C: lighting. S: canopy. B: wave-driven motion. T: menisci. L: leaves.
Open preview.html to show the panel initially. Switches work while paused.
There is no direct leaf dragging or cursor-following behavior.

ART AND MOTION
The original AOSP images were reconstructed offline using RealESRNet, with
two 2x stages (4x inference followed by Lanczos reduction at each stage).
The pond atlas is 4096x4096; its usable image is 3832x3200.
Eight leaf cells are now 512x512, packed into a 4096x512 atlas. RGB edge
cleanup precedes reconstruction. Original alpha preserves leaf shape and
petioles, with tiny detached dust removed and bicubic resampling.
This is reconstruction, not recovered photographic detail or new leaf art.
No diffusion/image-gen was used. Both color atlases use mipmaps.

One shared light direction drives water and leaf lighting. An offline canopy
map reduces direct leaf light according to world position. Three persistent
floating poses control raised-part shadows and small wet contact patches.
Waves affect leaf motion and contact loading. This is art-directed analytic
motion, not a fluid solver or physical wetting simulation.

All images/maps are embedded. No extraction, blur, inference, model download,
Python, Node, server or network is needed at startup.
settings.js groups the artistic controls. Source repository documentation
explains the optional offline extraction/upscale workflow.

Rendering is capped at 60 FPS and respects lower Wallpaper Engine settings.
The preview meter counts render calls, not completed GPU frames. Browser
checks include 4K, portrait and ultrawide layouts. Native engine compatibility
and sustained 4K performance still need target-system testing.

Next experiments: shared gentle gusts, then local leaf bending.
Direct leaf-pushing interaction is not planned.

Source: https://github.com/Kandecho/Water-live-wallpaper
License and attribution: LICENSE.txt and NOTICE.txt.
