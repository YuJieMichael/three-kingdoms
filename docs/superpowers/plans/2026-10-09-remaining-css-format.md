# TD-003 剩余样式纯格式化计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 让登记的剩余单行 CSS 可逐条审查，保持画面与规则不变。
**Architecture:** 仅在规则与声明边界添加换行和缩进；保留选择器、属性和值内部空白，保留字符串、URL、注释和规则顺序。
**Tech Stack:** 原有 CSS、Python 临时格式化工具、Node 测试、浏览器 CSSOM。
**Spec:** docs/tech-debt-register.md TD-003；TD-006 第一批已经解除 web-edition.css 颜色逐字匹配。

## Global Constraints

- 复用 test/ui-behavior 隔离工作区，保留上一批测试改动。
- 本批仅修改 style.css、city-defense-events.css、command-ui.css、web-edition.css 与计划/QA/登记记录。
- 不改脚本、玩法、存档、加载顺序、版本；不提交、推送或发布。
- 不将桌面浏览器的手机尺寸检查称为 iPhone Safari 真机验收。

## Task 1

- [x] 保存四份原文；扫描逐字匹配，记录手机 440×956 城内及建筑弹窗基线与四份 CSSOM。
- [x] 格式化四份 CSS；非空白字符序列一致，另核对有序选择器/声明/字符串/注释的语法片段。
- [x] 重载浏览器，四份 CSSOM 内容和顺序一致；截图与布局检查。
- [x] 定向与完整测试；一次独立审查，更新登记/QA，同步回主工作目录，完成组合回归。

## Review Focus

选择器中的后代空格、calc 运算符、字符串/URL、注释边界、媒体规则嵌套不得改变；原末尾缺分号不补写；不得夹带 CSS 内容修改；规则相同且画面一致才能收尾。

实施结果：四文件非空白序列与 6306 个有序语法片段一致，浏览器 CSSOM 586 条一致；手机尺寸城内与官府布局一致；定向 30/30，隔离 585/585，组合 612/612，独立审查无阻断。未提交或发布。

收尾授权：负责人要求继续，按独立 PR 收尾，暂不合并或上线。本轮同步 main v0.34.51，沿用已审查的实现。
