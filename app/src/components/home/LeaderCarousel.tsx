import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { animate, motion, useMotionValue, useReducedMotion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { LEADERS } from '../../data/leaders';
import { INST_BY_SLUG } from '../../data/institutes';
import { HOME_COPY } from '../../data/site';
import Plate from '../ui/Plate';

const INTERVAL = 5600;
type DragState = { id: number; start: number; position: number; dx: number; moved: boolean; samples: { x: number; t: number }[] };
export default function LeaderCarousel() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(() => typeof document !== 'undefined' && document.hidden);
  const [dragging, setDragging] = useState(false);
  const [width, setWidth] = useState(0);
  const viewport = useRef<HTMLDivElement>(null);
  const drag = useRef<DragState | null>(null);
  const suppressClick = useRef(false);
  const animation = useRef<ReturnType<typeof animate> | null>(null);
  const releaseVelocity = useRef<number | null>(null);
  const remaining = useRef(INTERVAL);
  const timerIndex = useRef(index);
  const x = useMotionValue(0);
  const reduced = useReducedMotion();
  const navigate = useNavigate();
  const paused = !playing || hovering || focused || hidden || dragging;
  const go = useCallback((next: number) => setIndex((next + LEADERS.length) % LEADERS.length), []);
  useEffect(() => {
    const observer = new ResizeObserver(entries => setWidth(entries[0].contentRect.width));
    if (viewport.current) observer.observe(viewport.current);
    const visibility = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', visibility);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', visibility); animation.current?.stop(); };
  }, []);
  useEffect(() => {
    animation.current?.stop();
    if (!dragging) {
      const velocity = releaseVelocity.current;
      releaseVelocity.current = null;
      animation.current = animate(x, -index * width, velocity === null
        ? { duration: reduced ? 0 : .68, ease: [.32,.72,0,1] }
        : { type: 'spring', bounce: 0, duration: reduced ? 0 : .48, velocity });
    }
  }, [index, width, dragging, x, reduced]);
  useEffect(() => {
    if (timerIndex.current !== index) { remaining.current = INTERVAL; timerIndex.current = index; }
    if (paused) return;
    const started = performance.now();
    const timer = setTimeout(() => go(index + 1), remaining.current);
    return () => { clearTimeout(timer); remaining.current = Math.max(0, remaining.current - (performance.now() - started)); };
  }, [index, paused, go]);

  const pointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    animation.current?.stop(); suppressClick.current = false;
    drag.current = { id: event.pointerId, start: event.clientX, position: x.get(), dx: 0, moved: false, samples: [{ x: event.clientX, t: event.timeStamp }] };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  };
  const pointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || current.id !== event.pointerId) return;
    current.dx = event.clientX - current.start;
    if (Math.abs(current.dx) > 10) current.moved = true;
    current.samples = [...current.samples.filter(p => event.timeStamp - p.t < 100), { x: event.clientX, t: event.timeStamp }];
    x.set(current.position + current.dx);
  };
  const finish = (event: PointerEvent<HTMLDivElement>, cancelled = false) => {
    const current = drag.current;
    if (!current || current.id !== event.pointerId) return;
    const first = current.samples[0], last = current.samples[current.samples.length - 1];
    const velocity = (last.x - first.x) / Math.max(1, last.t - first.t);
    const projected = current.dx + velocity * 180;
    suppressClick.current = cancelled || current.moved;
    let next = index;
    if (!cancelled && current.moved && Math.abs(projected) > width * .18) next = (index + (projected < 0 ? 1 : -1) + LEADERS.length) % LEADERS.length;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    releaseVelocity.current = cancelled ? 0 : velocity * 1000;
    setIndex(next); setDragging(false);
  };
  return <div className="hero-carousel" data-testid="leader-carousel" data-index={index} data-paused={paused} onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }} onKeyDown={event => { if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); go(index + (event.key === 'ArrowRight' ? 1 : -1)); } }}>
    <div className="car-frame"><div ref={viewport} className={`car-viewport ${dragging ? 'is-dragging' : ''}`} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={event => finish(event)} onPointerCancel={event => finish(event, true)} onLostPointerCapture={event => { if (drag.current) finish(event, true); }} onClick={event => { event.preventDefault(); if (suppressClick.current) { suppressClick.current = false; return; } navigate(`/field/${LEADERS[index].inst}`); }} onDragStart={event => event.preventDefault()} role="region" aria-roledescription="轮播" aria-label="研究院负责人档案">
      <motion.div className="car-track" style={{ x }}>{LEADERS.map((leader, itemIndex) => <Link className="slide" key={leader.slug} to={`/field/${leader.inst}`} draggable={false} aria-hidden={itemIndex !== index} tabIndex={itemIndex === index ? 0 : -1} aria-label={`${leader.name}，${leader.role}，进入${INST_BY_SLUG[leader.inst]?.cn}`}><Plate {...leader}/><span className="slide-cap"><span className="sc-k">{leader.no} / 05</span><span className="sc-name">{leader.name}</span><span className="sc-role">{leader.role}</span><span className="sc-inst">{INST_BY_SLUG[leader.inst]?.cn} · {INST_BY_SLUG[leader.inst]?.en}</span></span></Link>)}</motion.div>
    </div></div>
    <div className="car-hint"><span>{HOME_COPY.carouselHint}</span><b aria-live="polite">{LEADERS[index].no} — 05</b></div>
    <div className="car-ui"><div className="car-btns"><button className="rbtn" aria-label={HOME_COPY.carouselPrevious} onClick={() => go(index - 1)}>←</button><button className="rbtn" aria-label={HOME_COPY.carouselNext} onClick={() => go(index + 1)}>→</button></div><div className="car-bars">{LEADERS.map((leader, i) => <button key={leader.slug} className={`cbar ${index === i ? 'on' : ''}`} aria-label={`切换到${leader.name}，${leader.role}`} aria-current={i === index ? 'true' : undefined} onClick={() => go(i)}><span><i className={paused ? 'paused' : ''} style={{ animationDuration: `${INTERVAL}ms` }} key={`${index}-${i}`}/></span></button>)}</div><button className="car-play" aria-label={playing ? HOME_COPY.carouselPause : HOME_COPY.carouselResume} aria-pressed={!playing} onClick={() => setPlaying(v => !v)}>{playing ? 'Ⅱ' : '▶'}</button></div>
  </div>;
}
