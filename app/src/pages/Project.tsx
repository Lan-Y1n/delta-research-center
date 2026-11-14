import { Link, useParams } from 'react-router-dom';
import { getProject, STATUS } from '../data/projects';
import { getInstitute } from '../data/institutes';
import { FIELD_COPY, PROJECT_COPY, SITE } from '../data/site';
import DataPanel from '../components/institute/DataPanel';
import StatusPill from '../components/ui/StatusPill';
import ProgressBar from '../components/ui/ProgressBar';
import SectionHeading from '../components/ui/SectionHeading';
import Reveal from '../components/ui/Reveal';
import NotFound from './NotFound';

export default function Project() {
  const { code } = useParams();
  const project = getProject(code);
  const institute = getInstitute(project?.inst);
  if (!project || !institute) return <NotFound />;
  return <section className="page page-project">
    <nav className="p-crumb" aria-label="面包屑"><Link to="/">{FIELD_COPY.home}</Link><i>/</i><Link to={`/field/${institute.slug}`}>{institute.cn}</Link><i>/</i><b>{project.code}</b></nav>
    <div className="proj-detail-head"><div className="pd-meta"><span className="proj-code">{project.code}</span><StatusPill status={project.status} /><span className="ph-badge">{SITE.sample}</span></div>
      <h1 className="p-title"><span>{project.name}</span></h1><Link className="p-tag" to={`/field/${institute.slug}`}>{institute.cn} · {institute.en}</Link>
    </div>
    <div className="proj-detail-grid"><div className="field-main">
      <Reveal className="blk"><SectionHeading no="01" title={PROJECT_COPY.overview} badge={SITE.pending} /><p>{project.desc}</p><p className="ph">{PROJECT_COPY.overviewNote}</p></Reveal>
      <Reveal className="blk"><SectionHeading no="02" title={PROJECT_COPY.progress} badge={SITE.sample} /><ProgressBar value={project.progress} /><p className="ph">{PROJECT_COPY.progressNote}</p></Reveal>
      <Reveal className="blk"><SectionHeading no="03" title={PROJECT_COPY.outputs} badge={SITE.pending} /><p className="ph">{PROJECT_COPY.outputsNote}</p></Reveal>
      <Reveal className="blk"><SectionHeading no="04" title={PROJECT_COPY.participants} badge={SITE.pending} /><p className="ph">{PROJECT_COPY.participantsNote}</p></Reveal>
    </div><aside className="field-side"><DataPanel title={PROJECT_COPY.data} rows={[
      [PROJECT_COPY.institute, institute.cn], [PROJECT_COPY.status, STATUS[project.status].cn], [PROJECT_COPY.completion, `${project.progress}%`], [PROJECT_COPY.nature, PROJECT_COPY.sample],
    ]} /></aside></div>
  </section>;
}
