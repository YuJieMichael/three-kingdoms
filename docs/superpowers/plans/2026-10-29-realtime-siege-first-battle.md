# 山河策实时攻城首战实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在现有城建网页中加入一场可由主将和 24 人刀盾兵团共同攻克的实时攻城副本，完成演练、正式出征、恢复、结算和返回城池。

**Architecture:** 独立 Canvas 2D 战场，DOM 承担入口、HUD 与结算。纯模拟层以固定步长处理命令、碰撞和胜负；引擎适配层独占后方状态写入，渲染层只读快照。沿用现有全局脚本和存档锁，不复用回合战的 finishBattle。

**Tech Stack:** 原生 JavaScript、HTML、CSS、Canvas 2D，Node 内置 node:test 与 vm；无新增运行时依赖、无打包。浏览器验收使用当前可用自动化工具和真实 iPhone Safari。

**Spec:** `design/quick-specs/2026-10-29-realtime-siege-design.md`，用户已于 2026-10-29 确认。本文为待审阅计划，尚未开始产品实现。

## Global Constraints

- 保留城建作为后方；首版单人对 AI，一张地图、一名主将、一支刀盾兵团。
- 逻辑地图 2400 × 1600；我方 1 + 24，敌方 12 + 8 + 16，共 61 个角色实体。
- 主将基础生命 1200、速度 180；普攻 50／0.55 秒／75 半径／90 度／最多 3 目标；旋斩 90／110 半径／10 秒冷却。
- 闪避 120 位移／0.25 秒／3 秒冷却，前 0.15 秒免伤，不可穿墙。
- 刀盾兵生命 160、速度 110、攻击 16、间隔 1 秒、距离 28；6 列 × 4 排；跟随距离 100、归队边界 150、坚守追击边界 70。
- 坚守正面 120 度箭伤降低 50%；冲锋速度 220、最长 3 秒或 360 单位、首次撞击 32、冷却 15 秒。
- 近战敌生命 130、速度 90、攻击 14、间隔 1.2 秒；弓手生命 90、射程 350、伤害 12、间隔 2 秒；近战防区追击边界 220。
- 城门耐久 4000；占领半径 130，占满 20 秒；10 分钟超时，同步死亡优先于占领胜利。
- 正式出征校场 1 级、24 名 shield、100 粮食、可用武将；胜利粮食 300、黄金 200；阵亡永久损失；副本不改变世界地图归属。
- 勇武攻击倍率 clamp(1 + (勇武 − 50) × 0.002, 0.9, 1.2)；统率兵团生命倍率同式；冻结其余未接入战场的加成。
- 演练不扣资源、不发奖励、不写成长；新档可直接进入演练。
- 逻辑 30 Hz；单帧追赶最多 5 步；每 5 秒模拟时间保存检查点；后台、失锁、竖屏暂停，返回后手动继续。
- 首版桌面与手机横屏均可完成操作；触控按钮至少 48 CSS 像素。
- 新增字段迁移与严格校验；界面读取不能改存档；返兵、发奖与战报每场只结算一次。
- 新脚本同步 index.html 与六处测试脚本清单；改 engine.js 及前序脚本后重建在线运行时。
- 推送前 npm test 全通过；合并发布须负责人明确说“合并／发布”；本计划不包含自动上线。

## Review Focus

1. 多指操作后收到 pointercancel、失焦或旋屏：主将不继续移动、命令不会误触普攻。任务 7 覆盖。
2. 检查点写入异常与另一标签接管同时发生：旧页停止且不能覆盖新档。任务 6 覆盖。
3. 战斗期间切城、调将或断粮：原城占用不丢失，兵不重复耗粮，也不转入其他城。任务 5、6 覆盖。
4. 路径不可达、城门变化和大量单位挤门：明确失败反馈或可继续移动，不能隔墙攻击。任务 2、4 覆盖。
5. 占领完成、主将倒地与超时同一步发生：死亡优先，且结算始终只有一份。任务 4、6 覆盖。

## 文件与接口约定

