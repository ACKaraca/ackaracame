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
      <a className="architecture-portfolio__media" href={architecturePortfolio.href} tabIndex={-1} aria-hidden="true">
        <img src={architecturePortfolio.cover} alt="" loading="lazy" decoding="async" width={640} height={360} />
      </a>
      <div className="architecture-portfolio__copy">
        <span className="eyebrow">{t.meta}</span>
        <h2>{t.title}</h2>
        <p>{t.body}</p>
        <div className="architecture-portfolio__actions">
          <a className="button button--primary" href={architecturePortfolio.href}>{t.open}<ArrowUpRight aria-hidden="true" /></a>
          <a className="text-link" href={architecturePortfolio.pdf} target="_blank" rel="noreferrer">{t.pdf}<Download aria-hidden="true" /></a>
        </div>
      </div>
    </Reveal>
  );
};
