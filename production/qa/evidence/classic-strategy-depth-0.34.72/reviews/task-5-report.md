# Task 5 — 可选开启的周边势力

状态：实现完成，定向49/49、唯一一轮全量1048/1048通过。

提交：5d7485d（feat: add opt-in nearby factions with frozen camp battles）。

基线：0319d76；工作分支 feat/classic-strategy-depth。未推送、合并、发布或改版本号。没有启动子代理。只修改本任务源文件/测试/脚本清单及生成运行时；控制器的规格、计划、QA、截图与正常经济模拟均未暂存。

## 实现

- 新增 `FactionSystem`，持久状态 `realm.factions={version:1,enabled:false,nextAt:0,seq:0,camps:[],last:null}`。旧档仅补关闭默认值；根对象、营地、冻结元数据、来源城与最后结算都有严格校验。全城来袭与活动守城快照逐城匹配，不只检查当前城市。
- 公共接口 `Game.factionView()`、`factionToggleQuote(enabled)`、`setFactionsEnabled(enabled,key)`；官府5级且至少一次出征胜利后可开启。报价含活动城、当前账本、解锁条件，重复、切城、只读或共享会话拒绝修改。
- 每6小时最多一次建立/推进，`nextAt=now+6h`；30天离线也只走一步。最多3营地；正在交战时不推进，已有势力来袭不追加。忙碌城市延后、无追赶积压；新营地至少整军6小时，再经15分钟真实时间预警。
- 本城6格圆形半径内按距离/ID择公开野地，排除已占领、固定地标、名将传闻、出征/驻军/斥候目标和既有营地。三势力按创建序号轮换，兵力固定为批准基数×5，不依据玩家兵力选弱营地。
- 只读 `getNode/getWorldTile` 叠加 `factionCamp` 与公开等级5，保留底层野地。来袭期间禁止新野战。出征冻结对应营地元数据、真实阵容；野战结算沿既有负重、粮金回执、伤兵、经验与返城流程，固定粮5000/金2500，不再叠加原野地随机资源包。原有装备/俘虏/进度奖励仍走原战斗规则。
- `NPCDefense.requestFaction` 使用独立 faction 元数据，不占用 RegionalFront。守城实际预留所选兵力，WarCare接收真实伤兵，奖励使用现有容量回执和防守经验公式。胜利仅移除对应营地，失败保留并整军6小时。关闭不撤回已冻结敌军。
- 势力推进以及相关出征、开战、回合、自动守城均接事务：内部保存延迟到同一次最终保存；失败恢复调用前完整状态，包含tick引起的变化、资源、兵力、伤兵、来袭、营地和回执。
- 新增简洁中文势力入口、营地地图徽记、来源城/时间卡片与守城入口，44px点击目标。预警详情仅按烽火台现有精度展示。UI已接入六份测试清单与HTML。

## 验证

- 第一轮 RED：`node --test tests/faction-system.test.cjs` 10/10失败，均为公共接口尚不存在。
- 第二轮 RED：增加活动战斗暂停、UI及跨城等覆盖；活动战斗时仍生成营地、缺UI均实际失败，随后修复。
- 第三轮 RED：完整同步伪造敌军数量/hp/maxHp仍能通过旧通用校验，新增测试证实失败，随后补冻结canonical阵容校验。
- 测试夹具修正：既有 `importSave` 成功返回undefined而非null；跨VM数组需序列化；UI已由helper加载，不应重复声明同一脚本。这些错误未通过更改生产行为规避。
- 最终定向：`node --test tests/faction-system.test.cjs tests/regional-front.test.cjs tests/city-defense.test.cjs` **49/49通过**，其中势力18项；日志 `/tmp/task5-focused.log`。
- 语法检查：engine.js、npc-defense.js、npc-data.js、faction-system.js、faction-ui.js、grid-world.js、app.js 全部通过。`git diff --check`通过。
- 已运行 `node scripts/build-online-runtime.cjs`，52个源文件，hash前缀 `ec62dd89ecba`。
- 全量：仅运行一次 `npm test`，**1048/1048通过，0失败**，退出0，耗时65.160秒；日志 `/tmp/task5-full.log`。

## 自查与边界

- 新状态默认关闭，浏览界面不写档；多人服务器运行时与共享客户端均不推进、不接受开关，已有势力战斗也不在共享模式暗结算。
- 来源城即使切走仍正确收到来袭；野战与守城不会同时结算同一营地；旧战斗/旧行军缺faction字段保留原规则。
- 初次单元测试使用明确标注的预置兵力，不能当作正常经济平衡证据。控制器独立验证种子1/7/19正常获得800弓的野战与守城、切城与关闭预警，报告由控制器持有，本报告不替代其数值验收。
- 控制器负责浏览器截图与独立审查；未声称实体iPhone验证。
- 无已知阻断问题；本任务不授权发布。

## 独立审查修复第 1 轮（基线 5d7485d）

状态：3 项 Important 与 1 项 Minor 均修复；本轮定向最终 122/122 通过。

修复提交：`4f03e70`（fix: preserve atomic faction dispatch and camp provenance）。

