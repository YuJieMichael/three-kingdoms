# 素材处理脚本入库

**ID:** TR-art-direction-003
**Status:** Not Started
**Last Updated:** 2026-10-08
**Type:** Config/Data
**Layer:** Foundation
**GDD:** design/art/art-bible.md
**ADR Governing Implementation:** ADR-0001
**Dependencies:** TR-art-direction-001、002

## Scope

把这次处理 32 张图用的「裁边 + 缩放 + AVIF/PNG 输出」工具放进仓库，以后拿到新图一条命令处理完。

## Acceptance Criteria

- [ ] AC-1：`tools/` 下提供处理脚本和用法说明（输入文件夹 → assets/painted 对应目录）。
- [ ] AC-2：同一张输入重复处理，输出尺寸一致。
- [ ] AC-3：README 或 art-bible 中说明需要 macOS（Swift / ImageIO）。
