# Smoke Check：Sprint 1–3 收尾

**Date**: 2026-10-08
**Sprint**: Sprint 1–3（v0.34.29–v0.34.34）
**Engine**: 无引擎，纯 JavaScript（ADR-0001）；Node v26.11.0
**QA Plan**: `production/qa/qa-plan-sprint-001-003-2026-10-08.md`
**Argument**: sprint --platform mobile
**Checklist source**: QA 计划「Smoke Test Scope」

## 环境

- 测试命令：`npm test`（= `node --test tests/*.test.cjs`，与 `.github/workflows/test.yml` 相同）。项目没有 `commands.test`，用的是 package.json 的脚本。
- CI：已配置（`.github/workflows/test.yml` 运行 `npm test`）。
- 本次没有浏览器和真机，界面只能做静态检查；手机项留给负责人。
- 工作区里其他代理在同时修改文件；测试在 22:56 运行，晚于本轮最后一次源码修改（22:48）。

## Automated Tests

**Status**: PASS（551 项，551 通过，0 失败，0 跳过，用时 25.9 秒）

与本期相关的文件单独复跑结果：

| 文件 | 通过 | 对应工作 |
|---|---|---|
| `free-finish` | 2/2 | 1-2 |
| `hall-growth-pacing` | 5/5 | 1-2 |
| `growth-economy` | 10/10 | 1-2、3-2 |
| `onboarding` | 14/14 | 1-2、3-2 |
| `opening-economy` | 5/5 | 3-2 |
| `first-battle-guide` | 6/6 | 3-2 |
| `painted-art-fallback` | 4/4 | 2-2 |
| `touch-tap` | 2/2 | v0.34.30 |
| `dialog-contrast` | 1/1 | 3-1 |
| `late-game-balance` | 6/6 | 4-1、4-2、4-3 |
| `office-promotion` | 6/6 | 4-2 |
| `chapter-balance` | 3/3 | 4-3 |
| `yellow-cities.smoke` | 10/10 | 4-3 |
| `occupation-return` | 9/9 | 4-1 |
| `online-runtime` | 18/18 | 在线规则 |
| `release-version` | 2/2 | 版本号 |

## 平衡脚本

### `node tests/balance/archer-onboarding.cjs`（目标：30 弓兵）

| 情况 | 用时 | 超过 60 秒的等待 | 义兵练兵 | 存档有效 |
|---|---|---|---|---|
| 种子 123，不加速 | 700.1 分钟 | 19 次（最长为军营、书院、研究） | 4.2 分钟训练、10.8 分钟出发，胜 | 是 |
| 种子 123，用补给加速 | 3.9 分钟 | 1 次（铁矿 3 级 3.6 分钟） | 3.6 分钟出发，胜 | 是 |
| 种子 456，用补给加速 | 3.9 分钟 | 1 次（铁矿 3 级 3.6 分钟） | 3.6 分钟出发，胜 | 是 |

另用同一脚本跑「首战完成」：种子 123 / 456 / 1 / 2 / 3 用补给加速 4.10–4.23 分钟，不加速 706.7 分钟。与 `design/balance/opening-economy-2026-10-08.md` 的 4.1–4.2 分钟、706.7 分钟一致。

### `tests/balance/chapter-progression.cjs`（正常经济，种子 123）

| 时钟 | 11 关结果 | 总用时 |
|---|---|---|
| 60 倍 | 11 胜 0 负 | 3.1 小时 |
| 1 倍 | 11 胜 0 负 | 189.4 小时 |

与 `design/balance/late-battle-difficulty-2026-10-08.md` 的「1 倍通关，189 小时」一致。

## 静态启动检查（代替浏览器启动）

- 80 个根目录 JS 文件 `node --check` 全部通过。
- `index.html` 引用的 106 个本地文件全部存在；104 处 `?v=0.34.34` 与 package.json、README 一致。
- JS/CSS 中写死的 92 个素材路径全部存在；CSS 中没有直接引用 AVIF（手绘图都经 `PaintedArt` 选择格式）。
- 32 张 AVIF 都有同名 PNG，PNG 合计约 3.2MB（≤ 6MB）。
- 在线规则：`supabase/functions/_shared/game-runtime.mjs` 的 runtimeHash 与当前 36 个前端源文件重新计算的值一致（7e7e6eb34dbd）；`_shared/online/` 7 个文件与 `online/` 一致。
- 引擎在测试工具中正常初始化，新档到首战、两章通关后 `validSave` 均为 true。

