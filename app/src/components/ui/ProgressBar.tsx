import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
export default function ProgressBar({ value }: { value: number }) {
  const reduced = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const visible = useInView(root, { once: true, amount: .1 });
  return <div className="prog" ref={root}><div className="prog-track" role="progressbar" aria-label="项目完成度（示例占位数据）" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}><motion.i className="prog-fill" style={{ width: `${value}%`, transformOrigin: 'left' }} initial={{ scaleX: reduced ? 1 : 0 }} animate={{ scaleX: reduced || visible ? 1 : 0 }} transition={{ duration: reduced ? 0 : 1.1, ease: [.32,.72,0,1] }} /></div><span className="prog-num">{value}<small>%</small></span></div>;
}
