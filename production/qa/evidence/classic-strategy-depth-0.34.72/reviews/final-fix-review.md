- **R1：既有营地后发现花鬘会重叠、混用守军与首俘奖励，并阻断原营地预警 — ADDRESSED。** `hero-system.js:119` 在共用选址条件排除 `factionCamp`，首选锚点与后备搜索、首次发现与被占线索迁移均使用此条件。`tests/faction-cross-system.test.cjs:23` 验证原营地仍按时向原来源城发出 15 分钟预警；`:27` 的两种出征时序实际清剿营地后，花鬘线索仍活跃且无误俘或首箱；`:35` 验证迁移避营地，`:39` 保留相反顺序的互斥保障。
- **R2：治疗、自动治疗、直接招募中 tick 提前写盘，最终失败只回滚内存 — ADDRESSED。** `engine.js:1449` 把三个入口及恢复优先设置纳入既有 `factionAtomic`，开启势力且允许内政时覆盖整个动作；新增入口不会继承无关野战的关联判断。结合 `engine.js:231` 的事务内保存抑制及 `:508` 的 tick 保存门控，最终保存前无中途主存档写入；`:510` 在失败时恢复完整快照并连接城市镜像，`:1370` 与 `:1371` 同样补齐治疗自身失败路径的镜像连接。`tests/faction-cross-system.test.cjs:55` 对三入口验证最终写入失败时完整内存、原始存档字节、本城与另一城工资、全局发薪时间和候选均还原，且写入错误状态阻止重试；`:62` 验证成功时恰好一次完整写入、费用及来源城归属正确、可有效重载。

### New Breakage in the Fix Diff

- **None。** 本轮差异未发现新增 Critical、Important 或 Minor 问题；新增包装沿用已有保存权限检查与嵌套事务边界，生成 runtime 的对应修改与源修复一致。

### Out-of-Scope Observations

- **None（本轮无新增）。** 原整支审查中的克制表双份维护建议仍属已记录的非阻塞 Minor；本轮未扩大到该项或其他旧动作。

### Checks

- **范围核对：** 已阅读 `final-fix-brief.md`、`final-fix-report.md`，一次完整阅读 `review-6a03a16..c4cf292.diff`；仅围绕两项发现查阅共用选址、事务保存边界及断言。审查基线 `6a03a16566619fe64eee46403bf3976d171f20c9`，修复 HEAD `c4cf292ed4d991653e053883de7190faf1c1ef23`。
- **证据核对：** 已查看保存日志与新增测试实现。`final-fix-red.log` 为 11 项中 10 失败，原重叠、磁盘半保存及成功写入两次的断言确实失败；`final-fix-green.log` 为 11/11 通过；`final-fix-targeted.log` 为 156/156 通过，包含存档会话、名将、伤兵、势力及 runtime 一致性覆盖，0 跳过或取消。未重复运行既有套件；本轮没有需要额外探针才能消除的具体疑虑。完整 npm 与正常矩阵由根代理独立验证，不以定向结果替代。

### Verdict

- **Fix round：All findings addressed, no new Critical/Important breakage。** R1、R2 均关闭，本轮无未结阻塞项；规格修复核验通过、修复代码质量通过。
