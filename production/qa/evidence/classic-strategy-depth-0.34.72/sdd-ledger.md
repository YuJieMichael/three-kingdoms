# SDD ledger — plan: docs/superpowers/plans/2026-10-11-classic-strategy-depth.md

Ruling: 沿用负责人全部同意、不再询问的授权，书面方案和执行方式推荐选项直接执行 — 明确用户偏好高于技能反复审批 — 选错会导致可撤销返工。
Ruling: 采用七项独立实施、每项审查、单个0.34.72候选PR — 限制共享engine冲突，当前不发布 — 成本是交付时间而非线上风险。
Ruling: 保留诊断236b9af作为本次前置证据；复用干净managed worktree — 不碰用户主checkout — 成本为PR多一条有用诊断提交。
Ruling: NPC营地为主动开启，不自动夺玩家城池；旧档默认关闭 — 新互动需要可预测兵损 — 后续全面势力战争可能需追加设计。
Ruling: 新历史副本复用黄巾/蛮族箱并明确提示 — 满足随机七部位既定装备机制 — 后续独立套装要新增美术和数值。
Ruling: 五新名将为城内将且原有攻城准入冻结2 — 保留退休在野旧将及难度 — 新城市地图位置为本项目布局。

## Preflight

|Tasks|Producer / consumer|Check|
|---|---|---|
|1|Own requirements / tests|伤兵扣缺口只在priority+autoHeal，旧默认一致；可负担与留薪黄金一致|
|2|Own requirements / tests|公开等级与类型权限，不读敌军power；推荐不等于胜利|
|3|Own requirements / tests|特色额外乘法只本城且新增队列；既有队列冻结|
|4|Own requirements / tests|新增5source identities不恢复退休野将；原5围城阈值冻结|
|5|Own requirements / tests|1轮tick、营地上限3、新frozen faction通道；不借用RegionalFront记录|
|6|Own requirements / tests|固定演练走真实战斗，不赠正式奖励，旧课保持|
|7|Own requirements / tests|2×15节点与独立campaign日账；旧快照配置不变|
|8|Own requirements / tests|candidate版本集中更新；公开路线失败保留，截图先于发布|
|1–2|city-local heal/queue → public getNode/intel|Sequential commits; preserve earlier API/defaults; shared engine/schema hooks remain independent, scope/source identity checked|
|1–3|city-local heal/queue → scoped rates/new training|Sequential commits; preserve earlier API/defaults; shared engine/schema hooks remain independent, scope/source identity checked|
|1–4|city-local heal/queue → identity/maps/capture|Sequential commits; preserve earlier API/defaults; shared engine/schema hooks remain independent, scope/source identity checked|
|1–5|city-local heal/queue → frozen incoming/settlement|Sequential commits; preserve earlier API/defaults; shared engine/schema hooks remain independent, scope/source identity checked|
|1–6|city-local heal/queue → lesson battle resolution|Sequential commits; preserve earlier API/defaults; shared engine/schema hooks remain independent, scope/source identity checked|
|1–7|city-local heal/queue → campaign snapshot/battle|Sequential commits; preserve earlier API/defaults; shared engine/schema hooks remain independent, scope/source identity checked|
|1–8|city-local heal/queue → version/evidence/integration|Sequential commits; preserve earlier API/defaults; final integration verifies inherited contracts|
|2–3|public getNode/intel → scoped rates/new training|Sequential commits; preserve earlier API/defaults; shared engine/schema hooks remain independent, scope/source identity checked|
|2–4|public getNode/intel → identity/maps/capture|Sequential commits; preserve earlier API/defaults; shared engine/schema hooks remain independent, scope/source identity checked|
|2–5|public getNode/intel → frozen incoming/settlement|Sequential commits; preserve earlier API/defaults; shared engine/schema hooks remain independent, scope/source identity checked|
|2–6|public getNode/intel → lesson battle resolution|Sequential commits; preserve earlier API/defaults; shared engine/schema hooks remain independent, scope/source identity checked|
|2–7|public getNode/intel → campaign snapshot/battle|Sequential commits; preserve earlier API/defaults; shared engine/schema hooks remain independent, scope/source identity checked|
|2–8|public getNode/intel → version/evidence/integration|Sequential commits; preserve earlier API/defaults; final integration verifies inherited contracts|
|3–4|scoped rates/new training → identity/maps/capture|Sequential commits; preserve earlier API/defaults; shared engine/schema hooks remain independent, scope/source identity checked|
|3–5|scoped rates/new training → frozen incoming/settlement|Sequential commits; preserve earlier API/defaults; shared engine/schema hooks remain independent, scope/source identity checked|
|3–6|scoped rates/new training → lesson battle resolution|Sequential commits; preserve earlier API/defaults; shared engine/schema hooks remain independent, scope/source identity checked|
|3–7|scoped rates/new training → campaign snapshot/battle|Sequential commits; preserve earlier API/defaults; shared engine/schema hooks remain independent, scope/source identity checked|
|3–8|scoped rates/new training → version/evidence/integration|Sequential commits; preserve earlier API/defaults; final integration verifies inherited contracts|
|4–5|identity/maps/capture → frozen incoming/settlement|Sequential commits; preserve earlier API/defaults; shared engine/schema hooks remain independent, scope/source identity checked|
|4–6|identity/maps/capture → lesson battle resolution|Sequential commits; preserve earlier API/defaults; shared engine/schema hooks remain independent, scope/source identity checked|
|4–7|identity/maps/capture → campaign snapshot/battle|Sequential commits; preserve earlier API/defaults; shared engine/schema hooks remain independent, scope/source identity checked|
|4–8|identity/maps/capture → version/evidence/integration|Sequential commits; preserve earlier API/defaults; final integration verifies inherited contracts|
|5–6|frozen incoming/settlement → lesson battle resolution|Sequential commits; preserve earlier API/defaults; shared engine/schema hooks remain independent, scope/source identity checked|
|5–7|frozen incoming/settlement → campaign snapshot/battle|Sequential commits; preserve earlier API/defaults; shared engine/schema hooks remain independent, scope/source identity checked|
|5–8|frozen incoming/settlement → version/evidence/integration|Sequential commits; preserve earlier API/defaults; final integration verifies inherited contracts|
|6–7|lesson battle resolution → campaign snapshot/battle|Sequential commits; preserve earlier API/defaults; shared engine/schema hooks remain independent, scope/source identity checked|
|6–8|lesson battle resolution → version/evidence/integration|Sequential commits; preserve earlier API/defaults; final integration verifies inherited contracts|
|7–8|campaign snapshot/battle → version/evidence/integration|Sequential commits; preserve earlier API/defaults; final integration verifies inherited contracts|

