# Water HD architecture — 1.0.0

[HTML diagram (中文)](hd-architecture.html) · [Diagram source](hd-architecture.zh-CN.md)

HD keeps prepared images, compact state and analytic motion, rendered
with plain JavaScript and WebGL 1. There is no fluid solver or runtime image
extraction. The classic `wallpaper/` release remains independent.

## Design baseline: keep the original's small, direct pipeline

The preserved AOSP [FallRS.java](../reference/upstream/FallRS.java) prepares
programs, a mesh and textures in `createScript()`. [fall.rs](../reference/upstream/fall.rs)
keeps 14 leaves and ten ripple slots, computes ripple heights and texture offsets,
then draws the pond and leaf quads in order. Its main function uses elapsed time
capped at 0.2 seconds and requests the next frame after 30 milliseconds.

HD follows these principles with three core responsibilities:

- **app drives:** one animation loop, input and engine integration.
- **world updates:** one scene clock, small leaf/wave arrays and one wind scheduler.
- **renderer draws:** prepared textures, explicit shader programs and ordered passes.

`wind.js` belongs to the scene's scheduling responsibility; `shaders.js` belongs
to rendering. Settings and generated resources are inputs, while preview controls
are an optional client of the existing scene interfaces. These roles do not need
an entity framework, message bus, generic render graph or another service layer.
Keep small helpers in their owning module instead of splitting by function name.

The HD additions have concrete costs: analytic normals, shared floating poses,
offline lighting/contact maps and one GPU water copy when contacts are enabled.
They preserve the quad-based leaves and formula-based water. Asset reconstruction
and map generation stay offline. This is an architecture clarification of the
current implementation; it does not change the accepted visual behavior.

## Responsibilities

| File | Responsibility |
| --- | --- |
| `settings.js` | Artistic controls, offline canopy calibration, pose definitions and feature switches. |
| `wind.js` | Random wait timers, deferred gusts, quiet gaps, fixed per-gust direction and pulse envelope. |
| `world.js` | Leaf lifetime/drift, stable wet/dry pose, analytic waves and delayed wind response; splits updates at gust boundaries. |
| `shaders.js` | Water, contact and leaf/shadow programs, with a shared leaf transform. |
| `renderer.js` | Textures, mesh, resize and ordered passes. One resting/wave pose is computed per leaf per frame and reused across leaves, shadows and contacts. |
| `app.js` | Input, timer and engine pause/FPS hooks; loads comparison controls only in preview mode. |
| `preview-controls.js` / `.css` | Preview-only controls, shortcuts and status display. No persistent configuration. |
| `assets.js` | Generated embedded 4K pond and 512px reconstructed AOSP leaf cells. |
| `maps.js` | Generated embedded canopy, wet/dry contact variants and shadow textures. |

Each frame advances the world, then draws water → menisci → shadows → leaves.
Menisci require one GPU copy of the rendered water. There is no CPU readback
in the wallpaper. The pond and leaf color atlases use mipmaps to reduce minification shimmer
and high-precision texture coordinates where supported. Images remain embedded
for offline use, including direct local-file loading.

## State ownership and frame lifecycle

`app` owns pause/input/FPS state and calls `world.update(dt)` on active animation
callbacks. It calls `renderer.draw()` only when the render budget allows.
`world` owns simulation time, leaves, waves, surface samples and its `wind`
instance. The scheduler owns due times, at most one active gust and the quiet-gap
deadline. Its independent random stream changes only at scheduling events.

During drawing, the renderer requests the world mesh and local water samples;
these reads never advance time or draw new random values. It computes each leaf's
pose once and reuses it for contacts, shadows and artwork. The renderer owns GPU
resources and calls `world.resize()` when the viewport changes. Resizing updates
coordinates and grids without advancing simulation time.

Preview controls request existing world actions and ask the app to redraw or
reset its clock. They do not own a second simulation or persistent settings.
This allows frozen-time visual comparisons and direct Node tests of world/wind
without loading a browser or WebGL.

## Settings and interaction

