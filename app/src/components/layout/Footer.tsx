import { Link } from 'react-router-dom';
import { INSTITUTES } from '../../data/institutes';
import { SITE } from '../../data/site';
export default function Footer() {
  const top = () => window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  return <footer className="foot"><div className="foot-in"><div className="foot-brand"><span className="fb-mark" aria-hidden="true">Δ</span><div className="fb-txt"><b>{SITE.name}</b><i>{SITE.en}</i></div><p>{SITE.tagline}</p><span className="fb-badge">{SITE.fiction}</span></div><div className="foot-cols"><div className="fc"><b>{SITE.nav.fieldHeading}</b>{INSTITUTES.map(item => <Link key={item.slug} to={`/field/${item.slug}`}>{item.cn}</Link>)}</div><div className="fc"><b>{SITE.nav.institution}</b><Link to="/">{SITE.nav.home}</Link><Link to="/cooperation">合作与联络</Link><Link to="/#projects">{SITE.nav.projects}</Link><button onClick={top}>{SITE.nav.backTop}</button></div><div className="fc fc-note"><b>{SITE.nav.about}</b><p>{SITE.disclaimer}</p></div></div></div><div className="foot-base"><span>{SITE.copyright}</span><span>{SITE.archive}</span><button onClick={top}>BACK TO TOP ↑</button></div></footer>;
}