以下路径均相对仓库根目录。模块名使用 `SiegeRTData`、`SiegeRTNavigation`、`SiegeRTSimulation`、`SiegeRTSystem`；界面安装函数为 `installSiegeRTUI()`。具体接入位置用函数锚点，避免依赖会变化的行号。

| 文件 | 职责 |
| --- | --- |
| 新增 siege-rt-data.js | 常量、地图、障碍、初始部队和规则版本 |
| 新增 siege-rt-navigation.js | 网格、通路、阵位与局部分离 |
| 新增 siege-rt-simulation.js | 战斗快照、命令、固定步推进及事件 |
| 新增 siege-rt-system.js | 根存档迁移校验、占用与纯事务草案 |
| 新增 siege-rt-view.js | Canvas、镜头、输入转换、固定步调度 |
| 新增 siege-rt-ui.js、siege-rt.css | 入口、HUD、触控、暂停和结算 |
| 修改 engine.js | 保存、锁、原城作用域、兵粮与将领互斥适配 |
| 修改 manual-ui.js、app.js、index.html | 校场与演练入口、页面生命周期及加载 |
| 新增 tests/helpers/siege-rt.cjs | VM 加载、快照夹具与固定步运行 |
| 新增 tests/siege-rt-*.test.cjs | 下述数据、寻路、战斗、目标、接入、存档与输入测试 |
| 新增 assets/siege-rt/ | 可独立部署的二维战场素材、音效与来源说明 |
| 新增 production/qa/realtime-siege-first-battle.md | 自动验证、人工试玩与性能证据 |

持久化根结构：`realtimeSiege = {schema:1, active:null|Run, receipts:Receipt[], reports:Report[]}`。旧档补为此空结构。演练 Run 只存在界面内存，不加入这个字段。已结算凭据永久保留 battleId，报告保留最近 50 条；不因截断报告而删除去重凭据。

`Run` 包含 `battleId, rulesVersion, sourceCity, generalId, generalSnapshot, reservedArmy:{shield:24}, startedAt, status, simulation, checkpointTick`。`status` 为 reserved/running/paused/pendingSettlement；settled 后由 Receipt 表示且清空 active。`simulation` 包含 tick、单位、投射物、门、据点、命令、冷却和结果。所有计时使用整数逻辑 tick；0.55 秒等不能整除的时长向上取整至下一 tick，并测试其误差小于 1/30 秒。

`Command` 判别字段为 type：moveHero（归一化方向）、aim（角度）、attack（按住布尔）、dodge、skill、follow、moveSquad（目标点）、hold、charge（目标点）、retreat。只在逻辑步边界消费队列；同一 tick 先应用输入，后运动、攻击、死亡及目标判定。

模拟接口：`create({mode, generalSnapshot, seed}) -> Simulation`；`step(sim, commands) -> {state, events}` 返回新快照，不修改输入。`step` 内固定推进 1/30 秒，无外部 dt。`view` 层拥有模拟引用，正式模式通过 Game 的 checkpoint 接口持久化，不直接写 Game.state。

系统事务接口：`init(root) -> void` 仅用于加载迁移；`valid(root, api) -> boolean` 只读；`quote(root, request, api) -> Quote` 只读；`prepareStart(root, request, api) -> Result<Draft>`；`prepareCheckpoint(root, id, sim, api) -> Result<Draft>`；`prepareSettlement(root, id, api) -> Result<Draft>`。`Result` 为 `{ok:true,draft,value}` 或 `{ok:false,error}`；失败不能改变 root。api 提供 now、newId、city、hero、heroCity、busy、role、capacity、upkeep、enabled。系统从已保存 simulation 计算结算，不能接收任意奖励或死亡人数。

Game 对外接口：`siegeRTQuote(request)`、`startSiegeRT(request)`、`checkpointSiegeRT(id,sim)`、`settleSiegeRT(id)`、`siegeRTView()`、`canRunSiegeRT()`。变更接口返回 `{ok,value?,error?}`；`siegeRTView()` 返回副本拷贝。request 为 `{generalId}`，原城由引擎当前城确定。共享世界模式全部拒绝正式调用。

---
## 关键测试写法

沿用 node:test、node:assert/strict 与 vm 夹具；以下断言分别放入任务 1、4、6 的命名测试中。测试夹具只构造输入，不复制被测战斗或奖励算法。

