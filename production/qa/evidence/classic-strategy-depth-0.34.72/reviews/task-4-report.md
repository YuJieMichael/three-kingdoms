# Task 4 实施报告

## 范围与实现

- 在 `feat/classic-strategy-depth`、基线 `efecb03` 上增添常山赵云、长沙黄忠、西凉马超、许昌荀彧、柴桑周瑜。稳定 ID 依次 `local_7100000000000006` 至 `local_7100000000000010`。
- 前三城为县城 Lv8，后两城为郡城 Lv9，沿用第三章通关发现；郡城门槛固定为原 16 城的 `ceil(16/3)=6`，总名城变为 21 后仍为 6。
- 五位名将 raw level 都为 20，静态 atk/def/pol/wis/bonus 逐项沿用保留在野定义；成长起点 65/65/70/65/70，由真实俘获随机降 1–3 级后登记成长，统率没有乘三。稳定身份由城 ID 映射。
- 每城守军盾3500、枪4000、弓3500、骑1500，共12500。县城门120000、郡城门250000，保护1.6、箭楼2000、射程1300，必须携攻城器械。这些为本作参数，不宣称史料兵数。
- 新城沿用围城忠诚、断粮、劝降、离间、占领后俘获、爵位及推恩规则，没有新首俘箱。五段原创短故事放在名将册折叠卡中；按钮与展开入口沿用现有 >=44px 样式。
- 扩大旧档守军记录 5→10；保留旧记录和合法退休在野将领及此前合法重复身份存档。名将册以可靠身份归并，能够指向旧在野或城破招降的实际拥有 ID。畸形守军行不被迁移掩盖。
- 去重检查覆盖城内俘获/招降、在野俘获/招降、城破俘获/招降以及直接候选招募。普通同名客栈武将不能仅凭名字获得名将身份，也不因此被拦截。
- 劝降、离间、城内招降、在野招降、城破招降保存失败时撤回本次变更。
- 修改现有脚本，无新增生产全局文件；共享运行时按要求重建。未改版本、未推送、未合并。

## TDD 与验证

### RED

在产品代码修改前执行：

`node --test tests/named-hero-stories.test.cjs > /tmp/task4-red.log 2>&1`

初始9项全部失败（pass0、fail9）。有意义失败包括守军数仍5而非10、新城没有定义/记录导致真实围城无法开始、名将旧身份不能归并。新增城不存在所致缺字段 TypeError 属于预期缺功能失败。随后补全最终15项合同测试。

### GREEN

- `node --test tests/named-hero-stories.test.cjs`：最终15/15通过，包含五座新城通过现有真实出征/战斗/忠诚结算/招降接口的围城路径；每城无箱、爵位门槛、随机损失、统率、非法捕获/来源拒绝、迁移、旧档兼容、跨路径去重及保存失败回滚。
- `node --test tests/named-hero-stories.test.cjs tests/hero-identity.test.cjs tests/named-garrison.test.cjs`：实现初轮32/32通过（当时新文件9项）。
- `node --test tests/named-hero-stories.test.cjs tests/hero-codex.test.cjs tests/named-city.test.cjs tests/city-conquest-economy.test.cjs`：43/43通过（当时新文件12项）。仅更新已变动名城/名将总数、UI标题，不削弱原经济或准入断言。
- 最终UI定向 `node --test tests/hero-codex.test.cjs`：10/10通过；加查五位新名字、故事、六城门槛及读取不写存档。
- 对9个修改生产JS及新测试执行 `node --check`：10/10通过。
- `node scripts/build-online-runtime.cjs`：51脚本，hash `944435813d87`。
- `git diff --check`：无输出，通过。
- `npm test`：唯一一次全套 1028/1028 通过，fail0、skip0，64159ms，日志 `/tmp/task4-full.log`。生产代码在全套前已定稿；随后仅强化现有UI断言，并再跑该文件10/10。

所有围城测试均为严格合同夹具，提供预备军队/资源仅用于测试真实接口行为，**不是正常获得经济可行性的证据**。没有改平衡模拟脚本。负责人另用正常1x第三章及江陵围城所得状态实测新增名将，正常经济与手机截图在整合验收继续。

## 文件

