需求符合性：❌ 有问题。固定阵容、默认关闭、单次离线推进和跨城来袭已实现，但保存失败回滚及防篡改校验存在漏洞。
代码质量：Needs fixes。
优点：faction-system.js:18,22,44纯投影/离线一次/来源城匹配；npc-defense.js:43,211独立冻结元数据及奖励经验校验；engine.js:1081一份固定粮金沿负重回执；HTML及六清单完整，runtime只读逐字节核对。
Important1 engine.js:1447 出征内部新建营地绕过事务。包装在tick前判断目标factionCamp；六小时到期未创建时dispatch恰好target新营地，tick先保存营地，后扣兵冻结行军没进入atomic。实验最终保存失败弓5000→4200且expedition仍有。修调用前完整状态统一事务，补时序回滚测试。
Important2 faction-system.js:33 删除势力标记绕过固定敌军校验。faction===undefined无条件通过；删除营地行军faction并改enemySnapshot={militia:1} validSave仍true。结合活动营地/目标/阶段要求meta，旧快照保留明确时间与来源边界。
Important3 grid-world.js:147 → campaign-ui.js:28、classic-ui.js:107 营地奖励说明不符结算。继续承诺商城道具/额外资源概率/掠夺基础+30%，engine.js:1081对势力跳整个rollBattleDrops且不加30%。提供营地专用说明与准确掉落投影，覆盖详情文案。
Minor grid-world.js:147 → campaign-ui.js:86–87、classic-ui.js:106–107 来袭营地配兵掠夺仍可点，占领用了attackBlocked，后端拒绝无重复结算风险；同步禁用显示原因。
边界：读49/49和1048/1048日志未重跑；只跑两项未覆盖疑点实验，无文件/提交修改；正常经济/手机证据由root持有，未声称真机。