```js
// 数据与倍率边界（任务 1）
assert.equal(SiegeRTData.rules.gateHP, 4000);
assert.equal(SiegeRTData.rules.squadSize, 24);
assert.equal(SiegeRTSimulation.create({mode:'drill', generalSnapshot:{valor:50, leadership:50}, seed:1}).units.length, 61);

// 同步终局优先级（任务 4）：夹具设置门已破、占领差 1 tick、主将受到致死命中
const result = SiegeRTSimulation.step(simultaneousEndFixture, []);
assert.equal(result.state.result.reason, 'hero_dead');
assert.equal(result.state.result.won, false);

// 结算去重（任务 6）：先成功结算同一 battleId，再重复结算
assert.equal(Game.settleSiegeRT(battleId).ok, true);
const saved = JSON.stringify(Game.state);
assert.equal(Game.settleSiegeRT(battleId).ok, true);
assert.equal(JSON.stringify(Game.state), saved);
```

快照里的 generalSnapshot 使用规范化字段 valor、leadership；引擎适配层读取现有 general() 字段后转换，不能要求旧存档新增同名武将属性。重复 settle 返回已保存的 receipt 并且不再次 tick 经济或保存。

### Task 1: 规则与快照契约

**Files:** 新增 siege-rt-data.js、siege-rt-simulation.js、tests/helpers/siege-rt.cjs、tests/siege-rt-data.test.cjs；本任务暂不修改页面加载。

**Interfaces:** 产生 SiegeRTData.rules/map、SiegeRTSimulation.create({mode,generalSnapshot,seed}) 和上述 Simulation/Command 结构；后续任务消费固定实体 ID、阵营、pos、hp、facing、cooldowns。

- [ ] **步骤 1：写失败测试。** 数据断言：地图为 2400×1600，玩家 24 shield、敌人 36、总实体 61；门血 4000；两次 create 同输入深相等；修改返回快照不能改原始规则；勇武 0/50/200 时倍率分别 0.9/1/1.2；计时取整误差小于 1/30 秒。
- [ ] **步骤 2：运行并确认失败。** `node --test tests/siege-rt-data.test.cjs`；预期新接口未实现或指定断言失败，不能把夹具/路径错误当作有效失败。
- [ ] **步骤 3：最小实现。** 定义冻结配置与地图：外营、可达箭台、封闭墙体、城门碰撞、占领区。每个出生点必须位于合法区域。通用主将模板明确映射现有武将属性字段，数值缺失时迁移为 50，非法输入在 valid 拒绝。
- [ ] **步骤 4：运行同一命令确认通过。** `node --test tests/siege-rt-data.test.cjs`；预期全部通过、退出码 0。对修改的 JS 另运行 `node --check <实际文件>`。
- [ ] **步骤 5：提交本任务。** 只暂存本节列出的文件与必要生成物，先 `git diff --cached --check`，再 `git commit -m "feat: define real-time siege rules and snapshots"`；不包含工作区其他变动。

### Task 2: 可达路径、阵位与碰撞

**Files:** 新增 siege-rt-navigation.js、tests/siege-rt-navigation.test.cjs。

**Interfaces:** 消费任务 1 地图；产生 build(map,gateOpen)、path(nav,from,to)->Point[]|null、slots(center,facing,aliveIds)->Slot[]、move(nav,body,delta)->Point。Point 为 {x,y}，Slot 为 {id,x,y}。

- [ ] **步骤 1：写失败测试。** 封门时城外到城内 path 为 null，开门后非空；斜向不穿障碍角；主将闪避线段不能跨墙；24 阵位 ID 唯一且为 6×4；同种子多单位移动结果一致；不可达目标返回 null，传入 NaN/Infinity 返回错误而非循环。
- [ ] **步骤 2：运行并确认失败。** `node --test tests/siege-rt-navigation.test.cjs`；预期新接口未实现或指定断言失败，不能把夹具/路径错误当作有效失败。
- [ ] **步骤 3：最小实现。** 采用 40 单位网格、确定性 A* 与网格邻接；移动增加圆形半径的障碍膨胀，最后一段扫掠碰撞；队形压窄过门并局部分离。每单位每 15 tick 最多重规划一次，门状态变化立即作废旧路径。
- [ ] **步骤 4：运行同一命令确认通过。** `node --test tests/siege-rt-navigation.test.cjs`；预期全部通过、退出码 0。对修改的 JS 另运行 `node --check <实际文件>`。
- [ ] **步骤 5：提交本任务。** 只暂存本节列出的文件与必要生成物，先 `git diff --cached --check`，再 `git commit -m "feat: add siege navigation and formation slots"`；不包含工作区其他变动。

