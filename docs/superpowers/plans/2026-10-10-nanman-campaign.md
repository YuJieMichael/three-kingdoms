# 南蛮入侵与易容面具实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking. 沿用本人逐项实施、最后一次整批独立审查；不逐任务派代理。

**Goal:** 增加可完整通关的南蛮主支线、独立每日蛮族箱、七件套与真实潜入路线，兼容已有黄巾存档。

**Architecture:** 两个副本使用同一战场状态和正式战斗引擎，节点、路线与奖励按 campaignId 查配置。每轮仍只有一名主将和一支租兵队，保留起始城归属与统一结算。新增路线决定保存并进入战斗快照，不改世界地图、野外俘将和普通章节。

**Tech Stack:** 纯 JavaScript / HTML / CSS，全局脚本；Node 原生测试，无新增依赖。

**Spec:** `design/quick-specs/nanman-campaign-2026-10-10.md`，负责人已回复“继续”批准推荐选项1。

## Global Constraints

- 九主线、六可选支线；每轮一位自己的空闲武将，全租兵，一枚援军令覆盖一轮。
- 南蛮首次完整通关黄巾后开放；本城官府3级、校场1级，参战将领10级。
- 编队上限800，初始租兵总额3000；援军令2500黄金。损失60%逐兵种向下取整回池，剩余为副本待救治；真实城内兵力、人口及伤兵不受影响。
- 两副本分别记录 UTC+8 自然日首通；最终结算当天首通全额且一箱，同日后续声望/经验减半且无箱。
- 南蛮主线1200声望/200经验，每条支线+100/+20，全支线1800/320；放弃或失败不发通关奖励。
- 蛮族套第三档，10级穿戴；2件勇武+4，4件统御+6，7件再勇武+6、统御+6、统帅+5；坐骑基础速度14，无统帅属性。
- 奇物无常驻属性、不可强化/炼化/分解，装备库满保留领取资格；潜入每轮每个指定节点一次，无跨日冷却。
- 旧黄巾编号、活动战斗、奖励与装备保留；迁移只补缺失字段，查看不改存档。
- 不新增兵种、多主将、倒计时或五位在野名将；不使用 Scenario GameDev OS。中文界面，手机360/390/440优先截图。
- 独立工作树基于 PR60 HEAD `8eda03fd41729e9aac99766b9e37cbf2a81c1952`；不混入根目录历史修改。候选版本0.34.58，PR base为 `feat/yellow-campaign`；未获发布指令不合并。

## Review Focus

1. 旧档在黄巾战斗中升级：同一敌军、回合、命令与租兵余额继续有效；Task2/3导入固定旧档测试。
2. 先打南蛮再打黄巾或反过来：另一个副本当天仍有首通箱，最新回执不会使旧日记录失效；Task4交错结算测试。
3. 正确潜入后败退、换面具、刷新、重试：不重新选择口令或复原已减少的守军；Task3持久化测试。
4. 库满时取面具、开箱：资格和物品不扣，腾出位置后只领一次；Task4容量测试。
5. 副本暂停时欠薪、多城切换或其他主将正常作战：活动主将不下野，源城和冻结数据不被当前城覆盖；Task2/3多城与欠薪测试。

## 文件与接口约定

不新增产品脚本。修改 `battlefield-data.js`（配置）、`battlefield-system.js`（状态/奖励/校验）、`engine.js`（公开API和战斗快照）、`manual-data.js`（蛮族箱物品）、`hero-system.js`（装备）、`battlefield-ui.js`/`hero-ui.js`/`app.js`/`web-edition.css`（界面）。既有脚本加载清单不变。

数据新增接口：`catalog()`返回副本摘要副本；`config(campaign='yellow_turban')`返回配置副本或null；`get(id,campaign='yellow_turban')`、`available(completed,campaign='yellow_turban')`、`validCompleted(completed,campaign='yellow_turban')`、`reward(completed,campaign='yellow_turban')`。保留现有 MAIN_IDS/SIDE_IDS 作为黄巾兼容常量。

Game公开API追加可选参数，旧调用继续选择黄巾：`battlefieldView(campaign='yellow_turban')`、`battlefieldQuote(general,army,campaign='yellow_turban')`、`startBattlefield(general,army,key,campaign='yellow_turban')`、`openBattlefieldBox(slot,campaign='yellow_turban')`。新 `attemptBattlefieldInfiltration(node,answer)` 保存一次选择但不开始战斗；`enterBattlefieldNode(node,choice='normal')` 的 choice 支持 normal/hidden/infiltration。进行中的轮优先于界面选择，不能用 view 参数串换活动轮。

System接口新增/改造：`quote(s,general,army,api,campaign='yellow_turban')`、`start(s,general,army,key,api,campaign='yellow_turban')`、`view(s,api,campaign='yellow_turban')`、`openBox(s,slot,api,campaign='yellow_turban')`、`attemptInfiltration(s,node,answer,api)`；引擎公开包装显式转参数，不把可选campaign错塞到api的位置。

