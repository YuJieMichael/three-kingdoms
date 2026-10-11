# 第一批：成长路线与多城总览 Implementation Plan

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

### Task 1: G1征程目标

**Files:** 新增 journey-system.js、journey-ui.js、tests/journey.test.cjs；修改 growth-guide.js、app.js、engine.js、web-edition.css及脚本清单。

**Interfaces:** JourneySystem.view(game) → {steps,current}; JourneySystem.init(s)/valid(s); Game.setJourneyTarget(id) → error|null。选择字段s.journey={version:1,tracked:""}，id限定五阶段枚举，空串代表推荐。

- [ ] 写失败测试：新档推荐建设，黄巾完成后指向名将；名将俘获不算招降；解雇记录、失去第二城、江陵已解雇均无无效入口；全部完成稳定；浏览前后JSON一致；非法追踪id被拒绝。
- [ ] 执行 `node --test tests/journey.test.cjs`，确认新增行为失败，不能用语法错误代替红灯。
- [ ] 实现：引用现有任务、battlefields.firstClears、真实名将招募记录与城市归属推导五阶段，不复制奖励。新手危险断粮提示仍优先可见；首页只呈现一个目标，征程详情支持显式追踪，点击入口复用实际页面动作。
- [ ] 再运行同一命令，确认通过；检查对应源文件语法与diff。
- [ ] 定向提交本任务源代码、测试和必要脚本清单，不提前标记整批完成。

### Task 2: G6多城总览

**Files:** 修改 city-ui.js、growth-guide.js、app.js、web-edition.css；新增 tests/city-overview.test.cjs。

**Interfaces:** cityOverviewModel(game) → city rows; cityOverviewModal()，使用Game.cityList/citySummary/logisticsList，全部只读。

- [ ] 写失败测试：1/2/多城显示真实经营类型、驻将、净粮与队列；缺粮排第一；空闲排其次、同优先级id稳定排序；推恩令到期不丢城市；被占城移除；前后存档及activeCity相同。
- [ ] 执行 `node --test tests/city-overview.test.cjs`，确认新增行为失败，不能用语法错误代替红灯。
- [ ] 实现：接入现有城市切换列表/更多入口，显示粮城/矿城/关隘/均衡用途；动作直接进入已有运输、任将与城池详情。绝不额外叠加特色数值、批量扣费或自动切城。
- [ ] 再运行同一命令，确认通过；检查对应源文件语法与diff。
- [ ] 定向提交本任务源代码、测试和必要脚本清单，不提前标记整批完成。

本批模拟：node tests/balance/realm-soak.cjs 与 node tests/balance/long-run-soak.cjs；确认粮食/运输及界面读取守恒。

### 批次验收与提交

- [ ] 跑本批列出的模拟，保存种子、实际路线、耗时、损失与资源；失败不能写成平衡达标。
- [ ] 检查每项界面真实操作；保存440/390手机截图及1280桌面证据。
- [ ] 新增状态迁移与严格校验后重建runtime；node --check修改JS、git diff --check。
- [ ] 更新候选版本三处，npm test全部通过；新增改动后重新运行受影响验证。
- [ ] 独立审查并修复阻断项；QA记录区分实际证据和未测范围，更新handoff。
- [ ] 提交、推送、开PR并附到当前任务，检查最新HEAD的CI；等待明确发布授权。
