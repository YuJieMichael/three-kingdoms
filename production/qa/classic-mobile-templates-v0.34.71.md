# 八项手机模板候选 v0.34.71 · 验收记录

状态：八项实施和最终独立审查已完成，候选v0.34.71，PR #74，未发布。978/978本地测试通过；GitHub CI以PR当前提交检查为准。以下按时间保留实施、失败和修复证据，末尾为最终验收。负责人已批准八项全部和推荐方案，自主执行；当前授权不包含本批发布。

## 覆盖台账

|项目|批次|产品状态|证据|
|---|---|---|---|
|1城池模板|Task1|批次审查通过|440×956真实点击保存/扣材料/暂停|
|8经营预警|Task1|批次审查通过|本城账目和薪俸专项；基线诊断|
|2运输模板|Task2|批次审查通过|已有SupplyLines真实规则|
|3练兵模板|Task2|批次审查通过|按目标、真实扣费|
|4名将册|Task3|批次审查通过|已知线索与真实招降|
|6地图快捷|Task3|批次审查通过|半径6权限投影|
|5战场难度路线图|Task4|批次审查通过|共享每日箱规则|
|7任务科技路线|Task4|批次审查通过|真实前置与当前任务|

## 基线

main ac8cc01368261e6b893f32c573e9dd2804b24222，产品0.34.70；隔离分支feat/classic-mobile-templates。基线npm test870/870（/tmp/classic-templates-baseline.log）。此前诊断种子7欠饷离队及24h玩家留金对照已归档，不是本批生产修复。

## 实施、独立审查与数值

Task1：首轮19专项、7烟测、889全量通过。独立审查复现正常tick不续排和重复建筑取第一座两项Important；修复提交2d7e86f补RED→GREEN，21专项及891全量通过，定向重审通过（仅Task1）。正常获得旧档种子1/7/19均成功迁移、只读报价与预算保持状态，真实建造有效，但净粮分别-757.4/-674.4/-724.4每小时，不能视为长局经济通过。其余批次待证据。未取得证据的项不得标通过。没有新增资源/兵力用于正常经济声明。

## 手机与桌面截图

计划390×844、440×956、1280×900；真实iPhone Safari未验。浏览器操作只用CUA，DOM evaluate只读。

Task1初验：440×956城市模板可切换粮城，保存后需确认；确认运行后真实建立民房/市场两项工程并扣材料，暂停保留已开始工程。账目初始本城时薪40、24小时留金960，与现有苏砚2级规则一致。截图：`evidence/classic-mobile-0.34.71/task1-city-template-440.jpg`。本地IAB初次加载发生临时脚本缺失，刷新恢复；不据此宣称产品缺陷。

## 发布检查

最终统一版本0.34.71、runtime/脚本加载清单、全量测试、PR CI、负责人明确发布指令。候选版本、runtime和最终全量953/953已完成；最终整支审查、PR与CI仍待，未发布。

## 执行决定

- 用户明确“不用问我直接同意”，按推荐直接实施完整八项，跳过重复设计/计划审批；若理解错误，代价为可回退的设计与代码修改。
- 整合后创建一个0.34.71 PR，保留本批发布门槛；若需要分批上线，可拆成多PR。

Task1补验：390×844与1280×900首页/模板DOM宽度等于视口，无横向溢出。390旧档经营短条将“闲民”和950拆行，待最终集成改善。控制台仅保留18:05:47首次加载的三条错误，刷新后界面操作没有新增错误。实际导入的是正常获得0.34.70种子7旧档，浏览器导入按既有规则结算离线时间，界面库存因此与原始JSON略有变化。

## Task1 72小时正常经营初验（修复工作树）

`node tests/balance/classic-mobile-operating.cjs <output>`，使用已正常获得的旧档，按粮城模板运行72游戏小时，每游戏分钟在线推进；没有资源/武将/兵力/等级赠送，保留其他既有政策。初版脚本把importSave成功值误断言为null（实际undefined），修正诊断断言后运行。

