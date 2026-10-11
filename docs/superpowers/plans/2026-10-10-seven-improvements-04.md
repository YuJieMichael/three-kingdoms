# 第四批：套装回收兑换与七项整体验收 Implementation Plan

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

### Task 1: G5回收材料与兑换

**Files:** 修改 hero-system.js、hero-ui.js、engine.js、battlefield-system.js；新增 tests/set-recycling.test.cjs。

**Interfaces:** HeroSystem.setExchangeQuote(s,setId,slot) → {key,cost:12,reason}; HeroSystem.exchangeSet(setId,slot,key) → error|null。s.setMaterials={yellow_turban:0,nanman:0}，限定非负安全整数及精确键集合。

- [ ] 写失败测试：未穿戴套装分解珍珠保持原值且对应材料+1；强化10仍材料+1；非套装不加；12→兑换后0、11拒绝；跨套拒绝；仓库满/只读/无效key/重复点击不扣；兑换强化0、正确tier/setId/slot；旧档补0；箱随机规则保持。
- [ ] 执行 `node --test tests/set-recycling.test.cjs`，确认新增行为失败，不能用语法错误代替红灯。
- [ ] 实现：复用现有salvage保护、addEquipment品质和容量校验。先验证所有条件，材料扣除与新增装备一次保存，保存失败按现有事务方式回滚。槽位限定七部位，不含奇物；预览列套装实穿件数、材料与兑换。
- [ ] 再运行同一命令，确认通过；检查对应源文件语法与diff。
- [ ] 定向提交本任务源代码、测试和必要脚本清单，不提前标记整批完成。

### Task 2: 七项完整成长路线

**Files:** 新增 tests/balance/seven-improvements-progression.cjs；更新四批QA、design/balance/seven-improvements-progression报告及handoff。

**Interfaces:** 使用前三批实际公开Game接口，从loadGame默认开局推进；正常奖励经济和prepared边界夹具严格分别标注。

- [ ] 写失败测试：至少种子1/7/19：成长目标跟随真实进度，首名将/第二城/两剧本/江陵筹备/兵损解释/重复装备回收均记录；备份导出导入保持模板材料与回执；旧档合法；任何完整路线失败非零退出。
- [ ] 执行 `node tests/balance/seven-improvements-progression.cjs`，确认新增行为失败，不能用语法错误代替红灯。
- [ ] 实现：仅为时间推进使用模拟时钟，不使用测试资源、改爵位或改兵力；记录卡点和实际缺口，不用强设状态填补失败。额外抽样箱数模拟可独立标明概率实验，记录随机种子、样本量、平均/中位数/90分位，不能宣称指定天数保证凑套。
- [ ] 再运行同一命令，确认通过；检查对应源文件语法与diff。
- [ ] 定向提交本任务源代码、测试和必要脚本清单，不提前标记整批完成。

额外概率模拟：tests/balance/set-completion.cjs，七部位均匀随机，至少10000轮，比较纯随机与每件重复回收1份、12份兑换的完整七件箱数。

### 批次验收与提交

- [ ] 跑本批列出的模拟，保存种子、实际路线、耗时、损失与资源；失败不能写成平衡达标。
- [ ] 检查每项界面真实操作；保存440/390手机截图及1280桌面证据。
- [ ] 新增状态迁移与严格校验后重建runtime；node --check修改JS、git diff --check。
- [ ] 更新候选版本三处，npm test全部通过；新增改动后重新运行受影响验证。
- [ ] 独立审查并修复阻断项；QA记录区分实际证据和未测范围，更新handoff。
- [ ] 提交、推送、开PR并附到当前任务，检查最新HEAD的CI；等待明确发布授权。