Task 1: pending

Task 1 BASE: b8130fe
Task 1 implementer: /root/depth_recovery
Ruling: 恢复留金使用本城economyBudget.salaryReserve（本城全体承担薪俸＋欠薪） — 工资归属现有按城规则 — 错选全局会重复留金导致恢复停滞。
Ruling: 七份独立spec以同一顺序计划的七个完整任务执行 — 各自有规则/文件/API/测试，避免重复全局约束和交接失配 — 成本为未来独立发布时需拆出子计划。
Ruling: 修正计划的既有模块文件名为world-targets/world-targets-ui，名册在engine/hero-ui，城池UI由相关已有文件承接 — 按实际代码路径，不增虚构文件 — 错误名称会造成不必要重复模块。
Task 1 earned evidence: /tmp/classic-depth-recovery.json; seeds1/19 14.9/15.1h800, seed7 821 actualrecover; no new overshoot, no hero departed.
Task 1 mobile: 390/440/1280 recovery screenshots; document scrollwidth equalsviewport, choice row44px; raw screenshots archived candidateQA.
Task 1: fix round 1/5 started (0 addressed, 1 open — pre-payroll healing leaves23h not24h; fixed BASE6ad80b7; original implementer resumed).
Task 1 cannot-verify: earned72h complete above, viewport screenshots complete; actualSafari notavailable and finalwholebranch deferredTask8, not claimed verified.
Ruling: 更正先前“五位对应准入2”的错误推断；真实准入按16名城ceil(16/3)=6，Task4冻结6 — 原代码named-city-system.js:13与实际模块常量确认 — 错用2会无意降低现有名将郡城难度，现已在分派前修正。
Task 1: fix round 1/5 (1 addressed, 0 open — post-payroll recovery reserves; commits6ad80b7..f39bc10).
Task 1: complete (commits b8130fe..f39bc10, review clean; actual earned72h rerun on e0263ad unchanged).
Task 2 BASE: e0263ad
Task 2: in progress
Task 2 implementer: /root/depth_targets
Ruling: 三阶段练级仅普通野地，原nearby列表保留；stage可选center默认本城，复用玩家地图中心 — 新手练级不应隐含城战器械门槛 — 成本为固定寨练级另走旧地图入口。
Ruling: 来源城恢复链接为纯读取弹窗，切城采用原显式确认 — 查看战报不改档 — 成本为跨城治疗多一次明确切城。
Ruling: 分阶段练级默认新手，但保留“全部附近”原列表入口 — 新功能不删原查询能力 — 成本为多一个短芯片按钮。
Task3 exploratoryearned input: 三种正常旧档均连续三次真实青石城胜利后归属新城；90s恢复冷却真实等待，兵损21/21/21与伤兵10/10/10、经验196/195/194保留。仅准备探路，最终在完整候选复跑。
Task 2 earned evidence: /tmp/classic-depth-targets.json; seeds1/7/19 first public beginner target, actual1scout types-only and battle victories, xp51/48/46, zero new losses/wounds. Screens training390/440/1280 no page overflow, stage buttons44px.
Task 2: implemented3224f42, full1005 pass; reviewer /root/depth_targets_review in progress.
Task 2: complete (e0263ad..3224f42, independent reviewer Approved, no findings). Screenshot and earned-route limitations resolved by root; trueSafari still unavailable.
Task 3 BASE: 3224f42
Task 3: in progress
Task 3 implementer: /root/classic_review4 (fresh Task3 assignment on previously completed unrelated review seat; spawning depth_territory failed service thread limit, no worker created).
Ruling: 服务端thread limit下复用已结束且未参与当前七项的代理席位，以全新taskbrief执行 — 无创建新代理能力，维持每项独立实施/审查身份 — 成本为该席位保留旧任务上下文；明确禁止重做历史任务。
Ruling: NPC营地采用纯公开叠加，野战使用真实势力守军与同一份粮金，来袭中的营地禁止新野战 — 防止打弱原野地刷营地奖励/双结算并兼容Task2排除 — 错选叠加策略会增加地图与冻结快照接线工作，需集中校验。
Task 3 earned evidence: /tmp/classic-depth-territory.json; 1/7/19 actual3victories→ownedbuilt青石, 24h+reload valid, foodfactor1.05/gains4.2/h, others1. Root screenshots territory390/440/1280 no page overflow.
Development browser: Python8193 old-cache mismatch, custom Python8194 incomplete resource loads; replaced by repo PORT8194 node server.cjs (ownsession14812), newtab34 reload works. Not a product compatibility patch; finalv72 cachebusting and finalfresh console check pending.
Task 3: implemented efecb03, full1013 pass; independent reviewer /root/review_remaining_css in progress.
Task 3: complete (3224f42..efecb03, independent reviewer approved no findings; trueSafari unavailable; original training rollback inherited tested path).
Task4 BASE: efecb03
Task4: in progress
Task4 implementer: /root/review_balance_targets (completed unrelated historicalreview seat, freshTask4 assignment).
Normal preparation: /tmp/classic-depth-chapters-earned-7.json actual fresh1x route with player24h funding reserve, thirdchaptercomplete100.129h, fourheroesretained, valid; no resource/army/levels/chapter grants.
Task4: fix round1/5 started (0 addressed, 1 Important+1 Minor open; BASEb3948ba). Direct candidate recruit transactional rollback; preciselead test. Original implementer resumed, scope no broader oldtransactions rewrite.
Task4 earned five routes: /tmp/classic-depth-heroes.json actual daily diplomacy visits then castlebattle; county3 capturelevels64/64/69, prefecture2 actualfourcounties12wins→sixnamedgate then64/69. All recruited/valid, nofirstcaptureboxes. Offline daily accumulationcapexplicit, not active120hclaim.
Ruling: 修正controller把def统御成长误写成lead统率公式；按既有生产rawlead200+initialLeadership×10，最终430/400/430/360/500、升级lead+10，def独立+3精确测试，不改属性公式 — 实际wild.hero/NamedGarrison.hero/HeroSystem公式确认 — 错用def公式会意外修改统率和平衡；本轮仅修测试与直接招募回滚。
Task4 mobile: heroes390/440/1280 new赵云故事44px summary,15entries no page overflow. Initial screenshotscroll framing missed newnames; recaptured by scroll throughheadingUI and root inspected390 image.
Ruling: Task5实际NPCDefenseData路径修正为npc-data.js，复用现有NPCDefense不创建虚构npc-defense-data.js — 实际全局脚本/路径确认 — 错名会新增重复配置导致规则分叉；分派前已修正计划和brief。

