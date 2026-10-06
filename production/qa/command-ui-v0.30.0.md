# v0.30.0 指挥界面必要验收

日期：2026-10-05。CCGS minimal dev-story → story-done；用户选择前五项并授权实现／发布。没有启用 Claude 服务、钩子、外部图谱后端或远程 Supabase。

## 自动检查

106项唯一必要用例全部通过，无失败／跳过。文件：command-interface.smoke（11）、growth-economy（10）、first-battle-guide（6）、army-timing（12）、save-session（23）、combat-feedback.smoke（3）、battle-guidance（5）、tactical-lessons.smoke（5）、combat-command-and-captive-batch（6）、general-growth.smoke（3）、chapter-unlock（10）、mission-visibility.smoke（4）、yellow-cities.smoke（8）。执行日志保存在工作区 outputs/update-v0.30.0/scoped-tests.txt。新测试覆盖真实奖励／资源缺额／等待刷新、礼包十阶完成、五入口、只读查看与写操作隔离、兵种详情、地图未来据点和本地版本资源。源文件解析与git diff --check通过，隔离在线运行时源指纹仍为815ae1200a0e。

## 浏览器观察

使用隔离的127.0.0.1:8138，不操作用户8137的城池。使用先前合成抓将前置存档，以及通过普通礼包／任务API准备的官府10级验收存档；不代表自然成长路线。主标签390×844和1280×900，第二只读标签实际1280×720。

- 五主入口、城内外切换、队列／背包／任务直接入口；更多可打开商城／战报／来袭。十阶全领后常驻礼包消失，更多仍显示10/10。
- 目标详情保留主线／成长差异与实际阶段奖励。前往实际研究页面可用。目标详情先显示当前任务的真实条件与含声望的完整补给，再按需展开主线／成长路线；最终11项界面检查再次通过。发现等待文案未刷新并已修正；定向测试验证倒计时随时钟变化。
- 地图与目标优先；展开总览后小地图宽100px，坐标跳转到主城视野成功，展开状态保留。坐标框回显旧选中目标的问题已修复，最终浏览器复核显示32/32且工具保持展开。守军与规则收进详情，侦察／画像要求仍可见。
- 兵种列表压缩，弓兵能力、费用／前置和训练报价仍可打开。将领名册显示核心属性、初始值分色、出征忙碌、城守与专属战术；黄忠详情保留且忙碌培养操作禁用。
- 两场正式战斗操作全军指令、暂停、下一回合；有战损回合显示摘要。结束自动结算回地图，真实入库749／892、返城5秒仍显示。实际70人队伍行军10秒、到达待指令可见。此处是独立夹具流程，不是自然长局。
- 独立演练推进两回合，日志展开状态经showModal重建保留；正式回合完整经过与日志展开也保留。兵队选择展开指令经实际演练复核，修正演练独有lesson前缀后刀盾兵指令立即展开；新增检查使用正式／演练两种真实键格式。筹策／攻击预留／射程控制可见。手机暂停状态原挤成多行的问题已修正重拍。
- 第二页显示只读；更多／兵种详情可打开，点击训练被保护拦截且仍留在详情。实际开启黄巾预警后主界面显示5分钟准备与守城按钮；缺粮产量及超仓容量、配兵预计实际入库保留。
- 军队内容曾把界面列撑到412px、裁掉按钮，已加minmax(0,1fr)并重测：手机头部、主区、页脚均390px，主区无横向溢出。正式桌面主区无横向溢出。浏览器运行错误记录为空。

## 留存截图与边界

截图目录为 evidence/command-ui-v0.30.0，主代理已实际打开观察各触及页面。手机：mobile-city.jpg、mobile-outskirts.jpg、mobile-map.jpg、mobile-map-target.jpg、mobile-map-tools.jpg、mobile-heroes.jpg、mobile-hero-detail.jpg、mobile-troop-roster.jpg、mobile-troop-detail.jpg、mobile-battle.jpg、mobile-lesson.jpg、mobile-objectives.jpg、mobile-warning.jpg、mobile-march.jpg。电脑：desktop-city.jpg、desktop-map.jpg、desktop-army.jpg、desktop-heroes.jpg、desktop-battle.jpg、desktop-lesson.jpg、desktop-more.jpg、desktop-readonly.jpg。screenshots.json保存像素尺寸；mobile-gifts-complete.jpg使用修复宽度后同一全礼包状态的城池截图。部分早期名册／详情截图早于最后的共用宽度约束，最终宽度确认见修后城池、军队、地图、正式战斗截图和DOM尺寸。

大型本地全量回归、自然长局、实体手机、真人可用性／平衡和线上多人负载未测；按用户要求集中安排。云服务未配置或部署。本地Graphify仅代码增量刷新：1388节点／3092边／80社区；CSS、嵌套IIFE和SQL覆盖不足仍以源码为准，图谱不提交／上传。

发布门禁：按本版实际提交核对GitHub CI、Pages构建和67份公开JS／CSS逐字节一致；精确状态与提交以工作区 outputs/update-v0.30.0/publish-receipt.json为准，尚未产生回执时不代表已发布。
