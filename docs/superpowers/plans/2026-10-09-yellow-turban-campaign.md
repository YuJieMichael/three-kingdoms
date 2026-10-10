# 黄巾之乱主线与支线实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. 沿用本人逐项执行，完成后安排一次独立整批审查。

**Goal:** 交付单将全租兵的黄巾战役：三段九个主线节点、六条可选支线、失败续战、每日首通箱与七部位黄巾套装。

**Architecture:** BattlefieldData定义节点和规则，BattlefieldSystem维护独立于城市的共享战役状态；引擎复用现有逐回合战斗，采用独立副本结算出口。BattlefieldUI用手机可点的地点卡片显示路线，奖励和换装只经过有存档写入保护的引擎动作。

**Tech Stack:** 全局JavaScript、HTML/CSS、Node内置测试、现有浏览器与运行时生成脚本；不加框架或生产依赖。

**Spec:** `design/quick-specs/scripted-battlefields-2026-10-09.md`。负责人已用“可以”批准主支线调整；本计划的具体额度和数值是待审阅的实现初值，未经过模拟，不宣称平衡已验证。

## Global Constraints

- 前置：八部位与坐骑计划完成并通过验证；使用该批实际提交作为基础，不把根目录旧改动带入。先检查attached worktree；执行时创建/复用适合的托管工作树。
- 本批仅黄巾。南蛮、易容面具发放、五名在野抓获奖励留独立批次；不展示尚未可用的功能按钮。
- 九主线、六支线；一位自己武将、一支独立租兵队、一张援军令覆盖整轮。城内军队、伤兵、人口、野外领地不参与。
- 支线全部可选，能返回已开放区域补做；最终胜利关闭本轮。没有整场倒计时，支持刷新续玩。
- 当天首通声望/经验全额，以后合计收益减半向下取整；每副本每日首次完整通关一箱。日界使用UTC+8，跨日以最终结算时间为准。
- 本轮消耗令不退；失败保留损失和已消耗额度；主将占用直到通关或明确放弃。禁止同将另一处出征、驻守、任职或转城。
- 旧字段缺失才迁移，已有无效战役字段不得抹掉后当作旧档。读取页面/报价/路线不初始化状态或领物品。
- 所有动作走Game.actions写会话保护；共享世界和服务器运行时拒绝开启战役，不在本批改联机服务。
- 新脚本加入index及AGENTS列出的六份测试清单；前引擎模块更改后生成并提交共享运行时。
- 手机截图优先440px，兼查360/390px与桌面；真实Safari检查另记。测试通过后PR/CI，只有负责人说发布或合并才上线。

## Review Focus

1. 切城时独立战役、租兵池与武将快照保持一致；奖励属于同一账号，不重复发箱（Task 2/3/4）。
2. 失败后全灭、支线额度耗尽时明确显示可补租或放弃；失败不重置损失（Task 2/3）。
3. 自动守城/教学演练与副本战斗争用屏幕或主将时不能串错结算出口（Task 3）。
4. 跨日并双击最终战胜利/正常重载，不重复支付任何奖励（Task 4）。
5. 仓库满、佩饰替换奇物、同轮重复进入隐藏路线，不吞物品或重复计支线（Task 5/6）。

## 文件与接口

新增生产文件：`battlefield-data.js`、`battlefield-system.js`（加载在engine之前，分别负责只读配置、状态规则）；`battlefield-ui.js`（engine后、app前）。
修改：`engine.js`、`hero-system.js`、`hero-ui.js`、`manual-data.js`、`playtest-config.js`、`layout-ui.js`、`app.js`、`index.html`、`web-edition.css`、六份脚本清单。`city-system.js`仅在需要交叉校验主将占用时修改，不将共享battlefields塞进CitySystem.fields。版本在发布批次确认，保持index/package/README一致。

Game对外接口：`battlefieldView()`、`battlefieldQuote(generalId,army)`为只读投影；动作`startBattlefield(generalId,army,key)`、`enterBattlefieldNode(nodeId,choice='normal')`、`battlefieldOrder(unit,command,target='')`、`battlefieldRound()`、`reinforceBattlefield(army)`、`healBattlefield(army)`、`abandonBattlefield(runId)`、`claimStarterReinforcementToken()`、`buyReinforcementToken()`、`openBattlefieldBox(slot)`、`claimBattlefieldRelic(id)`、`discoverBattlefieldRoute()`返回null或中文错误字符串；`battlefieldCanEquip(generalId)`返回boolean。Game封装保存，System模块只接受显式state和api，不调用DOM或Game全局。