Task 4: fix round 1/5 (2 addressed, 0 open; b3948ba..0319d76, scoped reviewer /root/review_runtime_gate).
Task 4: complete (efecb03..0319d76, review clean; allfive earned routes and threeviewport screenshots root verified).
Task 5 BASE: 0319d76
Task 5: in progress
Task 5 implementer: /root/review_seven_integration (completed historical seat, fresh task-specific assignment).
Ruling: Task6旧入门课程已有spear_cavalry，新增枪阻骑改ID为spear_block_cavalry，旧课原样保留 — 计划同ID新增与“旧lesson不改”矛盾，以spec兼容为准 — 成本为两个相近枪骑教学入口，UI需明确入门/实战；选错只需合并新入口，不破坏旧ID。
Task8 preparation reproducibility: root tests/balance/classic-earned-preparation.cjs repeats actual fresh routes on0319d76; thirdchapter100.129h, fullsiege920.959h, noerror/valid. VM changes player funding+earned rank renewal+observer cap only, no production mutation/grants; original producer archived separately with efecb03 provenance.
Task5 root earned routes: /tmp/classic-depth-factions.json three seeds fieldwins30dead/15wound; defensewins54/54/53dead+28wound, actualresource receipts preserve food overflow; multicity sourcecity+disablemidwarning+save/reload passed. Initial harness nullreceipt failure retained separately (existing autoResolve already settled, corrected read real report), no production issue. Screens factions390/440/1280, phonebuttons44px, scrollwidth==viewport, root inspected390. Final candidate rerun pending.
Task5 implemented5d7485d, full1048 pass; reviewer /root/review_classic_css in progress (0319d76..5d7485d diff). Root all3faction cycles seeds1/7/19 allwin; actualautoheal+paidtrain restored800, yellowdead30/wound15, shanyue/wuhuan dead23/23/22,wound11, XP415/395/450. /tmp/classic-depth-faction-cycles.json. UIcamp generic raid/resource chance copy observation passed reviewer for assessment.
Task 5: fix round 1/5 started (3 Important+1 Minor open; BASE5d7485d): tick-created camp dispatch atomic gap; stripped faction metadata bypass; incorrect camp reward copy; incoming raid button. Original implementer resumed, include all findings in single fix round.
Final integration named risk to inspect (not adjudicated): future wild discovery after camp creation. HeroSystem.wild.location hero-system.js:118–122 checks wild/level5/ownership/rumors but no factionCamp; 花鬘 fieldLevel5 may choose publiccamp if sourcecity nearanchor. Task5 campselection excludes existingrumors; finalreview should verify reverse discovery exclusion, no production fix inroot.
Task 5: fix round 1/5 (4 addressed, 1 new Important open: legitimate pre-camp battle return timestamp rejected; 5d7485d..4f03e70).
Task 5: fix round 2/5 started (BASE4f03e70; original implementer resumed, legacy return+reload only).
Task 5 fixround2 implementedced75e0, realoldbattle→return→reload→arrival→reload GREEN30 plusruntime21. Scoped reviewer same /root/review_classic_css in progress. Root normal NPC afterfirstfix4f03e70 rerun all7field/defense/crosscity routes +3allfactioncycles pass; /tmp/classic-depth-factions-fixed.json. Campcopy/disabledraid corrected browserthreeviewport/screens overwritten.
Task 5: fix round 2/5 (1 addressed, 0 open; 4f03e70..ced75e0).
Task 5: complete (0319d76..ced75e0, independent review+two scopedfixreviews clean).
Task 6 BASE: ced75e0
Task 6: in progress
Task 6 implementer: /root/review_mobile_release (completed historical seat, newtask-specific assignment).

