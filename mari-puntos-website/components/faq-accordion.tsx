'use client';

import { useState } from 'react';

const faqs = [
  {
    question: '¿Es gratis MariPuntos?',
    answer:
      'Sí, MariPuntos es completamente gratis para descargar y usar. Sin cargos ocultos ni suscripciones obligatorias.',
  },
  {
    question: '¿Cómo me vinculo con mi pareja?',
    answer:
      'Después de crear tu cuenta, recibirás un código único. Compártelo con tu pareja y en segundos estarán conectados.',
  },
  {
    question: '¿Qué son los MariPuntos?',
    answer:
      'Son una moneda virtual que ganas al completar acciones positivas para tu pareja. Úsalos para solicitar permisos personalizados.',
  },
  {
    question: '¿Puedo personalizar las acciones y permisos?',
    answer:
      'Sí. Tanto tú como tu pareja pueden crear, editar y eliminar acciones y permisos completamente a su gusto.',
  },
  {
    question: '¿Está disponible para iOS y Android?',
    answer:
      'Sí, MariPuntos está disponible en App Store (iOS) y Google Play (Android). ¡Descárgala gratis hoy!',
  },
  {
    question: '¿Qué son las rachas semanales?',
    answer:
      'Las rachas cuentan cuántas semanas consecutivas ambos completaron al menos una acción juntos. ¡Compiten para no romper la racha!',
  },
];

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-3 max-w-3xl mx-auto">
      {faqs.map((faq, i) => (
        <div key={i} className="border border-gray-200 rounded-2xl overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-6 py-5 text-left bg-white hover:bg-gray-50 transition-colors"
          >
            <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
            <span
              className="text-2xl text-[#24C6B1] shrink-0 transition-transform duration-200"
              style={{ transform: open === i ? 'rotate(45deg)' : 'rotate(0deg)' }}
            >
              +
            </span>
          </button>
          {open === i && (
            <div className="px-6 pb-5 bg-white">
              <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
