import { useCallback, useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { SITE } from '../../data/site';
import NavDropdown from './NavDropdown';
import MobileMenu from './MobileMenu';
export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const close = useCallback(() => setOpen(false), []);
  useEffect(() => { close(); }, [location, close]);
  useEffect(() => {
    const scroll = () => setScrolled(window.scrollY > 12);
    const media = window.matchMedia('(min-width: 941px)');
    const resize = () => { if (media.matches) close(); };
    scroll(); window.addEventListener('scroll', scroll, { passive: true }); media.addEventListener('change', resize);
    return () => { window.removeEventListener('scroll', scroll); media.removeEventListener('change', resize); };
  }, [close]);
  return <header className={`hdr ${scrolled ? 'is-scrolled' : ''}`}><div className="hdr-in"><Link className="brand" to="/" aria-label={`${SITE.name} · ${SITE.nav.home}`}><svg className="brand-mark" viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3 30 29H2Z" fill="none" stroke="currentColor" strokeWidth="1.3"/><path d="m16 12.5 7.5 13.5h-15Z" fill="currentColor" opacity=".22"/></svg><span className="brand-txt"><b>{SITE.name}</b><i>{SITE.en}</i></span></Link><nav className="nav" aria-label="主导航"><NavLink end to="/" className={({isActive}) => `nav-link ${isActive ? 'is-active' : ''}`}>{SITE.nav.home}</NavLink><NavDropdown/><NavLink to="/cooperation" className={({isActive}) => `nav-link ${isActive ? 'is-active' : ''}`}>{SITE.nav.cooperation}</NavLink></nav><div className="hdr-meta"><span className="node"><i className="dot"/>{SITE.node}</span><Link className="hdr-cta" to="/cooperation">{SITE.nav.contact}<span aria-hidden="true">→</span></Link></div><button className={`burger ${open ? 'is-open' : ''}`} aria-label={open ? '关闭菜单' : '打开菜单'} aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(v => !v)}><span/><span/></button></div><AnimatePresence>{open && <MobileMenu onClose={close}/>}</AnimatePresence></header>;
}
