# Task7 实施报告：十常侍之乱、讨伐董卓

状态：DONE。BASE：6813547。HEAD：3f6ee05（feat: 添加十常侍与讨伐董卓历史战场）。工作树 /Users/lihuazeng/.codex/worktrees/nanman-campaign/superpower，分支 feat/classic-strategy-depth。未推送、合并、发布或升级版本。

## 实施内容与API

既有Game API签名全部保留，campaign可选参数增加明确白名单的 `ten_eunuchs` / `dongzhuo`。`BattlefieldData.config(campaign)`返回本书固定配置，catalog顺序为黄巾、南蛮、十常侍、讨董；不接受未知ID。默认get/available/reward/config仍是黄巾，旧15节点、数字、剧情、装备套装和快照未更改。

- 十常侍：主线`t1..t9`、支线`u1..u6`、京师/禁苑/河宫三幕，最终`t9`张让；15级主将。基础声望1400、经验240；每支线100/20。敌军逐节点复制原黄巾同梯度，独立宫门/粮道/接应剧情。
- 讨董：主线`d1..d9`、支线`e1..e6`、汜水/虎牢/洛阳三幕，最终`d9`董卓；20级主将。基础声望1600、经验280；每支线100/20。敌军逐节点复制原南蛮同梯度，独立联军/骑阵/军械剧情。
- 九主线逐个依赖上一主线，支线保持可选；第二、三幕支线分别在本书第三、第六主线结束后开放，没有跨书节点或解锁替代。
- 每书第一/第五支线真实补租池+500，仅第一次完成有效；第四支线真实200人救治额度，消耗实际伤兵并进入补租池；第三支线真实本轮攻击+8%、终战守军−5%；第二支线解除本幕相关守军优势，第六支线解除最终防御优势。
- 新书有明确的情报/军械选择：十常侍内仓解除第三主线攻击1.05，密诏解除终战防御1.1；讨董骑阵情报解除第三主线弓兵攻击1.08，军械解除第六主线防御1.12，营图解除终战防御1.1。军械支线攻击增益在正式创建战斗和严格战斗快照校验中共用config.attackSide，原黄巾s3及原南蛮行为不变。
- 继续复用罗盘隐藏入口与面具潜入的旧道具动作，不新增奇物或免费发道具。新第六支线的口令“归营”有明确剧情提示；潜入仍须实际面具、仍要击败剩余守军、一次尝试，不是免费通过。
- 三档仍为简单800/3000、普通1200/4500、困难2000/7500，守军1/1.75/3，收益1/1.25/1.5。新书简单不依赖其他副本通关；普通/困难必须本书前档真实完整通关。南蛮原黄巾前置没有放开。
- 日计数使用原 `battlefields.daily[campaign]`，每书独立，跨本不合并；同书跨难度共享每日首次箱。首次完整通关全额+1箱，后续声望经验floor减半、不再发箱；半途、放弃、重新加载不发结算奖励。
- 十常侍箱复用 `yellowEquipmentBox`、yellow_turban套装、tier2；讨董箱复用 `barbarianEquipmentBox`、nanman套装、tier3。原七个随机部位、重复部位、容量检查都保留，没有新装备集合。

## 规则解释与范围

按controller明确裁定，spec中的城战/骑械描述是剧情、阵型与军械支线作用；本任务没有扩展成正式门墙、ram/ballista新守军或新租兵种。所有新节点仍是原非siege租兵正式回合，不宣称可以租冲车或打真实城门。数值原样复用两旧梯度。

租兵从本轮pool支付，伤亡60%回池、其余进入本轮伤兵；不扣真实城军或人口，不污染本城WarCare。购买令仍从实际当前来源城扣2500黄金，开战冻结sourceCity/general/tech/unitSnapshot；切城后的创建战斗、经验主将和最终receipt仍沿本轮来源。声望、将领XP、装备箱继续沿原全局字段结算，未发明城市资源奖励。

## 迁移、严格校验与事务

- 没有新增存档字段/版本：继续复用原稀疏daily/firstClears/difficultyClears字典。新书缺key表示从未通关，必须第一次真实完整通关后建立账本，避免迁移伪造日期、解锁或奖励。
- 原init/migrateSave对整套battlefields和缺difficulty字段的迁移保留。静态config与nodeLists扩充为四书明确字典；现有validRewards依据四书catalog逐书严格检查，仍拒绝任意future键、跨书prefix、缺前档、未来序号和错误reward/enemy快照。
- 保留旧yellow/nanman运行快照、历史供粮效果和奖励数值，未重写old CONFIG_VERSION1或原数组。read-only配置、报价、地图只投影，不迁移或改存档。
- 定向补齐这次新副本路径使用的既有enter/order/round/openBox保存失败回滚。回滚完整Game.state、sourcecity范围、库存/装备、将领XP、声望、receipt和本轮损耗/进度；进入/回合同时还原战场显示flag。
- 原resolveBattleRound在battlefield上下文中的两处内部save改由外层battlefieldRound统一持久化一次，才能原子确认整个回合及最终结算。普通攻防和教学演练的原保存路径保持。实际保存失败仍按原存档系统暂停，恢复存储后重新读取再继续，没有绕过暂停或吞掉错误。

