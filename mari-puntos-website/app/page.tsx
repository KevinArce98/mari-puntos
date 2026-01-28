import { BetaSignupForm } from '@/components/beta-signup-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MariPuntos - Gamifica tu Relación de Pareja',
  description:
    'Gamifica tu relación con MariPuntos. Solicita permisos, gana puntos por buenas acciones y canjea recompensas en pareja de forma divertida y organizada.',
  keywords: [
    'relación de pareja',
    'gamificación',
    'app para parejas',
    'puntos en pareja',
    'juego de pareja',
    'beta privada',
  ],
  openGraph: {
    title: 'MariPuntos - Gamifica tu Relación de Pareja',
    description:
      'Convierte tu relación en el mejor juego. Únete a nuestra Beta Privada y obtén acceso anticipado.',
    type: 'website',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MariPuntos - Gamifica tu Relación de Pareja',
    description: 'Convierte tu relación en el mejor juego. Únete a nuestra Beta Privada.',
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <div className="flex items-center gap-2">
              <img src="/icon.png" alt="MariPuntos" className="w-8 h-8 md:w-10 md:h-10" />
              <span className="text-xl md:text-2xl font-bold">
                <span className="text-[#24C6B1]">Mari</span>Puntos
              </span>
              <span className="ml-2 px-2 py-0.5 bg-yellow-400 text-xs font-bold rounded-full">
                BETA
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative overflow-hidden pt-24 md:pt-32 pb-12 md:pb-20 bg-linear-to-b from-[#E6F9F7] via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-down">
            <div className="inline-block mb-6 px-4 py-2 bg-linear-to-r from-[#24C6B1]/10 to-[#1da896]/10 rounded-full">
              <span className="text-sm md:text-base font-semibold text-[#24C6B1]">
                ⚡ BETA PRIVADA
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Convierte tu relación
              <br />
              en el{' '}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[#24C6B1] to-[#1da896]">
                mejor juego
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              MariPuntos es la app que gamifica la dinámica de pareja: solicita permisos,
              suma puntos por buenas acciones y canjea recompensas en un sistema claro,
              divertido y sin conflictos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <a
                href="#beta"
                className="w-full sm:w-auto px-8 py-4 bg-[#24C6B1] text-white rounded-full font-semibold text-lg hover:bg-[#1da896] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Únete a la Beta Privada
              </a>
              <a
                href="#como-funciona"
                className="w-full sm:w-auto px-8 py-4 bg-white text-[#24C6B1] border-2 border-[#24C6B1] rounded-full font-semibold text-lg hover:bg-[#24C6B1] hover:text-white transition-all duration-300 transform hover:scale-105"
              >
                Ver Características
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* How It Works Section */}
      <section id="como-funciona" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              ¿Cómo Funciona <span className="text-[#24C6B1]">MariPuntos</span>?
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Tres pasos para ganar en pareja
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {/* Step 1 */}
            <div className="relative h-full">
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-linear-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg z-10">
                1
              </div>
              <div className="bg-linear-to-br from-[#E6F9F7] to-white p-8 pt-12 rounded-3xl border-2 border-[#24C6B1]/20 hover:border-[#24C6B1] transition-all duration-300 h-full flex flex-col">
                <div className="w-20 h-20 bg-linear-to-br from-[#24C6B1] to-[#1da896] rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 text-center">
                  Define tu Perfil
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Completa tareas diarias, como preparar desayunos o hacer mandados para
                  acumular puntos
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative h-full">
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-linear-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg z-10">
                2
              </div>
              <div className="bg-linear-to-br from-[#E6F9F7] to-white p-8 pt-12 rounded-3xl border-2 border-[#24C6B1]/20 hover:border-[#24C6B1] transition-all duration-300 h-full flex flex-col">
                <div className="w-20 h-20 bg-linear-to-br from-[#24C6B1] to-[#1da896] rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 text-center">
                  Pide Permisos
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Quieres salir con tus amigos? Solicita permisos de videojuegos o salidas
                  personalizadas
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative h-full">
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-linear-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg z-10">
                3
              </div>
              <div className="bg-linear-to-br from-[#E6F9F7] to-white p-8 pt-12 rounded-3xl border-2 border-[#24C6B1]/20 hover:border-[#24C6B1] transition-all duration-300 h-full flex flex-col">
                <div className="w-20 h-20 bg-linear-to-br from-[#24C6B1] to-[#1da896] rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 text-center">
                  Gana Recompensas
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Intercambia tus puntos por recompensas que tú y tu pareja hayan
                  personalizado
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features with Screenshots Section */}
      <section className="py-16 md:py-24 bg-linear-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Feature 1: Evaluate Action */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="order-2 md:order-1">
              <div className="inline-block mb-4 px-4 py-2 bg-yellow-100 rounded-full">
                <span className="text-sm font-bold text-yellow-800">🎯 ACCIÓN</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Evalúa Acción
              </h3>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Completa acciones positivas juntos para fortalecer su relación y acumular
                MariPuntos
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-[#24C6B1] shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700">Acciones rápidas validadas</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-[#24C6B1] shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700">Sistema de puntos personalizado</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-[#24C6B1] shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700">Historial de actividades</span>
                </li>
              </ul>
            </div>
            <div className="order-1 md:order-2 flex justify-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-linear-to-r from-[#24C6B1]/20 to-[#1da896]/20 rounded-3xl blur-2xl"></div>
                <div className="relative bg-gray-100 rounded-[3rem] p-3 shadow-2xl max-w-75">
                  <div className="bg-white rounded-[2.5rem] overflow-hidden">
                    <img
                      src="/actions.png"
                      alt="Evalúa Acción MariPuntos"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: Permisos */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-linear-to-r from-[#24C6B1]/20 to-[#1da896]/20 rounded-3xl blur-2xl"></div>
                <div className="relative bg-gray-100 rounded-[3rem] p-3 shadow-2xl max-w-75">
                  <div className="bg-white rounded-[2.5rem] overflow-hidden">
                    <img
                      src="/permisos.png"
                      alt="Sistema de Permisos MariPuntos"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="inline-block mb-4 px-4 py-2 bg-purple-100 rounded-full">
                <span className="text-sm font-bold text-purple-800">🎮 PERMISOS</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Solicita Permisos
              </h3>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                ¿Quieres salir con tus amigos o jugar videojuegos? Usa tus puntos para
                solicitar permisos personalizados
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-[#24C6B1] shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700">
                    Permisos personalizables por pareja
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-[#24C6B1] shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700">Sistema de aprobación automática</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-[#24C6B1] shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700">
                    Historial y seguimiento de permisos
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {/* <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Lo que dicen los <span className="text-[#24C6B1]">novios</span>
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl">
              <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-linear-to-br from-[#24C6B1] to-[#1da896] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    A
                  </div>
                  <div className="w-16 h-16 bg-linear-to-br from-pink-400 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    L
                  </div>
                </div>
                <div className="text-center md:text-left">
                  <h4 className="text-xl font-bold text-gray-900">Ana & Luis</h4>
                  <p className="text-gray-600">Pareja desde hace 3 años</p>
                </div>
              </div>
              <blockquote className="text-lg md:text-xl text-gray-700 italic leading-relaxed text-center">
                "¡Desde que usamos{' '}
                <span className="font-bold text-[#24C6B1]">MariPuntos</span>, dejar los
                platos ahora es competencia! Nuestra relación nunca fue tan divertida y
                organizada al mismo tiempo. ¡No tuve diversión! 😊"
              </blockquote>
            </div>
          </div>
        </div>
      </section> */}

      {/* Beta CTA Section */}
      <section
        id="beta"
        className="py-16 md:py-24 bg-linear-to-br from-[#24C6B1] to-[#1da896] text-white relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Sé de los primeros
            <br />
            en probarlo
          </h2>
          <p className="text-lg md:text-xl mb-8 opacity-90 leading-relaxed">
            Mejora tu relación con el poder del juego. Únete a nuestra Beta Privada y
            obtén acceso anticipado
          </p>

          <BetaSignupForm />

          <div className="flex items-center justify-center gap-2 text-sm opacity-75">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>Personalización 100% Gratis Para Beta Testers</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/icon.png" alt="MariPuntos" className="w-8 h-8" />
                <span className="text-xl font-bold">
                  <span className="text-[#24C6B1]">Mari</span>Puntos
                </span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                La app que gamifica la vida en pareja de una forma divertida
              </p>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">Beta Success</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#beta"
                    className="text-gray-400 hover:text-[#24C6B1] transition-colors"
                  >
                    Únete a la Beta
                  </a>
                </li>
                <li>
                  <a
                    href="#como-funciona"
                    className="text-gray-400 hover:text-[#24C6B1] transition-colors"
                  >
                    Cómo funciona
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:arias9068@gmail.com"
                    className="text-gray-400 hover:text-[#24C6B1] transition-colors"
                  >
                    Contacto
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="/privacidad"
                    className="text-gray-400 hover:text-[#24C6B1] transition-colors"
                  >
                    Privacidad
                  </a>
                </li>
                <li>
                  <a
                    href="/terminos"
                    className="text-gray-400 hover:text-[#24C6B1] transition-colors"
                  >
                    Términos y Condiciones
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400 text-sm mb-4">
              © 2026 MariPuntos. Todos los derechos reservados.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <span>Hecho con</span>
              <svg
                className="w-4 h-4 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clipRule="evenodd"
                />
              </svg>
              <span>y mucho ☕ by MariPuntos Team</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
