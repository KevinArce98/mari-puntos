export function AppShowcase() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32 bg-[#071a17]">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-125 bg-[#24C6B1]/20 rounded-full blur-[100px]" />
        <div className="absolute top-1/4 left-1/3 w-75 h-75 bg-purple-600/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-1/4 right-1/3 w-62.5 h-62.5 bg-[#24C6B1]/12 rounded-full blur-[70px]" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(#24C6B1 1px, transparent 1px), linear-gradient(to right, #24C6B1 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <span className="inline-block px-4 py-1.5 rounded-full border border-[#24C6B1]/30 bg-[#24C6B1]/10 text-[#24C6B1] text-xs font-semibold uppercase tracking-widest mb-4">
            Interfaz
          </span>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
            Simple y{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#24C6B1] to-[#4aeadb]">
              Hermosa
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-lg mx-auto">
            Diseñada para que tú y tu pareja la disfruten desde el primer día
          </p>
        </div>

        {/* ── 3-Phone showcase ── */}
        <div className="relative flex items-end justify-center h-120 md:h-145">
          {/* Left phone */}
          <div
            className="absolute hidden md:block"
            style={{
              left: 'calc(50% - 300px)',
              bottom: 24,
              transform: 'rotate(-11deg)',
              zIndex: 1,
            }}
          >
            {/* Feature badge */}
            <div className="absolute -top-5 -left-12 z-10 bg-white rounded-2xl px-3.5 py-2.5 shadow-2xl flex items-center gap-2.5 whitespace-nowrap">
              <div className="w-8 h-8 rounded-xl bg-yellow-400/20 flex items-center justify-center text-base shrink-0">
                🏆
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 leading-none mb-0.5">
                  +500 MariPuntos
                </p>
                <p className="text-[10px] text-gray-500">Acción aprobada</p>
              </div>
            </div>
            <PhoneMockup src="/actions.png" alt="Pantalla Acciones" width={188} />
            <p className="text-center text-gray-500 text-xs mt-3 font-medium tracking-wide uppercase">
              Acciones
            </p>
          </div>

          {/* Center phone (hero) */}
          <div className="relative z-10">
            <div className="absolute -inset-10 bg-[#24C6B1]/20 rounded-full blur-[60px]" />
            {/* Highlight ring */}
            <div className="absolute -inset-0.75 rounded-[3.2rem] bg-linear-to-b from-[#24C6B1]/40 to-transparent" />
            <PhoneMockup src="/home.png" alt="Pantalla Inicio" width={248} />
            <p className="text-center text-[#24C6B1] text-xs mt-3 font-semibold tracking-wide uppercase">
              Inicio
            </p>
          </div>

          {/* Right phone */}
          <div
            className="absolute hidden md:block"
            style={{
              right: 'calc(50% - 300px)',
              bottom: 24,
              transform: 'rotate(11deg)',
              zIndex: 1,
            }}
          >
            {/* Feature badge */}
            <div className="absolute -top-5 -right-12 z-10 bg-white rounded-2xl px-3.5 py-2.5 shadow-2xl flex items-center gap-2.5 whitespace-nowrap">
              <div className="w-8 h-8 rounded-xl bg-[#24C6B1]/20 flex items-center justify-center text-base shrink-0">
                ⚔️
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 leading-none mb-0.5">
                  Kevin vs Vangely
                </p>
                <p className="text-[10px] text-gray-500">Duelo activo</p>
              </div>
            </div>
            <PhoneMockup src="/duelo.png" alt="Pantalla Duelo" width={188} />
            <p className="text-center text-gray-500 text-xs mt-3 font-medium tracking-wide uppercase">
              Duelo
            </p>
          </div>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2.5 mt-14">
          {[
            { icon: '🎯', label: 'Acciones con puntos' },
            { icon: '🤝', label: 'Permisos en pareja' },
            { icon: '🔥', label: 'Rachas semanales' },
            { icon: '⚔️', label: 'Duelo competitivo' },
            { icon: '🔔', label: 'Notificaciones en tiempo real' },
          ].map((f) => (
            <div
              key={f.label}
              className="flex items-center gap-2 px-4 py-2 bg-white/8 backdrop-blur-sm rounded-full border border-white/12 hover:bg-white/14 transition-colors"
            >
              <span className="text-sm">{f.icon}</span>
              <span className="text-gray-300 text-sm font-medium">{f.label}</span>
            </div>
          ))}
        </div>

        {/* Download CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <a
            href="https://apps.apple.com/app/id6758923865"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-6 py-3.5 bg-white text-gray-900 rounded-2xl font-semibold text-sm hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-xl shadow-black/30"
          >
            <img
              src="/apple.svg"
              alt="Apple"
              className="w-6 h-6 shrink-0"
              style={{ filter: 'brightness(0)' }}
            />
            App Store
          </a>
          <a
            href="https://play.google.com/store/apps/details?id=com.maripuntos.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-6 py-3.5 bg-white text-gray-900 rounded-2xl font-semibold text-sm hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-xl shadow-black/30"
          >
            <img src="/googleplay.svg" alt="Google Play" className="w-6 h-6 shrink-0" />
            Google Play
          </a>
        </div>
      </div>
    </section>
  );
}

function PhoneMockup({ src, alt, width }: { src: string; alt: string; width: number }) {
  return (
    <div className="relative" style={{ width }}>
      <div className="bg-gray-900 rounded-[2.8rem] p-0.75 shadow-[0_32px_80px_rgba(0,0,0,0.6)]">
        <div className="bg-[#1a1a1a] rounded-[2.75rem] p-0.75">
          <div className="bg-black rounded-[2.5rem] overflow-hidden">
            <div className="relative h-3 bg-black flex items-center justify-center">
              <div className="w-20 h-4 bg-black rounded-b-2xl" />
            </div>
            <img src={src} alt={alt} className="w-full object-cover block" />
          </div>
        </div>
      </div>
    </div>
  );
}
