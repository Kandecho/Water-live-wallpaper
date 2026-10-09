<h1 align="center">Water</h1>
<p align="center"><strong>把记忆里的那片池塘，带回桌面。</strong></p>
<p align="center">Android 经典动态壁纸复刻 · 秋叶与水纹 · 离线运行</p>

<table>
  <tr><th width="50%">经典版 · 原始素材</th><th width="50%">高清版 · 更细致的光影</th></tr>
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
  <a href="https://github.com/Kandecho/Water-live-wallpaper/releases/download/hd-v1.0.1/Water-HD-1.0.1.zip"><strong>下载 HD</strong></a> ·
  <a href="https://steamcommunity.com/sharedfiles/filedetails/?id=3815903983"><strong>Steam 订阅经典版</strong></a> ·
  <a href="https://github.com/Kandecho/Water-live-wallpaper/releases/tag/v1.0.1">经典版 ZIP</a>
</p>

**简体中文** · [English](README.md)

## 水面、秋叶，以及你的触碰

树影倒映在水中，秋叶缓缓飘落。点击水面，涟漪便从指针下散开。也可以什么都不做，让它安静地陪伴桌面。

- **经典版**保留 AOSP 原始素材，重现早期 Android 的熟悉观感。
- **HD 版**加入高清素材、柔和光影、叶缘水纹和随机风。轻风与偶尔出现的强风共处一个场景，每阵随机方向，互相等待而不叠加。
- 两版均适应屏幕比例并离线运行。HD 还支持按住拖动水面。

## 安装

先安装一种 Windows 壁纸软件，再下载对应的壁纸包。

| 壁纸软件 | 经典版 1.0.1 | HD 1.0.1 | 使用方法 |
| --- | --- | --- | --- |
| [Wallpaper Engine](https://store.steampowered.com/app/431960/Wallpaper_Engine/) | [Steam 订阅](https://steamcommunity.com/sharedfiles/filedetails/?id=3815903983) | [下载 ZIP](https://github.com/Kandecho/Water-live-wallpaper/releases/download/hd-v1.0.1/Water-HD-1.0.1.zip) | 经典版订阅后应用；HD 解压后用 `index.html` 创建网页壁纸 |
| [Sucrose](https://github.com/Taiizor/Sucrose) | [下载 ZIP](https://github.com/Kandecho/Water-live-wallpaper/releases/download/v1.0.1/Water-Original-Sucrose-1.0.1.zip) | [下载 ZIP](https://github.com/Kandecho/Water-live-wallpaper/releases/download/hd-v1.0.1/Water-HD-1.0.1.zip) | 将 ZIP 导入壁纸库并应用 |
| [Lively](https://github.com/lively-community/lively) | [下载 ZIP](https://github.com/Kandecho/Water-live-wallpaper/releases/download/v1.0.1/Water-Original-Lively-1.0.1.zip) | [下载 ZIP](https://github.com/Kandecho/Water-live-wallpaper/releases/download/hd-v1.0.1/Water-HD-1.0.1.zip) | 将 ZIP 导入壁纸库；实机导入待验证 |

**验证状态：** 经典版已有 Sucrose 和 Wallpaper Engine 使用记录。HD 已通过模拟、素材和浏览器检查；原生引擎兼容性及持续 4K 性能尚未全面验证。

HD 只需一个 ZIP。请下载上面的壁纸包；GitHub 自动提供的 Source code 是源码包。

## 预览与调整

- **先看看画面：** 解压后用浏览器打开 `index.html`，无需服务器。这不会直接更换桌面背景。
- **对照效果：** HD 的 `preview.html` 提供暂停、效果对照和手动起风按钮。正常壁纸没有配置面板。
- **调整参数：** 编辑 `settings.js` 后重新加载，见包内 `CONFIGURATION.zh-CN.md` 或[参数说明](docs/configuration.zh-CN.md)。
- **点击没有反应：** 检查壁纸软件是否向网页传递鼠标输入。无需操作，动画也会播放。
- **降低占用：** 在壁纸软件中降低帧率。经典版上限约 33 FPS，HD 上限 60 FPS；两版尊重 Wallpaper Engine 的更低帧率设置。

## 源码与致谢

基于 [AOSP Water / Fall](https://android.googlesource.com/platform/packages/wallpapers/Basic/+/74e84e6cbea39c5946d86d93460f753e03a90607/)，采用 [Apache-2.0](LICENSE.txt)。HD 素材由原始图片高清化而来，署名与修改记录见 [NOTICE](NOTICE.txt)。这是独立桌面复刻项目，并非 Google 或三星官方发布。

[开发说明](docs/development.md) · [HD 架构](docs/hd-architecture.md) · [反馈问题](https://github.com/Kandecho/Water-live-wallpaper/issues)
