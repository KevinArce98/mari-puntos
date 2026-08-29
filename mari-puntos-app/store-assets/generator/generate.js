#!/usr/bin/env node
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

const LOCALES = ['es', 'en'];

const T = {
  es: {
    tabs: {
      home: 'Inicio',
      actions: 'Acciones',
      permissions: 'Permisos',
      duel: 'Duelo',
      profile: 'Perfil',
    },
    filters: {
      all: 'Todas',
      pending: 'Pendientes',
      approved: 'Aprobadas',
      rejected: 'Rechazadas',
    },
    status: { pending: 'Pendiente', approved: 'Aprobada', rejected: 'Rechazada' },
    welcome: {
      skip: 'Saltar',
      title: '¡Bienvenido a MariPuntos!',
      desc: 'Convierte tus rutinas diarias en un juego divertido con tu pareja. ¡Fortalece tu vínculo mientras completan tareas juntos!',
      next: 'Siguiente',
      haveAccount: '¿Ya tienes una cuenta? Inicia sesión',
    },
    home: {
      hola: 'Hola, María',
      sub: 'Vamos a ganar puntos hoy',
      pendingTitle: '2 pendientes por revisar',
      pendingSub: 'Responde acciones y permisos de tu pareja',
      quickActions: 'Acciones rápidas',
      requestPermission: 'Solicitar permiso',
      requestPermissionSub: 'Solicitar permiso para una actividad',
      logAction: 'Registrar acción',
      logActionSub: 'Registrar una actividad para ganar puntos',
      progressTitle: 'Tu progreso',
      seeAchievements: 'Ver logros',
      points: '1,250',
      streak: '5 sem',
      level: 'Nivel 5',
      recentHistory: 'Historial reciente',
      seeAll: 'Ver todo',
      items: {
        dinnerTitle: 'Cena romántica sorpresa',
        dinnerMeta: 'Hoy · Romance',
        dishesTitle: 'Lavé los platos',
        dishesMeta: 'Hoy · Hogar',
        permFriendsTitle: 'Permiso: salida con amigos',
        permFriendsMeta: 'Ayer · Permiso',
        dessertTitle: 'Compré su postre favorito',
        dessertMeta: 'Ayer · Detalles',
        streakBonusTitle: 'Bono de racha semanal',
        streakBonusMeta: 'Esta semana · Racha ×5',
      },
    },
    actions: {
      header: 'Acciones',
      segReceived: 'Recibidas',
      segSent: 'Enviadas',
      cards: {
        movieTitle: 'Cita de película en casa',
        movieMeta: 'Kevin · hace 2 h',
        breakfastTitle: 'Preparé el desayuno',
        breakfastMeta: 'Kevin · hoy, 8:15',
        dessertTitle: 'Compré su postre favorito',
        dessertMeta: 'Kevin · ayer',
        walkTitle: 'Caminata juntos al parque',
        walkMeta: 'Kevin · ayer',
        noteTitle: 'Nota de amor en el espejo',
        noteMeta: 'Kevin · lunes',
        groceriesTitle: 'Hice las compras de la semana',
        groceriesMeta: 'Kevin · lunes',
      },
    },
    permissions: {
      header: 'Permisos',
      segSent: 'Enviadas',
      segReceived: 'Recibidas',
      requestBtn: 'Solicitar permiso',
      cards: {
        fridayTitle: 'Salida con amigos el viernes',
        fridayMeta: 'Para: Kevin · vence en 2 días',
        gamingTitle: 'Tarde de videojuegos',
        gamingMeta: 'Para: Kevin · sábado',
        fishingTitle: 'Viaje de pesca el sábado',
        fishingMeta: 'Para: Kevin · próxima semana',
        concertTitle: 'Concierto con compañeros',
        concertMeta: 'Para: Kevin · este mes',
        matchTitle: 'Partido del domingo',
        matchMeta: 'Para: Kevin · domingo',
      },
    },
    duel: {
      header: 'Duelo',
      winning: 'Vas ganando',
      balanceSub: 'Saldo total acumulado',
      level5: 'Nivel 5',
      level4: 'Nivel 4',
      streakTitle: 'Racha de pareja: 5 semanas',
      streakSub: 'Completen una acción esta semana para mantenerla',
      weeklySummary: 'Resumen semanal',
      lastWeek: 'Semana pasada',
      twoWeeksAgo: 'Hace 2 semanas',
      threeWeeksAgo: 'Hace 3 semanas',
      friendlyTitle: 'Gane quien gane, ganan los dos',
      friendlySub: 'El duelo es amistoso: cada punto fortalece su vínculo',
    },
    achievements: {
      header: 'Logros',
      progressTitle: 'Tu progreso',
      progressSub: '8 de 12 logros',
      earned: 'Ganados',
      pending: 'Pendientes',
      total: 'Total',
      filters: { all: 'Todos', unlocked: 'Desbloqueados', locked: 'Bloqueados' },
      cards: {
        firstActionTitle: 'Primera acción',
        firstActionDesc: 'Completa tu primera acción en pareja',
        firstActionDate: 'Desbloqueado el 12 jul 2026',
        streak4Title: 'Racha de 4 semanas',
        streak4Desc: 'Mantengan la racha durante un mes',
        streak4Date: 'Desbloqueado el 5 jul 2026',
        level10Title: 'Nivel 10',
        level10Desc: 'Alcanza el nivel 10 sumando puntos',
        pointsTitle: '1,000 MariPuntos',
        pointsDesc: 'Acumula 1,000 puntos en total',
        pointsDate: 'Desbloqueado el 28 jun 2026',
        permsTitle: '50 permisos acordados',
        permsDesc: 'Acuerden 50 permisos entre los dos',
      },
    },
    history: {
      header: 'Historial',
      filters: { all: 'Todo', earned: 'Ganados', spent: 'Gastados' },
      today: 'Hoy',
      yesterday: 'Ayer',
      thisWeek: 'Esta semana',
      lastWeek: 'Semana pasada',
      items: {
        dinnerMeta: '19:30 · Romance',
        dishesMeta: '8:20 · Hogar',
        permApprovedMeta: 'Permiso aprobado',
        detailsMeta: 'Detalles',
        activitiesMeta: 'Actividades',
        streakMeta: 'Racha ×5',
        rewardMeta: 'Recompensa',
        achievementTitle: 'Logro: Racha de 4 semanas',
        breakfastMeta: 'Hogar',
        gamingPermTitle: 'Permiso: tarde de videojuegos',
        romanceMeta: 'Romance',
      },
    },
    profile: {
      header: 'Perfil',
      name: 'María Rodríguez',
      email: 'maria@ejemplo.com',
      linked: 'Vinculada con Kevin',
      points: 'MariPuntos',
      level: 'Nivel',
      streak: 'Racha',
      streakVal: '5 sem',
      menu: {
        history: 'Historial de puntos',
        achievements: 'Logros',
        notifications: 'Notificaciones',
        changePassword: 'Cambiar contraseña',
        unlink: 'Desvincular pareja',
        help: 'Centro de ayuda',
        privacy: 'Privacidad',
      },
      signOut: 'Cerrar sesión',
    },
    m: {
      s01: {
        headline: 'Gamifica tu <em>relación</em>',
        sub: 'Convierte la rutina diaria en un juego divertido para dos',
        float: ['+ amor', 'Nivel 5'],
      },
      s02: {
        headline: 'Todo en <em>un solo lugar</em>',
        sub: 'Puntos, rachas y pendientes de un vistazo',
        float: ['Racha ×5', '1,250 pts'],
      },
      s03: {
        headline: 'Gana puntos por <em>cada detalle</em>',
        sub: 'Registra acciones y tu pareja las aprueba',
        float: ['Aprobada', '+40 pts'],
      },
      s04: {
        headline: 'Permisos <em>sin discusiones</em>',
        sub: 'Solicita, acuerda y listo: cada permiso tiene su precio en puntos',
        float: ['Permiso', 'Acordado'],
      },
      s05: {
        headline: 'Un duelo <em>amistoso</em>',
        sub: '¿Quién suma más MariPuntos? Compitan con amor',
        float: ['56 – 44', 'VS'],
      },
      s06: {
        headline: 'Desbloqueen <em>logros juntos</em>',
        sub: 'Suban de nivel y celebren cada meta en pareja',
        float: ['8 / 12', '67%'],
      },
      s07: {
        headline: 'Historial <em>claro y justo</em>',
        sub: 'Cada punto ganado o gastado queda registrado para los dos',
        float: ['+50', '−30'],
      },
      s08: {
        headline: 'Su progreso, <em>siempre a mano</em>',
        sub: 'Nivel, saldo y racha de pareja en tu perfil',
        float: ['Nivel 5', '5 semanas'],
      },
    },
  },
  en: {
    tabs: {
      home: 'Home',
      actions: 'Actions',
      permissions: 'Permissions',
      duel: 'Duel',
      profile: 'Profile',
    },
    filters: {
      all: 'All',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
    },
    status: { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' },
    welcome: {
      skip: 'Skip',
      title: 'Welcome to MariPuntos!',
      desc: 'Turn your daily routines into a fun game with your partner. Strengthen your bond while you complete tasks together!',
      next: 'Next',
      haveAccount: 'Already have an account? Sign in',
    },
    home: {
      hola: 'Hi, María',
      sub: "Let's earn some points today",
      pendingTitle: '2 pending to review',
      pendingSub: "Respond to your partner's actions and permissions",
      quickActions: 'Quick actions',
      requestPermission: 'Request permission',
      requestPermissionSub: 'Request permission for an activity',
      logAction: 'Log action',
      logActionSub: 'Log an activity to earn points',
      progressTitle: 'Your progress',
      seeAchievements: 'See achievements',
      points: '1,250',
      streak: '5 wk',
      level: 'Level 5',
      recentHistory: 'Recent history',
      seeAll: 'See all',
      items: {
        dinnerTitle: 'Surprise romantic dinner',
        dinnerMeta: 'Today · Romantic',
        dishesTitle: 'Washed the dishes',
        dishesMeta: 'Today · Home',
        permFriendsTitle: 'Permission: hangout with friends',
        permFriendsMeta: 'Yesterday · Permission',
        dessertTitle: 'Bought their favorite dessert',
        dessertMeta: 'Yesterday · Gesture',
        streakBonusTitle: 'Weekly streak bonus',
        streakBonusMeta: 'This week · Streak ×5',
      },
    },
    actions: {
      header: 'Actions',
      segReceived: 'Received',
      segSent: 'Sent',
      cards: {
        movieTitle: 'Movie night at home',
        movieMeta: 'Kevin · 2h ago',
        breakfastTitle: 'Made breakfast',
        breakfastMeta: 'Kevin · today, 8:15',
        dessertTitle: 'Bought their favorite dessert',
        dessertMeta: 'Kevin · yesterday',
        walkTitle: 'Walk together in the park',
        walkMeta: 'Kevin · yesterday',
        noteTitle: 'Love note on the mirror',
        noteMeta: 'Kevin · Monday',
        groceriesTitle: 'Did the weekly grocery shopping',
        groceriesMeta: 'Kevin · Monday',
      },
    },
    permissions: {
      header: 'Permissions',
      segSent: 'Sent',
      segReceived: 'Received',
      requestBtn: 'Request permission',
      cards: {
        fridayTitle: 'Friday night out with friends',
        fridayMeta: 'For: Kevin · expires in 2 days',
        gamingTitle: 'Video game afternoon',
        gamingMeta: 'For: Kevin · Saturday',
        fishingTitle: 'Saturday fishing trip',
        fishingMeta: 'For: Kevin · next week',
        concertTitle: 'Concert with friends',
        concertMeta: 'For: Kevin · this month',
        matchTitle: 'Sunday game',
        matchMeta: 'For: Kevin · Sunday',
      },
    },
    duel: {
      header: 'Duel',
      winning: "You're winning",
      balanceSub: 'Total accumulated balance',
      level5: 'Level 5',
      level4: 'Level 4',
      streakTitle: 'Couple streak: 5 weeks',
      streakSub: 'Complete an action this week to keep it going',
      weeklySummary: 'Weekly summary',
      lastWeek: 'Last week',
      twoWeeksAgo: '2 weeks ago',
      threeWeeksAgo: '3 weeks ago',
      friendlyTitle: 'No matter who wins, you both win',
      friendlySub: 'The duel is all in good fun — every point strengthens your bond',
    },
    achievements: {
      header: 'Achievements',
      progressTitle: 'Your progress',
      progressSub: '8 of 12 achievements',
      earned: 'Earned',
      pending: 'Pending',
      total: 'Total',
      filters: { all: 'All', unlocked: 'Unlocked', locked: 'Locked' },
      cards: {
        firstActionTitle: 'First action',
        firstActionDesc: 'Complete your first action as a couple',
        firstActionDate: 'Unlocked on Jul 12, 2026',
        streak4Title: '4-week streak',
        streak4Desc: 'Keep the streak going for a month',
        streak4Date: 'Unlocked on Jul 5, 2026',
        level10Title: 'Level 10',
        level10Desc: 'Reach level 10 by earning points',
        pointsTitle: '1,000 MariPuntos',
        pointsDesc: 'Earn 1,000 points in total',
        pointsDate: 'Unlocked on Jun 28, 2026',
        permsTitle: '50 permissions agreed',
        permsDesc: 'Agree on 50 permissions together',
      },
    },
    history: {
      header: 'History',
      filters: { all: 'All', earned: 'Earned', spent: 'Spent' },
      today: 'Today',
      yesterday: 'Yesterday',
      thisWeek: 'This week',
      lastWeek: 'Last week',
      items: {
        dinnerMeta: '7:30 PM · Romantic',
        dishesMeta: '8:20 AM · Home',
        permApprovedMeta: 'Permission approved',
        detailsMeta: 'Gesture',
        activitiesMeta: 'Activities',
        streakMeta: 'Streak ×5',
        rewardMeta: 'Reward',
        achievementTitle: 'Achievement: 4-week streak',
        breakfastMeta: 'Home',
        gamingPermTitle: 'Permission: video game afternoon',
        romanceMeta: 'Romantic',
      },
    },
    profile: {
      header: 'Profile',
      name: 'María Rodríguez',
      email: 'maria@example.com',
      linked: 'Linked with Kevin',
      points: 'MariPuntos',
      level: 'Level',
      streak: 'Streak',
      streakVal: '5 wk',
      menu: {
        history: 'Points history',
        achievements: 'Achievements',
        notifications: 'Notifications',
        changePassword: 'Change password',
        unlink: 'Unlink partner',
        help: 'Help center',
        privacy: 'Privacy',
      },
      signOut: 'Sign out',
    },
    m: {
      s01: {
        headline: 'Gamify your <em>relationship</em>',
        sub: 'Turn everyday routines into a fun game for two',
        float: ['+ love', 'Level 5'],
      },
      s02: {
        headline: 'Everything in <em>one place</em>',
        sub: 'Points, streaks, and pending items at a glance',
        float: ['Streak ×5', '1,250 pts'],
      },
      s03: {
        headline: 'Earn points for <em>every little thing</em>',
        sub: 'Log actions and your partner approves them',
        float: ['Approved', '+40 pts'],
      },
      s04: {
        headline: 'Permissions <em>without arguments</em>',
        sub: 'Request, agree, done — every permission has its price in points',
        float: ['Permission', 'Agreed'],
      },
      s05: {
        headline: 'A friendly <em>duel</em>',
        sub: 'Who earns more MariPuntos? Compete with love',
        float: ['56 – 44', 'VS'],
      },
      s06: {
        headline: 'Unlock <em>achievements together</em>',
        sub: 'Level up and celebrate every milestone together',
        float: ['8 / 12', '67%'],
      },
      s07: {
        headline: 'A <em>clear, fair</em> history',
        sub: 'Every point earned or spent is recorded for both of you',
        float: ['+50', '−30'],
      },
      s08: {
        headline: 'Your progress, <em>always at hand</em>',
        sub: 'Level, balance, and couple streak in your profile',
        float: ['Level 5', '5 weeks'],
      },
    },
  },
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

function statusBar(tablet, showIsland = true) {
  if (tablet) {
    return `<div class="statusbar tablet-sb">
      <span class="sb-time">9:41</span>
      <span class="sb-right">${ic('cellular', 17, C.textPrimary)}${ic('wifi', 18, C.textPrimary)}${ic('battery-full', 24, C.textPrimary)}</span>
    </div>`;
  }
  return `<div class="statusbar">
    <span class="sb-time">9:41</span>
    ${showIsland ? '<div class="island"></div>' : ''}
    <span class="sb-right">${ic('cellular', 17, C.textPrimary)}${ic('wifi', 18, C.textPrimary)}${ic('battery-full', 24, C.textPrimary)}</span>
  </div>`;
}

function tabBar(activeKey, t) {
  const tabs = [
    ['home', t.tabs.home, 'home', 'home-outline'],
    ['actions', t.tabs.actions, 'checkmark-done-circle', 'checkmark-done-circle-outline'],
    ['permissions', t.tabs.permissions, 'hand-right', 'hand-right-outline'],
    ['duel', t.tabs.duel, 'stats-chart', 'stats-chart-outline'],
    ['profile', t.tabs.profile, 'person', 'person-outline'],
  ];
  const items = tabs
    .map(([key, label, on, off]) => {
      const isActive = key === activeKey;
      const color = isActive ? C.primary : C.gray400;
      return `<div class="tab"><span>${ic(isActive ? on : off, 26, color)}</span><span class="tab-label" style="color:${color}">${label}</span></div>`;
    })
    .join('');
  return `<div class="tabbar">${items}<div class="home-indicator"></div></div>`;
}

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

function screenWelcome(t) {
  return `
  <div class="app welcome">
    <div class="w-logo"><img src="file://${APP_ICON}" class="w-logo-img"/><span class="w-logo-txt">MariPuntos</span></div>
    <div class="w-skip">${t.welcome.skip}</div>
    <div class="w-hero">
      <div class="w-hero-circle">${ic('people', 130, C.primary)}</div>
    </div>
    <div class="w-copy">
      <div class="w-title">${t.welcome.title}</div>
      <div class="w-desc">${t.welcome.desc}</div>
    </div>
    <div class="w-dots"><span class="dot dot-on"></span><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
    <div class="btn-primary">${t.welcome.next}</div>
    <div class="btn-ghost">${t.welcome.haveAccount}</div>
  </div>`;
}

function screenHome(pad, t) {
  const h = t.home;
  return `
  <div class="app">
    <div class="h-header">
      <div class="h-left">
        ${avatar('M', 56, `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, 5)}
        <div class="h-greet"><div class="h-hola">${h.hola}</div><div class="h-sub">${h.sub}</div></div>
      </div>
      <div class="bell">${ic('notifications-outline', 26, C.textPrimary)}<div class="bell-badge">2</div></div>
    </div>

    <div class="card row-card" style="border-left:none">
      <div class="icon-sq" style="background:${C.warning}">${ic('notifications', 24, '#fff')}</div>
      <div class="rc-txt"><div class="rc-title">${h.pendingTitle}</div><div class="rc-sub">${h.pendingSub}</div></div>
      ${ic('chevron-forward', 20, C.gray400)}
    </div>

    <div class="section-title">${h.quickActions}</div>
    ${actionCard('hand-right-outline', C.accent, h.requestPermission, h.requestPermissionSub)}
    ${actionCard('add-circle-outline', C.primary, h.logAction, h.logActionSub)}

    <div class="section-head"><span class="section-title" style="margin:0">${h.progressTitle}</span><span class="see-all">${h.seeAchievements}</span></div>
    <div class="progress-row">
      <div class="compact-chip">${ic('trophy', 22, C.accent)}<span>${h.points}</span></div>
      <div class="compact-chip">${ic('flame', 22, C.streak)}<span>${h.streak}</span></div>
      <div class="compact-chip">${ic('trending-up', 22, C.primary)}<span>${h.level}</span></div>
    </div>

    <div class="section-head"><span class="section-title" style="margin:0">${h.recentHistory}</span><span class="see-all">${h.seeAll}</span></div>
    <div class="card" style="padding:0;overflow:hidden">
      ${historyItem('heart', C.rose, '#FFF1F2', h.items.dinnerTitle, h.items.dinnerMeta, '+50', true)}
      ${historyItem('restaurant', C.sky, '#F0F9FF', h.items.dishesTitle, h.items.dishesMeta, '+15', true)}
      ${historyItem('hand-right', C.amber, '#FFFBEB', h.items.permFriendsTitle, h.items.permFriendsMeta, '−30', false, !pad)}
      ${
        pad
          ? historyItem(
              'gift',
              C.violet,
              '#F5F3FF',
              h.items.dessertTitle,
              h.items.dessertMeta,
              '+25',
              true
            ) +
            historyItem(
              'flame',
              C.streak,
              '#FFF7ED',
              h.items.streakBonusTitle,
              h.items.streakBonusMeta,
              '+30',
              true,
              true
            )
          : ''
      }
    </div>
  </div>`;
}

function screenActions(pad, t) {
  const a = t.actions;
  return `
  <div class="app">
    <div class="scr-header">${a.header}</div>
    <div class="seg">
      <div class="seg-item seg-on">${a.segReceived}</div>
      <div class="seg-item">${a.segSent}</div>
    </div>
    <div class="chips">${chip(t.filters.all, true)}${chip(t.filters.pending)}${chip(t.filters.approved)}${chip(t.filters.rejected)}</div>

    <div class="card act-card">
      <div class="icon-rnd lg" style="background:#FFF1F2">${ic('film-outline', 26, C.rose)}</div>
      <div class="ac-txt">
        <div class="ac-top"><span class="ac-title">${a.cards.movieTitle}</span><span class="ac-pts" style="color:${C.primary}">+40</span></div>
        <div class="ac-sub">${a.cards.movieMeta}</div>
        <div class="ac-foot">${statusPill(t.status.pending, 'pending')}</div>
      </div>
    </div>

    <div class="card act-card">
      <div class="icon-rnd lg" style="background:#F0F9FF">${ic('cafe-outline', 26, C.sky)}</div>
      <div class="ac-txt">
        <div class="ac-top"><span class="ac-title">${a.cards.breakfastTitle}</span><span class="ac-pts" style="color:${C.primary}">+15</span></div>
        <div class="ac-sub">${a.cards.breakfastMeta}</div>
        <div class="ac-foot">${statusPill(t.status.approved, 'approved')}</div>
      </div>
    </div>

    <div class="card act-card">
      <div class="icon-rnd lg" style="background:#F5F3FF">${ic('gift-outline', 26, C.violet)}</div>
      <div class="ac-txt">
        <div class="ac-top"><span class="ac-title">${a.cards.dessertTitle}</span><span class="ac-pts" style="color:${C.primary}">+25</span></div>
        <div class="ac-sub">${a.cards.dessertMeta}</div>
        <div class="ac-foot">${statusPill(t.status.approved, 'approved')}</div>
      </div>
    </div>

    <div class="card act-card">
      <div class="icon-rnd lg" style="background:#FFFBEB">${ic('walk-outline', 26, C.amber)}</div>
      <div class="ac-txt">
        <div class="ac-top"><span class="ac-title">${a.cards.walkTitle}</span><span class="ac-pts" style="color:${C.primary}">+20</span></div>
        <div class="ac-sub">${a.cards.walkMeta}</div>
        <div class="ac-foot">${statusPill(t.status.approved, 'approved')}</div>
      </div>
    </div>

    ${
      pad
        ? `<div class="card act-card">
      <div class="icon-rnd lg" style="background:#FFF1F2">${ic('heart-outline', 26, C.rose)}</div>
      <div class="ac-txt">
        <div class="ac-top"><span class="ac-title">${a.cards.noteTitle}</span><span class="ac-pts" style="color:${C.primary}">+10</span></div>
        <div class="ac-sub">${a.cards.noteMeta}</div>
        <div class="ac-foot">${statusPill(t.status.approved, 'approved')}</div>
      </div>
    </div>
    <div class="card act-card">
      <div class="icon-rnd lg" style="background:#F0F9FF">${ic('cart-outline', 26, C.sky)}</div>
      <div class="ac-txt">
        <div class="ac-top"><span class="ac-title">${a.cards.groceriesTitle}</span><span class="ac-pts" style="color:${C.primary}">+30</span></div>
        <div class="ac-sub">${a.cards.groceriesMeta}</div>
        <div class="ac-foot">${statusPill(t.status.approved, 'approved')}</div>
      </div>
    </div>`
        : ''
    }
    <div class="fab">${ic('add', 30, '#fff')}</div>
  </div>`;
}

function screenPermissions(pad, t) {
  const p = t.permissions;
  return `
  <div class="app">
    <div class="scr-header">${p.header}</div>
    <div class="seg">
      <div class="seg-item seg-on">${p.segSent}</div>
      <div class="seg-item">${p.segReceived}</div>
    </div>
    <div class="chips">${chip(t.filters.all, true)}${chip(t.filters.pending)}${chip(t.filters.approved)}${chip(t.filters.rejected)}</div>

    <div class="card act-card">
      <div class="icon-rnd lg" style="background:${C.primaryTint}">${ic('beer-outline', 26, C.primary)}</div>
      <div class="ac-txt">
        <div class="ac-top"><span class="ac-title">${p.cards.fridayTitle}</span><span class="ac-pts" style="color:${C.error}">−30</span></div>
        <div class="ac-sub">${p.cards.fridayMeta}</div>
        <div class="ac-foot">${statusPill(t.status.pending, 'pending')}</div>
      </div>
    </div>

    <div class="card act-card">
      <div class="icon-rnd lg" style="background:${C.primaryTint}">${ic('game-controller-outline', 26, C.primary)}</div>
      <div class="ac-txt">
        <div class="ac-top"><span class="ac-title">${p.cards.gamingTitle}</span><span class="ac-pts" style="color:${C.error}">−20</span></div>
        <div class="ac-sub">${p.cards.gamingMeta}</div>
        <div class="ac-foot">${statusPill(t.status.approved, 'approved')}</div>
      </div>
    </div>

    <div class="card act-card">
      <div class="icon-rnd lg" style="background:${C.primaryTint}">${ic('fish-outline', 26, C.primary)}</div>
      <div class="ac-txt">
        <div class="ac-top"><span class="ac-title">${p.cards.fishingTitle}</span><span class="ac-pts" style="color:${C.error}">−50</span></div>
        <div class="ac-sub">${p.cards.fishingMeta}</div>
        <div class="ac-foot">${statusPill(t.status.approved, 'approved')}</div>
      </div>
    </div>

    ${
      pad
        ? `<div class="card act-card">
      <div class="icon-rnd lg" style="background:${C.primaryTint}">${ic('musical-notes-outline', 26, C.primary)}</div>
      <div class="ac-txt">
        <div class="ac-top"><span class="ac-title">${p.cards.concertTitle}</span><span class="ac-pts" style="color:${C.error}">−45</span></div>
        <div class="ac-sub">${p.cards.concertMeta}</div>
        <div class="ac-foot">${statusPill(t.status.rejected, 'rejected')}</div>
      </div>
    </div>
    <div class="card act-card">
      <div class="icon-rnd lg" style="background:${C.primaryTint}">${ic('football-outline', 26, C.primary)}</div>
      <div class="ac-txt">
        <div class="ac-top"><span class="ac-title">${p.cards.matchTitle}</span><span class="ac-pts" style="color:${C.error}">−25</span></div>
        <div class="ac-sub">${p.cards.matchMeta}</div>
        <div class="ac-foot">${statusPill(t.status.approved, 'approved')}</div>
      </div>
    </div>`
        : ''
    }
    <div class="btn-primary" style="margin-top:20px">${ic('hand-right-outline', 20, '#fff', 'margin-right:8px;vertical-align:-3px')}${p.requestBtn}</div>
  </div>`;
}

function screenDuel(pad, t) {
  const d = t.duel;
  return `
  <div class="app">
    <div class="scr-header">${d.header}</div>
    <div class="card" style="padding:28px 24px;text-align:center">
      <div class="d-title">${d.winning}</div>
      <div class="d-sub">${d.balanceSub}</div>
      <div class="d-vs">
        <div class="d-col">
          ${avatar('M', 84, `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`)}
          <div class="d-name">María</div>
          <div class="d-pts" style="color:${C.primary}">1,250</div>
          <div class="d-lvl">${d.level5}</div>
        </div>
        <div class="d-badge">VS</div>
        <div class="d-col">
          ${avatar('K', 84, `linear-gradient(135deg, ${C.love}, #F43F5E)`)}
          <div class="d-name">Kevin</div>
          <div class="d-pts" style="color:${C.love}">980</div>
          <div class="d-lvl">${d.level4}</div>
        </div>
      </div>
      <div class="d-bar"><div class="d-fill" style="width:56%"></div></div>
      <div class="d-labels"><span style="color:${C.primary}">56%</span><span style="color:${C.love}">44%</span></div>
    </div>

    <div class="card" style="margin-top:16px;display:flex;align-items:center;gap:14px">
      <div class="icon-rnd lg" style="background:#FFF7ED">${ic('flame', 26, C.streak)}</div>
      <div style="flex:1;text-align:left">
        <div class="rc-title">${d.streakTitle}</div>
        <div class="rc-sub">${d.streakSub}</div>
      </div>
    </div>
    <div class="section-title" style="margin-top:24px">${d.weeklySummary}</div>
    <div class="card" style="padding:0;overflow:hidden">
      ${historyItem('trophy', C.accent, '#FDF3E3', d.lastWeek, 'María 180 · Kevin 145', 'M', true)}
      ${historyItem('trophy', C.accent, '#FDF3E3', d.twoWeeksAgo, 'María 120 · Kevin 160', 'K', true)}
      ${historyItem('trophy', C.accent, '#FDF3E3', d.threeWeeksAgo, 'María 210 · Kevin 190', 'M', true, true)}
    </div>
    ${
      pad
        ? `<div class="card" style="display:flex;align-items:center;gap:14px">
      <div class="icon-rnd lg" style="background:#FFF1F2">${ic('heart', 26, C.love)}</div>
      <div style="flex:1;text-align:left">
        <div class="rc-title">${d.friendlyTitle}</div>
        <div class="rc-sub">${d.friendlySub}</div>
      </div>
    </div>`
        : ''
    }
  </div>`;
}

function screenAchievements(pad, t) {
  const ac = t.achievements;
  return `
  <div class="app">
    <div class="scr-header">${ac.header}</div>
    <div class="card">
      <div class="ach-head">
        <div><div class="rc-title" style="font-size:17px">${ac.progressTitle}</div><div class="rc-sub">${ac.progressSub}</div></div>
        <div class="pct-circle">67%</div>
      </div>
      <div class="pbar"><div class="pfill" style="width:67%;background:${C.accent}"></div></div>
      <div class="stats-row">
        <div class="mini">${ic('trophy', 20, C.accent)}<div class="mini-v">8</div><div class="mini-l">${ac.earned}</div></div>
        <div class="mini-div"></div>
        <div class="mini">${ic('hourglass-outline', 20, C.primary)}<div class="mini-v">4</div><div class="mini-l">${ac.pending}</div></div>
        <div class="mini-div"></div>
        <div class="mini">${ic('star', 20, C.warning)}<div class="mini-v">12</div><div class="mini-l">${ac.total}</div></div>
      </div>
    </div>

    <div class="chips" style="margin-top:16px">${chip(ac.filters.all, true)}${chip(ac.filters.unlocked)}${chip(ac.filters.locked)}</div>

    <div class="card ach-card">
      <div class="icon-sq" style="background:#FDF3E3">${ic('trophy', 26, C.accent)}</div>
      <div class="ac-txt">
        <div class="ac-top"><span class="ac-title">${ac.cards.firstActionTitle}</span>${ic('checkmark-circle', 18, C.success)}</div>
        <div class="ac-sub">${ac.cards.firstActionDesc}</div>
        <div class="ach-date">${ac.cards.firstActionDate}</div>
      </div>
    </div>

    <div class="card ach-card">
      <div class="icon-sq" style="background:#FDF3E3">${ic('flame', 26, C.accent)}</div>
      <div class="ac-txt">
        <div class="ac-top"><span class="ac-title">${ac.cards.streak4Title}</span>${ic('checkmark-circle', 18, C.success)}</div>
        <div class="ac-sub">${ac.cards.streak4Desc}</div>
        <div class="ach-date">${ac.cards.streak4Date}</div>
      </div>
    </div>

    <div class="card ach-card" style="opacity:.7">
      <div class="icon-sq" style="background:${C.gray100}">${ic('lock-closed', 24, C.gray400)}</div>
      <div class="ac-txt">
        <div class="ac-top"><span class="ac-title" style="color:${C.textSecondary}">${ac.cards.level10Title}</span></div>
        <div class="ac-sub">${ac.cards.level10Desc}</div>
        <div class="pbar" style="margin-top:8px;height:6px"><div class="pfill" style="width:50%;background:${C.primary}"></div></div>
        <div class="ach-prog">5 / 10</div>
      </div>
    </div>
    ${
      pad
        ? `<div class="card ach-card">
      <div class="icon-sq" style="background:#FDF3E3">${ic('star', 26, C.accent)}</div>
      <div class="ac-txt">
        <div class="ac-top"><span class="ac-title">${ac.cards.pointsTitle}</span>${ic('checkmark-circle', 18, C.success)}</div>
        <div class="ac-sub">${ac.cards.pointsDesc}</div>
        <div class="ach-date">${ac.cards.pointsDate}</div>
      </div>
    </div>
    <div class="card ach-card" style="opacity:.7">
      <div class="icon-sq" style="background:${C.gray100}">${ic('lock-closed', 24, C.gray400)}</div>
      <div class="ac-txt">
        <div class="ac-top"><span class="ac-title" style="color:${C.textSecondary}">${ac.cards.permsTitle}</span></div>
        <div class="ac-sub">${ac.cards.permsDesc}</div>
        <div class="pbar" style="margin-top:8px;height:6px"><div class="pfill" style="width:64%;background:${C.primary}"></div></div>
        <div class="ach-prog">32 / 50</div>
      </div>
    </div>`
        : ''
    }
  </div>`;
}

function screenHistory(pad, t) {
  const h = t.history;
  const i = h.items;
  return `
  <div class="app">
    <div class="scr-header" style="display:flex;align-items:center;gap:12px">${ic('arrow-back', 24, C.textPrimary)}<span>${h.header}</span></div>
    <div class="chips">${chip(h.filters.all, true)}${chip(h.filters.earned)}${chip(h.filters.spent)}</div>

    <div class="h-group">${h.today}</div>
    <div class="card" style="padding:0;overflow:hidden">
      ${historyItem('heart', C.rose, '#FFF1F2', t.home.items.dinnerTitle, i.dinnerMeta, '+50', true)}
      ${historyItem('restaurant', C.sky, '#F0F9FF', t.home.items.dishesTitle, i.dishesMeta, '+15', true, true)}
    </div>

    <div class="h-group">${h.yesterday}</div>
    <div class="card" style="padding:0;overflow:hidden">
      ${historyItem('hand-right', C.amber, '#FFFBEB', t.home.items.permFriendsTitle, i.permApprovedMeta, '−30', false)}
      ${historyItem('gift', C.violet, '#F5F3FF', t.home.items.dessertTitle, i.detailsMeta, '+25', true)}
      ${historyItem('walk', C.amber, '#FFFBEB', t.actions.cards.walkTitle, i.activitiesMeta, '+20', true, true)}
    </div>

    <div class="h-group">${h.thisWeek}</div>
    <div class="card" style="padding:0;overflow:hidden">
      ${historyItem('flame', C.streak, '#FFF7ED', t.home.items.streakBonusTitle, i.streakMeta, '+30', true)}
      ${historyItem('trophy', C.accent, '#FDF3E3', i.achievementTitle, i.rewardMeta, '+100', true, true)}
    </div>
    ${
      pad
        ? `<div class="h-group">${h.lastWeek}</div>
    <div class="card" style="padding:0;overflow:hidden">
      ${historyItem('cafe', C.sky, '#F0F9FF', t.actions.cards.breakfastTitle, i.breakfastMeta, '+15', true)}
      ${historyItem('game-controller', C.primary, C.primaryTint, i.gamingPermTitle, i.permApprovedMeta, '−20', false)}
      ${historyItem('heart', C.rose, '#FFF1F2', t.actions.cards.noteTitle, i.romanceMeta, '+10', true, true)}
    </div>`
        : ''
    }
  </div>`;
}

function screenProfile(pad, t) {
  const p = t.profile;
  return `
  <div class="app">
    <div class="scr-header">${p.header}</div>
    <div class="card" style="text-align:center;padding:28px 20px">
      ${avatar('M', 96, `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, 5)}
      <div class="p-name">${p.name}</div>
      <div class="p-mail">${p.email}</div>
      <div class="p-linked">${ic('heart', 16, C.love, 'margin-right:6px;vertical-align:-2px')}${p.linked}</div>
      <div class="stats-row" style="margin-top:20px">
        <div class="mini"><div class="mini-v" style="color:${C.primary}">1,250</div><div class="mini-l">${p.points}</div></div>
        <div class="mini-div"></div>
        <div class="mini"><div class="mini-v" style="color:${C.accent}">5</div><div class="mini-l">${p.level}</div></div>
        <div class="mini-div"></div>
        <div class="mini"><div class="mini-v" style="color:${C.streak}">${p.streakVal}</div><div class="mini-l">${p.streak}</div></div>
      </div>
    </div>

    <div class="card" style="padding:6px 0;margin-top:16px">
      <div class="menu-item">${ic('time-outline', 22, C.primary)}<span>${p.menu.history}</span>${ic('chevron-forward', 18, C.gray400)}</div>
      <div class="menu-item">${ic('trophy-outline', 22, C.primary)}<span>${p.menu.achievements}</span>${ic('chevron-forward', 18, C.gray400)}</div>
      <div class="menu-item">${ic('notifications-outline', 22, C.primary)}<span>${p.menu.notifications}</span>${ic('chevron-forward', 18, C.gray400)}</div>
      <div class="menu-item">${ic('key-outline', 22, C.primary)}<span>${p.menu.changePassword}</span>${ic('chevron-forward', 18, C.gray400)}</div>
      <div class="menu-item" style="border-bottom:none">${ic('unlink-outline', 22, C.textSecondary)}<span>${p.menu.unlink}</span>${ic('chevron-forward', 18, C.gray400)}</div>
    </div>

    ${
      pad
        ? `<div class="card" style="padding:6px 0;margin-top:16px">
      <div class="menu-item">${ic('help-circle-outline', 22, C.primary)}<span>${p.menu.help}</span>${ic('chevron-forward', 18, C.gray400)}</div>
      <div class="menu-item" style="border-bottom:none">${ic('shield-checkmark-outline', 22, C.primary)}<span>${p.menu.privacy}</span>${ic('chevron-forward', 18, C.gray400)}</div>
    </div>`
        : ''
    }
    <div class="btn-outline" style="margin-top:16px;color:${C.error};border-color:#FECACA">${p.signOut}</div>
  </div>`;
}

function buildShots(t) {
  const m = t.m;
  return [
    {
      id: '01-bienvenida',
      theme: 'dark',
      headline: m.s01.headline,
      sub: m.s01.sub,
      screen: () => screenWelcome(t),
      tab: null,
      float: [
        {
          icon: 'heart',
          color: C.love,
          text: m.s01.float[0],
          pos: 'left:-15%;top:16%',
          rot: -8,
        },
        {
          icon: 'trophy',
          color: C.accent,
          text: m.s01.float[1],
          pos: 'right:-16%;top:34%',
          rot: 6,
        },
      ],
    },
    {
      id: '02-inicio',
      theme: 'teal',
      headline: m.s02.headline,
      sub: m.s02.sub,
      screen: (pad) => screenHome(pad, t),
      tab: 'home',
      float: [
        {
          icon: 'flame',
          color: C.streak,
          text: m.s02.float[0],
          pos: 'left:-16%;top:24%',
          rot: -7,
        },
        {
          icon: 'trophy',
          color: C.accent,
          text: m.s02.float[1],
          pos: 'right:-17%;top:44%',
          rot: 5,
        },
      ],
    },
    {
      id: '03-acciones',
      theme: 'sky',
      headline: m.s03.headline,
      sub: m.s03.sub,
      screen: (pad) => screenActions(pad, t),
      tab: 'actions',
      float: [
        {
          icon: 'checkmark-circle',
          color: C.success,
          text: m.s03.float[0],
          pos: 'left:-16%;top:38%',
          rot: -6,
        },
        {
          icon: 'add-circle',
          color: C.primary,
          text: m.s03.float[1],
          pos: 'right:-16%;top:20%',
          rot: 7,
        },
      ],
    },
    {
      id: '04-permisos',
      theme: 'amber',
      headline: m.s04.headline,
      sub: m.s04.sub,
      screen: (pad) => screenPermissions(pad, t),
      tab: 'permissions',
      float: [
        {
          icon: 'hand-right',
          color: C.accent,
          text: m.s04.float[0],
          pos: 'left:-15%;top:22%',
          rot: -7,
        },
        {
          icon: 'checkmark-circle',
          color: C.success,
          text: m.s04.float[1],
          pos: 'right:-17%;top:42%',
          rot: 6,
        },
      ],
    },
    {
      id: '05-duelo',
      theme: 'rose',
      headline: m.s05.headline,
      sub: m.s05.sub,
      screen: (pad) => screenDuel(pad, t),
      tab: 'duel',
      float: [
        {
          icon: 'stats-chart',
          color: C.primary,
          text: m.s05.float[0],
          pos: 'left:-16%;top:40%',
          rot: -6,
        },
        {
          icon: 'heart',
          color: C.love,
          text: m.s05.float[1],
          pos: 'right:-15%;top:22%',
          rot: 8,
        },
      ],
    },
    {
      id: '06-logros',
      theme: 'amber',
      headline: m.s06.headline,
      sub: m.s06.sub,
      screen: (pad) => screenAchievements(pad, t),
      tab: 'home',
      float: [
        {
          icon: 'trophy',
          color: C.accent,
          text: m.s06.float[0],
          pos: 'left:-16%;top:20%',
          rot: -8,
        },
        {
          icon: 'star',
          color: C.warning,
          text: m.s06.float[1],
          pos: 'right:-15%;top:42%',
          rot: 6,
        },
      ],
    },
    {
      id: '07-historial',
      theme: 'teal',
      headline: m.s07.headline,
      sub: m.s07.sub,
      screen: (pad) => screenHistory(pad, t),
      tab: 'home',
      float: [
        {
          icon: 'add-circle',
          color: C.primary,
          text: m.s07.float[0],
          pos: 'left:-15%;top:30%',
          rot: -6,
        },
        {
          icon: 'remove-circle',
          color: C.error,
          text: m.s07.float[1],
          pos: 'right:-15%;top:48%',
          rot: 7,
        },
      ],
    },
    {
      id: '08-perfil',
      theme: 'stone',
      headline: m.s08.headline,
      sub: m.s08.sub,
      screen: (pad) => screenProfile(pad, t),
      tab: 'profile',
      float: [
        {
          icon: 'person',
          color: C.primary,
          text: m.s08.float[0],
          pos: 'left:-16%;top:26%',
          rot: -7,
        },
        {
          icon: 'flame',
          color: C.streak,
          text: m.s08.float[1],
          pos: 'right:-17%;top:44%',
          rot: 6,
        },
      ],
    },
  ];
}

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

function css(device) {
  const isPad = device === 'ipad';
  const H1 = isPad ? 120 : 104;
  const SUB = isPad ? 44 : 40;
  const BRAND = isPad ? 34 : 30;
  const screenZoom = isPad ? 1.32 : 1.98;
  const deviceRadius = isPad ? 66 : 96;
  const devicePadding = isPad ? 10 : 8;
  const deviceMidPadding = isPad ? 12 : 10;
  const deviceMidRadius = deviceRadius - devicePadding;
  const screenEffectiveRadius = deviceMidRadius - deviceMidPadding;
  const screenUnzoomedRadius = screenEffectiveRadius / screenZoom;
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

  /* ---- Device (matches PhoneMockup.astro on the website) ---- */
  .phone-glow { position:absolute; inset:${isPad ? -40 : -30}px; z-index:0;
    background:linear-gradient(120deg, rgba(15,118,110,.22), rgba(17,94,89,.22));
    border-radius:${isPad ? 100 : 140}px; filter:blur(${isPad ? 56 : 44}px); }
  .device { background:#111827; border-radius:${deviceRadius}px; padding:${devicePadding}px;
    box-shadow:0 40px 90px rgba(15,23,42,.28), 0 14px 32px rgba(15,23,42,.16);
    position:relative; z-index:1; }
  .device-mid { background:#1F2937; border-radius:${deviceMidRadius}px; padding:${deviceMidPadding}px; }
  .screen { background:${C.background}; overflow:hidden; position:relative;
    border-radius:${screenUnzoomedRadius}px;
    width:${isPad ? 1024 : 430}px; height:${isPad ? 1366 : 932}px; zoom:${screenZoom}; }

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

function page(shot, device, platform = 'ios') {
  const t = THEMES[shot.theme];
  const isPad = device === 'ipad';
  const showIsland = !(platform === 'android' && !isPad);
  const floats = (shot.float || [])
    .map(
      (f) =>
        `<div class="float-chip" style="${f.pos};transform:rotate(${f.rot}deg)">${ic(f.icon, isPad ? 40 : 36, f.color)}<span>${f.text}</span></div>`
    )
    .join('');
  const screenHtml = shot.screen(isPad);
  const tab = shot.tab ? tabBar(shot.tab, T[shot.locale || 'es']) : '';
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
      <div class="phone-glow"></div>
      <div class="device"><div class="device-mid"><div class="screen ${isPad ? 'tablet' : ''}">
        ${statusBar(isPad, showIsland)}
        ${screenHtml}
        ${tab}
      </div></div></div>
    </div>
  </div>
</div>
</body></html>`;
}

if (require.main === module) {
  let total = 0;
  for (const locale of LOCALES) {
    const localeDir = path.join(OUT_HTML, locale);
    fs.mkdirSync(localeDir, { recursive: true });
    const t = T[locale];
    const shots = buildShots(t).map((s) => ({ ...s, locale }));
    for (const shot of shots) {
      fs.writeFileSync(
        path.join(localeDir, `iphone-${shot.id}.html`),
        page(shot, 'iphone')
      );
      fs.writeFileSync(path.join(localeDir, `ipad-${shot.id}.html`), page(shot, 'ipad'));
      fs.writeFileSync(
        path.join(localeDir, `android-phone-${shot.id}.html`),
        page(shot, 'iphone', 'android')
      );
      total += 3;
    }
  }
  console.log(`Generated ${total} HTML files in ${OUT_HTML} (${LOCALES.join('/')})`);
}

module.exports = {
  css,
  statusBar,
  tabBar,
  screenWelcome,
  screenHome,
  screenActions,
  screenPermissions,
  screenDuel,
  screenAchievements,
  screenHistory,
  screenProfile,
  buildShots,
  T,
  LOCALES,
};
