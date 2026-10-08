Water HD — Light & Canopy Study 03 (prototype 0.3.0)

Original AOSP leaf and pond artwork with restrained directional lighting,
soft canopy shade, narrow leaf-edge menisci and interactive ripples.
No new HD leaf artwork. Separate from the classic 1.0.1 release.

PREVIEW: open preview.html for the comparison panel.
WALLPAPER: use index.html for a clean screen.
Click / drag: ripples. Space: pause. H: panel. All switches work while paused.
C: lighting. S: canopy. B: leaf motion. T: local menisci. L: leaves.

Light: cool ambient fill plus a gentle warm key light. Leaf normals describe a
rounded main vein and shallow folds. A fixed, soft canopy map attenuates only
the key light; it follows scene position, not leaf UVs or wave displacement.
The canopy is an artistic approximation extracted from the reflected trees,
not a geometrically recovered shadow projection.

Contact: three small, contour-snapped patches per original leaf. Their local
height gradient distorts the pond reflection within 8 source pixels of the
edge. No capillary attraction, true deformation or wetting simulation.

All auxiliary maps are PRECOMPUTED and included. The wallpaper loads textures
only; no image extraction or blur runs at startup. Rebuild scripts are retained
in the source repository. Original bitmap bytes remain unchanged.

TUNING: settings.js groups light, water, leaf, contact, drift and input controls.
Rendering order: water -> menisci -> soft shadows -> leaves.
Simulation, shaders, rendering and engine/input handling are separate modules.
Architecture and extraction: docs/hd-architecture.md in the source repository.

Timing is independent of rendering FPS, up to 60 FPS. Wallpaper Engine respects
your global FPS setting. The preview FPS meter counts render calls, not GPU time.
Browser checks passed; native engine compatibility and 4K performance still
need testing on the target desktop. No runtime dependencies or internet access.

Sucrose: drag this ZIP into the library.
Lively: import the ZIP (not yet tested in Lively).
Wallpaper Engine: extract and create a NEW project from index.html.
Keep the published classic Workshop project separate.

Source: https://github.com/Kandecho/Water-live-wallpaper/tree/main/wallpaper-hd
License and provenance: LICENSE.txt and NOTICE.txt.
