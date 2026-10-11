# 八项手机经营模板 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完成已批准八项手机模板改进，持续执行不重复询问。
**Architecture:** 保留现有全局脚本和真实Game动作，以小型纯规则模块与短UI入口扩展。四批串行实施避免共享engine/app冲突，每批独立测试和审查。
**Tech Stack:** 原生JavaScript/HTML/CSS、Node测试、GitHub Pages。
**Spec:** design/quick-specs/classic-mobile-templates-2026-10-11.md

## Global Constraints

- 全部八项完成；不重复审批，方案默认按推荐；发布仍等待明确发布指令。
- 旧存档迁移/严格校验、只读投影、真实费用和队列、手机大触控目标。
- 不新增依赖或引擎，不自动毁田，不泄露地图情报，不更改薪俸与忠诚。
- 新脚本六处加载清单齐全，更新共享运行时；最终候选0.34.71三处版本一致。
- 全量测试绿色才提交/推送；标题正文不含skip指令。

## Review Focus

- 城市切换/失城/将领离队后的引用：旧档仍合法，其他城资源不误扣（Task1/2/3）。
- 同时报价及重复确认：不重复扣钱、排兵或消费援军令（Task1/2/4）。
- 离线恢复与在途快照：不免费运输、不重算旧战斗（Task2/4）。
- 未侦察目标与隐藏名将：地图过滤不泄露敌军或位置（Task3）。
- 难度切换、旧每日奖励与旧战报：首通箱不能多刷、旧档奖励不补发（Task4）。

---

### Task 1: 城池模板与薪俸供粮预算（项目1、8）

**Files:** Create city-presets.js, city-presets-ui.js, tests/city-presets.test.cjs, tests/economy-budget.test.cjs; modify engine.js, city-system.js, governance-system.js or existing pure projection helpers, app.js, web-edition.css, index.html and six test script lists. Existing automation/plot APIs remain compatible.
**Interfaces:** Produces Game.cityPresetQuote(presetId), Game.applyCityPreset(draft,key), Game.pauseCityPreset(), Game.economyBudget(cityId=currentCityId) returning cityId, wages, owed, goldHours (number|null), foodNet, foodHours (number|null), population, salaryReserve (24h wages+owed). City preset draft is {id,buildings,plots}; exact persisted format belongs in module and report. UI action handler returns true only for owned actions. Later tasks consume economyBudget and reusable salary-spend confirmation helper documented in report.

- [ ] Read spec items1/8, inspect existing real build/automation/city-scoping and market/token UI calls.
- [ ] Write RED behavioral tests: old save missing new fields migrates/validates; opening quote does not write; custom target preserves a level8 field; empty plot fills and real build cost deducted; pause/resume; two cities separate; spending warning24h threshold and8h budget; no wages/no net consumption null duration; salary charged only actual home city including transit policy.
- [ ] Run focused tests, record expected failures, implement minimal rules/API/UI with actual queues and short cards. Ensure hidden online controls are not authoritative state writes.
- [ ] GREEN focused tests, node --check, build-online-runtime, npm test, git diff --check.
- [ ] Commit only task files; write task report including APIs, RED/GREEN output paths, migration behavior, limitations. Do not alter version until Task5.

### Task 2: 运输预设与练兵模板（项目2、3）

**Files:** supply-lines.js/ui, engine.js, training-templates.js/ui (new), city-system.js if scoped, app.js, web-edition.css, new tests/training-templates.test.cjs and supply-line additions, script lists.
**Interfaces:** Consumes Game.economyBudget(cityId). Produces Game.trainingTemplateQuote(draft), Game.saveTrainingTemplate(draft,key), Game.fillTrainingTemplate(key), Game.setTrainingTemplateEnabled(enabled), plus preset UI on existing supplyLineQuote/saveSupplyLine. Templates use spec exact army values and custom edits. Report persistent schema and automatic-tick scheduling so final integration can audit it.

- [ ] RED tests for deficits counting local+queued not marching, army types/bounds, unlocked/locked unit, partial resources/population/queue, stale confirmations, rollback save failure, two cities independent, salary budget respected by auto, no offline new work.
- [ ] Implement real ordinary-training atomic refill and opt-in online-time automation. Add supply shortcuts retaining editable target/source reserve and fixed army.
- [ ] Test pending cargo avoids duplicate deficit, route resumes after return and pauses correctly; city overview shows starvation deficit and inbound/outbound progress using existing overview hooks.
- [ ] GREEN focused tests, syntax checks, rebuild runtime, full npm test, commit; write report. All interfaces pure on reads.