|种子|初始净粮/时|72h净粮/时|最低黄金|离队|存档|
|---|---:|---:|---:|---|---|
|1|-757.4|6085.9|1983043|无|合法|
|7|-674.4|6168.9|1551377|无|合法|
|19|-724.4|6118.9|1679442|无|合法|

这是已有高阶且库存充足旧档的粮城经营路线，通过不代表新开局/全部城池/围城或募兵经济全面通过。结果保存在`design/balance/classic-mobile-operating-2026-10-11.json`；最终集成必须按最后代码再跑。

## 正常多城运输路线初验

`tests/balance/classic-mobile-multicity.cjs`使用三份正常旧档，按距离选择附近平地，真实占领、支付建城费用，再使用已有补给线发送粮食。种子7成功建城并付费运200粮、另付14行军粮，暂停后完成送达/返城且旧档往返合法。种子1/19各自最近平地的真实占领战未胜，未继续建城，诊断整体退出1并保存失败战报；没有赠兵或挑隐藏弱敌来消除失败。完整记录见`design/balance/classic-mobile-multicity-2026-10-11.json`。种子7成功档保存为手机双城检查材料；不视为全部种子多城经济通过。最终集成复跑。

## Task2初验

HEADd74deb9；33专项/907全量通过。root440真实弓兵队保存/补齐：300盾与200弓两项排队，付粮120000/木115000/铁180000，开启自动不重复；普通训练原经济无gold，未添加金币价。使用正常获得双城档，黄金预设10义兵真实装200金另付14粮，13秒；暂停保留当前在途并送达返城。390补给面板无横向溢出，总览真实显示来源“出城10人·13秒”和目的“入城10人·13秒”。截图在evidence目录task2-*。Python开发服务缓存旧脚本导致一次看到旧补给入口，切到Node no-store8192后恢复最新UI，最终验证用Node服务。

Task2独立classic_review2结论Ready：额外复核多城轮询、离线不新开队、资源恢复续排、查看纯度、旧档和存储失败，未发现待修问题。正常72h粮城路线随后尝试练兵时，三个旧档均被“空闲人口不足”正确拦住，未扣费；粮田工人占用需要与民房容量配合，不能把该路线报告为练兵通过。

Node no-store服务最新390复测：弓兵队保存前补齐/自动均禁用，保存后真实付费建立刀盾300与弓200队列，开启自动后仍恰两队，暂停仍保留这两队。截图task2-training-latest-390.jpg。

人口路线进一步诊断：仅将民房升至8级时，税20%下稳定人口2880，低于粮田工人3090，仍无法补兵。升至10级后能真实付费排盾兵和部分弓兵，余数等待人口恢复；不把部分补齐记为完整通过。诊断中所有扩建仍按实际建筑条件与材料付款，未改产品税率/人口/薪俸。

真实人口恢复续排初验通过：三种子以真实民房/官府10级目标扩建24小时，再保存并开启弓兵目标，分别在总104.98/104.93/105.38游戏小时完成盾300+弓1000。期间没有武将离队，存档合法；只证明这三份已累积资源旧档的该经营路线，不能推广为所有开局或最优模板。最终集成仍需按最终代码复跑。

Task3手机初验390：内政筛选只显示现任城守苏砚，调城按实际任职禁用；名将册十人，未发现者没有定位，已知鲍三娘可收藏、查看后真实地图居中12,42，仍未侦察且无画像不可俘获。DOM宽390=scroll390。发现收藏跳练级、已知收藏未带姓名、旧目标详情“上造”与真实等级爵位冲突，已交当前实施者补RED后修整；初验截图不是最终验收。

