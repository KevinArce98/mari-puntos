#!/usr/bin/env node
/**
 * Generador de screenshots App Store para MariPuntos.
 * Emite HTML por pantalla/dispositivo; capture.sh los renderiza con Chrome headless.
 */
const fs = require('fs');
const path = require('path');

const ROOT = '/Users/kevinarias/Projects/mari-puntos';
const SCRATCH = __dirname;
const OUT_HTML = path.join(SCRATCH, 'html');
const GLYPHS = JSON.parse(
  fs.readFileSync(
    path.join(
      ROOT,
      'node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/Ionicons.json'
    ),
    'utf8'
  )
);
const IONICONS_TTF = path.join(
  ROOT,
  'node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf'
);
const JAKARTA_TTF = path.join(SCRATCH, 'fonts/PlusJakartaSans.ttf');
const APP_ICON = path.join(ROOT, 'mari-puntos-app/assets/images/icon.png');

fs.mkdirSync(OUT_HTML, { recursive: true });

// ---------- Design tokens (theme/colors.ts light) ----------
const C = {
  primary: '#0F766E',
  primaryDark: '#115E59',
  primaryTint: '#F0FDFA',
  accent: '#D97706',
  love: '#FB7185',
  background: '#FAFAF9',
  surface: '#FFFFFF',
  border: '#E7E5E4',
  textPrimary: '#1C1917',
  textSecondary: '#57534E',
  textLight: '#78716C',
  success: '#16A34A',
  error: '#DC2626',
  warning: '#D97706',
  gray100: '#F5F5F4',
  gray200: '#E7E5E4',
  gray300: '#D6D3D1',
  gray400: '#A8A29E',
  sky: '#0EA5E9',
  rose: '#FB7185',
  violet: '#A78BFA',
  amber: '#F59E0B',
  streak: '#F97316',
};

function ic(name, size, color, extra = '') {
  let cp = GLYPHS[name];
  if (cp == null) cp = GLYPHS['ellipse'];
  return `<span class="ion" style="font-size:${size}px;color:${color};${extra}">&#x${cp.toString(16)};</span>`;
}

function avatar(initial, size, bg, level) {
  const lvl =
    level != null
      ? `<div class="av-lvl" style="width:${size * 0.42}px;height:${size * 0.42}px;font-size:${size * 0.22}px;">${level}</div>`
      : '';
  return `<div class="avatar" style="width:${size}px;height:${size}px;background:${bg};font-size:${size * 0.42}px;">${initial}${lvl}</div>`;
}

// ---------- App chrome (status bar / tab bar) ----------
function statusBar(tablet) {
  if (tablet) {
    return `<div class="statusbar tablet-sb">
      <span class="sb-time">9:41</span>
      <span class="sb-right">${ic('cellular', 17, C.textPrimary)}${ic('wifi', 18, C.textPrimary)}${ic('battery-full', 24, C.textPrimary)}</span>
    </div>`;
  }
  return `<div class="statusbar">
    <span class="sb-time">9:41</span>
    <div class="island"></div>
    <span class="sb-right">${ic('cellular', 17, C.textPrimary)}${ic('wifi', 18, C.textPrimary)}${ic('battery-full', 24, C.textPrimary)}</span>
  </div>`;
}

function tabBar(active) {
  const tabs = [
    ['Inicio', 'home', 'home-outline'],
    ['Acciones', 'checkmark-done-circle', 'checkmark-done-circle-outline'],
    ['Permisos', 'hand-right', 'hand-right-outline'],
    ['Duelo', 'stats-chart', 'stats-chart-outline'],
    ['Perfil', 'person', 'person-outline'],
  ];
  const items = tabs
    .map(([label, on, off]) => {
      const isActive = label === active;
      const color = isActive ? C.primary : C.gray400;
      return `<div class="tab"><span>${ic(isActive ? on : off, 26, color)}</span><span class="tab-label" style="color:${color}">${label}</span></div>`;
    })
    .join('');
  return `<div class="tabbar">${items}<div class="home-indicator"></div></div>`;
}

// ---------- Reusable app components ----------
function actionCard(iconName, iconBg, title, subtitle) {
  return `<div class="card row-card">
    <div class="icon-sq" style="background:${iconBg}">${ic(iconName, 24, '#fff')}</div>
    <div class="rc-txt"><div class="rc-title">${title}</div><div class="rc-sub">${subtitle}</div></div>
    ${ic('chevron-forward', 20, C.gray400)}
  </div>`;
}

function chip(label, selected) {
  return `<div class="chip ${selected ? 'chip-on' : ''}">${label}</div>`;
}

function historyItem(iconName, iconColor, iconBg, title, meta, pts, positive, last) {
  return `<div class="hist-item ${last ? 'hist-last' : ''}">
    <div class="icon-rnd" style="background:${iconBg}">${ic(iconName, 20, iconColor)}</div>
    <div class="hi-txt"><div class="hi-title">${title}</div><div class="hi-meta">${meta}</div></div>
    <div class="hi-pts" style="color:${positive ? C.primary : C.error}">${pts}</div>
  </div>`;
}

function statusPill(label, kind) {
  const map = {
    approved: [C.success, '#F0FDF4'],
    pending: [C.warning, '#FFFBEB'],
    rejected: [C.error, '#FEF2F2'],
  };
  const [fg, bg] = map[kind];
  return `<div class="pill" style="color:${fg};background:${bg}">${label}</div>`;
}

// ---------- Screens ----------
function screenWelcome() {
  return `
  <div class="app welcome">
    <div class="w-logo"><img src="file://${APP_ICON}" class="w-logo-img"/><span class="w-logo-txt">MariPuntos</span></div>
    <div class="w-skip">Saltar</div>
    <div class="w-hero">
      <div class="w-hero-circle">${ic('people', 130, C.primary)}</div>
    </div>
    <div class="w-copy">
      <div class="w-title">¡Bienvenido a MariPuntos!</div>
      <div class="w-desc">Convierte tus rutinas diarias en un juego divertido con tu pareja. ¡Fortalece tu vínculo mientras completan tareas juntos!</div>
    </div>
    <div class="w-dots"><span class="dot dot-on"></span><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
    <div class="btn-primary">Siguiente</div>
    <div class="btn-ghost">¿Ya tienes una cuenta? Inicia sesión</div>
  </div>`;
}

