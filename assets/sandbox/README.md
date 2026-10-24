# 沙盘征战原创素材 · v1

## 水面与草地补充 · 2026-10-24

负责人要求水和草地同步改版。使用内置 `image_gen` 分别生成两张原创、不透明、可重复的地面材质，再缩放并编码为 WebP：

- `grass-source-v2.png` → `grass-v2.webp`：橄榄青绿草甸、柔和疏密变化；运行时768×768，138,050字节。
- `water-source-v2.png` → `water-v2.webp`：翡翠青水色和稀疏细波纹；运行时768×768，43,822字节。
- 两张运行时纹理共181,872字节。生成源图保留；尺寸与体积见 `ground-v2.json`，完整最终提示词见 `ground-v2-prompts.json`。未使用CLI。
- 水草沿真实世界坐标连续铺贴，湖岸、浅滩与深水由现有地块投影生成，不改变地形、行军或守军规则。水面没有逐帧动画，继续使用地图预绘缓存。

2026-10-23 使用 Codex 内置 image_gen 生成，随后仅作等格裁切、透明边界裁切及 WebP 编码。项目内保存源图；未下载或复制其他游戏的地图、立绘和图标。

## 文件与使用

- `world-atlas-v1.png`：1536×1024、3列×2行透明源图。顺序为山脉、树林、关隘／县城、郡城、主城。
- `mountain.webp`、`forest.webp`、`pass.webp`、`county.webp`、`commandery.webp`、`capital.webp`：保留 alpha 的运行时地图素材。裁切后的尺寸记录在 `sprites.json`；绘制时等比显示。
- `heroes-source-v1.png`：1536×1024、3列人物源图。左至右为关羽、黄忠、马超。
- `guanyu.webp`、`huangzhong.webp`、`machao.webp`：每张512×1024人物图。`generalPortrait` 根据可信历史身份或名城武将固定ID选择，普通同名将领仍用原头像。
- 地貌和城市图集接入 `PaintedArt.sandbox`、`ink-map.js`；人物接入将领、配兵和名将册的统一画像入口。画面装饰不改变地块坐标和隐藏信息权限。

透明图源实际为RGBA；角落透明，alpha最小0、最大254。运行时WebP保留透明边缘。素材是汉末题材游戏美术，不是具体古城、服饰或人物容貌的精确复原。

## 最终生成提示词

### 地貌与城关图集

Use case: stylized-concept. Create a production-ready ORIGINAL art sprite atlas for an ancient Three Kingdoms Chinese strategy game's continuous world map. The image must be 1536x1024 landscape, a precise 3 columns by 2 rows layout of SIX isolated sprites, one sprite centered in each 512x512 cell, generous transparent margins, all cells truly transparent outside the objects, NO text or labels, NO panel borders, NO colored backgrounds, NO ground diamond or raised square plinth. Sprites in reading order: (top left) a connected rugged dark jade and pale limestone mountain ridge, (top middle) a natural irregular cluster of dense cypress and pine forest with separate canopies, (top right) a strategic Han-era stone mountain pass fortress with grey-green tiled gatehouse and a gap through the wall; (bottom left) a small walled Chinese county town with grey clay roofs and a modest south gate, (bottom middle) a larger commandery city with thicker limestone walls, several courtyard buildings, towers and copper-red fabric banners WITHOUT insignias or writing, (bottom right) the player's imposing but historically grounded Han-era capital with double courtyard, green-grey tiled government hall and fortified south gate. Cohesive sophisticated hand-painted 2.5D isometric game art, 40-degree overhead camera, orthographic projection, soft upper-left sunlight, grounded warm earth and moss-jade palette, detailed timber masonry and roofing but strong readable silhouettes at small size. Cities should face the same south-east angle, scale city groups to fit with transparent padding. Mountain ridge and forest are natural landscape details without floating islands. Gentle contact shadows within each sprite, retain real transparent alpha. No people, no UI, no logos, no watermark. Original art, not copied from any published game.

工具参数：`transparent_background: true`。

### 三国名将人物图集

Use case: historical-scene. Production-ready ORIGINAL THREE KINGDOMS hero portrait atlas for a sophisticated Chinese strategy game. Landscape image 1536 by 1024, exact THREE equal vertical columns 512 pixels wide, no gutters and no text anywhere. Three separate waist-up portraits, one per column, consistent scale and dark moss-green softly textured painted background behind each, quiet copper-gold light. LEFT: Guan Yu, middle-aged Chinese general with long black beard, calm dignified eyes, green robe over Han-era lamellar armor, simple green cloth headwrap, partial blade shaft at edge, no huge fantasy ornament. CENTER: Huang Zhong, older Chinese archer general with weathered face, silver beard and tied-back grey hair, bronze and dark jade lamellar armor, quiver and curved wooden bow partially visible, resolute steady expression. RIGHT: Ma Chao, young adult Chinese cavalry general with intense composed expression, silver-grey helmet with modest pale plume, historically grounded late Han lamellar armor with ivory cloth, spear shaft partially visible. High craft painterly semi-realistic game illustration, strong believable faces, readable at avatar size, restrained color palette matching jade and limestone isometric war-map art. Evenly lit facial features and distinct silhouettes. Portraits fill their own column with chest and head clear, top 10 percent space above helmets, no clipping at outer image edges. No lettering, no Chinese characters, no panels or UI, no logo or watermark, no modern clothing, no copied illustration from any game, no anime style.

工具参数：`transparent_background: false`。
