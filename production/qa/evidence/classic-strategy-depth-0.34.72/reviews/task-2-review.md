### 规格符合性

- ✅ 符合本任务规格。阶段、等级区间、±6格、排序、5项上限与六个公开返回字段均已实现；普通野地、势力营地标记与冲突排除明确。证据：world-targets.js:15、engine.js:1415。
- ✅ 原附近与收藏路径保留，未知目标先侦察，恢复入口读取来源城，跨城使用既有显式切城动作。证据：world-targets-ui.js:8、world-targets-ui.js:30、tests/training-targets.test.cjs:71。
- ⚠️ 实际手机布局截图、正常经济长局模拟属于集成验收，当前差异不能验证；请控制代理完成。当前测试仅能验证生成的界面内容与真实动作接线。证据：tests/training-targets.test.cjs:30、tests/training-targets.test.cjs:44。

### 优点

- 练兵投影与原完整目标投影分开，隐藏字段抛错测试能有效约束信息边界，另有状态完全相等和情报过期测试。证据：world-targets.js:19、tests/training-targets.test.cjs:11、tests/training-targets.test.cjs:16。
- 覆盖真实付费侦察、往返、取得情报以及出征兵力和敌军快照，测试没有仅停留在按钮字符串。证据：tests/training-targets.test.cjs:44。
- 来源城恢复预览不切城、不治疗；只读存档入口白名单与实际动作拦截都有覆盖。证据：world-targets-ui.js:32、tests/training-targets.test.cjs:52、tests/training-targets.test.cjs:59。
- 共享运行时同步更新，没有新增存档字段或全局脚本。证据：supabase/functions/_shared/game-runtime.mjs:2、supabase/functions/_shared/game-runtime.mjs:17755。

### 问题

- 严重：无。
- 重要：无。
- 轻微：无。

### 核查记录

- 首次工具输出截断，随后仅补读丢失的差异段；未重新读取已完整呈现的修改函数。
- 针对“读取情报可能访问隐藏军力或写状态”的疑虑，检查 engine.js:1217 与 scout-system.js:42；均只读取既有报告并投影。
- 针对“跨城恢复预览可能修改城市状态”的疑虑，检查 engine.js:423、city-system.js:30、war-care.js:41；城市状态返回副本，治疗报价纯读取。
- 针对“新增阶段按钮不足44px”的疑虑，检查 web-edition.css:837；既有阶段筛选按钮规则满足最小高度，新增卡片与恢复入口规则见 web-edition.css:864。
- 未重跑测试；实现报告提供定向25项、全套1005项通过及语法检查证据，展示的测试输出无警告。

### 质量结论

**任务质量：Approved。**

**理由：** 实现范围适当，公开信息筛选与真实动作流程连接清晰，来源城和只读权限边界有行为测试支持；未发现需要阻挡本任务通过的问题。
