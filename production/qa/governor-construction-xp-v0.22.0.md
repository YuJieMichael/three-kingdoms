# 城守建造经验 v0.22.0 验证

日期：2026-10-05。规则：每个城内建筑与资源田的新建、升级、改建完工，当前城守获得完工等级 ×10 经验。新建一级 10，十级 100；沿用将领升级和自由属性点。旧已建建筑不补发，未完工队列完成后奖励。

新增 tests/governor-construction-xp.test.cjs 的 10 项测试通过，完整 105 项全部通过。覆盖自然完工、资源田改建、取消/迁移/拆除不发、立即加速、72 小时离线、重复结算/重载、自动建设与通知关闭、换任前后归属、旧档未完成队列、升级溢出与自由点。对每个完工先移除原队列并发经验，重复 tick 和保存恢复不重复。

独立源码复核：Game.setGovernor 和 HeritageSystem.assign 均先结算到期工程；已到期工程归原城守，未完成工程归之后的任职者。通知姓名和经验一致。七份改动脚本通过 Node parse，43 个 JS/CSS 版本参数统一 0.22.0，git diff --check 通过。

Run result: OBSERVED — 隔离 localhost:8138 测试存档来自正常新档、合法领取首阶礼包。浏览器建设民房一级，预览 +10，使用首阶的 15 分钟建造加速完成后，苏砚经验 0→10/80，助手记录「民房升至 1 级 · 城守 苏砚 经验 +10」。未操作正式线上玩家存档。

1280×900 桌面检查建设预览、完成记录和将领培养。390×844 将领面板宽/滚动宽均 336，页面宽 390；民房升级预览显示 +20。360×780 农田建设预览显示 +10，弹窗宽/滚动宽均 306，页面宽 360，无横向溢出。实体手机与触屏未测试。

截图保留于 evidence/governor-construction-xp/：01-build-preview.png、02-completion-record.png、03-governor-experience.png、04-mobile-governor.png、05-mobile-upgrade-preview.png、06-mobile-field-preview.png。桌面将领与手机升级预览已实际读图，新增提示可见，未见裁切或遮挡。

Graphify 同参数本地刷新：extract . --code-only --exclude '.claude/**' --exclude 'docs/engine-reference/**'，cluster-only . --no-label；381 节点、593 边、46 社区。未启用外部语义、监听、hooks 或上传，IIFE 内部覆盖限制保留。

本轮仅实现城守建造经验及对应提示。v0.21.1 测评列出的日常任务清空、首战引导和成长等待等问题仍按该报告记录，未在此版本顺带调整。
