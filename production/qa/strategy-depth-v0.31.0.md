# v0.31.0 战术与城市价值验收

日期：2026-10-05。范围为用户选择的三场军令遭遇、已有城市战略差异、赵云／马超第二批身份战法。CCGS minimal dev-story→story-done；判定 COMPLETE WITH NOTES。不是自然成长、真人平衡或百人在线容量结论。

## 已运行的必要检查

使用本机 Node v24.19.0，测试脚本与完整日志保留在工作区 `outputs/update-v0.31.0/`。

- 14个相关文件串行且不隔离文件进程，151项断言完成，151通过，0失败、0跳过，退出码0：`scoped-tests-no-isolation.log`。
- 生成权威运行时后的现有兼容检查，18项通过，0失败：`online-runtime-tests.log`。运行时从 index 中26个真实模块生成，包含 city-strategy；不部署远程服务。
- 来源关隘侦察补测1项通过，城市特性文件现7/7；另有city-defense14、office-promotion6、scout-queue3、first-scout-guide2共25项通过。去重后本轮195项必要检查通过（151＋1＋18＋25），没有把重复运行计成新用例。
- 所有更改的浏览器JS解析、版本资源存在与一致性、`git diff --check`在发布前检查。

**测试运行限制：** 默认文件进程隔离批次出现过 `war-branch-and-engine-participation.test.cjs` 文件级退出，没有子例／堆栈信息；该批次146个其他子例通过。该文件独立TAP、自定义 runner 事件、直接运行均5/5通过，捕获退出码0、signal=null；不隔离文件进程的完整定向批次151/151通过。原失败日志、诊断脚本和事件保留，具体退出原因未能复现，不能认定为游戏断言失败或已定位的Node问题。未更改生产测试配置。

## 实际浏览器操作

通过普通设置的导入存档入口，在独立 localhost:8138 保存空间使用准备存档；没有修改线上玩家存档。桌面1280×900、手机390×844。高阶官府、物资、兵力与军令进度是人工准备的功能夹具；画像购买、野将战胜俘获、黄金招降及三城占领由真实接口完成。不能由该夹具推断普通玩家成长平衡。

1. 任务册→战役军令，查看已达进度的三场遭遇，展开守军、反制、首次额外军功和场景说明。配兵100刀盾、1000弓兵，以普通将林朔开始行军，军队页显示真实兵种、抵达时间及进入战斗。
2. 正式盾幕蓄弦第0轮敌军公开弓队准备。暂停倒计时，推进准备轮，提交公共察伏；报价1点，筹策3→2。下一轮日志明确取消敌弓预备且预留攻击仍已消耗。继续战斗第3轮胜利，自动回地图，永久损失57、伤兵30、实际入库28,993，并开始返城。
3. 手机再次正式出征，未察伏时第2轮真实发生预备射击，筹策仍3/3，回合反馈显示我军倒下87、敌军倒下447。第3轮胜利自动结算，实际入库29,241；首奖已领取及十分钟整军可见。
4. 验证修复后的军队、查看目标弹窗和战后地图：无实体坐标的军令显示“军令战场”，不再出现undefined坐标或NaN距离；入口为讨伐及返回军令，整军时不可派出，不能误显示取得领地或掠夺。
5. 治下城市卡显示主城均衡、青石粮城+20%、白沙矿城+15%、赤岗关隘新派行军−20%；手机详情保留说明与运输／调遣入口。
6. 真实招降的赵云／马超名册及详情显示各自身份。五场演练可进入；第四场赵云准备轻骑接应，再让弓队后退，真实从1400→1025移动375，原速度250，筹策3→2，被保护队主攻击消耗，第2轮达成教学。
7. 第五场马超准备轮轻骑200→1200，响应轮推进至2100，将敌长枪2100→2250推退150，骑兵主攻击消耗；敌军随后仍按普通移动、攻击与反击规则行动。第2轮达成教学，没有额外冲阵伤害。教学不发正式资源或名将。
8. 用单独关隘准备存档，赤岗派10辎重运1000木至主城：普通68秒→实际55秒，粮45，预览后真正出发，军队页全程55秒；重载仍为55秒，原抵达时刻不变。

手机教学、城市详情、军令目标、运输确认的document.scrollWidth均390，未发生页面横向溢出；查看控制台错误为空。资源栏按原规则横向滚动。未做实体手机触屏验收。

## 截图证据

所有下列图片均由实际界面捕获并打开观察；文件与尺寸清单见同目录 `screenshots.json`。

