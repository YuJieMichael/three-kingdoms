# 五项指挥界面精简

ID: UI-command-001
Type: UI
Layer: Feature
Status: Complete
Last Updated: 2026-10-05
GDD: design/quick-specs/command-ui-v0.30.0.md
Workflow: minimal
Dependencies: existing v0.29.0 public game

## Acceptance Criteria

- [x] 五个主入口，城内外子页，队列/背包/任务直接打开，十阶全领后常驻礼包退出。
- [x] 当前目标、差额、奖励与前往集中展示；阶段/成长/任务详情仍可访问。
- [x] 地图与目标优先，坐标/小地图/历史说明展开可用，未来任务据点仍受限。
- [x] 军队与将领紧凑列表、详情可用，初始属性染色仅作用于对应数值。
- [x] 正式战斗与独立演练聚焦阵型/指令/计谋/倒计时，完整经过与日志可展开。
- [x] 驻外/行军时间、来袭、缺粮、超仓/实际资源预览与只读保护保留。
- [x] 手机与桌面触及页面保留并观察截图，适用定向检查通过。

## Constraints

用户授权实现与发布。无新增游戏规则、云端部署、全面美术重做或本地全量回归。本故事不以代码推断真人可用性或自然成长结果。

## Verification

Run result: OBSERVED — 106项定向检查通过；390×844及1280×900独立存档实际操作与已观察截图，见production/qa/command-ui-v0.30.0.md。三位内部子代理分别实现名册、地图、战斗，地图代理另独立复核共用目标／只读并新增11项检查。修复目标等待刷新与手机军队列裁切。无规则或云部署偏差。真人易读性／自然长局仍按用户要求集中安排。

## Release Gate

实现验收已完成。提交与发布的精确CI、Pages及公开67资源状态以工作区outputs/update-v0.30.0/publish-receipt.json为准；没有成功回执不能宣称发布完成。
