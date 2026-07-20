#!/bin/zsh
# Renderiza los HTML generados por generate.js a PNG con las medidas de Apple.
# Uso: node generate.js && ./capture.sh
set -e
cd "$(dirname "$0")"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUT="../screenshots"
mkdir -p "$OUT/iphone-6.9" "$OUT/ipad-13"
for f in html/iphone-*.html; do
  n=$(basename "$f" .html | sed 's/^iphone-//')
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --virtual-time-budget=5000 --window-size=1320,2868 \
    --screenshot="$OUT/iphone-6.9/$n.png" "file://$PWD/$f" 2>/dev/null
done
for f in html/ipad-*.html; do
  n=$(basename "$f" .html | sed 's/^ipad-//')
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --virtual-time-budget=5000 --window-size=2064,2752 \
    --screenshot="$OUT/ipad-13/$n.png" "file://$PWD/$f" 2>/dev/null
done
echo "Listo: $OUT"
