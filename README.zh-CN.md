# Water (Autumn Leaves)

[English](README.md) · **简体中文**

把 2009—2010 年前后 Android 上的 **Water（水面秋叶）** 动态壁纸带回 Windows 桌面。秋叶缓缓漂过树影与天空的倒映，水面泛起轻柔的涟漪。

**[在 Steam 创意工坊订阅经典版](https://steamcommunity.com/sharedfiles/filedetails/?id=3815903983)** · **[下载经典版](https://github.com/Kandecho/Water-live-wallpaper/releases/tag/v1.0.1)** · **[体验 HD 预览版](https://github.com/Kandecho/Water-live-wallpaper/releases/tag/hd-v0.1.0-preview.1)**

![经典版：秋叶漂浮在映着树影的水面上](docs/preview.jpg)

## 选择版本

| 项目 | 经典版 Classic | 高清预览版 HD Preview |
| --- | --- | --- |
| 画面 | 原版素材，保留早期 Android 的熟悉观感 | 高清素材、柔和光影，以及更细致的叶缘水面效果 |
| 当前版本 | **1.0.1 · 稳定版** | **Preview 1 · 尝鲜版** |
| 适合谁 | 想重温原版动态壁纸 | 想在大屏幕上体验更新的画面 |
| Steam 创意工坊 | 订阅后使用 | 从下方下载，手动导入 |

两个版本安装后均可离线运行，并适应屏幕比例，不拉伸画面。可以点击水面泛起涟漪，也可以让它安静地陪伴桌面。

### HD 预览版

![HD 预览版：更清晰的秋叶与水面，以及随位置变化的树荫](docs/hd-preview.jpg)

HD 保留原版叶形与色调，加入 4K 水面背景、高清叶子、轻微的漂浮起伏，以及部分叶缘附近的细小水纹。它仍在完善中；想直接日常使用，可以先选经典版。

## 下载与安装

在 Windows 桌面使用时，需要先安装一种壁纸软件：[Wallpaper Engine](https://store.steampowered.com/app/431960/Wallpaper_Engine/)、[Sucrose](https://github.com/Taiizor/Sucrose) 或 [Lively Wallpaper](https://github.com/lively-community/lively)。无需编程或自行打包。

### Wallpaper Engine

**经典版：** 打开 [Steam 创意工坊页面](https://steamcommunity.com/sharedfiles/filedetails/?id=3815903983)，点击 **订阅**，然后在 Wallpaper Engine 中选择这张壁纸。

**HD 预览版：** 下载 [HD ZIP 压缩包](https://github.com/Kandecho/Water-live-wallpaper/releases/download/hd-v0.1.0-preview.1/Water-HD-0.1.0-preview.1.zip) 并解压。在 Wallpaper Engine 编辑器中选择解压出的 `index.html`，创建网页壁纸。同目录中的其他文件也要保留。建议新建一个项目，方便同时保留两个版本。

### Sucrose 或 Lively

下载对应软件的安装包，把 ZIP 导入壁纸库，再选择应用即可。

| 软件 | 经典版 1.0.1 | HD Preview 1 |
| --- | --- | --- |
| Sucrose | [下载 ZIP](https://github.com/Kandecho/Water-live-wallpaper/releases/download/v1.0.1/Water-Original-Sucrose-1.0.1.zip) | [下载 ZIP](https://github.com/Kandecho/Water-live-wallpaper/releases/download/hd-v0.1.0-preview.1/Water-HD-0.1.0-preview.1.zip) |
| Lively | [下载 ZIP](https://github.com/Kandecho/Water-live-wallpaper/releases/download/v1.0.1/Water-Original-Lively-1.0.1.zip) | [下载 ZIP](https://github.com/Kandecho/Water-live-wallpaper/releases/download/hd-v0.1.0-preview.1/Water-HD-0.1.0-preview.1.zip) |

请下载上面链接的壁纸包。GitHub 的 **Source code (zip)** 是源码包，不是直接导入用的壁纸包。HD 的 ZIP 可供三种软件使用。

经典版已有 Sucrose 和 Wallpaper Engine 的使用记录，Lively 导入尚未验证。HD 预览版已通过浏览器检查，欢迎反馈在三种桌面软件中的实际体验。

## 使用方式

| 操作 | 经典版 | HD 预览版 |
| --- | --- | --- |
| 点击水面 | 泛起涟漪 | 泛起涟漪 |
| 按住并拖动水面 | — | 留下一串水纹 |

鼠标能否控制壁纸，取决于壁纸软件的输入设置与焦点。无需操作，画面也会自行播放。

## 常见问题与反馈

**不安装壁纸软件，能先看看效果吗？**

可以。解压下载的壁纸 ZIP，用现代浏览器打开 `index.html` 即可预览。这只会打开网页，不会直接更换桌面背景。

**点击没有反应？**

检查壁纸软件是否允许向网页壁纸传递鼠标输入。也可以先在浏览器中打开 `index.html` 试用操作。

**动画偏慢，或者显卡占用偏高？**

先检查壁纸软件的帧率与暂停设置。经典版最高约 33 FPS，HD 最高 60 FPS；两者都会遵循 Wallpaper Engine 中更低的帧率限制。HD 占用偏高时，可以适当降低帧率。

**发现问题？**

欢迎 [提交 Issue](https://github.com/Kandecho/Water-live-wallpaper/issues)，注明壁纸版本、壁纸软件及其版本、屏幕分辨率，并尽量附上截图或短录像。

## 致谢与源码

本项目基于 Android 开源项目中的 [Water / Fall 动态壁纸](https://android.googlesource.com/platform/packages/wallpapers/Basic/+/74e84e6cbea39c5946d86d93460f753e03a90607/)，HD 素材由原始图片高清化而来。这是独立的桌面复刻项目，并非三星或 Google 官方发布。

采用 [Apache-2.0 许可证](LICENSE.txt)。素材署名见 [NOTICE.txt](NOTICE.txt)。

如果你对源码感兴趣，可以阅读 [开发说明](docs/development.md) 和 [HD 架构文档](docs/hd-architecture.md)（英文）。