## 待审阅初值（模拟不达标时修订本表并重跑）

- 黄巾入口：起始城官府3级、校场1级、武将5级；租兵仅可选本城已解锁的militia/spear/shield/archer/cavalry，兵种科技在开始本轮冻结。
- 初始租兵总池3000人，战前选0–800人出战且至少1人，选定兵种数从池中占用；统帅仍按既有覆盖率生效，不用NPC固定统帅替代。租兵数按人头计，不接城内人口权重。
- 每战伤亡的60%向下取整回到本轮可补租池，其余永久扣池；存活部队留在编队。伤亡先入本轮待救治池，军医额度只能救剩余40%中的人数，救治后移回可补租池；同一死伤不能两次回收。
- 开始首轮提供一次赠令资格，可领取1枚；之后每2500黄金购买1枚，限数量1、不用元宝；黄金从动作发生时当前城扣，先显示价格。不额外赠资源或每天无限刷新令。
- 官军/皇甫嵩支线各加500人本轮补租池；军医支线给最多200人救治额度。军械库增益为玩家攻击×1.08，持续本轮，执行一次；不提高面板或统帅。
- 张梁供给障碍：敌攻×1.05，完成粮仓支线解除。张角祭坛优势：敌防×1.10，完成祭坛支线解除。其余节点不复制这两种加成。
- 声望基础1000、经验基础160；每支线加声望100/经验16；全支线首通1600/256，同日后续800/128。非最终节点不发永久经验、声望、装备或野外战利品。
- 黄巾箱选择weapon/helmet/armor/cloak/bracer/boots/mount之一，tier=2，enhance=0，setId='yellow_turban'；奇物不进箱。套装按同将穿戴计数，累计2件atk+3、4件def+5、7件atk+5/def+5/lead+3；不叠旧品质套装。七件总加成为atk+8/def+10/lead+3。
- 罗盘首次粮道争夺胜利解锁领取资格；选择领取后增加1件无面板属性的accessory、relic='compass'。已领取不重发，装备库满保留资格。其使用不消耗本体，粮道区域每轮一次探明粮仓隐藏入口；普通入口仍可达。

### 节点固定配置

主线ID按表顺序要求前一主线完成；每段前两节点完成才可打首领。第二段支线需要m3，第三段支线需要m6；第一段支线开场可做。括号内为首版敌军人数配置，均无城门箭楼；名称是本作剧本，不宣称复刻史实地图。

| ID | 名称 | 敌军初值/事件 | 完成效果 |
|---|---|---|---|
| m1 | 村落解围 | militia:100 | 开m2 |
| m2 | 粮道争夺 | militia:80,spear:40 | 开m3；一次解锁罗盘资格 |
| m3 | 张梁营寨 | spear:100,archer:50 | 开第二段；供给障碍见初值 |
| m4 | 西华破围 | shield:100,archer:60 | 开m5 |
| m5 | 汝南攻营 | spear:100,cavalry:60 | 开m6 |
| m6 | 张宝决战 | shield:120,archer:80 | 开第三段 |
| m7 | 广宗外围 | spear:120,archer:90 | 开m8 |
| m8 | 巨鹿破阵 | shield:140,cavalry:80 | 开m9 |
| m9 | 张角决战 | shield:160,archer:100,cavalry:60 | 最终结算；祭坛优势见初值 |
| s1 | 救援失散官军 | militia:80 | 本轮租兵池+500 |
| s2 | 夺回粮仓 | spear:60,archer:30 | 解除m3供给障碍 |
| s3 | 解放军械库 | shield:80,archer:40 | 本轮玩家攻击×1.08 |
| s4 | 解放医药营 | 对话：选择护送医官；无需战斗 | 本轮救治额度+200 |
| s5 | 支援皇甫嵩 | spear:100,cavalry:40 | 本轮租兵池+500 |
| s6 | 潜入祭坛 | 正面shield:90,archer:50；面具潜入配置shield:60,archer:35 | 解除m9祭坛优势 |