### Task 1：双副本配置与敌军初值

**Files:** Modify `battlefield-data.js`; Create `tests/nanman-data.test.cjs`。
**Interfaces:** Produces 上述数据接口，配置含 id/name/arcs/mainIds/sideIds/finalNode/minLevel/boxItem/setId/tier/baseReward/sideReward/pool/limit 及节点路线、效果。节点配置不暴露可写共享对象。

| ID | 名称 | 默认敌军 | 效果/特殊路线 |
|---|---|---|---|
| n1 | 边寨解围 | 民兵140、枪兵60 | 主线 |
| n2 | 林间伏击 | 枪兵100、弓兵80 | 首次胜利解锁面具资格 |
| n3 | 祝融营寨 | 枪兵120、弓兵100 | 弓兵攻击×1.08；b2完成取消 |
| n4 | 渡口争夺 | 盾兵120、弓兵80 | 主线 |
| n5 | 藤甲前营 | 盾兵160、枪兵80 | 主线 |
| n6 | 藤甲统领 | 盾兵180、弓兵80 | 敌方防御×1.12；b3完成取消 |
| n7 | 山口合围 | 枪兵140、骑兵80 | 主线 |
| n8 | 蛮营哨卡 | 盾兵160、弓兵100 | 主线 |
| n9 | 孟获决战 | 盾兵180、弓兵110、骑兵70 | 敌方防御×1.10；b6完成取消 |
| b1 | 救援向导 | 民兵100、枪兵40 | 池+500 |
| b2 | 探明密道 | 枪兵90、弓兵50 | hidden取消弓兵；完成取消n3弓兵攻击优势 |
| b3 | 截断藤油 | 盾兵100、枪兵60 | 完成取消n6防御优势 |
| b4 | 护送药师 | 无，剧情对话 | 救治额度+200 |
| b5 | 解救被困援军 | 枪兵120、骑兵50 | 池+500 |
| b6 | 截获军情 | 盾兵100、弓兵70 | 成功潜入取消弓兵；完成取消n9防御优势 |

黄巾 s6 成功潜入保留盾兵90、取消弓兵50；普通敌军不变。口令选择：b6对白“来使先问山路，守卫以归林作答”，答案 `forest`；s6对白“口令先说黄天，守卫答当立”，答案 `rise`。界面还给出 `river`/`return` 两个错误选项，未知答案拒绝且不占次数。合法错误选择锁定 normal；正确锁定 infiltration，不随机抽签。

- [x] 写测试：`available([], 'nanman')` 等于 `['n1','b1','b2']`；n3后开放n4/b3/b4，n6后开放n7/b5/b6；拒绝重复或跨副本完成节点；main reward=1200/200，全支线=1800/320；克隆配置修改不污染后续读取。副本正式id固定 `nanman`。
- [x] 运行 `node --test tests/nanman-data.test.cjs`，确认新增接口/配置缺失导致失败。
- [x] 实现配置和接口，沿用黄巾旧数据；将中文对白、支线效果及路线敌军放配置，不以显示名字分支。
- [x] 运行 `node --test tests/battlefield-data.test.cjs tests/nanman-data.test.cjs` 全通过；`node --check battlefield-data.js`。
- [x] 提交本任务配置和测试，提交说明不含跳过CI指令。

### Task 2：双副本状态、门槛与迁移

**Files:** Modify `battlefield-system.js`, `engine.js`, `tests/helpers/battlefield.cjs`; Create `tests/nanman-state.test.cjs`, `tests/fixtures/battlefield-yellow-v57.json`。
**Interfaces:** Consumes Task1配置；Produces上述Game报价/开局/视图API。新轮id为 `nanman:<全局seq>`，旧轮 `yellow:<seq>` 保留。run新增 `infiltration:{}`；旧run只有缺失时补该字段。保留 routeDiscovered 布尔值，按当前campaign指向s2或b2。

- [x] 从v57运行时生成并保存含真实进行中黄巾战斗的固定存档，再写失败测试：迁移后回合、命令、兵种统计、pool、wounded不变；视图前后完整存档相等。
- [x] 补失败测试：无黄巾首通不能报价南蛮；9级失败10级成功；错误副本/旧报价跨副本启动拒绝不扣令；同时仅一轮；源城固定；池守恒3000+500×已完成b1/b5；非法新字段不被迁移抹掉。
- [x] 运行 `node --test tests/nanman-state.test.cjs` 确认失败。
- [x] 实现缺失字段迁移、campaign参数、确认键、源城冻结、逐副本节点与租兵总额校验。修改 `validSave` 顺序时保留先校验城市再校验战场；欠薪busy覆盖活动主将。
- [x] 加多城切换、欠薪跨离线tick、放弃后可离队回归，运行 `node --test tests/battlefield-state.test.cjs tests/nanman-state.test.cjs` 全通过，检查两文件语法。
- [x] 提交本任务与固定旧档，不包含根目录其他修改。

