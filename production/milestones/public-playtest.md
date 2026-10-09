# Milestone: 公开试玩版（Public Playtest）

> **Status**: Proposed — 需负责人批准后生效。批准前不按本文件排冲刺。
> **提出**: 2026-10-08（依据 `production/retrospectives/retro-sprint-001-003-2026-10-08.md`）
> **范围评估**: `production/scope-checks/scope-check-public-playtest-2026-10-08.md`

## Overview

- **Target Date**: 2026-11-05（周四）
- **Type**: Beta（单机公开试玩；共享世界不在本次范围）
- **Duration**: 4 周（2026-10-09 → 2026-11-05）
- **Number of Sprints**: 3（Sprint 4、5、6）+ 最后 1 天里程碑评审

## Milestone Goal

把线上 Pages 版本发给一批不认识项目的真实玩家，让他们按「每天分段玩」的方式连续玩 3 天，不需要开发者帮忙就能一直有事做、有目标、不卡死。
里程碑结束时能回答两件事：正常经济（不发测试补给、不加速时钟）下前 3 天的节奏是否成立；手机真机上是否顺畅。

## Success Criteria

全部满足才算完成。

- [ ] **真人 3 天不卡**：至少 3 名非开发者玩家（至少 1 人只用手机）各玩满 3 个自然日，每人一份试玩报告存 `production/qa/playtests/`；没有人因为「不知道下一步做什么」「资源无法恢复」「界面点不动」而停玩，或者停玩原因已建缺陷单并修复。
- [ ] **粮食经济撑得住**：入库的长局脚本以 1 倍时钟、无测试补给、5 座城以上运行 72 小时（游戏内），5 个种子都满足：粮食不会持续为负到饿死部队；或者为负时有游戏内可见的提示和可行的补救（减兵、买粮、屯田等），且补救后 12 小时内恢复为正。
- [ ] **按正常经济也能通关第 2 章**：同一脚本下第 2 章在 3 天内可推进，守军倍数不再需要回调。
- [ ] **无 S1/S2**：`production/qa/bugs/` 中 0 个未关闭的 S1、0 个未关闭的 S2。
- [ ] **真机验证**：真实 iPhone（Safari，含一台 iOS 15 及以前或确认 PNG 备用图生效的设备）和一台安卓（Chrome）各走完一遍手机清单：开场战斗、建造、城外田地、大地图点选、出征、任务册、存档刷新后恢复；截图存 `production/qa/evidence/`。
- [ ] **旧存档可用**：v0.34.34 的存档在新版本打开不报错、不丢资源。
- [ ] **共享世界不误导**：Pages 版本不出现会让玩家以为能联机的入口，或入口明确写「未开放」。
- [ ] **更新说明就绪**：面向玩家的试玩说明（怎么玩、已知问题、怎么反馈）和更新说明写好，游戏内有反馈入口或链接。
- [ ] **质量流程**：Sprint 4–6 每个都有 QA 计划、smoke check 通过、team-qa 结论为 APPROVED 或 APPROVED WITH CONDITIONS。
- [ ] **构建稳定**：发布前连续 3 天没有紧急修复；`npm test` 全部通过。
- [ ] 性能：中端手机 4G 下首屏可操作 ≤ 8 秒（手工计时，**阈值待负责人确认**）。

## Feature List

### Must Ship (Milestone Fails Without These)

| Feature | Design Doc | Owner | Sprint Target | Status |
|---------|-----------|-------|--------------|--------|
| 多城与大军粮食经济修正 | 新建 `design/balance/food-economy-*.md` | economy-designer | 4 | Not Started |
| 长局模拟脚本入库（1 倍时钟、无测试补给） | 同上 | tools-programmer | 4 | Not Started |
| 官府 2 级后补给与造价联调（原 3-3） | `design/balance/opening-economy-2026-10-08.md` | economy-designer | 4 | Not Started |
| 建筑图纸的非元宝来源 | 4 天长局报告第 6 条 | game-designer | 4 | Not Started |
| 正常经济下前 3 天内容消耗速度评估与调整 | 4 天长局报告第 2 条 | economy-designer | 5 | Not Started |
| 缺陷单建档与 S1/S2 清零 | — | qa-lead | 4–6 | Not Started |
| 真机手机清单 | `design/quick-specs/mobile-controls-2026-10-05.md` | 负责人 + qa-tester | 6 | Not Started |
| 共享世界入口隐藏或标「未开放」 | `design/quick-specs/realm-online-v0.28.0.md` | ui-programmer | 5 | Not Started |
| 试玩说明、已知问题、反馈入口 | — | producer | 6 | Not Started |
| 3 名真人 3 天试玩 | — | 负责人（招募）+ qa-lead | 6 | Not Started |

### Should Ship (Planned but Cuttable)

| Feature | Design Doc | Owner | Sprint Target | Cut Impact | Status |
|---------|-----------|-------|--------------|-----------|--------|
| 术语简化（劳动人口、民怨、占领·需要校场等） | fox 报告第 2 条 | ux-designer | 5 | 新玩家理解成本高，但不卡进度 | Not Started |
| 任务册精简（隐藏或合并低价值路线 / 标签） | 见范围评估 | game-designer | 5 | 信息量仍大 | Not Started |
| systems-index 与 quick-spec 同步到当前版本 | `design/gdd/systems-index.md` | game-designer | 5 | 后续改动没有准确依据 | Not Started |
| 存档导出 / 导入（试玩者换设备或反馈问题用） | ADR-0003 | gameplay-programmer | 5 | 定位玩家问题更难 | Not Started |

