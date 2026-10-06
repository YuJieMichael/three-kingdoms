# 当前开发状态

<!-- STATUS -->
代码版本v0.30.0：用户选择的五项指挥界面精简已实现，导航／当前目标／地图／兵将名册／战斗布局均有实际验收；战斗与资源规则不变。独立Supabase项目未选择，远程后台未启用。发布证据以工作区outputs/update-v0.30.0/publish-receipt.json为准；本文件不替代回执。
<!-- /STATUS -->

<!-- CHECKPOINT -->
**Updated:** 2026-10-05
**Branch:** main
**Current task:** production/epics/command-ui/01-interface-simplification.md实现验收完成，按既有授权提交／发布，精确提交与CI／Pages状态见外部回执
**Next step:** 用户试玩五入口及战斗布局，后续集中做大型回归／自然长局与名将打法比较
**Blocked on:** 玩法开发无阻塞；正式云后台仍待独立组织／项目及费用选择
**Files in progress:** 当前发布证据；界面代码与有界验收已完成
**Run result:** OBSERVED — 106项唯一必要检查通过；390×844、1280×900隔离存档浏览器完成五主入口、目标前往、礼包全领、兵将详情、地图跳转、正式战斗／演练、真实资源入库／行军时间、只读训练拦截与黄巾预警。已观察截图在production/qa/evidence/command-ui-v0.30.0。修复等待文案刷新和手机列裁切。Graphify本地仅代码刷新1388节点3092边80社区，未上传。无本地全量回归、自然长局、真人可用性、实体手机或线上百人容量结论。
**Open questions:** 真人易读性与战术机会频率待试玩；云项目选择和联网计谋仍待确定
<!-- /CHECKPOINT -->