function screenHome(pad) {
  return `
  <div class="app">
    <div class="h-header">
      <div class="h-left">
        ${avatar('M', 56, `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, 5)}
        <div class="h-greet"><div class="h-hola">Hola, María</div><div class="h-sub">Vamos a ganar puntos hoy</div></div>
      </div>
      <div class="bell">${ic('notifications-outline', 26, C.textPrimary)}<div class="bell-badge">2</div></div>
    </div>

    <div class="card row-card" style="border-left:none">
      <div class="icon-sq" style="background:${C.warning}">${ic('notifications', 24, '#fff')}</div>
      <div class="rc-txt"><div class="rc-title">2 pendientes por revisar</div><div class="rc-sub">Responde acciones y permisos de tu pareja</div></div>
      ${ic('chevron-forward', 20, C.gray400)}
    </div>

    <div class="section-title">Acciones rápidas</div>
    ${actionCard('hand-right-outline', C.accent, 'Solicitar permiso', 'Solicitar permiso para una actividad')}
    ${actionCard('add-circle-outline', C.primary, 'Registrar acción', 'Registrar una actividad para ganar puntos')}

    <div class="section-head"><span class="section-title" style="margin:0">Tu progreso</span><span class="see-all">Ver logros</span></div>
    <div class="progress-row">
      <div class="compact-chip">${ic('trophy', 22, C.accent)}<span>1,250</span></div>
      <div class="compact-chip">${ic('flame', 22, C.streak)}<span>5 sem</span></div>
      <div class="compact-chip">${ic('trending-up', 22, C.primary)}<span>Nivel 5</span></div>
    </div>

    <div class="section-head"><span class="section-title" style="margin:0">Historial reciente</span><span class="see-all">Ver todo</span></div>
    <div class="card" style="padding:0;overflow:hidden">
      ${historyItem('heart', C.rose, '#FFF1F2', 'Cena romántica sorpresa', 'Hoy · Romance', '+50', true)}
      ${historyItem('restaurant', C.sky, '#F0F9FF', 'Lavé los platos', 'Hoy · Hogar', '+15', true)}
      ${historyItem('hand-right', C.amber, '#FFFBEB', 'Permiso: salida con amigos', 'Ayer · Permiso', '−30', false, !pad)}
      ${
        pad
          ? historyItem('gift', C.violet, '#F5F3FF', 'Compré su postre favorito', 'Ayer · Detalles', '+25', true) +
            historyItem('flame', C.streak, '#FFF7ED', 'Bono de racha semanal', 'Esta semana · Racha ×5', '+30', true, true)
          : ''
      }
    </div>
  </div>`;
}

function screenActions(pad) {
  return `
  <div class="app">
    <div class="scr-header">Acciones</div>
    <div class="seg">
      <div class="seg-item seg-on">Recibidas</div>
      <div class="seg-item">Enviadas</div>
    </div>
    <div class="chips">${chip('Todas', true)}${chip('Pendientes')}${chip('Aprobadas')}${chip('Rechazadas')}</div>

    <div class="card act-card">
      <div class="icon-rnd lg" style="background:#FFF1F2">${ic('film-outline', 26, C.rose)}</div>
      <div class="ac-txt">
        <div class="ac-top"><span class="ac-title">Cita de película en casa</span><span class="ac-pts" style="color:${C.primary}">+40</span></div>
        <div class="ac-sub">Kevin · hace 2 h</div>
        <div class="ac-foot">${statusPill('Pendiente', 'pending')}</div>
      </div>
    </div>

    <div class="card act-card">
      <div class="icon-rnd lg" style="background:#F0F9FF">${ic('cafe-outline', 26, C.sky)}</div>
      <div class="ac-txt">
        <div class="ac-top"><span class="ac-title">Preparé el desayuno</span><span class="ac-pts" style="color:${C.primary}">+15</span></div>
        <div class="ac-sub">Kevin · hoy, 8:15</div>
        <div class="ac-foot">${statusPill('Aprobada', 'approved')}</div>
      </div>
    </div>

    <div class="card act-card">
      <div class="icon-rnd lg" style="background:#F5F3FF">${ic('gift-outline', 26, C.violet)}</div>
      <div class="ac-txt">
        <div class="ac-top"><span class="ac-title">Compré su postre favorito</span><span class="ac-pts" style="color:${C.primary}">+25</span></div>
        <div class="ac-sub">Kevin · ayer</div>
        <div class="ac-foot">${statusPill('Aprobada', 'approved')}</div>
      </div>
    </div>

    <div class="card act-card">
      <div class="icon-rnd lg" style="background:#FFFBEB">${ic('walk-outline', 26, C.amber)}</div>
      <div class="ac-txt">
        <div class="ac-top"><span class="ac-title">Caminata juntos al parque</span><span class="ac-pts" style="color:${C.primary}">+20</span></div>
        <div class="ac-sub">Kevin · ayer</div>
        <div class="ac-foot">${statusPill('Aprobada', 'approved')}</div>
      </div>
    </div>

    ${
      pad
        ? `<div class="card act-card">
      <div class="icon-rnd lg" style="background:#FFF1F2">${ic('heart-outline', 26, C.rose)}</div>
      <div class="ac-txt">
        <div class="ac-top"><span class="ac-title">Nota de amor en el espejo</span><span class="ac-pts" style="color:${C.primary}">+10</span></div>
        <div class="ac-sub">Kevin · lunes</div>
        <div class="ac-foot">${statusPill('Aprobada', 'approved')}</div>
      </div>
    </div>
    <div class="card act-card">
      <div class="icon-rnd lg" style="background:#F0F9FF">${ic('cart-outline', 26, C.sky)}</div>
      <div class="ac-txt">
        <div class="ac-top"><span class="ac-title">Hice las compras de la semana</span><span class="ac-pts" style="color:${C.primary}">+30</span></div>
        <div class="ac-sub">Kevin · lunes</div>
        <div class="ac-foot">${statusPill('Aprobada', 'approved')}</div>
      </div>
    </div>`
        : ''
    }
    <div class="fab">${ic('add', 30, '#fff')}</div>
  </div>`;
}

function screenPermissions(pad) {
  return `
  <div class="app">
    <div class="scr-header">Permisos</div>
    <div class="seg">
      <div class="seg-item seg-on">Enviadas</div>
      <div class="seg-item">Recibidas</div>
    </div>
    <div class="chips">${chip('Todas', true)}${chip('Pendientes')}${chip('Aprobadas')}${chip('Rechazadas')}</div>

    <div class="card act-card">
      <div class="icon-rnd lg" style="background:${C.primaryTint}">${ic('beer-outline', 26, C.primary)}</div>
      <div class="ac-txt">
        <div class="ac-top"><span class="ac-title">Salida con amigos el viernes</span><span class="ac-pts" style="color:${C.error}">−30</span></div>
        <div class="ac-sub">Para: Kevin · vence en 2 días</div>
        <div class="ac-foot">${statusPill('Pendiente', 'pending')}</div>
      </div>
    </div>

    <div class="card act-card">
      <div class="icon-rnd lg" style="background:${C.primaryTint}">${ic('game-controller-outline', 26, C.primary)}</div>
      <div class="ac-txt">
        <div class="ac-top"><span class="ac-title">Tarde de videojuegos</span><span class="ac-pts" style="color:${C.error}">−20</span></div>
        <div class="ac-sub">Para: Kevin · sábado</div>
        <div class="ac-foot">${statusPill('Aprobada', 'approved')}</div>
      </div>
    </div>

    <div class="card act-card">
      <div class="icon-rnd lg" style="background:${C.primaryTint}">${ic('fish-outline', 26, C.primary)}</div>
      <div class="ac-txt">
        <div class="ac-top"><span class="ac-title">Viaje de pesca el sábado</span><span class="ac-pts" style="color:${C.error}">−50</span></div>
        <div class="ac-sub">Para: Kevin · próxima semana</div>
        <div class="ac-foot">${statusPill('Aprobada', 'approved')}</div>
      </div>
    </div>

    ${
      pad
        ? `<div class="card act-card">
      <div class="icon-rnd lg" style="background:${C.primaryTint}">${ic('musical-notes-outline', 26, C.primary)}</div>
      <div class="ac-txt">
        <div class="ac-top"><span class="ac-title">Concierto con compañeros</span><span class="ac-pts" style="color:${C.error}">−45</span></div>
        <div class="ac-sub">Para: Kevin · este mes</div>
        <div class="ac-foot">${statusPill('Rechazada', 'rejected')}</div>
      </div>
    </div>
    <div class="card act-card">
      <div class="icon-rnd lg" style="background:${C.primaryTint}">${ic('football-outline', 26, C.primary)}</div>
      <div class="ac-txt">
        <div class="ac-top"><span class="ac-title">Partido del domingo</span><span class="ac-pts" style="color:${C.error}">−25</span></div>
        <div class="ac-sub">Para: Kevin · domingo</div>
        <div class="ac-foot">${statusPill('Aprobada', 'approved')}</div>
      </div>
    </div>`
        : ''
    }
    <div class="btn-primary" style="margin-top:20px">${ic('hand-right-outline', 20, '#fff', 'margin-right:8px;vertical-align:-3px')}Solicitar permiso</div>
  </div>`;
}

function screenDuel(pad) {
  return `
  <div class="app">
    <div class="scr-header">Duelo</div>
    <div class="card" style="padding:28px 24px;text-align:center">
      <div class="d-title">Vas ganando</div>
      <div class="d-sub">Saldo total acumulado</div>
      <div class="d-vs">
        <div class="d-col">
          ${avatar('M', 84, `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`)}
          <div class="d-name">María</div>
          <div class="d-pts" style="color:${C.primary}">1,250</div>
          <div class="d-lvl">Nivel 5</div>
        </div>
        <div class="d-badge">VS</div>
        <div class="d-col">
          ${avatar('K', 84, `linear-gradient(135deg, ${C.love}, #F43F5E)`)}
          <div class="d-name">Kevin</div>
          <div class="d-pts" style="color:${C.love}">980</div>
          <div class="d-lvl">Nivel 4</div>
        </div>
      </div>
      <div class="d-bar"><div class="d-fill" style="width:56%"></div></div>
      <div class="d-labels"><span style="color:${C.primary}">56%</span><span style="color:${C.love}">44%</span></div>
    </div>

    <div class="card" style="margin-top:16px;display:flex;align-items:center;gap:14px">
      <div class="icon-rnd lg" style="background:#FFF7ED">${ic('flame', 26, C.streak)}</div>
      <div style="flex:1;text-align:left">
        <div class="rc-title">Racha de pareja: 5 semanas</div>
        <div class="rc-sub">Completen una acción esta semana para mantenerla</div>
      </div>
    </div>
    <div class="section-title" style="margin-top:24px">Resumen semanal</div>
    <div class="card" style="padding:0;overflow:hidden">
      ${historyItem('trophy', C.accent, '#FDF3E3', 'Semana pasada', 'María 180 · Kevin 145', 'M', true)}
      ${historyItem('trophy', C.accent, '#FDF3E3', 'Hace 2 semanas', 'María 120 · Kevin 160', 'K', true)}
      ${historyItem('trophy', C.accent, '#FDF3E3', 'Hace 3 semanas', 'María 210 · Kevin 190', 'M', true, true)}
    </div>
    ${
      pad
        ? `<div class="card" style="display:flex;align-items:center;gap:14px">
      <div class="icon-rnd lg" style="background:#FFF1F2">${ic('heart', 26, C.love)}</div>
      <div style="flex:1;text-align:left">
        <div class="rc-title">Gane quien gane, ganan los dos</div>
        <div class="rc-sub">El duelo es amistoso: cada punto fortalece su vínculo</div>
      </div>
    </div>`
        : ''
    }
  </div>`;
}

function screenAchievements(pad) {
  return `
  <div class="app">
    <div class="scr-header">Logros</div>
    <div class="card">
      <div class="ach-head">
        <div><div class="rc-title" style="font-size:17px">Tu progreso</div><div class="rc-sub">8 de 12 logros</div></div>
        <div class="pct-circle">67%</div>
      </div>
      <div class="pbar"><div class="pfill" style="width:67%;background:${C.accent}"></div></div>
      <div class="stats-row">
        <div class="mini">${ic('trophy', 20, C.accent)}<div class="mini-v">8</div><div class="mini-l">Ganados</div></div>
        <div class="mini-div"></div>
        <div class="mini">${ic('hourglass-outline', 20, C.primary)}<div class="mini-v">4</div><div class="mini-l">Pendientes</div></div>
        <div class="mini-div"></div>
        <div class="mini">${ic('star', 20, C.warning)}<div class="mini-v">12</div><div class="mini-l">Total</div></div>
      </div>
    </div>

    <div class="chips" style="margin-top:16px">${chip('Todos', true)}${chip('Desbloqueados')}${chip('Bloqueados')}</div>

    <div class="card ach-card">
      <div class="icon-sq" style="background:#FDF3E3">${ic('trophy', 26, C.accent)}</div>
      <div class="ac-txt">
        <div class="ac-top"><span class="ac-title">Primera acción</span>${ic('checkmark-circle', 18, C.success)}</div>
        <div class="ac-sub">Completa tu primera acción en pareja</div>
        <div class="ach-date">Desbloqueado el 12 jul 2026</div>
      </div>
    </div>

    <div class="card ach-card">
      <div class="icon-sq" style="background:#FDF3E3">${ic('flame', 26, C.accent)}</div>
      <div class="ac-txt">
        <div class="ac-top"><span class="ac-title">Racha de 4 semanas</span>${ic('checkmark-circle', 18, C.success)}</div>
        <div class="ac-sub">Mantengan la racha durante un mes</div>
        <div class="ach-date">Desbloqueado el 5 jul 2026</div>
      </div>
    </div>

    <div class="card ach-card" style="opacity:.7">
      <div class="icon-sq" style="background:${C.gray100}">${ic('lock-closed', 24, C.gray400)}</div>
      <div class="ac-txt">
        <div class="ac-top"><span class="ac-title" style="color:${C.textSecondary}">Nivel 10</span></div>
        <div class="ac-sub">Alcanza el nivel 10 sumando puntos</div>
        <div class="pbar" style="margin-top:8px;height:6px"><div class="pfill" style="width:50%;background:${C.primary}"></div></div>
        <div class="ach-prog">5 / 10</div>
      </div>
    </div>
    ${
      pad
        ? `<div class="card ach-card">
      <div class="icon-sq" style="background:#FDF3E3">${ic('star', 26, C.accent)}</div>
      <div class="ac-txt">
        <div class="ac-top"><span class="ac-title">1,000 MariPuntos</span>${ic('checkmark-circle', 18, C.success)}</div>
        <div class="ac-sub">Acumula 1,000 puntos en total</div>
        <div class="ach-date">Desbloqueado el 28 jun 2026</div>
      </div>
    </div>
    <div class="card ach-card" style="opacity:.7">
      <div class="icon-sq" style="background:${C.gray100}">${ic('lock-closed', 24, C.gray400)}</div>
      <div class="ac-txt">
        <div class="ac-top"><span class="ac-title" style="color:${C.textSecondary}">50 permisos acordados</span></div>
        <div class="ac-sub">Acuerden 50 permisos entre los dos</div>
        <div class="pbar" style="margin-top:8px;height:6px"><div class="pfill" style="width:64%;background:${C.primary}"></div></div>
        <div class="ach-prog">32 / 50</div>
      </div>
    </div>`
        : ''
    }
  </div>`;
}

function screenHistory(pad) {
  return `
  <div class="app">
    <div class="scr-header" style="display:flex;align-items:center;gap:12px">${ic('arrow-back', 24, C.textPrimary)}<span>Historial</span></div>
    <div class="chips">${chip('Todo', true)}${chip('Ganados')}${chip('Gastados')}</div>

    <div class="h-group">Hoy</div>
    <div class="card" style="padding:0;overflow:hidden">
      ${historyItem('heart', C.rose, '#FFF1F2', 'Cena romántica sorpresa', '19:30 · Romance', '+50', true)}
      ${historyItem('restaurant', C.sky, '#F0F9FF', 'Lavé los platos', '8:20 · Hogar', '+15', true, true)}
    </div>

    <div class="h-group">Ayer</div>
    <div class="card" style="padding:0;overflow:hidden">
      ${historyItem('hand-right', C.amber, '#FFFBEB', 'Permiso: salida con amigos', 'Permiso aprobado', '−30', false)}
      ${historyItem('gift', C.violet, '#F5F3FF', 'Compré su postre favorito', 'Detalles', '+25', true)}
      ${historyItem('walk', C.amber, '#FFFBEB', 'Caminata juntos al parque', 'Actividades', '+20', true, true)}
    </div>

    <div class="h-group">Esta semana</div>
    <div class="card" style="padding:0;overflow:hidden">
      ${historyItem('flame', C.streak, '#FFF7ED', 'Bono de racha semanal', 'Racha ×5', '+30', true)}
      ${historyItem('trophy', C.accent, '#FDF3E3', 'Logro: Racha de 4 semanas', 'Recompensa', '+100', true, true)}
    </div>
    ${
      pad
        ? `<div class="h-group">Semana pasada</div>
    <div class="card" style="padding:0;overflow:hidden">
      ${historyItem('cafe', C.sky, '#F0F9FF', 'Preparé el desayuno', 'Hogar', '+15', true)}
      ${historyItem('game-controller', C.primary, C.primaryTint, 'Permiso: tarde de videojuegos', 'Permiso aprobado', '−20', false)}
      ${historyItem('heart', C.rose, '#FFF1F2', 'Nota de amor en el espejo', 'Romance', '+10', true, true)}
    </div>`
        : ''
    }
  </div>`;
}

function screenProfile(pad) {
  return `
  <div class="app">
    <div class="scr-header">Perfil</div>
    <div class="card" style="text-align:center;padding:28px 20px">
      ${avatar('M', 96, `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, 5)}
      <div class="p-name">María Rodríguez</div>
      <div class="p-mail">maria@ejemplo.com</div>
      <div class="p-linked">${ic('heart', 16, C.love, 'margin-right:6px;vertical-align:-2px')}Vinculada con Kevin</div>
      <div class="stats-row" style="margin-top:20px">
        <div class="mini"><div class="mini-v" style="color:${C.primary}">1,250</div><div class="mini-l">MariPuntos</div></div>
        <div class="mini-div"></div>
        <div class="mini"><div class="mini-v" style="color:${C.accent}">5</div><div class="mini-l">Nivel</div></div>
        <div class="mini-div"></div>
        <div class="mini"><div class="mini-v" style="color:${C.streak}">5 sem</div><div class="mini-l">Racha</div></div>
      </div>
    </div>

    <div class="card" style="padding:6px 0;margin-top:16px">
      <div class="menu-item">${ic('time-outline', 22, C.primary)}<span>Historial de puntos</span>${ic('chevron-forward', 18, C.gray400)}</div>
      <div class="menu-item">${ic('trophy-outline', 22, C.primary)}<span>Logros</span>${ic('chevron-forward', 18, C.gray400)}</div>
      <div class="menu-item">${ic('notifications-outline', 22, C.primary)}<span>Notificaciones</span>${ic('chevron-forward', 18, C.gray400)}</div>
      <div class="menu-item">${ic('key-outline', 22, C.primary)}<span>Cambiar contraseña</span>${ic('chevron-forward', 18, C.gray400)}</div>
      <div class="menu-item" style="border-bottom:none">${ic('unlink-outline', 22, C.textSecondary)}<span>Desvincular pareja</span>${ic('chevron-forward', 18, C.gray400)}</div>
    </div>

    ${
      pad
        ? `<div class="card" style="padding:6px 0;margin-top:16px">
      <div class="menu-item">${ic('help-circle-outline', 22, C.primary)}<span>Centro de ayuda</span>${ic('chevron-forward', 18, C.gray400)}</div>
      <div class="menu-item" style="border-bottom:none">${ic('shield-checkmark-outline', 22, C.primary)}<span>Privacidad</span>${ic('chevron-forward', 18, C.gray400)}</div>
    </div>`
        : ''
    }
    <div class="btn-outline" style="margin-top:16px;color:${C.error};border-color:#FECACA">Cerrar sesión</div>
  </div>`;
}

// ---------- Marketing shots ----------
const SHOTS = [
  {
    id: '01-bienvenida',
    theme: 'dark',
    headline: 'Gamifica tu <em>relación</em>',
    sub: 'Convierte la rutina diaria en un juego divertido para dos',
    screen: screenWelcome,
    tab: null,
    float: [
      { icon: 'heart', color: C.love, text: '+ amor', pos: 'left:-15%;top:16%', rot: -8 },
      { icon: 'trophy', color: C.accent, text: 'Nivel 5', pos: 'right:-16%;top:34%', rot: 6 },
    ],
  },
  {
    id: '02-inicio',
    theme: 'teal',
    headline: 'Todo en <em>un solo lugar</em>',
    sub: 'Puntos, rachas y pendientes de un vistazo',
    screen: screenHome,
    tab: 'Inicio',
    float: [
      { icon: 'flame', color: C.streak, text: 'Racha ×5', pos: 'left:-16%;top:24%', rot: -7 },
      { icon: 'trophy', color: C.accent, text: '1,250 pts', pos: 'right:-17%;top:44%', rot: 5 },
    ],
  },
  {
    id: '03-acciones',
    theme: 'sky',
    headline: 'Gana puntos por <em>cada detalle</em>',
    sub: 'Registra acciones y tu pareja las aprueba',
    screen: screenActions,
    tab: 'Acciones',
    float: [
      { icon: 'checkmark-circle', color: C.success, text: 'Aprobada', pos: 'left:-16%;top:38%', rot: -6 },
      { icon: 'add-circle', color: C.primary, text: '+40 pts', pos: 'right:-16%;top:20%', rot: 7 },
    ],
  },
  {
    id: '04-permisos',
    theme: 'amber',
    headline: 'Permisos <em>sin discusiones</em>',
    sub: 'Solicita, acuerda y listo: cada permiso tiene su precio en puntos',
    screen: screenPermissions,
    tab: 'Permisos',
    float: [
      { icon: 'hand-right', color: C.accent, text: 'Permiso', pos: 'left:-15%;top:22%', rot: -7 },
      { icon: 'checkmark-circle', color: C.success, text: 'Acordado', pos: 'right:-17%;top:42%', rot: 6 },
    ],
  },
  {
    id: '05-duelo',
    theme: 'rose',
    headline: 'Un duelo <em>amistoso</em>',
    sub: '¿Quién suma más MariPuntos? Compitan con amor',
    screen: screenDuel,
    tab: 'Duelo',
    float: [
      { icon: 'stats-chart', color: C.primary, text: '56 – 44', pos: 'left:-16%;top:40%', rot: -6 },
      { icon: 'heart', color: C.love, text: 'VS', pos: 'right:-15%;top:22%', rot: 8 },
    ],
  },
  {
    id: '06-logros',
    theme: 'amber',
    headline: 'Desbloqueen <em>logros juntos</em>',
    sub: 'Suban de nivel y celebren cada meta en pareja',
    screen: screenAchievements,
    tab: 'Inicio',
    float: [
      { icon: 'trophy', color: C.accent, text: '8 / 12', pos: 'left:-16%;top:20%', rot: -8 },
      { icon: 'star', color: C.warning, text: '67%', pos: 'right:-15%;top:42%', rot: 6 },
    ],
  },
  {
    id: '07-historial',
    theme: 'teal',
    headline: 'Historial <em>claro y justo</em>',
    sub: 'Cada punto ganado o gastado queda registrado para los dos',
    screen: screenHistory,
    tab: 'Inicio',
    float: [
      { icon: 'add-circle', color: C.primary, text: '+50', pos: 'left:-15%;top:30%', rot: -6 },
      { icon: 'remove-circle', color: C.error, text: '−30', pos: 'right:-15%;top:48%', rot: 7 },
    ],
  },
  {
    id: '08-perfil',
    theme: 'stone',
    headline: 'Su progreso, <em>siempre a mano</em>',
    sub: 'Nivel, saldo y racha de pareja en tu perfil',
    screen: screenProfile,
    tab: 'Perfil',
    float: [
      { icon: 'person', color: C.primary, text: 'Nivel 5', pos: 'left:-16%;top:26%', rot: -7 },
      { icon: 'flame', color: C.streak, text: '5 semanas', pos: 'right:-17%;top:44%', rot: 6 },
    ],
  },
];

const THEMES = {
  dark: {
    bg: `linear-gradient(160deg, #0F766E 0%, #115E59 55%, #134E4A 100%)`,
    fg: '#FFFFFF',
    subFg: 'rgba(255,255,255,.78)',
    em: '#5EEAD4',
    blobA: 'rgba(94,234,212,.25)',
    blobB: 'rgba(251,113,133,.28)',
    brandBg: 'rgba(255,255,255,.14)',
    brandFg: '#fff',
  },
  teal: {
    bg: `linear-gradient(165deg, #F0FDFA 0%, #FAFAF9 45%, #CCFBF1 100%)`,
    fg: C.textPrimary,
    subFg: C.textSecondary,
    em: C.primary,
    blobA: 'rgba(15,118,110,.14)',
    blobB: 'rgba(217,119,6,.12)',
    brandBg: '#FFFFFF',
    brandFg: C.primary,
  },
  sky: {
    bg: `linear-gradient(165deg, #F0F9FF 0%, #FAFAF9 45%, #E0F2FE 100%)`,
    fg: C.textPrimary,
    subFg: C.textSecondary,
    em: C.sky,
    blobA: 'rgba(14,165,233,.14)',
    blobB: 'rgba(15,118,110,.12)',
    brandBg: '#FFFFFF',
    brandFg: C.primary,
  },
  amber: {
    bg: `linear-gradient(165deg, #FFFBEB 0%, #FAFAF9 45%, #FEF3C7 100%)`,
    fg: C.textPrimary,
    subFg: C.textSecondary,
    em: C.accent,
    blobA: 'rgba(217,119,6,.14)',
    blobB: 'rgba(15,118,110,.12)',
    brandBg: '#FFFFFF',
    brandFg: C.primary,
  },
  rose: {
    bg: `linear-gradient(165deg, #FFF1F2 0%, #FAFAF9 45%, #FFE4E6 100%)`,
    fg: C.textPrimary,
    subFg: C.textSecondary,
    em: C.rose,
    blobA: 'rgba(251,113,133,.16)',
    blobB: 'rgba(15,118,110,.12)',
    brandBg: '#FFFFFF',
    brandFg: C.primary,
  },
  stone: {
    bg: `linear-gradient(165deg, #FAFAF9 0%, #F5F5F4 55%, #E7F6F4 100%)`,
    fg: C.textPrimary,
    subFg: C.textSecondary,
    em: C.primary,
    blobA: 'rgba(15,118,110,.12)',
    blobB: 'rgba(251,113,133,.12)',
    brandBg: '#FFFFFF',
    brandFg: C.primary,
  },
};

// ---------- CSS ----------
function css(device) {
  const isPad = device === 'ipad';
  // canvas + typographic scale
  const H1 = isPad ? 120 : 104;
  const SUB = isPad ? 44 : 40;
  const BRAND = isPad ? 34 : 30;
  return `
  @font-face { font-family:'Jakarta'; src:url('file://${JAKARTA_TTF}') format('truetype'); font-weight: 200 800; }
  @font-face { font-family:'Ionicons'; src:url('file://${IONICONS_TTF}') format('truetype'); }
  * { margin:0; padding:0; box-sizing:border-box; -webkit-font-smoothing:antialiased; }
  html,body { width:100%; height:100%; overflow:hidden; }
  body { font-family:'Jakarta', system-ui, sans-serif; }
  .ion { font-family:'Ionicons'; font-style:normal; line-height:1; display:inline-block; }

  .canvas { width:100vw; height:100vh; position:relative; overflow:hidden;
    display:flex; flex-direction:column; align-items:center; }
  .blob { position:absolute; border-radius:50%; filter:blur(90px); }
  .blob-a { width:${isPad ? 900 : 760}px; height:${isPad ? 900 : 760}px; top:-12%; left:-18%; }
  .blob-b { width:${isPad ? 800 : 660}px; height:${isPad ? 800 : 660}px; bottom:-8%; right:-16%; }

  .brand { display:flex; align-items:center; gap:14px; margin-top:${isPad ? 96 : 110}px;
    padding:14px 30px; border-radius:999px; box-shadow:0 8px 30px rgba(28,25,23,.08); z-index:3; }
  .brand img { width:${isPad ? 52 : 48}px; height:${isPad ? 52 : 48}px; border-radius:12px; }
  .brand span { font-size:${BRAND}px; font-weight:700; }

  .headline { font-size:${H1}px; font-weight:800; letter-spacing:-2px; text-align:center;
    line-height:1.12; margin:${isPad ? 56 : 60}px 90px 0; z-index:3; }
  .headline em { font-style:normal; }
  .subline { font-size:${SUB}px; font-weight:500; text-align:center; line-height:1.4;
    margin:${isPad ? 28 : 30}px 150px 0; z-index:3; }

  .stage { flex:1; display:flex; align-items:center; justify-content:center; position:relative;
    z-index:2; width:100%; padding-top:${isPad ? 48 : 50}px; }
  .device-wrap { position:relative; }

  .float-chip { position:absolute; display:flex; align-items:center; gap:12px; background:#fff;
    padding:18px 28px; border-radius:999px; box-shadow:0 18px 50px rgba(28,25,23,.16);
    font-size:${isPad ? 34 : 30}px; font-weight:700; color:${C.textPrimary}; z-index:4; }

  /* ---- Device ---- */
  .device { background:#1C1917; border-radius:${isPad ? 76 : 108}px; padding:${isPad ? 42 : 22}px;
    box-shadow:0 60px 140px rgba(28,25,23,.35), 0 24px 60px rgba(28,25,23,.22); position:relative; }
  .screen { background:${C.background}; overflow:hidden; position:relative;
    border-radius:${isPad ? 44 : 88}px;
    width:${isPad ? 1024 : 430}px; height:${isPad ? 1366 : 932}px; zoom:${isPad ? 1.32 : 1.98}; }

  .statusbar { height:58px; display:flex; align-items:center; justify-content:space-between;
    padding:6px 34px 0; position:relative; }
  .tablet-sb { padding:10px 28px 0; height:44px; }
  .sb-time { font-size:17px; font-weight:700; color:${C.textPrimary}; }
  .sb-right { display:flex; gap:7px; align-items:center; }
  .island { position:absolute; left:50%; top:12px; transform:translateX(-50%);
    width:124px; height:36px; background:#000; border-radius:20px; }

  .tabbar { position:absolute; left:0; right:0; bottom:0; background:${C.surface};
    border-top:1px solid ${C.border}; display:flex; padding:12px 8px 38px; }
  .tab { flex:1; display:flex; flex-direction:column; align-items:center; gap:3px; }
  .tab-label { font-size:11px; font-weight:600; }
  .home-indicator { position:absolute; bottom:8px; left:50%; transform:translateX(-50%);
    width:140px; height:5px; border-radius:3px; background:${C.textPrimary}; opacity:.9; }
  .tablet .tabbar { padding-bottom:12px; }
  .tablet .home-indicator { display:none; }

  /* ---- App content ---- */
  .app { padding:14px 20px 120px; height:calc(100% - 58px); overflow:hidden; }
  .tablet .app { max-width:720px; margin:0 auto; padding-top:24px; }
  .card { background:${C.surface}; border:1px solid ${C.border}; border-radius:20px; padding:16px; margin-bottom:12px; }
  .scr-header { font-size:24px; font-weight:700; color:${C.textPrimary}; margin:10px 0 16px; }
  .section-title { font-size:16px; font-weight:600; color:${C.textPrimary}; margin:18px 0 10px; }
  .section-head { display:flex; justify-content:space-between; align-items:center; margin:20px 0 10px; }
  .see-all { font-size:15px; font-weight:500; color:${C.primary}; }

  .row-card { display:flex; align-items:center; gap:14px; }
  .icon-sq { width:48px; height:48px; border-radius:14px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .icon-rnd { width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .icon-rnd.lg { width:52px; height:52px; border-radius:16px; }
  .rc-txt { flex:1; min-width:0; }
  .rc-title { font-size:16px; font-weight:600; color:${C.textPrimary}; }
  .rc-sub { font-size:13px; font-weight:500; color:${C.textSecondary}; margin-top:2px; }

  .h-header { display:flex; justify-content:space-between; align-items:center; margin:8px 0 16px; }
  .h-left { display:flex; align-items:center; gap:12px; }
  .h-hola { font-size:20px; font-weight:700; color:${C.textPrimary}; }
  .h-sub { font-size:13px; font-weight:500; color:${C.textSecondary}; margin-top:1px; }
  .bell { position:relative; width:44px; height:44px; background:${C.surface}; border:1px solid ${C.border};
    border-radius:50%; display:flex; align-items:center; justify-content:center; }
  .bell-badge { position:absolute; top:-2px; right:-2px; background:${C.error}; color:#fff; font-size:11px;
    font-weight:700; width:20px; height:20px; border-radius:10px; display:flex; align-items:center; justify-content:center; }

  .avatar { border-radius:50%; color:#fff; font-weight:700; display:inline-flex; align-items:center;
    justify-content:center; position:relative; flex-shrink:0; }
  .av-lvl { position:absolute; bottom:-3px; right:-3px; background:${C.accent}; color:#fff; border:2px solid #fff;
    border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; }

  .compact-chip { display:inline-flex; align-items:center; gap:8px; background:${C.surface};
    border:1px solid ${C.border}; border-radius:999px; padding:10px 16px; font-size:17px; font-weight:700; color:${C.textPrimary}; }
  .progress-row { display:flex; gap:10px; flex-wrap:wrap; }

  .hist-item { display:flex; align-items:center; gap:12px; padding:13px 16px; border-bottom:1px solid ${C.gray100}; }
  .hist-last { border-bottom:none; }
  .hi-txt { flex:1; min-width:0; }
  .hi-title { font-size:15px; font-weight:600; color:${C.textPrimary}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .hi-meta { font-size:12px; font-weight:500; color:${C.textLight}; margin-top:1px; }
  .hi-pts { font-size:16px; font-weight:700; font-variant-numeric:tabular-nums; }
  .h-group { font-size:13px; font-weight:600; color:${C.textLight}; margin:14px 4px 8px; text-transform:uppercase; letter-spacing:.4px; }

  .chips { display:flex; gap:8px; margin:4px 0 14px; }
  .chip { padding:8px 16px; border-radius:999px; background:${C.surface}; border:1px solid ${C.border};
    font-size:14px; font-weight:600; color:${C.textSecondary}; }
  .chip-on { background:${C.primary}; border-color:${C.primary}; color:#fff; }

  .seg { display:flex; background:${C.gray100}; border-radius:14px; padding:4px; margin-bottom:12px; }
  .seg-item { flex:1; text-align:center; padding:9px 0; font-size:14px; font-weight:600; color:${C.textSecondary}; border-radius:11px; }
  .seg-on { background:#fff; color:${C.textPrimary}; box-shadow:0 2px 8px rgba(28,25,23,.08); }

  .act-card { display:flex; gap:14px; align-items:flex-start; }
  .ac-txt { flex:1; min-width:0; }
  .ac-top { display:flex; justify-content:space-between; align-items:center; gap:8px; }
  .ac-title { font-size:16px; font-weight:600; color:${C.textPrimary}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .ac-pts { font-size:17px; font-weight:700; font-variant-numeric:tabular-nums; }
  .ac-sub { font-size:13px; font-weight:500; color:${C.textSecondary}; margin-top:2px; }
  .ac-foot { margin-top:8px; }
  .pill { display:inline-block; font-size:12px; font-weight:700; padding:5px 12px; border-radius:999px; }

  .fab { position:absolute; right:24px; bottom:118px; width:60px; height:60px; border-radius:30px;
    background:${C.primary}; display:flex; align-items:center; justify-content:center;
    box-shadow:0 10px 26px rgba(15,118,110,.4); }

  .d-title { font-size:22px; font-weight:700; color:${C.textPrimary}; }
  .d-sub { font-size:13px; font-weight:500; color:${C.textSecondary}; margin:4px 0 22px; }
  .d-vs { display:flex; align-items:center; justify-content:space-between; margin-bottom:22px; }
  .d-col { flex:1; display:flex; flex-direction:column; align-items:center; }
  .d-name { font-size:16px; font-weight:600; color:${C.textPrimary}; margin-top:10px; }
  .d-pts { font-size:28px; font-weight:800; font-variant-numeric:tabular-nums; margin-top:2px; }
  .d-lvl { font-size:13px; font-weight:500; color:${C.textSecondary}; margin-top:2px; }
  .d-badge { width:52px; height:52px; border-radius:26px; background:${C.primaryTint}; color:${C.primary};
    font-weight:800; font-size:16px; display:flex; align-items:center; justify-content:center; }
  .d-bar { height:10px; border-radius:5px; background:${C.love}; overflow:hidden; }
  .d-fill { height:100%; background:${C.primary}; border-radius:5px; }
  .d-labels { display:flex; justify-content:space-between; font-size:13px; font-weight:700; margin-top:8px; }

  .ach-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }
  .pct-circle { width:60px; height:60px; border-radius:30px; background:#FDF3E3; color:${C.accent};
    font-size:17px; font-weight:800; display:flex; align-items:center; justify-content:center; }
  .pbar { height:10px; border-radius:5px; background:${C.gray100}; overflow:hidden; }
  .pfill { height:100%; border-radius:5px; }
  .stats-row { display:flex; align-items:center; margin-top:16px; padding-top:14px; border-top:1px solid ${C.gray100}; }
  .mini { flex:1; text-align:center; }
  .mini-v { font-size:17px; font-weight:700; color:${C.textPrimary}; margin-top:4px; }
  .mini-l { font-size:12px; font-weight:500; color:${C.textSecondary}; }
  .mini-div { width:1px; height:36px; background:${C.gray200}; }
  .ach-card { display:flex; gap:14px; align-items:flex-start; }
  .ach-date { font-size:12px; font-weight:600; color:${C.success}; margin-top:6px; }
  .ach-prog { font-size:12px; font-weight:500; color:${C.textSecondary}; text-align:right; margin-top:4px; }

  .menu-item { display:flex; align-items:center; gap:14px; padding:15px 18px; border-bottom:1px solid ${C.gray100};
    font-size:16px; font-weight:500; color:${C.textPrimary}; }
  .menu-item span:nth-child(2) { flex:1; }
  .p-name { font-size:20px; font-weight:700; color:${C.textPrimary}; margin-top:12px; }
  .p-mail { font-size:14px; font-weight:500; color:${C.textSecondary}; margin-top:2px; }
  .p-linked { display:inline-block; margin-top:10px; font-size:13px; font-weight:600; color:${C.rose};
    background:#FFF1F2; padding:6px 14px; border-radius:999px; }

  .btn-primary { background:${C.primary}; color:#fff; text-align:center; font-size:17px; font-weight:600;
    padding:16px; border-radius:18px; box-shadow:0 8px 22px rgba(15,118,110,.28); }
  .btn-ghost { color:${C.primary}; text-align:center; font-size:15px; font-weight:600; padding:14px; }
  .btn-outline { border:1.5px solid ${C.gray300}; text-align:center; font-size:16px; font-weight:600;
    padding:14px; border-radius:18px; color:${C.textPrimary}; }

  /* Welcome */
  .welcome { display:flex; flex-direction:column; padding-bottom:44px; }
  .w-logo { display:flex; align-items:center; justify-content:center; gap:10px; margin-top:16px; }
  .w-logo-img { width:46px; height:46px; border-radius:12px; box-shadow:0 2px 8px rgba(28,25,23,.12); }
  .w-logo-txt { font-size:23px; font-weight:800; color:${C.primary}; }
  .w-skip { position:absolute; top:74px; right:26px; font-size:15px; font-weight:600; color:${C.primary}; }
  .tablet .w-skip { top:60px; }
  .w-hero { flex:1; display:flex; align-items:center; justify-content:center; }
  .w-hero-circle { width:250px; height:250px; border-radius:50%; background:${C.primaryTint};
    display:flex; align-items:center; justify-content:center; }
  .w-title { font-size:27px; font-weight:800; color:${C.textPrimary}; text-align:center; margin-bottom:12px; }
  .w-desc { font-size:15.5px; font-weight:400; color:${C.textSecondary}; text-align:center; line-height:1.45; padding:0 14px; }
  .w-copy { margin-bottom:26px; }
  .w-dots { display:flex; justify-content:center; gap:8px; margin-bottom:26px; }
  .dot { width:8px; height:8px; border-radius:4px; background:${C.gray200}; }
  .dot-on { width:24px; background:${C.primary}; }
  .welcome .btn-primary { margin:0 0 6px; }
  `;
}

// ---------- Page assembly ----------
function page(shot, device) {
  const t = THEMES[shot.theme];
  const isPad = device === 'ipad';
  const floats = (shot.float || [])
    .map(
      (f) =>
        `<div class="float-chip" style="${f.pos};transform:rotate(${f.rot}deg)">${ic(f.icon, isPad ? 40 : 36, f.color)}<span>${f.text}</span></div>`
    )
    .join('');
  const screenHtml = shot.screen(isPad);
  const tab = shot.tab ? tabBar(shot.tab) : '';
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>${css(device)}</style></head>
<body>
<div class="canvas" style="background:${t.bg}">
  <div class="blob blob-a" style="background:${t.blobA}"></div>
  <div class="blob blob-b" style="background:${t.blobB}"></div>
  <div class="brand" style="background:${t.brandBg}"><img src="file://${APP_ICON}"/><span style="color:${t.brandFg}">MariPuntos</span></div>
  <h1 class="headline" style="color:${t.fg}">${shot.headline.replace('<em>', `<em style="color:${t.em}">`)}</h1>
  <p class="subline" style="color:${t.subFg}">${shot.sub}</p>
  <div class="stage">
    <div class="device-wrap">
      ${floats}
      <div class="device"><div class="screen ${isPad ? 'tablet' : ''}">
        ${statusBar(isPad)}
        ${screenHtml}
        ${tab}
      </div></div>
    </div>
  </div>
</div>
</body></html>`;
}

for (const shot of SHOTS) {
  fs.writeFileSync(path.join(OUT_HTML, `iphone-${shot.id}.html`), page(shot, 'iphone'));
  fs.writeFileSync(path.join(OUT_HTML, `ipad-${shot.id}.html`), page(shot, 'ipad'));
}
console.log(`Generated ${SHOTS.length * 2} HTML files in ${OUT_HTML}`);