### Task 3：真实支线效果与潜入快照

**Files:** Modify `battlefield-system.js`, `engine.js`; Create `tests/nanman-combat.test.cjs`。
**Interfaces:** Produces `attemptInfiltration`/Game公开API；run.infiltration只接受该副本指定节点，值为 `normal` 或 `infiltration`。潜入尝试需地点可达、未完成、没有未结束战斗、主将实际装备面具、尚未尝试。battle新增 `route`，旧档战斗缺失时补normal；新路线敌军依配置严格校验。

- [x] 写失败测试：正确选择仅记录路线，战斗未启动；再选拒绝；正常选项不扣物品；错误答案锁normal；未知答案不写；没有面具不可尝试但可正面战斗；合法infiltration必须有已保存正确尝试。
- [x] 补失败测试：b2 hidden无routeDiscovered拒绝；南蛮n3仅弓兵攻击1.08而枪兵不变；n6防御1.12、n9防御1.10分别被正确支线取消；b1/b5/b4仅胜利一次发本轮额度；两种s6路线均解除黄巾最终防御且只计一次贡献。
- [x] 运行 `node --test tests/nanman-combat.test.cjs` 确认失败。
- [x] 实现路线冻结、配置化敌军及支线修正。n3攻击修正落到指定敌军stats.atk；防御使用现有首领乘数；校验双方统计时按同一纯配置公式重算。旧黄巾s3攻击×1.08规则保留。
- [x] 对成功潜入战斗败退→补租→换饰品→导出重载→重试进行断言：已存决定不变；已确认潜入路线可继续，卸下面具不能产生新尝试。活动战斗/选择节点锁住新尝试，普通战斗并发时开战拒绝。检验快照篡改拒绝，真实城军/人口/伤兵不变。
- [x] 运行 `node --test tests/battlefield-combat.test.cjs tests/nanman-combat.test.cjs` 全通过并检查语法，提交。

### Task 4：独立每日奖励、面具与蛮族七件套

**Files:** Modify `battlefield-system.js`, `manual-data.js`, `hero-system.js`; Create `tests/nanman-rewards.test.cjs`, `tests/nanman-equipment.test.cjs`。
**Interfaces:** 南蛮 inventory物品key=`barbarianEquipmentBox`，setId=`nanman`，relic=`mask`；面具资格 `battlefields.relics.mask={unlocked:true,claimed:boolean}`。领取沿用 `claimBattlefieldRelic('mask')`。日记录/首次完整通关按campaign键独立；最新lastReceipt的验证只能绑定自己的campaign。

- [x] 写失败测试：同一天黄巾→南蛮→黄巾→南蛮，两个首次箱各1，后两次各无箱且半额；全支线1800/320、重复900/160；跨UTC8零点和失败重试不提前占资格；重复胜利回调不再次发奖。
- [x] 补失败测试：首次n2只解锁资格、容量满不领且不扣；已领mask最多一件且与claimed一致；重复n2不重发。蛮族箱七槽tier3，满库不扣；套装2/4/7合计分别4/0/0、4/6/0、10/12/5；混套、不同将领、未穿装备不凑套；坐骑stats为空、速度14、旧黄巾与旧品质套数值不变。
- [x] 运行两组新测试确认失败。
- [x] 实现物品定义、统一结算、回执校验、满库与奇物身份、装备名称/属性/动作保护。面具与罗盘互斥穿戴但均永久持有；物品定义须在可生成箱的结算代码生效前落地。
- [x] 运行上述新测试与 `tests/battlefield-rewards.test.cjs`、`tests/battlefield-equipment.test.cjs` 全通过并检查语法；提交。

### Task 5：手机双副本入口与潜入选择

**Files:** Modify `battlefield-ui.js`, `hero-ui.js`, `app.js`, `web-edition.css`; Create `tests/nanman-ui.test.cjs`。
**Interfaces:** 界面暂存 selectedCampaign 默认为黄巾，不写存档；活动轮覆盖选择。pending确认对象必须含campaign/runId/node/choice，最终提交再次核对；新增action统一battlefield前缀并纳入保存阻断允许列表的只读动作。