Task3手机修整复验：收藏/移除均保留名将册，刷新仍持久化；收藏列表带已知鲍三娘姓名，目标详情与名将册同显大夫门槛，保留俘获后降1–3级按实际级重新报价。侦察快捷仍展示真实1斥候/22粮/损失预计，没有免费情报；此侦察已取消。另真实林朔10义兵付114粮派出，路径有起终点及队伍；途中召回位置为真实掉头点，约11秒返城，22义兵全部归队。发现路径百分比6秒后仍0及坐标过长，已请实施者检查/压缩显示，未据此宣称路径最终通过。

Task3稳定实现932全量/39定向通过，待独立审查。440名将册、1280收藏均DOM宽=视口，无横向溢出；截图task3-codex-fixed-440.jpg、task3-favorites-1280.jpg。小项：名将册动作换行略占空间，Task5集中修整。实体Safari尚未验。

Task3独立classic_review3 Approved，Critical/Important均0；六加载清单与runtime核对通过。唯一Minor每行重算全部名册，Task5改为渲染内一次Map。跨批与所有页面三尺寸留最终验收，真机和联网仍未验。

Task3路径刷新实际复验：调整视口后当前目标按既有逻辑回默认河畔荒田（29,35），本次测试派林朔10义兵去程13秒，路径文字实际显示66%/余5秒；途中确认召回后显示(29.9,34.1)→(32.0,32.0)、5秒返程。坐标压为1位小数，军情消失后目标按钮恢复可派，未打到目标/未领奖。短程截图拍摄时可能已到站，百分比证据以实际DOM观察为准，不能拿无路径截图冒充进度证明。

## Task4初验

HEAD eaa3ada，75定向/950全量通过，runtime511778c69fe4；独立审查进行中。root正常获得旧档1/7/19，每份跑黄巾/南蛮、仅主线/全支线、三难度逐档解锁，共36通关均成功，每副本连续三档当日仅一箱；无资源赠送。南蛮输入先真实通关黄巾获得解锁。首诊断忘此前置产生六条正确拒绝，修改诊断流程后全过，未改产品数值。初验报告 /tmp/classic-mobile-campaigns-task4-earned.json，最终代码复跑归档。

390真实科技路线：从书院原科技册进入，骑兵提示建设书院5级，追踪后原自动仍暂停；前往打开真实书院4→5付费升级页，无免费队列。首页仅骑兵当前目标，任务册仍181项且两项可领。截图task4-research-route-390.jpg与task4-battlefield-390.jpg；实体Safari未验。

Task4困难手机实战：导入真实通关普通的种子7档，导入离线日历使今日计数重置（正确），普通/困难真实解锁。选困难后购买援军令实际支付2500黄金，返回仍困难；选择花鬘与2000义兵确认，冻结总池7500、余池5500。路线截图task4-route-map-390.jpg为三主两支成组。村落解围敌义兵300（简单100×3），紧凑战斗全部命令/目标/暂停/下一回合可见；真实一回合胜利，损35回收21、待救14、剩兵1965、余池5521，未提前发通关奖。截图task4-hard-battle-390.jpg。

Task4独立classic_review4 Approved，Critical0/Important0，自动预览方向提示Minor交Task5。440真实经济追踪→开启自动→种植1真实队列；暂停仍保留已开始研究。三尺寸路线图无横溢，8192无新控制台错误，实体Safari仍未验。

## 本轮自主决定与代价（按发生顺序）