生产：`named-city-data.js`、`named-garrison.js`、`named-city-system.js`、`hero-system.js`、`hero-identity.js`、`governance-system.js`、`world-targets.js`、`engine.js`、`hero-ui.js`。

生成：`supabase/functions/_shared/game-runtime.mjs`。

测试：新增 `tests/named-hero-stories.test.cjs`，适配 `tests/hero-codex.test.cjs`、`tests/named-city.test.cjs`、`tests/city-conquest-economy.test.cjs`。

## 自审

- 核对稳定ID顺序、原统计、原16城门槛、坐标范围/当前引擎分配后无重复、旧在野不升级到新起点、原始任务1–3保持。
- 新捕获等级期望从统一 `NamedGarrison.recruitmentLevel` 读取，消除将新英雄误套太史慈65级的旧末支分支。
- 原野外定义继续保留验证；原重复存档只读合法，不再能经新动作添第三身份。
- 无改注册清单：本任务没有新增生产全局脚本。未暂存根代理的 training/factions 设计、QA/evidence、平衡脚本或 scratch。
- 无发现实现阻断；实际正常经济、浏览器手机截图另在整合验收，不以夹具宣称完成。

## 提交

`b3948ba feat: add five named-city hero stories with stable recruitment identities`，仅上述14文件。报告位于已忽略的任务目录，未强制加入版本库。提交后仍留根代理的两份设计修改、QA/evidence和平衡脚本未暂存；没有推送或合并。

## 修复轮 1（BASE b3948ba）

独立评审 Important：Game.recruit 直接候选招募的保存失败没有回滚；Minor：统率宽泛上限不能证明初始化与成长正确。

- 招募在 `tick()` **之前**保存完整 state 快照，成功保留既有支付/加入/候选消耗行为；保存失败恢复该快照和活跃城镜像，并返回保存失败。saveMode 的 write-error 仍保留，继续阻止后续写入。只修改这个已触及招募路径，不重写其它旧交易。
- 新测试通过正常 refreshInn 获得候选，并构造合法双城、两小时待结算工资/产出；真实 localStorage.setItem 抛错后完整 JSON 状态、主/副城费用、薪俸时钟、候选、英雄归属均恢复。另覆盖正常成功只扣费一次、仅消费选中候选，以及之前可靠来源去重。
- 五位将领改为精确断言 rawlead=200、初始 lead=430/400/430/360/500、famousStarts.leadGrowth=0，再经真实 addXp 升级后 lead+10。统御另断言 retired.def+(captureLevel−1)*3，升级+3。
- controller 已纠正最初将 def（统御）的成长误写为 lead（统率）的说明：退休定义没有显式 lead，但生成旧wild.hero默认 d.level*10；不修改生产属性公式。

RED：修复产品代码前，`node --test --test-name-pattern='direct inn' tests/named-hero-stories.test.cjs`，1通过1失败。失败为真实存储错误后整个state与招募前快照不同，日志 `/tmp/task4-fix1-red-clean.log`。初次运行成功用例有跨vm数组原型差异，改成两端 Array.from 后再跑上述干净RED。

GREEN：`node --test tests/named-hero-stories.test.cjs tests/hero-identity.test.cjs tests/hero-codex.test.cjs` 46/46通过，日志 `/tmp/task4-fix1-green.log`；最后将初始统率期望固定为独立常数，再运行 `node --test tests/named-hero-stories.test.cjs`，17/17通过，日志 `/tmp/task4-fix1-final.log`。

语法：engine.js、新测试均 node --check 通过。`git diff --check` 通过。重建共享运行时51脚本 hash `87bcf0491ade`。按controller本轮要求不重复完整套件。只提交 engine、新测试与生成runtime三文件。

自审：快照在tick前而非扣款前，覆盖跨城薪俸/产出结算；保存错误模式保留；成功与可靠身份去重原语义保持；精确测试期望没有再从生产初始统率常数读取。

正常经济：controller已告知五条正常新增名将路线全部实际招降，俘获64/64/69/64/69且存档合法，郡城此前通过12场县战达到6城。本代理未重跑，不把夹具改写成经济证明。

本轮提交：`0319d76 fix: roll back direct recruitment when saving fails`，仅上述三文件；未暂存root设计、计划、QA/evidence或balance脚本。
