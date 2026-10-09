<h1 align="center">Water</h1>
<p align="center"><strong>The pond you remember. Back on your desktop.</strong></p>
<p align="center">A classic Android live wallpaper, recreated · Autumn leaves & ripples · Fully offline</p>

<table>
  <tr><th width="50%">Classic · Original artwork</th><th width="50%">HD · Softer light, finer detail</th></tr>
  <tr>
    <td><img src="docs/preview.jpg" width="100%" alt="Classic: autumn leaves on a reflective pond"></td>
    <td><img src="docs/hd-preview.jpg" width="100%" alt="HD: reconstructed leaves, soft shadows and water contact"></td>
  </tr>
</table>

<p align="center">
  <a href="https://github.com/Kandecho/Water-live-wallpaper/releases/tag/hd-v1.0.1"><img src="https://img.shields.io/badge/HD-1.0.1-355d6b" alt="HD 1.0.1"></a>
  <a href="https://github.com/Kandecho/Water-live-wallpaper/releases/tag/v1.0.1"><img src="https://img.shields.io/badge/Classic-1.0.1-986433" alt="Classic 1.0.1"></a>
  <a href="LICENSE.txt"><img src="https://img.shields.io/badge/License-Apache--2.0-64736b" alt="Apache 2.0 license"></a>
</p>

<p align="center">
  <a href="https://github.com/Kandecho/Water-live-wallpaper/releases/download/hd-v1.0.1/Water-HD-1.0.1.zip"><strong>Download HD</strong></a> ·
  <a href="https://steamcommunity.com/sharedfiles/filedetails/?id=3815903983"><strong>Classic on Steam</strong></a> ·
  <a href="https://github.com/Kandecho/Water-live-wallpaper/releases/tag/v1.0.1">Classic ZIPs</a>
</p>

**English** · [简体中文](README.zh-CN.md)

## A pond, falling leaves, and a touch

Trees reflect in the water as autumn leaves drift past. Click the surface and ripples spread beneath your pointer. Or leave it alone and let the scene accompany your desktop.

- **Classic** keeps the original AOSP artwork and the familiar early Android look.
- **HD** adds reconstructed artwork, softer lighting, local water contact and random wind. Gentle breezes and occasional stronger gusts share one scene, take turns, and choose a direction for each gust.
- Both editions adapt to your screen and work offline. HD also lets you hold and drag to leave a trail of ripples.

## Install

Install a Windows wallpaper app, then download the matching wallpaper package.

| Wallpaper app | Classic 1.0.1 | HD 1.0.1 | How to use |
| --- | --- | --- | --- |
| [Wallpaper Engine](https://store.steampowered.com/app/431960/Wallpaper_Engine/) | [Steam Workshop](https://steamcommunity.com/sharedfiles/filedetails/?id=3815903983) | [Download ZIP](https://github.com/Kandecho/Water-live-wallpaper/releases/download/hd-v1.0.1/Water-HD-1.0.1.zip) | Subscribe for Classic; extract HD and create a web wallpaper from `index.html` |
| [Sucrose](https://github.com/Taiizor/Sucrose) | [Download ZIP](https://github.com/Kandecho/Water-live-wallpaper/releases/download/v1.0.1/Water-Original-Sucrose-1.0.1.zip) | [Download ZIP](https://github.com/Kandecho/Water-live-wallpaper/releases/download/hd-v1.0.1/Water-HD-1.0.1.zip) | Import the ZIP into the library and apply it |
| [Lively](https://github.com/lively-community/lively) | [Download ZIP](https://github.com/Kandecho/Water-live-wallpaper/releases/download/v1.0.1/Water-Original-Lively-1.0.1.zip) | [Download ZIP](https://github.com/Kandecho/Water-live-wallpaper/releases/download/hd-v1.0.1/Water-HD-1.0.1.zip) | Import the ZIP; native import testing is pending |

**Validation:** Classic has been used in Sucrose and Wallpaper Engine. HD has passed simulation, artwork and browser checks; native engine compatibility and sustained 4K performance have not been comprehensively verified.

HD uses one ZIP. Choose the wallpaper packages above; GitHub's automatic Source code archives contain the development repository.

## Preview and customize

- **Try the scene:** extract the ZIP and open `index.html` in a browser. No server is needed; this does not change your desktop background.
- **Compare effects:** HD's `preview.html` has pause, comparison controls and manual gust requests. The normal wallpaper has no settings panel.
- **Change parameters:** edit `settings.js` and reload. See the bundled `CONFIGURATION.zh-CN.md` or the [Chinese parameter reference](docs/configuration.zh-CN.md).
- **Clicks do nothing?** Check whether your wallpaper app forwards mouse input. Animation plays without interaction.
- **Reduce GPU use:** lower the wallpaper app's frame-rate setting. Classic caps at about 33 FPS and HD at 60 FPS; both respect lower Wallpaper Engine limits.

## Source and credits

Based on [AOSP Water / Fall](https://android.googlesource.com/platform/packages/wallpapers/Basic/+/74e84e6cbea39c5946d86d93460f753e03a90607/), under [Apache-2.0](LICENSE.txt). HD artwork is reconstructed from the originals. See [NOTICE](NOTICE.txt) for attribution and modifications. This is an independent desktop recreation, not an official Google or Samsung release.

[Development](docs/development.md) · [HD architecture](docs/hd-architecture.md) · [Report an issue](https://github.com/Kandecho/Water-live-wallpaper/issues)
