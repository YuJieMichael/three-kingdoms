# 名将身份与统率 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** 为现有15名历史名将提供可靠身份和专属初统，并补齐将领升级后的统率成长，作为日常培养前置。

**Architecture:** 新增只读HeroIdentity解析来源；HeroSystem保存静态初统表并计算基础统率，Game.general接入现有装备/科技计算。旧战斗快照沿用，缺快照的旧出征与战斗使用原统率读取公式。本批不新增培养存档或新人物获取入口。

**Tech Stack:** 原生JavaScript全局脚本、Node内置测试、VM真实引擎模拟。

**Spec:** `design/quick-specs/hero-leadership-2026-10-09.md`；后续范围为 `design/quick-specs/hero-daily-cultivation-2026-10-09.md`。

## Global Constraints

- 从最新origin/main建立隔离工作区，保留主目录已有改动；执行时使用using-git-worktrees技能与原生工具。
- 本计划仅实现身份与统率；日常、阶段、专长曲线、神兵联动各自后续计划，不能宣称一起完成。
- 使用专稿26人初统候选表，只有已经正式招募的15名现有历史人物可触发身份；新增11人不提前启用。
- 不按姓名赋身份；普通客栈、原创陈岚、林朔、苏砚、严秋无初统加成。
- 原始lead和招募等级不覆写；纯读取不写存档；旧出征与旧战斗不追改。
- 校场、关卡限兵、器械破门、NPC固定攻防配置保持；正式守城仅现有atk/def快照，不新增统率算法。
- 新脚本更新index与AGENTS指定6份测试脚本清单；重建online运行时；推送前npm test全通过。
- 发布版本三处一致；PR通过CI后等负责人发布/合并指令，不自动合并。

## Review Focus

- 同名客栈人物及只复制来源字段：没有完整来源记录时不能得到初统。任务1测试。
- 旧档将领招募等级与当前等级不同：保留原始统率并补成长，不把面板写回。任务2测试。
- 旧出征或rules2战斗缺将领快照：使用原统率公式，不临时强化。任务3测试。
- 高人口治理与小兵力战斗：覆盖封顶，不因超额统率重复放大。任务4模拟。
- 多城查看与切换：身份从同一全域来源读取，纯查询不改变任何城市存档。任务1/2测试。

## 文件职责

- 新增 `hero-identity.js`：只读来源身份映射。
- 修改 `hero-system.js`：初统表、裸统率计算；不改变已有招募原始记录。
- 修改 `engine.js`：当前general读取和旧战斗回退分开；不修改五项中其它四项。
- 修改 `index.html`、AGENTS脚本清单、runtime生成物：加载与发布一致。
- 新增 `tests/hero-identity.test.cjs`、`tests/hero-leadership.test.cjs`、`tests/hero-leadership-snapshot.test.cjs`：行为验收。
- 新增 `tests/balance/hero-leadership.cjs`、`design/balance/hero-leadership-2026-10-09.md`：数值对照与结果。

### Task 1: 可靠名将身份

**Files:** 新增hero-identity.js与tests/hero-identity.test.cjs；修改index.html、tests/helpers/game.cjs及city-defense、office-promotion、save-session、named-city、city-strategy.smoke的测试脚本清单。

**Interfaces:** `HeroIdentity.key(s,id) -> string`；只解析已招募身份，失败返回空串，不初始化状态。野将warrior→weiyan、strategist→xushu，其余历史wildLine沿表；四镇守由NamedGarrison定义与名城已招募记录验证。

- [x] 写失败测试：通过现有真实招募接口得到15位历史将，逐个断言key；陈岚、初始人物、同名客栈、未知id均返回空串。
- [x] 加来源伪造测试：移除招募记录、原始静态字段不匹配、只复制id/wildLine均返回空串；不以当前成长等级与原始招募等级不等误拒真名将。
- [x] 加只读和多城测试：查询前后JSON存档一致，切到其它城不改变身份。
- [x] 运行 `node --test tests/hero-identity.test.cjs`，确认因缺接口失败。
- [x] 实现来源匹配：野将须origin/wildLine、recruited列表、recruited传闻id与原始静态字段匹配；镇守须固定id、recruited记录、静态人物字段匹配。读取NamedGarrison须在运行时而非脚本初始化时。
- [x] 将脚本加入全部加载清单，放在hero-system之后、engine之前；运行 `node --check hero-identity.js` 与身份测试，确认通过。
- [x] 运行runtime构建，提交明确文件列表；提交不包含主目录无关改动。

### Task 2: 初统表与成长读取

**Files:** 修改hero-system.js、engine.js；新增tests/hero-leadership.test.cjs。

**Interfaces:** `HeroSystem.initialLeadership(key) -> number`（未知key返回0）；`HeroSystem.baseLeadership(raw,currentLevel) -> number`；`Game.general(id)`保持既有接口。初统表逐项采用专稿数据。

