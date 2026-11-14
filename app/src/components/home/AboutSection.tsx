import { ABOUT_COPY, SITE } from '../../data/site';
import Reveal from '../ui/Reveal';
import Button from '../ui/Button';
export default function AboutSection() {
  return <section className="sec sec-about" id="about"><div className="about-grid"><Reveal className="about-left"><div className="sec-kicker"><span>{ABOUT_COPY.no}</span>{ABOUT_COPY.en}</div><h2 className="sec-title">{ABOUT_COPY.title}</h2><p className="about-quote">{ABOUT_COPY.quote}</p><span className="ph">{ABOUT_COPY.note} · {SITE.pending}</span></Reveal><div className="about-right">{ABOUT_COPY.intro.map(text => <Reveal key={text}><p>{text}</p></Reveal>)}<div className="about-facts">{ABOUT_COPY.facts.map(fact => <Reveal className="fact" key={fact.no}><span className="f-no">{fact.no}</span><div><h3>{fact.title}<span className="ph-badge">{SITE.pending}</span></h3><p>{fact.body}</p></div></Reveal>)}</div><Reveal><Button to="/cooperation">{ABOUT_COPY.cooperation}<span aria-hidden="true">→</span></Button></Reveal></div></div></section>;
}