### Task 3: 主将与士兵实时交战

**Files:** 修改 siege-rt-simulation.js；新增 tests/siege-rt-combat.test.cjs。

**Interfaces:** 消费任务 1、2；产生 step(sim,commands)->{state,events}，events 为 {type,entityId?,targetId?,pos?,amount?}；测试和渲染通过事件做命中、死亡与音效反馈。

- [ ] **步骤 1：写失败测试。** 普攻最多命中前方最近 3 个目标且每次一次；1 秒长按不按渲染帧重复伤害；旋斩同一目标一次 90；闪避前 0.15 秒免伤且 3 秒内不可重放；死亡不再攻击；箭矢撞墙消失；坚守正面箭伤 6、侧面 12；跟随归队、移动到点坚守、坚守不越 70、冲锋首次 32 且不可叠加普攻；同距目标按 ID 稳定选择。
- [ ] **步骤 2：运行并确认失败。** `node --test tests/siege-rt-combat.test.cjs`；预期新接口未实现或指定断言失败，不能把夹具/路径错误当作有效失败。
- [ ] **步骤 3：最小实现。** 按输入→移动→攻击→死亡顺序拆成内部小函数，使用空间网格查邻居。实现跟随/移动/坚守/冲锋四态及中断、冷却，近战敌防区 220、固定弓手与投射物。冲锋击退定为 20 单位并受障碍截断；箭速定为 500 单位/秒，这两项是设计未给数值的实现默认，集中配置便于调校。
- [ ] **步骤 4：运行同一命令确认通过。** `node --test tests/siege-rt-combat.test.cjs`；预期全部通过、退出码 0。对修改的 JS 另运行 `node --check <实际文件>`。
- [ ] **步骤 5：提交本任务。** 只暂存本节列出的文件与必要生成物，先 `git diff --cached --check`，再 `git commit -m "feat: implement hero combat and squad commands"`；不包含工作区其他变动。

### Task 4: 攻城目标与可重复战斗验证

**Files:** 修改 siege-rt-simulation.js、siege-rt-navigation.js；新增 tests/siege-rt-objectives.test.cjs、tests/balance/realtime-siege.cjs。

**Interfaces:** 消费 step；增加 result:null|{won,reason,endedTick}，reason 为 captured/hero_dead/timeout/retreat；门归零发 gate_open 事件，终局不再推进。

- [ ] **步骤 1：写失败测试。** 门从正血降到 0 仅开一次且刷新路径；城门未破不占领；无人或敌我同在时保留进度；无敌且我方在场 600 tick 获胜；18000 tick 超时；同 tick 倒地/占满/超时判 hero_dead；兵团全灭主将仍能行动；终局重复 step 不发新结果。
- [ ] **步骤 2：运行并确认失败。** `node --test tests/siege-rt-objectives.test.cjs && node tests/balance/realtime-siege.cjs`；预期新接口未实现或指定断言失败，不能把夹具/路径错误当作有效失败。
- [ ] **步骤 3：最小实现。** 实现门受击、占点和判定优先级。平衡脚本输出固定 seed 的不操作、只主将、跟随正面、坚守引敌后侧击四组结果、门破时间及损失；至少证明不操作不能通关、存在合法可通关输入轨迹。5–8 分钟仍须真人试玩，脚本胜利不能替代乐趣验收。加入 24 人反复过门测试：发移动命令后 30 秒内所有未受敌阻挡的存活兵通过，不能隔墙命中。
- [ ] **步骤 4：运行同一命令确认通过。** `node --test tests/siege-rt-objectives.test.cjs && node tests/balance/realtime-siege.cjs`；预期全部通过、退出码 0。对修改的 JS 另运行 `node --check <实际文件>`。
- [ ] **步骤 5：提交本任务。** 只暂存本节列出的文件与必要生成物，先 `git diff --cached --check`，再 `git commit -m "feat: complete siege gate capture and battle outcomes"`；不包含工作区其他变动。

