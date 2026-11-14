export default function SectionHeading({ no, title, badge }: { no?: string; title: string; badge?: string }) {
  return <div className="blk-h">{no && <span className="blk-k">{no}</span>}<h2>{title}</h2>{badge && <span className="ph-badge">{badge}</span>}</div>;
}
