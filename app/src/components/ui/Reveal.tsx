import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
export default function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={{ opacity: 0, y: reduced ? 0 : 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .08 }} transition={{ duration: reduced ? .16 : .7, ease: [.32,.72,0,1], delay }}>{children}</motion.div>;
}
