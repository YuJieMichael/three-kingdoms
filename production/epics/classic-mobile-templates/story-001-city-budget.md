# 城池模板与经营预算

> **Type:** Integration
> **Status:** Done

## Context

Design: design/quick-specs/classic-mobile-templates-2026-10-11.md。既有原生JS全局脚本架构（ADR-0001），不新增引擎。次类型UI。

## Acceptance Criteria

1. 粮城/兵城/均衡城真实建造，可编辑、暂停恢复，不毁高级资源田。
2. 本城薪俸/欠饷/净供粮/空闲人口纯投影，多城支付归属正确。
3. 8小时预警，越过24小时消费预算一次确认，不改薪俸忠诚。

共用：旧档迁移与严格校验、打开界面不写档、390/440/1280截图无横向溢出。

实施与批次独立审查已通过，候选整合验证已完成，待最终整支审查与PR CI，未发布。详细证据见 production/qa/classic-mobile-templates-v0.34.71.md。
