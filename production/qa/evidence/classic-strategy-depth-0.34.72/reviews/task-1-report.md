# Task 1 · 本城恢复优先补兵

状态：DONE。提交 `6ad80b7` · `feat: add recovery-first city recruitment`。

## 实现

- 在本城 `warCare` 中增加 `recoveryPriority` 布尔开关，旧档缺失时迁移为 `false`；现有价格、伤兵收治/治疗账本与来源收据保持原口径。所有城池通过现有迁移与 `WarCare.valid` 校验，非法类型拒绝。
- 新增纯读取 `Game.recoveryView()` 与事务式 `Game.setRecoveryPriority(boolean)`。开启政策不会开启自动治疗、自动补兵或更换目标；治疗暂停时不抵扣任何伤兵。
- `WarCare.recovery` 按原兵种顺序共享一个本城黄金预算，恢复优先时预留 `max(economyBudget().salaryReserve, automation.reserve.gold)`。薪俸沿用本城实际承担的全体武将薪俸与欠薪，其他城黄金不能补贴。
- `TrainingTemplates.plan` 通过可选 `api.recoverable` 接收可恢复人数；缺省保持原有驻军＋队列口径。预计治疗黄金也从训练可花预算中扣除，同一黄金不能同时支付恢复与黄金训练费。远征/外出兵力不计入目标。
- 两个自动开关都开时，真实结算顺序是先疗伤、再重新计算缺口并排训练。预计恢复只抵扣目标，不提前增加驻军；手动疗伤仍真实支付原价。
- 手动治疗报价提供 `salaryImpact`，伤兵营显示治疗金额、付薪时长与侵入薪俸预算提示，并复用现有消费确认流程。
- 新开关、手动治疗与自动治疗开关事务在存储失败时恢复完整状态；快照取在预结算之前，工资、收入、队列、所有城池与伤兵账本一起回滚。联机已有手动治疗权限保留，新增政策入口仅单机。
- 练兵界面增加44px以上可点击的中文勾选行，分别显示健兵、排队、可恢复、缺口；开关保存保留未保存的兵力草稿，跨城旧控件不能改另一城。
- 未新增全局脚本，无需扩展脚本清单；按项目要求重建联机运行时，未改版本号，未推送/合并。

## TDD · RED

命令：`node --test tests/recovery-training.test.cjs`，产品修改之前运行。

实际摘要：

```text
ℹ tests 10
ℹ pass 0
ℹ fail 10
AssertionError: 恢复优先必须有事务入口
+ 'undefined'
- 'function'
181 !== 0
TypeError: Cannot read properties of undefined (reading 'warn')
```

失败指向尚未实现的恢复政策入口、可选伤兵抵扣、薪俸影响报价及默认迁移；已先修正测试夹具中的弓兵前置与人口容量，再观察这些产品缺失失败。未把前置缺失当作产品失败。

补充边界 RED：`node --test tests/recovery-training.test.cjs`，新增可表示士兵数上限用例后运行。

```text
ℹ tests 14
ℹ pass 13
ℹ fail 1
expected recovery at the soldier count boundary matches actual automatic treatment
+ 9007199254740990
- 9007199254740991
```

预期可恢复1人但旧自动路径整单因上限拒绝；改为真实治疗与预计恢复共用同一人数投影，修复后通过。

## GREEN 与回归

`node --test tests/recovery-training.test.cjs tests/training-templates.test.cjs tests/war-care.test.cjs`

```text
ℹ tests 44
ℹ pass 44
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
```

14项新增测试覆盖：800目标＋619驻军＋181伤兵的旧/新口径、暂停自动治疗、手动实际扣费、缺钱仅抵扣10名并训练真实171缺口、薪俸及助手留金、真实先治后招、来源账本、三项事务完整回滚、预结算失败回滚、迁移和所有城校验、多城/离线队列、可选模块参数、混合兵种共享预算与黄金训练费、兵数上限、手机界面与未保存草稿/旧城市操作。

首轮全套命令：`npm test`。

```text
ℹ tests 992
ℹ pass 991
ℹ fail 1
shared battle honors hold and inside doctrines, while wounds enter hospitals rather than army
Error: 当前共享世界暂未开放区域战线、自动补给与主动备防
```

发现事务封装误把现有联机治疗挡住，已改为治疗沿用原权限、新政策自己检查单机，并重建运行时。

修复后定向命令：
`node --test tests/recovery-training.test.cjs tests/training-templates.test.cjs tests/war-care.test.cjs tests/online-realm-expansion.test.cjs`

```text
ℹ tests 61
ℹ pass 61
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
```

已执行各修改JS的 `node --check` 与 `git diff --check`，均退出0。

最终运行时重建：`node scripts/build-online-runtime.cjs`。

```text
Built isolated online runtime from 51 source files (eabd713d03ca).
```

最终全套复验命令：`npm test`（因首轮真实失败而重跑）。退出0。

