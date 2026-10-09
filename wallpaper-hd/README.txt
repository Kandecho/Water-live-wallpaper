Water (Autumn Leaves) HD — Random Wind
Version: 1.0.0

An HD reinterpretation of the classic Android Water wallpaper. Original
composition and leaf shapes are retained, with a 4K pond, 512px reconstructed
leaves, positional canopy shade, subtle floating poses and local water contact.
This is the first stable HD release, distributed on GitHub Releases.
The classic 1.0.1 wallpaper remains separate.

INSTALL
Sucrose: import this ZIP into the library.
Lively: import this ZIP (native Lively testing is still pending).
Wallpaper Engine: extract and create a NEW web wallpaper from index.html.
Do not overwrite the classic Workshop project.
Browser: open index.html directly; no server or network is needed.

CONTROLS
Click / drag water: ripples. Normal index.html has no configuration panel or
preview shortcuts. Engine pause/resume and FPS settings remain supported.
Edit settings.js and reload to change parameters. See CONFIGURATION.zh-CN.md
in the package (docs/configuration.zh-CN.md in the source repository).

PREVIEW ONLY
Open preview.html for comparison controls. Space: pause. H: comparison panel.
C: lighting. S: canopy. B: wave-driven motion. T: menisci. L: leaves.
G: shared wind on/off (water and delayed leaf drift).
Buttons “吹一阵轻风” / “吹一阵强风” request a gust. They enable wind and
resume user pause, but respect engine pause. Requests never interrupt active
wind or bypass a quiet gap; repeated requests do not restart or stack gusts.
Manual gusts use the normal duration: light 13 seconds, strong 10 seconds.
The status shows current type, strength, direction and pending requests.
strong-preview.html is a compatibility entry to the same preview controls.
Switches work while paused. There is no wind-mode selector.
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

Both wind types occur randomly in one scene and one package. Gentle gusts
last 13 seconds, then wait 25–45 seconds; strong gusts last 10 seconds, then
wait 150–240 seconds. The same wait ranges apply at startup. If one is active,
the other waits; every gust leaves a random 2–5 second quiet gap. Delays may
extend the wait. Each gust chooses a fixed random 360-degree direction shared
by water and floating-leaf drift. There is no selection of a default wind mode.
Water responds first; leaf drift catches up and settles gradually. Falling
leaves turn with the wind; extra rotation fades before landing. Floating
leaves keep their usual spin. Local leaf bending remains rejected and archived.
Direct leaf-pushing interaction is not planned.

Source: https://github.com/Kandecho/Water-live-wallpaper
License and attribution: LICENSE.txt and NOTICE.txt.
