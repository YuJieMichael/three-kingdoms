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
| 游戏规则、生产、掠夺、负重、战斗结算 | `engine.js` |
| 建筑、兵种、商城与掉落基础数据 | `manual-data.js` |
| 加速道具时长、价格、城墙前置与使用窗口 | `speedup-data.js`、`speedup-ui.js` |
| 城外资源田 | `outskirts.js` |
| 世界地图 | `grid-world.js` |
| 战斗画面、指令与倒计时 | `combat-ui.js` |
| 掠夺／占领、出征预览与战利品展示 | `campaign-ui.js` |
| 建造、科技、招贤、商城窗口 | `manual-ui.js` |
| 主框架与左侧城池信息 | `classic-ui.js`、`classic.css` |
| 其他界面、存档导入导出与页面刷新 | `app.js` |
| 美术素材与图集位置 | `assets/realistic/`、`art-assets.js`、`art.css` |
| 页面入口与加载顺序 | `index.html` |

当前产出系数与掠夺系数集中在 `engine.js` 的 `ECONOMY_OUTPUT_FACTOR`、`RAID_LOOT_FACTOR`。资源收入按真实时间计算，试玩倍率用于人口、队列与行军。

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
