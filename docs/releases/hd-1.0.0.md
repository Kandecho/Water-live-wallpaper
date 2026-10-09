HD 1.0.0 是首个 HD 正式版，本次通过 GitHub Release 发布。一个安装包内包含同一场景中的随机轻风与强风。

## 下载

- **`Water-HD-1.0.0.zip`**：壁纸安装包，适用于 Sucrose、Lively 和 Wallpaper Engine 的网页壁纸入口。
- **`Water-HD-SHA256SUMS.txt`**：安装包和架构图的 SHA-256 校验值。
- **`Water-HD-Architecture.html`**：中文 HTML 架构图，下载后用浏览器打开。

请下载壁纸 ZIP；GitHub 自动提供的 Source code 压缩包是项目源码，不是导入用的安装包。

## 画面与随机风

- 4K 水面背景、512 像素叶片图块，保留原始 AOSP 叶形与配色。
- 随位置变化的树荫、柔和光照、浮动姿态和局部叶缘贴水细纹。
- 轻风持续 13 秒，结束后随机等待 25–45 秒；强风持续 10 秒，结束后随机等待 150–240 秒。启动时也使用这些等待范围。
- 两种风不会重叠。另一种到点时延后，每阵之后保留随机 2–5 秒平静；等待时间不是固定起风周期。
- 每阵随机抽取 360° 方向并整阵保持一致。水面先响应，浮叶逐渐跟随；空中叶子随风旋转，接近水面时减弱。
- 点击泛起涟漪，按住拖动留下水纹。最高 60 FPS，并响应 Wallpaper Engine 的暂停与更低帧率设置。
- 安装后完全离线运行，不需要 Node.js、Python、服务器或网络。

普通壁纸没有内置配置面板或风模式选择。编辑 `settings.js` 后重新加载即可调整参数；中文说明 `CONFIGURATION.zh-CN.md` 随包提供。

## 安装与预览

- **Sucrose / Lively**：将壁纸 ZIP 导入壁纸库。
- **Wallpaper Engine**：解压，选择 `index.html` 创建新的网页壁纸项目，保留同目录文件。
- **浏览器试用**：解压后打开 `index.html`。打开 `preview.html` 可使用对照控件和轻风／强风请求按钮。手动请求也遵守排队与平静间隔，重复点击不会重启或叠加。

已通过模拟、素材与离线贴图检查，以及 4K、竖屏、超宽屏浏览器渲染、引擎暂停和帧率检查。原生 HD 壁纸软件兼容性与持续 4K 性能尚未全面验证，Lively 导入仍待实际验证。

经典版 1.0.1 及 Steam 创意工坊项目保持独立。局部叶片弯曲废案保存在源码归档中，不包含在正式版运行文件里。

[中文安装说明](https://github.com/Kandecho/Water-live-wallpaper/blob/hd-v1.0.0/README.zh-CN.md) · [参数配置说明](https://github.com/Kandecho/Water-live-wallpaper/blob/hd-v1.0.0/docs/configuration.zh-CN.md)

---

## English

The first stable HD release, distributed through GitHub Releases. **One `Water-HD-1.0.0.zip` package includes both gentle and strong gusts in the same scene.** No wind-mode selection is needed.

Gentle gusts last 13 seconds, then wait a random 25–45 seconds; strong gusts last 10 seconds, then wait 150–240 seconds. These wait ranges also apply at startup. Gusts never overlap: an overdue gust waits for the active one and its 2–5 second quiet gap. Each gust chooses a random direction and keeps it throughout its duration.

The wallpaper includes a reconstructed 4K pond, 512px leaf cells, positional shade, floating poses and local water contact. Click or drag for ripples. Wind affects water, delayed floating-leaf drift and airborne rotation. The rejected local bending experiment remains archived outside the runtime.

Import the wallpaper ZIP into Sucrose or Lively, or extract it and create a new Wallpaper Engine web wallpaper from `index.html`. Open that file in a browser for a standalone preview. `preview.html` provides comparison controls and manual gust requests using the same queue as automatic wind.

There is no built-in configuration panel. Edit `settings.js` and reload; a Chinese parameter reference is bundled. Installation requires no runtime tools or network connection. The optional HTML architecture diagram is a separate download.

Simulation, artwork/map consistency and browser checks passed, including 4K, portrait, ultrawide, engine pause and FPS limits. Native HD engine compatibility and sustained 4K performance have not been comprehensively verified; Lively import remains unverified.

Classic 1.0.1 and its Steam Workshop project remain independent.

[Installation guide](https://github.com/Kandecho/Water-live-wallpaper/blob/hd-v1.0.0/README.md) · [Report an issue](https://github.com/Kandecho/Water-live-wallpaper/issues)

Based on AOSP Water / Fall; licensed under Apache-2.0. Attribution is included in `NOTICE.txt`.
