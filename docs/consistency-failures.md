# Consistency Failure Log

<!-- Auto-maintained by /consistency-check. Do not edit manually. -->
<!-- One entry per detected conflict, in chronological order. -->

| Date | GDD A | GDD B | Conflict Type | Status |
|------|-------|-------|---------------|--------|
| 2026-10-08 | onboarding-data.js | quick-specs/archer-onboarding-2026-10-05.md | 补给数值 | Resolved |
| 2026-10-08 | onboarding-data.js / growth-guide.js | quick-specs/onboarding-growth-challenges-2026-10-05.md | 工期 / 引导规则 | Resolved |
| 2026-10-08 | engine.js | quick-specs/occupation-return-2026-10-05.md | 占领规则 | Resolved |
| 2026-10-08 | yellow-city-data.js | quick-specs/yellow-cities-v0.26.0.md | 守军数值 | Resolved |
| 2026-10-08 | chapter-data.js / growth-guide.js | quick-specs/chapter-two、chapter-three | 守军倍数 / 推荐兵力 | Resolved |
| 2026-10-08 | heritage-system.js | quick-specs/city-defense-2026-10-05.md | 晋升规则 | Resolved |
| 2026-10-08 | engine.js | quick-specs/governor-construction-xp-2026-10-05.md | 免费完成 | Resolved |

### 2026-10-08 — /consistency-check — 🔴 CONFLICT
**Domain**: 新手礼包、成长引导、建造工期、出征占领、章节与黄巾城守军、官职晋升
**Documents involved**: 代码（onboarding-data.js、growth-guide.js、engine.js、chapter-data.js、yellow-city-data.js、heritage-system.js、reward-data.js、progression.js）vs 上表 7 份 quick-spec
**What happened**: v0.34.29–v0.34.34 的改动只写进 README 与平衡报告，quick-spec 仍写旧值：第 1 阶补给 40,000（现 8,000）、官府前两级保持（现 2 级 480 秒）、县城占领只返城（现默认留守，可选返回）、黄巾城守军 50/93/136（现 ×5）、无章节守军倍数、无珠宝折算、无免费完成、首战未限定据点。
**Resolution**: 2026-10-08 已更新各 quick-spec 正文并加「变更记录」；历史平衡报告顶部加取代注；关键值登记到 design/registry/entities.yaml。详见 design/gdd/gdd-cross-review-2026-10-08.md。
**Pattern**: 平衡报告落地后只改代码和 README，没有回写 quick-spec 和登记表。平衡任务的完成条件应包含「更新 source 设计文档 + entities.yaml」。