| 画面 | 文件 |
| --- | --- |
| 正式遭遇条件／守军／应对 | [desktop-orders.jpg](evidence/strategy-depth-v0.31.0/desktop-orders.jpg) |
| 普通将察伏报价与真实扣策后战斗 | [desktop-formal-watch.jpg](evidence/strategy-depth-v0.31.0/desktop-formal-watch.jpg)、[desktop-formal-counter.jpg](evidence/strategy-depth-v0.31.0/desktop-formal-counter.jpg) |
| 四城价值 | [desktop-city-roles.jpg](evidence/strategy-depth-v0.31.0/desktop-city-roles.jpg)、[mobile-city-role.jpg](evidence/strategy-depth-v0.31.0/mobile-city-role.jpg) |
| 五场教学入口 | [mobile-teaching-catalog.jpg](evidence/strategy-depth-v0.31.0/mobile-teaching-catalog.jpg) |
| 赵云报价／完成 | [mobile-rescue-quote.jpg](evidence/strategy-depth-v0.31.0/mobile-rescue-quote.jpg)、[mobile-rescue-result.jpg](evidence/strategy-depth-v0.31.0/mobile-rescue-result.jpg) |
| 马超报价／完成 | [mobile-charge-quote.jpg](evidence/strategy-depth-v0.31.0/mobile-charge-quote.jpg)、[mobile-charge-result.jpg](evidence/strategy-depth-v0.31.0/mobile-charge-result.jpg) |
| 关隘实际运输报价／行军 | [mobile-pass-transport.jpg](evidence/strategy-depth-v0.31.0/mobile-pass-transport.jpg)、[mobile-pass-march.jpg](evidence/strategy-depth-v0.31.0/mobile-pass-march.jpg) |
| 军令手机目标／正式响应轮 | [mobile-encounter-target.jpg](evidence/strategy-depth-v0.31.0/mobile-encounter-target.jpg)、[mobile-formal-response.jpg](evidence/strategy-depth-v0.31.0/mobile-formal-response.jpg) |

## 验收追踪

| 条件 | 直接证据 | 结果 |
| --- | --- | --- |
| AC-1 逐阶遭遇、普通反制、一次首奖 | war-encounters：进度与路线上限、真实胜利与重载、边界及重复首奖；桌面军令与正式察伏 | COVERED |
| AC-2 正式几何／敌计、身份边界／共享禁用 | war-encounters：真实行军开战、黄忠／魏延／火区、场景伪造／规则降级／共享派遣启动拦截 | COVERED |
| AC-3 本城毛产量／新派时间 | city-strategy：固定角色／毛产量扣养兵／新派实际时间／切城重载；来源侦察 | COVERED |
| AC-4 卡片／目标／实际报价 | city-strategy只读UI及运输报价；城市、目标、运输截图，55秒真实队伍 | COVERED |
| AC-5 赵云条件／代价／边界 | hero-actions：真实画像招降、正式响应、距离与指令失效、死亡取消／火区；手机375撤退教学 | COVERED |
| AC-6 马超实际推进／固守反制／攻击机会 | hero-actions：真实画像招降、准备及推退、固守与距离／火区／被动位移；手机150推退教学 | COVERED |
| AC-7 新旧版本及攻击账本 | hero-actions和battle-stratagems：v1继续战斗／v2重载、身份伪造、预算与强制位移；五场独立教学 | COVERED |
| AC-8 必要检查／真实界面／生成副本 | 定向151、运行时18、补记检查与14张截图；大型本地回归和自然长局按用户安排暂缓 | COVERED |

## 审查与范围

三位代理按限定文件开发，根代理接入真实引擎；城市与遭遇代理另做共享接线只读复核。已修复共享模式开始既有单机遭遇时丢计谋、场景战斗存档降级绕过，以及军令UI虚假坐标和领地语义。无需新增全局配置或费用；本城系数及遭遇数据在各自数据模块，赵云／马超规则在计谋模块，沿用平铺JS工程。

QL-TEST-COVERAGE按minimal、LP-CODE-REVIEW按solo跳过正式角色门禁；上述真实代理复核另有执行，不冒称Claude服务或自动hook。完整自然经济、名将战术在普通配兵中的机会频率、真人易读性仍待集中试玩。默认Node文件进程退出限制如上保留。

Graphify使用本地代码提取与相同排除项刷新，再无标签重聚类；当前1436节点、3203边、86社区（最终追加测试可能只改变测试节点）。未启用watcher、hook、外部语义或上传；SQL解析依赖缺失与嵌套IIFE覆盖限制仍存在。

## 发布

应用与68项JS/CSS资源版本统一v0.31.0。具体提交、CI及Pages精确结果、线上字节校验以工作区 `outputs/update-v0.31.0/publish-receipt.json` 为准，本文件不替代回执。