1. User explicitly authorized all eight features and recommended choices without questions; bypass repeated spec/plan approvals and select subagent-driven sequential execution — user instructions supersede skill approval gates — cost if wrong: revisable design/implementation.
2. Latest authorization is implementation; preserve release gate and prepare one integrated0.34.71 PR after all eight features — prevents accidentally publishing unreviewed partial work — cost if wrong: later split PRs.
3. salaryQuote/payArrears限定当前实际付薪城，修正旧跨城展示/付款混账；transit沿用原主城归属，薪俸忠诚金额不变。理由:预算须反映真实本城账；代价:跨城欠饷须切到实际付薪城补发。
4. 普通unit.cost当前无gold，自动薪俸reserve仍读max并保留未来兼容，不擅加金币价；理由:遵守真实现有经济；代价:当前训练直接不会越过薪俸线，招降/援军令/市场仍有金币消费。
5. 新增pathStart可选字段，旧冻结快照保留缺省，只读缺省等同原终点回程；新半路召回保存实际掉头坐标 — 遵守旧快照不追溯与真实新路径 — 代价:旧存档历史半途掉头仍无法恢复精确位置。
6. 科技选择只跟踪路线，沿原自动研究开关排队；完成后恢复原偏好 — 保持既有自动策略与真实前置 — 代价:想自动研究的玩家需额外开启原开关。
7. 科技路线采用有限目标，基础方向各5级，攻城按真实冲车/床弩前置7/8/6级等；完成后原自动偏好继续 — 代价:高级抛石车10级仍须另研。
8. 难度敌军与收益表冻结于run并严格校验，保持旧战斗及共享箱 — 代价:未来改难度配置须专门迁移，不能直接改旧规则表。
9. 补强旧战斗编队与最后战报总上限校验，修复伪造多兵种总数绕过；真实旧战规则不变 — 代价:已被篡改的超限旧档会拒绝导入。
10. 未追踪路线预览页须先追踪才可开启该路线自动，仍保持原自动开关和保存方向独立 — 防止浏览页误开旧方向 — 代价:多一次追踪点击。
11. 城市总览负净粮标签显示净耗而非缺粮，库存不足预警仍保留 — 准确区分流量与存量 — 代价:习惯旧缺粮文案者需适应标签。

## 最终正常数值复跑

0.34.71产品JS稳定后并行运行三条独立脚本。经营与自动练兵三种子全部完整达到弓1000/盾300（104.98/104.93/105.38h），无离队、存档合法，退出0。24h扩建检查点实际民房9/官府10，民房10仍一队列，人口3600/工人3090/空闲510；这里是目标10而非已经完成10级。首批训练实际粮91500/木81750/铁151500，剩余弓兵等人口恢复后继续真实付费。此准确检查点取代前面“24h已完成10级”的笼统描述。

多城仍种子7完成真实占领、付费建城、200粮运输另付14粮、暂停送达/返回；1/19最近平地实际未胜。整体退出1，三个存档合法。两副本三档主/全路线36通关全过，每副本当日仅一箱，退出0；南蛮先真实黄巾通关解锁。最终JSON与解释归档design/balance/classic-mobile-*，没有赠资源/等级/军队或隐藏弱敌筛选。运行基点eaa3ada、版本0.34.71、全JS sourceHash2f1a6fdb8a8c29f566bd85788bc14a512aaf0e15d62e39c1ef1274845149bc7b；Task5版本/界面改动当时尚未提交，最终必须核对同hash。

## 最终界面与产品门禁

产品HEAD778b952，最终npm test953/953、56.48s，独立Task5审查Approved且无Critical/Important/Minor。五项小修全部核对：预算每组不拆，净耗准确，名册条件折叠保留且按钮44px同排，当次名册Map不长期缓存，非追踪科技页开启自动禁用并有真实动作二次校验。

最终final-*截图覆盖城市/城池模板/练兵/内政筛选/名将册/附近/补给/治下总览/科技预览/战场入口/三幕路线图，每项390×844、440×956、1280×900，DOM总宽均等于视口，无横向溢出。原快速viewport循环得到上一帧缩放截图，已用稳定帧重新覆盖；实际滚动弹窗关闭先滚回顶部，避免自动化点到屏外关闭按钮。重新抽查手机图片字形清晰、44px动作同排，截图不等同真机Safari性能结论。

最终8192运行没有新增console error/warn；日志仅三条已记录的旧8191初次加载错误。所有表单和导航用真实UI，evaluate只读，无浏览器脚本修改Game或存档。真实iPhone Safari、网络权威模式、线上0.34.71未验。