### Task 5: 正式出征与后方资源事务

**Files:** 新增 siege-rt-system.js、tests/siege-rt-integration.test.cjs；修改 engine.js 的迁移、validSave、generalBusy、rates、原城作用域与公开 API；修改六处测试脚本清单及 index.html 的规则加载段。

**Interfaces:** 实现 init/valid/quote/prepareStart/prepareSettlement 与 Game 的 quote/start/view/settle 接口；消费快照结果；所有草案提交使用 CitySystem.capture 与现有 save() 的回滚模式。

- [ ] **步骤 1：写失败测试。** 不足 24 人、粮食 99、校场 0、任职/异城/在途将领、已有其他交战均拒绝；合法出征 shield 减 24、粮减 100、锁将；点击 quote/view 前后 state JSON 相同；切城后胜利只向原城返幸存者并发 300 粮/200 金；仓库不足报告实际入库与溢出；失败不发奖；演练不修改正式存档；旧任务计数和地图归属不变。
- [ ] **步骤 2：运行并确认失败。** `node --test tests/siege-rt-integration.test.cjs tests/cities-logistics.smoke.test.cjs tests/city-defense.test.cjs tests/battlefield-state.test.cjs tests/battlefield-combat.test.cjs`；预期新接口未实现或指定断言失败，不能把夹具/路径错误当作有效失败。
- [ ] **步骤 3：最小实现。** 从 existing units.shield 和 general() 快照映射，正式出征直接入场，不调用 dispatch/startBattle/finishBattle。将占用兵纳入原城耗粮一次，并排除断粮逃兵处理；武将位置保留原城、busy 增加 run 占用。rates 对其他城市使用对应 scope。拦截副本占用将领的任职、物流、其他战斗和出发城删除入口。清单为 tests/helpers/game.cjs、tests/city-defense.test.cjs、tests/office-promotion.test.cjs、tests/save-session.test.cjs、tests/named-city.test.cjs、tests/city-strategy.smoke.test.cjs，规则模块按 data→navigation→simulation→system→engine 顺序。
- [ ] **步骤 4：运行同一命令确认通过。** `node --test tests/siege-rt-integration.test.cjs tests/cities-logistics.smoke.test.cjs tests/city-defense.test.cjs tests/battlefield-state.test.cjs tests/battlefield-combat.test.cjs`；预期全部通过、退出码 0。对修改的 JS 另运行 `node --check <实际文件>`。
- [ ] **步骤 5：提交本任务。** 只暂存本节列出的文件与必要生成物，先 `git diff --cached --check`，再 `git commit -m "feat: connect siege deployment and settlement to cities"`；不包含工作区其他变动。

### Task 6: 检查点、去重结算和锁恢复

**Files:** 修改 siege-rt-system.js、engine.js；新增 tests/siege-rt-save.test.cjs；扩展 tests/save-session.test.cjs。

**Interfaces:** 实现 prepareCheckpoint、Game.checkpointSiegeRT 和 canRunSiegeRT；valid 校验 active/receipts/reports 交叉约束；UI 后续消费 checkpoint 的错误与暂停原因。

