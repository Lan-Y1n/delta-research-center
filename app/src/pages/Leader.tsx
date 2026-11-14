import { Link, useParams } from 'react-router-dom';
import { getLeader } from '../data/leaders';
import { getInstitute } from '../data/institutes';
import { FIELD_COPY, LEADER_COPY, SITE } from '../data/site';
import LeaderHero from '../components/leader/LeaderHero';
import PlaceholderSection from '../components/leader/PlaceholderSection';
import ProjectList from '../components/institute/ProjectList';
import Plate from '../components/ui/Plate';
import Button from '../components/ui/Button';
import SectionHeading from '../components/ui/SectionHeading';
import Reveal from '../components/ui/Reveal';
import NotFound from './NotFound';

export default function Leader() {
  const { slug } = useParams();
  const leader = getLeader(slug);
  const institute = getInstitute(leader?.inst);
  if (!leader || !institute) return <NotFound />;

  return <section className="page page-leader">
    <nav className="p-crumb" aria-label="面包屑"><Link to="/">{FIELD_COPY.home}</Link><i>/</i><Link to={`/field/${institute.slug}`}>{institute.cn}</Link><i>/</i><b>{LEADER_COPY.archive}</b></nav>
    <div className="leader-grid"><div className="leader-left"><div className="ll-sticky">
      <div className="plate-wrap"><Plate {...leader} /></div><div className="ll-index"><span>{leader.no}</span><i>/ 05</i></div>
      <Link className="ll-back" to={`/field/${institute.slug}`}>← {LEADER_COPY.back}{institute.cn}</Link>
    </div></div>
    <div className="leader-right"><LeaderHero leader={leader} institute={institute} />
      {leader.redacted && <Reveal className="redact-note"><b>{LEADER_COPY.statusTitle}</b><p>{LEADER_COPY.statusNote}</p></Reveal>}
      {LEADER_COPY.sections.map(section => section.no === '02' ? <Reveal className="blk" key={section.no}>
        <SectionHeading no={section.no} title={section.title} badge={SITE.pending} />
        <p className="ph">{section.body}</p><div className="chips">{leader.redacted ? <span className="chip ph">{LEADER_COPY.removedField}</span> : Array.from({ length: 3 }, (_, index) => <span className="chip ph" key={index}>{LEADER_COPY.pendingField}</span>)}</div>
      </Reveal> : section.no === '06' ? <Reveal className="blk" key={section.no}>
        <SectionHeading no={section.no} title={section.title} badge={SITE.pending} /><p className="ph">{section.body}</p><span className="ph-badge">{SITE.sample}</span><ProjectList slug={institute.slug} />
      </Reveal> : <PlaceholderSection key={section.no} no={section.no} title={section.title} note={section.body} />)}
      <p className="ph">{LEADER_COPY.noFabrication}</p><div className="leader-cta"><Button to={`/field/${institute.slug}`}>{LEADER_COPY.back}{institute.cn}<span aria-hidden="true">→</span></Button></div>
    </div></div>
  </section>;
}