Task6 implemented6813547, focused20/full1070 passed. Independent reviewer /root/depth_targets_review dispatched BASEced75e0..6813547 with full brief/report/diff. Root18 actual educational success/failure routes unchanged entirestate/storedbytes; UI 390/440/1280 and actual17roundwin390 screenshot saved.
Task8 root diagnostic expanded all seven systems with per-route catches, preserved errors/incomplete records and nonzero exit. AwaitTask7 before final rerun; no success claim for pending campaigns.

Task 6: minor (deferred): ManualData公开克制表与resolveBattleRound现有倍率各一份，目前一致；未来同步规则可能漂移，最终整支审查需triage。
Task 6: complete (ced75e0..6813547, spec compliant and quality approved; reviewer /root/depth_targets_review).
Task 7 BASE: 6813547
Task 7: in progress
Task 7 implementer: /root/classic_review4 (completed historical seat, newtask-specific assignment).

Ruling: 历史副本“城战/军械”按宫门/粮道盾弓步阵与讨董盾弓骑阵＋既有军械增攻支线落实，保留非siege租兵及单位白名单，不新增门墙或冲车 — 固定复用现有副本合同不支持器械/门墙；以真实支线效果满足故事选择 — 成本为本轮历史副本不含破门战，未来若要须单独设计数值与存档兼容。
Task7 scope clarification: exact newlytouched battlefield enter/openBox/round persistence failures get targeted rollback regressions, no unrelatedtransactions redesign.

