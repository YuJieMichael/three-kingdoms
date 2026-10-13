### 规格符合性

- ✅ Spec compliant。三个新 ID 使用独立固定阵容和原单位属性；枪阻骑未覆盖旧 `spear_cavalry`，器械课使用既有河洛城门。证据：tactical-lessons.js:6、tactical-lessons.js:40。
- ✅ 新课以真实回合事件形成观察记录，实际清空守军、破门且我军存活后才获胜；目标还要求对应观察及盾/枪课弓队存活。不能靠进入、回合阈值或传入 `won=true` 自动完成。证据：tactical-lessons.js:20、tactical-lessons.js:50、tactical-lessons.js:59、tests/combined-arms-lessons.test.cjs:16。
- ✅ 新分支继续使用真实结算，旧观察型课程仍保留原提前结束行为；正式奖励、军队和存档路径没有加入新写入。证据：engine.js:1064、engine.js:1068、tests/combined-arms-lessons.test.cjs:8、tests/combined-arms-lessons.test.cjs:13。
- ✅ 三行目的/操作/失误提示常显，沿用可直接控制的逐队命令、目标与下一回合；本方用途来自 ManualData，未知敌方不产生针对隐藏兵种的克制提示。证据：combat-ui.js:70、battle-tactics-ui.js:121、web-edition-ui.js:83、tests/combined-arms-lessons.test.cjs:18。
- ✅ 共享运行时已同步，没有新增全局脚本、永久存档字段、版本或发布动作。证据：supabase/functions/_shared/game-runtime.mjs:2、supabase/functions/_shared/game-runtime.mjs:15054。
- ⚠️ 手机实际布局和正常旧档多种子模拟不是本差异的直接证据；控制代理已明确报告三尺寸截图与18条实际成功/失败验证，本审查未重复运行，也不把该口头结果列为独立执行证据。

### 优点

- 观察记录直接基于 `currentRoundSummary.events` 的兵种、目标及正伤害，而非日志文本；新课不会在观察事件发生后提前结束。证据：tactical-lessons.js:22、tactical-lessons.js:26、engine.js:1068。
- 成功与错误操作都经过实际回合结算，比较后排受损/城门未破，并逐次检查完整正式状态、存储原始字节与存档合法性。证据：tests/combined-arms-lessons.test.cjs:5、tests/combined-arms-lessons.test.cjs:8、tests/combined-arms-lessons.test.cjs:12。
- 防伪完成、已观察但守军仍在、未知敌军 army 抛错 getter，以及旧课程阵容/结果兼容都有定向覆盖。证据：tests/combined-arms-lessons.test.cjs:13、tests/combined-arms-lessons.test.cjs:16、tests/combined-arms-lessons.test.cjs:17、tests/combined-arms-lessons.test.cjs:18。
- 模块新增约34行，沿用现有文件和控件，职责仍集中在独立课程定义、观察与结果判定。证据：tactical-lessons.js:18、tactical-lessons.js:35、web-edition.css:875。

### 问题

#### 严重（必须修复）

- 无。

#### 重要（应修复）

- 无。

#### 轻微（可改进）

- manual-data.js:4：公开克制表复制了 engine.js:1003 的三个结算数值，当前完全一致，但今后只修改其中一处会让正式配兵提示失真。可让结算和提示共享同一表，或增加明确验证两处一致的回归；本次不构成阻断。

### 核查记录

- 完整差异分三块读取一次，未截断、未重复读取修改函数、未进行广泛代码遍历。
- 命名风险“新课是否实际共用原战斗结算、公开克制倍率是否真实”：定向检查 engine.js:983 与 engine.js:1003，确认课程调用真实 resolveBattleRound，三项倍率一致。
- 命名风险“有效侦察的兵种格式是否与提示读取兼容”：定向检查 scout-system.js:31、scout-system.js:42、scout-system.js:46，确认有效报告提供已验证的 types 数组，失效报告返回 null。
- 命名风险“新提示是否绕过现有出征目标可见性”：定向检查 web-planning.js:106、campaign-ui.js:97、war-orders-ui.js:7，确认普通界面使用既有目标可见性和军令可派遣入口。提示函数自身使用公开章节或已取得的侦察结果；未发现本任务增加可正常点击的隐藏目标入口。
- 未执行测试：实现报告提供定向20/20、全套1070/1070、语法与共享运行时生成结果；本审查没有出现需要重复测试才能判断的具体疑点。

### 质量结论

**Task quality：Approved。**

**理由：** 新课胜负与战术观察明确分开，实际结算与存档隔离有意义明确的成功/失败测试支撑，旧课逻辑保持原样。只有公开克制数据双份维护的轻微后续建议，无需阻挡本任务通过。
