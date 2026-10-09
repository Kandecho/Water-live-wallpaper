# Water HD architecture

HD Preview 1 keeps prepared images, compact state and analytic motion, rendered
with plain JavaScript and WebGL 1. There is no fluid solver or runtime image
extraction. The classic `wallpaper/` release remains independent.

## Responsibilities

| File | Responsibility |
| --- | --- |
| `settings.js` | Artistic controls, offline canopy calibration, pose definitions and feature switches. |
| `world.js` | Leaf lifetime/drift, stable wet/dry pose, analytic waves and delayed response. |
| `shaders.js` | Water, contact and leaf/shadow programs, with a shared leaf transform. |
| `renderer.js` | Textures, mesh, resize and ordered passes. One resting/wave pose is computed per leaf per frame and reused across leaves, shadows and contacts. |
| `app.js` | Input, preview controls, timer and engine pause/FPS hooks. |
| `assets.js` | Generated embedded 4K pond and 512px reconstructed AOSP leaf cells. |
| `maps.js` | Generated embedded canopy, wet/dry contact variants and shadow textures. |

Each frame advances the world, then draws water → menisci → shadows → leaves.
Menisci require one GPU copy of the rendered water. There is no CPU readback
in the wallpaper. The pond and leaf color atlases use mipmaps to reduce minification shimmer
and high-precision texture coordinates where supported. Images remain embedded
for offline use, including direct local-file loading.

## Settings and interaction

`light.direction` supplies water/leaf lighting, shadow direction and the offline
canopy shift. `light.canopy` groups extraction thresholds, blur, levels, projection
height and scale. Projection height is an artistic UV calibration, not recovered
physical tree height. `contact` contains depth, reflection cue, resting tilt,
three poses and bounded wave response. `leaf` holds sprite roots and vein axes.

The feature list generates defaults, panel groups and keys: C lighting, S canopy,
B wave-driven motion, T menisci, L leaves. Space pauses; H shows/hides the panel.
Switches redraw while paused without advancing time. Disabling motion retains
the leaf's resting wet/dry pose.

## Offline workflow

Original AOSP files in `reference/original-assets/` remain unchanged. The approved
RealESRNet result is `reference/derived/hd-pond-4k.png`, a 4096×4096 atlas with a
3832×3200 usable region. Unused padding extends edge pixels instead of white.
See [upscale provenance](background-upscale.txt). The optional
`scripts/upscale-background.py` reproduces the two-stage upscale using separately
downloaded official models. Model binaries are not bundled.

The leaf atlas is `reference/derived/hd-leaves-4x.png` (4096×512). Each 128px
source cell is reconstructed independently at 256px, then 512px. See
[leaf provenance](leaf-upscale.txt) and `scripts/upscale-leaves.py`. Alpha
cleanup preserves connected thin petioles. Color and shadow UVs use actual
texture dimensions instead of assuming the original 128px color cells.
Contact maps retain their compact 128px design coordinates, sampling the
new alpha down to that scale; shadow alpha is sampled at 256px per cell.

With Python + Pillow and Node.js, run from the repository root:

```sh
python scripts/build-hd-maps.py
python scripts/build-hd-maps.py --check
```

This derives maps from the 4K pond and reconstructed leaf alpha, then embeds PNGs and
artwork. `--check` regenerates in memory and compares saved bytes. Normal users
need none of these tools; neither extraction nor upscaling runs on startup.

- **Canopy, 512×512:** select dark near-neutral silhouettes by brightness and
  channel spread, rejecting dark blue sky. Shift opposite the shared light,
  blur, then remap levels to remove the gray floor. Black = open sky; white =
  key-light occlusion. Sampling uses world position and the background crop,
  without ripple displacement. It never darkens the reflected background again.
- **Contact, 1536×576:** eight sprites across, three poses down. The alpha-distance
  method in `scripts/lib/meniscus.cjs` includes semi-transparent thin petioles.
  Short contour patches and petiole segments taper within eight original pixels.
  Raised areas are suppressed using the same local pose axes as the renderer.
  R stores depression weight; GB stores its derivatives.
- **Shadow, 2048×512:** each leaf alpha is blurred independently at two radii.
  Raised parts blend toward a softer, fainter shadow and shift away from the key;
  wet areas retain the tighter shadow.

Edit petiole segments and contour anchors in `scripts/lib/meniscus.cjs`.
Regenerate maps after changing source images, `light.direction`, `light.canopy`,
`contact.poses` or sprite roots/axes. Ordinary strengths and wave settings only
require reload. The scene deliberately uses a fixed light direction.

## Coherent floating poses

A leaf chooses a pose and small lift variation once at birth. Randomness never
rerolls per frame. The pose selects both a contact-map row and the raised-part
direction used for normals and shadows: wet petiole / raised tip, raised
petiole, or raised side.

Two wave samples drive delayed slope and bobbing. Their height relative to the
delayed leaf height also modulates meniscus depth, bounded to ±16% and smoothed
with the same response time. The renderer combines resting tilt and wave tilt
for all leaf passes. Water and meniscus gradients combine for reflection and
lighting. There is no independent leaf oscillator, diffraction or wetting solver.

## Verification

```sh
node tests/hd-world.cjs
node tests/hd-contact.cjs
python tests/hd-art.py
python scripts/build-hd-maps.py --check
```

Checks cover exact wave derivatives, frame-rate independence, landing, long-run
state, stable varied poses, bounded wave loading, atlas isolation and depression
derivatives for all pose rows. Browser pages served from the repository:

- `tests/hd-render.html`: complete frames, borders and GL errors at 1280×720,
  480×800, 2560×720 and 3840×2160.
- `tests/hd-lighting.html`: position sampling, independent switches, and no
  Canvas2D contexts during runtime initialization.
- `tests/hd-lifecycle.html`: engine pause/resume, FPS cap and paused redraws.
- `tests/hd-contact-sequence.html`: all eight sprites at 1.67× normal size,
  quarter-second steps and wet/raised-petiole comparisons.
- `tests/hd-shade-sequence.html`: one fixed-angle leaf on a 24-second path at
  normal drift speed. Enlarged on/off views isolate positional lighting; center
  attenuation spans about 0–20% on this path.

Browser checks do not establish native-engine compatibility or sustained 4K
performance. Leaf shape remains anchored to the original alpha; reconstructed detail is not ground truth.

## Scope after Preview 1

Keep the accepted preview as a baseline. Experiment next with shared gentle
gusts, then a small locally deformable leaf mesh. Direct leaf-pushing input
is not planned; the wallpaper should stay quiet in the background.
