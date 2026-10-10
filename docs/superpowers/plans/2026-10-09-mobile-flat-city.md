# 手机平面城图、改建入口与开局自动升级 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. 保留当前会话直接执行的既有偏好，不自行改成多代理开发。

**Goal:** 手机城内、城外采用容易点中的平面格子，已有资源田收纳改建入口，自动升级开局可手动开启。

**Architecture:** 在现有场景生成入口增加手机平面分支，复用建筑和资源田动作，电脑沿用城景；不生成两个同时可点击的场景。改建只改变详情的展开方式。自动升级只解除入口限制，不主动替玩家扣费。

**Tech Stack:** 全局 JavaScript、HTML、CSS；Node 原生测试；浏览器验证。

**Spec:** `design/quick-specs/mobile-flat-building-grid-2026-10-09.md`

## Global Constraints

- 手机范围沿用现有断点：视口宽度不超过 760px；大于 760px 保留城景。旋转或调整视口跨断点时更新展示。
- 城内与城外每行六列，不改地块索引；官府保留存档的四格占用。
- 360、390、440px 下，每个独立格子的可点击范围至少 44×44px，无横向滚动；页面允许上下滑动。
- 无存档新增字段；视图读取不改状态。新开局 autoUpgrade 仍为 false。
- 普通资源田改建入口折叠；空地直接显示产业选择，升级仍用原报价与确认。
- 推送前全量 npm test；版本三处一致，CI 通过后等待负责人发布或合并。
- 不在脏主工作区修改产品代码。执行时按 using-git-worktrees 检查并创建原生托管工作树，基于已发布 main；PR57 是独立待发布改动，不混入本分支。

## Review Focus

- 官府四格中任何位置点到均进入同一个真实官府，不生成三个空地按钮。
- 更新倒计时、切城或跨屏幕断点不能把轻点变成另一个地块动作。
- 手指滑动浏览后不打开详情，不触发建造；电脑鼠标操作仍正常。
- 官府 1 级已有自动升级存档与新存档都可显示开关，新存档不自行启动。
- 改建折叠的情况下正在施工资源田仍显示施工与取消入口，旧田生产规则不变。

## 文件职责

- `scene-ui.js`：手机模式判断、城内和城外格子生成、跨断点展示更新，保留原场景生成入口。
- `web-edition.css`：追加平面格子布局、整格点击与手机文字样式，不重写其余主题。
- `outskirts.js`：已有资源田“更换产业”折叠及提示，不改变 plotPlan/plotDevelop。
- `manual-ui.js`：开局自动升级按钮、文案与设置快捷入口。
- `layout-ui.js`：只有必要时分离“开局自动升级可用”与其余自动助手开放条件；不得顺带提前开放研究。
- `app.js` / `web-edition-ui.js`：仅当原场景滚动记忆、重绘或键盘导航绑定需要适配时修改，不改变世界地图拖动。
- 测试：新增 `tests/mobile-flat-grid.test.cjs`、`tests/starting-auto-upgrade.test.cjs`，保留并重跑已有触摸、资源田及自动助手测试。

### Task 1：可用的手机城内、城外平面格子

**Files:** 修改 `scene-ui.js`、`web-edition.css`；按实际调用需要修改 `app.js`、`web-edition-ui.js`；测试 `tests/mobile-flat-grid.test.cjs`。

**Interfaces:**
- Consumes：`S()`、`Game.buildings`、`Game.plotJob(index)`、`Game.unlockedPlots()`、`Game.currentCityId()`、现有 icon/art helpers。
- Produces：`sceneUseFlatGrid(): boolean`、`sceneFlatCityHTML(): string`、`sceneFlatOutskirtsHTML(): string`；原 `webCityScene()`、`webOutskirtsScene()` 签名不变。
- 手机城市按钮 `data-action="building" data-id="site:<index>"`；空地 `data-action="citySlot" data-id="<index>"`；资源田 `data-action="plot" data-id="<index>"`。

- [ ] 写失败测试：按实际 HTML 执行生成函数，核对每个可见按钮真实索引、名称、等级、施工状态；城内官府与 reserved 四格合为一个 grid span，reserved 不产生空地；资源田有建筑、空地与施工三种输入。
- [ ] 写只读测试：生成前后 `JSON.stringify(Game.state)` 相等；切到另一座有效城市后只读取当前城市布局。
- [ ] 运行 `node --test tests/mobile-flat-grid.test.cjs`，确认失败来自新函数或输出尚不存在。
- [ ] 实现上述三个函数，手机分支输出普通 grid；使用六列等宽格，格间距不超过 4px、格子最小高度 58px。美术只能在自身格内显示，整个 button 是唯一动作区域；官府依据已有四格位置跨度生成，不改变存档。
- [ ] 补跨断点更新：仅在 <=760px 的真假改变时请求现有 render；不为浏览器不存在的 headless 环境创建窗口依赖，不在生成函数注册监听器。平面布局不用 scene-stage、scene-scroll 的斜视和拖动样式。
- [ ] 实机式浏览器验证 360/390/440px：逐个格子中心与边缘动作正确，触摸上下滑动不点开详情，自动刷新前后目标一致；宽 1000px 仍有原城景。保存手机城内、城外截图。
- [ ] 运行 `node --test tests/mobile-flat-grid.test.cjs tests/touch-tap.test.cjs tests/outskirts-hit.test.cjs`；检查修改 JS 的 `node --check`、`git diff --check`。
- [ ] 提交 `feat: add flat city and resource grids for mobile`。

