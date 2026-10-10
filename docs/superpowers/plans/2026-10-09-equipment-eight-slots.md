# 八部位装备与坐骑 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. 本轮沿用本人逐项执行，最后一次独立整批审查。

**Goal:** 提供每个部位一件的八部位装备栏，并使坐骑速度实际影响行军、正规战先手和骑兵移动，同时完整保留旧装备价值。

**Architecture:** 扩展现有HeroSystem的部位与装备规则，分别定义穿戴部位、普通打造部位、旧掉落/礼包部位。坐骑只计算独立速度档案，出征时冻结并在战斗使用，不并入五项将领加点。首批不发副本箱与剧情奇物，后续黄巾和南蛮使用此基础。

**Tech Stack:** 现有全局JavaScript、HTML/CSS、Node测试，无新依赖，无打包。

**Spec:** `design/quick-specs/scripted-battlefields-2026-10-09.md`，已确认的八部位兼容第一批；全租兵、租一轮与首通/重复奖励属于后续副本批次。

## Global Constraints

- 八部位：兵器weapon、头盔helmet、铠甲armor、披风cloak、护腕bracer、战靴boots、坐骑mount、奇物accessory。每个部位一件；旧accessory键和旧装备ID保留。
- 旧礼包仍为旧四部位各两件，共8件；旧掉落仍只从旧四部位选择，概率与随机调用次数不变。旧传奇淬火流程仅旧四部位，不因扩slots生成新槽位神兵。
- 旧四件品质套装按旧四部位检查；额外穿新部位不解除套装。旧佩饰换成无属性奇物时会失去该件属性与旧四件套，选择页提前说明。
- 本批不建立黄巾/蛮族setId、不发罗盘/面具、不建立副本或租兵；不向玩家发放没有实际用途的奇物。
- 旧档不重发装备；无坐骑时旧战斗、旧行军数值不变。旧在途和旧战斗缺少速度档案时按原快照完成，不能读当前装备补写档案。
- 视图、报价不修改存档；新增档案字段缺省兼容并严格校验，不改变存档version=2。
- UI支持360/390/440px，关键按钮至少44px；上线前提供手机截图，真实Safari与模拟证据分开。
- 基于执行时已发布main建立原生托管工作树；不在脏主目录改产品，不合入未发布PR57/58。遇并行改动保留其价值，不覆盖其代码。
- 推送前npm test全部通过；版本同步index所有?v、package和README，选择执行时未占用版本（当前下一候选0.34.56）。hero-system/engine改动后重建在线运行时。
- 只创建PR；负责人明确发布/合并后才上线。无[skip ci]。

## 计划中固化的首版试玩值（本计划审阅对象）

| 内容 | 数值/规则 |
| --- | --- |
| 新普通披风基础属性 | 统御+2、智谋+2 |
| 新普通护腕基础属性 | 勇武+3、统御+1 |
| 新普通战靴基础属性 | 统御+2；不赋骑兵移动，避免和坐骑混淆 |
| 新三部位品级/强化 | 沿用旧普通/精良/珍稀倍率1/2/4，强化每级15%；首批可打造1–3档，条件和费用沿用同档普通装备 |
| 坐骑速度 | 品级1/2/3/4基础6/10/14/18；强化每级5%，四舍五入，最高速度27；坐骑不炼化五项属性 |
| 行军倍率 | 1+min(0.25,speed/100)；时间用原时间除倍率后向上取整，最少1秒 |
| 正规战行动优先值 | 原兵种speed × (1+min(0.15,speed/200))；全兵种受主将先手影响，仍同速守方优先 |
| 骑兵实际移动倍率 | 1+min(0.25,speed/100)，只对cavalry/heavy生效；先算旧移动含旧上限，再乘倍率并取整，不改变其他兵种 |
| 初始可获取坐骑 | 走将领装备页的“购置坐骑”，普通驮马，5000黄金，无铁匠铺门槛，要求1空装备位；精良及以上本批不提供获取来源 |

上述值为本作首版试玩值，不冒充热血三国原作数值。无坐骑档案为speed=0，各倍率1。速度不提高统帅；新衣物也不额外提高统帅。

## Review Focus

