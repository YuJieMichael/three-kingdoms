# 建筑美术提示词 · 风格 1：精致国风手绘

目标：接近《率土之滨》《三国志·战略版》主城的精致手绘建筑。整套建筑用同一段「通用风格」，只替换「建筑主体」，保证视角、光照、比例一致。

## 用法

1. 每张图的提示词 = 「建筑主体」 + 「通用风格」（直接拼在一起复制给 ChatGPT）。
2. 需要等级外观时，在末尾加「等级后缀」中的一条。
3. 先生成 官府，满意后在同一个 ChatGPT 对话里继续生成其他建筑，并说一句「保持和上一张完全相同的画风、视角和光照」。
4. 背景不透明时补一句：请输出透明背景 PNG。

## 通用风格（每条都附上）

```
Isometric 2.5D strategy game building asset in a refined hand-painted Chinese style, like the main-city art of premium Chinese strategy games. Late Eastern Han dynasty (Three Kingdoms era) architecture: grey curved clay-tile roofs with gently upturned eaves, dougong wooden brackets, vermilion lacquered pillars, rammed-earth and grey-brick walls, stone platforms. Highly detailed painterly rendering with crisp edges, rich but harmonious colors (vermilion, ink grey, warm wood, jade green accents), warm afternoon sunlight from the upper left, soft ambient occlusion and contact shadow under the building. Strict 2:1 isometric camera (about 30 degrees from above, 45 degrees rotated), the building's base sits on an invisible diamond footprint, whole building centered and fully inside the frame with a little margin, transparent background, no ground tile, no surrounding scenery, no text, no UI, no people. Square 1024x1024 PNG.
```

## 建筑主体

| 建筑 | 占地 | 建筑主体（英文提示词） |
|---|---|---|
| 官府 | 2×2 | `Government office (官府) compound: a grand main hall on a raised stone platform with steps, double-eaved hip-and-gable roof, red pillars and carved lattice doors, a front gate pavilion, low surrounding wall enclosing a stone-paved courtyard, a tall red banner pole and two old pine trees.` |
| 民房 | 1×1 | `Common residence (民房): a modest courtyard house with grey-tile roof, rammed-earth walls, wooden door and window lattice, a small yard with a well and drying racks, a thin wisp of kitchen smoke from the chimney.` |
| 书院 | 1×1 | `Academy (书院): an elegant scholars' hall with dark-tile roof, open veranda, bookshelves of bamboo scrolls visible inside, a small bamboo grove and a stone lantern in the yard.` |
| 客栈 | 1×1 | `Inn (客栈): a two-storey timber inn with a hanging cloth shop flag and red paper lanterns, wide front doors, wine jars stacked by the entrance, stable post for horses.` |
| 市场 | 1×1 | `Market (市场): a cluster of covered market stalls with cloth awnings, crates of grain, silk bolts and pottery, a central wooden gate arch with a plaque.` |
| 仓库 | 1×1 | `Granary and warehouse (仓库): a large raised timber granary on stilts with a steep tiled roof, sealed grain sacks and round grain bins beside it, a ramp to the door.` |
| 校场 | 1×1 | `Drill ground (校场): a packed-earth training field with a raised wooden reviewing platform, weapon racks with spears and halberds, archery targets, war banners on poles.` |
| 军营 | 1×1 | `Barracks (军营): a fortified military camp of long tiled barracks halls inside a timber palisade, a gate tower, stacked shields and spears, a large army banner.` |
| 招贤馆 | 1×1 | `Recruitment hall (招贤馆): a dignified hall with a wide entrance, a wooden notice board covered with recruitment posters out front, red lanterns and a carved plaque.` |
| 鸿胪寺 | 1×1 | `Office of diplomacy (鸿胪寺): a formal reception hall with a ceremonial gate, foreign envoy banners in different colors, bronze ritual vessels on the terrace.` |
| 铁匠铺 | 1×1 | `Blacksmith (铁匠铺): a workshop with an open front, glowing forge and bellows, an anvil, racks of swords and armor, a stone chimney with rising smoke.` |
| 工匠作坊 | 1×1 | `Craftsmen's workshop (工匠作坊): a timber workshop with carpenters' benches, a half-built siege ram and catapult parts, piles of logs and tools under a lean-to roof.` |
| 马厩 | 1×1 | `Stable (马厩): a long open-sided stable with a tiled roof, several horses in stalls, hay bales, saddles hanging on posts, a water trough.` |
| 驿站 | 1×1 | `Post station (驿站): a roadside relay station with a gate, a small office, a hitching rail with a courier horse, a signal flag and mail bundles.` |
| 烽火台 | 1×1 | `Beacon tower (烽火台): a tall tapering rammed-earth and brick watchtower with a brazier platform on top, wooden ladder, a guard banner; unlit.` |
| 城墙·城门 | 城门 | `City gate (城门): a grey-brick city wall segment with crenellations and a central arched gateway, heavy wooden doors with iron studs, a two-storey gate tower with tiled roof above.` |
| 农田 | 田地 | `Farmland plot (农田): neat terraced rice and millet field with irrigation ditch, a small thatched shed and a scarecrow, on a diamond-shaped plot.` |
| 伐木场 | 田地 | `Lumber camp (伐木场): a woodcutters' yard with stacked logs, a sawhorse, axes in a stump and a small thatched hut, a few pine trees at the edge, on a diamond-shaped plot.` |
| 采石场 | 田地 | `Stone quarry (采石场): an open quarry pit with cut stone blocks, wooden crane and ramps, chisels and baskets, on a diamond-shaped plot.` |
| 铁矿 | 田地 | `Iron mine (铁矿): a mine entrance braced with timber in a rocky hillside, ore carts on rails, piles of dark iron ore, a small smelting furnace, on a diamond-shaped plot.` |