- [ ] **步骤 1：写失败测试。** 旧档迁移为空且再次迁移幂等；拒绝负数、无穷、重复 ID、越界坐标、错误门状态、兵数不守恒与非支持 rulesVersion；模拟每 150 tick 保存；刷新停在最近检查点并暂停；同 battleId settle 两次只返兵领奖一次；第一次写失败保持 pending，重试仅一份；旧标签失锁后检查点被拒；接管重读而非覆盖；切城/断粮/暂停一小时后占用和耗粮仍正确。
- [ ] **步骤 2：运行并确认失败。** `node --test tests/siege-rt-save.test.cjs tests/save-session.test.cjs tests/siege-rt-integration.test.cjs`；预期新接口未实现或指定断言失败，不能把夹具/路径错误当作有效失败。
- [ ] **步骤 3：最小实现。** 在克隆草案内完成扣粮、归兵、奖励、战报和 receipt，再原子替换并保存；失败恢复已保存状态，保留当前待结算快照供同页重试。合法恢复从未结算 active 开始；simulation 缺失但占用元数据合法时仅允许按最后可证实兵力撤退：初始检查点未成功禁止 start 生效，后续损坏按最近有效备份恢复，不能凭空重建存活兵。无法恢复有效快照时保留原档并提示导入备份，禁止自动返兵。此处是设计中“无有效检查点撤退”的安全收紧，须在计划审阅时一并确认。
- [ ] **步骤 4：运行同一命令确认通过。** `node --test tests/siege-rt-save.test.cjs tests/save-session.test.cjs tests/siege-rt-integration.test.cjs`；预期全部通过、退出码 0。对修改的 JS 另运行 `node --check <实际文件>`。
- [ ] **步骤 5：提交本任务。** 只暂存本节列出的文件与必要生成物，先 `git diff --cached --check`，再 `git commit -m "feat: persist siege checkpoints and idempotent results"`；不包含工作区其他变动。

### Task 7: Canvas 战场与桌面、触控输入

**Files:** 新增 siege-rt-view.js、tests/siege-rt-input.test.cjs、tests/siege-rt-loop.test.cjs。

**Interfaces:** 产生 SiegeRTView.mount(container,{getState,onCommands,onPause,onCheckpoint})->{destroy(),resetClock(),render()}；消费 task 3 events 与 Game.canRunSiegeRT。输入转换纯函数 mapPointer/mapKeys 输出 Command，DOM 监听单独负责坐标与生命周期。

- [ ] **步骤 1：写失败测试。** 模拟 60 与 30 FPS 得相同逻辑 tick 和战果；一帧 1 秒最多 5 步且记录丢弃时间；暂停恢复不追赶；canvas CSS 缩放/DPR 改变后选点映射仍正确；冲锋选点左键不普攻、右键取消；pointercancel/失焦清空移动与攻击；双指摇杆与攻击互不吞事件；destroy 后零残留监听与 RAF。
- [ ] **步骤 2：运行并确认失败。** `node --test tests/siege-rt-input.test.cjs tests/siege-rt-loop.test.cjs`；预期新接口未实现或指定断言失败，不能把夹具/路径错误当作有效失败。
- [ ] **步骤 3：最小实现。** 固定步 accumulator，绘制插值且不改 sim；镜头限制地图边界。桌面 WASD、鼠标左攻右移、空格闪避、Q 技能、1 跟随、2 坚守、3 冲锋、Esc 暂停。手机 Pointer Events 分配指针 ID，摇杆与按钮分区；普通攻击只选择有效范围最近目标。resize/方向变化重算坐标，竖屏、pagehide、visibilitychange、失锁触发暂停，恢复必须手动 continue。
- [ ] **步骤 4：运行同一命令确认通过。** `node --test tests/siege-rt-input.test.cjs tests/siege-rt-loop.test.cjs`；预期全部通过、退出码 0。对修改的 JS 另运行 `node --check <实际文件>`。
- [ ] **步骤 5：提交本任务。** 只暂存本节列出的文件与必要生成物，先 `git diff --cached --check`，再 `git commit -m "feat: render siege battlefield and normalize player input"`；不包含工作区其他变动。

### Task 8: 入口、HUD 与完整试玩闭环

**Files:** 新增 siege-rt-ui.js、siege-rt.css、tests/siege-rt-ui.test.cjs；修改 manual-ui.js 的 manualDrill、app.js 导航及 index.html 样式/界面加载。

**Interfaces:** 产生 installSiegeRTUI()；消费 Game API 和 SiegeRTView.mount。演练直接调用 Simulation.create，仅保存在局部；正式状态只用 Game.siegeRTView() 投影。