### Stretch Goals (Only if Ahead of Schedule)

| Feature | Design Doc | Owner | Value Add |
|---------|-----------|-------|----------|
| 粮食修好后再评估守军倍数（第 2 章 ×1.5 以上） | `design/balance/late-battle-difficulty-2026-10-08.md` | economy-designer | 中后期更有压力 |
| 建筑等级外观（art bible 缺口第 1 项） | `design/art/art-bible.md` | art-director | 升级更有成就感 |
| 简单的匿名游玩数据（停玩点、卡住步骤） | — | gameplay-programmer | 试玩结论更可靠 |

## Quality Gates

| Gate | Threshold | Measurement Method |
|------|-----------|-------------------|
| 报错 | 真机清单全程控制台 0 个未捕获错误 | 真机远程调试或桌面模拟 + 截图 |
| 首屏 | ≤ 8 秒（中端手机 4G，待确认） | 手工计时 |
| Critical bugs | 0 open S1 | `production/qa/bugs/` |
| High-severity bugs | 0 open S2 | `production/qa/bugs/` |
| 自动测试 | `npm test` 全部通过 | 本地 + CI |
| 经济 | 72 小时长局 5 个种子满足上文粮食条件 | 入库的长局脚本 |
| 冲刺关账 | 每个冲刺有 QA 计划、smoke check、team-qa 结论 | `production/qa/` 下的文件 |

## Risk Register

| Risk | Probability | Impact | Mitigation | Owner | Status |
|------|------------|--------|-----------|-------|--------|
| 粮食修正改动大，牵动兵种耗粮、章节难度和补给 | 高 | 高 | 先模拟出 2–3 套方案由负责人选；只改耗粮/产粮参数，不新增系统 | economy-designer | Open |
| 招不到 3 名愿意连玩 3 天的真人 | 中 | 高 | Sprint 4 就开始招募；最低接受 2 人 + 1 份脚本长局 | 负责人 | Open |
| 负责人没有可用的旧 iOS 设备 | 中 | 中 | 改为借用或在第三方真机平台测一次；至少保证一台当前 iPhone | 负责人 | Open |
| 范围继续随反馈扩大 | 高 | 中 | 反馈先进待办；只有 S1/S2 可插队 | producer | Open |
| 叠 PR 导致线上问题难定位 | 中 | 中 | 一次合一个 PR，合并后确认 Pages 再合下一个 | producer | Open |
| 每次改引擎忘记重新生成在线规则 | 低 | 低（共享世界未开放） | smoke check 增加一项检查 | qa-lead | Open |

## Dependencies

### Internal Dependencies

| Feature | Depends On | Owner of Dependency | Status |
|---------|-----------|-------------------|--------|
| 内容消耗速度评估 | 粮食经济修正、长局脚本入库 | economy-designer | Not Started |
| 守军倍数再评估（Stretch） | 粮食经济修正 | economy-designer | Not Started |
| 真人 3 天试玩 | Sprint 4–5 Must Ship 全部完成、真机清单通过 | producer | Not Started |

### External Dependencies

| Dependency | Provider | Status | Risk if Delayed |
|-----------|---------|--------|----------------|
| 真实 iPhone / 安卓设备 | 负责人 | 未确认 | 真机条件无法关闭 |
| 试玩玩家 | 负责人招募 | 未开始 | 里程碑无法验收 |
| GitHub Pages 发布 | GitHub | 正常 | 低 |

## Sprint Breakdown（提议）

| Sprint | 日期 | 目标 | 主要工作 |
|---|---|---|---|
| 4 | 10-09 → 10-18 | 正常经济撑得住 | 长局脚本入库（1 倍、无测试补给）；粮食经济 2–3 套方案 → 负责人选 → 实施 → 再跑；原 3-3 补给与造价联调；建筑图纸来源；建缺陷单；QA 计划与签字 |
| 5 | 10-19 → 10-26 | 前 3 天有事做，债务清掉 | 正常经济下内容消耗评估与调整；术语简化；任务册精简与范围评估里的隐藏项；共享世界入口处理；systems-index / quick-spec 同步；存档导出（可选） |
| 6 | 10-27 → 11-04 | 能放出去 | 发布清单（`.claude/docs/templates/release-checklist-template.md`）；真机清单；试玩说明与反馈入口；版本冻结 3 天；3 名真人 3 天试玩并收报告；S1/S2 清零 |
| 评审 | 11-05 | 里程碑评审 | `/milestone-review public-playtest` |

## Review Schedule

| Date | Review Type | Attendees |
|------|-----------|-----------|
| 2026-10-18 | Sprint 4 收尾：粮食经济是否达标 | 负责人、producer、economy-designer |
| 2026-10-26 | 中期评审：Must Ship 完成度、是否需要砍 Should Ship | 负责人、producer |
| 2026-11-01 | 发布前评审：真机与冻结 | 负责人、producer、qa-lead |
| 2026-11-05 | 里程碑评审 | 负责人与全部代理 |
