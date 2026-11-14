import { HOME_COPY, SITE } from '../../data/site';
import Button from '../ui/Button';
import Reveal from '../ui/Reveal';
import LeaderCarousel from './LeaderCarousel';
export default function Hero() {
  return <section className="hero" id="hero"><div className="hero-in"><Reveal className="hero-brand"><div className="eyebrow"><i className="dot"/>{HOME_COPY.eyebrow}</div><h1 className="hero-title"><span>{HOME_COPY.title[0]}</span><span className="l2">{HOME_COPY.title[1]}</span></h1><div className="hero-en">{SITE.en}</div><p className="hero-lede">{SITE.tagline}</p><p className="hero-sub">{HOME_COPY.intro}<span className="ph">{HOME_COPY.introNote}</span></p><div className="hero-cta"><Button to="/field/physics" variant="solid">{HOME_COPY.explore}<span aria-hidden="true">↗</span></Button><Button to="/cooperation">{HOME_COPY.cooperation}<span aria-hidden="true">→</span></Button></div><dl className="hero-stats">{HOME_COPY.stats.map(stat => <div key={stat.label}><dd>{stat.value}</dd><dt>{stat.label}</dt></div>)}</dl></Reveal><LeaderCarousel/></div><div className="hero-foot"><button className="scroll-cue" onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })}>{HOME_COPY.scroll}<span aria-hidden="true">↓</span></button><span>{HOME_COPY.archive}</span></div></section>;
}
