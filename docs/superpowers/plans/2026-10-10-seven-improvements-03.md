# 第三批：名将特色与支线战术 Implementation Plan

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

### Task 1: G3冻结名将特色

**Files:** 新增 hero-traits.js、tests/hero-traits.test.cjs；修改 hero-system.js、hero-ui.js、engine.js、battlefield-system.js及脚本清单。

**Interfaces:** HeroTraits.profile(s,heroId) → {version:1,id}; HeroTraits.modifiers(profile,unitId,command,targetKind) → {gateDamage,damageTaken,initiative}，默认均1；快照持有profile，旧缺字段沿旧规则。

- [ ] 写失败测试：关羽真实来源近战攻门1.08、打兵1；孟获刀盾固守承伤0.95、推进1；祝融弓兵先手1.05、移动/射程不变；同名普通将无特色；在途换装不重算；关羽基础统帅仍450；租兵与普通战同输入一致。
- [ ] 执行 `node --test tests/hero-traits.test.cjs`，确认新增行为失败，不能用语法错误代替红灯。
- [ ] 实现：先盘点人物已有bonus与GeneralGrowth，每种新修饰只在对应阶段应用一次，独立于原加成；只针对已批准三人新增特色，其余人物显示已有专长。精确使用候选8%/5%/5%，模拟后需调整则记录并给出设计差异。
- [ ] 再运行同一命令，确认通过；检查对应源文件语法与diff。
- [ ] 定向提交本任务源代码、测试和必要脚本清单，不提前标记整批完成。

### Task 2: G4粮道支线后效

**Files:** 修改 battlefield-data.js、battlefield-system.js、battlefield-ui.js；新增 tests/battlefield-supply-effect.test.cjs。

**Interfaces:** BattlefieldData.config(campaign).supplySide：黄巾s3，南蛮b3；BattlefieldSystem.finalArmy(run,node) → copied army，后效来自本轮completed、在最终战斗建立时一次冻结。

- [ ] 写失败测试：已完成指定支线终关人数floor(n*.95)，非零至少1；未完成不变；现有救援仍只+500一次；5%不重复；旧已开始最终战斗不改；失败重试基于配置新建一次，非对已减人数再扣；跨日奖励既有规则不变。
- [ ] 执行 `node --test tests/battlefield-supply-effect.test.cjs`，确认新增行为失败，不能用语法错误代替红灯。
- [ ] 实现：使用既有粮道/藤油节点并补剧情与预览，保留原解除攻防优势效果；确认该节点没有同类减兵后效，有则统一一次计算。读取节点不写记录，实际胜利completed作为唯一后效来源。
- [ ] 再运行同一命令，确认通过；检查对应源文件语法与diff。
- [ ] 定向提交本任务源代码、测试和必要脚本清单，不提前标记整批完成。

本批模拟：新增tests/balance/hero-traits-comparison.cjs和battlefield-routes.cjs；同敌同兵对照三特色的触发/不触发与普通将，黄巾/南蛮各对比直主线、救援、全支线。记录时间/兵损/兵池/收益，不让全支线同时全面占优；保存JSON和说明。

### 批次验收与提交

- [ ] 跑本批列出的模拟，保存种子、实际路线、耗时、损失与资源；失败不能写成平衡达标。
- [ ] 检查每项界面真实操作；保存440/390手机截图及1280桌面证据。
- [ ] 新增状态迁移与严格校验后重建runtime；node --check修改JS、git diff --check。
- [ ] 更新候选版本三处，npm test全部通过；新增改动后重新运行受影响验证。
- [ ] 独立审查并修复阻断项；QA记录区分实际证据和未测范围，更新handoff。
- [ ] 提交、推送、开PR并附到当前任务，检查最新HEAD的CI；等待明确发布授权。
