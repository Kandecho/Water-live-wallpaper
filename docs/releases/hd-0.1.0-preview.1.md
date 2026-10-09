# Water (Autumn Leaves) HD — Preview 1

The first packaged HD preview keeps the original composition and leaf shapes,
with a reconstructed 4K pond, 512px leaves and restrained water/leaf lighting.
This is a **pre-release** alongside the classic **1.0.1 stable release**.

## Included

- Eight original leaf sprites reconstructed at 4x resolution with RealESRNet.
  RGB edge cleanup and separately resampled alpha preserve thin petioles.
- Positional canopy shade, persistent wet/dry floating poses, softer raised-part
  shadows and small menisci that respond to the same waves as the leaves.
- Resolution-aware atlas sampling, mipmapped color and one shared leaf pose
  per frame for color, shadows and contact.
- Offline reproduction scripts, asset hashes, organized settings and updated
  architecture/provenance documentation. No processing or downloads at startup.

## Download and install

Download **Water-HD-0.1.0-preview.1.zip**. It contains the standalone runtime
and metadata for all three engines; GitHub's source ZIP is not an import ZIP.

- **Sucrose / Lively:** import the ZIP.
- **Wallpaper Engine:** extract the ZIP and create a **new web wallpaper**
  from `index.html`. This is separate from the classic Steam Workshop item.
- **Browser:** open `index.html` directly. Use `preview.html` for comparison controls.

Click/drag on water creates ripples. Space pauses; H shows controls. There is
no direct leaf-dragging interaction. Rendering is capped at 60 FPS and respects
lower Wallpaper Engine settings. Verify downloads with Water-HD-SHA256SUMS.txt.

## Validation and limits

Checked analytic motion, contact fields, silhouette/petiole preservation,
isolated shadow cells, reproducible maps, positional lighting, pause/resume,
FPS limits, and portrait / 16:9 / ultrawide / 4K WebGL browser rendering.
Native-engine compatibility and sustained desktop performance still need
target-system testing. Upscaling reconstructs detail; it does not recover
the original high-resolution photographs.

Next experiments: shared gentle gusts, then local leaf bending. Direct
leaf-pushing interaction is not planned. The classic 1.0.1 and its Workshop
publication are unchanged.

AOSP-derived artwork and source are Apache-2.0; see bundled NOTICE.txt and
LICENSE.txt. Third-party model weights and inference binaries are not included.