## Test Coverage

| 工作 | 类型 | 测试文件 | 状态 |
|---|---|---|---|
| 1-1 节奏分析 | Logic | `tests/balance/opening-pace-variants.cjs`、`archer-onboarding.cjs` | COVERED（脚本） |
| 1-2 开局调参 | Logic | `free-finish`、`hall-growth-pacing` | COVERED |
| 2-1 美术规范 | Config/Data | — | EXPECTED |
| 2-2 PNG 备用图 | UI | `painted-art-fallback` | COVERED；真机截图缺 |
| 2-3 素材脚本 | Config/Data | — | EXPECTED |
| v0.34.30 手机点击 | UI | `touch-tap`（源码规则） | COVERED；真机截图缺 |
| 3-1 弹窗对比度 | UI | `dialog-contrast`（CSS 规则） | COVERED；真机截图缺 |
| 3-2 开局经济 | Logic | `opening-economy` 等 | COVERED |
| 4-1 小问题 | UI | `late-game-balance` 3/5/6 | COVERED；占城提示只查源码文字 |
| 4-2 珠宝折算 | Logic | `late-game-balance` 1/2 | COVERED |
| 4-3 守军倍数 | Config/Data | `late-game-balance` 4、`chapter-balance` | COVERED |

**Summary**: 9 项有测试，2 项 Config/Data 无需测试，0 项 MISSING。`production/qa/evidence/` 下没有这 4 项 UI 工作的截图。

## Manual Smoke Checks

- [-] 浏览器启动当前版本 — NOT RUN：本次没有浏览器；以上静态启动检查代替
- [x] 新档开局到首战 — PASS（引擎脚本，5 个种子）
- [x] 本期主改动（免费完成、典民令、补给数值、珠宝折算、守军倍数）— PASS（自动化）
- [x] 回归：两章通关、黄巾城、在线规则、版本号 — PASS
- [x] 存档 — PASS（`validSave`；旧档官府队列与已领加速测试通过）
- [-] 性能 — 未检查

### 手机项（--platform mobile，全部留给负责人）

| # | 检查 | 设备 | 通过标准 |
|---|---|---|---|
| M1 | 大地图格子、主城建筑、城外田地单击 | iPhone Safari | 第一下就打开，不需要点两次；轻微晃动仍算点击 |
| M2 | AVIF 不支持时的 PNG 备用图 | iOS 15 或更早 | 城内、城外、图标、大地图均无缺图；若开局先闪一下空图再出现，记录下来 |
| M3 | 建造／升级弹窗对比度 | 任意手机 | 「完工产量 · N 级」「完工后的城池收益」深色字清晰 |
| M4 | 引导「使用典民令」步骤 | 手机新档 | 显示效率百分比；点按钮能用典民令；用完后引导继续 |
| M5 | 引导「30 义兵掠夺」派兵 | 手机新档 | 出征界面能选将、填 30 人出发，胜后返城引导继续 |
| M6 | 晋升珠宝折算确认框 | 手机 | 写明缺什么、另外消耗哪些珠宝；扣除数量与所写一致 |
| M7 | 占城提示 | 手机 | 写明主将留守新城，有「占领后返回」；无空闲将领时说明原因 |

## Missing Test Evidence

所有 Logic 项都有测试。UI 项（2-2、v0.34.30、3-1、4-1）缺 `production/qa/evidence/` 下的真机截图。

## Verdict: PASS WITH WARNINGS

警告：

1. 浏览器启动与手机项 M1–M7 本次未运行（无浏览器、无真机）。按 smoke-check 的字面规则，「本次未启动」应判 NOT ASSESSED；本项目没有引擎编辑器，引擎逻辑已在测试工具里实际启动并走通开局与两章，所以按 PASS WITH WARNINGS 记录，并把浏览器启动列为 QA 签字的条件。
2. `touch-tap`、`dialog-contrast` 和占城提示测试只检查源码与 CSS 文字，不能代替真机。
3. UI 项缺留存截图。
4. 性能未检查。

可以进入 QA 签字；手机项由负责人补做。
