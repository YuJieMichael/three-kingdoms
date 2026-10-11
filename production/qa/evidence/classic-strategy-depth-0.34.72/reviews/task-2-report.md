# Task 2 · 分阶段公开练兵目标

状态：DONE。未推送、合并、发布或修改版本号。

## 实现

- 新增纯读取 `Game.trainingTargets(stage, center=currentHome())`，stage 为 beginner / advanced / famous，等级分别1–3、4–6、7–10。依照控制代理澄清，仅推荐普通野地，不推荐固定城寨或需要连续围城、器械的据点。
- 复用 WorldTargets 的公开可见性与附近扫描；中心前后6格、按公开等级→距离→ID排序、最多5项。仅返回 id/name/level/distance/intel/reason；无军力评分、风险、胜率、经验预测。军量、掉落、实力字段不参与选择或理由。
- 排除已占领、我方城市、不公开目标，以及所有城市的出征、驻守、侦察队列冲突与全局据点冷却。未侦察优先显示“先侦察”，有真实报告后打开现有目标情报/出征流程。
- 附近练级页默认新手组，提供进阶、名将、全部附近四个短按钮。“全部附近”仍使用原 `nearbyTargets('training',worldView)`；原 API、其他四类筛选及收藏选择未变。阶段选择仅为页面变量，没有新增存档字段。
- 地图最近战斗结果补充实际结算经验，地图结果/完整出征战报提供“🩹 恢复”。入口只读来源城当前伤兵与真实全部治疗报价。同城沿用伤兵营和补兵目标；跨城提供现有 citySwitchConfirm 显式按钮，在非可写/authority模式禁用，不偷偷激活城市或写档。
- app 捕获权限白名单只加入两个只读入口；实际派遣、治疗和切城依然受原权限保护。移动卡片与恢复按钮最小44px。
- 使用现有文件，无新增全局脚本；共享运行时同步重建。

## TDD / 测试证据

### 初始 RED

实现前命令：`node --test tests/training-targets.test.cjs`

```text
✖ staged training bounds level then distance then ID, caps five, and never touches hidden strength
✖ real stages and stale intel are pure, enemy army poisoning leaves public selection unchanged and legacy nearby/favorites stable
✖ training excludes owned, locked, cooldown, deployed and stationed targets, including other cities
✖ stage chips render short real-flow cards; unknown scouts precede view and reads preserve state
✖ recovery link reads source-city wounded; blocked or shared links never change city, army, queue or resources
ℹ tests 5
ℹ pass 0
ℹ fail 5
```

预期原因：WorldTargets.training / Game.trainingTargets / trainingRecoveryButton 尚不存在，原界面没有阶段按钮。

首轮实现中发现 `cooldowns` 属于全局状态，不在 CitySystem.scope 字段清单；根据报错与实际字段清单修正读取位置。普通野地澄清后，旧测试对固定木林 `wood` 的未侦察断言调整为实际入选野地，仍用过期报告验证unknown。

### “全部附近”新增 RED

控制代理要求保留旧列表的入口后，先新增第10项测试再实现，命令：
`node --test tests/training-targets.test.cjs > /tmp/classic-task2-all-red.log 2>&1`

```text
ℹ tests 10
ℹ pass 9
ℹ fail 1
✖ all-nearby shortcut preserves the original distance list and favorite choices alongside stages
AssertionError: The input did not match the regular expression /全部附近/. Input: ''
```

预期原因：all 芯片动作尚未注册。

### GREEN / 定向回归

最终命令：`node --test tests/training-targets.test.cjs tests/world-targets.test.cjs`

```text
ℹ tests 25
ℹ suites 0
ℹ pass 25
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1275.104791
```

10项新增行为覆盖：阶段等级、排序和5项上限；中心范围；隐藏army/loot/power/risk属性getter全部抛错仍成功；真实节点army污染后选项与标签一致；读取状态完全一致；过期情报； owned/不可见/locked/非野地/势力营地排除；出征/驻守/侦察冲突；多城冲突；全部附近与收藏原路径；真实斥候扣粮、出发/返城和取得types报告；按原出征API冻结军队与敌方快照；来源城恢复读取；只读和联机权限捕获以及实际API拦截；地图/战报实际经验和来源城恢复入口。

部分测试是首轮GREEN后追加的实际流程/集成回归（4项），没有将它们声称为实现前RED；首5项与“全部附近”均遵循先失败再实现。

### 全套

本任务仅运行一次：`npm test > /tmp/classic-task2-full.log 2>&1`，退出0。

```text
ℹ tests 1005
ℹ suites 0
ℹ pass 1005
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 67040.394625
```

### 语法 / 生成

`node --check`：world-targets.js、world-targets-ui.js、engine.js、app.js、grid-world.js、tests/training-targets.test.cjs、supabase/functions/_shared/game-runtime.mjs 全部退出0；`git diff --check`退出0。

`node scripts/build-online-runtime.cjs`：

```text
Built isolated online runtime from 51 source files (a254a0b31046).
```

## 修改文件

world-targets.js、engine.js、world-targets-ui.js、app.js、grid-world.js、web-edition.css、tests/training-targets.test.cjs、supabase/functions/_shared/game-runtime.mjs。

没有加入控制代理修改的规格文档、规划、QA/evidence或balance脚本。

## 自查

- 本功能没有存档数据字段或新动作事务；纯页面变量不需要迁移，原存档及快照仍沿原流程。UI打开不调用tick/save/switchCity，也不消费资源。
- 阶段筛选不调用attackInfo、power、战利品或军力评分，测试以抛错隐藏getter和真实军量污染验证。
- 只读恢复展示来源城当前伤兵，战报保留当时损失/经验；未跨城取资源、混淆伤兵归属或复制奖励。
- 保留原附近/收藏逻辑，无新框架、未拆分已有较长单行UI函数；遵循当前文件模式，语法及整套测试通过。
- 公开营地扩展边界：WorldTargets.training 已过滤 `n.factionCamp`。Task5接入营地时，应在公开野地投影保留这个marker或等价公开排除条件，不能让势力营地伪装成普通低级野地。
- 未发现正确性疑虑。手机截图/全任务正常经济模拟由控制代理集成QA安排；本任务未发布。

提交：`3224f42 feat: add public staged training targets and recovery links`。提交输出仅包含8个任务文件。