首批不发面具，普通玩家只能正面进入s6；后续面具批次接choice='disguise'，本批对该参数拒绝而非开放空选项。敌将攻击/防御基础均×1，仅表中障碍覆盖。每节点配置一段入场对白、一句目标、一段胜败对白，黄巾三公分别强调粮道、阵势、决战，不复用无意义占位文案。

### Task 1：节点图与配置

**Files:** Create `battlefield-data.js`；Test `tests/battlefield-data.test.cjs`；Modify index与六份加载清单。
**Interfaces:** `BattlefieldData.get(id)`返回只读副本配置或null；`available(completed)`返回满足前置的未完成节点ID；`reward(completed)`返回{prestige,xp}。常量`MAIN_IDS/SIDE_IDS/CONFIG_VERSION=1`。

- [ ] 写失败测试：共15个唯一节点，9主线6支线；开场仅m1/s1/s2；m3完成开放m4/s3/s4；m9需m8；全主线无需支线可到m9；未知/重复ID拒绝，数据无依赖环；全支线收益1600/256。
- [ ] 运行`node --test tests/battlefield-data.test.cjs`，确认缺模块或接口导致FAIL。
- [ ] 按固定表实现节点、对白、效果、前置与纯投影；新增加载顺序并纳入所有测试清单。
- [ ] 同命令PASS、`node --check battlefield-data.js`通过；只提交本任务文件。

### Task 2：租兵、路线与存档状态

**Files:** Create `battlefield-system.js`；Modify `engine.js`；Test `tests/battlefield-state.test.cjs`。
**Interfaces:** System提供`init(s)`、`valid(s,api)`、`view(s,api)`、`quote(s,generalId,army,api)`、`start(s,generalId,army,key,api)`、`enter(s,nodeId,choice,api)`、`reinforce(s,army,api)`、`heal(s,army,api)`、`abandon(s,runId)`。动作null/错误字符串，enter只设准备节点或完成对话节点。api的源城科技与兵种统计必须读取run.sourceCity，不能读取切城后的当前城。

- [ ] 写失败测试：旧档迁移得到`battlefields={version:1,seq:0,starterClaimed:false,run:null,daily:{},firstClears:{},relics:{},lastReceipt:null}`；只读view/quote不修改；已存在坏值拒绝；不支持联机；扣令、runId和主将占用一次建立；同key重复开始不再扣。
- [ ] 写失败测试：run={id,campaign:'yellow_turban',configVersion:1,sourceCity,general,startedAt,completed:[],selectedNode:null,army,pool:3000-totalArmy(army),wounded:blankArmy(),medicalQuota:0,battle:null}。只存原始状态，支线作战效果从completed推导；所有数量safe integer非负、已完成主线连续、支线前置满足、主将源城一致、不和城内部署任职重叠，重复节点与错误存活数拒绝。
- [ ] 写失败测试：补租按实际输入扣pool、总出战不超800；救治数量不超wounded和额度；支线每轮一次；未知choice拒绝；放弃确认runId不匹配不生效；切城再view保持原run且城内army/伤兵/人口无变化。
- [ ] 运行`node --test tests/battlefield-state.test.cjs`确认FAIL；实现接口，api提供兵种统计、源城科技、将领查询/占用/日时钟，Game封装动作进入写会话保护并save；共享字段不加CitySystem.fields。view/getCityState等读取不调用init；migrateSave/init入口才补旧字段。
- [ ] 同命令PASS，engine/System语法检查通过；只提交本任务文件。

### Task 3：复用正式战斗、独立租兵结算

**Files:** Modify `engine.js`、`battlefield-system.js`、`hero-system.js`；Test `tests/battlefield-combat.test.cjs`。
**Interfaces:** `createBattlefieldBattle(run,node)`内部创建正式rules=3快照；`resolveBattleRound(b,context=null)`显式context.kind='lesson'/'battlefield'区分出口，旧默认保留。`BattlefieldSystem.finishNode(s,b,won,api)`只接匹配runId/nodeId的一次结果。新增BattlefieldSystem所需`battleValid(b,run,api)`严校验，不把battlefield battle塞进state.battle。

