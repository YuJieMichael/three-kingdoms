# Task 6 · 三项兵种配合实战演练

工作区：`/Users/lihuazeng/.codex/worktrees/nanman-campaign/superpower`；分支 `feat/classic-strategy-depth`；实现基线 `ced75e0`。

## 改动与边界

- 新增 `shield_archer`、`spear_block_cavalry`、`siege_gate` 三项固定阵容，兵种属性来自原有单位表，沿用 `Game.lessonRound` → `resolveBattleRound`，不另造胜负模拟。原 `spear_cavalry` ID、固定阵容、旧结果逻辑均保留，旧观察型课程照旧。
- 盾护弓使用「盾阵承箭」「弓阵还射」；枪阻骑记录实际长枪打骑兵伤害；器械破城记录「冲车撞门」「城门已破」。观测来自真实 `currentRoundSummary.events`，只存在演练会话，不写正式存档。
- 新课不会在发现一次战术作用后提前结束；需存活兵队、敌军清空、城门破除、所需实际事件及盾/枪课弓队仍存活，才能目标达成。真实未清场时，传入 `won=true` 也不能让零回合或存活守军成为胜利。
- 河洛门课复用现有 `luo_gate` 实际守军、18000 门耐久、箭楼、城防掩护与冲车规则。新课不带投石车：调试证实原投石车提前破门，会让冲车没有撞门事件；旧 `siege_guard` 的投石车保持原样。
- 新课三行「目的 / 操作 / 失误提示」始终可见，继续复用逐队向前/坚守/后退、目标和下一回合控件。显示已观察事件，回合结束后给出具体重试提示，按钮/选择器最小 44px。
- 正式配兵新增本方用途，仅读 `ManualData.units.role`；ManualData 公布原引擎已有三项克制表（枪→骑1.6、骑→弓1.65、弓→盾0.5），不改基础属性或实际结算常数。敌军提示仅依据公开章节或有效侦察的兵种，未知目标不读取隐藏 army，不预测胜率/战损。
- 无存档字段或永久进度新增，无军队、资源、经验、声望、装备、掉落、英雄奖励。全量正式 state 与存储原始字节在演练成功/失败前后均严格相同。

## 文件

`tactical-lessons.js`、`engine.js`、`manual-data.js`、`battle-tactics-ui.js`、`combat-ui.js`、`web-edition-ui.js`、`web-edition.css`、`tests/combined-arms-lessons.test.cjs`、重新生成的 `supabase/functions/_shared/game-runtime.mjs`。

没有新增全局脚本文件，不需要扩大 index/测试脚本清单；无版本号、发布、推送或合并改动。控制器拥有的未暂存设计、总计划、QA、截图和数值脚本不纳入本提交。本报告保存在被忽略的 `.superpowers` 路径作为交付记录，不纳入源码提交。

## RED / GREEN

首次仅加测试、未改产品代码：12项中1项旧课通过、11项预期失败（新课返回「演练不存在」、用途 API 不存在、界面无新课）。日志明确验证测试因缺失实现失败。

实现并定位冲车观测问题后，定向 `node --test tests/combined-arms-lessons.test.cjs tests/tactical-lessons.smoke.test.cjs`：20/20通过（15项新测试，5项既有演练测试）。涵盖真实成功/失败控制、实际射击/克制/撞门事件、正式资源/兵力/XP及全存档字节守恒、零回合防伪胜利、观测后不提前结束、旧ID兼容、未知army抛错getter与已知兵种渲染、静态可见提示与44px规则。

六个改动 JS `node --check` 全通过；`node scripts/build-online-runtime.cjs` 成功（52源文件，hash `cc0557269160`）；`git diff --check` 通过。

全量 `npm test` 仅运行一次：1070/1070通过，0失败/0跳过，耗时69.507秒；也覆盖Task5修复。完整日志 `/tmp/classic-task6-npm-test.log`。

## 可重复的实际操作

调用 `Game.startTacticalLesson(id)`；每次 `Game.lessonRound()`，直到 `Game.currentBattle().finished`，最多30回合。`Game.lessonOrder(index,command)` 使用实际 player 索引，`lessonAllOrders(command)` 为全队指令。

| 课 | 推荐操作 | 实际结果（seed71） | 失败对照 | 实际结果 |
|---|---|---|---|---|
| shield_archer | 默认盾/弓坚守 | 4回合真赢、目标达成、弓HP5856 | 盾后退、弓向前 | 30回合未赢、目标未达、弓HP0 |
| spear_block_cavalry | 默认枪/弓坚守 | 3回合真赢、目标达成、弓HP7500 | 枪后退、弓向前 | 6回合败、目标未达、弓HP0 |
| siege_gate | 默认各队向前 | 17回合真赢、目标达成、门HP0 | 各队坚守 | 30回合未赢、目标未达、门HP18000 |

攻城11回合实际冲车撞门、12回合破门；12回合后守军尚存，继续至17回合真实胜利。盾/枪课虽在1/2回合已有观测，仍继续至真正胜负。

## 自审与限制

- 新分支明确限定三课；旧分支结果与旧课动作保持原逻辑，既有演练测试通过。未改变NPC默认开关、正式战斗快照格式、来源城市、奖励和其它系统。
- 正式存档无新字段，不引入迁移/严格校验的永久状态；演练本身不持久化，reload/离开仍按既有行为清空。
- 观测以回合事件为依据，不只看进入、回合数、日志文案或宣称胜利；战术目标和胜负为两个明确条件，失败对照在真实结算下成立。
- 手游布局目前由静态访问性规则与原有控件确认；控制器独立进行390/440/844截图与正常获得的旧档复验，本报告不声称 iPhone Safari 真机验证完成。
- 本模块公布的克制表复制现有结算规则；今后若改克制数值，应同步 ManualData 与真实结算。本任务没有改变现有克制计算。

交付提交：`6813547b2bb650c6d93065546fe074c7d7cce79e`（9个任务文件）。提交后仅控制器原有未暂存文件保留。未推送、未合并、未改版本。
