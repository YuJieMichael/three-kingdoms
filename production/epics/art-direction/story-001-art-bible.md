# 美术规范（/art-bible）

**ID:** TR-art-direction-001
**Status:** Complete
**Last Updated:** 2026-10-08
**Type:** Config/Data
**Layer:** Presentation
**GDD:** design/art/building-prompts-style1.md
**ADR Governing Implementation:** ADR-0001
**Dependencies:** 无

## Scope

把 v0.34.26 起使用的「精致国风手绘」整理成美术规范，作为以后所有新素材（建筑等级外观、将领、道具、地形）的依据。

## Acceptance Criteria

- [x] AC-1：`design/art/art-bible.md` 写明风格定位、参考、配色（含主色值）、光照方向、视角（2:1 等距）、比例（官府 2×2、其他 1×1、地图物件不超出一格）。
- [x] AC-2：写明交付规格：透明 PNG 1024×1024 → 裁边 → AVIF（建筑 512px / 地图物件 384px / 纹理 512px 不裁），以及命名和目录规则。
- [x] AC-3：写明提示词结构（通用风格 + 主体 + 等级后缀），并链接到提示词文件。
- [x] AC-4：列出现有 32 张素材的清单和用途。
- [x] AC-5：列出已知缺口（建筑等级外观、将领立绘、道具图标）和优先级。

## Completion Notes

2026-10-08：v0.34.31 完成，见 `design/art/art-bible.md`。
