# Development notes

[Back to README](../README.md) · [中文首页](../README.zh-CN.md)

These notes are for building, modifying or testing the wallpaper. Ready-made
downloads and installation instructions are in the README.

## Run from source

Open `wallpaper/index.html` for Classic or `wallpaper-hd/index.html` for HD.
Both are standalone web wallpapers with embedded image assets and no runtime
dependencies or network requests. Use `wallpaper-hd/preview.html` for HD
comparison controls.

## Repository layout

| Directory | Contents |
| --- | --- |
| `wallpaper/` | Classic runtime and engine metadata |
| `wallpaper-hd/` | HD runtime and engine metadata |
| `reference/` | Preserved AOSP sources and derived artwork/maps |
| `scripts/` | Offline asset processing and packaging |
| `tests/` | Simulation, asset and browser checks |
| `docs/` | User images, architecture, provenance and release notes |
| `dist/` | Generated packages, excluded from Git |

## Classic implementation

The AOSP implementation is called `Fall` internally. The desktop adaptation
uses the original artwork, 14 leaves, an eight-cell atlas and up to ten
analytic ripple sources. A fixed 30 ms simulation step preserves the original
timing. Mesh normals offset the pond's texture coordinates; leaves render
separately. There is no fluid solver.

`simulation.js` handles motion and ripples; `renderer.js` handles WebGL and
input. The desktop view uses upright, aspect-preserving cropping and one
viewport rather than Android launcher pages. It has not been matched frame
by frame to a particular Samsung Galaxy firmware.

## HD implementation

See [HD architecture](hd-architecture.md) for runtime responsibilities,
settings, lighting, contact and offline map extraction. Asset provenance is
recorded in [background-upscale.txt](background-upscale.txt) and
[leaf-upscale.txt](leaf-upscale.txt). The original AOSP images remain intact.

The preview panel groups the visual switches. C toggles lighting, S canopy
shade, B wave-driven leaf motion, T menisci and L leaves. H toggles the panel;
Space pauses. Switches redraw without advancing time while paused.

Space and H remain available in the HD preview for visual review, but are not
advertised in the user README. Remove these two user-facing shortcuts before
the HD stable release. Keep the wallpaper engine's pause/resume integration.

## Build packages

From the repository root, with PowerShell 7:

```powershell
pwsh -NoProfile -File scripts/package.ps1
pwsh -NoProfile -File scripts/package-hd.ps1
```

The Classic script creates separate Sucrose and Lively ZIPs. The HD script
creates one ZIP with metadata for all three apps and a SHA-256 checksum file.
Runtime files sit at the archive root. Attach packages to the corresponding
GitHub release; keep stable and HD preview releases separate.

## Checks

Classic, with Node.js:

```sh
node tests/simulation.cjs
node --check wallpaper/renderer.js
node --check wallpaper/simulation.js
```

HD, with Node.js and Python + Pillow:

```sh
node tests/hd-world.cjs
node tests/hd-contact.cjs
python tests/hd-art.py
python scripts/build-hd-maps.py --check
```

For browser checks, serve the repository, for example with
`python -m http.server 8000 --bind 127.0.0.1`. Open `/tests/edge-render.html`
for Classic. The [HD architecture document](hd-architecture.md#verification)
lists the HD browser checks and visual sequence pages.

The tests cover analytic motion, timing, borders, contact fields and the
documented HD behavior. Browser results do not establish compatibility or
sustained performance in every native wallpaper engine.
