import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { ArrowDown, ArrowRight, ArrowUpRight, Moon, Sun, X } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { localize, useAppPreferences } from '../context/AppPreferences';
import { useContent } from '../context/Content';
import { activeIndexFor, corridorLayout, flightSeconds } from '../components/corridor/corridorLayout';
import type { CorridorScene } from '../components/corridor/CorridorScene';
import { disciplineLabels, gameLabel } from '../components/projects/ProjectCard';
import type { PortfolioProject } from '../domain/content';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { availabilityLabel, isAcceptingInquiries } from '../lib/availability';
import '../components/corridor/corridor.css';

const copy = {
  tr: {
    tagline: 'Mimarlık · Yazılım · Yapay zekâ',
    index: 'Index',
    contact: 'İletişim',
    hint: 'Koridorda yürümek için kaydır · Açmak için bir işe tıkla',
    open: 'Aç',
    medium: 'Araçlar',
    context: 'Bağlam',
    place: 'Yer',
    stage: 'Aşama',
    viewProject: 'Projeyi incele',
    nextPiece: 'Sıradaki',
    close: 'Kapat',
    page: 'Sayfa',
    allItems: 'Koridordaki her şey',
    work: 'Tüm işler',
    about: 'Hakkımda',
    lab: 'Lab',
    journal: 'Günlük',
    heading: 'Ahmet Cem Karaca — portfolyo',
    theme: 'Renk temasını değiştir',
    locale: 'Switch to English',
    kicker: 'Portfolyo',
    headlineA: 'Tasarlar,',
    headlineB: 'kodlar,',
    headlineC: 'uygulamalar.',
    intro: 'Seçili projeler: yapay zekâ destekli mimarlık araçları, üretkenlik sistemleri, birçok dalda mobil uygulamalar.',
    exploreWork: 'Seçili işleri incele',
    getInTouch: 'İletişime geç',
    readProfile: 'Profili oku',
    projectCount: 'seçili proje',
    disciplineCount: 'çalışma alanı',
    technologyCount: 'araç ve teknoloji',
    scroll: 'Kaydır',
    focusEyebrow: 'Odak alanları',
    focus: [
      ['AI × Mimarlık', 'Yapay zekâ destekli mimari araçlar, brief toplama ve tasarım süreçleri.'],
      ['Mobil', 'iOS ve Android için keşif, üretkenlik ve niş alan uygulamaları.'],
      ['Web', 'Portfolyo, dashboard ve tam stack web ürünleri.'],
      ['Üretkenlik', 'İş akışı, otomasyon ve kişisel sistem araçları.'],
    ],
    profileEyebrow: 'Kısa profil',
    profileTitle: 'Mimarlık öğrencisi, ürün kurucusu ve bağımsız geliştirici.',
    profileBody: 'ACKARACA LIMITED çatısı altında; yapay zekâ destekli mimarlık araçlarından üretkenlik ve mobil keşif ürünlerine uzanan projeler geliştiriyorum.',
  },
  en: {
    tagline: 'Architecture · Software · AI',
    index: 'Index',
    contact: 'Contact',
    hint: 'Scroll to walk the corridor · Click a piece to open it',
    open: 'Open',
    medium: 'Medium',
    context: 'Context',
    place: 'Place',
    stage: 'Stage',
    viewProject: 'View the project',
    nextPiece: 'Next piece',
    close: 'Close',
    page: 'Page',
    allItems: 'Everything in the corridor',
    work: 'All work',
    about: 'About',
    lab: 'Lab',
    journal: 'Journal',
    heading: 'Ahmet Cem Karaca — portfolio',
    theme: 'Toggle colour theme',
    locale: 'Türkçeye geç',
    kicker: 'Portfolio',
    headlineA: 'Designs,',
    headlineB: 'codes,',
    headlineC: 'applications.',
    intro: 'Selected projects: AI-assisted architecture tools, productivity systems, and mobile applications across many domains.',
    exploreWork: 'Explore selected work',
    getInTouch: 'Get in touch',
    readProfile: 'Read the profile',
    projectCount: 'selected projects',
    disciplineCount: 'practice areas',
    technologyCount: 'tools & technologies',
    scroll: 'Scroll',
    focusEyebrow: 'Focus areas',
    focus: [
      ['AI × Architecture', 'AI-assisted architecture tools, brief gathering, and design workflows.'],
      ['Mobile', 'Discovery, productivity, and niche apps for iOS and Android.'],
      ['Web', 'Portfolios, dashboards, and full-stack web products.'],
      ['Productivity', 'Workflow, automation, and personal system tools.'],
    ],
    profileEyebrow: 'Short profile',
    profileTitle: 'Architecture student, product founder, and independent developer.',
    profileBody: 'Through ACKARACA LIMITED, I build projects spanning AI-assisted architecture tools, productivity systems, and mobile discovery products.',
  },
} as const;