- Important 1：出征/野战/守城的六个相关公开动作，只要单机势力开启就从调用前进入完整事务；不再仅依据 tick 前目标是否已有营地决定。这样既覆盖首次创建营地的到期 tick，也覆盖执行中跨过六小时时刻的边界。实际最终存档写入失败时，营地、扣兵、行军、粮食与内存状态全部恢复，旧持久存档保持相同。
- Important 2：目标有活动营地时，缺少 faction 的活跃行军不再无条件通过。只有明确早于营地 createdAt 出发、来源与当前被校验城市一致的旧行军可继续；极旧档缺 sourceCity 采用所在城市作用域。旧战斗必须关联同城、同目标、同武将且仍处于 battle 阶段的旧行军。删除营地行军/战斗标记、替换弱守军、伪造相同创建时间或其他来源城均拒绝；原有旧行军和旧战斗阵容快照保持。
- Important 3：battleDropInfo 对势力营地返回道具/额外资源概率 0；campaignNodeDetails 与 classicTargetActions 实际详情统一说明固定粮食5000、黄金2500、幸存兵负重与允许爆仓，装备/俘虏保留现有规则，不再承诺商城道具、随机资源或掠夺 +30%。
- Minor：两套详情的掠夺和占领按钮均使用后端来袭阻止原因，来袭营地两个按钮同时禁用并显示原因。

### 本轮验证

- RED：先新增 5 项回归，旧生产代码下 18 通过、5 失败；日志 `/tmp/task5-fix-red.log`。实际重现到期 tick 后最终写入失败仍扣800弓、删除 provenance 可篡改、创建时间边界误放、随机掉落误报、掠夺按钮未禁用。
- GREEN：上述 5 项先转绿（23/23），再补旧 battle 和真实第二城来源边界；势力用例共24项。模拟最终写入失败时仅拒绝带 faction expedition 的实际主存档写入，不在 tick 前制造失败，并验证内存及 localStorage 主存档均保持原样。
- 最终命令：`node --test tests/faction-system.test.cjs tests/city-defense.test.cjs tests/regional-front.test.cjs tests/save-session.test.cjs tests/hero-leadership-snapshot.test.cjs tests/online-runtime-freshness.test.cjs tests/online-runtime.test.cjs`；**122/122 通过，退出0**，日志 `/tmp/task5-fix-final.log`。
- 所改 JS 与测试 `node --check` 通过；`git diff --check` 通过。重建52源文件共享运行时，hash前缀 `3f71dc600c00`，运行时一致性与执行测试已包含在122项中。
- 按控制器明确要求，本修复轮没有重跑全量；先前1048/1048是修复前证据，本轮全量由 Task6 最终集成负责，不混称修复后全量。

### 自查与边界

- 未新增玩法或修改经济参数；只提交 engine、faction-system、campaign-ui、classic-ui、faction-system 测试和生成运行时共6个任务文件。
- 来源/时间校验是本地存档结构一致性约束，不是签名鉴权；真实旧历史允许按明确边界继续，未回溯替换敌军。
- 两套真实 HTML 构建函数已测文案与禁用属性；控制器负责本轮正常经济路径复验、截图及最终独立审查。无另行创建的真机或正常经济证据。
- 无已知未解决的本轮审查问题。未推送、合并、发布、改版本或启动子代理。

## 独立审查修复第 2 轮（基线 4f03e70）

状态：旧战斗胜利后返城存档非法的问题已修复。

修复提交：`ced75e0`（fix: validate legacy camp returns by phase and city）。

- 根因：普通战斗结算把 expedition.start 重写为返城开始时刻，第一轮校验仍将它当作离城时间与 camp.createdAt 比较。
- 最小修复仅在 FactionSystem.validField 区分 return 阶段：返城不能重新开启战斗，沿现有返城阶段校验来源城；活跃 march/battle 缺 faction 仍必须有明确的营地创建前离城时间与同城来源。没有改动普通结算、返城回调、敌军快照或奖励逻辑，也没有增设存档字段。
- 新增完整回归通过真实 dispatch → startBattle → battleRound 胜利 → return → save/init → 实际抵达 → save/init。营地保留、原敌军阵容与原奖励回执均保持；返城时改成不存在来源城或另一个真实城市均拒绝。
- RED：新用例在修复前真实胜利后 validSave 返回 false；24通过、1失败，退出1，日志 `/tmp/task5-fix2-red.log`。
- GREEN：`node --test tests/faction-system.test.cjs tests/hero-leadership-snapshot.test.cjs` **30/30通过，退出0**；包括既有缺标记/弱敌军/旧战斗来源等负例，日志 `/tmp/task5-fix2-green.log`。
- `node --check faction-system.js`、`node --check tests/faction-system.test.cjs`、`git diff --check` 通过；重建52源文件共享运行时，hash前缀 `fac7913a8ced`；`tests/online-runtime-freshness.test.cjs` **21/21通过**，日志 `/tmp/task5-fix2-runtime.log`。
- 本轮没有重跑全量；只提交 faction-system.js、其测试及生成运行时。控制器规格/计划/QA/正常经济脚本未暂存。未推送、发布、改版本或开子代理。
