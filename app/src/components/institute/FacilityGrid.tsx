import type { ContentItem } from '../../data/types';
import { SITE } from '../../data/site';

export default function FacilityGrid({ items, columns = 3 }: { items: ContentItem[]; columns?: 2 | 3 }) {
  return <div className={`cards-${columns}`}>{items.map(item => <div className="mini-card" key={item.t}>
    <b>{item.t}</b><p>{item.d}</p><span className="ph-badge">{SITE.pending}</span>
  </div>)}</div>;
}
