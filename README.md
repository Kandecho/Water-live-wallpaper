# Water (Autumn Leaves)

A desktop recreation of the classic Android **Water** live wallpaper from the 2009–2010 era. Autumn leaves drift across a reflective pond, with ripples responding to your touch.

Built with the original AOSP textures and ripple algorithm, adapted for Windows. The historical AOSP implementation is named `Fall` internally. This project is an independent recreation, not an official Samsung or Google release, and has not been matched frame by frame against a specific Galaxy firmware.

![Water running in a browser](docs/preview.jpg)

## Try it

Download the repository, then open `wallpaper/index.html` in a WebGL-capable browser. No dependencies, build step, server, or network connection are required.

- Click the water to make a ripple.
- Press **Space** to pause or resume.

For desktop use:

| Engine | Import |
| --- | --- |
| Sucrose | Build the Sucrose ZIP, drag it into the library, then choose **Use**. |
| Lively | Build the Lively ZIP and import it into the library. |
| Wallpaper Engine | Create a web wallpaper in the editor using `wallpaper/index.html`, then save it as a local project. |

The repository includes metadata for all three engines. Browser rendering, click input, and pause/resume have been checked. A Sucrose installation is in use by the maintainer; formal desktop compatibility testing across all three engines is still pending. Desktop input forwarding depends on the engine's settings and focus.

When published, ready-made packages will be available under [Releases](https://github.com/Kandecho/Water-live-wallpaper/releases). GitHub's automatic source ZIP is the whole repository, not an engine import package.

## Build import packages

On Windows with PowerShell 7:

```powershell
pwsh -NoProfile -File scripts/package.ps1
```

This writes `Water-Original-Sucrose-1.0.0.zip` and `Water-Original-Lively-1.0.0.zip` into `dist/`. Runtime files sit at the ZIP root. Generated packages are excluded from Git; attach them to a Release when ready.

## How it works

The scene uses 14 leaves, an eight-cell texture atlas, and up to ten analytic ripple sources. A sine wave describes each expanding ripple. Local mesh normals offset the pond texture coordinates; the leaves render separately. There is no fluid solver.

A fixed 30 ms update step preserves the original animation timing on modern monitors. Desktop adaptations include upright, aspect-preserving background cropping and a single viewport instead of Android launcher pages. Original bitmap resolution is retained.

## Project layout

```text
wallpaper/       Standalone runtime and engine metadata
reference/       Original AOSP images and two source files
docs/            Preview and archived research notes
tests/           Simulation checks
scripts/         Package creation
dist/            Local ZIP packages (not tracked)
```

`wallpaper/simulation.js` handles leaf motion and ripples; `wallpaper/renderer.js` handles WebGL and input. `wallpaper/assets.js` embeds the original image bytes as Base64 so the wallpaper also works through `file://`.

Run the existing checks with Node.js:

```sh
node tests/simulation.cjs
node --check wallpaper/renderer.js
node --check wallpaper/simulation.js
```

The simulation checks compare the analytic wave and triangle normals against independent formulas, exercise landing and drift, run ten simulated minutes, and check portrait through 32:9 grids. They do not replace visual or engine compatibility testing.

The classic recreation is the only version implemented so far. A future enhanced version can live alongside it without changing the classic entry point.

## Sources and license

Based on [AOSP Basic live wallpapers](https://android.googlesource.com/platform/packages/wallpapers/Basic/+/74e84e6cbea39c5946d86d93460f753e03a90607/), pinned to commit `74e84e6cbea39c5946d86d93460f753e03a90607`.

Copyright (C) 2009 The Android Open Source Project. Desktop adaptation maintained by Kandecho. See [LICENSE.txt](LICENSE.txt) and [NOTICE.txt](NOTICE.txt) for attribution and changes.

Historical research pages in `docs/` describe the investigation at the time they were written. This README records the current project state.
