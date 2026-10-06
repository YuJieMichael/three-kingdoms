# v0.32.0 领土与补给必要验收

**Date:** 2026-10-05
**Story:** TR-territory-supply-001
**Verdict:** COMPLETE WITH NOTES
**Run result:** OBSERVED

CCGS minimal dev-story → story-done。按用户“三项一起做”实施区域战线、真实自动补给及荀彧／庞统内政职责，保留五入口布局。本轮只做与改动直接相关的有界检查及独立准备存档浏览器操作；大型本地全量、自然长局和真人平衡继续按用户原安排集中进行。

## 定向检查

131项首轮整合检查全部通过；倒计时及共享状态提示修复后重跑相关30项全部通过，其中2项为新增唯一用例。首个GitHub提交的自动回归发现普通守城奖励被误设为爆仓；限定为区域战线后，相关73项定向检查全部通过，其中旧爆仓文件25项为本轮新增覆盖。本版共 **158项唯一必要检查通过**，不把重复运行叠加计数。

| 范围 | 用例与结果 |
| --- | --- |
| 区域战线 | `tests/regional-front.test.cjs`，17/17；真实NPC结算、失败重试、三阶段、首奖跨难度、整军、重载、离线、跨城、公开情报、伪造元数据与奖励拒绝、实际app倒计时刷新 |
| 自动补给 | `tests/supply-lines.test.cjs`，17/17；真实扣兵／扣粮／装货、负重与来源保留、目标在途去重、来源特性、续运、召回暂停、只读／共享、旧档与非法物流容器拒绝 |
| 内政名将 | `tests/hero-administration.test.cjs`，13/13；实际画像购买→歼灭→俘获→招降身份、荀彧新运输折扣、旧队伍冻结、庞统支付／普通守将消费、演练、切城、重复消费与共享提示 |
| 既有系统兼容 | 城池特性、占城、守城、高级守城、城守经验、存档保护、官职晋升，合计68项；含更新后的旧VM模块加载顺序 |
| 爆仓规则兼容 | `tests/loot-overcapacity.test.cjs`，25/25；掠夺／占领／采集爆仓、普通正式守城仓储限制及历史收据兼容 |
| 权威运行时兼容 | `tests/online-runtime.test.cjs`，18/18；29源模块权威副本已重新生成，仅构建文件，没有远程部署 |

上述前三组47项、既有系统兼容68项、爆仓规则25项、运行时18项合计158。实际兼容计数以TAP为准；下方命令与日志可重放，不从源码阅读宣称行为通过。

```sh
node --test --test-concurrency=1 --test-isolation=none \
 tests/supply-lines.test.cjs tests/hero-administration.test.cjs \
 tests/regional-front.test.cjs tests/city-strategy.smoke.test.cjs \
 tests/city-capture.smoke.test.cjs tests/city-defense.test.cjs \
 tests/advanced-defense.smoke.test.cjs tests/governor-construction-xp.test.cjs \
 tests/save-session.test.cjs tests/office-promotion.test.cjs \
 tests/loot-overcapacity.test.cjs tests/online-runtime.test.cjs
```

工作区 `outputs/update-v0.32.0/scoped-final.tap` 保留131项原始整合日志，`ui-fixes.tap`保留修复后30项日志，`warehouse-scope-repair.tap`保留区域／内政／旧爆仓／权威运行时73项通过日志。使用Node24顺序且不隔离的定向执行，沿用上一轮已记录的默认文件进程偶发退出限制；本轮没有重现或解决该运行器问题。既有GitHub push回归独立使用Node20，精确提交结果只以发布回执为准。

## 实际浏览器操作

在独立本地 `http://127.0.0.1:8138/` 使用1280×900与390×844视口。城市归属、建筑、兵力和资源为有界验收准备值；两名野将经真实画像／战斗／俘获／招降API取得。实际表单操作、计时、支付、战斗和重载均通过游戏UI，不修改用户线上进度，不由准备存档推导自然经济平衡。

