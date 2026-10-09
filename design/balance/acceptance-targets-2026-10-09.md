# 平衡测试验收阈值出处 · 2026-10-09

TD-002 后续整理，仅移动测试标准，未调整游戏数值。配置在 `tests/balance/targets.cjs`。原路线、种子、倍率和比较操作符不变；原测试仍执行真实引擎。

| 配置 | 数值与边界 | 来源与性质 |
|---|---|---|
| chapterCampaign.acceleratedMaxHours | < 5 小时 | chapter-balance 既有回归范围，seed 123、倍率 60；不是正常时钟目标 |
| chapterCampaign.normalHours | > 100 且 < 220 小时 | chapter-balance 既有回归范围，seed 123、倍率 1，正常补兵；章节设计见 chapter-two / chapter-three quick-spec，未独立规定此区间 |
| chapterCampaign.spentFoodMin | > 1,000,000 | 同一倍率 60 路线的既有消耗回归下限 |
| lateGarrisons.innerCityMin | ≥ 1,600 人 | late-game-balance 的河洛内城既有守军下限；不代替章节兵力表 |
| lateGarrisons.yellowCityMin | 每城 ≥ 250 人 | late-game-balance 的黄巾城既有守军下限；不是所有城统一兵力 |
| opening.giftCapacityMaxRatio | ≤ 容量 × 1.5 | opening-economy 既有验收上限；opening-economy-2026-10-08.md 说明首阶资源 8,000、容量 10,000，但未单独批准 1.5 倍上限 |
| opening.populationOutputMinRatio | > 原产量 × 2 | opening-economy 典民令测试的既有下限，指定田地和人口夹具；不能推广为所有城市收益 |
| opening.firstBattleMaxMinutes | < 10 分钟 | opening-economy 既有回归上限，seed 123/456、使用礼包加速；报告实测 4.1–4.2 分钟，不是将报告结果改写成新承诺 |
| opening.minPopulationItems | ≥ 2 个 | 上述路线既有典民令消耗下限 |
| opening.archersMaxMinutes | < 90 分钟 | onboarding-growth-challenges-2026-10-05.md 明确暂定自动路线目标；两处测试共用 |
| hallGrowth.levelTwoSeconds | = 480 秒，之后折算加成 | opening-pace-2026-10-08.md 实施结果及 onboarding-growth-challenges 明确官府 2 级基础 8 分钟 |
| hallGrowth.stepMaxRatio | 后级工期 ≤ 前级 × 2 | hall-growth-pacing 既有平滑成长回归上限，4–10 级，不是所有建筑通用规则 |
| hallGrowth.levelTenReferenceMaxRatio | 新工期 < 旧参考 × 0.5 | hall-growth-pacing 既有回归上限，与原除以 2 等价 |
| hallGrowth.tenGiftsHours | ≥ 24 且 ≤ 48 小时 | onboarding-growth-challenges 明确暂定自动路线目标；hall-growth-pacing 与 growth-economy 共用，种子保持各文件原配置 |
| hallGrowth.lateWaitHours | ≥ 1 且 < 24 小时 | hall-growth-pacing 既有官府 7–10 级单项等待范围 |
| hallGrowth.finalWaitMaxRatio | 10 级等待 ≤ 9 级 × 2.5 | hall-growth-pacing 既有末级平滑回归上限 |
| growthEconomy.naturalWoodMin / naturalIronMin | 分别 > 200 / > 500 | growth-economy 无道具加速首弓路线既有自然产出下限，seed 123 |
| growthEconomy.stockFoodMin / stockStoneMin | 分别 > 10,000 / > 30,000 | 同路线既有奖励超仓余额下限 |
| growthEconomy.governorReductionPercent | > 7 且 < 8（百分数） | growth-economy 既有官府十级、苏砚分配 15 点内政的特定夹具；不是全武将承诺 |

黄金首批标准仍在 `growthGold`，出处见 `growth-gold-targets-2026-10-09.md`。0 自然产出下限、单调性、保存一致性、浮点误差、固定夹具与规则精确倍数继续留在原测试；它们用于检查机制，不是需调参的平衡验收窗口。

验证方法：五个原测试文件整理前后各 29 项通过。用 require 缓存只在子进程内临时改五组代表阈值，原测试各出现一项预期失败；不修改磁盘配置。再跑正常配置与完整回归。该检查说明配置已被测试读取，不代表完成真人试玩或长期经济验证。

实施结果：隔离全套578/578通过，主工作区组合回归605/605通过；独立审查无阻断问题，首批文档过时描述已更正。

收尾验证（2026-10-09）：负责人授权「收尾」后同步 main v0.34.49（1627f05），完整 npm test 586/586 通过，语法和 diff 检查通过；本轮检测及阈值实现保持原样，仅补充提交记录。进入独立 PR，尚未合并上线。
