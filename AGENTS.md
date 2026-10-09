# AGENTS.md · 三国城志 / 山河策

给 Codex、ChatGPT 等代理读的项目说明。规则与 `CLAUDE.md` 的「本项目规则」一致；Claude Code 专用的子代理、技能、钩子在 `.claude/`，其他代理把它们当作流程文档阅读即可。交接时的项目状态见 `docs/HANDOFF-2026-10-09.md`。

## 项目

- 浏览器三国策略游戏（单机为主，联机原型未开放）。纯 JavaScript / HTML / CSS，无框架、无打包（ADR-0001）。脚本按 `index.html` 的顺序作为全局脚本加载。
- 线上：https://yujiemichael.github.io/three-kingdoms/ （GitHub Pages，`main` 分支根目录自动发布）。
- 仓库：`YuJieMichael/three-kingdoms`。

## 常用命令

- 本地运行：`npm start`（或 `node server.cjs`），打开 http://127.0.0.1:8137/ ；也可在仓库根目录 `python3 -m http.server 8765`。
- 测试：`npm test`（Node ≥ 18，约 580 个，`node --test tests/*.test.cjs`）。
- 数值 / 长局模拟（`tests/balance/`）：`archer-onboarding.cjs`（开局与十阶补给）、`chapter-progression.cjs`（第 2–3 章正常经济）、`chapter-four.cjs`（第四章规则战）、`named-siege.cjs`（名将名城围城）、`realm-soak.cjs` / `long-run-soak.cjs`（多城长局与粮食）。直接 `node tests/balance/<文件>` 运行。
- 联机运行时：`node scripts/build-online-runtime.cjs`。

## 必须遵守

1. **提交说明里绝不出现 `[skip ci]`**（标题、正文都不行），否则 CI 会跳过测试。
2. 推送前运行 `npm test`，全部通过再推。CI 在每次推送和拉取请求时运行同一套测试。
3. 发布流程：分支改动 → 开拉取请求 → CI 通过 → **负责人说「发布」或「合并」后**再合并到 `main`。多个叠加的 PR 按顺序逐个合并。
4. 每次发布更新版本号，三处一致：`index.html` 里所有 `?v=`、`package.json` 的 `version`、README 标题与更新说明（`tests/release-version.test.cjs` 检查）。
5. 改了 `index.html` 中 `engine.js` 及之前的任何脚本，运行 `node scripts/build-online-runtime.cjs`，并一起提交 `supabase/functions/_shared/game-runtime.mjs`。
6. **新增脚本文件**时，除了 `index.html`，还要加到测试的脚本清单里：`tests/helpers/game.cjs`，以及自带清单的 `tests/city-defense.test.cjs`、`tests/office-promotion.test.cjs`、`tests/save-session.test.cjs`、`tests/named-city.test.cjs`、`tests/city-strategy.smoke.test.cjs`（搜索相邻文件名即可找到位置）。
7. 新增存档字段要有迁移（旧档自动补齐）和严格校验（`engine.js` 的 `validSave` 或对应系统的 `valid`），并保证「查看界面不改存档」（引导、地图读取只投影不写）。
8. 合并后若 Pages 没有自动构建：`gh api -X POST repos/YuJieMichael/three-kingdoms/pages/builds`。

## 与负责人协作的习惯

- **一律用中文回复**，说人话，少术语。
- 只在负责人说「发布 / 合并」时合并上线。
- 改了画面的版本，上线前先给截图（手机尺寸优先，负责人用 iPhone 17 Pro Max Safari）。
- 负责人说「出门了 / 有选项直接帮我选推荐」时，按推荐选项继续，回来汇报。
- 大改动先出设计方案（写在 `design/quick-specs/`），列 2–3 个选项和推荐，负责人选定后再做；做完用模拟验证并写回文档。
- 不使用 Scenario GameDev OS。
- 账号、密码、令牌一律由负责人自己输入，代理不代填。

## 代码结构要点

- 引擎核心：`engine.js`（状态、存档迁移与校验、战斗、出征、经济）。很多函数是很长的单行，修改时用精确的字符串替换，改完 `node --check <文件>`。
- 数据与规则模块（都在 `engine.js` 之前加载）：`chapter-data.js`（第 2–4 章，第四章关卡规则在节点的 `rule` 字段）、`named-city-data.js` / `named-garrison.js`（名城与名将镇守忠诚）、`yellow-city-data.js`、`city-strategy.js` / `city-specialty.js`（城池特色与特产）、`hero-system.js` / `hero-bonds.js`（将领、装备、羁绊）、`general-growth-*.js`（专长路线）、`legend-quest.js`（铸神兵）、`legendary-weapons.js`（传奇神兵）、`progression.js`（任务、珠宝、保底）、`governance-system.js`（民心、断粮）、`siege-data.js`（攻城）。
- 界面：`*-ui.js`；样式按层叠顺序加载多个 CSS 文件，新样式一般追加到 `web-edition.css`。
- 试玩版范围：`playtest-config.js`（地址加 `?dev` 显示联网入口、测试工具、未开放道具）。设置里的「兑换码」：`60` / `1` 设倍率，`100w` 领取测试资源（可选次数）。

## 流程文档（CCGS）

- 当前里程碑：`production/milestones/public-playtest.md`（公开试玩版，已批准）。
- Sprint：`production/sprints/sprint-00N.md`、`production/sprint-status.yaml`。
- QA：`production/qa/`；回顾：`production/retrospectives/`；技术债：`docs/tech-debt-register.md`。
- 设计：`design/quick-specs/`、数值报告 `design/balance/`、故事 `design/narrative/`、备案 `design/backlog/`。
- 各流程步骤的写法（如何做数值检查、QA 计划、冲刺规划）见 `.claude/skills/<名称>/SKILL.md`，可以照着执行。
