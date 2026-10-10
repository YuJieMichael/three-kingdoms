# SDD ledger — plan: docs/superpowers/plans/2026-10-09-yellow-turban-campaign.md
Base: equipment HEAD e899a02; feat/yellow-campaign, native worktree. User继续 authorizes approved plan execution; initial numbers subject to real balance verification.
Pre-flight: Task1 node graph/reward → Tasks2/3/4 completed IDs and effects: consistent.
Pre-flight: Task2 shared run/sourceCity → Task3 independent battle and Task6 UI: no city scope storage.
Pre-flight: Task3 terminal m9 → Task4 settle clears run atomically; no regular battle loot.
Pre-flight: Task4 relic unlock/inventory → Task5 typed gear and Task6 claims: consistent.
Pre-flight: Task5 seven set slots and compass → Task7 daily real box simulation: consistent.
Ruling: 系统脚本辅助文件无执行权限，沿用手动brief/验证/提交台账；不修改技能目录，错误时修正记录。
Tasks1–7 pending.
Baseline643/643 PASS on equipment e899a02 before source changes; install pinned deps without lockfile. Task1 RED3/3 (missing data), GREEN3/3 route/reward/projection. named-city and city-strategy now consume shared helper rather than own script lists; verified helper updated.
Task 1: complete (e899a02..HEAD; data3/3 PASS, syntax/diff PASS, runtime rebuilt).
Task2 Ruling: inventory strict validator requires ManualData records before new token can be saved; moved the two reward-only item definitions forward from Task4, no purchase/reward action yet — prerequisite validation — if wrong remove definitions.
Task2 RED4/4 missing APIs; GREEN state/cities/save-session35/35, full650/650 PASS after runtime rebuilt. Earlier suite cached pre-rebuild artifact and failed only runtime freshness16 cases, rerun fresh resolved. Task 2: complete (0f6c735..HEAD; source-city data remains shared, no city army change).
Task3 Ruling: added pauseBattlefieldBattle/resumeBattlefieldBattle ephemeral screen ownership, since plan requires other heroes can defend after pausing while ongoing rental snapshot persists; no new save field — otherwise simultaneous round resolution could occur — if wrong simplify screen gating.
Task3 RED4/4 missing formal snapshot plus forged source stats RED; GREEN integration6/6, existing combat/lesson/defense/save77/77; final full656/656 PASS. Task 3: complete (0cabd04..HEAD). Rental conservation, source tech, paused other-general defense and mount reload verified.
Task4 RED3/3 missing reward actions; GREEN actual main/full-branch and UTC8 settlements13/13 integration, full659/659 PASS. Receipt key-count corrected10, preserving actual reload. Token2500 fixed purchase/source current projection; no repeat settlement. Task 4: complete (0497fae..HEAD).
Task5 RED4/4 missing box/relic APIs + relic UI destructive controls RED; GREEN equipment14/14 and UI9/9, full664/664 PASS; all typed item validators and warehouse handling verified. Task 5: complete (c248614..HEAD).
Task6 Ruling: 正常玩家浏览器验证依赖Task7的开局养成模拟，提前编写该模拟作夹具；不直接注入资源/经验/科技 — 确保界面验证真实门槛 — 若错需重做浏览器证据。
Task6 RED3/3 missingUI; GREEN4/4 UI and equipment9/9, full668/668 PASS. Actual browser full15nodes ->1600/256/box1, branchpool500, boxmount/equipment claim; 360/390/440/1280 no document/dialog overflow; cards minheight105.5 minwidth179.3. Equipment screenshot saved; Safari unverified. Task 6: complete (a9de08d..HEAD). Task7 active.
Task7 RED normal path prerequisite workshop/wall exposed simulation wrong assumption, fixed only route; RED malformed deployment throws and shared commands mutate → GREEN6/6state. Normal seed1/7/19 all main/allside clear; same-boss probes improved; seven real daily boxes green. Full670/670 PASS, syntax and generatedruntime green. Chapter2/3, chapter4,longsoak PASS; realm pending; review pending.
Task 7: complete (271538e..HEAD; implementation/normalbalance670/670PASS, campaign24/24PASS, existing chapter/realm72h×5/longsimPASS). Delivery PR/CI pending final whole-branch review. Raw balance and mobile failure/retry evidence committed.
Correction: Task7 campaign target run was27/27, not24/24. Final reviewer dispatched fresh gpt-6-astra high; this is the one review required by executing-plans. No implementer agents.
Final review: fresh reviewer e899a02..2454fe1 found Critical wages/departure corrupts active campaign save, Minor missing UI script lists; Declined to judge none.
Final: Ruling: 新UI脚本清单缺口由Minor升为Important并纳入一次修复 — AGENTS第6条明确所有新增脚本，没有UI例外；补齐规范及共享loader验证 — 若错只增加引擎测试VM的UI加载开销，生产无变化。
Final fix pass: wages busy includes run.general; between nodes/combat/offline reload and release departure RED→GREEN. Shared fixture UI loader RED undefined→GREEN function; all six prescribed test paths covered (two use shared helper). Affected UI/combat/governance30/30 PASS; final full suite pending.

Final: fixed wage departure invalid save — between nodes/combat/offline/release regression RED→GREEN, suite672/672. Final: fixed UI loader checklist — shared fixture loader RED→GREEN, suite672/672. Final normal3-seed/boss/daily7-box simulation PASS after fix. Deferred minors: none. PR/CI delivery follows, no merge.
