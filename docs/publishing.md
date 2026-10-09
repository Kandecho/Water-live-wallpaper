# Publishing wallpaper packages

Run the relevant checks in [development.md](development.md), then build from the repository root with PowerShell 7:

```powershell
pwsh -NoProfile -File scripts/package-hd.ps1 -Version 1.0.1
```

The explicit package list contains only the runtime, one comparison preview, engine metadata, parameter reference, preview image, README, LICENSE and NOTICE. The script stamps the package Version and Sucrose Version. Descriptions and page titles do not contain release numbers.

Classic is independent. `scripts/package.ps1 -Version <version>` stamps its README and Sucrose metadata and creates separate Sucrose and Lively packages.

## Release contents

| Edition | Tag | Upload only |
| --- | --- | --- |
| HD | `hd-v<version>` | `dist/Water-HD-<version>.zip` |
| Classic | `v<version>` | `dist/Water-Original-Sucrose-<version>.zip` and `dist/Water-Original-Lively-<version>.zip` |

Do not upload the entire dist directory. Architecture diagrams, reports, checksums and experiments are not download attachments. GitHub adds its own source archives automatically.

1. Review the ZIP root entries and version fields; try the normal and comparison pages from the package.
2. Update the edition's README download links and add release notes under `docs/releases/`.
3. Commit the release and push its edition-specific tag. Create a GitHub Release from that tag.
4. Paste the matching release notes and upload only the file(s) listed above. Set HD's latest stable release as Latest; keep previews marked prerelease.
5. Confirm the public download and attachments. Internal hash checks may verify upload integrity without producing a public TXT file.

A package content change gets a new version. Do not silently replace an existing ZIP. Descriptions and unrelated download attachments can be corrected without moving a tag or replacing the original package.

## Documentation scope

The root READMEs introduce the wallpaper, show actual scenes, link downloads and explain installation. They use GitHub Markdown plus small HTML blocks for centered headings, linked badges and side-by-side images; no custom stylesheet or JavaScript is required. Keep local image paths relative to the repository.

Technical details belong in development and architecture documents. Historical discussions stay in the dated archive. LICENSE, NOTICE, upstream sources and the explicitly preserved experiment remain in the repository.