1. 穿新部位后旧套装不消失，旧佩饰/神兵/炼化数值不被误改。
2. 多城、旧在途、换装与刷新后不能借用另一将领当前坐骑加速原队伍。
3. 行动排序与实际移动分开；计谋强制移动、预备反应和撤退不重复乘坐骑。
4. 扩slots后礼包、普通掉落、铸神兵不能悄然扩奖或接受奇物/坐骑淬火。
5. 满库/余额不足/忙碌/只读会话下报价可看，但失败购置或换装不扣费、不生成装备。

## 文件职责

- `hero-system.js`：部位清单、旧部位/打造清单、旧套装兼容、新衣物、坐骑属性/报价/购置、速度档案；复用现有equipment数组，不新建重复装备仓库。
- `engine.js`：行军报价与出征快照、战斗行/排序/移动档案的使用和存档校验。
- `battle-stratagems.js`：计谋中的强制骑兵移动与预备反应读取已冻结行动/移动值。
- `npc-defense.js`：新守城野战骑兵行的移动档案；现有城防固定阶段顺序保留，先手加成应用于按速度排序的正规战，不重写城防流程。
- `hero-ui.js`、`web-edition.css`：八栏、速度单独展示、新装备图标复用现有sprite、普通坐骑购置与旧套装提示。
- 新测试文件无需修改脚本加载表；不新增生产脚本。修改前述引擎模块后生成`supabase/functions/_shared/game-runtime.mjs`。

### Task 1：八部位与旧装备兼容

**Files:** 修改`hero-system.js`、必要的`legend-quest.js`；新增`tests/equipment-eight-slots.test.cjs`。

**Interfaces:**
- Consumes：`HeroSystem.init(s)`、`valid(s)`、`stats(e)`、`setTier(s,id)`、`gift()`、`forgeQuote(slot,tier)`、`LegendQuest.forgeQuote(s,slot)`。
- Produces：`HeroSystem.slots`八部位；`legacySlots: string[]`固定weapon/armor/helmet/accessory；`forgeSlots: string[]`旧四部位+cloak/bracer/boots；`mountSpeed(e): number`；`stats(e)`坐骑返回空五属性对象，不向bonus加入speed。

- [ ] 写失败测试：用真实loadGame和HeroSystem，断言slots恰好8键且单槽替换，不允许同将领同槽重复；旧tier3四件stats与SET_BONUS不变；追加cloak/boots/mount后setTier仍3；换下旧accessory则旧setTier为0。
- [ ] 写失败测试：真实gift仍只增加8件旧四部位；满库空间不足不发奖不扣物品；forgeQuote('mount',1)与未知部位返回null，legendQuote对新槽位明确拒绝，旧神兵/旧refine重载数值完全相等。
- [ ] 运行`node --test tests/equipment-eight-slots.test.cjs`。Expected: FAIL，因为新slots和限定清单尚不存在。
- [ ] 实现清单分离和新衣物基础值；gift/drops/legend遍历显式旧清单，普通forge遍历forgeSlots。旧装备字段保持原状；本批不新增relic字段。mount只允许tier1–4、enhance0–10且无named/refine，valid拒绝未知slot和重复槽。
- [ ] 运行上述目标测试及`node --test tests/hero-points.test.cjs tests/legendary-weapon.test.cjs tests/hero-administration.test.cjs`。Expected: 全部PASS。执行`node --check hero-system.js`和`git diff --check`，Expected: exit0。
- [ ] 提交`feat: add eight equipment slots with legacy set compatibility`。

### Task 2：坐骑可购置与只读速度档案

**Files:** 修改`hero-system.js`；新增`tests/mount-equipment.test.cjs`。

**Interfaces:**
- Consumes Task1的mountSpeed/slots及原equip/unequip/enhance/salvage、Game会话写入保护。
- Produces `HeroSystem.mountProfile(s,id): {version:1,speed:number,march:number,initiative:number,cavalry:number}`（纯读取）；`validMountProfile(p): boolean`（严格5键，speed整数0–27，倍率必须匹配公式）；`mountQuote(): {gold:5000,tier:1,slot:'mount',reason:string}`；`buyMount(): string|null`（错误字符串或保存后null）。

- [ ] 写失败测试：普通mount enhance0速度6、enhance10速度9；tier4 enhance10速度27，各倍率受上限约束；无坐骑返回speed0和倍率1；mountProfile生成前后存档序列化相等。
- [ ] 写失败测试：报价只读，真实buyMount恰好扣5000黄金并增加1普通坐骑；余额4999/库满/只读会话拒绝且前后状态相同；装备转交/卸下按现有忙碌规则拒绝；正常保存重载速度一致；NaN/Infinity/负值/不匹配倍率档案拒绝。
- [ ] 测试使用真实装备对象和生产函数，核心固定值断言如下；并覆盖上一步的合法/非法输入：

