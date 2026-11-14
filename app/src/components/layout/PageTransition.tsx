import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
export default function PageTransition({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  return <motion.div initial={{ opacity: 0, y: reduced ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .26, ease: [.32,.72,0,1] }}>{children}</motion.div>;
}
