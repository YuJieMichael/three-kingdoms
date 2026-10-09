# Sprint 1 — 2026-10-09 to 2026-10-22

## Sprint Goal
让新玩家前 30 分钟少空等，并把手绘美术定成规范、在旧设备上也能显示。

## Capacity
- Total days: 10
- Buffer (20%): 2 days reserved for unplanned work（试玩反馈、线上问题）
- Available: 8 days

## Tasks

### Must Have (Critical Path)
| ID | Task | Agent/Owner | Est. Days | Dependencies | Acceptance Criteria |
|----|------|-------------|-----------|-------------|-------------------|
| 1-1 | 开局 30 分钟节奏分析（[story](../epics/opening-pace/story-001-balance-check.md)） | economy-designer | 1 | — | 报告含每步等待、空等清单、2–3 套方案，不改数值 |
| 2-1 | 美术规范（[story](../epics/art-direction/story-001-art-bible.md)） | art-director | 1 | — | art-bible 覆盖风格、规格、提示词、素材清单、缺口 |
| 2-2 | 旧设备 PNG 备用图（[story](../epics/art-direction/story-002-png-fallback.md)） | ui-programmer | 1.5 | — | 不支持 AVIF 时无缺图；支持时不多下载 |

### Should Have
| ID | Task | Agent/Owner | Est. Days | Dependencies | Acceptance Criteria |
|----|------|-------------|-----------|-------------|-------------------|
| 1-2 | 按选定方案调整开局节奏（[story](../epics/opening-pace/story-002-opening-tuning.md)） | gameplay-programmer | 2 | 1-1 + 负责人选定方案 | 空等次数减少，测试按新规则更新 |

### Nice to Have
| ID | Task | Agent/Owner | Est. Days | Dependencies | Acceptance Criteria |
|----|------|-------------|-----------|-------------|-------------------|
| 2-3 | 素材处理脚本入库（[story](../epics/art-direction/story-003-asset-pipeline.md)） | tools-programmer | 0.5 | 2-1, 2-2 | 一条命令处理新素材 |

## Carryover from Previous Sprint
| Task | Reason | New Estimate |
|------|--------|-------------|
| — | 第一个冲刺 | — |

## Risks
| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| 调快开局影响中后期平衡 | 中 | 中 | 1-1 先出方案、写明对后期的影响，负责人选定后才动数值 |
| PNG 备用图体积过大 | 低 | 低 | 压缩并限制在 6MB；只在不支持 AVIF 时下载 |

## Dependencies on External Factors
- 1-2 需要负责人在 1-1 报告后选定方案。

## Definition of Done for this Sprint
- [ ] All Must Have tasks completed
- [ ] All tasks pass acceptance criteria
- [ ] QA plan exists (`production/qa/qa-plan-sprint-001-2026-10-09.md`, from `/qa-plan sprint`)
- [ ] All Logic/Integration stories have passing unit/integration tests
- [ ] Smoke check passed (`/smoke-check sprint`)
- [ ] QA sign-off report: APPROVED or APPROVED WITH CONDITIONS (`/team-qa sprint`)
- [ ] No S1 or S2 bugs in delivered features
- [ ] Design documents updated for any deviations
- [ ] Code reviewed and merged
