import type { Metadata } from 'next';

import { AppShowcase } from '@/components/app-showcase';
import { BetaSignupForm } from '@/components/beta-signup-form';
import { FaqAccordion } from '@/components/faq-accordion';

export const metadata: Metadata = {
  title: 'MariPuntos - Gamifica tu Relación de Pareja',
  description:
    'Gamifica tu relación con MariPuntos. Solicita permisos, gana puntos por buenas acciones y mantén rachas semanales en pareja de forma divertida y organizada.',
  keywords: [
    'relación de pareja',
    'gamificación',
    'app para parejas',
    'puntos en pareja',
    'juego de pareja',
    'app gratis',
    'iOS',
    'Android',
  ],
  openGraph: {
    title: 'MariPuntos - Gamifica tu Relación de Pareja',
    description:
      'Convierte tu relación en el mejor juego. Gana puntos, solicita permisos y mantén rachas semanales.',
    type: 'website',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MariPuntos - Gamifica tu Relación de Pareja',
    description: 'Convierte tu relación en el mejor juego. Descárgala gratis.',
  },
};

function PhoneMockup({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative mx-auto" style={{ maxWidth: 240 }}>
      <div className="absolute -inset-6 bg-linear-to-r from-[#24C6B1]/20 to-[#1da896]/20 rounded-3xl blur-2xl" />
      <div className="relative bg-gray-900 rounded-[3rem] p-0.75 shadow-2xl">
        <div className="bg-gray-800 rounded-[2.9rem] p-1">
          <div className="bg-white rounded-[2.5rem] overflow-hidden">
            <img src={src} alt={alt} className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <div className="flex items-center gap-2">
              <img src="/icon.png" alt="MariPuntos" className="w-8 h-8 md:w-10 md:h-10" />
              <span className="text-xl md:text-2xl font-bold">
                <span className="text-[#24C6B1]">Mari</span>Puntos
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-gray-600 font-medium">
              <a href="#diferente" className="hover:text-[#24C6B1] transition-colors">
                Características
              </a>
              <a href="#como-funciona" className="hover:text-[#24C6B1] transition-colors">
                Cómo funciona
              </a>
              <a href="#faq" className="hover:text-[#24C6B1] transition-colors">
                FAQ
              </a>
            </div>
            <a
              href="https://apps.apple.com/app/id6758923865"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-[#24C6B1] text-white rounded-full font-semibold text-sm hover:bg-[#1da896] transition-all duration-300 hover:shadow-lg"
            >
              Descargar App
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <header className="relative overflow-hidden pt-24 md:pt-28 pb-20 md:pb-32 bg-linear-to-br from-[#E6F9F7] via-[#c8f4ef] to-[#a8ede6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-end">
            {/* Left */}
            <div className="pb-12 md:pb-16">
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white rounded-full shadow-sm border border-[#24C6B1]/20">
                <span className="w-2 h-2 bg-[#24C6B1] rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-[#24C6B1]">
                  Ya disponible en iOS y Android
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Gamifica tu
                <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-[#24C6B1] to-[#1da896]">
                  relación de pareja
                </span>
                <br />
                con MariPuntos
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
                Solicita permisos, gana puntos por buenas acciones y mantén rachas
                semanales. Tu relación, convertida en el mejor juego.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="https://apps.apple.com/app/id6758923865"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-6 py-3.5 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <img src="/apple.svg" alt="Apple" className="w-7 h-7 shrink-0" />
                  <div>
                    <div className="text-xs opacity-75">Download on the</div>
                    <div className="font-bold text-base leading-tight">App Store</div>
                  </div>
                </a>
                <a
                  href={`https://play.google.com/store/apps/details?id=com.maripuntos.app`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-6 py-3.5 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <img
                    src="/googleplay.svg"
                    alt="Google Play"
                    className="w-7 h-7 shrink-0"
                  />
                  <div>
                    <div className="text-xs opacity-75">Get it on</div>
                    <div className="font-bold text-base leading-tight">Google Play</div>
                  </div>
                </a>
              </div>
            </div>
            {/* Right - Phone */}
            <div className="flex justify-center pb-0">
              <div className="relative animate-float">
                <div className="absolute -inset-8 bg-linear-to-r from-[#24C6B1]/15 to-[#1da896]/15 rounded-full blur-3xl" />
                <div
                  className="relative bg-gray-900 rounded-[3rem] p-0.75 shadow-2xl"
                  style={{ maxWidth: 260 }}
                >
                  <div className="bg-gray-800 rounded-[2.9rem] p-1">
                    <div className="bg-white rounded-[2.5rem] overflow-hidden">
                      <img
                        src="/actions.png"
                        alt="MariPuntos App"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Waves */}
        <div className="absolute -bottom-52 left-0 right-0 leading-none">
          <svg
            className="w-full h-24 md:h-60"
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,70 C200,10 440,110 720,70 C1000,30 1260,100 1440,60 L1440,120 L0,120 Z"
              fill="white"
            />
          </svg>
        </div>
      </header>

      {/* ── Stats Bar ── */}
      {/* <section className="py-10 bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '10K+', label: 'Parejas registradas' },
              { value: '50K+', label: 'Acciones completadas' },
              { value: '100%', label: 'Gratis para siempre' },
              { value: 'iOS & Android', label: 'Disponible en ambas' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl md:text-3xl font-bold text-[#24C6B1]">
                  {stat.value}
                </div>
                <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* ── What Makes Different ── */}
      <section id="diferente" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-[#24C6B1] uppercase tracking-widest mb-3">
              Por qué elegirnos
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              ¿Qué hace diferente a <span className="text-[#24C6B1]">MariPuntos</span>?
            </h2>
            <div className="w-12 h-1 bg-[#24C6B1] rounded-full mx-auto mb-5" />
            <p className="text-gray-600 max-w-xl mx-auto">
              Más que una app, es un sistema de gamificación diseñado específicamente para
              parejas
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg
                    className="w-12 h-12 text-[#24C6B1]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                ),
                title: 'Sistema de Puntos Real',
                desc: 'Gana y gasta MariPuntos en tiempo real. Cada acción positiva se refleja al instante.',
              },
              {
                icon: (
                  <svg
                    className="w-12 h-12 text-orange-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                ),
                title: 'Permisos con Humor',
                desc: 'Solicita y aprueba permisos sin conflictos. Salidas, videojuegos y más, gestionados en pareja.',
              },
              {
                icon: (
                  <svg
                    className="w-12 h-12 text-purple-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
                    />
                  </svg>
                ),
                title: 'Rachas Semanales',
                desc: 'Mantén la motivación construyendo rachas semana a semana. ¿Cuántas semanas seguidas pueden llegar?',
              },
            ].map((card) => (
              <div
                key={card.title}
                className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="mb-6">{card.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{card.title}</h3>
                <p className="text-gray-600 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature 1: Actions ── */}
      <section className="py-16 md:py-24 bg-[#F5FFFE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Text */}
            <div>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                Gana puntos por buenas
                <br />
                acciones para tu pareja
              </h3>
              <p className="text-lg text-gray-500 mb-10 leading-relaxed">
                Completa acciones positivas y acumula MariPuntos. Desde preparar el
                desayuno hasta hacer un mandado, cada detalle suma.
              </p>
              <ul className="space-y-6 mb-10">
                {[
                  {
                    icon: (
                      <svg
                        className="w-5 h-5 text-[#24C6B1]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={1.8}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    ),
                    label: 'Acciones rápidas y verificadas',
                    desc: 'Completa tareas y gana puntos al instante, validados por tu pareja.',
                  },
                  {
                    icon: (
                      <svg
                        className="w-5 h-5 text-[#24C6B1]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={1.8}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                        />
                      </svg>
                    ),
                    label: 'Puntos personalizables por pareja',
                    desc: 'Definen juntos cuánto vale cada acción según sus propias reglas.',
                  },
                  {
                    icon: (
                      <svg
                        className="w-5 h-5 text-[#24C6B1]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={1.8}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    ),
                    label: 'Historial completo de actividades',
                    desc: 'Registra cada acción con fecha, puntos y estado de aprobación.',
                  },
                  {
                    icon: (
                      <svg
                        className="w-5 h-5 text-[#24C6B1]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={1.8}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                      </svg>
                    ),
                    label: 'Notificaciones en tiempo real',
                    desc: 'Recibe alertas inmediatas cuando tu pareja aprueba una acción.',
                  },
                ].map((item) => (
                  <li key={item.label} className="flex items-start gap-4">
                    <div className="w-11 h-11 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 leading-snug">
                        {item.label}
                      </p>
                      <p className="text-gray-500 text-sm mt-0.5 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            {/* Phone */}
            <div className="flex justify-center">
              <PhoneMockup src="/actions.png" alt="Pantalla de Acciones MariPuntos" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature 2: Permissions ── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Phone */}
            <div className="flex justify-center order-2 md:order-1">
              <PhoneMockup src="/permisos.png" alt="Pantalla de Permisos MariPuntos" />
            </div>
            {/* Text */}
            <div className="order-1 md:order-2">
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                Solicita permisos
                <br />
                usando tus puntos
              </h3>
              <p className="text-lg text-gray-500 mb-10 leading-relaxed">
                ¿Quieres salir con tus amigos o jugar videojuegos? Usa tus MariPuntos para
                gestionar todo en pareja, sin dramas.
              </p>
              <ul className="space-y-6 mb-10">
                {[
                  {
                    icon: (
                      <svg
                        className="w-5 h-5 text-purple-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={1.8}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    ),
                    label: 'Permisos 100% personalizables',
                    desc: 'Creen sus propios permisos según la dinámica de su relación.',
                  },
                  {
                    icon: (
                      <svg
                        className="w-5 h-5 text-purple-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={1.8}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    ),
                    label: 'Aprobación con un solo toque',
                    desc: 'Tu pareja aprueba o rechaza solicitudes en segundos desde la app.',
                  },
                  {
                    icon: (
                      <svg
                        className="w-5 h-5 text-purple-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={1.8}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 6h16M4 10h16M4 14h16M4 18h16"
                        />
                      </svg>
                    ),
                    label: 'Historial y seguimiento',
                    desc: 'Consulta permisos pasados, pendientes y aprobados en cualquier momento.',
                  },
                  {
                    icon: (
                      <svg
                        className="w-5 h-5 text-purple-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={1.8}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    ),
                    label: 'Costo de puntos configurable',
                    desc: 'Decidan juntos cuántos MariPuntos cuesta cada tipo de permiso.',
                  },
                ].map((item) => (
                  <li key={item.label} className="flex items-start gap-4">
                    <div className="w-11 h-11 bg-purple-50 rounded-xl border border-purple-100 shadow-sm flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 leading-snug">
                        {item.label}
                      </p>
                      <p className="text-gray-500 text-sm mt-0.5 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section
        id="como-funciona"
        className="py-16 md:py-24 bg-linear-to-br from-[#24C6B1] to-[#1da896] relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <p className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-3">
              Proceso simple
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              ¿Cómo funciona MariPuntos?
            </h2>
            <p className="text-white/80 text-lg max-w-xl mx-auto">
              Tres pasos para empezar a jugar en pareja
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start justify-center">
            {[
              {
                icon: (
                  <svg
                    className="w-16 h-16 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                ),
                title: 'Descarga la App',
                desc: 'Disponible gratis en App Store y Google Play. Sin suscripción ni tarjeta de crédito.',
              },
              {
                icon: (
                  <svg
                    className="w-16 h-16 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                ),
                title: 'Vincula tu Pareja',
                desc: 'Comparte tu código único con tu pareja y en segundos estarán conectados en la misma app.',
              },
              {
                icon: (
                  <svg
                    className="w-16 h-16 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ),
                title: 'Disfruta Jugando',
                desc: 'Completa acciones, solicita permisos y mantén la racha semana a semana juntos.',
              },
            ].map((step, i) => (
              <div
                key={step.title}
                className="flex flex-col md:flex-row items-center md:items-start"
              >
                <div className="text-center px-6 md:px-10 max-w-xs">
                  <div className="flex justify-center mb-6">{step.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-white/75 leading-relaxed text-base">{step.desc}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:flex items-start pt-6 text-white/40 shrink-0">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── App Showcase ── */}
      <AppShowcase />

      {/* ── Testimonials ── */}
      {/* <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-[#24C6B1] uppercase tracking-widest mb-3">
              Opiniones
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Lo que dicen las <span className="text-[#24C6B1]">parejas</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                stars: 5,
                quote:
                  '¡Desde que usamos MariPuntos, hacer mandados es una competencia! Nuestra relación nunca fue tan divertida.',
                name: 'Andrea & Luis',
                since: 'Pareja desde hace 3 años',
                initials: ['A', 'L'],
                colors: ['from-[#24C6B1] to-[#1da896]', 'from-pink-400 to-pink-500'],
              },
              {
                stars: 5,
                quote:
                  'Por fin puedo pedir permiso para los videojuegos sin dramas. Los puntos lo hacen todo más justo y transparente.',
                name: 'Carlos & María',
                since: 'Pareja desde hace 1 año',
                initials: ['C', 'M'],
                colors: ['from-blue-400 to-blue-500', 'from-purple-400 to-purple-500'],
              },
              {
                stars: 5,
                quote:
                  'La racha de 8 semanas nos tiene emocionados. Nos ayuda a recordar hacer cosas bonitas el uno por el otro.',
                name: 'José & Valeria',
                since: 'Pareja desde hace 2 años',
                initials: ['J', 'V'],
                colors: [
                  'from-orange-400 to-orange-500',
                  'from-yellow-400 to-yellow-500',
                ],
              },
            ].map((t) => (
              <div
                key={t.name}
                className="bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 italic mb-6 leading-relaxed">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {t.initials.map((initial, i) => (
                      <div
                        key={i}
                        className={`w-10 h-10 bg-linear-to-br ${t.colors[i]} rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-white`}
                      >
                        {initial}
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-gray-500 text-xs">{t.since}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* ── Download / Available ── */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold text-[#24C6B1] uppercase tracking-widest mb-3">
            Descarga
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            MariPuntos está disponible
            <br />
            <span className="text-[#24C6B1]">en todos tus dispositivos</span>
          </h2>
          <p className="text-gray-600 text-lg mb-10 max-w-xl mx-auto">
            Descarga gratis desde tu tienda favorita y empieza a jugar en pareja hoy mismo
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://apps.apple.com/app/id6758923865"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-4 px-8 py-4 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-all duration-300 hover:scale-105 shadow-xl"
            >
              <img src="/apple.svg" alt="Apple" className="w-8 h-8 shrink-0" />
              <div className="text-left">
                <div className="text-xs opacity-75">Download on the</div>
                <div className="font-bold text-xl leading-tight">App Store</div>
              </div>
            </a>
            <a
              href={`https://play.google.com/store/apps/details?id=com.maripuntos.app`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-4 px-8 py-4 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-all duration-300 hover:scale-105 shadow-xl"
            >
              <img src="/googleplay.svg" alt="Google Play" className="w-8 h-8 shrink-0" />
              <div className="text-left">
                <div className="text-xs opacity-75">Get it on</div>
                <div className="font-bold text-xl leading-tight">Google Play</div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-[#24C6B1] uppercase tracking-widest mb-3">
              Soporte
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Preguntas Frecuentes
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Todo lo que necesitas saber antes de descargar
            </p>
          </div>
          <FaqAccordion />
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className="py-16 md:py-20 bg-linear-to-br from-[#24C6B1] to-[#1da896] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Mantente al día</h2>
          <p className="text-white/80 text-lg mb-8">
            Suscríbete para recibir novedades, nuevas funciones y tips para parejas
          </p>
          <BetaSignupForm />
          <p className="text-white/60 text-sm mt-4">
            Sin spam. Solo lo mejor para tu relación.
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-12 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <img src="/icon.png" alt="MariPuntos" className="w-9 h-9" />
                <span className="text-2xl font-bold">
                  <span className="text-[#24C6B1]">Mari</span>Puntos
                </span>
              </div>
              <p className="text-gray-400 leading-relaxed max-w-sm">
                La app que convierte la vida en pareja en el mejor juego. Gana puntos,
                solicita permisos y mantén rachas semanales.
              </p>
              <div className="flex gap-3 mt-5">
                <a
                  href="https://apps.apple.com/app/id6758923865"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-sm"
                >
                  <img src="/apple.svg" alt="Apple" className="w-4 h-4" />
                  App Store
                </a>
                <a
                  href={`https://play.google.com/store/apps/details?id=com.maripuntos.app`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-sm"
                >
                  <img src="/googleplay.svg" alt="Google Play" className="w-4 h-4" />
                  Google Play
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">App</h4>
              <ul className="space-y-2">
                {[
                  { label: 'Características', href: '#diferente' },
                  { label: 'Cómo funciona', href: '#como-funciona' },
                  { label: 'Preguntas frecuentes', href: '#faq' },
                ].map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-[#24C6B1] transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">Legal</h4>
              <ul className="space-y-2">
                {[
                  { label: 'Privacidad', href: '/privacidad' },
                  { label: 'Términos y Condiciones', href: '/terminos' },
                  { label: 'Contacto', href: 'mailto:arias9068@gmail.com' },
                ].map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-[#24C6B1] transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              © 2026 MariPuntos. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
