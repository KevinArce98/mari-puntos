#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const {
  css,
  statusBar,
  tabBar,
  screenHome,
  screenActions,
  screenPermissions,
  screenDuel,
  T,
  LOCALES,
} = require('./generate');

const OUT_HTML = path.join(__dirname, 'html-web');

const SCREENS = [
  { id: 'home', tab: 'home', render: screenHome },
  { id: 'actions', tab: 'actions', render: screenActions },
  { id: 'permisos', tab: 'permissions', render: screenPermissions },
  { id: 'duelo', tab: 'duel', render: screenDuel },
];

function page(screen, t) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
${css('iphone')}
html,body{background:#fff;}
.screen{border-radius:0;}
</style></head>
<body>
<div class="screen">
  ${statusBar(false)}
  ${screen.render(false, t)}
  ${tabBar(screen.tab, t)}
</div>
</body></html>`;
}

let total = 0;
for (const locale of LOCALES) {
  const localeDir = path.join(OUT_HTML, locale);
  fs.mkdirSync(localeDir, { recursive: true });
  const t = T[locale];
  for (const screen of SCREENS) {
    fs.writeFileSync(path.join(localeDir, `${screen.id}.html`), page(screen, t));
    total++;
  }
}
console.log(`Generated ${total} HTML files in ${OUT_HTML} (${LOCALES.join('/')})`);
