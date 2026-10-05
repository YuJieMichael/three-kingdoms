# 挂机助手浏览器核验

2026-10-05 本地候选 v0.19.0：桌面打开助手，填写粮食保留 1000，经过定时刷新后 DOM 仍为 value=1000 且焦点保持；点击保存显示“设置已保存”。390 像素 iframe 打开助手，表单 clientWidth=scrollWidth=336，checkbox 宽度 22；没有表单横向溢出。截图在本任务 outputs/v0.19.0/automation-desktop.png 与 automation-mobile.png，已查看手机截图。状态、付款及完成去重由自动测试覆盖；未通过真实长时间等待验证每一种队列通知，实体手机未测试。
