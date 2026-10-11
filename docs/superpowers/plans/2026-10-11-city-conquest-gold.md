# 攻城黄金与经验 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增12座攻城目标，提高黄金与真实击杀经验，让攻城支持经营和武将成长。

**Architecture:** 沿现有全局脚本数据、地图迁移和战斗结算。城池数据决定守军和基础黄金，HeroSystem新增纯经验计算，engine只在实际结算调用；不新增脚本或存档字段。沿先前选定的本会话直接实施方法，最后一次独立整批审查。

**Tech Stack:** JavaScript / HTML / CSS，Node测试，无框架。

**Spec:** design/quick-specs/city-conquest-gold-2026-10-11.md

## Global Constraints

- 新增12城，2/3/4/5级数量4/4/2/2；黄巾与名城gold×4，普通地图城守军round(当前×1.5)，名将镇守与主线县城不叠加。
- 胜利城池占领经验level×45+floor(kills/5)，其他战斗保持原规则；kills来自冻结编队与结算幸存兵，不读取当前地图守军。
- 运输负重、黄巾每城每小时黄金刷新、爵位城池名额、薪俸、招降和援军令价格沿现有规则。
- 旧档迁移保留已有位置、归属、计时器和战报；读界面不写存档。
- 版本0.34.70三处一致，生成并提交联机运行时；npm test通过再推PR，发布须负责人另行授权。

## Review Focus

- 旧档自建城/旧野地占据新坐标：新增目标避让，旧地图不移动。
- 进行中战斗使用冻结旧守军：击杀经验不能按新地图守军凭空增加。
- 同小时多次攻城：黄金刷新、负重裁剪和败战无黄金不被乘倍逻辑绕过。
- 存档重载已结束战斗：经验不重复发，旧战报不重算。
- 普通城规模调整不能给名将城或主线县城误叠倍率，新增黄巾不能提高郡城名城数量门槛。

### Task 1: 城池数据与迁移

**Files:** Modify yellow-city-data.js、named-city-data.js、tests/yellow-cities.smoke.test.cjs；Create tests/city-conquest-economy.test.cjs。
**Interfaces:** Consumes YellowCityData.nodes/allNodes/createSites、NamedCityData.nodes/definitions、Game.getNode/attackInfo/validSave；Produces20座黄巾城及新黄金/守军，既有接口不变。

新增目标（建议坐标只用于新城迁移选址）：2级溪口(29,29)、石桥(35,29)、松林(29,35)、南岗(35,35)，模板青石；3级东渡(24,29)、西亭(40,31)、长坡(30,40)、竹溪(38,25)，模板白沙；4级安陵(20,34)、望山(45,34)，模板赤岗；5级平原(18,22)、苍梧(48,28)，模板云台。ID依次yellow_xikou/shiqiao/songlin/nangang/dongdu/xiting/changpo/zhuxi/anling/wangshan/pingyuan/cangwu。显示名称加“黄巾城”。新城按模板人口/资源/行军时间，守军与黄金按批准倍率；不得双倍套倍率。

- [ ] 写失败测试：黄巾节点20个；新增等级计数4/4/2/2；青石原shield60→90、gold1500→6000；江陵shield3500仍3500、gold12000→48000；汉川县普通盾100→150、gold1500→6000；名城definitions长度不变。
- [ ] 运行node --test tests/city-conquest-economy.test.cjs，确认新断言失败。
- [ ] 追加12城并调整数据倍率；更新旧测试的节点预期，保留原8座位置与属性语义。
- [ ] 迁移测试：移除新增towns/sites的0.34.69旧档，预占一个新城建议野地坐标并设自建城，导入后旧位置与归属不变，新城20坐标唯一；反复地图读取state不变。
- [ ] 跑node --test tests/yellow-cities.smoke.test.cjs tests/city-conquest-economy.test.cjs tests/named-city.test.cjs；全部通过后提交本任务。

### Task 2: 真实击杀经验

**Files:** Modify hero-system.js、engine.js；Create tests/city-battle-xp.test.cjs。
**Interfaces:** Consumes Battle.enemy[].initial、survivors(enemy)的合计及node.level/isCity/mode；Produces HeroSystem.battleXp(level,won,{city=false,mode='raid',enemyStart=0,enemyRemaining=0}={}) -> number，写入既有result.xp/report.xp。

- [ ] 写失败测试：battleXp(2,true,{city:true,mode:'occupy',enemyStart:320,enemyRemaining:20})=150；8级12500击杀=2860；失败15；raid与野地level×45；负击杀差夹0、零敌军只有基础经验。
- [ ] 运行node --test tests/city-battle-xp.test.cjs，确认函数缺失失败。
- [ ] 实现battleXp纯函数并导出，finishBattle按b.enemy冻结initial减结算幸存计算；替换现有xp计算行，不改副本经验。
- [ ] 用真实战斗测试胜利新增经验与报告相同，重载/返城不重发；战斗开始后把地图守军改变为更高数量，结果经验仍按冻结守军；失败与撤退不加击杀奖励。
- [ ] node --check hero-system.js及engine.js；跑本测试、city-conquest-economy与现有战斗/存档测试；通过后提交。

### Task 3: 正常攻城收入、手机验收与PR

**Files:** Create tests/balance/city-conquest-income.cjs、design/balance/city-conquest-income-2026-10-11.md/JSON、production/qa/city-conquest-v0.34.70.md；Modify README.md、package.json、index.html、docs/HANDOFF-2026-10-09.md、supabase/functions/_shared/game-runtime.mjs；必要时修正既有正常成长诊断的补兵观察/爵位操作。
**Interfaces:** Consumes Task1地图与Task2经验、既有onboarding/normal-famous诊断入口；Produces真实三种子收入/战损/经验与存档证据，截图、全量测试和未发布PR。

- [ ] 数值脚本从实际开局成长档用真实训练/出征占领API，种子1/7/19；无发资源或强制等级，先侦察按真实兵力筹军和运输兵，分别记录获金、实际军损/补兵资源、主将经验与每小时收入。
- [ ] 每日攻城获金后再支付两副本援军令，发展人口/市场并领奖，记录8小时离线与24小时在线两种收益模式；每次重载校验，失败保留非零退出，不能将简单胜利测试当作自然平衡达标。
- [ ] 对照当前0.34.69基线与新数据同源成长路径，记录额外收入、敌军规模、武将升级和实际花费；江陵复核补兵观察上限与招降推恩令过期需求，不改变生产规则来让模拟通过。
- [ ] 版本0.34.70一致，node scripts/build-online-runtime.cjs，npm test全部通过。
- [ ] 390/440手机与1280桌面检查新城地图选项、黄金/经验战报与负重提示，保存截图，真机Safari未测要明确。
- [ ] 一次 fresh reviewer 独立整批审查，重要问题一轮RED→GREEN修复，写QA/交接；最终npm test通过后推分支、开PR基于第72批分支并附加PR；不合并上线。
