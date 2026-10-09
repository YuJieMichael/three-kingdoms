# 手绘素材处理

把 ChatGPT 出的 1024×1024 透明 PNG 一条命令处理成游戏用的 AVIF 和 PNG 备用图。规格见 [美术规范](../../design/art/art-bible.md) 第 5 节。

**需要 macOS**（Swift 和系统自带的 ImageIO，用来写 AVIF）。PNG 压缩用 pngquant：`brew install pngquant`（没装也能跑，只是 PNG 不压缩）。

```bash
tools/painted-art/process.sh building ~/Downloads/新建筑      # → assets/painted/buildings，裁边，长边 512
tools/painted-art/process.sh map ~/Downloads/新地图物件/pine.png # → assets/painted/map，裁边，长边 384
tools/painted-art/process.sh texture ~/Downloads/grass.png      # → assets/painted/map，不裁边，512
```

- 输入可以是文件夹（处理里面所有 PNG）或单个文件；文件名就是素材 id（自动转小写），例如 `hall.png` → `hall.avif` + `hall.png`。
- `map` 会打印 `PaintedArt.map` 需要的高宽比，新物件要把它写进 `painted-art.js`。
- 处理完把 `painted-art.js` 里的 `PaintedArt.version` 加 1。
- 试跑不想覆盖仓库里的图时，设 `PAINTED_ART_OUT=/某个临时目录`。
- 同一张输入重复处理，输出尺寸相同（裁边阈值 alpha > 10，四周留 6px）。
