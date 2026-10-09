# 技术债登记册（山河策 v0.34.34）

## Technical Debt Register
Last updated: 2026-10-08
Total items: 11 | Estimated total effort: 3S + 6M + 1L + 1XL

扫描范围（分母）：根目录 80 个 `.js`、25 个 `.css`、`index.html`、`scripts/build-online-runtime.cjs`、生成物 `supabase/functions/_shared/game-runtime.mjs`、`tests/` 下 70 个测试文件 + `tests/balance/` 7 个脚本。`TODO/FIXME/HACK` 标记：0 处（债务不以注释形式存在，以下均为结构性发现）。

Priority = Impact ÷ Effort（Low 1 / Med 2 / High 3 / Critical 4；S 1 / M 2 / L 3 / XL 4）。

| ID | Category | Description | Files | Effort | Impact | Priority | Status | Added | Sprint |
|----|----------|-------------|-------|--------|--------|----------|--------|-------|--------|
| TD-001 | Test | 联机运行时是手工生成物且无过期检测。`game-runtime.mjs` 760,220 B / 16,691 行，由 `build-online-runtime.cjs` 按 `index.html` 中 engine.js 之前的 36 个 `<script>` 顺序拼接并写入 `runtimeHash`；但没有任何测试比对 hash，`online/runtime.mjs` 直接 import 生成物，改了引擎忘记 `npm run online:build` 时联机测试会静默跑旧代码。另有 7 个 `online/*.mjs` 拷贝到 `_shared/online/`。今日实测 hash 一致（fresh）。成因：无构建步骤的取舍。 | supabase/functions/_shared/game-runtime.mjs, scripts/build-online-runtime.cjs, online/runtime.mjs, index.html | S | High | 3.0 | Open | 2026-10-08 | Sprint 1 |
| TD-002 | Test | 平衡测试的魔法阈值散落在断言里，无出处说明。全测试共 78 处 `assert.ok(x>=/<=数字)`，例：`growth-economy` 金币 90000–170000、50000–150000；`chapter-balance` totalHours 100–220；`late-game-balance` 河洛内城兵力 ≥1600、黄巾城 ≥250；`opening-economy` 首战 <10 分钟。调数值时无法区分"设计目标变了"和"回归"。 | tests/growth-economy.test.cjs, tests/chapter-balance.test.cjs, tests/late-game-balance.test.cjs, tests/opening-economy.test.cjs, tests/hall-growth-pacing.test.cjs | S | Med | 2.0 | Open | 2026-10-08 | Sprint 1 |
| TD-003 | Code Quality | CSS 被压成超长单行，无法 diff/审查。`classic.css` 34,640 B 仅 64 行，最长 19,551 字符（第 3 行）；`style.css` 38,439 B 仅 27 行，最长 16,134 字符；`city-defense-events.css` 3 行最长 2,342。任何改动在 diff 中都是整行替换，合并冲突概率高（多人/多 agent 并行时尤甚）。 | style.css, classic.css, city-defense-events.css, command-ui.css | S | Med | 2.0 | Open | 2026-10-08 | Sprint 1 |
| TD-004 | Architecture | 跨文件猴子补丁：通过重新赋值全局函数改行为，共 11 处，分布 3 个文件。`web-edition-ui.js` 7 处（render、toast、showModal、updateDispatch、tacticalLessonModal 保存原函数后包裹；battlePage、showInitialSaveState 直接覆盖）；`painted-art.js` 3 处（webCityBuildingArt、sceneResourceArt、buildingIcon）；`ink-map.js` 1 处（render 二次包裹）。另 `online-client.js` 运行时替换 `Game.generalBusy`。`render` 被包两层，最终行为取决于 `index.html` 第 122 行 `installWebEditionUI();installInkMapUI();` 的调用顺序与脚本加载顺序；`scene-polish.js` 定义的 sceneResourceArt 被 painted-art 覆盖，farm/lumber/quarry/mine 的 heritage 分支实际不可达。读代码无法从定义处知道真实行为。 | web-edition-ui.js, painted-art.js, ink-map.js, online-client.js, index.html | M | High | 1.5 | Open | 2026-10-08 | Sprint 2 |
| TD-005 | Architecture | CSS 层叠靠加载顺序 + `!important` 互相压制。`index.html` 依次加载 25 个样式表；`!important` 共 241 处分布 12 个文件：scene-ui 28 行、war-theme 21、web-edition 18、ink-map 16、scene-polish 10、layout-ui 8、heritage-layout 6、art 4 …（按含该关键字的行计）。`.modal` 在 style/classic/war-theme/web-edition 4 个文件里均有定义；`dialog-contrast.test.cjs` 甚至把"web-edition.css 必须在 war-theme.css 之后加载"写成断言。新增样式只能继续往后叠、加 `!important`。 | style.css, classic.css, war-theme.css, web-edition.css, scene-ui.css, layout-ui.css, ink-map.css, scene-polish.css, heritage-layout.css, index.html | L | High | 1.0 | Open | 2026-10-08 | Backlog |
| TD-006 | Test | 测试断言源码文本/切片源码执行，重构即误报。`touch-tap.test.cjs` 用正则匹配 grid-world.js 原文 `slop:event.pointerType==='mouse'?10:18`；`dialog-contrast.test.cjs` 要求 web-edition.css 含逐字压缩规则 `dialog .modal-info{color:#5e4b2c}`（格式化 CSS 即失败）；`command-interface.smoke.test.cjs` 以注释 `// Original SVG` 为界切 app.js 执行；`chapter-unlock.test.cjs` 取 app.js 中以 `const esc=` 开头的那一行执行；`release-version` 正则查 README 首行。成因：无模块系统，测试只能这样拿到 UI 函数。 | tests/touch-tap.test.cjs, tests/dialog-contrast.test.cjs, tests/command-interface.smoke.test.cjs, tests/chapter-unlock.test.cjs, tests/release-version.test.cjs | M | Med | 1.0 | Open | 2026-10-08 | Sprint 2 |
| TD-007 | Code Quality | 新旧美术管线并存。`assets/` 共四套：migrated 36M、realistic 13M、painted 11M、warfare 3.2M。painted 下旧图集 3 张 PNG 共 6.4M（outskirts-ac-v1 3.5M、resource-structures-ac-v3 1.5M、resource-sites-ac-v2 1.4M）与新管线 `buildings/` 20 AVIF + 20 PNG 回退（3.2M）并存；`resource-sites-ac-v2.png` 在代码中零引用（仅 README 提及），是 1.4M 死资源；`assets/realistic/` 仅被 art-assets.js 与预览页 scene-style-preview.js 引用。 | assets/painted/*.png, assets/painted/buildings/, scene-art-data.js, painted-art.js, art-assets.js, scene-style-preview.js | M | Med | 1.0 | Open | 2026-10-08 | Backlog |
| TD-008 | Code Quality | 其余 JS 也有压缩式长行：`web-art-data.js` 3 行最长 10,362；`app.js` 148 行最长 7,346；`hero-ui.js` 3,718；`campaign-ui.js` 3,394；`onboarding-ui.js` 22 行 17,750 B。`growth-guide.js` 142 行最长 875，属中等，不急。 | web-art-data.js, app.js, hero-ui.js, campaign-ui.js, onboarding-ui.js | M | Low | 0.5 | Open | 2026-10-08 | Backlog |
| TD-009 | Architecture | `engine.js` 是上帝对象：174,658 B / 1,179 行，单个 IIFE `Game`，41 行超过 500 字符、8 行超过 1,000 字符，最长 3,906 字符（第 1172 行，api 导出表）。它同时被浏览器和联机运行时使用。 | engine.js | XL | Med | 0.5 | Accepted — 拆分风险大、收益慢；只做增量抽取（见"不要重构"） | 2026-10-08 | Backlog |
| TD-010 | Architecture | 隐式加载顺序契约：78 个 `<script>` 共享全局作用域，无模块；顺序同时决定 UI 覆盖结果（TD-004）和联机运行时内容（TD-001，取 engine.js 及之前 36 个）。调整 index.html 顺序可能同时破坏前端与服务端。 | index.html, scripts/build-online-runtime.cjs | M | Med | 1.0 | Open | 2026-10-08 | Backlog |
| TD-011 | Performance | 测试套件 551 个测试全部通过，墙钟 23.5s、CPU 124s（多进程并行）；单进程机器或 CI 上会明显变慢。主要成本在长局模拟/平衡类测试。 | tests/*.test.cjs, tests/balance/ | M | Low | 0.5 | Open | 2026-10-08 | Backlog |

## 关键度量（2026-10-08 实测）

| 指标 | 数值 |
|------|------|
| JS / CSS 文件数（根目录） | 80 / 25（全部由 index.html 加载） |
| 最长行 | classic.css 19,551；style.css 16,134；web-art-data.js 10,362；app.js 7,346；engine.js 3,906 |
| `!important` | 241 处 / 12 个 CSS 文件；JS 内联样式 0 |
| 全局函数重赋值 | 11 处 / 3 文件（web-edition-ui 7、painted-art 3、ink-map 1）+ online-client 的 `Game.generalBusy` |
| 生成物 | game-runtime.mjs 760 KB / 16,691 行，36 个源文件，无过期测试 |
| 测试 | 70 个测试文件，551 测试，0 失败，23.5s 墙钟 |
| 平衡魔法阈值 | 78 处数值比较断言 |
| 美术资源 | 63 MB，四套目录；1 张 1.4 MB 图集零引用 |

## 下两个 Sprint 的 Top 5（风险 × 成本）

1. **TD-001 联机运行时过期检测**（S / High）。第一步：新增一个测试，按 build 脚本同样的规则重算 hash，与 `game-runtime.mjs` 中 `runtimeHash` 比较，不一致时提示运行 `npm run online:build`；同理比对 `_shared/online/*.mjs` 与 `online/` 源文件。
2. **TD-002 平衡阈值集中化**（S / Med）。第一步：建 `tests/balance/targets.cjs`，先把 growth-economy 的 4 个金币区间迁过去，每个阈值配一行出处（对应 RULES.md / design 文档条目）。
3. **TD-003 格式化单行 CSS**（S / Med）。第一步：只对 `classic.css` 做纯格式化（每条规则一行或标准缩进），提交前后用浏览器截图对比，规则文本 hash 不变；先确认没有测试逐字匹配 classic.css（当前只有 dialog-contrast 匹配 web-edition.css，所以 web-edition.css 暂不动）。
4. **TD-004 猴子补丁显式化**（M / High）。第一步：不改行为，在 `web-edition-ui.js`、`painted-art.js`、`ink-map.js` 顶部加一段注册表注释，列出被覆盖的函数与先后顺序；再加一个测试断言 `render` 的包裹顺序（web-edition → ink-map）。之后逐个把 painted-art 的 3 处覆盖改为原函数内的钩子（如 `buildingIcon` 先查 `PaintedArt.has`）。
5. **TD-006 源码文本测试改为行为测试**（M / Med）。第一步：把 `touch-tap.test.cjs` 的两条正则改为在 vm 中加载 grid-world.js 并派发 pointer 事件验证阈值 10/18；`dialog-contrast` 改为解析规则后比对颜色值而非逐字串——这同时为 TD-003 格式化 web-edition.css 解锁。

## 不建议重构（风险高、收益低）

- **整体拆分 engine.js / 引入模块系统或打包器**：它同时供浏览器与联机运行时使用，hash 与加载顺序牵动服务端；551 测试多数通过 `tests/helpers/game.cjs` 依赖当前全局形态。只在新增功能时把新逻辑放进独立 `*-system.js`。
- **一次性清除 241 处 `!important` / 合并 25 个 CSS**：无视觉回归测试，覆盖关系靠加载顺序，大改必然出现难以发现的样式回退。只做"新代码不再新增 `!important`"，并在改到哪个组件时就地收敛。
- **删除旧美术目录（migrated / realistic / 旧图集）**：存档与经典 UI、预览页仍引用；仅可删除已确认零引用的 `resource-sites-ac-v2.png`（先确认 README 说明后再删）。
- **格式化 `game-runtime.mjs`**：它是生成物，应改生成器而非产物。
- **压缩式 JS 长行（TD-008）单独重排**：收益只在可读性，且会与并行开发产生大面积冲突；随功能改动顺带处理即可。
