# Task3 实施报告：名城本城长期经济收益

状态：DONE。BASE：3224f42。HEAD：efecb03（feat: 为已建名城增加本城长期经济收益）。工作树 /Users/lihuazeng/.codex/worktrees/nanman-campaign/superpower，分支 feat/classic-strategy-depth。未推送、未合并、未发布，版本未变。

## 实现与接口

- `CityStrategy.territory(s, cityMeta)` 是纯投影。cityMeta 使用 `Game.cityMeta(id)` 返回的 `{id,node,...}`；需要它的 id 对应真实 `realm.cities` 城池、node匹配、非主城、仍有 conquered控制记录、且存在 NamedCityData.definition。占领但未建立城市、已失去控制、普通主城、平地自建城、错误scope都返回全1。
- 返回 `{production:{food,wood,stone,iron,gold},trainFactor}`。粮城food1.05；矿城wood/stone/iron1.05；关隘trainFactor0.95；均衡名城gold1.05；其余值1。没有新增存档、领取、计数、迁移或写入接口。
- `Game.cityStrategy(cityMeta).territory` 提供同一纯倍率。该wrapper先沿原 NamedCityData层级/CityStrategy特色，再沿原 CitySpecialty.apply，最后乘本次领地倍率。原marchFactor不改。原 `plotYield` 与 `rates` 共用这个wrapper，每项毛产出只乘一次；驻军、在途、斥候、伤兵与守城维护费继续完整扣除。
- 提取内部 `grossRates()`，只复用原毛产出计算，`rates()`继续扣原维护费。`Game.citySummary(id).territory` 返回 `{production,trainFactor,gains:{food,wood,stone,iron,gold}}`，gains为本城当时劳动、科技、城守、资源加成与特产全部作用后的**每小时额外毛产出**，不含库存、扣维护后的净收入或一次性发展奖励。无收益项目为0。读分城数据通过原withCityScope还原当前城。
- `trainSeconds()` 只对新报价/排入队列的训练应用关隘0.95；费用、人口、训练容量和原研究/教官加成不改，最低仍1秒。没有重算旧训练或在途时间，也不触碰战斗和奖励快照。
- NamedCityData.definitions本来已包含 `yellow_qingshi`、`yellow_baisha`、`yellow_chigang`，三者都是县级名城。因此真实获得的青石黄巾城也适用粮城加成，无须另外赠资源或虚构占领新节点。

## 界面

- 名城详情与现有名城总览使用短中文“本城长期收益”卡，展示本城专业倍率、实际每小时增量；关隘明确“新增训练用时×0.95，已有队列不变”。未建或未控制时明确建立并控制后生效。
- 复用 NamedCitySystem.progress 的指定children及missing，直接显示还差几座，并给缺少子城的既有 `namedCityMap` 查看入口；不拿普通城数代替指定辖区。
- 原稳定发展奖励保持原领取动作与去重，继续在独立区块展示；未增加第二套免费每日奖。
- 按现有CSS追加卡片、按钮换行和44px点击高度。最终手机/桌面截图由root负责。

## TDD与测试

### RED

命令：`node --test tests/named-territory.test.cjs`。

证据：`/tmp/classic-depth-task3-red.log`，8项，1通过/7失败。通过项是旧战斗/奖励快照与既有严格校验；失败项分别覆盖缺territory接口、粮矿额外真实产出、均衡名城税收、资源田预览与小时增量、分城结算、关隘新增训练缩时、名城可读卡片。该最终RED在产品代码改动前运行；测试准备阶段已修复重复声明的fixture变量。

### GREEN

- `node --test tests/named-territory.test.cjs tests/named-city.test.cjs tests/city-strategy.smoke.test.cjs tests/specialty-growth.test.cjs tests/training-recovery.test.cjs tests/training-targets.test.cjs`：46/46，零失败，`/tmp/classic-depth-task3-focused-green.log`。
- 追加普通平地自建scope的拒绝断言后，单独 `node --test tests/named-territory.test.cjs`：8/8，零失败，`/tmp/classic-depth-task3-standalone-green.log`。
- `npm test`：提交前**只运行一次**，1013/1013，零失败/取消/跳过，58.21秒，`/tmp/classic-depth-task3-full-green.log`。测试输出无运行时警告或异常。
- `node --check`：city-strategy.js、engine.js、named-city-ui.js、tests/named-territory.test.cjs、tests/city-strategy.smoke.test.cjs均通过。
- `node scripts/build-online-runtime.cjs`通过，51源文件；runtimeHash `2c6a554e25f4f84e69de9bf9ccc0878baa17ce598981daf6c5e3df1aac2a299d`。
- `git diff --check`及提交前`git diff --cached --check`通过。

过程中的定向回归出现1项旧断言失败：原city-strategy smoke预期青石粮1.2、白沙材料1.15，依据已授权新规则补乘1.05；原层级黄金1.1、维护费和回主城不受影响的断言保持。另修正测试误以为现有importSave返回null的断言，改为验证不抛异常及实际导入后的队列内容，未修改产品导入契约。

## 正常旧档只读交叉检查

使用root真正连续攻城获得的 `/tmp/classic-depth-yellow-{1,7,19}.json` 的 `.state`（文件是报告wrapper，不能把整个wrapper当存档）。三seed经真实Game.importSave后：青石scope均为granary，food倍率1.05，每小时额外毛粮4.2，其他资源额外收益0；citySummary读取前后序列化状态一致，validSave=true。该检查没有赠资源、改建筑、设占领或虚构胜利。

新增单元/机械边界测试会准备建筑、兵力、资源与city scope，用于验证精确规则、成本和时间，不把这些fixture结果当正常经济平衡结论。root另外负责完整正常路径及24小时重载验证。

## 文件

1. city-strategy.js：真实已控制名城scope纯倍率。
2. engine.js：真实毛产出叠加、本城小时收益投影、新增训练耗时。
3. named-city-ui.js：短收益卡与指定缺城跳转，原发展奖励独立保留。
4. web-edition.css：收益卡及44px按钮。
5. tests/named-territory.test.cjs：8项新行为与兼容测试。
6. tests/city-strategy.smoke.test.cjs：原青石/白沙产出期望补领地倍率。
7. supabase/functions/_shared/game-runtime.mjs：同步生成。

## 自审与限制

- 已逐项检查无叠乘、无跨城泄漏、维护费不折扣、原特产仍相乘、主城不加成、旧队列及在途冻结、旧战斗与奖励不改、纯读不写、无新增存档字段或领取事务。
- 保留已批准Tasks1/2，未改war-care、training-targets或其产品流程；controller的训练/factions设计、QA、截图、balance脚本及scratch均未暂存。
- 原engine.js单行函数较长，本次仅在相关既有hook精确修改，没有跨范围结构改造；新增计算仍集中city-strategy/engine，UI单独函数，未增加全局脚本。
- Git提交提示现有本机作者信息为自动配置；没有更改负责人Git身份。测试无警告。
- 最终缓存版本升级、三尺寸/实体iPhone Safari QA与发布仍由root后续任务处理；本任务无未解决功能疑虑。
