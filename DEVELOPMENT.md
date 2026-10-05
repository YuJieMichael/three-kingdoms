# 修改与保存更新

## 在另一台电脑继续开发

安装 Git 和 Node.js 后，在终端执行：

```powershell
git clone https://github.com/YuJieMichael/three-kingdoms.git
cd three-kingdoms
npm start
```

打开 `http://127.0.0.1:8137/`。项目没有第三方 npm 依赖，也没有编译步骤，可以直接修改源码并刷新网页。

公开仓库可直接克隆，提交更新仍需要登录有写入权限的 GitHub 账号。游戏进度保存在浏览器中；手机与电脑可运行同一前端，当前没有云同步或联机共同世界。更换设备时，在游戏「设置与帮助」中导出、导入存档。v0.24 使用 Web Locks 防止同一来源的两个页面同时写入，建议通过 HTTPS 或本地服务器访问。

## 去哪里改

| 目标 | 文件 |
| --- | --- |
| 第二章关卡、门槛、补给与章节界面 | `chapter-data.js`、`chapter-ui.js` |
| 山匪来袭与守城数据、战斗、界面 | `npc-data.js`、`npc-defense.js`、`npc-ui.js` |
| 游戏规则、生产、掠夺、负重、战斗结算 | `engine.js` |
| 建筑、兵种、商城与掉落基础数据 | `manual-data.js` |
| 本地游戏包接入规则与差异 | `reference-rules.js`、`REFERENCE-NOTES.md` |
| 分类格子背包、物品详情与移动端布局 | `inventory-ui.js`、`inventory.css` |
| 官职、爵位、俸禄与野地采集参考数据 | `heritage-data.js` |
| 城内任职、晋升、俸禄、采集及存档校验 | `heritage-system.js` |
| 官爵、任职与采集交互界面 | `heritage-ui.js`、`hero.css` |
| 将领培养、装备数值与存档校验 | `hero-system.js` |
| 将领详情、装备库、打造与强化界面 | `hero-ui.js`、`hero.css` |
| 成长任务、任务奖励、金砖与俘虏数值 | `reward-data.js` |
| 十阶礼包、官府工期曲线、成长／章节配兵引导 | `onboarding-data.js`、`onboarding-system.js`、`growth-guide.js`、`onboarding-ui.js` |
| 三路军令、五项挑战、首奖凭据与兑换界面 | `war-orders.js`、`war-orders-ui.js` |
| 每日任务、声望、史诗与奖励领取 | `progression.js`、`progression-ui.js` |
| 俘虏营、招降、释放及战报展示 | `captive-ui.js`、`engine.js` |
| 加速道具时长、价格、城墙前置与使用窗口 | `speedup-data.js`、`speedup-ui.js` |
| 城外资源田 | `outskirts.js` |
| 世界地图、官道／地形 SVG 与据点标记 | `grid-world.js`、`art-assets.js` |
| 战斗画面、指令与倒计时 | `combat-ui.js` |
| 掠夺／占领、出征预览与战利品展示 | `campaign-ui.js` |
| 建造、科技、招贤、商城窗口 | `manual-ui.js` |
| 主框架、资源横栏与写实战争主题 | `classic-ui.js`、`classic.css`、`war-theme.css` |
| 本地存档锁、备份、接管与恢复 | `engine.js`、`app.js` |
| 其他界面、存档导入导出与页面刷新 | `app.js` |
| 美术素材、城池环境、生成提示与图集位置 | `assets/realistic/`、`assets/warfare/`、`art-assets.js`、`art.css` |
| 页面入口与加载顺序 | `index.html` |

当前产出系数与掠夺系数集中在 `engine.js` 的 `ECONOMY_OUTPUT_FACTOR`、`RAID_LOOT_FACTOR`。资源收入按真实时间计算，试玩倍率用于人口、队列与行军。

## 验证

运行 `npm test` 检查成长节奏、章节门槛、任务奖励、自动研究、资源结算、军队行军／驻军／返回、超仓收益、官职珠宝、战斗批量指令、俘虏报价、五项挑战凭据及旧档兼容。存档测试覆盖写入互斥、接管、失败恢复和排队取消。长局测试使用可控时钟与明确检查点，不需要实际等待数天；人工设置高级城池／兵力的战斗比较不能当成新玩家真实发展耗时。

浏览器验收用同一来源的两个页面：首次页面取得写入锁，第二页只读；第一页领奖后第二页接管，核对礼包、库存、资源与任务状态，旧页继续计时及点击不得覆盖。再检查离页／返回、导入有效与无效存档、恢复备份、导出未保存进度。Web Locks mock 需遵守规范：`ifAvailable:true` 不能与 `signal` 同时使用，取消信号只用于等待接管请求；VM 调用 pageshow/pagehide 不等于真实 BFCache 实测。

