import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
export default function Button({ to, children, variant = 'ghost', className = '' }: { to: string; children: ReactNode; variant?: 'solid' | 'ghost'; className?: string }) {
  return <Link to={to} className={`btn btn-${variant} ${className}`}>{children}</Link>;
}
