import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { INSTITUTES } from '../../data/institutes';
import { SITE, HOME_COPY } from '../../data/site';
export default function NavDropdown() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const location = useLocation();
  useEffect(() => { setOpen(false); }, [location]);
  useEffect(() => {
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape' && open) { setOpen(false); trigger.current?.focus(); } };
    document.addEventListener('pointerdown', outside); document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [open]);
  useEffect(() => () => clearTimeout(closeTimer.current), []);
  return <div className="nav-item" ref={root} onMouseEnter={() => { clearTimeout(closeTimer.current); setOpen(true); }} onMouseLeave={() => { closeTimer.current = setTimeout(() => setOpen(false), 140); }} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}>
    <button ref={trigger} className={`nav-link nav-trigger ${/^\/(field|leader|project)\//.test(location.pathname) ? 'is-active' : ''}`} aria-expanded={open} aria-controls="field-menu" onClick={() => setOpen(v => !v)} onKeyDown={e => { if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); requestAnimationFrame(() => root.current?.querySelector<HTMLAnchorElement>('.menu-item')?.focus()); } }}>{SITE.nav.fields}<svg viewBox="0 0 10 6" aria-hidden="true"><path d="m1 1 4 4 4-4" fill="none" stroke="currentColor" /></svg></button>
    {open && <div className="menu" id="field-menu"><div className="menu-head"><span>{SITE.nav.fieldHeading}</span><span>{SITE.nav.fieldEn}</span><b>06</b></div><div className="menu-grid">{INSTITUTES.map(item => <Link className="menu-item" key={item.slug} to={`/field/${item.slug}`}><span className="mi-no">{item.no}</span><span className="mi-t"><b>{item.short}</b><i>{item.en.replace('Institute of ', '')}</i></span><span aria-hidden="true">↗</span></Link>)}</div><div className="menu-foot"><span>{SITE.nav.fieldSummary}</span><Link to="/cooperation">{HOME_COPY.cooperation} →</Link></div></div>}
  </div>;
}
