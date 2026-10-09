# TD-001 联机运行时过期检测实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking. 推荐由当前代理直接实施；独立代理评审需负责人选择授权。

**Goal:** npm test 自动阻止过期运行时与在线模块副本通过。

**Architecture:** 新增一个 Node 测试文件，按生成器规则从 index.html 读取实际脚本顺序，重算源码 SHA-256，核对产物导出的 runtimeHash、runtimeSources。七个在线副本按生成器的头部和导入路径变换逐字比较。不修改游戏规则或生成器。

**Tech Stack:** Node >=18，node:test、assert/strict、fs、path、crypto，无新依赖。

**Spec:** design/quick-specs/six-track-roadmap-2026-10-09.md 第6项与首批建议；docs/tech-debt-register.md TD-001。

## Global Constraints

- 保留现有 app.js 和练兵测试改动，不混入本批提交。
- 不改版本、不部署；当前按负责人继续指令整理独立 PR，合并仍需负责人明确授权。
- 仅本地文件核验，不连接 Supabase，不需要令牌。
- 测试通过不能代替真机或真人试玩。

## Review Focus

- 脚本新增、删除或顺序改变：runtimeSources 精确核对。
- 源码只改一字：SHA-256 检测到过期。
- engine.js 后的界面脚本：不纳入运行时范围。
- 七个在线副本中任一个过期：错误指出对应路径。
- 生成器特有的导入路径和头部：按实际转换比较，避免把正常副本误判为过期。

## Task 1：自动 freshness gate

**Files:** Create tests/online-runtime-freshness.test.cjs；Modify docs/tech-debt-register.md 的 TD-001状态和结果；本计划记录实际结果。

**Interfaces:** 读取 index.html、engine.js及之前的脚本、online/{runtime,world,realm-systems,service,http,auth,supabase-store}.mjs及其_shared副本。产生 node:test 的通过/失败，失败提示包含 npm run online:build。无生产接口变动。

- [x] Step 1：建立测试。断言 runtimeSources 与按HTML解析的列表deepEqual；断言 runtimeHash 等于按“文件名+换行+源码”计算的SHA-256；七个拷贝分别断言头部与转换后内容完全相等。缺失engine或产物给出明确错误。
- [x] Step 2：在临时夹具中证明检测能失败：依次改变源码、脚本顺序、删除一个拷贝、修改一个拷贝；断言对应检查报错。界面脚本变化不应触发过期。临时夹具和检测辅助逻辑仅放在tests内，不改真实工作区产物。
- [x] Step 3：运行 node --test tests/online-runtime-freshness.test.cjs。临时夹具的“应拒绝”断言通过，当前真实仓库检测也通过；若当前产物过期，核对原因并按项目规则重建，不能放宽断言。
- [x] Step 4：运行 npm test，全部通过；运行 git diff --check，确认没有格式问题。
- [x] Step 5：更新TD-001记录、计划结果；说明真实测试数量和当前未提交状态。不把TD-002等其它债务标为完成。

## 武将内容穿插

本批结束后，优先准备第1项的首批获取设计，并同时检查孙坚与古锭刀依赖；不在本技术债测试中添加武将代码。

## 执行记录

- 当前代理直接实施；首批任务1完成本地验证，尚未提交或推送。
- RED：未实现检查时，19项拒绝测试失败；GREEN：21项检查全部通过；完整回归604/604通过。
- Ruling: 使用内存受控读取夹具替代临时磁盘目录，保留真实源码及摘要计算；避免测试写入工作区。代价：不测试操作系统读取权限差异，真实仓库用例仍直接读文件。
- Ruling: 在新分支保留原未提交改动，不创建额外工作树；本批仅新增检测文件和文档，没有修改原功能文件。代价：将来提交必须精确选择文件，不能git add全部。
- 独立只读审查完成：未发现需要修改的重要问题；审查者独立运行21项新增测试全部通过，未审查原app.js改动。

## PR 收尾（2026-10-09）

- 基于线上 v0.34.49 的 main（1627f05）隔离复核，仅携带检测测试与本项文档；其他功能和技术债留在原工作区。
- 原实现已完成 RED/GREEN 与独立审查，本轮未重写检测逻辑；21项针对性检查再次通过。

- 本轮完整 `npm test`：607/607 通过（0 失败）；`node --check` 与 `git diff --check` 通过。新工作区首次测试缺少已有 pglite 依赖，补装后完整重跑通过；依赖配置未改变。
