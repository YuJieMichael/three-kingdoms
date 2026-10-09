# TD-003 classic.css 纯格式化计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 使 classic.css 可逐条审查，保持画面与规则不变。
**Architecture:** 只添加换行和缩进，不排序、合并或删除声明；不格式化其他文件。
**Tech Stack:** 原有 CSS；Node.js 测试与浏览器 CSSOM 验证。
**Spec:** docs/tech-debt-register.md TD-003 首步。

## Global Constraints

- 保留手机点按修复的媒体条件。
- 不改变任何选择器、属性、值、规则顺序、注释内容、脚本、版本或存档。
- 生产脚本不变，无需重建在线运行时；负责人本轮已授权本地提交；不推送或发布。

## Task 1

- [x] 检查是否有测试逐字匹配 classic.css，记录手机 440×956 基准画面与浏览器规则。
- [x] 纯格式化，非空白字符序列及 SHA-256 前后相同。
- [x] 浏览器解析的399条顶层规则文本和顺序完全相同，手机截图前后对比。
- [x] 触摸/弹窗定向测试7/7。
- [x] 完整测试、独立审查、更新登记册。

## Review Focus

媒体嵌套与声明顺序保持；字符串、URL、注释与空格选择器不变；不夹带其他CSS；不能将手机尺寸鼠标浏览器称为iPhone Safari真机。

实施结果：隔离全套578/578；主工作区组合回归605/605；独立审查3819个有序语法片段完全一致，4条注释原样保留，无阻断问题。负责人已授权本地提交；未推送发布。
