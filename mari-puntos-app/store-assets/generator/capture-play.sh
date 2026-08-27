#!/bin/zsh
# Renderiza los MISMOS HTML de generate.js a PNG con medidas válidas para Google Play.
# Play exige ratio EXACTO 16:9 o 9:16 (no "hasta 2:1" como el teléfono de Apple).
#   phone  -> reutiliza iphone-*.html a 1242x2208 (9:16 exacto)
#   tablet -> reutiliza ipad-*.html   a 2160x3840 (9:16 exacto; cumple rango 7" [320-3840] Y 10" [1080-7680] a la vez)
# Uso: node generate.js && ./capture-play.sh
set -e
cd "$(dirname "$0")"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUT="../screenshots"
mkdir -p "$OUT/android-phone" "$OUT/android-tablet"
for f in html/iphone-*.html; do
  n=$(basename "$f" .html | sed 's/^iphone-//')
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --virtual-time-budget=5000 --window-size=1242,2208 \
    --screenshot="$OUT/android-phone/$n.png" "file://$PWD/$f" 2>/dev/null
done
for f in html/ipad-*.html; do
  n=$(basename "$f" .html | sed 's/^ipad-//')
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --virtual-time-budget=5000 --window-size=2160,3840 \
    --screenshot="$OUT/android-tablet/$n.png" "file://$PWD/$f" 2>/dev/null
done
echo "Listo: $OUT/android-phone y $OUT/android-tablet"