- [ ] **步骤 1：写失败测试。** 新档从主导航可演练；校场显示演练/正式及不足原因；预览正确显示冻结属性与成本；正式完结只有一次结果菜单；演练重试无资源改动；离开未结算副本须先暂停，撤退确认后走正常结算；只读页能看但不能恢复正式战场；共享模式禁用正式入口；恢复检查点不自动开打。
- [ ] **步骤 2：运行并确认失败。** `node --test tests/siege-rt-ui.test.cjs tests/siege-rt-input.test.cjs tests/siege-rt-save.test.cjs`；预期新接口未实现或指定断言失败，不能把夹具/路径错误当作有效失败。
- [ ] **步骤 3：最小实现。** HUD 显示主将 HP、24 人存活、门耐久、占点、命令、冷却和倒计时；新增首次教学动作标记仅保存在本次 sim。按钮至少 48px 且适配安全区；手机竖屏遮罩暂停。结果列出幸存/损失、原城、实际奖励/溢出及保存状态，保存未成功不能出现已领奖文案。资源和数值不显示为可重复领取按钮。
- [ ] **步骤 4：运行同一命令确认通过。** `node --test tests/siege-rt-ui.test.cjs tests/siege-rt-input.test.cjs tests/siege-rt-save.test.cjs`；预期全部通过、退出码 0。对修改的 JS 另运行 `node --check <实际文件>`。
- [ ] **步骤 5：提交本任务。** 只暂存本节列出的文件与必要生成物，先 `git diff --cached --check`，再 `git commit -m "feat: add playable siege entry HUD and result flow"`；不包含工作区其他变动。

### Task 9: 战场素材、声音与反馈

**Files:** 新增 assets/siege-rt/manifest.json、素材文件及来源说明；修改 siege-rt-view.js、siege-rt-ui.js；新增 tests/siege-rt-assets.test.cjs。

**Interfaces:** manifest 按 terrain/wall/gate/tower/hero/shield/melee/archer/effects/audio 声明资源、帧与许可来源；view 消费 hit/death/gate_open/capture/charge 事件，资源缺失有简化图形回退。

- [ ] **步骤 1：写失败测试。** manifest 引用全部存在、帧区域在图片范围内；静音偏好可保存但不污染正式战果；同一命中事件不重复播放；图片/音频加载失败仍能完整战斗；禁震动设置取消镜头震动；按阵营轮廓和图标而非仅颜色区分。
- [ ] **步骤 2：运行并确认失败。** `node --test tests/siege-rt-assets.test.cjs tests/siege-rt-loop.test.cjs`；预期新接口未实现或指定断言失败，不能把夹具/路径错误当作有效失败。
- [ ] **步骤 3：最小实现。** 制作或复用能正确表达俯视朝向的原创建筑、人物与效果；卡牌头像只用于 HUD。实际生成图片时才读取 imagegen 技能。补充挥击、弓箭、冲锋、破门和占点反馈；特效池最多 128、同时音效最多 8，首次交互解锁音频；不可用音频不阻断输入。
- [ ] **步骤 4：运行同一命令确认通过。** `node --test tests/siege-rt-assets.test.cjs tests/siege-rt-loop.test.cjs`；预期全部通过、退出码 0。对修改的 JS 另运行 `node --check <实际文件>`。
- [ ] **步骤 5：提交本任务。** 只暂存本节列出的文件与必要生成物，先 `git diff --cached --check`，再 `git commit -m "feat: add readable siege art audio and impact feedback"`；不包含工作区其他变动。

### Task 10: 回归、性能与交付验收

**Files:** 新增 production/qa/realtime-siege-first-battle.md 及 evidence/realtime-siege-first-battle/；修改 README.md 功能说明；重建 supabase/functions/_shared/game-runtime.mjs 及构建器实际生成文件。

**Interfaces:** 消费完整产品；输出自动验证记录、脚本平衡报告、桌面/手机证据和已知问题；通过才形成待审阅分支。

