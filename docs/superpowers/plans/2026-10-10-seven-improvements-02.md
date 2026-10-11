# 第二批：围城筹备与战报解释 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans for native execution, or superpowers:subagent-driven-development if the user selects that method. Steps use checkboxes for tracking.

**Goal:** 实现本批对应需求，并保留其余批次的完整交付范围。

**Architecture:** 延续纯JavaScript全局脚本，通过只读规则投影、明确的修改接口及冻结战斗快照接入现有系统。只拆分本功能，不重构无关引擎。

**Tech Stack:** JavaScript、HTML、CSS、node:test、现有Game VM与浏览器尺寸验证。

**Spec:** [design/quick-specs/seven-gameplay-improvements-2026-10-10.md](../../../design/quick-specs/seven-gameplay-improvements-2026-10-10.md)，负责人已确认具体方案。

## Global Constraints

- 手机440×956、390×844和桌面1280验证；短按钮至少44px，无横向溢出；实体真机与尺寸模拟分开报告。
- 随机箱保持七部位随机、允许重复；每日首通箱及重复声望经验减半保持；关羽基础统帅450与入手等级保持。
- 新存档字段旧档补齐、严格校验；只读会话拒绝修改；查看界面不改存档。
- 先红后绿，再做适当模拟、全量npm test、独立审查、截图、PR及CI；负责人明确发布后才合并。
- 新脚本加到index.html和tests/helpers/game.cjs、city-defense、office-promotion、save-session、named-city、city-strategy.smoke各脚本清单。
- 修改engine.js及之前脚本后运行node scripts/build-online-runtime.cjs，一起提交生成文件。
- 每批候选版本同步package.json、index全部?v=、README；提交说明不得使用跳过CI标记。

## Review Focus

- 旧档缺字段：补默认值，不复制旧奖励；由每个状态任务的迁移测试覆盖。
- 切城或目标消失：报价不能把操作落到另一城；由界面/修改任务的过期报价测试覆盖。
- 双击、只读会话与保存失败：不能复制装备、重复扣费或产生半结算；由各修改接口测试覆盖。
- 旧出征、旧战斗与旧战报：缺新字段仍可继续，效果不追溯；由战斗任务兼容测试覆盖。
- 名将同名普通将及解雇：真实身份决定特色和成长记录，不能靠姓名冒充；由成长与特色任务覆盖。

### Task 1: G2围城模板与原子补兵

**Files:** 新增 siege-preparation.js、tests/siege-preparation.test.cjs；修改 named-city-ui.js、deployment-ui.js、engine.js、web-edition.css及脚本清单。

**Interfaces:** SiegePreparation.init/valid; Game.siegePreparationQuote(cityId,nodeId) → {key,deficits,orders,cost,reason}; Game.saveSiegePreparation(cityId,nodeId,template,key); Game.fillSiegePreparation(cityId,nodeId,key)。s.siegePreparation={version:1,templates:{}}，键为己方cityId再名城id；模板hero、tactic和army用现有合法枚举。

- [ ] 写失败测试：目标100、可用30、训练20→缺口50；在途不计可用；人口/资源不足只预览可排量；队列满不扣费；报价变化、切城、重复点击、只读拒绝；多兵种中后项无条件时不可半扣；非法城/兵种/超过100000模板数拒绝；旧档补空。
- [ ] 执行 `node --test tests/siege-preparation.test.cjs`，确认新增行为失败，不能用语法错误代替红灯。
- [ ] 实现：保存模板不发兵。纯模拟状态按模板兵种顺序计算订单，现行训练费用/人口/排队时间复用同一算法；预览显示可排数与余缺，确认重新计算key，再统一扣资源人口和追加订单，一次保存。保存失败沿项目事务/回滚方式处理，先读现有失败语义，不另造成功承诺。压力12小时提醒按截止时间会话去重，断供隐藏重置提醒；刷新提醒不写档。
- [ ] 再运行同一命令，确认通过；检查对应源文件语法与diff。
- [ ] 定向提交本任务源代码、测试和必要脚本清单，不提前标记整批完成。

### Task 2: G7结构化战斗结算

**Files:** 修改 battle-review.js、engine.js、battlefield-system.js、battlefield-ui.js、app.js；新增 tests/battle-review-facts.test.cjs。

**Interfaces:** BattleReview.explain(facts) → {reasons:[最多2条],advice}; facts={version:1,endedBy,gateAttacks,gateBroken,machineLost,attacks,rounds}，统计算于真实结算事件；缺facts使用现有统计。

- [ ] 写失败测试：实际器械全损且未破门出现建议；破门成功不误报；真实零有效攻击才提示距离/指令；超时只说时限；旧战报无事实不猜；租兵不进入城市伤兵；查看/刷新回执不再发奖；valid拒绝负数、非法endedBy及不完整facts。
- [ ] 执行 `node --test tests/battle-review-facts.test.cjs`，确认新增行为失败，不能用语法错误代替红灯。
- [ ] 实现：从普通/租兵实际回合事件生成最小事实，写入当前战斗并冻结最终回执；旧快照缺字段允许继续，缺失历史时不追溯臆造。结算上方显示胜负、损失和建议，保留详细日志与真实治疗入口。
- [ ] 再运行同一命令，确认通过；检查对应源文件语法与diff。
- [ ] 定向提交本任务源代码、测试和必要脚本清单，不提前标记整批完成。

本批模拟：在tests/balance/新增 siege-preparation-pacing.cjs，沿正常开局经济对比旧路线/模板补兵/模板加持续外交三路线，至少种子1/7/19；输出design/balance，记录未招关羽的路线。PR67调查脚本若复用，先审读并显式移植，不隐式依赖未合并PR。

### 批次验收与提交

- [ ] 跑本批列出的模拟，保存种子、实际路线、耗时、损失与资源；失败不能写成平衡达标。
- [ ] 检查每项界面真实操作；保存440/390手机截图及1280桌面证据。
- [ ] 新增状态迁移与严格校验后重建runtime；node --check修改JS、git diff --check。
- [ ] 更新候选版本三处，npm test全部通过；新增改动后重新运行受影响验证。
- [ ] 独立审查并修复阻断项；QA记录区分实际证据和未测范围，更新handoff。
- [ ] 提交、推送、开PR并附到当前任务，检查最新HEAD的CI；等待明确发布授权。
