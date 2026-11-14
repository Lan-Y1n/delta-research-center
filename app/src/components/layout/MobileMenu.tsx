import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router-dom';
import { INSTITUTES } from '../../data/institutes';
import { SITE } from '../../data/site';
export default function MobileMenu({ onClose }: { onClose: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    root.current?.querySelector<HTMLAnchorElement>('a')?.focus();
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); }
      if (event.key === 'Tab') {
        const links = root.current?.querySelectorAll<HTMLAnchorElement>('a');
        if (!links?.length) return;
        const first = links[0], last = links[links.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', keyboard);
    return () => { document.body.style.overflow = oldOverflow; document.removeEventListener('keydown', keyboard); previous?.focus(); };
  }, [onClose]);
  return <motion.div ref={root} className="mob" id="mobile-menu" role="dialog" aria-modal="true" aria-label="主导航" initial={{ opacity: 0, y: reduced ? 0 : -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : -8 }} transition={{ duration: .26, ease: [.32,.72,0,1] }}><nav className="mob-in" onClick={event => { if ((event.target as Element).closest('a')) onClose(); }}><Link to="/">{SITE.nav.home}<i>HOME</i></Link><div className="mob-group"><span>{SITE.nav.fields}<i>FIELDS</i></span>{INSTITUTES.map(item => <Link to={`/field/${item.slug}`} key={item.slug}><span><small>{item.no}</small>{item.short}</span><i>{item.en.replace('Institute of ', '')}</i></Link>)}</div><Link to="/cooperation">{SITE.nav.cooperation}<i>COOPERATION</i></Link></nav></motion.div>;
}