- [ ] 写失败测试：真实battlefieldRound战胜/失败后租兵存活与60%回收对应，失败重试沿用损失；30回合上限失败；每战快照使用所选武将、源城科技与坐骑；切城/换马不改变进行中的战斗；城内战利品/俘虏/任务胜利/伤兵/人口均无副本增加。
- [ ] 写失败测试：普通出征、守城、演练仍走原出口；副本作战中禁止开始演练或手动另一场战斗，守城来袭仍可排队、不会自动抢占副本屏幕，退出副本作战屏幕后可处理其他武将守城；副本主将不能被自动守城挑选。
- [ ] 写失败测试：军械增益只×1.08一次，支线解除对应首领障碍且不影响其他节点；结算重复调用不再回收兵力/加额度；非法快照、超初始hp、未知兵种或不匹配战役编号拒绝导入。
- [ ] 运行`node --test tests/battlefield-combat.test.cjs`确认FAIL；改resolveBattleRound的顶部结束判断、node查找和所有finish出口（含30回合路径），并将现有lesson调用点显式适配新context，副本使用独立finishNode，不调用finishBattle/WarCare/野外奖励。冻结GeneralGrowth与坐骑档案；不改变旧速度语义。
- [ ] 实现generalBusy覆盖run主将；仅装备穿脱允许该主将在run.battle为空或finished时操作，其他占用原因仍禁止。`battlefieldCanEquip`不成为出征/任职的通用豁免。
- [ ] 目标测试及既有战斗/教学/守城/存档测试PASS，engine语法检查；只提交本任务文件。

### Task 4：援军令来源与最终结算

**Files:** Modify `manual-data.js`、`playtest-config.js`、`engine.js`、`battlefield-system.js`；Test `tests/battlefield-rewards.test.cjs`。
**Interfaces:** System提供`dayKey(now)`（UTC+8日期字符串）、`settle(s,run,now,api)`、`buyToken(s,api)`、`claimStarterToken(s,api)`；inventory使用`reinforcementToken`和`yellowEquipmentBox`。Game封装前述购买动作；最终胜利自动settle，无二次发奖的领奖动作。

- [ ] 写失败测试：首次领令一次、2500黄金购买一枚、余额2499失败且不写；选择购买的当前城扣款；未开放入口不能买令；租兵报价不扣令；只读存档会话不消费。
- [ ] 写失败测试：主线首通1000/160和1箱、全支线1600/256；同日后续全支线800/128且0箱；重复胜利或重载无增量；只做支线后放弃无永久奖励；跨UTC+8午夜按最终时刻；仓库满仍入背包箱子。
- [ ] 运行`node --test tests/battlefield-rewards.test.cjs`确认FAIL；实现奖励、经验addXp、daily/firstClears、run归还与lastReceipt一起保存。daily每campaign只存最近通关day/count，无无限历史数组；lastReceipt保存runId/day/at/completed/奖励。seq单调且runId匹配，首通资格不由读取页面刷新。
- [ ] 有效存档严格校验每日计数、时刻、首通标记和回执；重复结算依据已关闭run与回执拒绝。测试PASS；只提交本任务文件。

### Task 5：黄巾箱、套装和罗盘

**Files:** Modify `hero-system.js`、`hero-ui.js`、`battlefield-system.js`、`engine.js`；Test `tests/battlefield-equipment.test.cjs`。
**Interfaces:** `HeroSystem.battlefieldSetBonus(s,id)`返回五属性加成；`BattlefieldSystem.openBox(s,slot,api)`与`claimRelic(s,'compass',api)`使用HeroSystem.addEquipment分配ID；装备新增可选setId/relic，旧装备字段不改。

- [ ] 写失败测试：七种箱选项各扣一箱生一件，奇物/未知部位拒绝；满库、没有箱、写会话被锁时不吞箱；tier2坐骑保持前批速度；setId伪造/普通佩饰凑套拒绝；2/4/7件加成等于初值且多将混穿不凑件；不叠旧品质套装。
- [ ] 写失败测试：罗盘解锁后只领取一次、满库保留资格；stats无五属性/速度，不能强化/炼化/拆解且不会堵住旧普通佩饰；已领取回执和装备可正常重载；与旧佩饰共槽替换提示加成损失。
- [ ] 写失败测试：装备罗盘后可进入粮道区域探明入口，映射到同一s2；普通入口始终可达，隐藏/常规都完成一次；每run只发现一次，run结束不复制物品。
- [ ] 运行`node --test tests/battlefield-equipment.test.cjs`确认FAIL；实现开箱、套装、奇物类型校验和用途动作`discoverBattlefieldRoute()`（同样写保护）。罗盘来源从unlock→claim→owned区分，无占位面具装备。
- [ ] 目标和旧装备/传奇/礼包测试PASS；只提交本任务文件。

