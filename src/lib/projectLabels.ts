// Labels shared by the project page and the project corridor.

export const textParagraphs = (value: string) => value.split(/\n{2,}/).filter(Boolean);

export const stageLabels = {
  tr: {
    concept: 'Konsept', prototype: 'Prototip', 'pre-alpha': 'Pre-alpha', 'in-development': 'Geliştirme aşamasında',
    'feature-complete': 'Özellikleri tamamlandı', beta: 'Beta', 'release-candidate': 'Sürüm adayı (RC)',
    stable: 'Kararlı sürüm', live: 'Yayında', maintained: 'Aktif bakımda', archived: 'Arşivlendi',
  },
  en: {
    concept: 'Concept', prototype: 'Prototype', 'pre-alpha': 'Pre-alpha', 'in-development': 'In development',
    'feature-complete': 'Feature-complete', beta: 'Beta', 'release-candidate': 'Release candidate',
    stable: 'Stable release', live: 'Live', maintained: 'Actively maintained', archived: 'Archived',
  },
} as const;

export const toneLabels = {
  tr: { note: 'Not', decision: 'Karar', constraint: 'Kısıt', outcome: 'Sonuç' },
  en: { note: 'Note', decision: 'Decision', constraint: 'Constraint', outcome: 'Outcome' },
} as const;