## 等级后缀（需要按等级换外观时加在末尾）

- 初级：`Early stage: smaller and simpler, mostly timber and thatch, few decorations.`
- 中级：`Developed stage: tiled roofs, painted pillars, more detail and a second building element.`
- 高级：`Prosperous stage: grand and richly decorated, double eaves, gilded ornaments, stone foundations, flags and lanterns.`

## 施工中（可选）

```
The same building under construction: bamboo scaffolding, exposed timber frame, stacks of bricks and logs, no workers.
```

## 交付规格（接入游戏用）

- 透明背景 PNG，1024×1024，建筑底部中心对齐画面下方三分之一处。
- 官府占 2×2 格，画面里要明显大于其他建筑；其余建筑 1×1。
- 同一批图尽量在同一个对话里生成，风格才会统一。

---

# 大地图地形素材 · 同一风格

大地图由代码铺出连贯的底色（草地、土地、湖水、森林区域），下面这些素材叠在上面，替换现在的水墨山和松树线稿。每张都用透明背景，叠放时才能和底色自然融合。

## 地形通用风格（每条都附上）

```
Top-down 2.5D strategy game world-map decoration in the same refined hand-painted Chinese style as premium Chinese strategy games' world maps. Painterly, crisp, rich natural colors (jade and moss greens, warm ochre earth, blue-green water, misty grey-blue rock), warm sunlight from the upper left with soft shadows on the lower right. Viewed from above at about 45 degrees, matching an isometric city view. Isolated object with soft feathered edges that blend into any ground, transparent background, no ground tile, no border, no text. PNG 1024x1024.
```

## 地形主体

| 素材 | 用途 | 主体（英文提示词） |
|---|---|---|
| 山峰 A | 山地 | `A single tall craggy mountain peak with layered cliffs, a few pines clinging to the slopes and a wisp of mist at its foot.` |
| 山峰 B | 山地 | `A pair of lower rounded rocky peaks with a small ridge between them, scattered pines.` |
| 丘陵 | 荒漠 | `A gentle ochre hill with dry grass, scattered stones and one wind-bent tree.` |
| 松林团 A | 森林 | `A dense cluster of 6 to 9 pine and cypress trees of varied heights, seen from above at an angle.` |
| 松林团 B | 森林 | `A loose clump of 3 to 4 broadleaf and pine trees with a few bushes.` |
| 单棵树 | 森林边缘 | `One small pine tree with a soft shadow.` |
| 芦苇丛 | 沼泽 | `A patch of reeds and cattails with small puddles and lily pads.` |
| 湖面纹理 | 湖泊 | `Seamless tileable texture of calm blue-green lake water with gentle ripples and subtle light reflections, top-down.` （这一张要无缝平铺，不要透明背景） |
| 平原纹理 | 平地 | `Seamless tileable texture of fertile grassland with tiny flowers and soft color variation, top-down.` （无缝平铺，不要透明背景） |
| 城池标记·县城 | 城池 | `A small walled Han dynasty county town seen from above at 45 degrees: square grey-brick wall, a gate tower, a few tiled roofs inside, a red banner.` |
| 城池标记·郡城 | 城池 | `A larger walled commandery city with corner towers, a main gate tower, many tiled roofs and a central hall, several red banners.` |
| 黄巾营寨 | 黄巾 | `A rebel camp of the Yellow Turbans: timber palisade, tents and huts, yellow banners and a watchtower.` |

## 交付说明

- 山峰、树丛、城池等物件：透明背景，物件底部居中，四周留一点边。
- 湖面、平原两张纹理：要「无缝平铺」，直接说 seamless tileable，不要透明背景。
- 和建筑在同一个 ChatGPT 对话里生成，配色会更一致。
