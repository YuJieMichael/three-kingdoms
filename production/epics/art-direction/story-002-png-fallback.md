# 旧设备 PNG 备用图

**ID:** TR-art-direction-002
**Status:** Ready
**Last Updated:** 2026-10-08
**Type:** UI
**Layer:** Presentation
**GDD:** design/art/art-bible.md（TR-art-direction-001）
**ADR Governing Implementation:** ADR-0001
**Dependencies:** 无（可与 001 并行）

## Scope

不支持 AVIF 的浏览器（iOS 16 以前等）显示 PNG 备用图，支持 AVIF 的设备行为不变。

## Acceptance Criteria

- [ ] AC-1：为 assets/painted 下 32 张 AVIF 生成同尺寸的压缩 PNG 备用图，总体积不超过 6MB。
- [ ] AC-2：启动时检测 AVIF 支持一次；不支持时所有手绘图片（城内、城外、建筑图标、地图物件与纹理）改用 PNG。
- [ ] AC-3：支持 AVIF 的浏览器不额外下载 PNG。
- [ ] AC-4：模拟「不支持 AVIF」时，城内、城外、大地图截图中没有缺图。
- [ ] AC-5：新增测试覆盖图片地址的选择；`npm test` 全部通过。
