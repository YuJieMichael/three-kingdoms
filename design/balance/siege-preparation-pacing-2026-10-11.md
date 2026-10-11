# 围城筹备正常经济诊断

从新档、倍率1出发，只用正常奖励、市场、人口与训练；不送测试资源、等级或关卡完成。三路线共同采用名将成长，再比较逐批手工训练、模板补兵、模板加持续外交。此诊断复用已合入main的normal-famous-acquisition脚本并显式新增选项，未依赖PR67。

|种子|路线|结束小时|结果|存档有效|
|---|---|---:|---|---|
|1|manual|744.21|请选择武将|True|
|1|template|772.144|Template refill observation exhausted|True|
|1|template-diplomacy|791.489|Template refill observation exhausted|True|
|7|manual|664.979|请选择武将|True|
|7|template|664.979|请选择合法主将、指令和目标兵力|True|
|7|template-diplomacy|664.979|请选择合法主将、指令和目标兵力|True|
|19|manual|777.809|请选择武将|True|
|19|template|817.149|Template refill observation exhausted|True|
|19|template-diplomacy|832.831|Template refill observation exhausted|True|

九组均未完成招降关羽，因此不能据此判断江陵平衡达标或宣传模板缩短通关。手工路线在漫长发展后主将已不在可选名单；模板路线也有主将离队，或资源/人口缺口在500次补兵观察内仍未补足。模板并不创造资源、不预留主将、不改变围城规则；下一步需单独检验薪饷、补兵资金与城市供粮路线，再讨论数值。

功能边界另有真实Game定向测试及手机实际补兵提交证明。JSON保留每条路线的战斗、最终库存、有效性和补兵首末预览；完整原始输出在本次机器/tmp/siege-preparation-final-pacing.json。
