import { localize, type Locale } from '../../context/AppPreferences';
import { journalEntryPath, type JournalEntry, type PortfolioProject, type SiteSettings } from '../../domain/content';
import { isAcceptingInquiries } from '../../lib/availability';
import { COMPANY_REGISTER_URL, company } from '../../lib/company';
import type { CorridorPage } from '../../lib/viewMode';
import { aboutCopy, aboutPractice, aboutPrinciples } from '../../pages/AboutPage';
import { contactCopy } from '../../pages/ContactPage';
import { policies } from '../../pages/LegalPage';
import { coverImage, galleryImage, projectCategory, type CorridorEntry } from './projectCorridor';

const TEXT = 16 / 10;
export const NOTE_PALETTES: string[][] = [['#ff5c8a', '#e8a33d'], ['#45d0bf', '#5c74ff'], ['#a6ff5c', '#45d0bf'], ['#93a7ff', '#ff5ce1'], ['#e8a33d', '#ff8a3d']];
export const PAGE_PALETTES: string[][] = [['#5c74ff', '#45d0bf'], ['#e8a33d', '#ff5c8a'], ['#45d0bf', '#a6ff5c'], ['#93a7ff', '#ff5ce1'], ['#ff8a3d', '#5c74ff']];

const labels = {
  tr: {
    home: 'Ana koridor', work: 'Tüm işler', contact: 'İletişim', page: 'Sayfa', read: 'Yazıyı oku', form: 'Mesaj formu',
    sendEmail: 'E-posta gönder', company: 'Şirket', updated: 'Son güncelleme',
    titles: { work: 'İşler', about: 'Hakkımda', lab: 'Lab', journal: 'Günlük', contact: 'İletişim', privacy: 'Gizlilik', terms: 'Koşullar' },
  },
  en: {
    home: 'Main corridor', work: 'All work', contact: 'Contact', page: 'Page', read: 'Read the entry', form: 'Message form',
    sendEmail: 'Send an email', company: 'Company', updated: 'Last updated',
    titles: { work: 'Work', about: 'About', lab: 'Lab', journal: 'Journal', contact: 'Contact', privacy: 'Privacy', terms: 'Terms' },
  },
} as const;

export const corridorPageTitle = (page: CorridorPage, locale: Locale) => labels[locale].titles[page];

export const projectEntry = (project: PortfolioProject, locale: Locale): CorridorEntry => {
  const cover = coverImage(project);
  const gallery = galleryImage(project);
  return {
    id: project.slug,
    kind: 'project',
    title: localize(project.title, locale),
    meta: [projectCategory(project, locale), project.context ? localize(project.context, locale) : null, project.year].filter(Boolean).join(' · '),
    href: `/work/${project.slug}`,
    image: cover?.src,
    aspect: cover?.width && cover.height ? cover.width / cover.height : TEXT,
    palette: project.cover.palette,
    project,
    extra: gallery?.src ? { image: gallery.src, aspect: gallery.width && gallery.height ? gallery.width / gallery.height : TEXT } : undefined,
  };
};

export const companyEntry = (locale: Locale): CorridorEntry => {
  const c = company[locale];
  return {
    id: 'company',
    kind: 'note',
    title: company.name,
    meta: c.heading,
    body: c.summary,
    aspect: TEXT,
    palette: ['#45d0bf', '#5c74ff'],
    rows: [
      [c.numberLabel, company.number],
      [c.statusLabel, c.status],
      [c.typeLabel, c.type],
      [c.incorporatedLabel, c.incorporated],
      [c.addressLabel, company.address],
      [c.activityLabel, c.activity],
    ],
    links: [{ kind: 'article', label: { tr: company.tr.register, en: company.en.register }, href: COMPANY_REGISTER_URL, newTab: true }],
  };
};

interface Sources { locale: Locale; settings: SiteSettings; projects: PortfolioProject[]; journal: JournalEntry[]; lab: JournalEntry[] }

/** The stops of a sub-page corridor, built from the same content as its classic page. */
export const pageCorridorEntries = (page: CorridorPage, { locale, settings, projects, journal, lab }: Sources): CorridorEntry[] => {
  const l = labels[locale];
  let notes = 0;
  const note = (id: string, title: string, meta: string, body?: string, extra: Partial<CorridorEntry> = {}): CorridorEntry => ({
    id, kind: 'note', title, meta, body, aspect: TEXT, palette: NOTE_PALETTES[notes++ % NOTE_PALETTES.length]!, ...extra,
  });
  const portal = (id: string, title: string, href: string, extra: Partial<CorridorEntry> = {}): CorridorEntry => ({
    id, kind: 'page', title, href, meta: l.page, aspect: TEXT, palette: PAGE_PALETTES[0]!, ...extra,
  });
  const contactPortal = portal('contact', l.contact, '/contact');

  switch (page) {
    case 'work':
      return [...projects.map((project) => projectEntry(project, locale)), contactPortal];
    case 'about': {
      const t = aboutCopy[locale];
      const accepting = isAcceptingInquiries(settings.availability);
      return [
        note('hero', `${t.titleA} ${t.titleB} ${t.titleC}`, t.eyebrow, t.intro),
        note('story', localize(settings.ownerName, locale), t.eyebrow, `${t.body1}\n${t.body2}\n${t.body3Before}${company.name}${t.body3After}`),
        ...aboutPrinciples(locale).map((item, index) => note(`principle-${index}`, item.title, t.principles, item.body)),
        ...aboutPractice(locale).map((item, index) => note(`practice-${index}`, item.title, t.stack, item.body)),
        note('now', t.nowTitle, t.now, t.nowBody),
        companyEntry(locale),
        accepting ? contactPortal : portal('work', l.work, '/work'),
      ];
    }
    case 'lab':
    case 'journal': {
      const list = page === 'lab' ? lab : journal;
      return [
        ...list.map((entry) => note(entry.slug, localize(entry.title, locale), entry.topics.slice(0, 3).join(' · '), localize(entry.excerpt, locale), {
          palette: entry.cover.palette, cta: { label: l.read, href: journalEntryPath(entry) },
        })),
        portal('work', l.work, '/work'),
      ];
    }
    case 'contact': {
      const t = contactCopy[locale];
      return [
        note('intro', t.title, t.eyebrow, t.intro),
        note('email', settings.contactEmail, t.direct, undefined, {
          links: [{ kind: 'contact', label: { tr: labels.tr.sendEmail, en: labels.en.sendEmail }, href: `mailto:${settings.contactEmail}`, newTab: false }],
        }),
        note('privacy', t.privacyTitle, t.direct, t.privacyBody),
        companyEntry(locale),
        portal('form', l.form, '/contact', { classic: true }),
      ];
    }
    case 'privacy':
    case 'terms': {
      const policy = policies[page];
      return [
        note('intro', localize(policy.title, locale), localize(policy.eyebrow, locale), localize(policy.intro, locale)),
        ...policy.sections.map((section, index) => note(
          `section-${index}`,
          localize(section.heading, locale),
          localize(policy.eyebrow, locale),
          [...section.paragraphs, ...(section.items ?? [])].map((text) => localize(text, locale)).join('\n'),
        )),
        contactPortal,
      ];
    }
  }
};
