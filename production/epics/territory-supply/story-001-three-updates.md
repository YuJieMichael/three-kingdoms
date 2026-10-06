# 区域战线、自动补给与内政名将

**ID:** TR-territory-supply-001
**Status:** Complete
**Last Updated:** 2026-10-05
**Type:** Integration
**Layer:** Feature
**GDD:** design/quick-specs/territory-supply-v0.32.0.md
**ADR Governing Implementation:** N/A — 沿用城市投影、真实物流和NPC守城引擎。
**Workflow:** minimal
**Dependencies:** v0.31.0 城市差异及名将机制，已 Complete 并发布。

## Acceptance Criteria

- [x] AC-1：已占真实粮城／矿城／关隘可主动开启独立三阶段区域战线；每波五分钟预警，显示阵容、抵达、阶段与奖励，未占地区不铺满列表。
- [x] AC-2：守城使用实际驻军、守将、工事与增援；失利可重试不丢城，阶段资源／军功首奖去重，整轮冷却重开只普通维持奖励，离线不自动结算战损。
- [x] AC-3：最多十二条持久补给线，目的库存含未送达货物、来源保留含行军粮；负重、兵力、市场、校场、总队伍上限继续生效，同线最多一支去返程队。
- [x] AC-4：运输真实支付、计时、到达与返回；暂停／召回／删除安全，切城不换来源，重载不重复发队，离线不追补历史运输；各城净粮与可维持时长可见。
- [x] AC-5：荀彧真实城守身份只减少新资源运输行军粮20%，既有在途成本冻结，普通将／改名／非本城不生效。
- [x] AC-6：庞统按实际资源和建筑条件准备一次20%城门耐久，正式守城消费快照、可由其他守将迎战；演练不消费，不叠加、不中途改变，切城隔离。
- [x] AC-7：旧档与进行中物流／守城兼容，非法路线／伪造战线／备防拒绝；写入保护与共享未支持命令守卫有效，构建权威运行时副本并定向验证。
- [x] AC-8：现有五入口中的紧凑布局，1280×900及390×844实际浏览器操作保留证据；必要检查完成，大型本地全量与自然长局继续另批安排。

## Implementation ownership

根负责引擎、城市字段／迁移／写入守卫、公共UI挂钩、整合与发布。三个并行代理分别独占区域战线与NPC扩展、补给纯模块与UI、内政身份与UI；公共文件由根整合，避免互相覆盖。

**Run result:** OBSERVED — 133项唯一必要检查通过，29源权威副本已构建；电脑1280×900和手机390×844独立存档实际完成预警、27秒弓兵增援、区域首战／爆仓／阶段推进、45秒真实供粮往返、暂停与重载、荀彧21→17粮费运输、庞统木石铁支付与9000演练／10800正式守城／冻结重载。11张截图已打开观察。

## Completion review

**Verdict:** COMPLETE WITH NOTES — 玩法及UI边界已实际观察；自然长局、真人调平和大型本地全量按用户安排另批集中做，未作为本故事完成条件。远程Supabase没有部署。

| Criterion | Evidence | Status |
| --- | --- | --- |
| AC-1 | regional-front17项；desktop-front-warning／mobile-front-stage-two | COVERED |
| AC-2 | 真实NPC三阶段／失败／首奖／重载测试；mobile-front-reward | COVERED |
| AC-3 | supply-lines17项真实运输／来源保留／目标在途／固定一队 | COVERED |
| AC-4 | 到达／返城／召回／离线测试；mobile-supply-running／desktop-city-food／desktop-supply-paused | COVERED |
| AC-5 | hero-administration13项；desktop-xun-transport与实际派遣重载 | COVERED |
| AC-6 | hero-administration13项与区域NPC联测；mobile-pang-cost／desktop-pang-drill／mobile-pang-formal | COVERED |
| AC-7 | 存档保护及online-runtime18项；写保护／共享／伪造数据拒绝测试；29源构建 | COVERED |
| AC-8 | 11张已观察截图，390px无横向溢出；133项唯一必要检查 | COVERED |

参数与适用范围遵循本故事GDD，无玩法偏离。三个代理完成补给、区域结算与内政的最终复核，修复实时倒计时、共享状态、任命即时显示及非法物流异常。未声称独立真人可玩性批准。完整说明与限制见[本版验收](../../qa/territory-supply-v0.32.0.md)。

**Next step:** 发布精确提交及77前端静态引用核验；后续集中长局观察粮草维护、重复战线收益和名将内政机会频率。