三个数值报告执行时Git基点eaa3ada但实际代码是待提交的稳定0.34.71；全JS哈希已精确核对与778b952一致，各code.verifiedProductRevision记录该提交，同时保留实际执行基点，未伪称在旧eaa3ada原代码上运行。

## 最终整支审查与修复门禁

1934f0c上的最终gpt-6-astra整支审查：Critical0、Important1、Minor0。完整51块runtime与实际源逐块一致，版本/脚本清单/数值聚合已独立核对。唯一I1：applyCityPreset/pauseCityPreset在localStorage写入失败时只返回错误，不回滚资源、工程、模板和竞争自动设置；真实复现粮木石铁各5000变3900/3500/3875/3900且新增两队列，暂停内存与持久档分叉。已交最终统一fix wave，未带缺陷推送。root pre-fix全量953/953、53.41s表明原测试缺少该边界，不能替代新增失败回归。

最终审查排除项逐项裁定：实体Safari/联网权威/线上候选无环境或尚未发布，沿原规格标未验；全部开局经济仅已有三旧档路线不能外推；旧掉头坐标缺信息不可恢复，新pathStart已解决新召回；未来难度规则变更须另迁移，本轮未改配置；旧全仓训练/研究保存机制不扩为本批重构，当前仅新增模板两个入口做完整回滚。若需要扩大范围，代价依次是补真机/联网/线上验收、补其他开局平衡、旧信息无法找回、未来追加配置迁移、旧动作存储故障机制暂保留。

12. 最终审查七项排除沿批准范围处理，集中修新增模板事务；代价为真机/联机/线上仍须补验、其他开局另平衡，旧历史掉头不能还原、未来难度另迁移、旧动作存储机制暂保留。


## 最终存储修复验收（c4b37af）

# 最终唯一 fix wave：I1 城池模板保存失败

状态：DONE。没有 push、没有 merge；版本仍为 0.34.71 候选。

- 工作树：`/Users/lihuazeng/.codex/worktrees/nanman-campaign/superpower`
- 分支：`feat/classic-mobile-templates`
- 固定基线：`1934f0c88f608cce911c1a1b076ab7c0c0c5a6a8`
- 修复提交 / 最终 HEAD：`c4b37af85dc8a6140c4bee38556b11da347ac455`
- 提交标题：`fix: 城池模板存档失败时回滚并一次提交队列`

## 确认的问题与最小设计

原实现的 applyCityPreset 在修改模板、关闭竞争自动设置之后，调用 processCityPreset。enqueueBuilding 与 enqueuePlot 每入队一个工程都会保存一次，最后 apply 又保存一次。pauseCityPreset 也在失败时只报告错误而保留已暂停的内存。外层动作包装器只把保存错误返回给调用方，不能恢复状态。

修复沿已有 SupplyLines / setResearchRoute 的完整快照回滚模式：

1. apply 保留原来的自然时间结算与报价校验，在修改目标前 clone 完整 state。
2. 给内部 enqueueBuilding / enqueuePlot / processCityPreset 加默认值为 true 的 saveNow 参数。只有本次 apply 用 false，先计算所有能入队的工程和实际扣费，再调用一次既有 save。
3. 保存失败时恢复 state 快照并 CitySystem.capture，使资源、布局、等级、队列、目标、自动升级 / 城外样板设置和 realm 当前城市投影恢复一致。
4. pause 同样先保存完整 state 快照，失败时恢复并 capture。

没有引入全仓事务、临时存档字段、公共新 API 或新 schema。手动建设与后续自动调度继续采用默认保存行为；成功成本、前置门槛、旧队列、离线结算及双城规则没有改变。

