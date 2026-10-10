import {
  parseContentBundle,
  type ContentBundle,
  type JournalEntry,
  type PortfolioProject,
  type SiteSettings,
} from '../domain/content';
import generatedContent from './generated-content.json';

const localized = (tr: string, en: string) => ({ tr, en });

const projectImage = (
  slug: string,
  file: string,
  role: 'cover' | 'gallery',
  size: [number, number],
  alt: { tr: string; en: string },
  caption?: { tr: string; en: string },
) => ({
  id: `${slug}-${file}`,
  kind: 'image' as const,
  role,
  assetState: 'ready' as const,
  src: `/media/projects/${slug}/${file}.webp`,
  alt,
  ...(caption ? { caption } : {}),
  width: size[0],
  height: size[1],
  mimeType: 'image/webp',
});

const fallbackBundle = {
  settings: {
    siteName: localized('ACKaraca.me', 'ACKaraca.me'),
    ownerName: localized('Ahmet Cem Karaca', 'Ahmet Cem Karaca'),
    headline: localized(
      'Mimarlık ve yazılım arasında çalışan bir mimar ve geliştirici.',
      'An architect and developer working between architecture and software.',
    ),
    introduction: localized(
      'Karmaşık fikirleri okunur mekânlara, ürünlere ve araçlara dönüştürüyorum. Bu portfolyo; mimari düşünceyi, ürün geliştirmeyi ve deneysel üretimi aynı editoryal çatı altında toplar.',
      'I turn complex ideas into legible spaces, products, and tools. This portfolio brings architectural thinking, product development, and experimental making under one editorial roof.',
    ),
    location: localized('Birleşik Krallık / Türkiye · Uzaktan', 'UK / Türkiye · Remote'),
    contactEmail: 'info@ackaraca.me',
    canonicalUrl: 'https://ackaraca.me',
    defaultLocale: 'tr',
    supportedLocales: ['tr', 'en'],
    availability: 'open-to-inquiries',
    socialLinks: [
      {
        kind: 'social',
        label: localized('GitHub profili', 'GitHub profile'),
        href: 'https://github.com/ahmetcemkaraca',
        newTab: true,
      },
      {
        kind: 'social',
        label: localized('LinkedIn profili', 'LinkedIn profile'),
        href: 'https://www.linkedin.com/in/ahmet-cem-karaca/',
        newTab: true,
      },
    ],
    palette: {
      background: '#f5f2ea',
      foreground: '#121417',
      accent: '#197fe6',
    },
    footerNote: localized(
      'Are you really surprised you’re here?',
      'Are you really surprised you’re here?',
    ),
    defaultSeo: {
      title: localized(
        'Ahmet Cem Karaca — Mimar ve Geliştirici',
        'Ahmet Cem Karaca — Architect and Developer',
      ),
      description: localized(
        'Ahmet Cem Karaca’nın mimarlık, yazılım, dijital ürün ve deneysel üretim çalışmalarından oluşan iki dilli kişisel portfolyosu.',
        'The bilingual portfolio of Ahmet Cem Karaca, spanning architecture, software, digital products, and experimental making.',
      ),
      noIndex: false,
    },
  },
  projects: [
    {
      slug: 'draw-or-die',
      status: 'published',
      discipline: 'hybrid',
      format: 'product',
      order: 10,
      featured: true,
      title: localized('Draw Or Die', 'Draw Or Die'),
      dek: localized(
        'Mimari pafta, render ve PDF’leri farklı jüri bakışlarıyla inceleyen yapay zekâ destekli mimarlık jüri simülatörü.',
        'An AI-assisted architecture jury simulator that reviews boards, renders, and PDFs through distinct critic perspectives.',
      ),
      year: 2026,
      context: localized('Kişisel çalışma', 'Personal work'),
      technologies: [
        'Next.js 15',
        'React 19',
        'TypeScript',
        'Tailwind CSS',
        'Framer Motion',
        'Appwrite',
        'Gemini',
        'Stripe',
      ],
      topics: ['architecture', 'ai-critique', 'design-review'],
      cover: {
        slug: 'draw-or-die',
        palette: ['#0f172a', '#f8fafc', '#ef4444'],
        visualVariant: 'code-canvas',
        alt: localized(
          'Draw Or Die mimarlık jüri simülasyonu',
          'Draw Or Die architecture jury simulation',
        ),
      },
      media: [
        projectImage(
          'draw-or-die',
          'cover',
          'cover',
          [1600, 1000],
          localized('Draw Or Die açılış ekranı', 'Draw Or Die landing screen'),
          localized('Canlı ürünün açılış ekranı: paftanı yükle, jüriyle yüzleş.', 'The live product landing screen: upload your board and face the jury.'),
        ),
        projectImage(
          'draw-or-die',
          'studio-desk',
          'gallery',
          [1600, 1000],
          localized('Draw Or Die Studio Desk yükleme adımı', 'Draw Or Die Studio Desk upload step'),
          localized('Studio Desk: pafta yükleme alanı, proje savunma formu, jüri sertliği ve persona seçimi.', 'Studio Desk: board upload, the project defence form, jury harshness, and persona selection.'),
        ),
        projectImage(
          'draw-or-die',
          'rapido-store',
          'gallery',
          [1600, 1000],
          localized('Draw Or Die Rapido mağazası', 'Draw Or Die Rapido store'),
          localized('Premium ve Rapido mağazası: analiz modlarının kredi maliyetleri.', 'The Premium and Rapido store with credit costs per analysis mode.'),
        ),
      ],
      links: [
        {
          kind: 'live',
          label: localized('Draw Or Die’ı aç', 'Open Draw Or Die'),
          href: 'https://drawordie.app',
          newTab: true,
        },
        {
          kind: 'source',
          label: localized('GitHub reposu', 'GitHub repository'),
          href: 'https://github.com/ACKaraca/draw-or-die',
          newTab: true,
        },
      ],
      metrics: [
        {
          id: 'analysis-modes',
          label: localized('Analiz modu', 'Analysis modes'),
          value: localized('9', '9'),
          context: localized(
            'Kapsam sayısı, projenin herkese açık README belgesinde listelenen analiz modlarına dayanır.',
            'This scope count comes from the analysis modes listed in the public project README.',
          ),
          verified: true,
        },
        {
          id: 'jury-personas',
          label: localized('Jüri personası', 'Jury personas'),
          value: localized('6', '6'),
          context: localized(
            'Kapsam sayısı, projenin herkese açık README belgesinde listelenen jüri personalarına dayanır.',
            'This scope count comes from the jury personas listed in the public project README.',
          ),
          verified: true,
        },
      ],
      blocks: [
        {
          id: 'draw-or-die-intent',
          type: 'text',
          eyebrow: localized('Ürün fikri', 'Product idea'),
          heading: localized('Jüri provasını yapılandırılmış geri bildirime çevirmek', 'Turning jury rehearsal into structured feedback'),
          body: localized(
            'Draw Or Die; mimarlık öğrencilerinin pafta, render ve PDF teslimlerini bir jüri öncesinde farklı eleştiri biçimleriyle sınamasına odaklanıyor. Analiz çıktısı revizyon akışına taşınabiliyor; savunma sohbeti ise kullanıcının tasarım kararlarını sözlü olarak gerekçelendirmesine alan açıyor.',
            'Draw Or Die helps architecture students test boards, renders, and PDF submissions through different forms of critique before a jury. Analysis can feed a revision flow, while defence chat gives users room to articulate and justify design decisions.',
          ),
        },
        {
          id: 'draw-or-die-system',
          type: 'text',
          eyebrow: localized('Sistem', 'System'),
          heading: localized('Analiz, savunma ve topluluk katmanları', 'Analysis, defence, and community layers'),
          body: localized(
            'Next.js 15, React 19 ve TypeScript ürün yüzeyini; Appwrite veri ve kimlik katmanlarını; Gemini yapay zekâ analizini destekliyor. Stripe ürünün ödeme akışında yer alırken topluluk galerisi, incelenen çalışmalar için ayrı bir keşif yüzeyi sağlıyor.',
            'Next.js 15, React 19, and TypeScript support the product surface; Appwrite supports data and identity; and Gemini supports AI analysis. Stripe is part of the payment flow, while the community gallery provides a separate discovery surface for reviewed work.',
          ),
        },
        {
          id: 'draw-or-die-facts',
          type: 'facts',
          heading: localized('Proje profili', 'Project profile'),
          items: [
            {
              label: localized('Biçim', 'Format'),
              value: localized('Mimarlık jüri simülatörü', 'Architecture jury simulator'),
            },
            {
              label: localized('Odak', 'Focus'),
              value: localized('Analiz, revizyon ve savunma', 'Analysis, revision, and defence'),
            },
          ],
        },
      ],
      relatedSlugs: ['archbuilder', 'hocapuanla'],
      seo: {
        title: localized(
          'Draw Or Die — Yapay Zekâ Mimarlık Jürisi',
          'Draw Or Die — AI Architecture Jury',
        ),
        description: localized(
          'Pafta, render ve PDF analizi; revizyon akışı, savunma sohbeti ve topluluk galerisi sunan yapay zekâ destekli mimarlık jüri simülatörü.',
          'An AI-assisted architecture jury simulator for board, render, and PDF analysis, with revision, defence chat, and a community gallery.',
        ),
        noIndex: false,
      },
    },
    {
      slug: 'peakactivity',
      status: 'published',
      discipline: 'software',
      format: 'product',
      order: 40,
      featured: true,
      title: localized('PeakActivity', 'PeakActivity'),
      dek: localized(
        'Kişisel etkinlik içgörüleri için ActivityWatch üzerine kurulan, yerel öncelikli ve gizlilik odaklı bir etkinlik takip platformu.',
        'A local-first, privacy-focused activity tracking platform built on ActivityWatch for personal activity insights.',
      ),
      year: 2026,
      context: localized('Kişisel çalışma', 'Personal work'),
      releaseStage: 'pre-alpha',
      technologies: ['Python', 'Rust', 'Vue', 'Tauri', 'SQLCipher'],
      topics: ['productivity', 'digital-wellbeing', 'activity-data'],
      cover: {
        slug: 'peakactivity',
        palette: ['#07111f', '#38bdf8', '#a3e635'],
        visualVariant: 'product-orbit',
        alt: localized('PeakActivity yetenek durumu', 'PeakActivity capability status'),
      },
      media: [
        projectImage(
          'peakactivity',
          'cover',
          'cover',
          [1600, 1000],
          localized('PeakActivity yetenek durumu özeti', 'PeakActivity capability status summary'),
          localized('Depodaki yetenek kaydından hazırlanan özet; ürün arayüzü değildir.', 'A summary prepared from the repository capability registry; not the product interface.'),
        ),
      ],
      links: [],
      metrics: [],
      blocks: [
        {
          id: 'peakactivity-question',
          type: 'text',
          eyebrow: localized('Soru', 'Question'),
          heading: localized('Ham etkinlik verisi nasıl okunur?', 'How should raw activity data be read?'),
          body: localized(
            'PeakActivity, bilgisayar başında geçen zamanı ham bir süre kaydı olarak bırakmak yerine kişisel içgörüye çevirmeyi hedefliyor. Pencere ve boşta kalma verisi cihazda toplanıyor ve saklanıyor; kurallar, raporlar ve manuel süre girişleri bu yerel veri üzerinde çalışıyor.',
            'PeakActivity aims to turn time spent at the computer into personal insight rather than a raw duration log. Window and idle data are collected and stored on the device, while rules, reports, and manual time entries work on that local data.',
          ),
        },
        {
          id: 'peakactivity-layers',
          type: 'text',
          eyebrow: localized('Durum', 'Status'),
          heading: localized('ActivityWatch temelinden bağımsız bir ürüne', 'From an ActivityWatch base to an independent product'),
          body: localized(
            'Proje, ActivityWatch’ın açık kaynak bileşenlerini sabitlenmiş bir temel olarak koruyan pre-alpha bir kaynak çalışma alanı; henüz kurulabilir bir sürüm değil. Tauri masaüstü kabuğu, depolama öncesi filtreleme, isteğe bağlı SQLCipher ve kural tabanlı sınıflandırma deneysel aşamada. Varsayılan şifreli depolama, uçtan uca şifreli senkronizasyon ve gizlilik güvenlik duvarı planlanıyor. Depo şu an özel olduğu için kaynak bağlantısı paylaşılmıyor.',
            'The project is a pre-alpha source workspace that keeps ActivityWatch’s open-source components as a pinned base; it is not an installable release yet. The Tauri desktop shell, pre-storage filtering, optional SQLCipher, and rule-based classification are experimental, while encrypted-by-default storage, end-to-end encrypted sync, and a privacy firewall are planned. The repository is private for now, so no source link is shared.',
          ),
        },
        {
          id: 'peakactivity-facts',
          type: 'facts',
          heading: localized('Proje profili', 'Project profile'),
          items: [
            {
              label: localized('Temel', 'Base'),
              value: localized('ActivityWatch türevi', 'ActivityWatch derivative'),
            },
            {
              label: localized('Aşama', 'Stage'),
              value: localized('Pre-alpha kaynak çalışma alanı', 'Pre-alpha source workspace'),
            },
            {
              label: localized('Ürün alanı', 'Product area'),
              value: localized('Üretkenlik ve dijital sağlık', 'Productivity and digital wellbeing'),
            },
          ],
        },
      ],
      relatedSlugs: ['hocapuanla', 'duaapp'],
      seo: {
        title: localized(
          'PeakActivity — Yerel Öncelikli Etkinlik Takibi',
          'PeakActivity — Local-First Activity Tracking',
        ),
        description: localized(
          'ActivityWatch üzerine kurulan; cihazda saklanan etkinlik verisini kurallar ve raporlarla kişisel içgörüye çeviren pre-alpha platform.',
          'A pre-alpha platform built on ActivityWatch that turns on-device activity data into personal insight through rules and reports.',
        ),
        noIndex: false,
      },
    },
    {
      slug: 'hocapuanla',
      status: 'published',
      discipline: 'software',
      format: 'product',
      order: 50,
      featured: true,
      title: localized('HocaPuanla', 'HocaPuanla'),
      dek: localized(
        'Anonim değerlendirme, arama, profil, karşılaştırma ve moderasyon akışlarını birleştiren öğretim elemanı keşif platformu.',
        'A professor discovery platform combining anonymous reviews, search, profiles, comparison, and moderation.',
      ),
      year: 2026,
      context: localized('Kişisel çalışma', 'Personal work'),
      releaseStage: 'release-candidate',
      technologies: [
        'Next.js 16',
        'React 19',
        'TypeScript',
        'Tailwind CSS 4',
        'shadcn/ui',
        'Radix UI',
        'Firebase',
        'Upstash',
      ],
      topics: ['education', 'search', 'moderation'],
      cover: {
        slug: 'hocapuanla',
        palette: ['#111827', '#f8fafc', '#10b981'],
        visualVariant: 'product-orbit',
        alt: localized('HocaPuanla arama ve profil yüzeyi', 'HocaPuanla search and profile surface'),
      },
      media: [
        projectImage(
          'hocapuanla',
          'cover',
          'cover',
          [1600, 720],
          localized('HocaPuanla ana sayfa araması', 'HocaPuanla home search'),
          localized('Ana sayfa: hoca, üniversite ve bölüm araması.', 'Home page search across professors, universities, and departments.'),
        ),
        projectImage(
          'hocapuanla',
          'search',
          'gallery',
          [1600, 1000],
          localized('HocaPuanla arama sonuçları', 'HocaPuanla search results'),
          localized('Filtreli arama sonuçları ve üniversite kartı.', 'Filtered search results with a university card.'),
        ),
        projectImage(
          'hocapuanla',
          'university',
          'gallery',
          [1600, 1000],
          localized('HocaPuanla üniversite profili', 'HocaPuanla university profile'),
          localized('Üniversite profili: istatistik kartları ve hoca/değerlendirme panelleri.', 'University profile with stat cards and professor and review panels.'),
        ),
      ],
      links: [],
      metrics: [],
      blocks: [
        {
          id: 'hocapuanla-scope',
          type: 'text',
          eyebrow: localized('Kapsam', 'Scope'),
          heading: localized('Arama, profil ve anonim geri bildirim', 'Search, profiles, and anonymous feedback'),
          body: localized(
            'HocaPuanla; öğretim elemanı arama, profil inceleme, anonim değerlendirme ve karşılaştırma akışlarını tek bir keşif deneyiminde bir araya getiriyor. Kullanıcılar kendi değerlendirmelerini PIN ile yönetebiliyor.',
            'HocaPuanla brings professor search, profile exploration, anonymous reviews, and comparison into one discovery experience. Users can manage their own reviews with a PIN.',
          ),
        },
        {
          id: 'hocapuanla-moderation',
          type: 'text',
          eyebrow: localized('Sistem', 'System'),
          heading: localized('Moderasyonu ürünün parçası olarak ele almak', 'Treating moderation as part of the product'),
          body: localized(
            'Next.js 16, React 19 ve TypeScript ürün yüzeyini; Tailwind CSS 4 ile shadcn/ui ve Radix UI bileşen sistemini kuruyor. Firebase veri ve moderasyon katmanlarını destekliyor; Upstash ise README’de isteğe bağlı altyapı bileşeni olarak tanımlanıyor.',
            'Next.js 16, React 19, and TypeScript form the product surface, with Tailwind CSS 4, shadcn/ui, and Radix UI providing the component system. Firebase supports data and moderation, while the README identifies Upstash as optional infrastructure.',
          ),
        },
        {
          id: 'hocapuanla-facts',
          type: 'facts',
          heading: localized('Proje profili', 'Project profile'),
          items: [
            {
              label: localized('Ana akış', 'Primary flow'),
              value: localized('Arama, değerlendirme ve karşılaştırma', 'Search, reviews, and comparison'),
            },
            {
              label: localized('Destekleyici katman', 'Supporting layer'),
              value: localized('PIN yönetimi ve moderasyon', 'PIN management and moderation'),
            },
          ],
        },
      ],
      relatedSlugs: ['peakactivity', 'archbuilder'],
      seo: {
        title: localized(
          'HocaPuanla — Eğitmen Keşif Platformu',
          'HocaPuanla — Instructor Discovery Platform',
        ),
        description: localized(
          'Arama, profil, anonim değerlendirme, PIN yönetimi, karşılaştırma ve moderasyon akışlarını birleştiren Next.js 16 ürünü.',
          'A Next.js 16 product combining search, profiles, anonymous reviews, PIN-based review management, comparison, and moderation.',
        ),
        noIndex: false,
      },
    },
    {
      slug: 'archbuilder',
      status: 'published',
      discipline: 'hybrid',
      format: 'product',
      order: 20,
      featured: true,
      title: localized('ArchBuilder', 'ArchBuilder'),
      dek: localized(
        'Ölçülü 2D çizim, parametrik bina modeli, bağlantılı plan/3D/kesit görünümleri ve IFC, DXF, PDF dışa aktarımı sunan açık çekirdekli mimari CAD/BIM editörü.',
        'An open-core architectural CAD/BIM editor with precise 2D drafting, a parametric building model, linked plan/3D/section views, and IFC, DXF, and PDF export.',
      ),
      context: localized('Mimarlık ve yazılım ürünü', 'Architecture and software product'),
      releaseStage: 'pre-alpha',
      technologies: ['TypeScript', 'React', 'Three.js', 'web-ifc', 'Vite', 'Electron'],
      topics: ['architecture', 'cad', 'bim'],
      cover: {
        slug: 'archbuilder',
        palette: ['#101828', '#f2efe7', '#197fe6'],
        visualVariant: 'architectural-grid',
        alt: localized('ArchBuilder CAD/BIM editörü', 'ArchBuilder CAD/BIM editor'),
      },
      media: [
        projectImage(
          'archbuilder',
          'cover',
          'cover',
          [1600, 1000],
          localized('ArchBuilder plan ve 3D bağlantılı görünüm', 'ArchBuilder linked plan and 3D view'),
          localized('Plan + 3D düzeni: aynı duvar iki görünümde birlikte seçili.', 'The Plan + 3D layout, with the same wall selected in both views.'),
        ),
        projectImage(
          'archbuilder',
          'plan',
          'gallery',
          [1600, 1000],
          localized('ArchBuilder zemin kat planı', 'ArchBuilder ground-floor plan'),
          localized('Zemin kat planı: ölçülü duvarlar, kapı ve pencereler, merdiven, asansör ve özellikler paneli.', 'Ground-floor plan with measured walls, doors and windows, stair, lift, and the properties panel.'),
        ),
        projectImage(
          'archbuilder',
          'model-3d',
          'gallery',
          [1600, 1000],
          localized('ArchBuilder 3D proje görünümü', 'ArchBuilder 3D project view'),
          localized('Örnek proje: arazide iki adet 12 katlı konut bloğu.', 'Sample project: two 12-storey residential blocks on site.'),
        ),
        projectImage(
          'archbuilder',
          'section',
          'gallery',
          [1600, 1000],
          localized('ArchBuilder A-A kesiti', 'ArchBuilder section A-A'),
          localized('Aynı modelden üretilen A-A kesiti: merdiven ve asansör çekirdeği.', 'Section A-A generated from the same model through the stair and lift core.'),
        ),
      ],
      links: [],
      metrics: [],
      blocks: [
        {
          id: 'archbuilder-model',
          type: 'text',
          eyebrow: localized('Ürün', 'Product'),
          heading: localized('Tek model, birbirine bağlı görünümler', 'One model, linked views'),
          body: localized(
            'ArchBuilder; ölçülü duvarları, perde duvarları, kapı ve pencereleri, döşeme, çatı, merdiven, asansör, rampa, mahal ve mobilyaları birden fazla bina ve kat üzerinde modelliyor. Plan, 3D, kesit ve pafta görünümleri aynı modeli paylaşıyor; bir görünümde seçilen eleman diğerlerinde de seçili kalıyor.',
            'ArchBuilder models measured walls, curtain walls, doors and windows, slabs, roofs, stairs, lifts, ramps, rooms, and furniture across multiple buildings and storeys. Plan, 3D, section, and sheet views share one model, so an element selected in one view stays selected in the others.',
          ),
        },
        {
          id: 'archbuilder-open-core',
          type: 'text',
          eyebrow: localized('Mimari', 'Architecture'),
          heading: localized('Hesapsız, çevrimdışı ve açık çekirdek', 'Account-free, offline, and open-core'),
          body: localized(
            'Apache-2.0 lisanslı açık çekirdek; model, geometri, komut, aile, depolama ve birlikte çalışabilirlik paketlerine ayrılıyor. Editör hesap gerektirmeden çevrimdışı çalışıyor, projeleri yerelde veya taşınabilir .archbuilder dosyalarında saklıyor ve doğrudan IFC, DXF ile vektör PDF üretiyor. İsteğe bağlı senkronizasyon, yapay zekâ eklenti API’si ve Windows paketi aşamalı olarak geliştiriliyor.',
            'The Apache-2.0 open core is split into model, geometry, command, family, storage, and interoperability packages. The editor works offline without an account, stores projects locally or in portable .archbuilder files, and exports native IFC, DXF, and vector PDF. Optional sync, an AI extension API, and a Windows package are being developed in stages.',
          ),
        },
        {
          id: 'archbuilder-facts',
          type: 'facts',
          heading: localized('Proje profili', 'Project profile'),
          items: [
            {
              label: localized('Durum', 'Status'),
              value: localized('Pre-alpha; aktif geliştirme sürüyor', 'Pre-alpha; active development continues'),
            },
            {
              label: localized('Dosya alışverişi', 'File exchange'),
              value: localized('IFC, DXF ve vektör PDF', 'IFC, DXF, and vector PDF'),
            },
            {
              label: localized('Lisans', 'Licence'),
              value: localized('Apache-2.0 açık çekirdek', 'Apache-2.0 open core'),
            },
          ],
        },
      ],
      relatedSlugs: ['draw-or-die', 'hocapuanla'],
      seo: {
        title: localized(
          'ArchBuilder — Açık Çekirdekli Mimari CAD/BIM',
          'ArchBuilder — Open-Core Architectural CAD/BIM',
        ),
        description: localized(
          'Ölçülü çizim, parametrik bina modeli, bağlantılı plan/3D/kesit görünümleri ve IFC, DXF, PDF dışa aktarımı sunan çevrimdışı web editörü.',
          'An offline web editor with precise drafting, a parametric building model, linked plan/3D/section views, and IFC, DXF, and PDF export.',
        ),
        noIndex: false,
      },
    },
    {
      slug: 'duaapp',
      status: 'published',
      discipline: 'software',
      format: 'product',
      order: 70,
      featured: false,
      title: localized('DuaAPP', 'DuaAPP'),
      dek: localized(
        'Beş inanç geleneğinden dua ve kutsal metinleri günlük pratik araçları ve yapay zekâ rehberliğiyle birleştiren mobil manevi yol arkadaşı.',
        'A mobile spiritual companion combining prayers and sacred texts from five traditions with daily practice tools and AI guidance.',
      ),
      releaseStage: 'stable',
      technologies: [
        'Flutter',
        'Dart',
        'Riverpod',
        'GoRouter',
        'Appwrite Functions',
        'Appwrite Database',
        'Appwrite Auth',
      ],
      topics: ['mobile', 'spiritual-practice', 'multi-tradition'],
      cover: {
        slug: 'duaapp',
        palette: ['#0f172a', '#f7f3e8', '#a78bfa'],
        visualVariant: 'spatial-gradient',
        alt: localized('DuaAPP manevi pratik akışı', 'DuaAPP spiritual practice flow'),
      },
      media: [
        projectImage(
          'duaapp',
          'cover',
          'cover',
          [1600, 1000],
          localized('DuaAPP ana ekran, dua, kıble ve yapay zekâ ekranları', 'DuaAPP home, prayer, qibla, and AI screens'),
          localized('Uygulamanın kendi önizleme testleriyle üretilmiş gerçek ekranlar: ana sayfa, dua detayı, kıble bulucu ve manevi rehber.', 'Real screens rendered by the app’s own preview tests: home, prayer detail, qibla finder, and spiritual guide.'),
        ),
      ],
      links: [
        {
          kind: 'updates',
          label: localized('DuaAPP güncellemeleri', 'DuaAPP updates'),
          href: '/dua/news',
          newTab: false,
        },
      ],
      metrics: [],
      blocks: [
        {
          id: 'duaapp-content',
          type: 'text',
          eyebrow: localized('İçerik deneyimi', 'Content experience'),
          heading: localized('Birden fazla geleneği tek deneyimde sunmak', 'Bringing multiple traditions into one experience'),
          body: localized(
            'DuaAPP; İslam, Hristiyanlık, Yahudilik, Budizm ve Hinduizm gelenekleri için dua koleksiyonları ve kutsal kitap erişimi sunuyor. Dua sayacı, yapay zekâ rehberliği ve rüya günlüğü günlük manevi pratiği destekleyen ayrı araçlar olarak aynı uygulamada buluşuyor.',
            'DuaAPP provides prayer collections and access to sacred texts across Islam, Christianity, Judaism, Buddhism, and Hinduism. A prayer counter, AI guidance, and dream journal come together as distinct tools supporting daily spiritual practice.',
          ),
        },
        {
          id: 'duaapp-localization',
          type: 'text',
          eyebrow: localized('Sistem', 'System'),
          heading: localized('Mobil durum ve servis katmanlarını ayırmak', 'Separating mobile state and service layers'),
          body: localized(
            'Flutter uygulama yüzeyini, Riverpod durum yönetimini, GoRouter gezinmeyi kuruyor. Appwrite Functions, Database ve Auth ise sunucu işlevlerini, içeriği ve kullanıcı kimliğini destekleyen arka uç katmanlarını oluşturuyor.',
            'Flutter forms the application surface, Riverpod handles state, and GoRouter handles navigation. Appwrite Functions, Database, and Auth provide the backend layers for server logic, content, and user identity.',
          ),
        },
        {
          id: 'duaapp-facts',
          type: 'facts',
          heading: localized('Proje profili', 'Project profile'),
          items: [
            {
              label: localized('Sürüm', 'Release'),
              value: localized('Kararlı · üç ayda bir güncelleme', 'Stable · quarterly updates'),
            },
            {
              label: localized('İçerik kapsamı', 'Content scope'),
              value: localized('Beş inanç geleneği', 'Five faith traditions'),
            },
          ],
        },
      ],
      relatedSlugs: ['where-to-go', 'archbuilder'],
      seo: {
        title: localized(
          'DuaAPP — Çok Gelenekli Manevi Yol Arkadaşı',
          'DuaAPP — Multi-Tradition Spiritual Companion',
        ),
        description: localized(
          'Beş inanç geleneği için dua, sayaç, yapay zekâ rehberliği, rüya günlüğü ve kutsal metinleri birleştiren Flutter ve Appwrite uygulaması.',
          'A Flutter and Appwrite companion combining prayers, a counter, AI guidance, dream journaling, and sacred texts across five faith traditions.',
        ),
        noIndex: false,
      },
    },
    {
      slug: 'where-to-go',
      status: 'published',
      discipline: 'software',
      format: 'product',
      order: 80,
      featured: false,
      title: localized('Where To-Go', 'Where To-Go'),
      dek: localized(
        'Çiftlerin veya iki kişilik grupların mekânları kaydırarak değerlendirdiği ve karşılıklı seçimde eşleştiği gerçek zamanlı keşif uygulaması.',
        'A real-time discovery app where couples or two-person groups swipe through places and match when both choose the same option.',
      ),
      releaseStage: 'release-candidate',
      technologies: [
        'Flutter',
        'Dart',
        'Riverpod',
        'Firebase',
        'Google Maps',
        'Google Places',
        'Deep Links',
      ],
      topics: ['mobile', 'place-discovery', 'realtime-sessions'],
      cover: {
        slug: 'where-to-go',
        palette: ['#102a43', '#f0f4f8', '#2dd4bf'],
        visualVariant: 'product-orbit',
        alt: localized('Where To-Go harita ve keşif akışı', 'Where To-Go map and discovery flow'),
      },
      media: [
        projectImage(
          'where-to-go',
          'cover',
          'cover',
          [1600, 1000],
          localized('Where To-Go karşılama ekranları', 'Where To-Go onboarding screens'),
          localized('Yayındaki uygulamanın karşılama adımları: birlikte karar ver, kaydır ve eşleş.', 'Onboarding steps from the live app: decide together, then swipe and match.'),
        ),
        projectImage(
          'where-to-go',
          'mockups',
          'gallery',
          [1600, 1000],
          localized('Where To-Go kaydırma ve eşleşme tasarımları', 'Where To-Go swipe and match designs'),
          localized('Tasarım maketi: mekân kaydırma kartı ve eşleşme bulundu ekranı.', 'Design mockups: the place swipe card and the match-found screen.'),
        ),
      ],
      links: [
        {
          kind: 'updates',
          label: localized('Proje notları', 'Project notes'),
          href: '/wheretogo/news',
          newTab: false,
        },
        {
          kind: 'privacy',
          label: localized('Gizlilik politikası', 'Privacy policy'),
          href: '/wheretogo/privacy',
          newTab: false,
        },
        {
          kind: 'terms',
          label: localized('Kullanım koşulları', 'Terms of use'),
          href: '/wheretogo/terms',
          newTab: false,
        },
      ],
      metrics: [],
      blocks: [
        {
          id: 'where-to-go-discovery',
          type: 'text',
          eyebrow: localized('Ürün fikri', 'Product idea'),
          heading: localized('İki kişinin seçimlerini ortak karara çevirmek', 'Turning two preferences into one decision'),
          body: localized(
            'Where To-Go, çiftler veya iki kişilik gruplar için Tinder benzeri bir mekân keşif akışı kuruyor. Google Places seçenekleri kaydırma arayüzünde sunuluyor; iki katılımcının da aynı yeri seçmesi ortak bir eşleşme üretiyor.',
            'Where To-Go creates a Tinder-style place discovery flow for couples or two-person groups. Google Places options appear in a swipe interface, and a shared match is created when both participants choose the same place.',
          ),
        },
        {
          id: 'where-to-go-session',
          type: 'text',
          eyebrow: localized('Oturum', 'Session'),
          heading: localized('Gerçek zamanlı katılım ve derin bağlantılar', 'Real-time participation and deep links'),
          body: localized(
            'Firebase gerçek zamanlı iki kişilik oturumu ve karşılıklı eşleşme durumunu destekliyor; derin bağlantılar ikinci katılımcının doğru oturuma katılmasını sağlıyor. Flutter ve Riverpod mobil ürün yüzeyi ile durum akışını kuruyor.',
            'Firebase supports the real-time two-person session and mutual match state, while deep links bring the second participant into the correct session. Flutter and Riverpod form the mobile product surface and state flow.',
          ),
        },
        {
          id: 'where-to-go-facts',
          type: 'facts',
          heading: localized('Proje profili', 'Project profile'),
          items: [
            {
              label: localized('Platform', 'Platform'),
              value: localized('iOS ve Android', 'iOS and Android'),
            },
            {
              label: localized('Geliştirme durumu', 'Development status'),
              value: localized('Sürüm adayı; aktif geliştirme sürüyor', 'Release candidate; active development continues'),
            },
          ],
        },
      ],
      relatedSlugs: ['duaapp', 'peakactivity'],
      seo: {
        title: localized(
          'Where To-Go — İki Kişilik Mekân Keşfi',
          'Where To-Go — Place Discovery for Two',
        ),
        description: localized(
          'Flutter, Riverpod, Firebase ve Google Places ile gerçek zamanlı oturum, karşılıklı eşleşme ve derin bağlantı sunan iki kişilik keşif uygulaması.',
          'A two-person discovery app using Flutter, Riverpod, Firebase, and Google Places for real-time sessions, mutual matches, and deep links.',
        ),
        noIndex: false,
      },
    },
    {
      slug: 'attalus',
      status: 'published',
      discipline: 'software',
      format: 'game',
      order: 110,
      featured: false,
      title: localized('Attalus', 'Attalus'),
      dek: localized(
        'Alternatif bir 2017’de, işgal altındaki Antalya’da geçen taktiksel bir FPS. Bilgi topla, takımınla plan kur, harekete geç ve her kararın askerler ile siviller üzerindeki bedelini gör.',
        'A tactical first-person shooter set in an alternate 2017, in occupied Antalya. Gather intel, plan with your squad, commit to an approach and see what each decision costs soldiers and civilians alike.',
      ),
      year: 2027,
      context: localized('Geliştirilen oyun', 'Game in development'),
      releaseStage: 'pre-alpha',
      technologies: ['Unreal Engine 5', 'Blueprints', 'Advanced Locomotion System'],
      topics: ['game', 'tactical-fps', 'alternate-history'],
      cover: {
        slug: 'attalus',
        palette: ['#0b1220', '#e89a4f', '#f4efe8'],
        visualVariant: 'spatial-gradient',
        alt: localized('Attalus kapak illüstrasyonu', 'Attalus cover illustration'),
      },
      media: [
        projectImage(
          'attalus',
          'cover',
          'cover',
          [1600, 900],
          localized('Attalus: Antalya kıyı hattı kapak görseli', 'Attalus: Antalya coastline key art'),
          localized('Kapak görseli: işgal altındaki Antalya kıyı hattında görev 01.', 'Key art: mission 01 on the coastline of an occupied Antalya.'),
        ),
      ],
      links: [],
      metrics: [],
      blocks: [
        {
          id: 'attalus-story-1',
          type: 'text',
          eyebrow: localized('Dünya ve hikâye', 'World and story'),
          heading: localized('Başka yöne akan bir tarihte, tanıdık sokaklarda geçen bir savaş', 'A war on familiar streets, in a history that took another turn'),
          body: localized(
            '1995’te Heidelberg’de patlayan bir kirli bomba dünyanın gidişatını değiştirir. 2017’ye gelindiğinde Avrupa’nın büyük bölümü yeni bir ittifakın eline geçmiştir ve Türkiye dört cepheden kuşatılmıştır. Oyuncu, çocukken o patlamaya tanık olan, ailesiyle Almanya’dan sınır dışı edilen ve sonunda asker olan AAA’nın yerindedir. Aksu’dan Kaleiçi’ne, Düden Şelaleleri’nden Konyaaltı Limanı’na uzanan sefer; kahramanlık nutuklarından uzak, hayatta kalmayı, kardeşliği ve nefretin bedelini anlatan ağır ve karakter odaklı bir hikâye kurar.',
            'In 1995 a dirty bomb detonates in Heidelberg and bends the course of history. By 2017 much of Europe has fallen to a new alliance and Turkey is besieged on four fronts. You play as AAA, who witnessed that blast as a child, was deported from Germany with his family and grew up to become a soldier. The campaign runs from Aksu to Kaleiçi, from the Düden Falls to Konyaaltı Harbour, telling a grounded, character-driven story about survival, brotherhood and the price of hatred rather than heroics.',
          ),
        },
        {
          id: 'attalus-story-2',
          type: 'text',
          eyebrow: localized('Nasıl oynanır', 'How it plays'),
          heading: localized('Önce gözle, sonra planla: her çatışmanın birden fazla çözümü var', 'Observe first, then plan: every fight has more than one answer'),
          body: localized(
            'Her karşılaşma aynı hedefe birden fazla yoldan ulaşmaya izin verir. Leyla’nın dronuyla düşmanları işaretleyin, Kaya’ya baskı ateşi açtırın, Can’la duvarı patlatıp yeni bir giriş açın ya da sessizce ilerleyin. Otomatik siper, mermi düşüşü, tepme, şarjör yönetimi ve bakım isteyen silahlar gerçekçiliği karar düzeyinde tutar. Görevler güvenli evde brifingle başlar; bölüm sonunda kayıplarınız, kurtardığınız siviller ve dünyada bıraktığınız izler hikâyenin devamına taşınır.',
            'Every encounter lets you reach the same objective in more than one way. Mark enemies with Leyla\'s drone, have Kaya lay down suppressive fire, blow a new entry point through a wall with Can, or move in quietly. Automatic cover, bullet drop, recoil, magazine management and weapons that need maintenance keep realism at the level of decisions. Missions begin with a briefing at the safe house, and the losses you take, the civilians you save and the scars you leave on the world carry forward into the story.',
          ),
        },
        {
          id: 'attalus-facts',
          type: 'facts',
          heading: localized('Oyun profili', 'Game profile'),
          items: [
            { label: localized('Tür', 'Genre'), value: localized('Taktiksel FPS', 'Tactical FPS') },
            { label: localized('Platform', 'Platform'), value: localized('PC (Windows)', 'PC (Windows)') },
            { label: localized('Mekân', 'Setting'), value: localized('İşgal altındaki Antalya, alternatif 2017', 'Occupied Antalya, alternate 2017') },
            { label: localized('Durum', 'Status'), value: localized('Pre-alpha', 'Pre-alpha') },
            { label: localized('Planlanan çıkış', 'Planned release'), value: localized('2027', '2027') },
          ],
        },
      ],
      relatedSlugs: ['gsgame', 'mesai-bitti'],
      seo: {
        title: localized('Attalus — İşgal altındaki Antalya’da taktiksel FPS', 'Attalus — Tactical FPS set in occupied Antalya'),
        description: localized(
          'Attalus, alternatif bir 2017’de işgal altındaki Antalya’da geçen; takım taktikleri ve savaşın insani bedeli üzerine kurulu bir FPS.',
          'Attalus is a tactical FPS set in occupied Antalya in an alternate 2017, built around squad tactics and the human cost of war.',
        ),
        noIndex: false,
      },
    },
    {
      slug: 'ai-tycoon',
      status: 'published',
      discipline: 'software',
      format: 'game',
      order: 120,
      featured: false,
      title: localized('AI Tycoon', 'AI Tycoon'),
      dek: localized(
        'Küçük bir yapay zekâ laboratuvarından bulut sağlayıcısına ve yapay zekâ ürün şirketine uzanan bir işletme ve inşa simülasyonu. Modellerini tasarla, veri merkezini kat kat kur, pazarda ayakta kal.',
        'A business and building sim about growing a small AI lab into a cloud provider and AI product company. Design your models, build your data center floor by floor and stay ahead of the market.',
      ),
      year: 2027,
      context: localized('Geliştirilen oyun', 'Game in development'),
      releaseStage: 'feature-complete',
      technologies: ['Godot 4', 'C#', '.NET'],
      topics: ['game', 'business-simulation', 'tycoon'],
      cover: {
        slug: 'ai-tycoon',
        palette: ['#0f172a', '#38bdf8', '#f8fafc'],
        visualVariant: 'signal-field',
        alt: localized('AI Tycoon oyun ekranı', 'AI Tycoon gameplay screen'),
      },
      media: [
        projectImage(
          'ai-tycoon',
          'cover',
          'cover',
          [1600, 900],
          localized('AI Tycoon şirket ve tesis görünümü', 'AI Tycoon company and facility view'),
          localized('Şirket paneli ve 2.5D tesis görünümü: sunucu rafları, finans ve sektör haberleri.', 'Company panel and the 2.5D facility view with server racks, finance, and industry news.'),
        ),
        projectImage(
          'ai-tycoon',
          'construction',
          'gallery',
          [1600, 900],
          localized('AI Tycoon inşaat ve güç katmanı', 'AI Tycoon construction and power overlay'),
          localized('İnşaat sekmesi: güç katmanında raf yükü ve bölge planı düzenleyicisi.', 'Construction tab with rack load on the power overlay and the zone plan editor.'),
        ),
        projectImage(
          'ai-tycoon',
          'model-lab',
          'gallery',
          [1600, 900],
          localized('AI Tycoon Model Lab', 'AI Tycoon Model Lab'),
          localized('Model Lab: eğitim kuyruğu, encoder→decoder plan grafiği ve tahmin radarı.', 'Model Lab with the training queue, the encoder→decoder blueprint graph, and the forecast radar.'),
        ),
        projectImage(
          'ai-tycoon',
          'ops',
          'gallery',
          [1600, 900],
          localized('AI Tycoon operasyon telemetrisi', 'AI Tycoon operations telemetry'),
          localized('Operasyon ekranı: izleme bütçesi, müşteri izinleri ve gecikmeli günlük raporlar.', 'Operations screen with the monitoring budget, customer permissions, and delayed daily reports.'),
        ),
      ],
      links: [],
      metrics: [],
      blocks: [
        {
          id: 'ai-tycoon-story-1',
          type: 'text',
          eyebrow: localized('Model laboratuvarı', 'Model lab'),
          heading: localized('Kaydırıcı yok, tasarım var: modelini parça parça kur', 'No sliders, real design: build your models piece by piece'),
          body: localized(
            'Bir pazar fırsatı ya da kurumsal ihale seçin, ardından modelinizi düğüm tabanlı bir mimari editöründe parçalardan kurun. Deneyleri sıraya koyun, veri karışımını ve ürün kişiliğini belirleyin, eğitime başlamadan önce beklenen sonucu ve riskleri görün. Modeller dil, akıl yürütme, bilgi, kod, yaratıcılık ve hizalama eksenlerinde ölçülür. Yayından sonra gerçek geri bildirim gecikmeli gelir: kayma alarmları, müşteri raporları ve olay müdahaleleri, bir sonraki model ailesini nasıl büyüteceğinizi belirler.',
            'Pick a market opportunity or a corporate tender, then assemble your model from parts in a node-based architecture editor. Queue experiments, choose the data mix and product persona, and see the expected outcome and risks before training starts. Models are scored across language, reasoning, knowledge, coding, creation and alignment. After launch, real feedback arrives with a delay: drift alerts, customer reports and incident response shape how you grow the next model family.',
          ),
        },
        {
          id: 'ai-tycoon-story-2',
          type: 'text',
          eyebrow: localized('Tesis ve şirket', 'Facility and company'),
          heading: localized('Binayı kat kat büyüt, şirketi yıl yıl yönet', 'Grow the building floor by floor, run the company year by year'),
          body: localized(
            'Şirketiniz 2009’dan 2035’e uzanan bir zaman çizelgesinde büyür. Kapasiteyi önce kurgusal bulut sağlayıcılarından kiralar, sonra kendi bulutunuzu kurarsınız. Çok katlı veri merkezi bina kesitinde görünür; bir alan çizip şablon seçtiğinizde raflar otomatik yerleşir, güç, soğutma ve ağ katmanları darboğazları gösterir. Donanım kıtlıkları, rakip hamleleri ve regülasyonlar planları sınar. Şirket büyüdükçe her işe tek tek dokunmak yerine politikalarla yönetir, işi yöneticilere devredersiniz.',
            'Your company grows along a timeline running from 2009 to 2035. You start by renting capacity from fictional cloud vendors, then build a cloud of your own. The multi-floor data center appears in a cutaway view: draw a zone, pick a template and the racks fill in automatically, while power, cooling and network overlays reveal bottlenecks. Hardware shortages, rival moves and regulation test your plans. As the company grows, you stop micromanaging and steer it through policies and delegation.',
          ),
        },
        {
          id: 'ai-tycoon-facts',
          type: 'facts',
          heading: localized('Oyun profili', 'Game profile'),
          items: [
            { label: localized('Tür', 'Genre'), value: localized('İşletme ve inşa simülasyonu', 'Business and building sim') },
            { label: localized('Platform', 'Platform'), value: localized('PC ve mobil', 'PC and mobile') },
            { label: localized('Görünüm', 'View'), value: localized('2.5D bina kesiti ve izometrik katlar', '2.5D cutaway with isometric floors') },
            { label: localized('Durum', 'Status'), value: localized('Özellikleri tamamlandı', 'Feature-complete') },
            { label: localized('Planlanan çıkış', 'Planned release'), value: localized('2027', '2027') },
          ],
        },
      ],
      relatedSlugs: ['mesai-bitti', 'gsgame'],
      seo: {
        title: localized('AI Tycoon — Yapay zekâ şirketi kurma simülasyonu', 'AI Tycoon — Build and run an AI company'),
        description: localized(
          'AI Tycoon’da küçük bir yapay zekâ laboratuvarını model tasarımı, veri merkezi inşası ve şirket yönetimiyle bulut devine dönüştür.',
          'In AI Tycoon, grow a small AI lab into a cloud giant through model design, data center construction and company management.',
        ),
        noIndex: false,
      },
    },
    {
      slug: 'mesai-bitti',
      status: 'published',
      discipline: 'software',
      format: 'game',
      order: 130,
      featured: false,
      title: localized('Mesai Bitti', 'Mesai Bitti'),
      dek: localized(
        'Arkadaşlarınla birinci şahıs bakışla ev ve apartman inşa ettiğin, 1–8 kişilik bir co-op oyunu. Gündüz şantiyede çalış, kötü işçiliğe sinirlenip devleşen mimardan kaç, mesai bitince minibüse doluşup eğlenceye git.',
        'A first-person co-op building game for one to eight players. Work the site by day, run from the architect who turns giant over sloppy work, then pile into the minibus when the shift ends and head out for the night.',
      ),
      year: 2027,
      context: localized('Geliştirilen oyun', 'Game in development'),
      releaseStage: 'feature-complete',
      technologies: ['Godot 4', 'GDScript', 'Jolt Physics', 'Blender'],
      topics: ['game', 'co-op', 'construction'],
      cover: {
        slug: 'mesai-bitti',
        palette: ['#26363d', '#f4a340', '#fffdf0'],
        visualVariant: 'architectural-grid',
        alt: localized('Mesai Bitti şantiye görünümü', 'Mesai Bitti construction site view'),
      },
      media: [
        projectImage(
          'mesai-bitti',
          'cover',
          'cover',
          [1440, 900],
          localized('Mesai Bitti beş katlı apartman şantiyesi', 'Mesai Bitti five-storey apartment site'),
          localized('Beş katlı tuğla apartman ve önünde işçi ekibi.', 'The five-storey brick apartment with the crew in front.'),
        ),
        projectImage(
          'mesai-bitti',
          'site-crew',
          'gallery',
          [1440, 900],
          localized('Mesai Bitti iki katlı ev şantiyesi', 'Mesai Bitti two-storey house site'),
          localized('Gündüz şantiyesi: yapım aşamasındaki iki katlı ev ve sekiz kişilik ekip.', 'The day site: a two-storey house under construction and an eight-person crew.'),
        ),
        projectImage(
          'mesai-bitti',
          'minibus',
          'gallery',
          [1600, 1000],
          localized('Mesai Bitti işçi minibüsü ve kamp', 'Mesai Bitti crew minibus and camp'),
          localized('Sekiz koltuklu işçi minibüsü ve kamp.', 'The eight-seat crew minibus outside the worker camp.'),
        ),
        projectImage(
          'mesai-bitti',
          'night-street',
          'gallery',
          [1600, 1000],
          localized('Mesai Bitti eğlence sokağı', 'Mesai Bitti night street'),
          localized('Akşam eğlence sokağı: Yazı/Tura ve Paydos Disko.', 'The evening street with the Yazı/Tura casino and the Paydos club.'),
        ),
      ],
      links: [],
      metrics: [],
      blocks: [
        {
          id: 'mesai-bitti-story-1',
          type: 'text',
          eyebrow: localized('Şantiye', 'On site'),
          heading: localized('Tek tuşla bina yok: her duvar elle yükselir', 'No one-click buildings: every wall goes up by hand'),
          body: localized(
            'İşler gerçek aletlerle, sırayla yapılır: temeli işaretleyip kazın, kalıbı çakın, donatıyı bağlayın, mikseri çağırıp betonu dökün ve mastarla düzleyin. Ardından harçla tuğla örün, tesisatı çekin, sıvayı ve boyayı yapın, karoyu döşeyin. Kamyonla gelen malzemeyi forkliftle indirip şantiyeye taşırsınız. Sınıf ya da rol zorunluluğu yoktur; biri harç hazırlarken diğeri malzeme taşır, tek başına oynayan da her işi yapabilir. Önce iki katlı bir ev, ardından beş katlı bir apartman teslim edilir.',
            'Work is done in order, with real tools: mark and dig the foundation, hammer the formwork, tie the rebar, call the mixer, pour the concrete and screed it level. Then lay bricks in mortar, run the plumbing, plaster, paint and tile. Materials arrive by truck and you unload them with a forklift. There are no classes or required roles: one friend mixes mortar while another hauls bricks, and a solo player can do every job. First you hand over a two-storey house, then a five-storey apartment block.',
          ),
        },
        {
          id: 'mesai-bitti-story-2',
          type: 'text',
          eyebrow: localized('Şef ve paydos', 'The boss and the evening'),
          heading: localized('Kötü iş komik bir krize, mesai sonu ortak bir kaçamağa döner', 'Bad work turns into comic chaos, the end of a shift into a night out'),
          body: localized(
            'Mimar şantiyeye taksiyle gelir, işi gezip kaliteye göre tepki verir. İyi işe kısa bir onay, özensiz işe bağırış, daha kötüsüne balyoz düşer; sınırı aşan işçilikte mimar devleşip ekibin peşine takılır. Onu bayıltıp taksiye taşıyabilirsiniz, ama hasarı onarmak yine size kalır. Kayıplar sınırlıdır; aksilik hikâye üretir, ilerlemeyi silmez. Mesai bitince sekiz kişilik minibüse binip eğlence sokağında dans eder, oyun parasıyla kumarhaneye uğrar, sonra kampa dönüp uyursunuz.',
            'The architect arrives by taxi, walks the site and reacts to the quality of your work. Good work earns a nod, sloppy work a shouting fit, worse work a sledgehammer, and truly bad craftsmanship makes him grow giant and chase the crew. You can knock him out and carry him back to the taxi, but fixing the damage is still on you. Losses are capped, so mishaps make stories without wiping progress. After the shift, the eight-seat minibus takes everyone to the nightlife street to dance and play the casino with in-game coins before heading back to camp to sleep.',
          ),
        },
        {
          id: 'mesai-bitti-facts',
          type: 'facts',
          heading: localized('Oyun profili', 'Game profile'),
          items: [
            { label: localized('Tür', 'Genre'), value: localized('Birinci şahıs co-op inşaat', 'First-person co-op construction') },
            { label: localized('Oyuncu', 'Players'), value: localized('1–8 kişi, tek başına da oynanabilir', '1–8 players, solo supported') },
            { label: localized('Platform', 'Platform'), value: localized('PC', 'PC') },
            { label: localized('Durum', 'Status'), value: localized('Özellikleri tamamlandı', 'Feature-complete') },
            { label: localized('Planlanan çıkış', 'Planned release'), value: localized('2027', '2027') },
          ],
        },
      ],
      relatedSlugs: ['ai-tycoon', 'attalus'],
      seo: {
        title: localized('Mesai Bitti — 1–8 kişilik co-op inşaat oyunu', 'Mesai Bitti — First-person co-op construction for 1–8'),
        description: localized(
          'Mesai Bitti’de arkadaşlarınla ev ve apartmanı elle inşa et, öfkeli mimardan kaç, mesai sonunda minibüsle eğlenceye git.',
          'In Mesai Bitti, build houses and apartments by hand with friends, escape an angry architect and ride the minibus out after work.',
        ),
        noIndex: false,
      },
    },
    {
      slug: 'hypcas',
      status: 'published',
      discipline: 'software',
      format: 'game',
      order: 140,
      featured: false,
      title: localized('HypCas', 'HypCas'),
      dek: localized(
        'Klasik oyunları ve özgün yapımları tek bir mobil merkezde toplayan oyun koleksiyonu. Satrançtan tavlaya kısa oturumlar Hyp Classic’te; kalıcı ilerlemeli, daha uzun soluklu oyunlar HYPOG serisinde.',
        'A mobile game collection that brings classics and original titles together in one hub. Hyp Classic covers quick sessions from chess to backgammon; the HYPOG line holds longer games with lasting progress.',
      ),
      year: 2026,
      context: localized('Geliştirilen oyun', 'Game in development'),
      releaseStage: 'beta',
      technologies: ['React', 'TypeScript', 'Capacitor', 'Babylon.js', 'PixiJS'],
      topics: ['game', 'mobile', 'game-collection'],
      cover: {
        slug: 'hypcas',
        palette: ['#0b1020', '#22d3ee', '#f472b6'],
        visualVariant: 'product-orbit',
        alt: localized('HypCas oyun koleksiyonu', 'HypCas game collection'),
      },
      media: [
        projectImage(
          'hypcas',
          'cover',
          'cover',
          [1600, 1000],
          localized('HypCas Hub, satranç ve tren simülasyonu ekranları', 'HypCas Hub, chess, and train simulation screens'),
          localized('Hub ana ekranı, Classic Chess ve Continental Rails oyun içi görüntüleri.', 'The Hub home screen with in-game views of Classic Chess and Continental Rails.'),
        ),
        projectImage(
          'hypcas',
          'continental-rails',
          'gallery',
          [1600, 740],
          localized('HypCas Continental Rails', 'HypCas Continental Rails'),
          localized('Continental Rails: Babylon.js ile 3D tren sürüşü, hız, fren ve sinyal göstergeleri.', 'Continental Rails: a Babylon.js 3D train drive with speed, brake, and signal readouts.'),
        ),
      ],
      links: [
        {
          kind: 'privacy',
          label: localized('Gizlilik politikası', 'Privacy policy'),
          href: '/hypcas/privacy-policy',
          newTab: false,
        },
      ],
      metrics: [],
      blocks: [
        {
          id: 'hypcas-story-1',
          type: 'text',
          eyebrow: localized('Hyp Classic', 'Hyp Classic'),
          heading: localized('Tanıdık türler, mobil için baştan düşünülmüş', 'Familiar genres, rethought for mobile'),
          body: localized(
            'Hyp Classic, herkesin bildiği türleri dokunmatik ekran için yeniden ele alır: yapay zekâ rakipli ve taktik alıştırmalı satranç, Türk daması, tavla, solitaire, mayın tarlası, match-3, blok ve balon bulmacaları. Yanında sonsuz koşu, ritim, bilardo, hava hokeyi, pinball ve kule savunması gibi kısa arcade oyunları yer alır. Pek çok oyunda aynı cihazda iki kişilik maç, geri alma, açıklamalı ipuçları, alıştırma modları ve yarım kalan oyuna dönüş bulunur.',
            'Hyp Classic takes genres everyone knows and rebuilds them for touch screens: chess with AI opponents and tactics drills, Turkish draughts, backgammon, solitaire, minesweeper, match-3, block and bubble puzzles. Alongside them sit quick arcade games such as endless runners, rhythm, pool, air hockey, pinball and tower defense. Many games offer local two-player matches on one device, undo, explained hints, practice modes and the option to resume an unfinished game.',
          ),
        },
        {
          id: 'hypcas-story-2',
          type: 'text',
          eyebrow: localized('HYPOG özgün oyunları', 'HYPOG originals'),
          heading: localized('Kısa molalardan uzun seferlere uzanan özgün oyunlar', 'Original games that stretch from quick breaks to long campaigns'),
          body: localized(
            'HYPOG, koleksiyonun daha iddialı ve kalıcı ilerlemeli özgün oyunlarını bir araya getirir. Sea Dig’de bir araştırma denizaltısıyla okyanus tabanını kazıp derinlere inersiniz; başka oyunlarda bir otoyol koridorunun trafiğini yönetir, Mars’ta maden arar, arenada takım kurar, çağlar boyunca sefer yönetir ya da 3D uzay çatışmalarına girersiniz. Tüm oyunlar tam ekran, dokunmaya uygun aynı merkezden açılır ve her oyunun ilerlemesi cihazınızda ayrı ayrı korunur.',
            'HYPOG gathers the collection\'s more ambitious original games, built around lasting progress. In Sea Dig you pilot a research submarine and dig ever deeper into the ocean floor; elsewhere you manage traffic along a highway corridor, mine on Mars, build an arena team, lead campaigns across the ages or take on 3D space combat. Every game launches full-screen from the same touch-friendly hub, and each one keeps its progress saved separately on your device.',
          ),
        },
        {
          id: 'hypcas-facts',
          type: 'facts',
          heading: localized('Oyun profili', 'Game profile'),
          items: [
            { label: localized('Tür', 'Genre'), value: localized('Mobil oyun koleksiyonu', 'Mobile game collection') },
            { label: localized('Platform', 'Platform'), value: localized('Android öncelikli mobil', 'Mobile, Android first') },
            { label: localized('Koleksiyonlar', 'Collections'), value: localized('Hyp Classic ve HYPOG', 'Hyp Classic and HYPOG') },
            { label: localized('Durum', 'Status'), value: localized('Beta', 'Beta') },
            { label: localized('Planlanan çıkış', 'Planned release'), value: localized('2026 4. çeyrek', 'Q4 2026') },
          ],
        },
      ],
      relatedSlugs: ['ai-tycoon', 'mesai-bitti'],
      seo: {
        title: localized('HypCas — Klasik ve özgün mobil oyun koleksiyonu', 'HypCas — Classic and original mobile games in one hub'),
        description: localized(
          'HypCas, satrançtan tavlaya klasik oyunları ve kalıcı ilerlemeli özgün HYPOG yapımlarını tek bir mobil merkezde toplar.',
          'HypCas brings classics from chess to backgammon and original HYPOG games with lasting progress together in one mobile hub.',
        ),
        noIndex: false,
      },
    },
    {
      slug: 'gsgame',
      status: 'published',
      discipline: 'software',
      format: 'game',
      order: 150,
      featured: false,
      title: localized('GSGame', 'GSGame'),
      dek: localized(
        'Gerçek dünya haritasında, ilçe ölçeğinde oynanan modern bir grand strateji oyunu. Ekonomi, sanayi, ikmal ve savaş birbirine bağlı; istemediğin alanları kararlarının gerekçesini gösteren bakanlara devredebilirsin.',
        'A modern grand strategy game played on a real-world map at district scale. Economy, industry, supply and war are tightly linked, and any area you\'d rather not run can be handed to ministers who explain their decisions.',
      ),
      year: 2027,
      context: localized('Geliştirilen oyun', 'Game in development'),
      releaseStage: 'feature-complete',
      technologies: ['C#', '.NET', 'OpenGL', 'Silk.NET'],
      topics: ['game', 'grand-strategy', 'simulation'],
      cover: {
        slug: 'gsgame',
        palette: ['#14202b', '#c9a227', '#e8e1cf'],
        visualVariant: 'architectural-grid',
        alt: localized('GSGame harita görünümü', 'GSGame map view'),
      },
      media: [
        projectImage(
          'gsgame',
          'cover',
          'cover',
          [1280, 720],
          localized('GSGame ekonomi ve üretim paneli', 'GSGame economy and production panel'),
          localized('Bölge seviyesinde seçili Freiburg ve ekonomi/üretim paneli (örnek senaryo).', 'Freiburg selected at district level with the economy and production panel (sample scenario).'),
        ),
        projectImage(
          'gsgame',
          'military',
          'gallery',
          [1280, 720],
          localized('GSGame askerî panel', 'GSGame military panel'),
          localized('Askerî panel: birlik, hareket, savaş ve çatışma kontrolleri.', 'Military panel with unit, movement, war, and engagement controls.'),
        ),
        projectImage(
          'gsgame',
          'treasury',
          'gallery',
          [1280, 720],
          localized('GSGame hazine paneli', 'GSGame treasury panel'),
          localized('Ekonomi/hazine paneli: bakiye, nakit ve faiz.', 'Economy treasury panel with balance, cash, and interest.'),
        ),
      ],
      links: [],
      metrics: [],
      blocks: [
        {
          id: 'gsgame-story-1',
          type: 'text',
          eyebrow: localized('Ekonomiden cepheye', 'From economy to front line'),
          heading: localized('Cephedeki zafer fabrikada ve ikmal hattında başlar', 'Victory at the front starts in the factory and the supply line'),
          body: localized(
            'Bir ülkeyi seçip 1930, 1990 ya da 2020’den başlarsınız; kampanya açık uçludur. Ordunuzun gücü bütçenizden, sanayinizden ve ikmal ağınızdan gelir: fabrikalara üretim emri verir, ekipmanı birliklere ulaştırır, tümenleri harita üzerinde yönetirsiniz. Her savaş raporu sonucun nedenini açıklar; kaybettiğiniz bir harekâtın arkasında çoğu zaman eksik ekipman ya da kopan bir ikmal hattı vardır. Küçük bir ülkeyi büyük güce dönüştürmek mümkündür, ama kaynakların sınırı gerçektir.',
            'Pick a country and start in 1930, 1990 or 2020; the campaign is open-ended. Your army\'s strength comes from your budget, industry and supply network: you issue production orders, get equipment to the units and command divisions on the map. Every battle report explains why things went the way they did, and a failed offensive often traces back to missing equipment or a broken supply line. Turning a small country into a great power is possible, but resources are genuinely limited.',
          ),
        },
        {
          id: 'gsgame-story-2',
          type: 'text',
          eyebrow: localized('Derin ama yönetilebilir', 'Deep but manageable'),
          heading: localized('Her sistemi kendin yönet ya da işi bakanlarına bırak', 'Run every system yourself, or let your ministers take over'),
          body: localized(
            'Simülasyon her zaman tam derinlikte çalışır; sadeleştirme kurallardan değil arayüzden ve otomasyondan gelir. Bakanlar yalnızca bonus veren portreler değildir: verdiğiniz yetki içinde karar alır ve her kararın gerekçesini gösterirler. Uzun vadeli ulusal stratejiniz kısa vadeli odak ağaçlarıyla yan yana ilerler. Diplomasi, iç politika, krizler ve stratejik gerilim dünyanın dengesini değiştirir. Oyunu dilediğiniz an durdurup hızlandırabilir, ekonomiden cepheye her şeyi aynı haritada izleyebilirsiniz.',
            'The simulation always runs at full depth; simplification comes from the interface and automation, not from different rules. Ministers are more than portraits with bonuses: they make decisions within the authority you grant them and show the reasoning behind each one. Your long-term national strategy runs alongside shorter focus trees. Diplomacy, domestic politics, crises and strategic tension shift the balance of the world. You can pause or speed up time whenever you like and follow everything from the economy to the front on the same map.',
          ),
        },
        {
          id: 'gsgame-facts',
          type: 'facts',
          heading: localized('Oyun profili', 'Game profile'),
          items: [
            { label: localized('Tür', 'Genre'), value: localized('Modern grand strateji', 'Modern grand strategy') },
            { label: localized('Platform', 'Platform'), value: localized('PC (Windows öncelikli)', 'PC (Windows first)') },
            { label: localized('Başlangıçlar', 'Start dates'), value: localized('1930, 1990 ve 2020', '1930, 1990 and 2020') },
            { label: localized('Durum', 'Status'), value: localized('Özellikleri tamamlandı', 'Feature-complete') },
            { label: localized('Planlanan çıkış', 'Planned release'), value: localized('2027', '2027') },
          ],
        },
      ],
      relatedSlugs: ['attalus', 'ai-tycoon'],
      seo: {
        title: localized('GSGame — İlçe ölçeğinde modern grand strateji', 'GSGame — Modern grand strategy at district scale'),
        description: localized(
          'GSGame’de bir ülkeyi yönet: ekonomiyi ve sanayiyi büyüt, tümenleri haritada komuta et, işleri gerekçeli kararlar veren bakanlara devret.',
          'In GSGame, run a nation: grow its economy and industry, command divisions on the map and delegate to ministers who explain their decisions.',
        ),
        noIndex: false,
      },
    },
  ],
  journal: [
    {
      slug: 'mekan-ve-arayuz-arasinda',
      entryType: 'journal',
      status: 'published',
      order: 10,
      publishedAt: '2026-08-04T08:00:00.000Z',
      title: localized(
        'Mekân ve arayüz arasında çalışmak',
        'Working between space and interface',
      ),
      excerpt: localized(
        'Mimari düşünce ile ürün geliştirme pratiğinin aynı portfolyoda nasıl birbirini besleyebileceğine dair editoryal bir giriş.',
        'An editorial introduction to how architectural thinking and product development can reinforce each other in one portfolio.',
      ),
      topics: ['architecture', 'software', 'practice'],
      cover: {
        slug: 'mekan-ve-arayuz-arasinda',
        palette: ['#ede9df', '#121417', '#197fe6'],
        visualVariant: 'editorial-collage',
        alt: localized('Mekân ve arayüz eskizleri', 'Sketches of space and interface'),
      },
      blocks: [
        {
          id: 'mekan-arayuz-notu',
          type: 'text',
          heading: localized('İki ayrı alan değil, iki ayrı ölçek', 'Not two fields, but two scales'),
          body: localized(
            'Mimarlık; bağlamı, sınırları ve insan hareketini okumayı öğretir. Yazılım ise aynı kararları durumlar, geri bildirimler ve tekrar eden akışlar üzerinden sınar. İki pratik, bu çalışma yönteminde aynı karar verme disiplininin farklı ölçekleri olarak buluşur.',
            'Architecture teaches how to read context, constraints, and human movement. Software tests similar decisions through states, feedback, and repeated flows. In this practice, both become different scales of the same decision-making discipline.',
          ),
        },
      ],
      linkedProjectSlugs: ['archbuilder', 'draw-or-die'],
      seo: {
        title: localized(
          'Mekân ve Arayüz Arasında Çalışmak',
          'Working Between Space and Interface',
        ),
        description: localized(
          'Mimari düşünce ile yazılım ve ürün geliştirme pratiğinin aynı üretim yöntemi içinde nasıl buluştuğuna dair yazı.',
          'An essay on how architectural thinking meets software and product development within one way of making.',
        ),
        noIndex: false,
      },
    },
    {
      slug: 'paftadan-qr-katmanina',
      entryType: 'lab-note',
      status: 'published',
      order: 20,
      publishedAt: '2026-08-03T08:00:00.000Z',
      title: localized(
        'Paftadan QR katmanına',
        'From presentation board to QR layer',
      ),
      excerpt: localized(
        'Fiziksel bir mimari paftayı QR kod, yakınlaştırılabilir görsel ve ek proje bilgisiyle genişletme fikri üzerine laboratuvar notu.',
        'A lab note on extending a physical architecture board with a QR code, zoomable media, and additional project context.',
      ),
      topics: ['architecture', 'qr', 'presentation'],
      cover: {
        slug: 'paftadan-qr-katmanina',
        palette: ['#111921', '#e2e8f0', '#22c55e'],
        visualVariant: 'architectural-grid',
        alt: localized('Pafta ve QR kod katmanı', 'Presentation board and QR layer'),
      },
      blocks: [
        {
          id: 'pafta-qr-kapsam',
          type: 'text',
          heading: localized('Fiziksel teslimin dijital devamı', 'A digital continuation of physical presentation'),
          body: localized(
            'Repo, paftalar için QR kod oluşturma ve okutulduğunda proje görseline ulaşma akışını içeriyor. İndirme, paylaşma ve yakınlaştırma gibi araçlar fiziksel sunumu kesintisiz bir dijital devamla tamamlıyor.',
            'The repository includes a flow for generating QR codes for presentation boards and opening project media after scanning. Download, sharing, and zoom tools extend the physical presentation into a continuous digital layer.',
          ),
        },
      ],
      linkedProjectSlugs: [],
      seo: {
        title: localized(
          'Paftadan QR Katmanına — Laboratuvar Notu',
          'From Board to QR Layer — Lab Note',
        ),
        description: localized(
          'Mimari paftalar için QR kod, yakınlaştırılabilir görsel ve dijital proje bilgisi akışını ele alan laboratuvar notu.',
          'A lab note about QR codes, zoomable media, and digital project context for architectural presentation boards.',
        ),
        noIndex: false,
      },
    },
  ],
};

const generatedSnapshot = generatedContent as unknown;
const hasGeneratedSnapshot = generatedSnapshot !== null
  && typeof generatedSnapshot === 'object'
  && 'settings' in generatedSnapshot
  && 'projects' in generatedSnapshot
  && 'journal' in generatedSnapshot;

export const fallbackContentBundle: ContentBundle = parseContentBundle(fallbackBundle);
const bundle: ContentBundle = hasGeneratedSnapshot
  ? parseContentBundle(generatedSnapshot)
  : fallbackContentBundle;

export const portfolioProjects: PortfolioProject[] = bundle.projects;
export const siteSettings: SiteSettings = bundle.settings;
export const allEntries: JournalEntry[] = bundle.journal;
export const journalEntries: JournalEntry[] = allEntries.filter(
  (entry) => entry.entryType === 'journal',
);
export const labEntries: JournalEntry[] = allEntries.filter(
  (entry) => entry.entryType === 'lab-note',
);
export const contentBundle: ContentBundle = bundle;

export const findPortfolioProject = (slug: string): PortfolioProject | undefined =>
  portfolioProjects.find((project) => project.slug === slug);

export const findJournalEntry = (slug: string): JournalEntry | undefined =>
  allEntries.find((entry) => entry.slug === slug);