## 界面

- 既有四书目录、三幕15卡、难度选择和紧凑兵队指令全部使用真实动态配置。
- 新书奖励细则显示正确最终主将张让/董卓；箱标签按config.boxItem选择，不再误把讨董标成黄巾箱。
- 新书明确短文案“复用黄巾/蛮族套装箱，品质与随机七部位不变”；最后报告亦按receipt.campaign显示正确箱。
- 沿既有两列目录与≥44px移动操作，不增加新页面/框架/全局脚本。

## TDD与验证

### RED

命令：`node --test tests/historical-campaigns.test.cjs`，证据 `/tmp/classic-depth-task7-red.log`。

产品改动前11项，1旧黄巾/南蛮冻结兼容通过，10新合同失败。失败分别是两书不存在、等级门槛不匹配、缺实际节点/三档路径/独立奖励/支线效果/来源城租兵路径/套装/UI和事务入口。实际失败原因是未知新campaign/缺配置，非拼写或加载错误。

### GREEN

- `node --test tests/historical-campaigns.test.cjs tests/battlefield-*.test.cjs tests/nanman-*.test.cjs`：77/77，零失败，4.36秒，`/tmp/classic-depth-task7-focused-green.log`。新增11项含六次真实三档完整通关、实际伤兵治疗、军械与情报真实效果、来源城切换、七随机部位、旧快照迁移和完整保存故障回滚。
- 最终回合故障测试先通过真实回合取得有效最后一回合前存档，并保存可复现PRNG位置；存储故障发生时直接确认系统已经完成终战结算，随后断言完整状态回滚、没有XP/箱/receipt残留。恢复存储后按原系统重新init读取并重放真实最终回合，只有一个day count与一个箱，未伪造敌军HP或结果。
- `npm test`：提交前仅运行一次，1081/1081、零失败/取消/跳过，64.91秒，`/tmp/classic-depth-task7-full-green.log`，无测试运行时警告或异常。
- 所有改动产品JS以及两项改动测试 `node --check`通过；`git diff --check`及`git diff --cached --check`通过。
- `node scripts/build-online-runtime.cjs`通过，52源文件；runtimeHash `a0968be1d2e9e121bc731d81da447b0c50c84b82546acf8aceb3b93154a104d6`。
- 原nanman catalog数量断言2需因新需求变为四书精确ID白名单；原南蛮军队、报价、奖励和副本兼容断言保留。

## 正常输入与视觉证据归属

新增机械边界测试准备20级主将、科技、令牌和城市输入来验证规则，**不是正常经济平衡结论**，没有用它宣称正常进度胜率。未修改任何balance脚本、已发布classic-mobile-campaigns基线诊断或root证据。

controller供给的独立实证：正常seed7所得主将，两书全支线×三档均完整通过，每书同日各一个箱；真实等待24小时后再次简单九主线通关，十常侍1400/240/1箱，讨董1600/280/1箱，真实军队不变。controller已检查390/440/1280目录、两本15节点及十常侍实际战斗，无页面溢出，移动按钮≥44px。最终18条难度路线、完整旧档矩阵与集成版本截图由root汇总，未冒称本agent独立运行。

## 提交文件与自审

提交仅七个文件：battlefield-data.js、battlefield-system.js、battlefield-ui.js、engine.js、supabase/functions/_shared/game-runtime.mjs、tests/historical-campaigns.test.cjs、tests/nanman-data.test.cjs。

自审确认：两旧书成功行为不改；全数值按brief；30新节点不是catalog占位；所有支线有真实作用；主线无需支线即可完整通关；箱仍旧套装/七部位；无partial奖励；来源城/租兵守恒；终战存储故障可回滚；严格unknown ID拒绝；读界面不写；无新全局脚本无需修改加载清单。engine仍有既有长单行，本次仅精确修改必要battlefield hook，未扩展无关事务。

controller未暂存设计、总计划、QA、evidence和两个balance脚本未修改或暂存。Git仍提示本机既有自动配置作者身份，未替负责人修改身份配置。最终统一版本/cache破除、实体iPhone Safari及发布仍由root处理，无未解决功能疑虑。