The [parameter reference (中文)](configuration.zh-CN.md) lists defaults, units,
constraints and reload/offline rebuild requirements. Normal `index.html` uses
file configuration and has no settings UI or preview shortcuts. Only preview
mode loads the controls module and stylesheet; its changes are not saved.

`light.direction` supplies water/leaf lighting, shadow direction and the offline
canopy shift. `light.canopy` groups extraction thresholds, blur, levels, projection
height and scale. Projection height is an artistic UV calibration, not recovered
physical tree height. `contact` contains depth, reflection cue, resting tilt,
three poses and bounded wave response. `leaf` holds sprite roots and vein axes.

The feature list generates defaults, panel groups and keys: C lighting, S canopy,
B wave-driven motion, T menisci, L leaves. Space pauses; H shows/hides the panel.
G compares all wind effects on/off.
The preview buttons request gentle or strong gusts through the shared queue.
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
node tests/hd-breeze.cjs
node tests/hd-wind-scheduler.cjs
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
  Includes breeze button/keyboard state and frozen-time water comparisons.
  Append `?wallpaper=1` to check normal mode has no preview controls/shortcuts
  while engine pause/resume still works.
- `tests/hd-contact-sequence.html`: all eight sprites at 1.67× normal size,
  quarter-second steps and wet/raised-petiole comparisons.
- `tests/hd-shade-sequence.html`: one fixed-angle leaf on a 24-second path at
  normal drift speed. Enlarged on/off views isolate positional lighting; center
  attenuation spans about 0–20% on this path.

Browser checks do not establish native-engine compatibility or sustained 4K
performance. Leaf shape remains anchored to the original alpha; reconstructed detail is not ground truth.

## Random wind in one scene

`settings.wind.gusts` defines gentle and strong gusts. Initial waits are sampled
at startup. When a type ends, only that type draws its next wait: gentle 25–45
seconds, strong 150–240. Durations remain 13 and 10 seconds. Strong wind retains
0.030 wave height, 0.11 drift speed, 0.55-second response and 0.85 airborne spin;
gentle wind retains 0.010, 0.045, 0.65 and 0.5 respectively.

Only one gust is active. The other type keeps its original due time if delayed.
Every completed gust draws a 2–5 second quiet gap. After the gap, the earliest
overdue type starts; exact ties use definition order (gentle first). There is
at most one pending event per type. Next waits begin at actual completion,
so repeated overdue events never accumulate.

Each start draws a uniform direction from 0 to 2π, fixed throughout that gust.
Water waves and leaf drift share the direction. The sine-squared envelope rises
and falls smoothly. Leaf velocity follows with integrated exponential easing;
airborne spin follows the leaf's existing turn sign and fades before landing.
During quiet time, the last gust's response parameters govern the remaining
velocity decay. Turning wind off removes its water contribution and eases drift
toward zero; the schedule continues with simulation time. Pausing stops both.

The scheduler owns a separate random stream seeded once after initial leaves
are created. Leaf recycling, ambient ripples and redraw counts cannot change
future wind. Sampling is read-only. World updates split at exact start/end
boundaries, avoiding frame-quantized timing and preserving the event sequence
at 15/30/60/144 Hz. No new textures or GPU passes are needed.

Preview requests bring a type's due time forward without interrupting active
wind or skipping a quiet gap. A request for the active type does nothing;
duplicate waiting requests do not accumulate. Manual and automatic gusts use
the same duration and peak timing. One package contains this complete behavior;
there is no profile selector, wind query override or production configuration UI.

`tests/hd-wind-scheduler.cjs` checks collisions, quiet gaps, rescheduling, fairness,
direction stability, read-only sampling, repeated requests and exact schedules
across frame rates. `tests/hd-breeze.cjs` checks derivatives, stronger drift,
paused comparisons, six-minute mixed-wind trajectories and airborne landing.

## Rejected local bending

The local mesh-curl experiment was rejected on 2026-10-09 because the visible
stretching felt artificial. It is preserved with its complete runnable source,
notes and focused tests in [the archive](../experiments/rejected-leaf-bending/README.md).
The active runtime retains the accepted quad-based leaf/shadow renderer
and original contact-field lookup. There is no curvature state or F control.