- [ ] **步骤 1：写失败测试。** 测试须证明原有城建/出征仍通过、规则与生成运行时一致；真人分别完成获胜、倒地、全灭后续战、超时、撤退；真实浏览器两标签验证失锁和接管；实机旋屏/后台返回暂停；满编连续 10 分钟采集帧耗时与内存趋势。
- [ ] **步骤 2：运行并确认失败。** `node scripts/build-online-runtime.cjs && npm test && node tests/balance/realtime-siege.cjs && git diff --check`；预期新接口未实现或指定断言失败，不能把夹具/路径错误当作有效失败。
- [ ] **步骤 3：最小实现。** 记录每条命令退出码与输出。桌面 1440×900 目标 60 FPS，iPhone 17 Pro Max Safari 横屏目标稳定 30 FPS 以上；报告实测设备、P50/P95 帧耗时、卡顿、内存采样，不以 VM 代替实机性能。截图优先手机横屏战场与竖屏暂停，再桌面；无真机则标记该项未验收，不宣称完成发布验收。版本只在准备发布时按仓库规则统一更新 package.json、index.html 所有 ?v= 与 README；本阶段不擅自合并上线。
- [ ] **步骤 4：运行同一命令确认通过。** `node scripts/build-online-runtime.cjs && npm test && node tests/balance/realtime-siege.cjs && git diff --check`；预期全部通过、退出码 0。对修改的 JS 另运行 `node --check <实际文件>`。
- [ ] **步骤 5：提交本任务。** 只暂存本节列出的文件与必要生成物，先 `git diff --cached --check`，再 `git commit -m "test: verify real-time siege integration and playtest evidence"`；不包含工作区其他变动。

## 执行前检查与依赖顺序

- [ ] 阅读已批准设计、根 AGENTS.md 和当前工作区规则；确认本计划审阅通过与执行方式已选定。
- [ ] 先用 list_artifacts 查已有适用工作树。当前设计分支为 design/realtime-siege-first-battle，设计提交为 0c2c8cd。现有下载曾中断，工作区有大量未检出文件；这是代理创建的新克隆，不可把这些删除带进提交。用独立完整 checkout 或在确认没有用户编辑后恢复缺失文件，再做基线测试；禁止从残缺工作区直接实施。
- [ ] 对当前基线运行 npm test，保存结果；已有失败先定位，不能把新增失败归为历史问题。
- [ ] 查图谱：本次 git tree 未包含 graphify-out/graph.json。实施时如复用带图谱的原工作区，按 graphify 技能先用图谱现有词汇作定向查询，再直接核对 engine 的迁移/保存、generalBusy、rates、战斗互斥及归兵调用点。无图谱时记录缺失并用源码检索；不为写计划重建或上传整个图谱。
- [ ] 任务 5 已核对现有剧本战场测试名称为 tests/battlefield-state.test.cjs 与 tests/battlefield-combat.test.cjs；新增测试按本文路径创建。

依赖为 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10。优先串行落地，防止模拟快照、后方事务和画面各自形成不一致接口。任务 4 后得到可测试的纯战斗；任务 8 后得到可操作的完整首版；任务 10 后才满足交付验证。

## 覆盖自检

| 设计章节 | 实施任务 |
| --- | --- |
| 1–3 目标、方案和地图 | 1、2、4、8 |
| 4 操作和画面 | 7、8、9 |
| 5–6 主将、兵团和敌军 | 1、2、3 |
| 7 胜负和暂停 | 4、6、7、8 |
| 8 后方及奖励 | 5、6、8 |
| 9 状态与恢复 | 5、6 |
| 10 模块与性能 | 全部，重点 7、10 |
| 11 美术反馈 | 9 |
| 12 验收 | 各任务定向测试与 10 |

已检查接口命名、状态枚举、整数 tick、奖励守恒与任务依赖。没有运行产品测试：本次交付仅为实施计划。任务 6 对无法证实兵力的损坏存档采用保留数据并恢复备份，需随计划审阅确认；其余不改变已批准范围。

## 审阅与执行方式

建议由当前代理在本聊天串行实施，再进行一次整分支独立审查：任务之间共享模拟结构、存档占用和提交顺序，串行实施较容易保持一致，也能减少重复上下文成本。另一选择是逐任务由独立子代理实施和审查，审查更频繁但成本更高。

计划获确认并选定执行方式后再开始任务 1。实施完成提供可试玩结果、测试证据和手机截图；GitHub 合并发布另依仓库流程执行。
