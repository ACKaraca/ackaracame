import type { Locale } from '../context/AppPreferences';

/** The architecture portfolio is a standalone static deck in public/portfolyo, outside the SPA router. */
export const architecturePortfolio = {
  href: '/portfolyo/index.html',
  pdf: '/portfolyo/Ahmet_Cem_Karaca_Portfolyo.pdf',
  cover: '/portfolyo/assets/_thumbs/tasarim3__hero.jpg',
  coverAspect: 16 / 9,
  tr: {
    title: 'Mimarlık portfolyosu',
    meta: 'Akademik ve otel projeleri · 2026',
    body: 'Mimari tasarım stüdyolarından ve otel projelerinden seçilmiş on çalışma: konsept, plan, kesit ve görseller tek bir sunumda.',
    open: 'Portfolyoyu aç',
    pdf: 'PDF indir',
  },
  en: {
    title: 'Architecture portfolio',
    meta: 'Academic and hotel projects · 2026 · Turkish',
    body: 'Ten selected works from architectural design studios and hotel projects: concept, plans, sections and visuals in one presentation.',
    open: 'Open the portfolio',
    pdf: 'Download PDF',
  },
} as const;

export const architecturePortfolioCopy = (locale: Locale) => architecturePortfolio[locale];