代价是每次用户应用 / 暂停模板增加一次全存档内存快照；频繁 tick 不新增快照。只暂缓本次应用的队列中间保存，避免“第一队已经持久、第二队失败”的半份模板。仍使用既有 save 的写入租约、冲突检查、备份与主档流程，未重构公共 save。

## 存储保护

回归直接运行 tests/helpers/game.cjs 加载的真实全局引擎和数据模块，没有 mockGame、假报价或假 enqueue。只在 localStorage.setItem 边界注入抛错，未命中的写入继续写入既有 Map 存储，随后从真实存储读取 JSON、检查主档 / 备份并通过 Game.init 重新载入。

覆盖所有写入抛错、writer 租约抛错、backup 抛错、primary 抛错，以及第二次租约 / 备份 / 主档才失败。最终提交前失败时主档原字节保持不变。主档写失败但备份已成功时，备份可以从更旧的完整档更新为本次动作前的完整主档；不包含新部分模板。租约刷新保持原来的写入权机制，未尝试在存储故障期间追加危险的回写。写入故障模式仍由既有 save 保持，恢复存储后重新读取再重试。

## RED → GREEN 证据

### 第一阶段：先写回滚与整批保存测试，再改产品代码

命令：`node --test tests/city-presets.test.cjs`。

实际基线结果：33 tests，12 pass，21 fail。失败覆盖四类存储写入阶段 × 三种队列（城内 / 混合 / 城外）、暂停、单次完整主档要求和双城。

代表错误：`resource charges, sites, queues, targets and competing automation all roll back`。
实际内存仍有 house / market 两队，autoUpgrade 从 true 变 false，模板 active=true；粮城资源从各 5000 变为 food=3900、wood=3500、stone=3875、iron=3900。暂停失败后内存与 realm 投影仍为 active=false。

初次 GREEN 检查为 29/33：四个失败位于存储恢复后的农田成功成本字面量，回滚断言已全部通过。对照 manual-data.js 的农田一级独立成本 food=50、wood=300、stone=200、iron=150，将两农田手算期待改为 4900 / 4400 / 4600 / 4700；随后 33/33。

### 第二阶段：真实基线重跑“第一次已写、第二次才失败”和恢复暂停目标

添加三个第二写入阶段用例和一个失败恢复用例，未增加产品改动。使用 git show 的固定基线 engine 通过临时 fs 读取入口注入到独立 Node 测试进程；工作树产品文件始终保持修复版。其余模块、计时、报价、保存与存储读取均真实。

命令：

```sh
git show 1934f0c88f608cce911c1a1b076ab7c0c0c5a6a8:engine.js > /tmp/classic-final-fix-baseline-engine.js
node -r /tmp/classic-final-fix-baseline-loader.cjs --test --test-reporter=tap tests/city-presets.test.cjs
node -r /tmp/classic-final-fix-baseline-loader.cjs --test --test-reporter=tap --test-name-pattern='failed resume|initial preset batch' tests/city-presets.test.cjs
```

加载器仅把当前目录 engine.js 的 fs.readFileSync 结果替换为固定基线源；没有替换 Game 方法。

- 全部基线 RED：36 tests，12 pass，24 fail。
- 新四例单独基线 RED：4 tests，0 pass，4 fail，exit 1。
- 第二写入失败的三个错误均为 `one completed preset write must replace all intermediate commits`。
- 恢复暂停目标失败：已暂停的自定义目标 active=false 变为 true，主档仍是暂停。

额外独立探针分别在第二次 writer / backup / primary 写入时抛错。原版本三种情况均返回“保存失败”，内存队列为 `[house,farm]`，真实主档却仅有 `[house]`，持久资源为 `{food:4900,wood:4500,stone:4875,iron:4900,gold:5000}`。修复版三种情况均成功返回 null，内存与主档同为 `[house,farm]`，持久资源为 `{food:4850,wood:4200,stone:4675,iron:4750,gold:5000}`。原因是已没有第二次中间保存。

