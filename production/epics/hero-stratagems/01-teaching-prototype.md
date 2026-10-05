# 三将、两计谋与独立教学演练

**ID:** TR-hero-stratagems-001
**Status:** Complete
**Last Updated:** 2026-10-05
**Type:** Integration
**Layer:** Feature
**GDD:** design/gdd/hero-stratagems.md
**ADR Governing Implementation:** N/A — 现有浏览器回合引擎内的有界玩法扩展。
**Workflow:** minimal
**Dependencies:** v0.28.0 已发布的冻结将领快照、逐队战斗事件、存档保护。

## Scope

普通单机新战斗接入黄忠蓄弦先射、魏延佯退诱追、徐庶料敌先机，以及公共察伏、火攻封路。教学演练复用正式回合结算，但兵将、结果和筹策放在独立临时会话。共享世界、NPC守城保留既有战斗规则；旧进行中战斗也不注入新规则。

## Acceptance Criteria

- [x] AC-1：每方3点筹策、每轮最多提交一次；非法提交免费、合法取消不退款，相同命令幂等。
- [x] AC-2：黄忠准备与触发轮牺牲主攻击，只有实际从射程外进入才能先射，仍保留原有反击规则；普通将能察伏。
- [x] AC-3：魏延需要真实后退及至少目标训练成本1/3的诱兵，仅改变仍前进的近战目标，不倒走、不附送额外攻击。
- [x] AC-4：徐庶只揭露已锁定的敌计；100单位火区下一轮生效、双方截停、占位失效、全场最多一段，不造成额外伤害。
- [x] AC-5：费用、准备、隐藏信息、攻击预算和战报原因可保存和恢复；旧rules2战斗沿旧规。
- [x] AC-6：三场固定教学演练可启动、施计、推进和退出，不修改正式资源、军队、将领、奖励或存档。
- [x] AC-7：战斗、将领详情、出征页显示费用、时机和反制，手机布局无横向遮挡；有保留截图。
- [x] AC-8：共享权威结算及NPC守城不启用新计谋，界面显示支持范围。

## Verification

必要范围：tests/battle-stratagems.smoke.test.cjs、tests/tactical-lessons.smoke.test.cjs，以及受影响的旧战斗／存档／共享运行时兼容检查。大型本地回归、自然长局及真人玩法理解度按用户要求另批安排，不作为本故事已经验证的结论。

## Implementation Files

battle-stratagems.js、tactical-lessons.js、engine.js、battle-tactics-ui.js、combat-ui.js、hero-ui.js、deployment-ui.js、app.js、war-theme.css、index.html；测试加载器和共享引擎生成脚本保持支持边界。

## Workflow Notes

按已授权的“继续”执行 dev-story → story-done。没有 sprint-status.yaml；本故事记录状态。主代理负责引擎与加载接线，独立角色负责纯规则、UI和必要验证。使用Codex原生协作；没有启动Claude服务或启用Claude hooks。

## Completion Notes

**Verdict:** COMPLETE — 有界原型实现与AC-1至AC-8通过。实际运行证据来自开发阶段已执行的必要用例与浏览器操作；story-done阶段核对证据和条件，没有把测试文件存在当作测试通过，也没有代替用户批准主观体验。

**Run result:** OBSERVED — 390×844及1280×900完成三场固定演练，真实名将详情／出征和正式战斗施计已有保留截图。见[验收与逐项追溯](../../qa/hero-stratagems-v0.29.0.md)，最终画面见[黄忠教学](../../qa/evidence/hero-stratagems-v0.29.0/03-mobile-ready-shot.png)、[火区回顾](../../qa/evidence/hero-stratagems-v0.29.0/08-desktop-fire-lane.png)、[名将详情](../../qa/evidence/hero-stratagems-v0.29.0/09-desktop-hero-identity.png)、[正式提交](../../qa/evidence/hero-stratagems-v0.29.0/12-mobile-formal-preparation.png)。

新增18项与兼容67项共85个唯一必要用例通过。规则与UI由独立角色核查，测试角色另验真实画像抓将招降、存档一致性及教学隔离；发现的身份伪装、旧行军快照、教学结束、计时和回顾问题已修复。首次发布CI发现普通床弩守军筹备火攻丢失首轮攻击，使纯弓过早达成旧高级挑战；已将自动敌计限制到明确的野将身份与固定教学，不放宽旧测试。修后49项相关检查通过；新增计数只有原军令分支的5项，其余复查不重复累加。版本入口、README／RULES、设计状态、测试加载器及生成工厂属于本故事必要接线与发布记录，未增加新云服务或其余名将玩法。原型参数集中在纯规则模块与教学数据，未拆出额外配置系统。

有效配置为workflow minimal、qa.level minimal、review_mode solo。QL-TEST-COVERAGE正式gate依配置跳过；独立必要验证仍保留。control-manifest与ADR不适用于本次有界扩展。没有真人理解度、数值平衡、自然长局、实体手机或百人容量结论。

**Next story:** 普通野战与三场演练的真人打法比较；重点观察黄忠下一轮真实入射程机会及两轮主攻击代价，再决定费用／时机调整。共享计谋与其他名将继续保持后续提案。Pages与CI发布结论以工作区outputs/update-v0.29.0/publish-receipt.json为准。
