# Water HD architecture

The HD study keeps the original's useful idea: a small scene state, analytic
motion, prepared images, and a direct rendering order. It uses plain JavaScript
and WebGL 1, without a build tool, framework, physics engine, or runtime baking.
The classic `wallpaper/` release is independent.

## Runtime responsibilities

| File | Responsibility |
| --- | --- |
| `wallpaper-hd/settings.js` | Artistic parameters and feature definitions: defaults, groups, keyboard shortcuts. |
| `wallpaper-hd/world.js` | Leaf state, drift, falling and analytic wave height/derivatives. No DOM or WebGL. |
| `wallpaper-hd/shaders.js` | Three shader programs. Shared leaf/contact pose, with constants from settings. |
| `wallpaper-hd/renderer.js` | Load textures, create GPU resources, resize meshes, and draw the scene. No input or animation timer. |
| `wallpaper-hd/app.js` | Frame pacing, engine pause/FPS hooks, pointer input and the optional comparison panel. |
| `wallpaper-hd/assets.js` | Unchanged embedded AOSP background and leaf artwork. |
| `wallpaper-hd/maps.js` | Generated embedded canopy, local contact and soft shadow textures. |

Per frame: `app` advances `world`, then asks `renderer` to draw water → local
menisci → soft leaf shadows → leaves. A single GPU copy of the water is used
only when visible leaves and menisci are enabled. There is no CPU readback in
the wallpaper. PNG data is embedded so image loading also works offline without
fetching sibling files or requiring a local server.

## Editing the look

Edit `settings.js` and reload the wallpaper. `light` contains the direction,
ambient color, key-light color/strength, and canopy attenuation. `leaf` contains
the main-vein fold/curl and per-sprite vein axes. `contact` controls the depth
and extra directional lighting of the already narrow contact patches.
`water`, `waves`, `drift`, and `input` hold the other visual/motion controls.

Feature definitions also build the preview panel, so labels, defaults and keys
are not duplicated in HTML and event handlers:

| Group | Features | Keys |
| --- | --- | --- |
| Light | Lighting, canopy | C, S |
| Water | Leaf motion, local menisci | B, T |
| View | Leaves, pause | L, Space |

H toggles the panel. All comparison switches work while paused. Lighting can
be disabled without disabling motion; canopy only attenuates the direct-light
term. The soft contact shadow does not change when toggling menisci.

## Offline map extraction

Run from the repository root with Python + Pillow and Node.js installed:

```sh
python scripts/build-hd-maps.py
python scripts/build-hd-maps.py --check
```

Normal wallpaper users need none of these tools. Generated outputs are committed.
The `--check` mode regenerates in memory and verifies the committed outputs
without writing files.

The source images in `reference/original-assets/` are never modified. The script
creates inspectable PNGs under `reference/derived/` and embeds the same bytes in
`wallpaper-hd/maps.js`:

- **Canopy, 256×256:** select dark areas from the usable pond region, downsample,
  and blur. Black = open sky, white = stronger canopy occlusion. This is art
  direction based on reflections, not a recovered map of physical tree shadows.
- **Contact, 1536×192:** `scripts/lib/meniscus.cjs` retains the tested distance and
  pinned-contact algorithm. R stores local depression weight; GB store its
  derivatives. Three short contact patches per leaf fade within 8 source pixels.
- **Shadow, 1024×128:** blur each original alpha cell separately, preventing
  neighbouring sprites from bleeding into one another.

Edit canopy thresholds/blur in `build-hd-maps.py`; edit contact anchors in
`scripts/lib/meniscus.cjs`, then rerun the extraction. Changing ordinary light
strengths or motion settings does not require regeneration.

Canopy sampling uses world position and the same background crop, but excludes
ripple displacement. Leaf normals come from a rounded main vein and shallow
fold/curl, rotated with each leaf. Ambient fill remains present under the canopy;
only the key light is attenuated. The current original artwork still limits
detail, and no true leaf deformation or wetting solver is used.

## Relevant checks

```sh
node tests/hd-world.cjs
node tests/hd-contact.cjs
python scripts/build-hd-maps.py --check
```

Serve the repository and open `tests/hd-render.html` for complete-frame border
and WebGL checks, and `tests/hd-lighting.html` for canopy placement, independent
switches and the absence of runtime image generation. `tests/hd-lifecycle.html`
checks engine pause/resume, the FPS cap and comparison redraws while paused.
`tests/hd-contact-sequence.html`
provides all eight original sprites and 0.25-second simulation steps for visual
inspection of drift, rotation and passing waves.

Browser checks do not establish native engine compatibility or 4K desktop
performance. Wallpaper Engine's own FPS limit is respected.