第二写入测试清除故障注入后再检查 reload / pause；故障不是自动消失的，测试没有绕过实际保存行为。

## 最终 GREEN

- `node --test --test-reporter=tap tests/city-presets.test.cjs tests/plot-template.test.cjs tests/automation.test.cjs tests/save-session.test.cjs`：60/60，fail 0，skip 0，1635.725 ms。其中模板 37/37，新增 25 项。
- `npm test`：978/978，fail 0，skip 0，52843.936 ms，exit 0。原有 953 加 25 回归。
- `node scripts/build-online-runtime.cjs`：51 个源文件重建成功。
- `node --check engine.js`、`node --check tests/city-presets.test.cjs`、`node --check supabase/functions/_shared/game-runtime.mjs`：均 exit 0。
- `git diff --check` 与提交前 `git diff --cached --check`：exit 0。

存储恢复检查包括：原状态 reload、成功重试只扣一次、原有队列不重排、已暂停目标恢复不再二次收费、成功暂停与重新应用、第二城失败不改变第一城、来回切城后目标 / 队列 / 活跃投影一致。既有正常递增时钟调度和离线不启动队列测试仍通过。

临时详细证据路径：`/tmp/classic-final-fix-red.log`、`/tmp/classic-final-fix-red2.log`、`/tmp/classic-final-fix-red3.log`、`/tmp/classic-final-fix-focused.log`、`/tmp/classic-final-fix-full.log`、`/tmp/classic-final-fix-storage-red-probe.log`、`/tmp/classic-final-fix-storage-green-probe.log`。报告内已保存关键结果，临时文件未提交。

## 文件 / Hash / 边界自审

提交仅含：`engine.js`、`tests/city-presets.test.cjs`、`supabase/functions/_shared/game-runtime.mjs`，没有 stage 根代理 QA / docs / design / production / balance 文件。

SHA256：

- engine.js：`4546a0d56b8c064268c141069c813a3e44a8436fcfd3b8272d9921d201659216`
- runtime 文件：`20f22f89a0267ad3fc7ba839ad6268d5c5ba48388859346b3d3a3c563f673a33`
- tests/city-presets.test.cjs：`1ae6a11f6aca1748c4bbf94cc4d996f537af3cb19fd6276d902122a2d3945423`
- runtime 内嵌 runtimeHash：`d079cab50bff509b72320a1b5b1d85fdb27a34540e7aa11e7a5360e95552235e`

自审确认 default=true 使所有旧调用保留原行为，新增 false 只出现于 applyCityPreset，回滚后 capture 恢复活跃投影引用；共享世界拒绝模板动作的逻辑未变。没有变更视觉或版本号，没有自行扩大到其他历史动作的保存失败语义。

根代理已收到产品稳定 hash / HEAD，可以在此提交上完成三个正常数值复跑与 fresh reload 手机模板成功应用 / 暂停核对。该数值 / 浏览器补充验收由根执行，本报告不把未运行的项目写成通过。没有已知未解决实现问题。


根代理在提交c4b37af重新执行三条正常数值脚本，报告code.revision均为该提交，全JS sourceHash为1ba8470a16d04b6040b6693e37b3ea7b2ead0cc1cbf464ac1ecc0ebb08052736。经营三种子完整补兵通过；副本36路线通过、每日共享箱不重复；多城种子1/19仍真实占领失败，种子7真实建城运粮成功，退出1如实保留。

根代理fresh reload手机390：正常旧档实际运行均衡模板，营造出现两项工程，仓库施工且四类资源按真实费用减少；暂停显示已暂停，已开工继续。截图final-fix-template-390.jpg。8192无新控制台警告/错误；旧8191缓存启动三条错误仍作为历史记录。


## 最终范围复审通过

**I1（Important）：模板保存失败未回滚、逐项保存可能留下半份模板 — ADDRESSED。**

