Water HD — Floating Leaves Study 04 (prototype 0.4.0)

4K pond reflection, positional canopy shade, varied wet/dry leaf poses,
narrow petiole/edge menisci and interactive ripples. Original leaf artwork
remains a placeholder. Separate from the classic 1.0.1 release.

PREVIEW: open preview.html for the comparison panel.
WALLPAPER: use index.html for a clean screen.
Click / drag: ripples. Space: pause. H: panel. All switches work while paused.
C: lighting. S: canopy. B: wave-driven motion. T: menisci. L: leaves.

BACKGROUND: original AOSP pond, processed offline with RealESRNet at 2x then
4x. The 4096x4096 atlas contains a 3832x3200 usable image with edge-extended
padding. Composition and colors are retained; tiny silhouettes are simplified.
No diffusion/image-gen. Mipmaps reduce shimmer at smaller display sizes.

LIGHT: one direction controls water, leaf normals, raised-part shadows and
offline canopy projection. The canopy is selected by color and brightness,
shifted away from the light, softened and remapped to keep open areas bright.
It is art direction from reflections, not recovered 3D tree geometry.
Only direct leaf light is attenuated; the background is not darkened twice.

CONTACT: a leaf receives one of three poses at birth: wet petiole / raised tip,
raised petiole, or raised side. Its pose stays stable until it leaves the scene.
Raised regions have no meniscus and a softer, fainter shadow. Short wet petiole
segments and a few edge patches disturb the water. The same wave height that
drives bobbing slightly modulates contact loading, without an independent
oscillator or per-frame random wetting. No fluid or physical wetting solver.

Maps and image bytes are PRECOMPUTED and embedded. No extraction, blur,
model download, Python, Node, server or network is required at startup.
TUNING: settings.js groups light, canopy extraction, leaf/contact poses,
waves, drift and input. Extraction changes require rebuilding offline maps
with the repository script; ordinary strength changes only require reload.
Architecture: docs/hd-architecture.md in the source repository.

Timing is independent of rendering FPS, up to 60 FPS. Wallpaper Engine respects
your global limit. The meter counts render calls, not GPU completion.
Browser checks include 3840x2160 rendering; native engine compatibility and
sustained 4K desktop performance still require testing on the target desktop.

Sucrose: drag this ZIP into the library.
Lively: import the ZIP (not yet tested in Lively).
Wallpaper Engine: extract and create a NEW project from index.html.
Keep the published classic Workshop project separate.

Source: https://github.com/Kandecho/Water-live-wallpaper/tree/main/wallpaper-hd
License and provenance: LICENSE.txt and NOTICE.txt.