### Task 3: 名将册与地图快捷目标（项目4、6）

**Files:** hero-ui.js, hero-system.js if needed, world-targets.js/ui (new), app.js and relevant world UI, engine.js state init/valid and exports, web-planning.js if existing view integrates, CSS/script lists, tests/hero-codex.test.cjs and world-targets.test.cjs.
**Interfaces:** Existing HeroSystem.wild.codex/rumors and NamedGarrison supply known targets. Produces Game.nearbyTargets(filter,center?) pure view, Game.setTargetFavorite(nodeId,enabled), and quick UI action handler, trace line view. Filters training/jewels/gold/heroes, radius6<=169 wild lookups, max20 favorites. No hidden enemy strength sorting.

- [ ] RED tests for filters/nearby bound, public versus expired intelligence, undiscovered wild hero absent, favorite dedupe/cap/reload/strict validation, pure UI view, current march path and removed targets.
- [ ] Implement four hero management filters without removing recruitment/equipment/skill/dismiss controls, codex known city/wild sources and actual recruit requirements, real equip/redeploy shortcuts.
- [ ] Implement bounded nearby list, favorites, target selection/recenter and path display; preserve partial world pan render/performance.
- [ ] GREEN focused tests, syntax, runtime rebuild, full suite, commit and report actual UI entry points for browser QA.

### Task 4: 战场难度路线图与任务科技路线（项目5、7）

**Files:** battlefield-data.js/system.js/ui.js, engine.js wrappers, journey-system.js/ui.js, growth-guide.js or new research-routes.js/ui, app.js, CSS/script lists; tests/battlefield-difficulty.test.cjs, research-routes.test.cjs plus existing battlefield regressions.
**Interfaces:** Default API calls maintain simple behavior. Extend battlefieldQuote/startBattlefield and view with final optional difficulty argument; run stores frozen difficulty. Existing firstClears unlock normal, new difficultyClears record unlock chain. Global per-campaign daily counter remains. Tech-route IDs economy/archer/cavalry/siege; pure view produces current target, missing real prerequisite, existing action route.

- [ ] RED tests for old save/run/simple identical, normal1200/4500/1.75x/1.25reward, difficult2000/7500/3x/1.5reward, prerequisite clear gates, per-campaign daily box shared across difficulty and repeat rewards half, forged future difficulty rejected, reload frozen battle.
- [ ] Implement config scaling without changing simple historical snapshots/rewards or equipment box tier. Audit all hardcoded800 restrictions, rental quotas, battle valid, final receipt validation and rewards migration.
- [ ] Route map same screen three arcs with main and optional branch cards; difficulty selector quote/start/key reflect difficulty; keep existing compact battle controls.
- [ ] RED→GREEN tech-route current prerequisites and save purity; implement four routes and task current-only home card; all tasks still accessible/claimable. Integrate auto-research via existing permitted settings, exact research priority and route advancement.
- [ ] Focused/full tests, runtime rebuild, syntax, commit and task report.

### Task 5: 整体验收与可发布候选

**Files:** README.md, package.json/index versions, production/qa/classic-mobile-templates-v0.34.71.md/screenshots, design/balance/classic-mobile-templates-2026-10-11.md and reproducible simulations, docs/HANDOFF-2026-10-09.md.
**Interfaces:** All prior reports provide exact UI entries, schema and Game APIs. No new product behavior unless review finding requires regression fix.

- [ ] Real-game smoke old/current save roundtrip, multicity presets and paid transport/training, hero trace, difficulty campaigns and four tech routes; record seeds1/7/19 successes/failures without resource grants for numerical claims.
- [ ] Browser QA390×844/440×956/1280×900 screenshots, no overflow/console errors; click genuine controls, not mutate state via evaluate. Controlled fixtures can test visuals but label as fixtures.
- [ ] Independent whole-branch review, fix important defects RED→GREEN; disclose deferred minors and every ruling.
- [ ] Update0.34.71 version everywhere, rebuild runtime, full suite before push, PR and CI. Show screenshots before any release. Do not merge without current user release instruction.
