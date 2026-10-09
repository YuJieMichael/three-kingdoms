#!/bin/bash
# Process new painted art into assets/painted (design/art/art-bible.md §5). macOS only: Swift + ImageIO.
# usage: tools/painted-art/process.sh <building|map|texture> <input folder or PNG files...>
#   building → assets/painted/buildings, trimmed, long side 512
#   map      → assets/painted/map, trimmed, long side 384 (prints the height/width ratio for PaintedArt.map)
#   texture  → assets/painted/map, not trimmed, 512 (seamless ground textures)
# Each input <name>.png becomes <name>.avif plus a pngquant-compressed <name>.png fallback.
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"; root="$(cd "$here/../.." && pwd)"
kind="${1:-}"; shift || true
case "$kind" in
  building) dir=buildings; side=512; trim=1;;
  map) dir=map; side=384; trim=1;;
  texture) dir=map; side=512; trim=0;;
  *) sed -n '2,7p' "$0"; exit 2;;
esac
[ "$(uname)" = Darwin ] || { echo "需要 macOS（Swift / ImageIO）" >&2; exit 1; }
[ $# -gt 0 ] || { echo "缺少输入文件夹或 PNG 文件" >&2; exit 2; }
bin="${TMPDIR:-/tmp}/painted-art-prep"
if [ ! -x "$bin" ] || [ "$here/prep.swift" -nt "$bin" ]; then swiftc -O "$here/prep.swift" -o "$bin"; fi
files=()
for arg in "$@"; do
  if [ -d "$arg" ]; then while IFS= read -r f; do files+=("$f"); done < <(find "$arg" -maxdepth 1 -iname '*.png' | sort)
  else files+=("$arg"); fi
done
[ ${#files[@]} -gt 0 ] || { echo "没有找到 PNG" >&2; exit 1; }
quant=$(command -v pngquant || true)
[ -n "$quant" ] || echo "提示：未安装 pngquant（brew install pngquant），PNG 备用图不会压缩" >&2
for f in "${files[@]}"; do
  name="$(basename "${f%.*}" | tr '[:upper:]' '[:lower:]')"; outroot="${PAINTED_ART_OUT:-$root/assets/painted}"; mkdir -p "$outroot/$dir"; out="$outroot/$dir/$name"
  size=$("$bin" "$f" "$out" "$side" "$trim" 0.8)
  [ -n "$quant" ] && "$quant" --force --skip-if-larger --quality=65-90 --speed 1 --strip --output "$out.png" "$out.png" || true
  if [ "$kind" = map ]; then w=${size%x*}; h=${size#*x}; printf '%s %s  PaintedArt.map: %s:%s\n' "$name" "$size" "'$name'" "$(awk -v h="$h" -v w="$w" 'BEGIN{printf "%.3f", h/w}')"
  else echo "$name $size"; fi
done
echo "完成。换图后把 painted-art.js 里的 PaintedArt.version 加 1。"