- [x] 写失败测试：26个静态key唯一且值匹配专稿；实际现有名将能触发、预留人物不能凭名字触发。
- [x] 断言20级无装备科技：普通将200、典韦350、关羽450、周瑜500；同级其它四项属性等于改动前。
- [x] 断言5级招募lead50升到20级为200；原始lead100升到20级为250；0/缺失lead沿当前等级×10；10000级合法且没有整数溢出。
- [x] 加组合断言：额外装备统率20、科技2、虎符时，20级关羽统率 `(200+250+20)*1.2*1.5`；装备、套装与专长都只叠加一次。
- [x] 运行 `node --test tests/hero-leadership.test.cjs` 确认因缺接口/旧数值失败。
- [x] 实现裸统率：非零原始lead加10×max(0,currentLevel-raw.level)，其余currentLevel×10；Game.general先加初统和现有extra.lead，再科技/虎符。合法旧档原始level缺失若出现则先补专稿兼容规则，不强制拒档。
- [x] 加旧档往返、重复导入和跨城查看前后原始记录一致测试；离队重招不能保存最终面板lead作为原始lead。
- [x] 运行 `node --check hero-system.js`、`node --check engine.js` 和身份/统率测试；重建runtime并提交此批明确文件。

### Task 3: 旧快照兼容

**Files:** 修改engine.js；新增tests/hero-leadership-snapshot.test.cjs。

**Interfaces:** engine内部 `general(id,legacyLeadership=false)`：默认采用任务2，legacyLeadership=true只令lead使用原 `(raw.lead || level*10)` 规则，其它属性仍沿原计算；不增加API返回字段或存档版本。

- [x] 写快照测试：更新前在途generalSnapshot与已开始战斗generalSnapshot逐字段保持；新派遣snapshot包含新初统。
- [x] 写缺快照旧档测试：合法旧出征删除generalSnapshot后导入，startBattle生成的lead采用legacy公式；合法rules2旧战斗缺snapshot时battleRound回退同样采用legacy公式。
- [x] 写硬条件测试：校场人数超额、虎牢限兵仍拒绝；不能靠新lead绕过出征条件。
- [x] 运行 `node --test tests/hero-leadership-snapshot.test.cjs`，确认旧缺快照回退测试在任务2后失败。
- [x] 实现legacy参数，将startBattle的缺快照回退与battleRound的缺快照回退明确改用legacyLeadership=true；新dispatch保持正常general快照。其它读取入口逐个核对，不批量把所有general调用改成legacy。
- [x] 对正式守城atk/def旧快照进行回归，确认本批未改变守城算法或已冻结数值。
- [x] 运行三份新增测试与现有named-garrison、hero-points、city-defense、general-growth.smoke测试，确认全部通过；重建runtime并提交。

### Task 4: 数值与发布验收

**Files:** 新增tests/balance/hero-leadership.cjs、design/balance/hero-leadership-2026-10-09.md、production/qa/hero-leadership-2026-10-09.md；修改规格实施结果、package.json、index.html、README.md及生成runtime。

**Interfaces:** 复用tests/helpers/game.cjs的loadGame/真实派遣接口；使用任务1/2提供的身份和读取，不另实现一套战斗公式。

- [x] 编写模拟：普通将/典韦/关羽/周瑜同等级、无装备和相同科技，固定种子1/7/19；各带5000/30000/60000/120000兵。实验临时提高校场和人口容量满足硬条件；日志明确这些是机制对照，不是正常经济可达证据。
- [x] 每组记录lead、覆盖率、战斗结果、回合、战损；同人物旧lead对照采用legacy计算后冻结快照，不直接改战斗伤害公式。
- [x] 治理对照固定内政、资源建筑和时间窗口，比较人口50000/500000/1500000；完全覆盖时产量不再随lead增长，记录普通/名将差异。
- [x] 运行 `node tests/balance/hero-leadership.cjs`、`node tests/balance/chapter-four.cjs`、`node tests/balance/named-siege.cjs`；写入真实输出与原基线差异。失败必须修复或调整设计并明确回报，不能宣称已平衡。
- [x] 从隔离工作区当前版本递增一版，更新所有?v=、package和README；不沿用主目录旧版本号。准确说明仅身份/初统已实现，四项培养尚未开放。
- [x] 重建runtime，运行 `npm test`；确认完整通过和生成物freshness通过，记录实际测试数，不预填。
- [x] 使用requesting-code-review技能请求整批独立审阅，修复确认问题后只重跑相关与必要全套检查。
- [ ] 提交、推送、创建PR、attach_artifact；等待CI通过。未收到本批发布指令不合并。

## 后续计划边界

本批完成后再写日常培养独立计划：明确版本化进度/日常账本、五任务模板、四阶段文案及界面。之后接原主神兵故事联动。培养翻倍范围推荐仅自身属性，用户尚未对该单独选择明确回复；该选择不影响当前身份/初统批次，不阻止其先实施。

## 自查

本计划覆盖统率专稿身份、逐人表、成长、装备叠加、只读、旧快照、硬规则、治理、模拟及发布要求。新人物获取和四项培养明确后续，不将范围文档误作本批完成证据。接口定义在各任务固定，所有五项Review Focus都有对应测试或模拟。计划待负责人审阅并选执行方式。