- `engine.js:609` 在自然时间结算与报价校验之后、修改模板之前克隆完整状态；`engine.js:612` 用 `processCityPreset(false)` 暂缓内部逐项保存，整批只调用一次 `save()`。失败恢复快照并调用 `CitySystem.capture`，资源、布局、等级、队列、目标、原自动升级与城外样板设置、当前城池投影一起恢复。
- `engine.js:614` 对暂停采用同样的快照与回滚，失败不会留下已暂停的内存目标。
- `engine.js:578`、`engine.js:585`、`engine.js:615` 的 `saveNow` 默认均为 `true`；`engine.js:619` 只传递该参数。旧手动建设与自动调度调用保留原行为，只有首次应用模板使用 `false`，未改成本、门槛或队列顺序。
- `tests/city-presets.test.cjs:45` 覆盖全部写入、租约、备份、主档四类真实存储边界故障，分别验证城内、混合、城外模板完整回滚、主档字节不变、备份仍为完整旧档、投影引用恢复、重载与成功重试。`tests/city-presets.test.cjs:59` 覆盖失败暂停与成功暂停/恢复；`:69` 断言两个工程只提交一次完整主档；`:79` 覆盖第二城失败、首城保留、重载与切城；`:93` 覆盖原来第二次租约/备份/主档写入才失败的场景；`:106` 覆盖已暂停自定义目标恢复失败不重复扣费或重排旧队列。

**核对：** 已核对固定修复包 `1934f0c88f608cce911c1a1b076ab7c0c0c5a6a8..c4b37af85dc8a6140c4bee38556b11da347ac455`、实现报告与源码。三个产品/测试文件 SHA256 均与报告一致。

**核对：** `/tmp/classic-final-fix-focused.log` 为 60/60、失败 0、跳过 0，其中模板用例 1–37 全部通过，新增 25 项；`/tmp/classic-final-fix-full.log` 为 978/978、失败 0、跳过 0、耗时 52843.93575 ms。未重跑全套或定向测试，现有运行与代码已回答本次范围内疑问。

**核对：** 第二写入红/绿独立探针日志一致：原版本返回保存失败但主档只含 `[house]`；修复版三阶段均只写一次，内存与主档同为 `[house,farm]`，持久资源一致。RED 日志确认旧实现 36 项中 24 失败，新增四例独立基线 4/4 失败。

**核对：** 只读重新计算生成运行时的 51 个源文件摘要并比对完整嵌入源码，`sourceMatch=true`，`runtimeHash=d079cab50bff509b72320a1b5b1d85fdb27a34540e7aa11e7a5360e95552235e`；生成运行时与本次修复源码一致。

**本次修复新增问题：** Critical 无；Important 无；Minor 无。

**范围外观察：** 无。本次未重新审查整体界面、联机或其他历史动作的保存失败语义。

**Fix round verdict：All findings addressed, no new Critical/Important breakage。** I1 已关闭，无开放 finding。


手机暂停后重新载入仍显示已暂停，已有工程继续，截图final-fix-paused-reload-390.jpg。最终产品c4b37af，978/978，runtime d079cab50bff509b72320a1b5b1d85fdb27a34540e7aa11e7a5360e95552235e；以上原953、778b952、511778段落为修复前历史证据。最终唯一Important已关闭，无开放Critical/Important/Minor，候选版尚未发布。

根代理推前最终全量再次运行：npm test，978/978，fail/cancelled/skipped/todo均0，58.941秒，日志/tmp/classic-mobile-final-integration-test.log。产品未再修改，文档与数值证据刷新。


候选整合PR已建立并附加：https://github.com/YuJieMichael/three-kingdoms/pull/74 ，base main，branch feat/classic-mobile-templates。推前根代理978/978、最终复审通过，CI以当前PR提交检查为准。本批12项自主决定均已公开QA，临时计划目录已清理，保留managed worktree供后续审查。负责人本轮尚未说发布/合并，不合main。
