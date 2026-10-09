# 一致性检查报告：v0.34.29–v0.34.34 设计传播

- 日期：2026-10-08
- 方式：`/propagate-design-change` + `/consistency-check`（entity 范围：本轮改动的 9 项常量）
- 改动来源：README v0.34.29–v0.34.34；`design/balance/opening-pace-2026-10-08.md`、`opening-economy-2026-10-08.md`、`late-battle-difficulty-2026-10-08.md`
- 登记表：`design/registry/entities.yaml` 原为空（检查前 NOT ASSESSED），本轮新增 9 个 constants（见下），各自带 `code_ref`
- 扫描文档：`design/gdd/*`（systems-index、hero-stratagems）、`design/quick-specs/*`（27 份）、`design/balance/*.md`、`design/game-brief.md`、`design/STUDIO_DESIGN.zh.md`、`docs/*.md`、`docs/architecture/*`；`production/epics/opening-pace/*` 只读核对
- Scope：全部章节（本项目系统设计在 quick-spec，无模板章节，不按 standard 档裁剪）

## 传播说明（propagate-design-change）

- 本项目不是 git 仓库，无法 `git diff`；改动摘要取自 README 更新日志和三份平衡报告。
- ADR 影响：ADR-0001（纯 JS 引擎）、ADR-0002（Supabase 共享世界）、ADR-0003（本地存档租约）均不涉及数值或引导规则，**无需修改**。`docs/architecture/tr-registry.yaml` 只有示例条目，无需更新。共享世界在线规则由代码重新生成（story-003 AC-5），不属于设计文档。

## 登记常量与代码核对

| 常量 | 设计值（source） | 代码 | 结果 |
|---|---|---|---|
| hall_level2_build_seconds | 480 秒，加成照常（onboarding-growth-challenges） | `onboarding-data.js` `hallBuildSeconds` level 2 → 480 | ✅ |
| free_finish_threshold | 剩余 ≤ 300 秒，只限建造（governor-construction-xp） | `engine.js` `FREE_FINISH_MS=300000`，`freeFinishBuild` 只查 build 队列 | ✅ |
| starter_supply_tier1_resource | 四资源各 8,000、黄金 10,000（archer-onboarding） | `onboarding-data.js` tier 1 | ✅ |
| starter_supply_tier2_resources | 粮铁 76,000 / 木 92,000 / 石 106,000（archer-onboarding） | tier 2 | ✅ |
| militia_warmup_raid | 30 义兵 → 最近 1 级野地，在官府 2 / 校场 1 / 军营 1 之后（onboarding-growth-challenges） | `growth-guide.js` `warmup()`、建筑序列 | ✅ |
| chapter_army_scale | 章二 ×1.3、章三 ×1.5（chapter-two / chapter-three） | `chapter-data.js` `ChapterData.armyScale`；实算章二 423–1,099、章三 795–1,628 | ✅ |
| yellow_city_army_scale | ×5（yellow-cities） | `yellow-city-data.js`；8 城实算 250–1,450 | ✅ |
| guide_recommended_army | 章二弓 910 / 盾 325，章三弓 1,650 / 盾 525（chapter-two） | `growth-guide.js` campaign() | ✅ |
| jewel_substitute_rate | 2 倍声望、低价值优先（city-defense） | `heritage-system.js` `JEWEL_SUBSTITUTE_RATE=2`、`jewelPayment` | ✅ |

规则类（未登记为常量）：首战仅据点胜利（`growth-guide.js` `landmarkVictory`、`onboarding-system.js` `completeFirstBattle`）✅；攻坚克敌不按野地当前等级（`reward-data.js` victoryLevel：野地取 0，只看 `win_level_N` 与领地等级）✅；头巾只计非 `terrain:'fort'` 的掠夺胜利（`progression.js`）✅ —— 古渡县城、名城、黄巾城均为 fort，与「县城、黄巾城等城池不计」一致；城池占领默认驻扎、可选 `returnAfterOccupy`（`engine.js` dispatch / 结算日志）✅。

## 🔴 冲突（传播前 文档 vs 代码，本轮已修正）

1. `quick-specs/archer-onboarding-2026-10-05.md`：第 1 阶四资源写 40,000，代码 8,000；第 2 阶未写 → 已改并加变更记录。
2. `quick-specs/onboarding-growth-challenges-2026-10-05.md`：「官府前两级保持」，代码 2 级 480 秒；首战未限定据点；无典民令、义兵步骤；攻坚克敌判定未写 → 已改。
3. `quick-specs/occupation-return-2026-10-05.md`：「县城保留原有返城行为，仅野地有驻扎选择」，代码城池占领默认驻扎新城、可勾选返回 → 已改。
4. `quick-specs/yellow-cities-v0.26.0.md`：守军 50 / 93 / 136，代码 ×5 后 250 / 465 / 680 → 已加注。
5. `quick-specs/chapter-two-2026-10-05.md`、`chapter-three-2026-10-05.md`：未写守军倍数与新推荐兵力 → 已加。
6. `quick-specs/city-defense-2026-10-05.md`（官职修正）：只写「全部条件满足后统一扣费」，无珠宝折算 → 已加变更记录。
7. `quick-specs/governor-construction-xp-2026-10-05.md`：无免费完成规则 → 已加。

历史平衡报告不改正文，只在顶部加「被哪份报告取代」注：`balance/archer-onboarding-2026-10-05.md`、`starter-gold-2026-10-05.md`、`chapter-progression-2026-10-05.md`、`opening-pace-2026-10-08.md`（现状一节）。同名 JSON 不能加注，以对应 .md 为准。

## ⚠️ 仍未解决 / 需注意

- `onboarding-data.js` `hallSeconds[1]=3995` 仍保留但被 `hallBuildSeconds` 的 2 级特判覆盖，读数据表的人会误以为 2 级是 3,995 秒。建议代码侧加注释或改表（本次不改代码）。
- 免费完成「共享世界暂不支持」：`freeFinishBuild` 已列入 `engine.js` 动作表，`supabase/functions/_shared/game-runtime.mjs` 也包含该名称；本次未核实在线侧确实拒绝，记为 ℹ️ 未核验。
- 义兵练兵出征在没有空闲主将或找不到 1 级野地时会被跳过（`warmup()` 返回 null），设计文档只写了正常路径。

## 缺口（缺设计文档，未新写 GDD）

1. 后加的 5 座黄巾城（柳林、黑山、云台、铁岭、黄沙）没有任何设计文档；`yellow-cities-v0.26.0.md` 只记录最初 3 座。
2. 黄巾史诗（四项进度、头巾目标数、县城解锁）没有专门设计文档，只有 field-campaign 的一行和本轮变更记录。
3. 珠宝声望价值表（珍珠 1,000 … 夜明珠 5,000）与各官职珠宝要求只在代码（`progression.js`、`heritage-data.js`）里。
4. 章节逐关守军数量只在 `chapter-data.js`，设计文档只有倍数和范围。
5. 新手引导（#13）、礼包经济（#3）、章节（#14）、官职（#12）都还没有正式 GDD，仍是 quick-spec；按 adoption-plan 等下次改动时提升。
6. Sprint 3（v0.34.34 中后期难度）在 `production/epics/` 下没有对应 story（本任务不改 production/，需另行补）。

## 结果

Verdict: **CONFLICTS FOUND → 已在设计文档中修正 7 处**；登记表 9 项与代码一致；3 项注意事项、6 项缺口待处理。冲突已记入 `docs/consistency-failures.md`。`production/session-state/active.md` 的 breadcrumb 因本任务不改 `production/` 未写。