Task7 root preflight currentproduct: seed7 two all-side routes×allthree difficulties completed, each1box; nextday actual24hwait simplemain fullclear earns1400/240/1box and1600/280/1box, formalarmy preserved; /tmp/classic-depth-{ten_eunuchs,dongzhuo}-{preflight,next-day-preflight}.json. Fourcampaign catalog and newmaps15nodes mobile70px, actualten firstnodewin11lost/6recovered; screenshots390/440/1280 nooverflow, mobilebattle next44px. Fullworkerlog1081/1081; awaitingcommit+independentreview.

Task7 implemented3f6ee05,77focused/full1081 passed; independent reviewer /root/review_remaining_css running BASE6813547..3f6ee05 with brief/report/full diff. Rootsame-account same-day firstcomplete each newcampaign yielded2boxes total, realrental/costs and reloadbetweenbooks, /tmp/classic-depth-independent-boxes-preflight.json.

Task 7: complete (6813547..3f6ee05, spec compliant and quality approved; reviewer /root/review_remaining_css).
Task 8: in progress (root integration/version/fullsuite/wholebranchreview/PR CI; no main merge).

Ruling: 最终审查主阅读包包含全部产品源码/测试/文字变更，原始数值JSON用摘要与输入溯源、自动runtime按源码hash/一致性测试验证；完整diff另保留可定向查询 — 完整包1MB大量生成副本，避免重复读同一引擎 — 成本为不逐行人工审原始数值日志，保留完整报告和可复跑脚本弥补。

Task8 root candidate6a03a16: fullnpm1081/1081 exit0; allseven normal matrixcompleted true/failures0,36historicaldifficulty clears,18educationalchecks,5hero branches,7factionroutes/9cycles,2nextdays/oneindependentsamedayboxes. Runtime52/a0968be1d2e9 unchanged; version2/2 and freshv72UIconsole0error/warn. Final strongestfresh /root/depth_final_review (gpt-6-astra high) dispatcheda552496..6a03a16, no delegationlimitation now.

Finalreview namedrisk1 reproduced reverse flower/camp overlap. Initial reviewer probe incorrectly reported invalidsave due fractional Date in test helper; reviewer corrected withceil+1: valid/reload intact. Root user-facing correction sent. Actual finding is shared node/reward/guard semantics, fullreview pending.
Task8 artifact format check: CUA original imagebytes are JPEG; renamed57 .png filenames to .jpg without editing pixels; JPEG SOF parsed verifies390/440/1280 widths and manifestSHA. Initial PNG-header assumption failure was artifact-check script, notgame failure.

Final wholebranch review a552496..6a03a16: spec notyet/quality With fixes; R1 reversecamp/wilddiscovery+reward/blockedwarning; R2 tick intermediate diskstate throughwarcare/directrecruit failedfinalsave.0Critical/2Important. Minorcounterduplication nonblocking. ONE finalfixwave BASE6a03a16, freshstandard agent; no furtherbroadreview, one scopedrereview thenadjudicate residuals.

Finalfix implemented c4cf292: R1 sharedwildlocation excludesfactionCamp; R2 fourcare/recruitentrypoints use factionAtomic and citymirrorreconnect. RED10fail→GREEN11pass, targeted156/156. Unique scopedrereview original /root/depth_final_review dispatched; root finalnpm andnormalmatrix running on c4cf292. Freshv72 browser390 reloadconsole0error/warn.

Task 8: complete (product c4cf292; final ONE fix wave 2 addressed/0 open; wholebranch+scopedreview clean, root1092/1092 and normalallseven completed/failures0; candidate PR/CI next, no main merge). All20 Rulings archived for exhaustive final disclosure.
