import { Link } from 'react-router-dom';
import { PROJECTS } from '../../data/projects';
import { INST_BY_SLUG } from '../../data/institutes';
import { HOME_COPY, SITE } from '../../data/site';
import Reveal from '../ui/Reveal';
import StatusPill from '../ui/StatusPill';
import ProgressBar from '../ui/ProgressBar';
export default function ProjectGrid() {
  return <section className="sec sec-projects" id="projects"><Reveal className="sec-head"><div><div className="sec-kicker"><span>{HOME_COPY.projectNo}</span>{HOME_COPY.projectEn}</div><h2 className="sec-title">{HOME_COPY.projectTitle}</h2></div><p className="sec-note"><span className="ph-badge">{SITE.sample}</span>{HOME_COPY.projectNote}</p></Reveal><div className="proj-grid grid grid-cols-1 min-[681px]:grid-cols-2 min-[1081px]:grid-cols-3">{PROJECTS.map((project,i) => <Reveal key={project.code} delay={i % 3 * .05}><Link to={`/project/${project.code}`} className="proj-card"><div className="proj-top"><span className="proj-code">{project.code}</span><StatusPill status={project.status}/></div><h3 className="proj-name">{project.name}</h3><div className="proj-inst">{INST_BY_SLUG[project.inst]?.cn} · {INST_BY_SLUG[project.inst]?.en}</div><p className="proj-desc">{project.desc}</p><ProgressBar value={project.progress}/><div className="proj-foot"><span>{HOME_COPY.projectDetails}</span><span aria-hidden="true">↗</span></div></Link></Reveal>)}</div><div className="sec-foot"><span>{HOME_COPY.projectCount}</span><Link to="/field/physics">{HOME_COPY.allFields} ↗</Link></div></section>;
}