1. 古渡第一阶段开启后实际等待五分钟。调遣林朔与100弓兵，预览27秒／139行军粮，抵达后守城可选1300弓兵。实际4回合胜利，3600粮全部入库且爆仓3600，军功15，阶段推进到2；第三阶段未提前开启。
2. 从古渡向主城保存两辆辎重车的供粮线，目标50000、源城保留10000。预览45秒去程、10000负重、行军粮21，真实重复往返补足缺口；主城实际达到50005粮。暂停时返城队不消失，抵达后源城辎重车恢复20辆，配置保持暂停；重载未丢失线路。
3. 荀彧在UI任命为主城城守后，1000木／两辎重车新运输显示普通行军粮21→实际17，仍45秒／10000负重。实际派遣、重载、送达，古渡木库存增加1000。
4. 庞统通过手机支付木石铁各1000，本城库存各从120000变119000。卸任、重新任职和重载保留一份备防。苏砚演练城门仍9000；正式普通来袭真实预警五分钟后，用苏砚与1000实际兵力开战，门耐久10800，战斗重载后保持；4回合获胜，战报记录庞统增加1800耐久，准备只消费一次。
5. 区域第二阶段单独开启，手机预警倒计时实际5:00→4:50，`data-clock`时间戳不变。手机body宽390、modal客户／滚动宽均368，无横向溢出。其他城市正在预警仍在首页显示并可进入处理；切城不自动开战。

以下11张截图已打开观察，原始尺寸见工作区 `browser-observation.json`：

| 证据 | 验证点 |
| --- | --- |
| [桌面区域预警](evidence/territory-supply-v0.32.0/desktop-front-warning.jpg) | 实际阵容、首奖、五分钟预警 |
| [手机补给报价](evidence/territory-supply-v0.32.0/mobile-supply-preview.jpg) | 来源保留、缺口、负重、粮费与时间 |
| [手机在途补给](evidence/territory-supply-v0.32.0/mobile-supply-running.jpg) | 保存后实际派队状态 |
| [手机庞统费用](evidence/territory-supply-v0.32.0/mobile-pang-cost.jpg) | 一次支付的实际费用与确认 |
| [手机区域首战](evidence/territory-supply-v0.32.0/mobile-front-reward.jpg) | 3600实际爆仓、军功15、工事贡献 |
| [桌面城市食粮](evidence/territory-supply-v0.32.0/desktop-city-food.jpg) | 各城独立净粮／可维持时长、目标粮已到账 |
| [桌面暂停线路](evidence/territory-supply-v0.32.0/desktop-supply-paused.jpg) | 返城后暂停配置与操作 |
| [桌面荀彧运输](evidence/territory-supply-v0.32.0/desktop-xun-transport.jpg) | 21→17粮费且时间／负重不变 |
| [桌面庞统演练](evidence/territory-supply-v0.32.0/desktop-pang-drill.jpg) | 基础9000门耐久、不消费备防 |
| [手机区域第二阶段](evidence/territory-supply-v0.32.0/mobile-front-stage-two.jpg) | 分阶段开启、实时预警、390px布局 |
| [手机庞统正式守城](evidence/territory-supply-v0.32.0/mobile-pang-formal.jpg) | 普通守将、10800门耐久、增加1800 |

导出按钮显示成功提示，但本次IAB下载事件未返回文件路径，未把最终导出文件列为交付证据。进行中战斗的实际重载与完整有界存档测试已独立验证。

## 审查与修复

三个代理分别复核补给接线、区域NPC结算与内政边界。补给代理额外最小复现确认旧多城缺字段迁移保留库存、全程资源／兵力守恒、只读派遣阻止和非当前城食粮估算无副作用；内政代理确认共享已付准备保留、消费战斗冻结、只读与旧档迁移；区域代理确认其他城市通知仅针对真实来袭、不改当前城市。

修复发现的非法物流校验异常、补给／区域静态倒计时、共享模式虚假“职责生效”徽标及任命后详情不即时更新。NPC公开战线情报和守城奖励文案与实际规则同步。首次GitHub回归（提交`1c1ce29`）433项中有1项失败：普通正式守城应按仓储限制结算。修复`defenseApi`仅在实际`battle.front`存在时允许爆仓，并让准备页与战报按实际收据说明规则；保留已保存的可选`overCapacity`字段兼容。修复后相关73项通过，未改旧测试预期。最终提交CI与Pages状态以发布回执为准。源码语法23文件、版本化77静态引用及差异格式检查通过。

Graphify按原code-only／exclude标志本地刷新1546节点、3486边、89社区，0缺失端点；1份SQL因解析依赖缺失未入图，27自关联及闭包／文档／媒体／CSS覆盖限制保留。没有后台监听、hooks、外部语义调用或上传。未凭图谱缺边认定机制不存在。

试玩系数和奖励仍需自然长局、真人配兵及食粮压力观察。本次视口验证不等同实体手机测试；远程Supabase、服务器线上负载与成本选择没有在本轮执行。
