# 按选定方案调整开局节奏

**ID:** TR-opening-pace-002
**Status:** Complete
**Last Updated:** 2026-10-08
**Type:** Logic
**Layer:** Feature
**GDD:** design/balance/opening-pace-2026-10-08.md（由 TR-opening-pace-001 产出）
**ADR Governing Implementation:** ADR-0001；ADR-0002（在线规则需重新生成）
**Dependencies:** TR-opening-pace-001 完成，且负责人已选定方案

## Scope

只实施负责人选定的那一套调参；不新增系统。

## Acceptance Criteria

- [x] AC-1：选定方案中的数值全部落到对应的 *-data.js / engine.js 常量，修改点在报告中逐项列出。
- [x] AC-2：重新跑 TR-opening-pace-001 的开局脚本，前 30 分钟超过 60 秒的空等次数比调整前减少，结果写回报告。
- [x] AC-3：受影响的数值测试按新规则更新，并说明每处更新的依据；`npm test` 全部通过。
- [x] AC-4：修改了 engine.js 及之前的脚本时，重新生成 `supabase/functions/_shared/game-runtime.mjs`。
- [x] AC-5：README 写更新说明，三处版本号一致。

## Completion Notes

2026-10-08：负责人选定方案 1（官府 2 级 8 分钟 + 建造剩余 5 分钟内免费完成），v0.34.29 实施；结果见 `design/balance/opening-pace-2026-10-08.md`「实施结果」。
