#!/bin/zsh
# Renderiza los HTML de generate.js a PNG con medidas válidas para Google Play.
# Play exige ratio EXACTO 16:9 o 9:16 (no "hasta 2:1" como el teléfono de Apple).
#   phone  -> usa android-phone-*.html (igual a iphone-*.html pero sin el Dynamic Island) a 1242x2208 (9:16 exacto)
#   tablet -> reutiliza ipad-*.html    a 2160x3840 (9:16 exacto; cumple rango 7" [320-3840] Y 10" [1080-7680] a la vez;
#             ya no tiene notch porque statusBar() nunca dibuja el island en la variante tablet)
# Uso: node generate.js && ./capture-play.sh
set -e
cd "$(dirname "$0")"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

capture_locale() {
  local locale="$1" out="$2"
  mkdir -p "$out/android-phone" "$out/android-tablet"
  for f in "html/$locale"/android-phone-*.html; do
    n=$(basename "$f" .html | sed 's/^android-phone-//')
    "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
      --virtual-time-budget=5000 --window-size=1242,2208 \
      --screenshot="$out/android-phone/$n.png" "file://$PWD/$f" 2>/dev/null
  done
  for f in "html/$locale"/ipad-*.html; do
    n=$(basename "$f" .html | sed 's/^ipad-//')
    "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
      --virtual-time-budget=5000 --window-size=2160,3840 \
      --screenshot="$out/android-tablet/$n.png" "file://$PWD/$f" 2>/dev/null
  done
}

capture_locale es ../screenshots
capture_locale en ../screenshots-en
echo "Listo: ../screenshots y ../screenshots-en (android-phone, android-tablet)"
