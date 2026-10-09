---
title: Water 壁纸：源码与分享渠道
subtitle: GitHub 保存项目 · Steam Workshop 面向大众 · 免费引擎保留导入包
lang: zh
cols: 2
---
## A 推荐组合
建一个独立 GitHub 仓库，建议命名为 water-live-wallpaper。
用 Releases 提供可直接导入的版本包。
面向更多壁纸用户时，优先发布到 Wallpaper Engine 的 Steam Workshop。
保留 Lively 和 Sucrose 包，方便使用免费引擎的人。

## B 各渠道适合什么
| 渠道 | 用途 | 用户如何获取 | 建议 |
|---|---|---|---|
| GitHub 仓库与 Releases | 源码、版本记录、下载 | 下载引擎对应的包 | 项目的长期主地址 |
| Wallpaper Engine / Steam Workshop | 展示、发现、订阅和更新 | 通过 Wallpaper Engine 订阅 | 面向大众的首选发布渠道 |
| Lively + GitHub 下载包 | 免费引擎用户 | 下载并导入兼容包 | 提供免费使用路径 |
| Sucrose Store | Sucrose 社区用户 | 从应用内商店获取 | 补充分发渠道 |

Steam Workshop 是 Wallpaper Engine 的内置分享路径。
Sucrose Store 接受 PR，贡献需经过维护者审阅。
Lively 支持交互网页，可在其社区展示作品并附下载链接。

## C 仓库保持简单
第一版只保存复刻版，增强版开始开发时再增加目录。
两个版本放在同一仓库，使用独立入口，不必长期维护两条分支。
README 放实际动图、下载入口、三种引擎的使用说明和测试状态。
保留 AOSP 来源、固定版本与现有 LICENSE / NOTICE。
源码随 Git 保存，安装 ZIP 作为 Release 附件。
当前有三种引擎的描述文件，但仍需分别完成桌面兼容实测。

## D 官方资料
- [GitHub Releases：发布版本与下载附件](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases)
- [Wallpaper Engine：Steam 商店与网页壁纸支持](https://store.steampowered.com/app/431960/Wallpaper_Engine/)
- [Wallpaper Engine：发布及更新壁纸](https://docs.wallpaperengine.io/scene/first/publishing)
- [Lively：免费开源与交互网页支持](https://github.com/rocksdanister/lively)
- [Sucrose Store：通过 PR 分享壁纸](https://github.com/Taiizor/Store)
