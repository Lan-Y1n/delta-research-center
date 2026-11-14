import type { ReactNode } from 'react';
import GlassCard from '../ui/GlassCard';

export default function DataPanel({ title, rows, children }: { title: string; rows: [string, string][]; children?: ReactNode }) {
  return <GlassCard className="side-panel"><div className="side-kicker">{title}</div><div className="side-rows">
    {rows.map(([label, value]) => <div className="side-row" key={label}><span>{label}</span><b>{value}</b></div>)}
  </div>{children}</GlassCard>;
}