按桌面与 360／390px 手机宽度检查成长卡展开持久偏好、资源横滑常驻提示、地图据点／部队标记、39地块等级与施工、加速实际节省和溢出预览；实体手机触控、软键盘、安全区域与后台行为另行验证。

## 把修改保存到 GitHub

每次修改前先同步最新源码：

```powershell
git pull --ff-only
```

修改完成后查看变动，并提交：

```powershell
git status
git diff
git add .
git commit -m "说明这次修改了什么"
git push
```

也可以在 GitHub 网页打开某个文件，用铅笔按钮修改并提交。图片、代码一起保存；替换图集时保持行列顺序，或同步修改 `art-assets.js`。

不要把游戏导出的个人存档、密码、令牌放进仓库。`.gitignore` 已排除常见本地设置、存档及临时文件。

## 静态部署

在线试玩地址：[https://yujiemichael.github.io/three-kingdoms/](https://yujiemichael.github.io/three-kingdoms/)。

游戏可以部署到静态网站。上传所有前端文件和完整 `assets/` 目录，保持相对路径；`server.cjs` 只供本地运行。

GitHub Pages 从 `main` 分支的根目录发布，`.nojekyll` 让文件作为普通静态资源提供。启用 Pages 后，后续 `git push` 会自动发布更新。

网页版与 localhost 的存档分开；需要沿用进度时，在旧地址导出存档，再到新地址导入。

前端发布时同步更新 package.json、界面版本号与 index.html 的 JS/CSS 版本查询参数，避免 Pages／浏览器缓存造成新旧代码混用。查询参数仅用于缓存更新，本地文件名不变。

## v0.24 的实现边界

浏览器启动先调用 `Game.init()` 得到可展示状态，再等待 `Game.openSaveSession()` 取得 `sanguo-city-v2-exclusive` 长期独占锁。拿锁后重新读取主存档并结算离线；接管通过存储请求通知旧页保存／释放，等待者随后重读。`pagehide` 取消排队请求并释放已持有锁，异步回调用 generation 校验阻止离页后激活。交接请求有每次请求 ID 和每个请求者的活跃标记，结束／取消时清除；写入者不响应已失效请求，排队者刷新指针以继续多页交接。从页面缓存返回重新取得锁。没有 Web Locks 的浏览器保持暂停／只读，不用过期租约替代真实互斥。

`saveBlockReason()` 限制时间推进与 Game 变更 API，app 捕获处理器拦截只读页的确认动作；允许的 UI 入口必须确认不会写游戏字段。例：`guideShow` 修改存档中的隐藏标记，不属于纯 UI 白名单；成长详情偏好 `sanguo-ui-guide-expanded-v1` 独立于游戏载荷。保存失败时保留当前内存状态并暂停后续操作，`actResult` 检查写入状态，不把未保存操作报为成功。

主存档键和导出载荷 version 2 保持兼容。写入者元信息、上一份有效快照、被替换原始数据分别存放于独立的 writer、backup 与 recovery 浏览器键。解析／校验／读取失败不得自动覆盖主存档；导入、重开与恢复必须先校验并留存被替换的数据。重新读取可能舍弃未保存内存状态，恢复备份可能回退最近进度。存档锁覆盖同来源页面，不跨浏览器配置或设备同步。

奖励调节集中在 `RewardData.missionTuning`，只针对立城、经营、研究与练兵成长任务；征战／章节／每日奖励保留。十阶礼包黄金合计仍为 1,000,000。`OnboardingData.hallBuildSeconds` 只影响新开工官府，旧队列按原 start/end 完成。成长引导在首战、官府之后继续提供史诗、章节准备和军令目标；参考配兵不是自动操作或必胜断言。

`WarOrders.challenges` 现有五项，其中两项为第十阶后开放的不同敌军分支。新版护械凭据包含 rulesVersion 与 machineGateAttacks，兼容旧已领奖记录但不凭空补计攻城次数。新增全军命令只改存活部队的 command；一键招降通过 `captiveRecruitAllQuote().key` 在确认前重新核对人数、费用与人口。不得绕过原单项条件、负重、整军及保存失败处理。

地图／城外新场景使用代码中的原生 SVG，复用真实地形和坐标且不消费游戏 RNG；无需新增图片或 index 引用。已有艺术图集保留。地图的章节／史诗区使用原生 details，手机成长卡可展开详情，资源提示置于横滑区域之外。修改加载顺序的测试 fixture 应加载实际 art-assets 与 esc 依赖，不在生产添加静默降级来掩盖缺失依赖。
