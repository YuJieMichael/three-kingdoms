# 运输与练兵模板

> **Type:** Integration
> **Status:** Done

## Context

Design: design/quick-specs/classic-mobile-templates-2026-10-11.md。既有原生JS全局脚本架构（ADR-0001），不新增引擎。次类型UI。

## Acceptance Criteria

1. 补给预设可编辑源保留/目标库存，待到货抵扣缺口。
2. 三种练兵目标真实扣费排队，计入当地已有及队列，在途不算。
3. 自动训练可停，队满/人口资源不足等待，遵守薪俸预算，离线不新排。

共用：旧档迁移与严格校验、打开界面不写档、390/440/1280截图无横向溢出。

实施与批次独立审查已通过，候选整合验证已完成，待最终整支审查与PR CI，未发布。详细证据见 production/qa/classic-mobile-templates-v0.34.71.md。
