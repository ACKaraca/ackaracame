import { ArrowUpRight, Download } from 'lucide-react';
import { useAppPreferences } from '../../context/AppPreferences';
import { architecturePortfolio, architecturePortfolioCopy } from '../../lib/architecturePortfolio';
import { Reveal } from '../experience/Reveal';

/** Classic-view entry to the static architecture deck; plain anchors because it lives outside the router. */
export const ArchitecturePortfolioCard = () => {
  const { locale } = useAppPreferences();
  const t = architecturePortfolioCopy(locale);
  return (
    <Reveal as="section" className="architecture-portfolio shell">
      {/* Decorative duplicate of the primary link below, so it stays out of the tab order. */}
      <a className="architecture-portfolio__stack" href={architecturePortfolio.href} tabIndex={-1} aria-hidden="true">
        {architecturePortfolio.sheets.map((sheet) => (
          <span className="architecture-portfolio__sheet" key={sheet.page}>
            <img src={sheet.image} alt="" loading="lazy" decoding="async" width={640} height={360} />
            <span>{sheet.page}</span>
          </span>
        ))}
      </a>
      <div className="architecture-portfolio__copy">
        <h2>{t.title}</h2>
        <p>{t.body}</p>
        <dl className="architecture-portfolio__facts">
          {t.facts.map(([label, value]) => (
            <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
          ))}
        </dl>
        <div className="architecture-portfolio__actions">
          <a className="button button--primary" href={architecturePortfolio.href}>{t.open}<ArrowUpRight aria-hidden="true" /></a>
          <a className="text-link" href={architecturePortfolio.pdf} download>{t.pdf}<Download aria-hidden="true" /></a>
        </div>
      </div>
    </Reveal>
  );
};
