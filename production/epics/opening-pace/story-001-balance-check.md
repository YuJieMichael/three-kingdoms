# 开局 30 分钟节奏分析（/balance-check）

**ID:** TR-opening-pace-001
**Status:** Ready
**Last Updated:** 2026-10-08
**Type:** Logic
**Layer:** Feature
**GDD:** design/game-brief.md（MVP：明确的新手目标）；design/quick-specs/starter-gold-tuning-2026-10-05.md
**ADR Governing Implementation:** ADR-0001（纯 JS 引擎，数值在 *-data.js）
**Dependencies:** 无
**Source:** production/qa/playtests/playtest-2026-10-08-fox.md 第 5 条

## Scope

只分析、不改数值。用真实引擎 API 按新手引导走前 30 分钟，记录每一步的等待时间与卡点，产出带数据的调参建议，交给项目负责人确认。

## Acceptance Criteria

- [ ] AC-1：脚本化跑通「开场战斗 → 领补给 → 第一块农田 → 弓兵路线 → 官府 2 级」，记录每一步的开始时间、完成时间和等待原因（工期 / 资源 / 人口）。
- [ ] AC-2：报告列出前 30 分钟内所有超过 60 秒的空等，以及当时玩家可做的其他事。
- [ ] AC-3：给出 2–3 套调参方案（例如首块资源田工期、早期产量、野地刷新、官府 2 级工期），每套写明改动的数值、预期效果和对后期的影响。
- [ ] AC-4：报告存为 `design/balance/opening-pace-2026-10-08.md`，不修改任何游戏数值。
- [ ] AC-5：现有测试全部通过。

## Verification

报告由负责人审阅并选定方案；选定后进入 TR-opening-pace-002。
