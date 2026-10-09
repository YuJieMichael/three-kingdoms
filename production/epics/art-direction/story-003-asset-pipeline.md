# 素材处理脚本入库

**ID:** TR-art-direction-003
**Status:** Complete
**Last Updated:** 2026-10-08
**Type:** Config/Data
**Layer:** Foundation
**GDD:** design/art/art-bible.md
**ADR Governing Implementation:** ADR-0001
**Dependencies:** TR-art-direction-001、002

## Scope

把这次处理 32 张图用的「裁边 + 缩放 + AVIF/PNG 输出」工具放进仓库，以后拿到新图一条命令处理完。

## Acceptance Criteria

- [x] AC-1：`tools/` 下提供处理脚本和用法说明（输入文件夹 → assets/painted 对应目录）。
- [x] AC-2：同一张输入重复处理，输出尺寸一致。
- [x] AC-3：README 或 art-bible 中说明需要 macOS（Swift / ImageIO）。

## Completion Notes

2026-10-08：`tools/painted-art/process.sh`（building / map / texture）+ `prep.swift`，输出 AVIF 和 pngquant 压缩 PNG。用 1024 画布的官府、松树重复处理两次，尺寸一致（512×429、384×356）。macOS 要求写在 tools/painted-art/README.md 和 art-bible 第 5 节。
