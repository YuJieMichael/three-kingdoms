# 南蛮入侵QA · 候选0.34.58

实现：三段9主线6支线、两个副本独立日奖励、蛮族七部位套、罗盘密道、易容面具与黄巾祭坛潜入。五位在野名将另批。未发布。

## 自动验证

- 原PR60独立基线672/672。
- Task1/2完成时全量678/678；Task3为683/683；Task4为687/687；手机与面具描述后691/691。
- 活动黄巾v57固定旧档迁移保留回合、敌军、指令与池；缺失路线字段补齐，非法值拒绝，查看不写。
- 实际战斗验证支线额度只发一次；潜入答案在开战前保存，失败/换装/重载不能重选；隐藏入口与普通入口共用贡献。
- 实际交错结算与跨日验证两个首箱独立、后续半额、放弃不结算；满库保留箱及面具资格，奇物唯一且不可强化/炼化/分解。
- 正常成长种子1/7/19、七日两副本与五组同阵容效果对照通过，见数值报告。

## 浏览器实际操作

独立localhost8138，正常成长模拟存档与该模拟时钟；浏览器鼠标操作，不等同于真实iPhone Safari触摸。

- 实际完成15节点，领取并穿戴面具；选择“归林”后敌军仅盾100，避开弓70，仍进行正式战斗。
- 暂停潜入战斗→刷新→通过更多入口续战，最终报告1800声望/320经验/蛮族箱1；完整15节点回执与存档valid=true。
- 实际开箱选择坐骑后箱数0，装备入库；实际购令2500黄金、1名民兵失败，池2999/待救治1/编队0，随后确认放弃。
- 手机360/390/440、桌面1280：页面scrollWidth分别等于视口，dialog scrollWidth等于clientWidth，无横向溢出。截图文件对应像素已检查。
- 自动UI测试覆盖重复部位开箱确认；容量满与错误口令主要由真实引擎测试验证，未声称这些场景均做过浏览器点击。
- 浏览器发现入口只写黄巾、重载后南蛮结束跳回黄巾；均已RED→GREEN修复。

截图在 `production/qa/evidence/nanman-campaign-v0.34.58/`：map-360/390/440/1280、infiltration-440、battle-440、equipment-440、clear-440、failure-440。

## 最终交付状态

最终提交前全量测试693/693通过（2026-10-10，约34秒），git diff --check通过。整批独立审查通过：Critical0/Important0/Minor0；审查者独立693/693与正常种子1/7/19、七日循环、五组对照通过，额外黄巾s6潜入保存重载通过。当前HEAD远端CI在PR创建后另查。未验证真机Safari；发布需负责人明确指令。PR叠加于黄巾PR60，先完成前置依赖再合并。

## 执行裁定与审查记录归档

# SDD ledger — plan: docs/superpowers/plans/2026-10-10-nanman-campaign.md

Base: 8eda03fd41729e9aac99766b9e37cbf2a81c1952
Execution: Native, six tasks; final whole-branch review.
Pre-flight: Task1→2/3/4/5 campaign config signatures agree; Task2→3 route migration agrees; Task3→5 attempt then enter agrees; Task4→5 box/relic keys agree; Task2/3/4→6 normal APIs agree.
Task 1: pending
Task 2: pending
Task 3: pending
Task 4: pending
Task 5: pending
Task 6: pending

Ruling: skill helper scripts lack executable permission in this installation; keep the same task briefs/BASE/test results manually in this ledger rather than modify global skill permissions — process metadata only; helper automation not exercised.
Task1 BASE: 8eda03f. RED: three nanman-data cases fail for missing campaign behavior. GREEN: 6/6 data tests.

Task 1: complete — 6/6 data tests, integrated suite678/678; Task1+2 interface integration before commits after setup dependency resolved.
Task 2: complete — 9/9 state tests RED→GREEN, suite678/678; fixed old battle fixture preserved.
Baseline: PR60 independently verified672/672. First new-worktree attempts lacked pglite; npm ci failed because project has no lock; npm install --package-lock=false restored dependency. A concurrent source edit invalidated a runtime-freshness check; final678/678 was run on stable inputs with rebuilt runtime.
Ruling: Task3 requires valid mask identity/claim to exercise the actual equipped relic; move mask identity/claim subset fromTask4 toTask3 under the failing combat tests — avoids fabricated save bypass; rewards and set remainTask4.
Task3 RED: five combat cases fail on missing nanman resolver, mask API, hidden route.

