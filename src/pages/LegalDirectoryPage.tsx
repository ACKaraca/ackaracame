import { ArrowLeft, ArrowUpRight, FileText, ShieldCheck } from 'lucide-react';
import { Link } from 'wouter';
import { useAppPreferences } from '../context/AppPreferences';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useLocaleHref } from '../hooks/useLocaleHref';

export default function LegalDirectoryPage({ documentType }: { documentType: 'privacy' | 'terms' }) {
  const { locale } = useAppPreferences();
  const privacy = documentType === 'privacy';
  const localeHref = useLocaleHref();
  const title = privacy
    ? (locale === 'tr' ? 'Gizlilik politikaları' : 'Privacy policies')
    : (locale === 'tr' ? 'Kullanım koşulları' : 'Terms of use');
  const entries = [
    {
      name: 'ACKaraca.me',
      description: privacy
        ? (locale === 'tr' ? 'Kişisel portfolyo ve iletişim formu' : 'Personal portfolio and contact form')
        : (locale === 'tr' ? 'Portfolyo ve herkese açık içerikler' : 'Portfolio and public content'),
      href: privacy ? '/privacy' : '/terms',
    },
    {
      name: 'WhereToGo',
      description: privacy
        ? (locale === 'tr' ? 'Konum keşfi, iki kişilik oturum ve eşleşmeler' : 'Location discovery, two-person sessions, and matches')
        : (locale === 'tr' ? 'Konum keşfi ve güvenli kullanım sınırları' : 'Location discovery and safe-use boundaries'),
      href: privacy ? '/wheretogo/privacy' : '/wheretogo/terms',
    },
    {
      name: 'HypCas',
      description: privacy
        ? (locale === 'tr' ? 'Mini oyunlar, reklamlar ve premium abonelik' : 'Mini-games, ads, and premium subscription')
        : (locale === 'tr' ? 'Mini oyunlar, sanal jetonlar ve abonelik' : 'Mini-games, virtual coins, and subscription'),
      href: privacy ? '/hypcas/privacy' : '/hypcas/terms',
    },
    {
      name: 'DuaAPP',
      description: privacy
        ? (locale === 'tr' ? 'Dua, günlük, yapay zekâ ve topluluk verileri' : 'Prayer, journal, AI, and community data')
        : (locale === 'tr' ? 'Manevi destek, yapay zekâ ve topluluk kuralları' : 'Spiritual support, AI, and community rules'),
      href: privacy ? '/dua/privacy' : '/dua/terms',
    },
    {
      name: 'Draw or Die',
      description: privacy
        ? (locale === 'tr' ? 'Yüklenen çalışmalar, yapay zekâ ve ödeme verileri' : 'Uploaded work, AI, and payment data')
        : (locale === 'tr' ? 'Jüri simülasyonu, Rapido kredileri ve topluluk' : 'Jury simulation, Rapido credits, and community'),
      href: privacy ? '/drawordie/privacy' : '/drawordie/terms',
    },
  ];

  useDocumentMeta({
    title: `${title} — ACKaraca`,
    description: locale === 'tr' ? 'ACKARACA ürünleri için güncel yasal doküman dizini.' : 'Current legal document directory for ACKARACA products.',
    path: privacy ? '/all/privacy' : '/all/terms',
    locale,
    noIndex: true,
  });

  return (
    <main id="main-content" tabIndex={-1} className="page legal-directory">
      <header className="legal-hero shell">
        <Link href={localeHref('/')} className="legal-back"><ArrowLeft aria-hidden="true" />{locale === 'tr' ? 'Portfolyoya dön' : 'Back to portfolio'}</Link>
        <span className="eyebrow">{locale === 'tr' ? 'Yasal doküman dizini' : 'Legal document directory'}</span>
        <h1>{title}</h1>
        <p>{locale === 'tr' ? 'Kullandığınız ürünü seçerek geçerli dokümana ulaşın.' : 'Choose the product you use to open the applicable document.'}</p>
      </header>
      <section className="shell legal-directory__grid" aria-label={title}>
        {entries.map((entry) => (
          <Link key={entry.href} href={localeHref(entry.href)}>
            {privacy ? <ShieldCheck aria-hidden="true" /> : <FileText aria-hidden="true" />}
            <span>{entry.name}</span>
            <h2>{entry.description}</h2>
            <ArrowUpRight aria-hidden="true" />
          </Link>
        ))}
      </section>
    </main>
  );
}
