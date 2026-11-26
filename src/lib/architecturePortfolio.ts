import type { Locale } from '../context/AppPreferences';

/** The architecture portfolio is a standalone static deck in public/portfolyo, outside the SPA router. */
export const architecturePortfolio = {
  // Hosting serves the deck at /portfolyo and redirects the index.html form; the dev server only knows the file.
  href: import.meta.env.DEV ? '/portfolyo/index.html' : '/portfolyo',
  pdf: '/portfolyo/Ahmet_Cem_Karaca_Portfolyo.pdf',
  cover: '/portfolyo/assets/_thumbs/tasarim3__hero.jpg',
  coverAspect: 16 / 9,
  // Back to front; `page` is the sheet's page number in the deck.
  sheets: [
    { image: '/portfolyo/assets/_thumbs/fantasia__hero.jpg', page: '28' },
    { image: '/portfolyo/assets/_thumbs/tasarim8__hero.jpg', page: '23' },
    { image: '/portfolyo/assets/_thumbs/tasarim3__hero.jpg', page: '07' },
  ],
  // The facts describe the deck and its PDF; update them when public/portfolyo changes.
  tr: {
    title: 'Mimarlık portfolyosu',
    meta: 'Akademik ve otel projeleri · 2026',
    body: 'Mimari tasarım stüdyolarından ve otel projelerinden seçilmiş on çalışma: konsept, plan, kesit ve görseller tek bir sunumda.',
    facts: [['Sayfa', '40'], ['Projeler', '5 stüdyo, 5 otel'], ['Dil', 'Türkçe'], ['PDF', '26 MB']],
    open: 'Portfolyoyu aç',
    pdf: 'PDF indir',
  },
  en: {
    title: 'Architecture portfolio',
    meta: 'Academic and hotel projects · 2026 · Turkish',
    body: 'Ten selected works from architectural design studios and hotel projects: concept, plans, sections and visuals in one presentation.',
    facts: [['Pages', '40'], ['Projects', '5 studio, 5 hotel'], ['Language', 'Turkish'], ['PDF', '26 MB']],
    open: 'Open the portfolio',
    pdf: 'Download PDF',
  },
} as const;

export const architecturePortfolioCopy = (locale: Locale) => architecturePortfolio[locale];
