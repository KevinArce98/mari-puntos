export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-b from-[#E6F4FE] to-white">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          <div className="animate-fade-in-down">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
              💑 <span className="text-[#24C6B1]">Mari</span>Puntos
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Gamifica los permisos en tu relación de pareja
            </p>
            <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
              Transforma la dinámica de tu relación en una experiencia divertida. Gana
              puntos, solicita permisos, canjea recompensas y desbloquea logros junto a tu
              pareja.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="#features"
                className="px-8 py-4 bg-[#24C6B1] text-white rounded-full font-semibold text-lg hover:bg-[#188F7F] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover:cursor-pointer"
              >
                Descubre Más
              </a>
              <a
                href="#download"
                className="px-8 py-4 bg-white text-[#24C6B1] border-2 border-[#24C6B1] rounded-full font-semibold text-lg hover:bg-[#24C6B1] hover:text-white transition-all duration-300 transform hover:scale-105 hover:cursor-pointer"
              >
                Descargar App
              </a>
            </div>
          </div>

          {/* Animated shapes */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-[#FFD700] rounded-full opacity-20 animate-float"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-[#24C6B1] rounded-full opacity-10 animate-float-delayed"></div>
          <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-[#EC4899] rounded-full opacity-15 animate-pulse"></div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">✨ Características</h2>
            <p className="text-xl text-gray-600">
              Todo lo que necesitas para una relación más divertida
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-linear-to-br from-[#E6F4FE] to-white hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-slide-in-left">
              <div className="text-5xl mb-4">🎮</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Sistema de Puntos</h3>
              <p className="text-gray-600">
                Gana MariPuntos completando acciones. Sube de nivel y desbloquea logros
                especiales.
              </p>
            </div>

            {/* Feature 2 */}
            <div
              className="p-6 rounded-2xl bg-linear-to-br from-[#FFE6F0] to-white hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-slide-in-left"
              style={{ animationDelay: '0.1s' }}
            >
              <div className="text-5xl mb-4">🤝</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Gestión de Permisos
              </h3>
              <p className="text-gray-600">
                Solicita y gestiona permisos de forma organizada. Recibe notificaciones en
                tiempo real.
              </p>
            </div>

            {/* Feature 3 */}
            <div
              className="p-6 rounded-2xl bg-linear-to-br from-[#FFF4E6] to-white hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-slide-in-left"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="text-5xl mb-4">🎁</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Recompensas</h3>
              <p className="text-gray-600">
                Canjea tus puntos por recompensas: experiencias, regalos, privilegios y
                más.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-linear-to-br from-[#F0E6FF] to-white hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-slide-in-right">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Acciones Variadas</h3>
              <p className="text-gray-600">
                Completa tareas en múltiples categorías: salidas, compras, tiempo y
                actividades.
              </p>
            </div>

            {/* Feature 5 */}
            <div
              className="p-6 rounded-2xl bg-linear-to-br from-[#E6FFF4] to-white hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-slide-in-right"
              style={{ animationDelay: '0.1s' }}
            >
              <div className="text-5xl mb-4">👥</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Vinculación de Pareja
              </h3>
              <p className="text-gray-600">
                Conecta tu cuenta con tu pareja mediante un código único y seguro.
              </p>
            </div>

            {/* Feature 6 */}
            <div
              className="p-6 rounded-2xl bg-linear-to-br from-[#FFE6E6] to-white hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-slide-in-right"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Estadísticas</h3>
              <p className="text-gray-600">
                Visualiza tu progreso, nivel actual y el de tu pareja en tiempo real.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-linear-to-b from-white to-[#E6F4FE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">🚀 ¿Cómo Funciona?</h2>
            <p className="text-xl text-gray-600">Tres pasos sencillos para comenzar</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center animate-slide-in-bottom">
              <div className="w-20 h-20 bg-[#24C6B1] text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                1
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Regístrate</h3>
              <p className="text-gray-600">
                Crea tu cuenta y vincula a tu pareja con un código único
              </p>
            </div>

            <div
              className="text-center animate-slide-in-bottom"
              style={{ animationDelay: '0.1s' }}
            >
              <div className="w-20 h-20 bg-[#24C6B1] text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                2
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Gana Puntos</h3>
              <p className="text-gray-600">
                Completa acciones y tareas para acumular MariPuntos
              </p>
            </div>

            <div
              className="text-center animate-slide-in-bottom"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="w-20 h-20 bg-[#24C6B1] text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                3
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Canjea</h3>
              <p className="text-gray-600">
                Usa tus puntos para obtener recompensas y permisos especiales
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section id="download" className="py-20 bg-[#24C6B1] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              📱 Descarga MariPuntos
            </h2>
            <p className="text-xl mb-12 max-w-2xl mx-auto opacity-90">
              Disponible próximamente en iOS y Android
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="px-8 py-4 bg-white text-gray-800 rounded-full font-semibold text-lg flex items-center gap-3 opacity-60 cursor-not-allowed">
                <span className="text-2xl">🍎</span>
                App Store (Próximamente)
              </div>
              <div className="px-8 py-4 bg-white text-gray-800 rounded-full font-semibold text-lg flex items-center gap-3 opacity-60 cursor-not-allowed">
                <span className="text-2xl">🤖</span>
                Google Play (Próximamente)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">💑 MariPuntos</h3>
            <p className="text-gray-400 mb-6">
              Gamifica los permisos en tu relación de pareja
            </p>
            <div className="flex justify-center gap-8 mb-6">
              <a
                href="/privacidad"
                className="text-gray-400 hover:text-[#24C6B1] transition-colors"
              >
                Privacidad
              </a>
              <a
                href="/terminos"
                className="text-gray-400 hover:text-[#24C6B1] transition-colors"
              >
                Términos
              </a>
              <a
                href="mailto:arias9068@gmail.com"
                className="text-gray-400 hover:text-[#24C6B1] transition-colors"
              >
                Contacto
              </a>
            </div>
            <p className="text-gray-500 text-sm">
              © 2026 MariPuntos. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
