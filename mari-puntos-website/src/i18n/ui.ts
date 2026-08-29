export const languages = { es: 'Español', en: 'English' } as const;

export const defaultLang = 'es';

export type Lang = keyof typeof languages;

export const ui = {
  es: {
    'lang.switchTo': 'English',
    'lang.selectorLabel': 'Selector de idioma',
    'nav.features': 'Características',
    'nav.howItWorks': 'Cómo funciona',
    'nav.faq': 'FAQ',
    'nav.download': 'Descargar App',

    'meta.title': 'MariPuntos - Gamifica tu Relación de Pareja',
    'meta.description':
      'Gamifica tu relación con MariPuntos. Solicita permisos, gana puntos por buenas acciones y mantén rachas semanales en pareja de forma divertida y organizada.',
    'meta.ogTitle': 'MariPuntos - Gamifica tu Relación de Pareja',
    'meta.ogDescription':
      'Convierte tu relación en el mejor juego. Gana puntos, solicita permisos y mantén rachas semanales.',
    'meta.twitterDescription':
      'Convierte tu relación en el mejor juego. Descárgala gratis.',

    'hero.badge': 'Ya disponible en iOS y Android',
    'hero.titleLine1': 'Gamifica tu',
    'hero.titleHighlight': 'relación de pareja',
    'hero.titleLine2': 'con MariPuntos',
    'hero.subtitle':
      'Solicita permisos, gana puntos por buenas acciones y mantén rachas semanales. Tu relación, convertida en el mejor juego.',
    'store.appStoreTop': 'Download on the',
    'store.appStore': 'App Store',
    'store.googlePlayTop': 'Get it on',
    'store.googlePlay': 'Google Play',
    'hero.phoneAlt': 'App MariPuntos',

    'different.eyebrow': 'Por qué elegirnos',
    'different.title': '¿Qué hace diferente a',
    'different.subtitle':
      'Más que una app, es un sistema de gamificación diseñado específicamente para parejas',
    'different.card1.title': 'Sistema de Puntos Real',
    'different.card1.desc':
      'Gana y gasta MariPuntos en tiempo real. Cada acción positiva se refleja al instante.',
    'different.card2.title': 'Permisos con Humor',
    'different.card2.desc':
      'Solicita y aprueba permisos sin conflictos. Salidas, videojuegos y más, gestionados en pareja.',
    'different.card3.title': 'Rachas Semanales',
    'different.card3.desc':
      'Mantén la motivación construyendo rachas semana a semana. ¿Cuántas semanas seguidas pueden llegar?',
    'different.card4.title': 'Logros y Niveles',
    'different.card4.desc':
      'Sube de nivel y desbloquea logros a medida que suman MariPuntos juntos como pareja.',

    'actions.title1': 'Gana puntos por buenas',
    'actions.title2': 'acciones para tu pareja',
    'actions.desc':
      'Completa acciones positivas y acumula MariPuntos. Desde preparar el desayuno hasta hacer un mandado, cada detalle suma.',
    'actions.feat1.label': 'Acciones rápidas y verificadas',
    'actions.feat1.desc':
      'Completa tareas y gana puntos al instante, validados por tu pareja.',
    'actions.feat2.label': 'Puntos personalizables por pareja',
    'actions.feat2.desc':
      'Definen juntos cuánto vale cada acción según sus propias reglas.',
    'actions.feat3.label': 'Historial completo de actividades',
    'actions.feat3.desc':
      'Registra cada acción con fecha, puntos y estado de aprobación.',
    'actions.feat4.label': 'Notificaciones en tiempo real',
    'actions.feat4.desc':
      'Recibe alertas inmediatas cuando tu pareja aprueba una acción.',
    'actions.phoneAlt': 'Pantalla de Acciones MariPuntos',

    'permissions.title1': 'Solicita permisos',
    'permissions.title2': 'usando tus puntos',
    'permissions.desc':
      '¿Quieres salir con tus amigos o jugar videojuegos? Usa tus MariPuntos para gestionar todo en pareja, sin dramas.',
    'permissions.feat1.label': 'Permisos 100% personalizables',
    'permissions.feat1.desc':
      'Creen sus propios permisos según la dinámica de su relación.',
    'permissions.feat2.label': 'Aprobación con un solo toque',
    'permissions.feat2.desc':
      'Tu pareja aprueba o rechaza solicitudes en segundos desde la app.',
    'permissions.feat3.label': 'Historial y seguimiento',
    'permissions.feat3.desc':
      'Consulta permisos pasados, pendientes y aprobados en cualquier momento.',
    'permissions.feat4.label': 'Costo de puntos configurable',
    'permissions.feat4.desc':
      'Decidan juntos cuántos MariPuntos cuesta cada tipo de permiso.',
    'permissions.phoneAlt': 'Pantalla de Permisos MariPuntos',

    'how.eyebrow': 'Proceso simple',
    'how.title': '¿Cómo funciona MariPuntos?',
    'how.subtitle': 'Tres pasos para empezar a jugar en pareja',
    'how.step1.title': 'Descarga la App',
    'how.step1.desc':
      'Disponible gratis en App Store y Google Play. Sin suscripción ni tarjeta de crédito.',
    'how.step2.title': 'Vincula tu Pareja',
    'how.step2.desc':
      'Comparte tu código único con tu pareja y en segundos estarán conectados en la misma app.',
    'how.step3.title': 'Disfruta Jugando',
    'how.step3.desc':
      'Completa acciones, solicita permisos y mantén la racha semana a semana juntos.',

    'showcase.eyebrow': 'Interfaz',
    'showcase.title1': 'Simple y ',
    'showcase.titleHighlight': 'Hermosa',
    'showcase.subtitle':
      'Diseñada para que tú y tu pareja la disfruten desde el primer día',
    'showcase.badge1.points': '+500 MariPuntos',
    'showcase.badge1.label': 'Acción aprobada',
    'showcase.badge2.label': 'Duelo activo',
    'showcase.screenActions': 'Acciones',
    'showcase.screenHome': 'Inicio',
    'showcase.screenDuel': 'Duelo',
    'showcase.pill1': 'Acciones con puntos',
    'showcase.pill2': 'Permisos en pareja',
    'showcase.pill3': 'Rachas semanales',
    'showcase.pill4': 'Duelo competitivo',
    'showcase.pill5': 'Notificaciones en tiempo real',

    'download.eyebrow': 'Descarga',
    'download.title1': 'MariPuntos está disponible',
    'download.title2': 'en todos tus dispositivos',
    'download.subtitle':
      'Descarga gratis desde tu tienda favorita y empieza a jugar en pareja hoy mismo',

    'faq.eyebrow': 'Soporte',
    'faq.title': 'Preguntas Frecuentes',
    'faq.subtitle': 'Todo lo que necesitas saber antes de descargar',
    'faq.q1.question': '¿Es gratis MariPuntos?',
    'faq.q1.answer':
      'Sí, MariPuntos es completamente gratis para descargar y usar. Sin cargos ocultos ni suscripciones obligatorias.',
    'faq.q2.question': '¿Cómo me vinculo con mi pareja?',
    'faq.q2.answer':
      'Después de crear tu cuenta, recibirás un código único. Compártelo con tu pareja y en segundos estarán conectados.',
    'faq.q3.question': '¿Qué son los MariPuntos?',
    'faq.q3.answer':
      'Son una moneda virtual que ganas al completar acciones positivas para tu pareja. Úsalos para solicitar permisos personalizados.',
    'faq.q4.question': '¿Puedo personalizar las acciones y permisos?',
    'faq.q4.answer':
      'Sí. Tanto tú como tu pareja pueden crear, editar y eliminar acciones y permisos completamente a su gusto.',
    'faq.q5.question': '¿Está disponible para iOS y Android?',
    'faq.q5.answer':
      'Sí, MariPuntos está disponible en App Store (iOS) y Google Play (Android). ¡Descárgala gratis hoy!',
    'faq.q6.question': '¿Qué son las rachas semanales?',
    'faq.q6.answer':
      'Las rachas cuentan cuántas semanas consecutivas ambos completaron al menos una acción juntos. ¡Compiten para no romper la racha!',
    'faq.q7.question': '¿Qué son los niveles y logros?',
    'faq.q7.answer':
      'A medida que suman MariPuntos, suben de nivel juntos y desbloquean logros que celebran su progreso como pareja.',

    'newsletter.title': 'Mantente al día',
    'newsletter.subtitle':
      'Suscríbete para recibir novedades, nuevas funciones y tips para parejas',
    'newsletter.disclaimer': 'Sin spam. Solo lo mejor para tu relación.',
    'form.emailPlaceholder': 'tu@email.com',
    'form.submit': 'Acceder',
    'form.submitting': 'Enviando...',

    'footer.tagline':
      'La app que convierte la vida en pareja en el mejor juego. Gana puntos, solicita permisos y mantén rachas semanales.',
    'footer.appHeading': 'App',
    'footer.legalHeading': 'Legal',
    'footer.link.features': 'Características',
    'footer.link.howItWorks': 'Cómo funciona',
    'footer.link.faq': 'Preguntas frecuentes',
    'footer.link.privacy': 'Privacidad',
    'footer.link.terms': 'Términos y Condiciones',
    'footer.link.contact': 'Contacto',
    'footer.rights': '© 2026 MariPuntos. Todos los derechos reservados.',

    'legal.backHome': 'Volver al inicio',
    'legal.lastUpdated': 'Última actualización:',
    'legal.terms.metaTitle': 'Términos de Servicio - MariPuntos',
    'legal.terms.metaDescription':
      'Términos de servicio de MariPuntos - Condiciones de uso de la aplicación.',
    'legal.terms.title': 'Términos de Servicio de MariPuntos',
    'legal.privacy.metaTitle': 'Política de Privacidad - MariPuntos',
    'legal.privacy.metaDescription':
      'Política de privacidad de MariPuntos - Cómo protegemos y usamos tus datos.',
    'legal.privacy.title': 'Política de Privacidad de MariPuntos',
    'legal.terms.updated': '28 de abril de 2026',
    'legal.privacy.updated': '19 de julio de 2026',

    'api.thanks': '¡Gracias! Te contactaremos pronto.',
    'api.emailRequired': 'Email es requerido',
    'api.emailInvalid': 'Email inválido',
    'api.rateLimited': 'Demasiados intentos. Intenta de nuevo en unos minutos.',
    'api.serverError': 'Error al procesar la solicitud. Por favor intenta de nuevo.',
  },
  en: {
    'lang.switchTo': 'Español',
    'lang.selectorLabel': 'Language selector',
    'nav.features': 'Features',
    'nav.howItWorks': 'How it works',
    'nav.faq': 'FAQ',
    'nav.download': 'Download App',

    'meta.title': 'MariPuntos - Gamify Your Relationship',
    'meta.description':
      'Gamify your relationship with MariPuntos. Request permissions, earn points for good deeds and keep weekly streaks together in a fun, organized way.',
    'meta.ogTitle': 'MariPuntos - Gamify Your Relationship',
    'meta.ogDescription':
      'Turn your relationship into the best game. Earn points, request permissions and keep weekly streaks.',
    'meta.twitterDescription':
      'Turn your relationship into the best game. Download it free.',

    'hero.badge': 'Now available on iOS and Android',
    'hero.titleLine1': 'Gamify your',
    'hero.titleHighlight': 'relationship',
    'hero.titleLine2': 'with MariPuntos',
    'hero.subtitle':
      'Request permissions, earn points for good deeds and keep weekly streaks. Your relationship, turned into the best game.',
    'store.appStoreTop': 'Download on the',
    'store.appStore': 'App Store',
    'store.googlePlayTop': 'Get it on',
    'store.googlePlay': 'Google Play',
    'hero.phoneAlt': 'MariPuntos app',

    'different.eyebrow': 'Why choose us',
    'different.title': 'What makes',
    'different.subtitle':
      'More than an app, it’s a gamification system designed specifically for couples',
    'different.card1.title': 'Real Points System',
    'different.card1.desc':
      'Earn and spend MariPuntos in real time. Every positive action shows up instantly.',
    'different.card2.title': 'Permissions with Humor',
    'different.card2.desc':
      'Request and approve permissions without conflict. Nights out, gaming and more, managed together.',
    'different.card3.title': 'Weekly Streaks',
    'different.card3.desc':
      'Stay motivated by building streaks week after week. How many weeks in a row can you reach?',
    'different.card4.title': 'Achievements and Levels',
    'different.card4.desc':
      'Level up and unlock achievements as you rack up MariPuntos together as a couple.',

    'actions.title1': 'Earn points for good',
    'actions.title2': 'deeds for your partner',
    'actions.desc':
      'Complete positive actions and rack up MariPuntos. From making breakfast to running an errand, every detail counts.',
    'actions.feat1.label': 'Fast, verified actions',
    'actions.feat1.desc':
      'Complete tasks and earn points instantly, validated by your partner.',
    'actions.feat2.label': 'Points customizable per couple',
    'actions.feat2.desc':
      'You decide together how much each action is worth by your own rules.',
    'actions.feat3.label': 'Full activity history',
    'actions.feat3.desc': 'Every action logged with date, points and approval status.',
    'actions.feat4.label': 'Real-time notifications',
    'actions.feat4.desc': 'Get instant alerts when your partner approves an action.',
    'actions.phoneAlt': 'MariPuntos Actions screen',

    'permissions.title1': 'Request permissions',
    'permissions.title2': 'using your points',
    'permissions.desc':
      'Want to go out with friends or play video games? Use your MariPuntos to manage it all together, drama-free.',
    'permissions.feat1.label': '100% customizable permissions',
    'permissions.feat1.desc':
      'Create your own permissions to match how your relationship works.',
    'permissions.feat2.label': 'One-tap approval',
    'permissions.feat2.desc':
      'Your partner approves or rejects requests in seconds from the app.',
    'permissions.feat3.label': 'History and tracking',
    'permissions.feat3.desc': 'Check past, pending and approved permissions any time.',
    'permissions.feat4.label': 'Configurable point cost',
    'permissions.feat4.desc':
      'Decide together how many MariPuntos each type of permission costs.',
    'permissions.phoneAlt': 'MariPuntos Permissions screen',

    'how.eyebrow': 'Simple process',
    'how.title': 'How does MariPuntos work?',
    'how.subtitle': 'Three steps to start playing as a couple',
    'how.step1.title': 'Download the App',
    'how.step1.desc':
      'Free on the App Store and Google Play. No subscription, no credit card.',
    'how.step2.title': 'Link Your Partner',
    'how.step2.desc':
      'Share your unique code with your partner and you’ll be connected in the same app in seconds.',
    'how.step3.title': 'Enjoy Playing',
    'how.step3.desc':
      'Complete actions, request permissions and keep the streak going week after week together.',

    'showcase.eyebrow': 'Interface',
    'showcase.title1': 'Simple and ',
    'showcase.titleHighlight': 'Beautiful',
    'showcase.subtitle': 'Designed so you and your partner enjoy it from day one',
    'showcase.badge1.points': '+500 MariPuntos',
    'showcase.badge1.label': 'Action approved',
    'showcase.badge2.label': 'Duel active',
    'showcase.screenActions': 'Actions',
    'showcase.screenHome': 'Home',
    'showcase.screenDuel': 'Duel',
    'showcase.pill1': 'Actions with points',
    'showcase.pill2': 'Permissions as a couple',
    'showcase.pill3': 'Weekly streaks',
    'showcase.pill4': 'Competitive duel',
    'showcase.pill5': 'Real-time notifications',

    'download.eyebrow': 'Download',
    'download.title1': 'MariPuntos is available',
    'download.title2': 'on all your devices',
    'download.subtitle':
      'Download it free from your favorite store and start playing as a couple today',

    'faq.eyebrow': 'Support',
    'faq.title': 'Frequently Asked Questions',
    'faq.subtitle': 'Everything you need to know before downloading',
    'faq.q1.question': 'Is MariPuntos free?',
    'faq.q1.answer':
      'Yes, MariPuntos is completely free to download and use. No hidden charges or mandatory subscriptions.',
    'faq.q2.question': 'How do I link with my partner?',
    'faq.q2.answer':
      'After creating your account you’ll get a unique code. Share it with your partner and you’ll be connected in seconds.',
    'faq.q3.question': 'What are MariPuntos?',
    'faq.q3.answer':
      'They’re a virtual currency you earn by completing positive actions for your partner. Use them to request custom permissions.',
    'faq.q4.question': 'Can I customize actions and permissions?',
    'faq.q4.answer':
      'Yes. Both you and your partner can create, edit and delete actions and permissions entirely as you like.',
    'faq.q5.question': 'Is it available for iOS and Android?',
    'faq.q5.answer':
      'Yes, MariPuntos is available on the App Store (iOS) and Google Play (Android). Download it free today!',
    'faq.q6.question': 'What are weekly streaks?',
    'faq.q6.answer':
      'Streaks count how many consecutive weeks you both completed at least one action together. Compete to keep the streak alive!',
    'faq.q7.question': 'What are levels and achievements?',
    'faq.q7.answer':
      'As you rack up MariPuntos, you level up together and unlock achievements that celebrate your progress as a couple.',

    'newsletter.title': 'Stay up to date',
    'newsletter.subtitle': 'Subscribe to get news, new features and tips for couples',
    'newsletter.disclaimer': 'No spam. Just the best for your relationship.',
    'form.emailPlaceholder': 'you@email.com',
    'form.submit': 'Get access',
    'form.submitting': 'Sending...',

    'footer.tagline':
      'The app that turns life as a couple into the best game. Earn points, request permissions and keep weekly streaks.',
    'footer.appHeading': 'App',
    'footer.legalHeading': 'Legal',
    'footer.link.features': 'Features',
    'footer.link.howItWorks': 'How it works',
    'footer.link.faq': 'FAQ',
    'footer.link.privacy': 'Privacy',
    'footer.link.terms': 'Terms & Conditions',
    'footer.link.contact': 'Contact',
    'footer.rights': '© 2026 MariPuntos. All rights reserved.',

    'legal.backHome': 'Back to home',
    'legal.lastUpdated': 'Last updated:',
    'legal.terms.metaTitle': 'Terms of Service - MariPuntos',
    'legal.terms.metaDescription':
      'MariPuntos terms of service - conditions for using the app.',
    'legal.terms.title': 'MariPuntos Terms of Service',
    'legal.privacy.metaTitle': 'Privacy Policy - MariPuntos',
    'legal.privacy.metaDescription':
      'MariPuntos privacy policy - how we protect and use your data.',
    'legal.privacy.title': 'MariPuntos Privacy Policy',
    'legal.terms.updated': 'April 28, 2026',
    'legal.privacy.updated': 'July 19, 2026',

    'api.thanks': 'Thanks! We’ll be in touch soon.',
    'api.emailRequired': 'Email is required',
    'api.emailInvalid': 'Invalid email',
    'api.rateLimited': 'Too many attempts. Try again in a few minutes.',
    'api.serverError': 'Error processing the request. Please try again.',
  },
} as const;

export function getLangFromUrl(url: URL): Lang {
  const [, segment] = url.pathname.split('/');
  if (segment in ui) return segment as Lang;
  return defaultLang;
}

export function useTranslations(lang: Lang) {
  return function t(key: keyof (typeof ui)['es']): string {
    return ui[lang][key] ?? ui[defaultLang][key];
  };
}

export function localizePath(path: string, lang: Lang): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return lang === defaultLang ? clean : `/${lang}${clean === '/' ? '' : clean}`;
}
