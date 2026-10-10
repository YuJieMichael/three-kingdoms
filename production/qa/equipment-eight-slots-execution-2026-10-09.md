# SDD ledger — plan: docs/superpowers/plans/2026-10-09-equipment-eight-slots.md
Base: origin/main 66a003962719b982e0b0a36c12d4c5457f899bba; feat/equipment-eight-slots; native execution.
Approval: 用户在解释七部位/八栏后回复“可以”，沿用上轮计划确认请求，开始装备前置批次。
Pre-flight: Task1 slots/legacySlots/forgeSlots → Task2 mountProfile and Task4 UI: consistent.
Pre-flight: Task2 frozen profiles → Task3 actionSpeed/movementSpeed and validators: consistent.
Pre-flight: Task3 profiles → Task4 UI and report: consistent.
Task 1: pending
Task 2: pending
Task 3: pending
Task 4: pending
Ruling: 技能脚本内部调用文件无执行权限，采用bash读取任务brief及手动记录同等测试/提交证据，不改技能安装目录 — 流程记录等价 — 若错误须修正记录。
Task 1 RED: 3/3 fail on expanded slots/set/forge.
Task 1: complete (66a0039..1a72174; equipment/hero-points/legendary/administration tests 19/19 PASS; node --check hero-system.js PASS).
Task 2: complete (1a72174..HEAD; RED four new API failures; target mounts/equipment/save-session 30/30 PASS, syntax PASS).
Baseline note: initial worktree missing pglite, npm ci installed pinned deps. Full run overlapped Task1 source writes and reports only runtime-freshness failures; not a clean baseline claim. Full fresh runtime suite required before completion.
Task 3: complete (4f4a4a8..HEAD; RED real march/movement failures; RED return snapshot 4000 vs5000 after tech change; GREEN nine integration checks; battle/defense/online 70 PASS; full suite 633/633 PASS after deps + runtime rebuild; five normal acquisition seeds/upper bound PASS).
Correction: npm ci failed because repository has no lockfile; npm install --no-package-lock --ignore-scripts installed pinned pglite successfully. Earlier baseline had missing pglite plus runtime freshness failures; final full suite resolved both.
Task 4 implementation: UI RED 4 failures → 4 PASS; real browser 360/390/440 and1000 verified two/four columns,8 slots,>=44px buttons,no horizontal overflow. Confirmed purchase5000 and equip. Screenshots saved. Await final branch review and PR.

Final review: one fresh reviewer examined 66a0039..c2cf32f; four Important, one Minor. Important fixes in one pass: empty-id idle horse, read-only equip/unequip, positive profile requires returnSeconds on expedition/garrison, selected-general campaign preview. Also legacy battle return uses no current equipment.
Ruling: 守城无马移动137.5→137虽标Minor，按玩家实际得到的行为重新定为Important：明确违反无马/非骑兵数值不变；同一修复批次补回归并恢复原值，成本为一项目标测试，无新增玩法。
Final RED: six added behavior regressions failed before fixes (two logs /tmp/equipment-review-red*.log); GREEN:22/22 target PASS. Garrison test fixture corrected via cloneActiveSave after scalar expedition modification; no product workaround. Fresh full suite running.

Final validation: whole suite initially642/643 with old gift-save return contract failure. Restricted save-failure return change to equip/unequip; existing gift contract retained. Save-session + mounts28/28 PASS; rebuilt runtime; fresh full suite643/643 PASS, node syntax/diff checks PASS. No second review dispatched.
Task4: implementation complete, c2cf32f plus final fixes; awaiting PR HEAD CI.
