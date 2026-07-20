#!/bin/zsh
# Renderiza los HTML de generate-web.js a PNG "solo pantalla" para el sitio web.
# Uso: node generate-web.js && ./capture-web.sh
set -e
cd "$(dirname "$0")"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUT="web-screenshots"
mkdir -p "$OUT"
for f in html-web/*.html; do
  n=$(basename "$f" .html)
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1.515 \
    --virtual-time-budget=5000 --window-size=851,1845 \
    --screenshot="$OUT/$n.png" "file://$PWD/$f" 2>/dev/null
done
echo "Listo: $OUT"