```js
const e=loadGame(), H=e.evaluate('HeroSystem');
assert.equal(H.mountSpeed({slot:'mount',tier:1,enhance:0}),6);
assert.equal(H.mountSpeed({slot:'mount',tier:1,enhance:10}),9);
assert.equal(H.mountSpeed({slot:'mount',tier:4,enhance:10}),27);
assert.equal(H.validMountProfile({version:1,speed:6,march:1.06,initiative:1.03,cavalry:1.06}),true);
assert.equal(H.validMountProfile({version:1,speed:6,march:2,initiative:1.03,cavalry:1.06}),false);
```

- [ ] 运行`node --test tests/mount-equipment.test.cjs`。Expected: FAIL于新接口不存在。
- [ ] 实现上述接口。坐骑沿用装备容量和穿戴等级，不增加自由速度加点、不添加坐骑refine、不改旧强化数值；坐骑强化文案和stats另有速度值，普通属性bonus数值不变。
- [ ] 运行`node --test tests/mount-equipment.test.cjs tests/equipment-eight-slots.test.cjs tests/save-session.test.cjs`。Expected: 全部PASS；`node --check hero-system.js`和`git diff --check`exit0。
- [ ] 提交`feat: add purchasable mounts and bounded speed profiles`。

### Task 3：实际行军、正规战和骑兵移动

**Files:** 修改`hero-system.js`、`engine.js`、`battle-stratagems.js`、`npc-defense.js`；新增`tests/mount-combat.test.cjs`；扩充`tests/march-speed.smoke.test.cjs`；新增`tests/balance/mount-speed.cjs`。

**Interfaces:**
- Consumes Task2的mountProfile和validMountProfile。
- Produces 新expedition/battle可选`mountProfile`冻结档案；新己方battle row.stats可选`initiative`和`moveSpeed`成对出现，敌方不继承玩家档案。旧行无字段时分别回退stats.speed。
- `HeroSystem.actionSpeed(stats): number`返回stats.initiative或旧speed；`HeroSystem.movementSpeed(stats): number`返回stats.moveSpeed或旧speed。均纯读取，由hero-system.js导出，供计谋、正规战与NPC共用。movementSpeed返回冻结原始速度；各移动路径以movementSpeed(stats)/stats.speed取得倍率，乘在旧距离上限计算之后，避免被旧上限吞掉或再乘第二遍。

- [ ] 写失败集成测试：同seed/军队/主将下无马报价、回合日志和结果与基线完全相同；普通马行军为ceil(原时间/1.06)，返程同倍率；混编仍以最慢兵種决定；无主将侦察/运输不借马。
- [ ] 写失败测试：dispatch时保存mountProfile，途中穿戴变化不改变end/returnSeconds/战斗快照；读取第二城与正常重载不改变档案；旧在途无档案不得补当前马，旧战斗仍用旧speed。
- [ ] 写失败战斗测试：同speed骑兵装马后先行动，未装马仍守方优先；只cavalry/heavy的移动增加，archer/spear/器械距离不变；推进/撤退/计谋强制移动只乘一次；预备射击顺序使用initiative，骑兵移动使用moveSpeed；敌军不继承我军马。保存后篡改成负值或和mountProfile不匹配的快照被validSave拒绝。
- [ ] 运行`node --test tests/mount-combat.test.cjs tests/march-speed.smoke.test.cjs`。Expected: FAIL于马未影响真实行军/排序/移动。
- [ ] 在marchQuote套用主将速度档案，dispatch只计算一次报价并冻结。startBattle使用出征档案；新己方stats.speed保留基础数值，initiative按全兵种倍率，moveSpeed仅骑兵倍率；战场长度与基础射程不被改动。
- [ ] 正规战排序改用actionSpeed，骑兵移动先保留旧上限再乘倍率；计谋反应排序/移动复用同一冻结值，不再次读装备。不修改教学固定配置的无马结果；新NPC野战仅应用骑兵移动并冻结档案，保留原城防阶段顺序。
- [ ] 完善frozen/rows及NPC快照校验：缺字段兼容，出现新档案必须合法、成对字段匹配；不要迁移旧战斗stats.speed为新档案。运行目标测试及`node --test tests/battle-stratagems.smoke.test.cjs tests/hero-actions.smoke.test.cjs tests/defense-doctrine.test.cjs tests/city-defense.test.cjs tests/online-runtime.test.cjs`。Expected: 全部PASS。
- [ ] 写并运行`node tests/balance/mount-speed.cjs`：同一真实开局经济经礼包/建设/操练/购置流程取得普通马；不得填测试资源替代正常获取。至少包含无马/普通马/最高合法速度三组、混编与纯骑兵、5次固定种子；验收无马差异0、最高行军时间不低于原80%、initiative倍率不超过1.15、骑兵移动不超过1.25、普通非骑兵移动差异0、额外lead差异0。Expected: 断言通过并输出耗时/黄金/先手/移动报告。
- [ ] `node --check`上述修改JS、`git diff --check`exit0；提交`feat: apply frozen mount speed to marches and battles`。

