# 四批实施取舍记录

以下逐条保留执行记录中的Ruling。测试失败、正常经济未完成与未测真机不作成功结论。

## 第01批

- Ruling: skill helper scripts cannot execute their nested helpers because executable bits are missing — use bash where possible and keep equivalent briefs, bases, test results manually in this ledger; do not change installed skills permissions.
- Task 1 Ruling: named-city.test uses a rules-only load list without engine, and city-strategy smoke uses helper list — only engine-loading lists need JourneySystem; include journey-system.js in the named rules-only list too for AGENTS completeness; journey-ui stays optional UI test load like other UI scripts.
- Ruling: UI smoke test omitted real application's manualModalContext global; fixture now defines it rather than weakening live refresh behavior. Red failure reproduced and green verified.
- Final: Ruling: real Safari and natural-growth balance remain unjudged — browser size checks and prepared soak are explicitly limited; cost if wrong: mobile real-device or pacing issue remains undiscovered.

## 第02批

- Ruling: manual equivalent briefs/ledger continue due skill nested helper execution permission issue; cost if wrong: bookkeeping omission, not game behavior.
- Task 2: Ruling: record hadGate boolean in facts — avoids attributing field losses to an unbroken city gate; cost if wrong: one extra receipt schema field.
- Final: Ruling: completion ETA and copy-current-dispatch omissions upgraded to Important — they are approved core preparation operations needed to judge the deadline and avoid re-entering an army, rather than discretionary polish; both implemented and tested RED→GREEN; cost if wrong: extra UI controls.
- Final: Ruling: quote ignores benign income/population drift if actual eligible orders/cost/duration remain identical — fresh calculation still validates affordability before one commit; cost if wrong: stale confirmation could mislead, covered by changed-order rejection.
- Final: Ruling: entity Safari and normal balance withheld — phone/desktop sizes checked independently; simulations must retain failures and prepared labels; cost if wrong: actual mobile/pacing issue remains undetected.

## 第03批

- Task 1: Ruling: 统帅450检查使用Game.general而非原始generals定义 — 既有成长系统投影才是实际统帅，原始200不是玩家看到的450 — 若判断错会遗漏实际统帅回归，既有starting-levels测试共同覆盖。
- Ruling: 灵斩按比例直接折损仍遵循原规则，不作为通常承伤；刀盾特色用于敌兵攻击、箭楼及火势伤害 — 保留规则战独立危险；若错误会令玩家误解少数特殊战减伤范围，需明示描述。
- Final: Ruling: 两项说明从Minor升为Important — 支线后效属于已批准的操作结果说明，灵斩例外关系实际战术决策，均补说明及RED→GREEN — 若判断过度，成本只是一行必要说明与两项回归。
- Final: Ruling: 第四批留给对应计划；江陵经济沿第二批失败证据；真机Safari未测 — 审查未判断的范围明确保留，不能写成功 — 若错误，将漏跨批集成或设备问题，第四批总审查与尺寸验证补覆盖。

## 第04批

- Ruling: scripts bookkeeping performed manually, same as previous plans — nested installed helper scripts lack execute bits; record briefs/base/tests without changing installed skills — if wrong tooling-only record loss, source commits remain.
- Ruling: 套装卡沿旧浅纸底却继承浅文字，实机尺寸截图无法读名称/属性；此次补深色卡片文字 — 与新兑换所得装备验收直接相关 — 若判断错会影响旧装备配色，手机/桌面截图覆盖。
- Ruling: 计划要求整路变绿但三条正常江陵路径已有失败证据；保留非零退出与真实卡点，不擅改薪俸/资源/援军令经济或假装通过 — 七功能接口完成，整路平衡未通过 — 若错误会延误上线验收，明确待下一版平衡方案批准。
- Ruling: 旧装备UI测试把所有事件混进同一数组，再假设第一个是click；新增change导致误调用 — 按真实DOM事件类型存储并派发click，未为测试改变生产注册顺序 — 若错误会漏事件绑定，新的部位选择测试与浏览器真实change共同覆盖。
- Final: Ruling: 主动核对共享模式发现新兑换未进命令包装名单，定为Important并限定单机 — 共享客户端本地假到账会破坏可信显示，不扩展未开放协议 — 若错误会提前限制将来联机兑换，未来需单独实现服务端命令。
- Final: Ruling: 审查未判江陵/副本经济和实体Safari/联机转城生命周期，保留失败与未测标签，不外推通过 — 当前试玩以单机为主且未授权新的经济大改 — 若判断错会漏自然成长或设备/转城问题，后续平衡方案与真实设备验收补齐。
