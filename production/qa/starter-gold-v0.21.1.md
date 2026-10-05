# v0.21.1 礼包黄金验证

用户反馈礼包黄金过多，本轮只下调十阶黄金，合计 598 万 → 100 万。数值、旧档政策与成长模拟分别记录在 design/quick-specs/starter-gold-tuning-2026-10-05.md、design/balance/starter-gold-2026-10-05.md 及同名 JSON。

95 项自动回归通过：新首阶实发 1 万、十阶总实发 100 万，旧档已领黄金不回收；未带 starterGiftVersion 的初代存档与明确版本 1 / 2 均有覆盖。批领保留领取记录，导入／重载不重发，现代旧档领取后续档采用新曲线。引擎旧礼包预览与 OnboardingSystem.quote 共用差额规则，黄金最低 0。

隔离 localhost:8138 的浏览器验证使用测试生成存档，未修改用户正式网站进度：

- 新档：第一阶及合计预览黄金 +10,000，领取后黄金从 5,000 到 15,000，已领按钮禁用。
- 官府 10 测试档：十阶预览黄金 +1,000,000，一键领取后黄金从 5,000 到 1,005,000，显示已领 10 / 10。
- 初代已领且缺失版本字段测试档：第一阶预览黄金 +0、四资源各 +20,000；领取首阶后黄金仍为 25,000，道具与领取状态保存。
- 三组使用同一实际界面与导入／领取入口；控制台 error 为空。

输入与截图保存于本任务 outputs/v0.21.1：fresh-city.json、ten-tier-preview.json、legacy-gift.json、local-fresh-gift.png、local-ten-tier-gift.png、local-legacy-gift.png。官府 10 夹具仅验证预览／领取，正常建设可达性由无注入的两组接口模拟单独验证。

正式网页发布、版本缓存及持续集成结果见本任务输出 publish-receipt.json。长期真人经济体验仍待数据。
