# 开局经济与引导节奏

**ID:** TR-opening-pace-003
**Status:** Complete
**Last Updated:** 2026-10-08
**Type:** Logic
**Layer:** Feature
**GDD:** design/balance/opening-economy-2026-10-08.md
**ADR Governing Implementation:** ADR-0001；ADR-0002（在线规则需重新生成）
**Dependencies:** TR-opening-pace-002
**Source:** 2026-10-08 试玩反馈第 2–4 条；负责人选定方案 A / A / A

## Scope

只调新手补给数值和成长引导步骤；不新增系统。

## Acceptance Criteria

- [x] AC-1：资源田劳动人口不足且持有典民令时，引导先提示使用典民令，并写明当前效率；用完后不卡住。
- [x] AC-2：第 1 阶补给每种资源不超过仓库上限的 1.5 倍；首战路线在模拟中仍能完成，用补给加速时首战不超过 10 分钟。
- [x] AC-3：官府 2 级后插入一次「30 义兵掠夺 1 级野地」，模拟胜率 ≥ 95%；义兵胜利不算首战。
- [x] AC-4：受影响的测试按新规则更新并说明依据；新增 `tests/opening-economy.test.cjs`；`npm test` 全部通过。
- [x] AC-5：重新生成在线规则；README 写更新说明，三处版本号一致。

## Completion Notes

2026-10-08：v0.34.33 完成，数据见 `design/balance/opening-economy-2026-10-08.md`。顺带修复「攻坚克敌」按刷新后的野地等级误判完成。
