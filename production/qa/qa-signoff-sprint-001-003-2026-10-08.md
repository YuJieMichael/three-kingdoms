# QA 签字：Sprint 1–3
**Date**: 2026-10-08
**版本**: v0.34.34
**依据**: `production/qa/qa-plan-sprint-001-003-2026-10-08.md`、`production/qa/smoke-check-2026-10-08.md`
**配置**: qa.level standard · team.size individual · review_mode lean

本次由一个代理按 team-qa 流程完成（策略、计划、执行、签字），没有另起 qa-lead / qa-tester 子代理；没有浏览器和真机，人工项未执行，列为条件。

## 进入条件

| 条件 | 结果 |
|---|---|
| Smoke check 报告存在且为 PASS / PASS WITH WARNINGS | PASS WITH WARNINGS（`smoke-check-2026-10-08.md`） |
| 版本稳定 | `npm test` 551/551；静态启动检查通过 |
| 必做项状态 | Sprint 1 五项、Sprint 2 的 3-1 / 3-2、Sprint 3 三项均为完成；3-3 Not Started，不在本次范围 |
| 本范围内已登记的未关闭 bug | 开始时没有（`production/qa/bugs/` 原本不存在） |

## Test Coverage Summary

| 工作 | 类型 | 自动测试 | 人工 QA | 结果 |
|---|---|---|---|---|
| 1-1 开局节奏分析 | Logic | PASS（脚本可重跑，结果与报告一致） | — | PASS |
| 1-2 开局调参（官府 2 级 8 分钟、免费完成） | Logic | PASS（free-finish 2、hall-growth-pacing 5、growth-economy 10、onboarding 14） | 手机按钮未查 | PASS WITH NOTES |
| 2-1 美术规范 | Config/Data | 无需 | 文档抽查：9 节齐全 | PASS |
| 2-2 PNG 备用图 | UI | PASS（painted-art-fallback 4；PNG 3.2MB） | 旧 iOS 真机未查，无截图 | PASS WITH NOTES |
| 2-3 素材脚本 | Config/Data | 无需 | 脚本与说明在库；未重跑（需 macOS，会写入素材目录） | PASS WITH NOTES |
| v0.34.30 手机点击 | UI | PASS（touch-tap 2，只查规则） | iPhone 未查，无截图 | PASS WITH NOTES |
| 3-1 建造弹窗对比度 | UI | PASS（dialog-contrast 1，只查 CSS） | 手机未查，无截图 | PASS WITH NOTES |
| 3-2 开局经济与引导 | Logic | PASS（opening-economy 5；脚本首战 4.10–4.23 分钟、义兵全胜） | 手机上典民令与义兵派兵未查 | PASS WITH NOTES |
| 4-1 讨伐黄巾说明、客栈重名、占城提示、.gitignore | UI | PASS（late-game-balance 3 项） | 占城界面未查；发现 BUG-0001 | PASS WITH NOTES |
| 4-2 晋升珠宝折算 | Logic | PASS（late-game-balance 2 项、office-promotion 6） | 确认框未查 | PASS WITH NOTES |
| 4-3 守军倍数 | Config/Data | PASS（倍数断言、chapter-balance 3、yellow-cities 10；60 倍与 1 倍均 11 战全胜） | — | PASS |

## Bugs Found

| ID | 工作 | Severity | Status |
|---|---|---|---|
| BUG-0001 | 4-1 客栈重名 | S4 | Open |

BUG-0001：名字池只有 64 个，已招客栈将领很多时候选会再次重名。只影响长局，P3 待办。

本次没有发现 S1 / S2。

范围外但需要记住：4 天长局试玩中的「多城加军队粮食净产为负」（试玩表 S2）是平衡问题，已列为 Sprint 4 候选，不是本期交付功能的缺陷，不计入本判定。

## 其他发现（非 bug）

- 3-1、4-1、4-2、4-3 没有 story 文件，类型是推断的；`sprint-status.yaml` 只记 Sprint 3。
- `touch-tap`、`dialog-contrast` 和占城提示的测试只匹配源码文字，界面效果必须真机确认。
- 珠宝折算是「低价值优先、逐种向上取整」，剩余缺口很小时可能用掉一颗高价值珠宝，多付一点。符合设计说明，不算 bug；确认框会写明实际消耗。
- 典民令用完后引导不卡住、附近没有 1 级野地时跳过义兵步骤，代码里有处理，但没有单独测试。

## Verdict: APPROVED WITH CONDITIONS

判定说明：没有 S1 / S2；所有工作都有已运行的自动化证据或文档证据；PASS WITH NOTES 项都是「手机界面未在真机上确认」和一个 S4。按 team-qa 规则属于 APPROVED WITH CONDITIONS。注意：smoke check 的浏览器启动本次没有运行，若严格按 smoke-check 字面规则，界面部分应视为 NOT ASSESSED；下面条件 1–7 就是补上这一块，任何一项失败都要重新判定。

**Conditions**（负责人在手机上完成，截图存到 `production/qa/evidence/` 对应目录）:

1. iPhone Safari：大地图格子、主城建筑、城外田地单击一次就打开；手指轻微晃动仍算点击，真正拖动不误开。
2. iOS 15 或更早设备：城内、城外、建筑图标、大地图没有缺图（注意开局是否先闪空图）；新设备不额外下载 PNG。
3. 建造／升级弹窗：「完工产量 · N 级」「完工后的城池收益」深色字清晰。
4. 新档引导：资源田缺人口时出现「使用典民令」步骤并显示效率；用完后继续。
5. 新档引导：官府 2 级后「训练 30 名义兵 → 掠夺 1 级野地」在手机出征界面能完成，返城后继续。
6. 晋升：缺指定珠宝时确认框写明折算与另外消耗的珠宝，扣除数量一致；总价值不足时写明「折算也不足」。
7. 占领城池：出征界面写明主将留守新城、有「占领后返回」；没有空闲将领时说明原因。

不阻塞：BUG-0001（S4）可放到 polish；补 3-1、4-x 的 story 文件或在冲刺表注明。

### Next Step

先完成上面 7 项手机检查。全部通过即可视为 APPROVED，再运行 `/gate-check`；任何一项失败，用 `/bug-report` 登记并按严重度重新判定。BUG-0001 可延后到 polish。
