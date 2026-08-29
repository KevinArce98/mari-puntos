import { useState } from 'react';

import { type Lang, defaultLang, ui } from '@/i18n/ui';

const QUESTION_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7'] as const;

interface Props {
  lang?: Lang;
}

export function FaqAccordion({ lang = defaultLang }: Props) {
  const [open, setOpen] = useState<number | null>(null);
  const dict = ui[lang] ?? ui[defaultLang];

  const faqs = QUESTION_KEYS.map((k) => ({
    question: dict[`faq.${k}.question` as keyof typeof dict],
    answer: dict[`faq.${k}.answer` as keyof typeof dict],
  }));

  return (
    <div className="space-y-3 max-w-3xl mx-auto">
      {faqs.map((faq, i) => (
        <div key={i} className="border border-gray-200 rounded-2xl overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
            aria-controls={`faq-panel-${i}`}
            className="w-full flex items-center justify-between px-6 py-5 text-left bg-white hover:bg-gray-50 transition-colors"
          >
            <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
            <span
              aria-hidden="true"
              className="text-2xl text-primary shrink-0 transition-transform duration-200"
              style={{ transform: open === i ? 'rotate(45deg)' : 'rotate(0deg)' }}
            >
              +
            </span>
          </button>
          {open === i && (
            <div id={`faq-panel-${i}`} className="px-6 pb-5 bg-white">
              <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
