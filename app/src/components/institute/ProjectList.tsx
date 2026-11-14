import { Link } from 'react-router-dom';
import { projectsOf } from '../../data/projects';
import type { FieldSlug } from '../../data/types';
import { FIELD_COPY } from '../../data/site';
import StatusPill from '../ui/StatusPill';

export default function ProjectList({ slug }: { slug: FieldSlug }) {
  const projects = projectsOf(slug);
  if (!projects.length) return <p className="ph">{FIELD_COPY.emptyProjects}</p>;
  return <div className="mini-list">{projects.map(project => <Link className="mini-proj" key={project.code} to={`/project/${project.code}`}>
    <span className="mp-code">{project.code}</span><span className="mp-name">{project.name}</span>
    <StatusPill status={project.status} /><span className="mp-pct">{project.progress}%</span><span className="arw" aria-hidden="true">↗</span>
  </Link>)}</div>;
}