### Task 6：手机入口、战役路线与指挥

**Files:** Create `battlefield-ui.js`；Modify `layout-ui.js`、`app.js`、`hero-ui.js`、`web-edition.css`、`index.html`；Test `tests/battlefield-ui.test.cjs`。
**Interfaces:** `battlefieldModal()`展示Game.battlefieldView；`handleBattlefieldAction(action,id)`处理前缀battlefield动作并返回是否接管。副本战斗渲染器消费run.battle，指令/下一回合明确使用battlefield专属动作，不复用默认state.battle按钮。

- [ ] 写失败测试：三个主线段、十五任务全部可见，未开放显示原因，支线有明确可选标识；完成节点不再出战；每个地点button至少44×44px，无只点文字才响应；360px无横向溢出。主界面“更多”新增战场入口，门槛未达时显示原因而非空白按钮。
- [ ] 写失败测试：实际点击选择主将/租兵、确认一令整轮、支线/补租/军医、失败重试、逐回合指挥、放弃确认、最终报告和选部位开箱；购买显示2500黄金并确认；仓库满显示保留箱或领取资格，不能显示成功。
- [ ] 运行`node --test tests/battlefield-ui.test.cjs`确认FAIL；实现地图区域卡片（手机单列区域、区域内主支线分组），同时显示兵池、可救治数量、主线目标、当日箱与预计奖励。全屏作战显示返回战役/暂停续打，不把返回当放弃。
- [ ] 实际浏览器运行正常玩家路线，截图440px路线、支线效果、战斗、结算及装备栏，并检查360/390/桌面。正常存档页面只读对比一致；语法/目标UI测试PASS；只提交本任务文件。

### Task 7：正常成长模拟、整批验证和PR

**Files:** Create `tests/balance/yellow-campaign.cjs`、`design/balance/yellow-campaign-2026-10-09.md`、`production/qa/yellow-campaign-2026-10-09.md`；Modify规格/交接/版本三处/共享生成运行时。

- [ ] 编写真实Game正常开局模拟：沿用既有onboarding/chapter模拟的建造、资源生产和任务领取，以正常武将升级/打造达到官府3、校场1、将领5，不直接赋资源/科技/装备/经验。战役用真实租兵和battlefieldRound，至少种子1/7/19，无支线、全支线各跑一轮。
- [ ] 运行`node tests/balance/yellow-campaign.cjs`：三种种子均能在800出战上限及有限租兵池内完成无支线主线；全支线降低首领单场折损（同阵容、同快照比较），额外战斗不导致资源池必然枯竭；记录正常开放时间、金币负担、补兵次数、总回合、每场损失及实际收益。七件套逐日按真实箱子获取，统帅增加仅套装3点、坐骑不增加统帅。
- [ ] 如初值未过上述阈值，修订唯一配置表、断言及计划初值并重跑；不偷偷加无限兵/资源。写数值报告，明确模拟结论与真实Safari未验证范围。
- [ ] 运行全部改动脚本node --check、`node scripts/build-online-runtime.cjs`、`npm test`及已有chapter/realm长局模拟；全部通过再进行整批独立审查。审查修复后只重跑受影响检查与完整npm test。
- [ ] 检查此时版本与前置PR合并顺序，三处同步版本并更新说明；保存手机截图、QA与交接。只提交本批文件，推分支、创建PR、attach_artifact、确认CI通过。等待明确发布/合并，不直接推main。

## 自查与交付边界

节点数量、可选支线、租兵隔离、一次结算、坐骑快照、每日箱、套装、罗盘实际用途分别由Task 1–6覆盖；五类Review Focus均有对应失败测试。新装备源依赖八部位基础，此计划不复制其实现。南蛮与面具未发放，因此其潜入路线留后续任务，不能提前声称两副本已交付。本计划在装备前置e899a02基础上执行，任务验证和浏览器证据见production/qa/yellow-campaign-2026-10-09.md；独立审查和PR状态按交接记录。
