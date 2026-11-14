import type { ContentItem } from '../../data/types';

export default function DirectionList({ items }: { items: ContentItem[] }) {
  return <ol className="dirs">{items.map((item, index) => <li key={item.t}>
    <span className="d-no">{String(index + 1).padStart(2, '0')}</span>
    <div><b>{item.t}</b><p>{item.d}</p></div>
  </li>)}</ol>;
}
