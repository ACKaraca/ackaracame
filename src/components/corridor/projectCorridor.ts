import { localize, type Locale } from '../../context/AppPreferences';
import type { Media, PortfolioProject } from '../../domain/content';
import { stageLabels, toneLabels } from '../../lib/projectLabels';
import { disciplineLabels, gameLabel } from '../projects/ProjectCard';

export type EntryKind = 'project' | 'page' | 'note' | 'image';

/** One stop in a corridor, shared by the HUD (text) and the 3D scene (panel art). */
export interface CorridorEntry {
  id: string;
  kind: EntryKind;
  title: string;
  /** Short category line under the HUD title and in the detail panel. */
  meta: string;
  href?: string;
  image?: string;
  aspect: number;
  palette: string[];
  project?: PortfolioProject;
  body?: string;
  rows?: Array<[string, string]>;
  links?: PortfolioProject['links'];
  cta?: { label: string; href: string };
  extra?: { image: string; aspect: number };
}

const copy = {
  tr: {
    discipline: 'Alan', stage: 'Durum', year: 'Yıl', tools: 'Araçlar', ongoing: 'Devam ediyor', gameDev: 'Oyun geliştirme',
    overview: 'Genel bakış', image: 'Görsel', scope: 'Kapsam', scopeTitle: 'Projenin kapsamı', quote: 'Alıntı', code: 'Kod',
    caseStudy: 'Vaka sayfası', page: 'Sayfa',
  },
  en: {
    discipline: 'Discipline', stage: 'Stage', year: 'Year', tools: 'Tools', ongoing: 'Ongoing', gameDev: 'Game development',
    overview: 'Overview', image: 'Image', scope: 'Scope', scopeTitle: 'Project scope', quote: 'Quote', code: 'Code',
    caseStudy: 'Full case study', page: 'Page',
  },
} as const;

const readyImage = (media: Media) => media.kind === 'image' && media.assetState === 'ready' && Boolean(media.src);
const aspectOf = (media: Media) => (media.width && media.height ? media.width / media.height : 16 / 10);
const TEXT_ASPECT = 16 / 10;

export const coverImage = (project: PortfolioProject) => project.media.find((media) => media.role === 'cover' && readyImage(media));

/** First non-cover image, hung overhead in the main corridor next to the project. */
export const galleryImage = (project: PortfolioProject) => {
  const cover = coverImage(project);
  return project.media.find((media) => media !== cover && readyImage(media));
};

export const projectCategory = (project: PortfolioProject, locale: Locale) =>
  project.format === 'game' ? gameLabel[locale] : disciplineLabels[locale][project.discipline];

/** The project page, laid out as the stops of its own corridor. */
export const projectCorridorEntries = (project: PortfolioProject, locale: Locale): CorridorEntry[] => {
  const t = copy[locale];
  const palette = project.cover.palette;
  const at = (offset: number) => [...palette.slice(offset % palette.length), ...palette.slice(0, offset % palette.length)];
  const entries: CorridorEntry[] = [];
  const seen = new Set<string>();
  const addImage = (media: Media, meta: string) => {
    if (!readyImage(media) || seen.has(media.src!)) return;
    seen.add(media.src!);
    entries.push({
      id: `image-${media.id}`, kind: 'image', title: localize(media.alt, locale), meta, image: media.src, aspect: aspectOf(media),
      palette: at(entries.length), body: media.caption ? localize(media.caption, locale) : undefined,
    });
  };

  const cover = coverImage(project);
  if (cover?.src) seen.add(cover.src);
  entries.push({
    id: 'overview',
    kind: 'note',
    title: localize(project.title, locale),
    meta: [project.context ? localize(project.context, locale) : projectCategory(project, locale), project.year].filter(Boolean).join(' · '),
    body: localize(project.dek, locale),
    aspect: TEXT_ASPECT,
    palette,
    rows: [
      [t.discipline, project.format === 'game' ? t.gameDev : disciplineLabels[locale][project.discipline]],
      [t.stage, project.releaseStage ? stageLabels[locale][project.releaseStage] : t.ongoing],
      [t.year, project.year ? String(project.year) : '—'],
      [t.tools, project.technologies.slice(0, 5).join(', ')],
    ],
    links: project.links,
  });

  project.media.filter((media) => media !== cover).forEach((media) => addImage(media, t.image));

  if (project.metrics.length) {
    entries.push({
      id: 'metrics', kind: 'note', title: t.scopeTitle, meta: t.scope, aspect: TEXT_ASPECT, palette: at(entries.length),
      body: project.metrics.map((metric) => `${localize(metric.value, locale)} — ${localize(metric.label, locale)}`).join('\n'),
    });
  }

  for (const block of project.blocks) {
    const note = (title: string, meta: string, body?: string, rows?: Array<[string, string]>) => entries.push({
      id: `block-${block.id}`, kind: 'note', title, meta, body, rows, aspect: TEXT_ASPECT, palette: at(entries.length),
    });
    switch (block.type) {
      case 'text':
        note(localize(block.heading, locale), block.eyebrow ? localize(block.eyebrow, locale) : t.overview, localize(block.body, locale));
        break;
      case 'facts': {
        const rows = block.items.map((item): [string, string] => [localize(item.label, locale), localize(item.value, locale)]);
        note(localize(block.heading, locale), t.overview, rows.map(([label, value]) => `${label}: ${value}`).join('\n'), rows);
        break;
      }
      case 'callout':
        note(localize(block.heading, locale), toneLabels[locale][block.tone], localize(block.body, locale));
        break;
      case 'quote':
        note(`“${localize(block.quote, locale)}”`, t.quote, block.attribution ? localize(block.attribution, locale) : undefined);
        break;
      case 'code':
        note(block.caption ? localize(block.caption, locale) : block.language, t.code, block.code);
        break;
      case 'media':
        addImage(block.media, block.heading ? localize(block.heading, locale) : t.image);
        break;
      case 'gallery':
        block.items.forEach((media) => addImage(media, block.heading ? localize(block.heading, locale) : t.image));
        break;
    }
  }

  entries.push({ id: 'case-study', kind: 'page', title: t.caseStudy, meta: t.page, href: `/work/${project.slug}`, aspect: TEXT_ASPECT, palette });
  return entries;
};
