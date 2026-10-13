### 规格符合性

- ❌ 全局约束未满足：直接候选招募保存失败未回滚，engine.js:1230。
- ✅ 五城、稳定ID、原始属性及成长顺序符合，named-city-data.js:25–29、named-garrison.js:16–20、hero-system.js:7。
- ✅ 原郡城固定六座即ceil(16/3)，新增郡城同门槛，named-city-system.js:15、tests/named-hero-stories.test.cjs:24–31。
- ✅ 旧守军补齐/非法记录拒绝/退休身份兼容/跨入口去重，named-garrison.js:31–32、hero-identity.js:5–41、governance-system.js:57–71。
- ⚠️ 手机截图及五条正常经济不能由diff独立确认；root已另报正常路线完成，手机待整合。

### 优点

来源与完整属性判身份而非名字；名册指向实际拥有ID，hero-identity.js:15–40、world-targets.js:38–39。合同测试真实围城接口/爵位/无首俘箱/损失/篡改拒绝，tests/named-hero-stories.test.cjs:32–42。城内招降/劝降/离间/城破招降回滚，engine.js:83–85、1367。报告区分夹具与正常经济。

### 问题

Important：engine.js:1230直接候选招募，扣费、加入将领和移除候选后save无交易状态恢复。本次新增身份去重已修改该路径。内存定向复现正常refreshInn候选，写存储失败后接口返保存失败，但gold减1000、generals新增、状态变更；需要事务回滚及测试。

Minor：tests/named-hero-stories.test.cjs:40统率断言lead<start*30，允许初始统率错误乘三。改为精确初始统率与正常升级增量。

### 评估

Needs fixes。完整读取diff，截断仅补缺范围；读取日志RED0/9、GREEN1028/1028；未重跑套件。仅运行直接候选保存失败内存复现；只读无文件/gitmutation或子代理。
