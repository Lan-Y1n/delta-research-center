import type { Field, Leader } from '../../data/types';

export default function LeaderHero({ leader, institute }: { leader: Leader; institute: Field }) {
  return <div className="leader-hero">
    <div className="p-eyebrow">{leader.roleEn}</div><h1 className="leader-name">{leader.name}</h1><div className="leader-en">{leader.en}</div>
    <div className="leader-tags"><span>{leader.role}</span><span>{institute.cn} · {institute.en}</span></div>
  </div>;
}
