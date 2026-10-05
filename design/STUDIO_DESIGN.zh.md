# 三国城志 · 工作室设计资料

2026-10-05。采用已安装的 [CCGS Codex适配工作流](/Users/lihuazeng/.codex/skills/ccgs-game-studio/SKILL.md)；设计和评估由当前Codex及独立子代理执行，没有启动Claude模型服务。当前配置为minimal／solo；没有导演批准或商业上线结论。

## 从这里开始

| 资料 | 解决的问题 | 状态 |
| --- | --- | --- |
| [一页游戏纲要](game-brief.md) | 核心循环、玩家目标、范围与开发顺序 | 根据现有游戏及用户方向整理 |
| [当前游戏测评](../production/qa/game-evaluation-v0.28.0.md) | 哪些已经改善，哪些仍限制耐玩，下一轮先做什么 | CCGS设计／经济／QA及实际浏览器证据 |
| [名将与计谋草案](gdd/hero-stratagems.md) | 解决名将同质化，给计谋设置条件、代价、预兆与反制 | 待原型验证，未改动玩法 |
| [六项更新规格](quick-specs/realm-online-v0.28.0.md) | 多城、物流、图鉴、守城／侦察、培养与在线服务 | 当前实现与本地验收 |
| [规则](../RULES.md)／[验收记录](../production/qa/realm-online-v0.28.0.md) | 当前实际规则和已验证范围 | 不以草案替代当前规则 |

## 工作室的方法怎样用在这款游戏

1. **游戏设计：先确定要让玩家做出的选择。** 目标是判断情报、选择主将和配兵、经营补给，而不是只提升战力数值。新机制要说明改变了哪个选择。
2. **系统设计：把选择写成能执行的规则。** 条件、代价、顺序、上限、反制、旧档与离线行为一起写；同一机制在守城和PVP中必须保持一致。
3. **经济设计：核对奖励与消耗。** 首弓材料、补兵、名将招降、技能、各城产量与运费一起看；共享竞争服先确定试玩货币、缺粮和资源保护政策。
4. **关卡设计：用敌军证明机制有用。** 先安排“停在射程外／盾兵探阵”“追击／守线”“火区／提前揭露”三场教学战，复用同一战场与不同条件；扩关前先看换将是否带来换打法。
5. **UX与QA：让玩家看懂结果。** 按军情→行动→收益／损失说明原因；手机高频操作保持短。必要定向检查持续做，全量回归和自然后期长局按用户要求集中安排。

对应工作流：[brainstorm](../.claude/skills/brainstorm/SKILL.md)、[design-system](../.claude/skills/design-system/SKILL.md)、[balance-check](../.claude/skills/balance-check/SKILL.md)、[playtest-report](../.claude/skills/playtest-report/SKILL.md)。角色资料：[game-designer](../.claude/agents/game-designer.md)、[systems-designer](../.claude/agents/systems-designer.md)、[economy-designer](../.claude/agents/economy-designer.md)、[qa-lead](../.claude/agents/qa-lead.md)。这些是方法与参考资料，实际调用由Codex完成。

## 后期设计顺序

先让三位名将与公共计谋形成不同打法，再串起黄巾城市→县城→郡城／州城的价值链。重要城市拟提供联盟补给与战略位置；先有可争夺利益、宣战预警、资源保护和败方恢复，再加入外交、作战标记与盟友运输。这里是后续设计建议，当前玩家城池尚不能易主，郡／州城争夺也尚未实现。

草案的下一步是小规模原型与对照试玩。没有新人理解率、完整正常后期收益和真实百人负载数据时，不把“功能能运行”写成“平衡且耐玩”。
