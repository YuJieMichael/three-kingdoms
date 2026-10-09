# Sprint 2 — 2026-10-08 to 2026-10-21

## Sprint Goal
让开局的每一步都有可见回报：看得清、升级会涨产量、资源要盘算、引导有起伏。

## Source
2026-10-08 试玩反馈 4 条（建造弹窗看不清、升级不涨产量、补给过多、引导单调），负责人选定方案 A / A / A。

## Tasks

### Must Have
| ID | Task | Owner | Status | Acceptance Criteria |
|----|------|-------|--------|-------------------|
| 3-1 | 建造弹窗文字对比度（v0.34.32） | ui-programmer | Done | 浅底上的标题与产量改为深色字 |
| 3-2 | 开局经济与引导节奏（[story](../epics/opening-pace/story-003-opening-economy.md)，v0.34.33） | gameplay-programmer | Done | 见 story AC-1 至 AC-5 |

### Should Have
| ID | Task | Owner | Status | Acceptance Criteria |
|----|------|-------|--------|-------------------|
| 3-3 | 官府 2 级后的补给与造价联调 | economy-designer | Not Started | 第 2 阶补给后不长期超仓，首战仍 ≤ 10 分钟 |

## Carryover from Previous Sprint
| Task | Reason |
|------|--------|
| — | Sprint 1 五项全部完成 |

## Risks
| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| 削减补给拖慢中后期 | 中 | 中 | 十阶补给 12 个种子模拟，保持 24–48 小时 |
