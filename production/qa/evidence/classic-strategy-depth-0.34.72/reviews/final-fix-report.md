# 唯一最终修复波报告 · R1 / R2

日期：2026-10-11。工作区 `/Users/lihuazeng/.codex/worktrees/nanman-campaign/superpower`，分支 `feat/classic-strategy-depth`，基线 `6a03a16566619fe64eee46403bf3976d171f20c9`。

## 范围与修复

只处理 final-review.md 的两项 Important，没有纳入克制表的非阻塞建议或旧动作的泛化重构。

- **R1**：`HeroSystem.wild.location` 共用 `available` 判定加入 `!n.factionCamp`。首次打听与活跃线索迁移都排除既有营地，原有营地选择器继续排除先出现的线索。
- **R2**：把 `setRecoveryPriority`、`healWounded`、`setAutoHeal`、直接 `recruit` 纳入既有势力整份事务包装，在单机势力开启、tick可能推进时沿原 `factionTransactionDepth` 禁止中途写入，由完整操作末尾一次最终保存。关联性判断限制在原守城/野战动作，新增入口不会误把已有出征当作自身营地战。`warCareTransaction` 的失败路径补 `CitySystem.capture`，重新连接本城镜像；原有写入错误暂停状态和错误文本仍向外返回。
- 重建 `supabase/functions/_shared/game-runtime.mjs`，52个源文件，新hash `a7a8c1c691efa0469c489c9ae12a92433ed5a5502165046b9130b1231e4300ad`。

未改版本、未推送、未合并、未派子代理。未修改或暂存 root 的 HANDOFF、design/balance、QA和evidence材料。本报告及旁边日志位于既有忽略的工作流程目录，只在磁盘保存，产品提交不强行纳入该目录。

## TDD：实际 RED → GREEN

新增 `tests/faction-cross-system.test.cjs` 11个回归。只用准备城市、库存和合法战斗来源账本来隔离合同问题，不把夹具当正常经济/数值证明。

先运行：

```sh
node --test tests/faction-cross-system.test.cjs > /tmp/classic-final-fix-red.log 2>&1
```

**RED：退出1，11测试，1通过、10失败，0跳过/取消。** 日志完整保存为同目录 `final-fix-red.log`。预期失败分别为：

- 4个R1测试在 `花鬘线索不能占用既有营地` 失败，actual与expected都为 `wild_27_50`；覆盖先营地后发现、已派队后发现、线索迁移。先线索后营地的既有方向通过。
- 治疗/自动治疗/直接招募3个失败写入测试：完整内存已回滚，但 `sanguo-city-v2` 原始字节不同，磁盘含中途营地及工资/经济结算。
- 上述3个成功测试：完整操作有2次存档写入，而合同要求1次。

完成最小产品修复后，同一命令改写 `classic-final-fix-green.log`：**退出0，11/11通过，0失败/跳过/取消，1542.567208ms。** 完整日志保存为同目录 `final-fix-green.log`。

R1清剿两时序均采用 `advance(Math.ceil(expedition.end-now())+1)`、`startBattle`、最多30个实际 `battleRound`，断言真实获胜、营地移除、花鬘仍为活跃线索、无误俘/首箱，以及有效保存重载；没有伪造胜利。另测原营地准时向原来源城市发15分钟预警。

R2只在最终存档包含 treated/new general 时模拟localStorage失败；tick阶段写入可正常通过，因此原缺陷确实会泄漏到磁盘。GREEN同时断言：完整内存JSON、原始存档字节、治疗费用/账本、候选、另一城工资与全局发薪时间均还原；本城res/army/warCare/innCandidates镜像对象重连；失败后模式write-error且再操作不重写。成功三路线仅1次完整实际写入，按6小时发薪扣本城120、另一城120，再扣治疗费或候选价格；新将归属来源城，存档重载严格有效。

## 定向关联验证

运行：

```sh
node --test tests/faction-cross-system.test.cjs tests/faction-system.test.cjs tests/recovery-training.test.cjs tests/named-hero-stories.test.cjs tests/wild-five.test.cjs tests/wild-portraits.smoke.test.cjs tests/hero-actions.smoke.test.cjs tests/save-session.test.cjs tests/online-runtime.test.cjs tests/online-runtime-freshness.test.cjs > /tmp/classic-final-fix-targeted.log 2>&1
```

**退出0，156测试全部通过，0失败/取消/跳过，10354.101875ms。** 完整日志保存为同目录 `final-fix-targeted.log`。

另依次完成 `node scripts/build-online-runtime.cjs`（退出0，52源，新hash见上）；以下4个语法检查均退出0且无输出：

```sh
node --check hero-system.js
node --check engine.js
node --check tests/faction-cross-system.test.cjs
node --check supabase/functions/_shared/game-runtime.mjs
```

`git diff --check` 退出0、无输出；暂存后另做 `git diff --cached --check`。本席位按合同不重复完整npm或正常数值矩阵，交root完成最终全量和唯一范围复审。

## 自审与限制

源码修改局限2个现有产品文件，共用名将选址1条判定、治疗回滚2条镜像连接、既有事务包装新增4入口；无新产品脚本、无新存档字段、无界面变更。新增只有测试脚本，无须改浏览器或生产脚本清单。生成runtime差异只包含上述源变化和hash。

未发现本波剩余阻塞疑虑；完整npm、正常矩阵、独立最终范围复审尚待root执行，不能以156项定向结果替代它们。未验证实体Safari或联机完整玩法。

## 提交

提交只含 `engine.js`、`hero-system.js`、`tests/faction-cross-system.test.cjs`、生成runtime；提交号 `c4cf292ed4d991653e053883de7190faf1c1ef23`（`fix: isolate faction camps and atomic care recruitment saves`）。`git diff --cached --check` 退出0，提交后工作区仅剩root原有未暂存材料。
