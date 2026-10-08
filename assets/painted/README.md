# 复古建筑 × 明亮田庄 · v0.34.13

用户选定：概念图 A 的建筑＋C 的清晰度。通过内置 imagegen 生成；未使用 Higgsfield、外部美术下载或 CLI API。以下为本轮最终使用的生成提示。概念图仅作为风格参考，不是游戏背景成品。

## 成品与接入

| 文件 | 尺寸 | 用途 | SHA-256 |
| --- | --- | --- | --- |
| outskirts-ac-v1.png | 1586 × 992 RGB | 城外底景 | ae48a5237f77baf269d1ce868c1eb732acffd2ab0aebee3b4241979b139b1e05 |
| resource-sites-ac-v2.png | 1254 × 1254 RGBA | 四种资源建筑 | 996801967eb6631b5a176d95891f2b382a0efdc9caf526638b6fde51adfb304a |

PNG 保留生成的像素与透明通道，不做去底、抠图或重采样。alpha > 16 的包围框在各象限内分别测量，再保留 2px 周边；区域见 scene-art-data.js。中央边界 alpha 最大值为 1，四个建筑没有实体像素跨到旁边象限。浏览器通过 SVG viewBox 和嵌套裁切显示原图，保留比例。

背景上的城墙、山林与河岸是装饰。空地不包含预绘制的资源建筑；建筑根据已有地块类型逐个绘制。编号、地块数据、六列导航、生产、建造、存档和在线权限不变，仅展示坐标按已开放行数居中并下移 50 个逻辑绘制单位，以避开背景城墙。

## 背景生成提示

参考图：同一张 A／B／C 风格概念对比图（只作美术参考）。transparent_background=false。

> Use case: stylized-concept. Create a NEW game-ready BACKGROUND PLATE only, a single wide landscape image around 16:10. The reference is an art-direction reference only: combine panel A's historically grounded weathered grey tile roofs, timber and stone with panel C's bright daylight, clean readable forms and soft warm green earth. This plate will sit beneath interactive resource-building sprites in an elevated isometric Chinese Three Kingdoms browser-game town outskirts. CRITICAL layout: a very broad open, flat field of subtly varied warm beige earth with sparse low grass occupies the central 80% of the width and from 18% to 88% of the height. This central space is empty buildable land: no trees, buildings, farms, fences, rocks, water or baked-in resource fields there. A small ancient Chinese stone city wall and modest watchtower roofs along the distant TOP 12% only, softly painted distant green hills above it; keep wall subdued so it doesn't compete with sprites. Natural framing at the extreme edges only: clustered foliage and a few rocks along the leftmost 7%, a narrow blue-green stream along the rightmost 7% curving around the bottom-right corner, a few bushes near bottom corners. Small dirt footpaths hug these outer edges only; NO path cutting through the center and no grid lines. Same scale and elevated isometric perspective for trees, wall and ground, no strong vanishing-point perspective, no dramatic horizon or sky, no landscape photo. Cohesive premium hand-painted semi-realistic RTS art, detailed yet calm soil texture, lightly sunlit grass, not cartoon/low-poly and not flat vector art. Light from upper left, gentle shadows, bright and clear but restrained saturation. No title, labels, border, HUD, watermark, people, resource structures or decorative building icons. Compose for readability of separately placed small buildings, not a crowded illustration.

## 资源建筑生成提示

参考图：A／B／C 风格概念对比图（只作美术参考）。transparent_background=true。

> Use case: stylized-concept. Generate a GAME-READY SPRITE ATLAS on a genuinely transparent alpha background, one square canvas with exactly FOUR isolated resource-site sprites in a clean 2 by 2 layout, each completely inside its own equal square quadrant with generous transparent spacing. Reference image is art-direction only. Combine panel A's realistic Three Kingdoms Chinese grey ceramic tile roofs, weathered wood, masonry and historical detail with panel C's bright clean daylight, crisp silhouette, easy readability and painterly soft volume. All four sprites use the SAME elevated isometric orthographic camera (roughly 35 degree downward view, diamonds whose ground edges rise about 1 per 2 horizontally), same scale, same warm earth, light from upper-left, soft contact shadow, no deep dark shadows. Top LEFT: productive FARM with two golden wheat strips, a modest grey tile-roof farmhouse, a few sacks and simple wooden fence, clearly reads as grain production. Top RIGHT: LOGGING YARD with a timber-roof workshop, neat cut log piles and a couple of fir trees, clear lumber silhouette. Bottom LEFT: STONE QUARRY with pale grey stepped cut rock face, stone blocks, a small quarry crane and modest tiled work shed, readable broad low silhouette. Bottom RIGHT: IRON MINE with a dark mine entrance in a modest rocky outcrop, a weathered tiled shed, ore cart and iron ore pile, distinct from quarry. Tiny natural earth patch ONLY immediately beneath each site, irregular edges fading into full transparency, NO raised island plinth, NO rectangular/square/diamond card border or platform, no large lawn surrounding sprites. Each site should occupy about 72 percent of its quadrant width and 62 percent of quadrant height, centered horizontally and resting near the same baseline, with transparent margin at every edge. Keep decorations subordinate; make main structures readable at 120px thumbnail. Avoid giant scenic backdrops, sky, water, distant castles, people, any labels/text/gridlines, watercolor paper, checkerboard painted into image, neon colors, excessive foliage, photoreal photography and cartoon low-poly shapes. High quality consistent hand-painted semi-realistic historic strategy game sprites, clean complete shapes, actual transparent background.

### 最终间距修订

首次生成上方两个图案的少量边缘跨象限，使用 imagegen 对首次 RGBA 图修订，最终输出 resource-sites-ac-v2.png。transparent_background=true。

> Edit target: the attached transparent 2x2 resource site sprite atlas. Make ONLY an atlas spacing correction: preserve all four resource site subjects, their artistic style, lighting, materials, isometric camera and the top-left farm, top-right lumber, bottom-left quarry, bottom-right mine arrangement. Scale each entire individual sprite DOWN to about 75 percent of its current size, and center it inside its own equal square quadrant. Require an EMPTY fully transparent band at least 80 pixels wide down the vertical center and across the horizontal center, and at least 40 pixels of fully transparent padding at all outer canvas edges. No sprite foliage or ground shadow may cross its quadrant boundary. Keep every sprite fully visible and uncut. Preserve actual transparency, including in the empty central band. No checkerboard, text, card frames, paper, solid background, or new objects. A square 2x2 sprite atlas suitable for extracting each quadrant independently.

## 检查范围

进行了图像尺寸、alpha 与包围框读取、源码语法检查、只读样本画面与实际城外 UI 预览。没有运行游戏功能或平衡测试，没有主动建设、购买、出征或修改玩家存档。游戏原有生产／自动升级计时按正常页面行为继续运行。
