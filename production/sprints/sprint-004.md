# Sprint 4 — 2026-10-09 to 2026-10-18

## Milestone
公开试玩版（production/milestones/public-playtest.md，已批准）

## Sprint Goal
无测试补给也能稳定经营多城；试玩版只露出单机必需的功能。

## Tasks
| ID | Task | Status | Acceptance Criteria |
|----|------|--------|-------------------|
| 5-1 | 新城运粮引导（粮食方案 A，v0.34.35） | Done | 断粮城池出现运粮线引导；长局脚本无运粮线逃兵、有运粮线 0 |
| 5-2 | 长局模拟入库（v0.34.35） | Done | tests/balance/long-run-soak.cjs + 回归测试 |
| 5-3 | 图纸玩法掉落（v0.34.36） | Done | 野地 / 城池 / 守城战胜利按概率掉落；测试覆盖 |
| 5-4 | 试玩范围隐藏（v0.34.36） | Done | 联网与测试补给入口隐藏（?dev 可见）；任务册标签与成长路线随进度开放；自动助手官府 3 级；商城只显示可用道具 |
| 5-5 | 原 3-3：官府 2 级后补给与造价联调 | Not Started | 第 2 阶补给后不长期超仓，首战 ≤ 10 分钟 |
| 5-6 | 长局脚本扩展：1 倍时钟、无测试补给、5 城以上、72 小时 | Not Started | 5 个种子粮食不持续为负；图纸日均掉落复核 |
| 5-7 | 真机清单（QA 签字条件 7 项） | Not Started | 负责人在 iPhone / 安卓上完成并存截图 |

## Definition of Done
- QA 计划、smoke check、team-qa 结论（APPROVED / WITH CONDITIONS）
- 设计文档同步；PR 逐个合并
