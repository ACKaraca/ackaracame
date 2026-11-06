import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Moon, Sun, X } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { localize, useAppPreferences } from '../context/AppPreferences';
import { useContent } from '../context/Content';
import { activeIndexFor, corridorLayout } from '../components/corridor/corridorLayout';
import type { CorridorScene } from '../components/corridor/CorridorScene';
import { disciplineLabels, gameLabel } from '../components/projects/ProjectCard';
import type { PortfolioProject } from '../domain/content';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import '../components/corridor/corridor.css';

const copy = {
  tr: {
    tagline: 'Mimarlık · Yazılım · Yapay zekâ',
    index: 'Index',
    contact: 'İletişim',
    hint: 'Koridorda yürümek için kaydır • Açmak için bir işe tıkla',
    open: 'Aç',
    medium: 'Araçlar',
    context: 'Bağlam',
    place: 'Yer',
    year: 'Yıl',
    openProject: 'Projeyi aç',
    next: 'Sıradaki',
    close: 'Kapat',
    page: 'Sayfa',
    allItems: 'Koridordaki her şey',
    work: 'Tüm işler',
    about: 'Hakkımda',
    lab: 'Lab',
    journal: 'Günlük',
    heading: 'Ahmet Cem Karaca — portfolyo koridoru',
    theme: 'Renk temasını değiştir',
    locale: 'Switch to English',
  },
  en: {
    tagline: 'Architecture · Software · AI',
    index: 'Index',
    contact: 'Contact',
    hint: 'Scroll to walk the corridor • Click a piece to open it',
    open: 'Open',
    medium: 'Medium',
    context: 'Context',
    place: 'Place',
    year: 'Year',
    openProject: 'Open project',
    next: 'Next',
    close: 'Close',
    page: 'Page',
    allItems: 'Everything in the corridor',
    work: 'All work',
    about: 'About',
    lab: 'Lab',
    journal: 'Journal',
    heading: 'Ahmet Cem Karaca — portfolio corridor',
    theme: 'Toggle colour theme',
    locale: 'Türkçeye geç',
  },
} as const;

interface CorridorEntry {
  id: string;
  title: string;
  eyebrow: string;
  href: string;
  image?: string;
  aspect: number;
  palette: string[];
  project?: PortfolioProject;
}

const PAGE_PALETTES: string[][] = [['#5c74ff', '#45d0bf'], ['#e8a33d', '#ff5c8a'], ['#45d0bf', '#a6ff5c'], ['#93a7ff', '#ff5ce1'], ['#ff8a3d', '#5c74ff']];

const pad = (value: number) => String(value).padStart(2, '0');

const webglAvailable = () => {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
};

