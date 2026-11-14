import { STATUS } from '../../data/projects';
import type { ProjectStatus } from '../../data/types';
export default function StatusPill({ status }: { status: ProjectStatus }) {
  const item = STATUS[status];
  return <span className={`status s-${status}`}><i aria-hidden="true" />{item.cn} · {item.en}</span>;
}
