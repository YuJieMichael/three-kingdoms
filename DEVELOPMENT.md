# 修改与保存更新

## 在另一台电脑继续开发

安装 Git 和 Node.js 后，在终端执行：

```powershell
git clone https://github.com/YuJieMichael/three-kingdoms.git
cd three-kingdoms
npm start
```

打开 `http://127.0.0.1:8137/`。项目没有第三方 npm 依赖，也没有编译步骤，可以直接修改源码并刷新网页。

公开仓库可直接克隆，提交更新仍需要登录有写入权限的 GitHub 账号。游戏进度保存在浏览器中；更换电脑时，在游戏「设置与帮助」中导出、导入存档。

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
| 每日任务、声望、史诗与奖励领取 | `progression.js`、`progression-ui.js` |
| 俘虏营、招降、释放及战报展示 | `captive-ui.js`、`engine.js` |
| 加速道具时长、价格、城墙前置与使用窗口 | `speedup-data.js`、`speedup-ui.js` |
| 城外资源田 | `outskirts.js` |
| 世界地图 | `grid-world.js` |
| 战斗画面、指令与倒计时 | `combat-ui.js` |
| 掠夺／占领、出征预览与战利品展示 | `campaign-ui.js` |
| 建造、科技、招贤、商城窗口 | `manual-ui.js` |
| 主框架、资源横栏与写实战争主题 | `classic-ui.js`、`classic.css`、`war-theme.css` |
| 其他界面、存档导入导出与页面刷新 | `app.js` |
| 美术素材、城池环境、生成提示与图集位置 | `assets/realistic/`、`assets/warfare/`、`art-assets.js`、`art.css` |
| 页面入口与加载顺序 | `index.html` |

当前产出系数与掠夺系数集中在 `engine.js` 的 `ECONOMY_OUTPUT_FACTOR`、`RAID_LOOT_FACTOR`。资源收入按真实时间计算，试玩倍率用于人口、队列与行军。

## 验证

运行 `npm test` 检查自动研究的选择、暂停、接续、离线与存档兼容，以及资源结算、来袭计时、守城损失、演练、官职珠宝校验与扣除及旧存档兼容。长局测试使用可控时钟模拟持续运行，不需要实际等待数天。浏览器中从「来袭与守城」开始演练，并完成一次出征查看新战报和仓储入口；按桌面和手机宽度检查页面。

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