type EntryKind = 'project' | 'page' | 'note';

interface CorridorEntry {
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
  cta?: { label: string; href: string };
}

const PAGE_PALETTES: string[][] = [['#5c74ff', '#45d0bf'], ['#e8a33d', '#ff5c8a'], ['#45d0bf', '#a6ff5c'], ['#93a7ff', '#ff5ce1'], ['#ff8a3d', '#5c74ff']];
const NOTE_PALETTES: string[][] = [['#ff5c8a', '#e8a33d'], ['#45d0bf', '#5c74ff'], ['#a6ff5c', '#45d0bf'], ['#93a7ff', '#ff5ce1'], ['#e8a33d', '#ff8a3d']];

const pad = (value: number) => String(value).padStart(2, '0');

const webglAvailable = () => {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
};

const scrollMax = () => document.documentElement.scrollHeight - window.innerHeight;
const scrollProgress = () => {
  const max = scrollMax();
  return max > 0 ? window.scrollY / max : 0;
};

export default function HomePage() {
  const { settings, projects, journal, lab } = useContent();
  const { locale, setLocale, resolvedTheme, setTheme } = useAppPreferences();
  const [, navigate] = useLocation();
  const t = copy[locale];
  const acceptingInquiries = isAcceptingInquiries(settings.availability);

  const entries = useMemo<CorridorEntry[]>(() => {
    const projectEntries = projects.map((project): CorridorEntry => {
      const cover = project.media.find((media) => media.role === 'cover' && media.kind === 'image' && media.assetState === 'ready' && media.src);
      const category = project.format === 'game' ? gameLabel[locale] : disciplineLabels[locale][project.discipline];
      return {
        id: project.slug,
        kind: 'project',
        title: localize(project.title, locale),
        meta: [category, project.context ? localize(project.context, locale) : null, project.year].filter(Boolean).join(' · '),
        href: `/work/${project.slug}`,
        image: cover?.src,
        aspect: cover?.width && cover.height ? cover.width / cover.height : 16 / 10,
        palette: project.cover.palette,
        project,
      };
    });
    const focusNotes = t.focus.map(([title, body], index): CorridorEntry => ({
      id: `focus-${index}`, kind: 'note', title, body, meta: t.focusEyebrow, aspect: 16 / 10, palette: NOTE_PALETTES[index % NOTE_PALETTES.length]!,
    }));
    const page = (id: string, title: string, href: string, index: number): CorridorEntry => ({
      id, kind: 'page', title, href, meta: t.page, aspect: 16 / 10, palette: PAGE_PALETTES[index % PAGE_PALETTES.length]!,
    });
    return [
      ...projectEntries,
      ...focusNotes,
      page('work', t.work, '/work', 0),
      {
        id: 'profile', kind: 'note', title: t.profileTitle, body: t.profileBody, meta: t.profileEyebrow, aspect: 16 / 10,
        palette: NOTE_PALETTES[4]!, cta: { label: t.readProfile, href: '/about' },
      },
      page('about', t.about, '/about', 1),
      ...(lab.length > 0 ? [page('lab', t.lab, '/lab', 2)] : []),
      ...(journal.length > 0 ? [page('journal', t.journal, '/journal', 3)] : []),
      page('contact', t.contact, '/contact', 4),
    ];
  }, [projects, journal.length, lab.length, locale, t]);

  const stops = useMemo(() => corridorLayout(entries.length).stops, [entries.length]);
  const stageRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<CorridorScene | null>(null);
  const [active, setActive] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [hovered, setHovered] = useState<number | null>(null);
  const [focused, setFocused] = useState<number | null>(null);
  const [indexOpen, setIndexOpen] = useState(false);
  const [fallback, setFallback] = useState(false);
  const selectRef = useRef<(index: number) => void>(() => undefined);

  const disciplineCount = new Set(projects.map((project) => project.discipline)).size;
  const technologyCount = new Set(projects.flatMap((project) => project.technologies)).size;

  useDocumentMeta({
    title: localize(settings.defaultSeo.title, locale),
    description: localize(settings.defaultSeo.description, locale),
    locale,
    type: 'profile',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Ahmet Cem Karaca',
      url: locale === 'en' ? `${settings.canonicalUrl.replace(/\/$/, '')}/en` : settings.canonicalUrl,
      email: `mailto:${settings.contactEmail}`,
      jobTitle: locale === 'tr' ? 'Mimarlık öğrencisi ve ürün geliştirici' : 'Architecture student and product developer',
      sameAs: settings.socialLinks.map((link) => link.href),
      knowsAbout: ['Architecture', 'Product design', 'TypeScript', 'Firebase', 'Artificial intelligence'],
    },
  });

  /** Fly along the corridor to an entry; resolves with the flight length in ms. */
  const travelTo = useCallback((index: number) => {
    const stop = stops[index] ?? 0;
    const scene = sceneRef.current;
    const duration = scene ? flightSeconds(scrollProgress(), stop) * 1000 : 0;
    scene?.flyTo(stop);
    window.scrollTo({ top: stop * scrollMax(), behavior: 'instant' });
    return duration;
  }, [stops]);

  const select = useCallback((index: number) => {
    const entry = entries[index];
    if (!entry) return;
    setIndexOpen(false);
    const scene = sceneRef.current;
    if (entry.kind !== 'page') {
      setFocused(index);
      scene?.focus(index);
      return;
    }
    if (!scene) {
      navigate(entry.href ?? '/');
      return;
    }
    void scene.dive(index).then(() => navigate(entry.href ?? '/'));
  }, [entries, navigate]);
  useEffect(() => { selectRef.current = select; }, [select]);

  /** Index links: walk to the piece first, then open it. */
  const travelAndSelect = (index: number) => {
    setIndexOpen(false);
    const duration = travelTo(index);
    window.setTimeout(() => selectRef.current(index), duration);
  };

  const closeFocus = useCallback(() => {
    setFocused(null);
    sceneRef.current?.focus(null);
  }, []);

  // Build the WebGL scene; three.js is loaded on demand so SSR and other routes never pay for it.
  useEffect(() => {
    const container = stageRef.current;
    const pill = pillRef.current;
    if (!container || !pill) return undefined;
    let disposed = false;
    void import('../components/corridor/CorridorScene').then(({ createCorridorScene }) => {
      if (disposed) return;
      if (!webglAvailable()) {
        setFallback(true);
        return;
      }
      try {
        sceneRef.current = createCorridorScene({
          container,
          pill,
          items: entries.map((entry) => ({
            label: entry.title, kind: entry.kind, image: entry.image, aspect: entry.aspect, palette: entry.palette, eyebrow: entry.meta, body: entry.body,
          })),
          dark: document.documentElement.dataset.theme !== 'light',
          reducedMotion: document.documentElement.dataset.motion === 'off',
          onHover: setHovered,
          onSelect: (index) => selectRef.current(index),
        });
        sceneRef.current.setProgress(scrollProgress());
      } catch {
        setFallback(true);
      }
    }).catch(() => setFallback(true));
    return () => {
      disposed = true;
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [entries]);

  useEffect(() => { sceneRef.current?.setTheme(resolvedTheme === 'dark'); }, [resolvedTheme]);

  useEffect(() => {
    const onScroll = () => {
      const progress = scrollProgress();
      sceneRef.current?.setProgress(progress);
      setActive(activeIndexFor(progress, stops));
      setAtStart(progress < (stops[0] ?? 0) * 0.55);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [stops]);

  // Freeze the walk while a piece is open, and let Escape back out of any overlay.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('corridor-locked', focused !== null || indexOpen);
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (indexOpen) setIndexOpen(false);
      else if (focused !== null) closeFocus();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      root.classList.remove('corridor-locked');
      window.removeEventListener('keydown', onKey);
    };
  }, [focused, indexOpen, closeFocus]);

  const current = entries[active];
  const focusedEntry = focused === null ? null : entries[focused];
  const nextIndex = focused === null ? null : (() => {
    for (let step = 1; step < entries.length; step += 1) {
      const candidate = (focused + step) % entries.length;
      if (entries[candidate]?.kind !== 'page') return candidate;
    }
    return null;
  })();
  const nextEntry = nextIndex === null ? null : entries[nextIndex];

  const goNext = () => {
    if (nextIndex === null) return;
    window.scrollTo({ top: (stops[nextIndex] ?? 0) * scrollMax(), behavior: 'instant' });
    sceneRef.current?.setProgress(stops[nextIndex] ?? 0);
    select(nextIndex);
  };

  const project = focusedEntry?.project;
  const detailRows = project ? [
    [t.medium, project.technologies.slice(0, 4).join(', ')],
    [t.context, project.context ? localize(project.context, locale) : null],
    [t.place, project.location ? localize(project.location, locale) : null],
    [t.stage, project.releaseStage ?? null],
  ].filter((row): row is [string, string] => Boolean(row[1])) : [];

  return (
    <MotionConfig reducedMotion="never">
      <main id="main-content" tabIndex={-1} className={`corridor${fallback ? ' corridor--fallback' : ''}`} data-focused={focused !== null ? 'true' : undefined} data-start={atStart ? 'true' : undefined}>
        <h1 className="sr-only">{t.heading}</h1>
        <div className="corridor__stage" ref={stageRef} aria-hidden="true" />
        <div className="corridor__pill" ref={pillRef} aria-hidden="true">
          {hovered !== null ? `${t.open} ${entries[hovered]?.title ?? ''}` : null}
        </div>
        <div className="corridor__track" style={{ height: `${entries.length * 70 + 120}vh` }} aria-hidden="true" />

        <header className="corridor-hud corridor-hud--top">
          <Link href="/" className="corridor-brand">
            <strong>{localize(settings.ownerName, locale)}</strong>
            <span>{t.tagline}</span>
          </Link>
          <nav className="corridor-hud__actions" aria-label={locale === 'tr' ? 'Ana navigasyon' : 'Primary navigation'}>
            <button type="button" className="corridor-chip corridor-chip--round" onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} aria-label={t.theme}>
              {resolvedTheme === 'dark' ? <Moon aria-hidden="true" /> : <Sun aria-hidden="true" />}
            </button>
            <button type="button" className="corridor-chip corridor-chip--round" onClick={() => setLocale(locale === 'tr' ? 'en' : 'tr')} aria-label={t.locale}>
              {locale === 'tr' ? 'EN' : 'TR'}
            </button>
            <button type="button" className="corridor-chip" onClick={() => setIndexOpen((open) => !open)} aria-expanded={indexOpen || fallback} aria-controls="corridor-index">
              {t.index}<sup>{entries.length}</sup>
            </button>
            <Link href="/contact" className="corridor-chip">{t.contact}</Link>
          </nav>
        </header>

        {!fallback ? (
          <section className="corridor-hud corridor-intro" aria-hidden={!atStart}>
            <p className="corridor-intro__status"><i aria-hidden="true" />{availabilityLabel(settings.availability, locale)}</p>
            <p className="corridor-meta">{t.kicker}</p>
            <p className="corridor-intro__headline">
              <span>{t.headlineA}</span> <em>{t.headlineB}</em> <span>{t.headlineC}</span>
            </p>
            <p className="corridor-intro__body">{t.intro}</p>
            <div className="corridor-intro__actions">
              <button type="button" className="corridor-cta" onClick={() => travelTo(0)} tabIndex={atStart ? 0 : -1}>{t.exploreWork}<ArrowDown aria-hidden="true" /></button>
              <Link href={acceptingInquiries ? '/contact' : '/about'} className="corridor-next" tabIndex={atStart ? 0 : -1}>
                {acceptingInquiries ? t.getInTouch : t.readProfile}<ArrowUpRight aria-hidden="true" />
              </Link>
            </div>
            <dl className="corridor-intro__stats">
              <div><dt>{projects.length}</dt><dd>{t.projectCount}</dd></div>
              <div><dt>{disciplineCount}</dt><dd>{t.disciplineCount}</dd></div>
              <div><dt>{technologyCount}</dt><dd>{t.technologyCount}</dd></div>
            </dl>
          </section>
        ) : null}

        {current && !fallback ? (
          <section className="corridor-hud corridor-hud--info" aria-live="polite" aria-hidden={atStart}>
            <p className="corridor-count">{pad(active + 1)} / {pad(entries.length)}</p>
            <button type="button" className="corridor-title" onClick={() => select(active)} tabIndex={atStart ? -1 : 0}>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span key={current.id} className="corridor-title__word" aria-label={current.title}>
                  {[...current.title].map((letter, index) => (
                    <span className="corridor-title__mask" key={`${letter}-${index}`} aria-hidden="true">
                      <motion.span
                        initial={{ y: '105%' }}
                        animate={{ y: '0%' }}
                        exit={{ y: '-105%' }}
                        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: Math.min(index, 24) * 0.016 }}
                      >
                        {letter === ' ' ? ' ' : letter}
                      </motion.span>
                    </span>
                  ))}
                </motion.span>
              </AnimatePresence>
            </button>
            <p className="corridor-meta"><i style={{ background: current.palette[0] }} aria-hidden="true" />{current.meta}</p>
            <p className="corridor-hint">{t.hint}</p>
          </section>
        ) : null}

        {!fallback ? (
          <nav className="corridor-hud corridor-scrubber" aria-label={t.allItems}>
            <ol>
              {entries.map((entry, index) => (
                <li key={entry.id}>
                  <button type="button" onClick={() => travelTo(index)} aria-current={index === active ? 'true' : undefined}>
                    <span>{entry.title}</span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}

        <nav id="corridor-index" className="corridor-index" hidden={!indexOpen && !fallback} aria-label={t.allItems}>
          <ol>
            {entries.map((entry, index) => (
              <li key={entry.id}>
                <Link
                  href={entry.href ?? entry.cta?.href ?? '/work'}
                  onClick={(event) => {
                    if (fallback) return;
                    event.preventDefault();
                    travelAndSelect(index);
                  }}
                >
                  <span className="corridor-index__num">{pad(index + 1)}</span>
                  <span className="corridor-index__title">{entry.title}</span>
                  <span className="corridor-index__meta">{entry.meta}</span>
                </Link>
              </li>
            ))}
          </ol>
        </nav>

        <AnimatePresence>
          {focusedEntry ? (
            <motion.aside
              key={focusedEntry.id}
              className="corridor-detail"
              role="dialog"
              aria-modal="false"
              aria-labelledby="corridor-detail-title"
              initial={{ x: 48, opacity: 0 }}
              animate={{ x: 0, opacity: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.55 } }}
              exit={{ x: 48, opacity: 0, transition: { duration: 0.3 } }}
            >
              <button type="button" className="corridor-detail__close" onClick={closeFocus} aria-label={t.close} autoFocus><X aria-hidden="true" /></button>
              <p className="corridor-meta"><i style={{ background: focusedEntry.palette[0] }} aria-hidden="true" />{focusedEntry.meta}</p>
              <h2 id="corridor-detail-title">{focusedEntry.title}</h2>
              {project ? <p className="corridor-detail__sub">{localize(project.dek, locale)}</p> : null}
              {focusedEntry.body ? <p className="corridor-detail__dek">{focusedEntry.body}</p> : null}
              {detailRows.length > 0 ? (
                <dl>
                  {detailRows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
                </dl>
              ) : null}
              <div className="corridor-detail__actions">
                {focusedEntry.href || focusedEntry.cta ? (
                  <Link href={focusedEntry.href ?? focusedEntry.cta?.href ?? '/'} className="corridor-cta">
                    {focusedEntry.cta?.label ?? t.viewProject}<ArrowRight aria-hidden="true" />
                  </Link>
                ) : <span />}
                {nextEntry && nextIndex !== focused ? (
                  <button type="button" className="corridor-detail__next" onClick={goNext}>
                    <span>{t.nextPiece}</span>
                    <strong>{nextEntry.title}</strong>
                  </button>
                ) : null}
              </div>
            </motion.aside>
          ) : null}
        </AnimatePresence>
      </main>
    </MotionConfig>
  );
}