```text
ℹ tests 992
ℹ suites 0
ℹ pass 992
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 52361.20925
```

测试输出无警告，最终暂存差异检查通过。

## 改动文件

- `war-care.js`
- `training-templates.js`
- `engine.js`
- `war-care-ui.js`
- `training-templates-ui.js`
- `web-edition.css`
- `tests/recovery-training.test.cjs`
- `supabase/functions/_shared/game-runtime.mjs`（生成物）

未收进控制代理创建的 `production/qa/classic-strategy-depth-0.34.72.md` 与 `tests/balance/classic-strategy-depth.cjs`。

## 自查与限制

- 检查差异确认未重构引擎、未改变旧治疗价格/账本、未增加人口或免费兵力、未修改存档快照中的战斗和城市归属。
- 自查发现一次宽字符串替换误触碰了围城报价提示，已在全套前恢复原围城逻辑；只留下练兵目标范围内的恢复提示。
- 上限处预计恢复与真实恢复不一致通过补充RED暴露并修复；全套暴露的联机权限回归已修复并通过定向验证。
- UI结构与勾选交互已用真实引擎驱动测试。手机截图/真实Safari外观检查由总任务集成QA安排，本任务未声称完成该视觉验收。
- `engine.js` 已存在长单行；按既有结构精确修改与语法检查，不扩展任务做架构整理。

## 审查修复 · 第1轮

状态：DONE。提交 `f39bc10` · `fix: preserve recovery reserves after salary settlement`。

### 反馈与处理

审查指出旧结算先疗伤、后支付整点工资，恢复优先仍可能在付薪后低于24小时薪俸；多小时离线也可能提前疗伤花掉后续工资。

仅针对恢复优先城池，将自动疗伤与练兵目标补兵延后到本次 `tick` 的全部工资边界结算之后：先完成收入、已有队列、工资与欠薪的正常结算，再用当前本城余金与既有 `max(24小时工资＋仍欠薪, 助手留金)` 投影真实疗伤，然后计算补兵。无需另推导应付工资或重复叠加欠薪。非恢复优先城池保持旧 `tickCity` 的治疗、补兵顺序与消费规则；联机权限未改动。

新增三个测试（含9组预算/离线场景及原模式对照）覆盖：

- 整点的黄金1008只能付40工资而不能治疗，最终968；黄金1048可治疗1名，付薪后刚好960。
- 已欠薪100的场景真实支付欠薪＋工资一次，仍能治1名并准确留下960，防止重复预留欠薪。
- 助手留金2000占主导时，治疗、工资/欠薪支付后准确留下2000。
- 离线3小时及24小时的8小时工资上限、助手留金与欠薪组合；治疗1人且留金完整，再次读取不重复扣费。
- 工资整点181人真实治疗先于补兵，不额外排队；旧模式仍按原规则用完1008黄金治疗21人，工资形成各20欠薪。

### RED

产品修改前：`node --test tests/recovery-training.test.cjs`。

```text
ℹ tests 17
ℹ pass 14
ℹ fail 3
recovery priority leaves a full salary day after the same boundary pays wages and arrears
1 !== 0
offline catchup uses each payable salary boundary and preserves assistant reserve without double billing
3 !== 1
priority still heals before recruiting at a salary boundary and legacy automatic care keeps its former spending rule
920 !== 960
```

最后一个场景的足额输入夹具随后按独立算式修正为 `181*48+40+960=9688`；实现后原9648只能治180人，夹具原注释与数值不符，未将该夹具问题误修成产品赠兵。

### GREEN

命令：
`node --test tests/recovery-training.test.cjs tests/war-care.test.cjs tests/training-templates.test.cjs tests/online-realm-expansion.test.cjs tests/governance.test.cjs tests/economy-budget.test.cjs`

退出0，实际输出：

```text
ℹ tests 91
ℹ suites 0
ℹ pass 91
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 8407.688208
```

`node --check engine.js`、`node --check tests/recovery-training.test.cjs`、`node --check supabase/functions/_shared/game-runtime.mjs` 和 `git diff --check` 均退出0。

运行时重建命令：`node scripts/build-online-runtime.cjs`。

```text
Built isolated online runtime from 51 source files (973987f8421a).
```

遵从本轮控制代理要求，没有重跑全套；首轮基线全套通过证据保留在上文，本轮验证为91项定向回归。

### 自查

- 恢复优先两条原 `tickCity` 路径都移出治疗和目标补兵，真实动作在同一后付薪阶段依次执行。
- 后付薪阶段逐城激活/捕获，最后恢复原选择城市；已完成离线队列继续正常兑现，离线不新开训练。
- 没改工资计算或账本，不双计欠薪、不跨城支取黄金；旧自动治疗和已有联机手动治疗测试通过。
- 仅提交引擎、新增测试和生成运行时这三个文件；控制代理的规划、QA及数值脚本未加入。
- 无新增正确性疑虑，手机与正常经济集成QA仍由控制代理安排。
