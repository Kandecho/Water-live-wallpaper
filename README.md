# Water (Autumn Leaves)

**English** · [简体中文](README.zh-CN.md)

Bring the classic Android **Water (Autumn Leaves)** live wallpaper from the 2009–2010 era to your Windows desktop. Autumn leaves drift across reflected trees and sky, with gentle ripples on the water.

**[Get the classic on Steam Workshop](https://steamcommunity.com/sharedfiles/filedetails/?id=3815903983)** · **[Download Classic](https://github.com/Kandecho/Water-live-wallpaper/releases/tag/v1.0.1)** · **[Download HD 1.0.0](https://github.com/Kandecho/Water-live-wallpaper/releases/tag/hd-v1.0.0)**

![Classic edition: autumn leaves floating across a reflective pond](docs/preview.jpg)

## Choose your edition

| Item | Classic | HD |
| --- | --- | --- |
| Look | Original artwork and the familiar early Android feel | Higher-resolution artwork with softer lighting and more detailed water contact |
| Current release | **1.0.1 — stable** | **1.0.0 — stable** |
| Best for | Revisiting the original wallpaper | Trying the updated look on a larger display |
| Steam Workshop | Subscribe and apply | Install manually from the download below |

Both editions run offline after installation and adapt to your screen without stretching the artwork. Click the water to make a ripple, or simply leave it running in the background.

### HD

![HD: higher-resolution leaves and pond with positional shade](docs/hd-preview.jpg)

HD retains the original leaf shapes and colors, with a 4K pond background, sharper leaves, subtle floating motion and small ripples around parts of their edges. HD 1.0.0 is the first stable HD release, available on GitHub. One package includes both gentle and strong gusts in the same scene. Each gust chooses a random direction; gusts wait for one another instead of overlapping.

## Download and install

You need a wallpaper app to run this on your Windows desktop: [Wallpaper Engine](https://store.steampowered.com/app/431960/Wallpaper_Engine/), [Sucrose](https://github.com/Taiizor/Sucrose), or [Lively Wallpaper](https://github.com/lively-community/lively). No coding or build tools are needed.

### Wallpaper Engine

**Classic:** open the [Steam Workshop page](https://steamcommunity.com/sharedfiles/filedetails/?id=3815903983), choose **Subscribe**, then select the wallpaper in Wallpaper Engine.

**HD:** download the [HD ZIP](https://github.com/Kandecho/Water-live-wallpaper/releases/download/hd-v1.0.0/Water-HD-1.0.0.zip) and extract it. In Wallpaper Engine's editor, create a new web wallpaper by selecting the extracted `index.html`. Keep the other extracted files alongside it. Create a separate project so you can keep both editions.

### Sucrose or Lively

Download the package for your app, then import the ZIP into its wallpaper library and apply it.

| App | Classic 1.0.1 | HD 1.0.0 |
| --- | --- | --- |
| Sucrose | [Download ZIP](https://github.com/Kandecho/Water-live-wallpaper/releases/download/v1.0.1/Water-Original-Sucrose-1.0.1.zip) | [Download ZIP](https://github.com/Kandecho/Water-live-wallpaper/releases/download/hd-v1.0.0/Water-HD-1.0.0.zip) |
| Lively | [Download ZIP](https://github.com/Kandecho/Water-live-wallpaper/releases/download/v1.0.1/Water-Original-Lively-1.0.1.zip) | [Download ZIP](https://github.com/Kandecho/Water-live-wallpaper/releases/download/hd-v1.0.0/Water-HD-1.0.0.zip) |

Use these wallpaper packages rather than GitHub's **Source code (zip)** download. The HD ZIP is shared across all three apps.

Classic has been used with Sucrose and Wallpaper Engine. Lively installation is not yet verified. HD has passed simulation, asset and browser checks, including 4K, portrait and ultrawide rendering. Native HD engine compatibility and sustained 4K performance have not been comprehensively verified.

## Controls

| Action | Classic | HD |
| --- | --- | --- |
| Click the water | Make a ripple | Make a ripple |
| Hold and drag on the water | — | Leave a trail of ripples |

Mouse controls depend on your wallpaper app's input settings and focus. No interaction is needed for the animation to play.

HD gentle gusts last 13 seconds, then wait a random 25–45 seconds. Strong gusts last 10 seconds, then wait 150–240 seconds. These waits also apply at startup. If another gust is active, the due gust waits; every gust leaves a 2–5 second quiet gap. The wind direction stays fixed throughout each gust.

There is no built-in configuration panel or wind-mode selector. Edit `settings.js` and reload to customize parameters; see the bundled `CONFIGURATION.zh-CN.md` or [parameter reference](docs/configuration.zh-CN.md). Open `preview.html` for comparison controls and manual gust requests.

## Questions and feedback

**Can I try it without a wallpaper app?**

Yes. Extract a downloaded wallpaper ZIP and open `index.html` in a modern browser. This opens a browser preview; it does not set your desktop background.

**Why does clicking do nothing?**

Check whether your wallpaper app forwards mouse input to web wallpapers. You can also open `index.html` in a browser to try the controls.

**The animation looks slow or uses too much GPU.**

Check your wallpaper app's frame-rate and pause settings. Classic is capped at about 33 FPS; HD targets up to 60 FPS. Both respect lower Wallpaper Engine limits. Try a lower frame-rate limit for HD if needed.

**Found a problem?**

[Open an issue](https://github.com/Kandecho/Water-live-wallpaper/issues). Include your edition, wallpaper app and version, screen resolution, and a screenshot or short recording if possible.

## Credits and source

Based on the Android Open Source Project's [Water / Fall live wallpaper](https://android.googlesource.com/platform/packages/wallpapers/Basic/+/74e84e6cbea39c5946d86d93460f753e03a90607/). HD artwork is reconstructed from those original images. This is an independent desktop recreation, not an official Samsung or Google release.

Licensed under [Apache-2.0](LICENSE.txt). See [NOTICE.txt](NOTICE.txt) for attribution.

Interested in the code? See the [development notes](docs/development.md) and [HD architecture](docs/hd-architecture.md). You can also [download the HTML architecture diagram](https://github.com/Kandecho/Water-live-wallpaper/releases/download/hd-v1.0.0/Water-HD-Architecture.html).