### Task 2：已有资源田的改建入口收纳

**Files:** 修改 `outskirts.js`、必要的 `web-edition.css`；扩充 `tests/mobile-flat-grid.test.cjs`。

**Interfaces:** Consumes 原 `plotModal(index)`、`plotPlan(index,type)`；Produces 同签名的详情，增加非持久化 `<details>`，标题“更换产业”。

- [ ] 先写失败测试：调用生产 `plotModal`，捕获 showModal 内容；已建资源田有正常升级，改建按钮包含在默认关闭的 details 内；空地产业按钮直接可见；施工田仍显示施工详情。
- [ ] 运行该测试并确认 RED。
- [ ] 把已有田的改建选项移入 `<details><summary>更换产业</summary>`，保持原 data-action、index:type 与禁用条件。说明“新产业从 1 级开始，原等级不保留”。不给空地套此折叠。
- [ ] 保留原改建确认、支付、施工及旧田产出规则；不增存档 UI 状态，不在详情显示时改变田地。
- [ ] 重跑目标测试，浏览器核对升级为主要操作、改建展开后可正常预览与取消。
- [ ] 提交 `ui: collapse resource field replacement options`。

### Task 3：自动升级开局可手动开启

**Files:** 修改 `manual-ui.js`，按实际依赖修改 `layout-ui.js`；测试 `tests/starting-auto-upgrade.test.cjs`，重跑 `tests/automation-settings.test.cjs`。

**Interfaces:** Consumes `autoUpgradeControls()`、`Game.setAutoUpgrade(enabled)`；Produces 官府 1 级可用按钮；保留引擎 API 与存档字段。

- [ ] 写失败测试：新游戏官府 1 级、autoUpgrade false 时 autoUpgradeControls 生成的开关不带 disabled，且不再声称官府 3 级开放自动升级。
- [ ] 验证新开局没有因 render 开启自动升级；手动开启后按原规则扣费排队，暂停后已开工项目继续；存档重载保持开关。
- [ ] 运行 `node --test tests/starting-auto-upgrade.test.cjs` 并确认 RED。
- [ ] 移除自动升级的界面门槛，删除对应过期提示。保持自动助手其余入口及自动研究原开放规则；若无法直接复用现有设置入口，则开局只显示自动升级和状态，官府 3 级再显示完整助手。
- [ ] 不改变自动升级候选、资源保留、图纸手动确认、建造队和模板互斥；不主动开启开关。
- [ ] 运行 `node --test tests/starting-auto-upgrade.test.cjs tests/automation-settings.test.cjs` 并核对旧存档 autoUpgrade true/false 都可进入有效状态。
- [ ] 提交 `feat: allow automatic upgrades from the start`。

### Task 4：回归、版本与可审阅 PR

**Files:** 修改 `index.html`、`package.json`、`README.md`；按需要生成 `supabase/functions/_shared/game-runtime.mjs`；新增 `production/qa/mobile-flat-grid-2026-10-09.md`。

**Interfaces:** Consumes Tasks 1–3；Produces 手机截图、完整测试证据、版本一致的 PR，尚未上线。

- [ ] 在执行工作树检查当前已发布和待合并版本，选择未占用的后续版本，并同步三处；避免与待发布 PR57 的 0.34.54 重号。
- [ ] 若最终改到 engine.js 或之前脚本，运行 `node scripts/build-online-runtime.cjs` 并提交产物；若只有界面脚本与版本查询参数改变，不无故生成运行时变动。
- [ ] 跑 `npm test`，只有全部通过才能推送；运行 `git diff --check`。
- [ ] QA 记录手机中心/边缘点击、滑动、自动重绘、官府四格、切城、横竖屏和桌面回归，真实 Safari 与模拟浏览器证据分别写清。先展示手机截图。
- [ ] 完成分支审查，提交并推送当前功能分支，创建 PR，调用 attach_artifact，等待本次 HEAD 的 CI 通过。
- [ ] 向负责人交付 PR 与测试结果，保留工作树；只有明确发布/合并后再合并、验证 Pages 并归档。

## 自检与后续边界

本计划覆盖手机平面图、收纳改建、开局自动升级三个已选改动；不包含新增名将、战场、坐骑、八部位或奇物。它们需独立实施计划，副本兵损和重复声望/经验选择仍在等待答复，不能把默认选择当作用户答案。

接口名称、点击动作与原生产函数一致；Task 1 覆盖五类 Review Focus 中的格子/重绘/滑动，Task 2 覆盖施工与改建，Task 3 覆盖开局开关。截图与测试须在实施后实际生成，本计划不代表检查已通过。

状态：计划已写成，待负责人审阅；执行方式沿用当前会话直接执行。