- [x] 写失败测试：入口含两副本与各自锁定原因、独立今日箱状态；只有无活动轮时能切换；确认键过时不开始；节点实际路线敌军显示匹配；最后决战提示“胜利即结束本轮”。
- [x] 补测试：面具/罗盘领取按钮身份正确；潜入选项先展示线索及可能结果、已试后不能再选；开箱选择已有同套部位时先提示再确认；英雄装备页解释两套2/4/7与两件奇物用途，不把面具写成罗盘来源。
- [x] 运行 `node --test tests/nanman-ui.test.cjs` 确认失败。
- [x] 实现双卡、三段地图、确认与报告、箱子选择、奇物使用与提示。沿用最小44px点击目标；手机单列、桌面三段；新增hover显示规则只在支持hover设备启用。
- [x] 运行新UI测试及 `tests/battlefield-ui.test.cjs`、`tests/touch-tap.test.cjs` 全通过，检查JS语法；提交。

### Task 6：正常成长、手机验证与候选交付

**Files:** Create `tests/balance/nanman-campaign.cjs`, `design/balance/nanman-campaign-2026-10-10.md`, `production/qa/nanman-campaign-2026-10-10.md`, `production/qa/evidence/nanman-campaign-v0.34.58/`; Modify `index.html`, `package.json`, `README.md`, `supabase/functions/_shared/game-runtime.mjs`, 两份设计/计划与交接记录。
**Interfaces:** 复用 `tests/balance/yellow-campaign.cjs` 的 `normal(seed)` 和 `clear(e,sides)`；通过真实黄巾首通和日限操练升10级，实际购令、领取箱和装备；不直接写将领等级、资源或通关标记作为正常数值证据。

- [x] 写模拟断言，种子1/7/19：仅主线、全支线和可用枪/盾/弓混编均能通关；每次读取/导出/正常重载valid，主线有限3000额度、全支线4000额度不耗尽；记录真实培养时间、购令费用、每战损失/回合。
- [x] 首次运行模拟，保存实际结果；按结果修正Task1敌军初值，优先调敌军人数而不改变已批准租兵/奖励规则。每次调整复跑受影响路线测试与模拟，不能将失败写成通过。
- [ ] 同将领装备与补满编队，比较hidden/normal和正确/错误潜入、每个首领有无解除障碍，记录实际损失；七日双副本首箱开齐两套、交错同日重打校验箱数与费用。估算关羽等名将装备后的统帅，证明没有三倍膨胀。
- [ ] 手机360/390/440与桌面1280实际点击：开始、补租、口令、路线胜利/失败、暂停刷新、开箱满库/重复部位确认、装备面具。保存截图和战报，测页面/对话框无横向溢出；真实iPhone Safari未测时明确注明。
- [x] 跑 `node tests/balance/yellow-campaign.cjs`、`node tests/balance/chapter-progression.cjs`、`node tests/balance/chapter-four.cjs`、`node tests/balance/long-run-soak.cjs`、`node tests/balance/realm-soak.cjs`，报告每项结果；出现回归先定位修复，不靠改期望绕过。
- [x] 对齐候选0.34.58的全部index缓存版本、package版本、README标题和说明；运行 `node scripts/build-online-runtime.cjs`，然后 `npm test` 全部通过，`git diff --check` 无错误。
- [x] 按 executing-plans/requesting-code-review 要求只派一次新鲜整批reviewer，检查PR60基线到新HEAD；发现重要问题先失败回归再修复，修复后全量测试。记录每条审查裁定，不二次派复审。
- [ ] 提交、推送分支，创建base=`feat/yellow-campaign`的叠加PR并原生附加任务；检查当前HEAD的push和PR CI均成功。保留工作树、版本依赖、截图、正常模拟和交接记录；等待明确发布/合并。


## 执行与计划自查

执行方式沿用此前本人逐项实施，完成后一次独立整批审查。先用 using-git-worktrees 检查已附加工作树并创建/复用隔离的南蛮分支；把已批准规格与本计划复制进去，禁止覆盖根目录旧产品代码。

规格覆盖已逐项对照：入口/路线Task1/2/5，奇物与实效Task3/4/5，奖励与七件套Task4，旧档/源城/忙碌Task2/3，正常成长/截图/版本/CI交付Task6。接口在后续任务使用相同名称；所有五类Review Focus均有指定测试。敌军表为待正常模拟收敛的初值，尚无通过证据；本文待负责人审阅后实施。

## 执行状态补注（2026-10-10）

Task6模拟、四种尺寸与实际15节点通关已完成，693项全量测试通过。七日循环开两副本箱并穿蛮族全套；名将总值仅分析本批固定统帅+5，前置PR57的合并组合待发布依赖验证。容量满/重复部位边界由真实引擎/DOM回归覆盖，未把它们全部声称为浏览器点击；真机Safari未测。上方两项保持未勾，避免将部分边界验证误记为完全按原计划执行。独立整批审查与PR/CI结果待收尾补入。初值经正常模拟可通过，未调整敌军表。

最终整批独立审查通过，未发现Critical/Important/Minor问题；693/693与正常模拟由审查者独立复现。审查未判断真机Safari、PR57合并组合及远端CI，裁定和边界已归档QA。
