# Systems Index: 三国城志 / 山河策

> **Status**: Draft — reverse-documented from the shipped game (v0.34.17)
> **Created**: 2026-10-08
> **Last Updated**: 2026-10-08
> **Source Concept**: design/game-brief.md (this project has a brief, not a concept doc)

---

## Overview

单机 PVE 策略为主、共享世界为辅的网页游戏。核心循环：经营城池与资源田 → 侦察、选将配兵 → 出征／守城战斗 → 缴获、占领、运回补给 → 培养将领、经营新城。

本表按已实现的系统整理，设计内容仍主要在 `design/quick-specs/` 里，只有名将与计谋有正式 GDD。第 6 列链接到各系统现有的设计文档，`—` 表示没有独立设计文档（规则见 `RULES.md` 与代码）。

---

## Systems Enumeration

| # | System | Category | Priority | Status | Design Doc | Main Code |
|---|--------|----------|----------|--------|------------|-----------|
| 1 | 游戏规则与结算引擎 | Core | MVP | Implemented | `RULES.md` | `engine.js` |
| 2 | 城池建设、建筑与工期 | Core | MVP | Implemented | `design/quick-specs/governor-construction-xp-2026-10-05.md` | `city-system.js`, `city-ui.js`, `manual-data.js` |
| 3 | 四资源经济与资源田 | Economy | MVP | Implemented | `design/quick-specs/starter-gold-tuning-2026-10-05.md` | `engine.js`, `wild-fields.js`, `outskirts.js` |
| 4 | 招兵、兵种与军队 | Gameplay | MVP | Implemented | `design/quick-specs/archer-onboarding-2026-10-05.md` | `engine.js`, `manual-data.js` |
| 5 | 回合战斗与指挥 | Gameplay | MVP | Implemented | `design/quick-specs/command-ui-v0.30.0.md` | `battle-tactics-ui.js`, `combat-ui.js`, `deployment-ui.js` |
| 6 | 名将与计谋 | Gameplay | Vertical Slice | Implemented prototype | `design/gdd/hero-stratagems.md` | `battle-stratagems.js`, `hero-system.js` |
| 7 | 将领、画像招降与成长 | Progression | MVP | Implemented | `design/quick-specs/recruitment-raid-2026-10-05.md` | `hero-system.js`, `general-growth-system.js`, `captive-ui.js` |
| 8 | 出征、掠夺与占领 | Gameplay | MVP | Implemented | `design/quick-specs/occupation-return-2026-10-05.md`, `design/quick-specs/field-campaign-v0.25.0.md` | `engine.js`, `campaign-ui.js` |
| 9 | 侦察与情报 | Gameplay | MVP | Implemented | `design/quick-specs/garrison-visibility-2026-10-05.md` | `scout-system.js` |
| 10 | 守城与城防事件 | Gameplay | MVP | Implemented | `design/quick-specs/city-defense-2026-10-05.md` | `npc-defense.js`, `city-strategy.js` |
| 11 | 多城、运输与区域战线 | Gameplay | Alpha | Implemented | `design/quick-specs/territory-supply-v0.32.0.md` | `regional-front.js`, `supply-lines.js` |
| 12 | 官职、爵位与内政 | Progression | Alpha | Implemented | `design/quick-specs/governor-construction-xp-2026-10-05.md` | `heritage-system.js`, `governance-system.js` |
| 13 | 新手引导与十阶礼包 | Meta | MVP | Implemented | `design/quick-specs/onboarding-growth-challenges-2026-10-05.md` | `onboarding-system.js`, `growth-guide.js` |
| 14 | 章节与战役 | Progression | MVP | Implemented | `design/quick-specs/chapter-two-2026-10-05.md`, `chapter-three-2026-10-05.md`, `chapter-unlock-2026-10-05.md` | `chapter-data.js`, `chapter-ui.js`, `mainline-ui.js` |
| 15 | 军令与挑战 | Progression | Vertical Slice | Implemented | `design/quick-specs/war-orders-2026-10-05.md` | `war-orders.js`, `war-orders-ui.js` |
| 16 | 每日任务与成长奖励 | Progression | Alpha | Implemented | `design/quick-specs/onboarding-growth-challenges-2026-10-05.md` | `progression.js`, `reward-data.js` |
| 17 | 背包、掉落与装备 | Economy | Alpha | Implemented | `design/quick-specs/loot-overcap-2026-10-05.md` | `inventory-ui.js`, `hero-system.js` |
| 18 | 自动化助手 | Meta | Alpha | Implemented | `design/quick-specs/automation-assistant-2026-10-05.md` | `automation-system.js`, `automation-ui.js` |
| 19 | 黄巾城与原作系统补全 | Gameplay | Alpha | Implemented | `design/quick-specs/yellow-cities-v0.26.0.md`, `design/quick-specs/original-systems-v0.33.0.md` | `named-city-system.js`, `named-city-data.js` |
| 20 | 策略深度（军令遭遇、占城价值） | Gameplay | Alpha | Implemented | `design/quick-specs/strategy-depth-v0.31.0.md` | `war-orders.js`, `siege-data.js` |
| 21 | 存档与存档接管 | Persistence | MVP | Implemented | — (see ADR-0003) | `engine.js` |
| 22 | 共享世界与联网 | Persistence | Full Vision | Implemented, acceptance separate | `design/quick-specs/realm-online-v0.28.0.md` | `online-client.js`, `online/`, `supabase/` |
| 23 | 城池场景画面与地图 | UI | MVP | Implemented | `design/quick-specs/mobile-controls-2026-10-05.md` | `scene-ui.js`, `ink-map.js`, `world-atlas.js`, `web-art-data.js` |
| 24 | 手机与桌面界面框架 | UI | MVP | Implemented | `design/quick-specs/mobile-controls-2026-10-05.md` | `layout-ui.js`, `classic-ui.js`, `*.css` |

---

## Dependency order (summary)

引擎(1) → 城池与经济(2, 3) → 兵种与战斗(4, 5) → 将领(7)、名将与计谋(6) → 出征／守城(8, 9, 10) → 多城与联网(11, 22)。UI 与引导(13, 23, 24)读取以上各系统，不反向影响规则。

---

## Gaps

- 上表中只有 #6 有正式 GDD；其余系统的设计在 quick-specs 里，章节结构不符合 GDD 模板。按 `docs/adoption-plan-2026-10-08.md`，等某个系统下一次要改时再把它的 quick-spec 提升为 GDD。
- 没有美术规范（art bible）；画面风格目前由 `scene-style-preview.html` 和 `design/quick-specs/` 里的零散说明约束。standard 档不强制。
- 本表由代码与现有文档反推，系统划分和优先级（MVP／Alpha 等）是推断值，请你确认。