Task 3: complete — 12/12 combat tests RED→GREEN; suite683/683. Mask identity/claim prerequisite moved as ruled.
Task4 RED: actual nanman settlement dereferences yellow reward; box ignores campaign.

Task 4: complete — 12/12 rewards/equipment tests RED→GREEN, suite687/687.
Task5 RED: three UI cases fail for missing two campaign cards, pending invalidation and duplicate part confirmation.

Task5 main RED→GREEN:21/21 UI/touch tests, suite690/690. Extra mask description test RED: generic text gave no use; fix+suite pending.
Task6 simulator initial failures: consumed leftover same-day drill quota, then gold depleted by repeated high-cost drills. Corrected normal strategy to one affordable drill/day plus full-branch yellow daily XP and paid tokens; research actual combat/protection for mixed rentals. No resource/level injection. Three seeds now passed without changing enemy table.

Task 5: complete — 22/22 UI/touch tests, suite691/691. Long wall-clock runtime happened during host activity; exit0 all passed.
Task6 started: normal seeds1/7/19 main49rounds2279loss, full65rounds2738loss, mixed40rounds488loss; normal growth to10 another8.036days, 8 drills, no enemy adjustments. QA origin8138 server; tab13.

Task6 implementation verification complete:693/693; normal main/full/mixed, seven-day dual reward cycle, five matched probes, yellow/chapters/long-run/realm regression exit0; screenshots360/390/440/1280; actual UI15nodes clear1800/320/box1, pause/reload, mask equip, mount box, understrength loss/abandon.
Browser found entry only Yellow and active campaign lost after settle following reload; two UI regressions RED→GREEN; fixed before review.
Ruling: screenshot bytes are JPEG and viewport changes can capture previous size within one call; recapture each after a separate observation and use .jpg extensions — avoids mislabeled/cropped evidence; additional UI artifact passes only.
Final review: pending.

Task6 Ruling: capacity-full and duplicate-slot scenarios use actual engine/DOM unit regressions rather than claiming every scenario was clicked in browser — browser verified full run, mask, mount, retry, reload and four widths; cost: modal touch behavior in those edge cases remains unverified on real Safari.
Task6 Ruling: named-general combined leadership estimate is limited to fixed set bonus+5 and excludes pending PR57 values — avoids treating a separate dependency as implemented; cost: final merged named-general gear totals need verification after dependencies land.
Task6 Ruling: initial Task1/2 commits followed their shared interface integration and stable full suite after dependency setup — focused RED/GREEN was observed per task; cost: commit isolation is less strict than the original per-task sequence.
Final browser reloaded candidate .58 and confirmed “战场 · 黄巾 / 南蛮”; refreshed440 screenshot. Temporary QA files/tab13/server8138 removed, viewport reset; user8137 untouched.

Final review: fresh reviewer gpt-6-astra high, read-only BASE8eda03f..a1dfdf6; Critical0/Important0/Minor0. Independently693/693 and normal seeds1/7/19, seven-day cycle and five probes passed; additional Yellow s6 infiltration reload passed. No fix pass needed.
Final: Ruling: reviewer declined real iPhone Safari and capacity/duplicate touch interactions — retain explicit unverified status; engine/DOM and emulated widths suffice for candidate PR, not real-device acceptance — cost if wrong: touch edge cases may need follow-up.
Final: Ruling: reviewer declined PR57 combined named-general leadership — retain fixed+5 evidence only and verify combined totals after dependencies merge — cost if wrong: final merged balance may need adjustment.
Final: Ruling: reviewer declined remote CI/publication — query current HEAD push and PR checks separately before delivery, do not merge — cost if wrong: local success would not establish remote readiness.