### Task 4：手机八栏与发布准备

**Files:** 修改`hero-ui.js`、`web-edition.css`、`index.html`、`package.json`、`README.md`；新增`tests/equipment-eight-slots-ui.test.cjs`、`production/qa/equipment-eight-slots-2026-10-09.md`和`design/balance/mount-speed-2026-10-09.md`；生成在线运行时。

**Interfaces:** Consumes Tasks1–3；Produces真实八栏、坐骑购买/穿戴/卸下/速度比较、手机截图、CI通过的独立PR。旧accessory显示奇物槽，已有属性物品标“旧制佩饰”；未获剧情奇物时只显示空槽和来源说明，不添加不可用的主动按钮。

- [ ] 写失败UI测试：生产heroDetailModal显示8个独立槽；旧佩饰详情显示原属性；mount详情显示速度和三种作用百分比，不显示勇武/统帅加成或15%属性强化文案；forge仅7普通槽、legend仅旧4槽。真实hero开头动作调用buyMount并在失败时不重绘为成功状态。
- [ ] 运行`node --test tests/equipment-eight-slots-ui.test.cjs`。Expected: FAIL于新槽/速度/动作未接入。
- [ ] UI新增“购置普通坐骑 · 5000黄金”，展示库满/资金不足原因；购置有价格确认。装备栏手机2列、桌面4列，沿用现有美术体系。专用坐骑图标复用可识别现有骑兵/马图，不新增图片生成依赖。旧套装说明写清4旧部位而非所有穿戴件数。
- [ ] 实际浏览器360/390/440px检查8栏不横向溢出、价格确认、满库不扣费、购置/穿脱后速度即时更新、旧四件套增穿仍有效；1000px桌面回归。保存手机将领八栏、坐骑详情截图。Expected: 控件可见可点且真实动作正确，记录真机Safari未验证的范围。
- [ ] 运行目标UI/装备/坐骑测试，Expected: PASS。填写正常获取与速度模拟报告，不宣称已实现副本/奇物用途。
- [ ] 执行时核对远程版本并同步三处；运行`node scripts/build-online-runtime.cjs`，Expected: 成功生成与源码一致运行时；`npm test`，Expected: 全部通过；修改JS`node --check`和`git diff --check`exit0。
- [ ] 最终整批独立审查，覆盖Review Focus；重要问题用失败→通过测试修复，再全量验证。提交`feat: prepare eight-slot equipment and mount release`，推送功能分支，创建并attach PR，等待本次HEAD CI通过。保留工作树，仅等待发布指令。

## 自检与后续计划边界

本计划只覆盖规格第一批装备/坐骑基础。后续第二批独立计划覆盖黄巾主线与支线（最新路线草案待审阅）、援军令全租兵、失败重试/补租、整轮统一结算、UTC+8日首通与重复半额、黄巾箱与七件套；第三批覆盖南蛮主支线/蛮族箱、五名在野首抓奖励、罗盘和面具的实际路线。未将未实现功能藏在空按钮中。

五项Review Focus分别由Task1旧套装/奖品测试、Task2失败原子性、Task3旧档/多城/计谋冻结测试覆盖；Task4浏览器验证补实际交互。无生产新脚本，不漏新增清单；运行时生成在Task4。

计划已自检：任务接口一致；试玩值明确且有上限；各新部位有真实来源（新衣物打造，普通马购置），剧情奇物后续才发。旧神器遍历限制在Task1与UI Task4一致。待负责人审阅本计划；沿用本人逐项执行的方法，不自动发布。
