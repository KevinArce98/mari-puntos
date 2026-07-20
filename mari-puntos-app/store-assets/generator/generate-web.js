#!/usr/bin/env node
/**
 * Genera capturas "solo pantalla" (sin marco de teléfono ni marketing)
 * para reusar en mari-puntos-website/public/. Reusa los mismos componentes
 * de generate.js para que reflejen el diseño actual de la app.
 */
const fs = require('fs');
const path = require('path');
const { css, statusBar, tabBar, screenHome, screenActions, screenPermissions, screenDuel } =
  require('./generate');

const OUT_HTML = path.join(__dirname, 'html-web');
fs.mkdirSync(OUT_HTML, { recursive: true });

const SCREENS = [
  { id: 'home', tab: 'Inicio', render: screenHome },
  { id: 'actions', tab: 'Acciones', render: screenActions },
  { id: 'permisos', tab: 'Permisos', render: screenPermissions },
  { id: 'duelo', tab: 'Duelo', render: screenDuel },
];

function page(screen) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
${css('iphone')}
html,body{background:#fff;}
.screen{border-radius:0;}
</style></head>
<body>
<div class="screen">
  ${statusBar(false)}
  ${screen.render(false)}
  ${tabBar(screen.tab)}
</div>
</body></html>`;
}

for (const screen of SCREENS) {
  fs.writeFileSync(path.join(OUT_HTML, `${screen.id}.html`), page(screen));
}
console.log(`Generated ${SCREENS.length} HTML files in ${OUT_HTML}`);