export default function HomePage() {
  const { settings, projects, journal, lab } = useContent();
  const { locale, setLocale, resolvedTheme, setTheme, motionEnabled } = useAppPreferences();
  const [, navigate] = useLocation();
  const t = copy[locale];

  const entries = useMemo<CorridorEntry[]>(() => {
    const projectEntries = projects.map((project) => {
      const cover = project.media.find((media) => media.role === 'cover' && media.kind === 'image' && media.assetState === 'ready' && media.src);
      const category = project.format === 'game' ? gameLabel[locale] : disciplineLabels[locale][project.discipline];
      return {
        id: project.slug,
        title: localize(project.title, locale),
        eyebrow: [category, project.year].filter(Boolean).join(' · '),
        href: `/work/${project.slug}`,
        image: cover?.src,
        aspect: cover?.width && cover.height ? cover.width / cover.height : 16 / 10,
        palette: project.cover.palette,
        project,
      };
    });
    const pages = [
      { id: 'work', title: t.work, href: '/work' },
      { id: 'about', title: t.about, href: '/about' },
      ...(lab.length > 0 ? [{ id: 'lab', title: t.lab, href: '/lab' }] : []),
      ...(journal.length > 0 ? [{ id: 'journal', title: t.journal, href: '/journal' }] : []),
      { id: 'contact', title: t.contact, href: '/contact' },
    ].map((page, index) => ({ ...page, eyebrow: t.page, aspect: 16 / 10, palette: PAGE_PALETTES[index % PAGE_PALETTES.length]! }));
    return [...projectEntries, ...pages];
  }, [projects, journal.length, lab.length, locale, t]);

  const stops = useMemo(() => corridorLayout(entries.length).stops, [entries.length]);
  const stageRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<CorridorScene | null>(null);
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const [focused, setFocused] = useState<number | null>(null);
  const [indexOpen, setIndexOpen] = useState(false);
  const [fallback, setFallback] = useState(false);
  const selectRef = useRef<(index: number) => void>(() => undefined);

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

  const scrollProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    return max > 0 ? window.scrollY / max : 0;
  };

  const scrollToEntry = (index: number) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: (stops[index] ?? 0) * max, behavior: motionEnabled ? 'smooth' : 'instant' });
  };

  const select = useCallback((index: number) => {
    const entry = entries[index];
    if (!entry) return;
    setIndexOpen(false);
    if (entry.project) {
      setFocused(index);
      sceneRef.current?.focus(index);
      return;
    }
    const scene = sceneRef.current;
    if (!scene) {
      navigate(entry.href);
      return;
    }
    void scene.dive(index).then(() => navigate(entry.href));
  }, [entries, navigate]);
  useEffect(() => { selectRef.current = select; }, [select]);

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
          items: entries.map((entry) => ({ label: entry.title, kind: entry.project ? 'project' : 'page', image: entry.image, aspect: entry.aspect, palette: entry.palette })),
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
  const focusedProject = focusedEntry?.project;
  const nextProjectIndex = focused === null ? null : (() => {
    for (let step = 1; step <= entries.length; step += 1) {
      const candidate = (focused + step) % entries.length;
      if (entries[candidate]?.project) return candidate;
    }
    return null;
  })();

  return (
    <main id="main-content" tabIndex={-1} className={`corridor${fallback ? ' corridor--fallback' : ''}`} data-focused={focused !== null ? 'true' : undefined}>
      <h1 className="sr-only">{t.heading}</h1>
      <div className="corridor__stage" ref={stageRef} aria-hidden="true" />
      <div className="corridor__pill" ref={pillRef} aria-hidden="true">
        {hovered !== null ? `${t.open} ${entries[hovered]?.title ?? ''}` : null}
      </div>
      <div className="corridor__track" style={{ height: `${entries.length * 70 + 100}vh` }} aria-hidden="true" />

      <header className="corridor-hud corridor-hud--top">
        <Link href="/" className="corridor-brand">
          <strong>{localize(settings.ownerName, locale)}</strong>
          <span>{t.tagline}</span>
        </Link>
        <nav className="corridor-hud__actions" aria-label={locale === 'tr' ? 'Ana navigasyon' : 'Primary navigation'}>
          <button type="button" className="corridor-chip" onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} aria-label={t.theme}>
            {resolvedTheme === 'dark' ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
          </button>
          <button type="button" className="corridor-chip" onClick={() => setLocale(locale === 'tr' ? 'en' : 'tr')} aria-label={t.locale}>
            {locale === 'tr' ? 'EN' : 'TR'}
          </button>
          <button type="button" className="corridor-chip" onClick={() => setIndexOpen((open) => !open)} aria-expanded={indexOpen || fallback} aria-controls="corridor-index">{t.index}</button>
          <Link href="/contact" className="corridor-chip">{t.contact}</Link>
        </nav>
      </header>

      {current && !fallback ? (
        <section className="corridor-hud corridor-hud--info" aria-live="polite">
          <p className="corridor-count">{pad(active + 1)} / {pad(entries.length)}</p>
          <button type="button" className="corridor-title" onClick={() => select(active)}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span key={current.id} className="corridor-title__word" aria-label={current.title}>
                {[...current.title].map((letter, index) => (
                  <span className="corridor-title__mask" key={`${letter}-${index}`} aria-hidden="true">
                    <motion.span
                      initial={{ y: '105%' }}
                      animate={{ y: '0%' }}
                      exit={{ y: '-105%' }}
                      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: index * 0.018 }}
                    >
                      {letter === ' ' ? ' ' : letter}
                    </motion.span>
                  </span>
                ))}
              </motion.span>
            </AnimatePresence>
          </button>
          <p className="corridor-meta">{current.eyebrow}</p>
          <p className="corridor-hint">{t.hint}</p>
        </section>
      ) : null}

      {!fallback ? (
        <nav className="corridor-hud corridor-scrubber" aria-label={t.allItems}>
          <ol>
            {entries.map((entry, index) => (
              <li key={entry.id}>
                <button type="button" onClick={() => scrollToEntry(index)} aria-current={index === active ? 'true' : undefined}>
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
              <Link href={entry.href} onClick={(event) => { if (!fallback) { event.preventDefault(); if (entry.project) scrollToEntry(index); select(index); } }}>
                <span className="corridor-index__num">{pad(index + 1)}</span>
                <span className="corridor-index__title">{entry.title}</span>
                <span className="corridor-index__meta">{entry.eyebrow}</span>
              </Link>
            </li>
          ))}
        </ol>
      </nav>

      {focusedEntry && focusedProject ? (
        <motion.aside
          key={focusedEntry.id}
          className="corridor-detail"
          role="dialog"
          aria-modal="false"
          aria-labelledby="corridor-detail-title"
          initial={{ x: '8%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
        >
          <button type="button" className="corridor-detail__close" onClick={closeFocus} aria-label={t.close} autoFocus><X aria-hidden="true" /></button>
          <p className="corridor-count">{pad((focused ?? 0) + 1)} / {pad(entries.length)} · {focusedEntry.eyebrow}</p>
          <h2 id="corridor-detail-title">{focusedEntry.title}</h2>
          <p className="corridor-detail__dek">{localize(focusedProject.dek, locale)}</p>
          <dl>
            <div><dt>{t.medium}</dt><dd>{focusedProject.technologies.slice(0, 4).join(', ')}</dd></div>
            {focusedProject.context ? <div><dt>{t.context}</dt><dd>{localize(focusedProject.context, locale)}</dd></div> : null}
            {focusedProject.location ? <div><dt>{t.place}</dt><dd>{localize(focusedProject.location, locale)}</dd></div> : null}
            {focusedProject.year ? <div><dt>{t.year}</dt><dd>{focusedProject.year}</dd></div> : null}
          </dl>
          <div className="corridor-detail__actions">
            <Link href={focusedEntry.href} className="corridor-cta">{t.openProject}<ArrowUpRight aria-hidden="true" /></Link>
            {nextProjectIndex !== null && nextProjectIndex !== focused ? (
              <button type="button" className="corridor-next" onClick={() => { scrollToEntry(nextProjectIndex); select(nextProjectIndex); }}>
                {t.next}: {entries[nextProjectIndex]?.title}<ArrowRight aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </motion.aside>
      ) : null}
    </main>
  );
}
