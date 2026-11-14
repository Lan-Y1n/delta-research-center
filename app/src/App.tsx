import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Router from './router';
import { SITE } from './data/site';
import GlassEnvironment from './components/design/GlassEnvironment';
import DesignSwitcher from './components/design/DesignSwitcher';
export default function App() {
  const location = useLocation();
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
      else window.scrollTo({ top: 0, behavior: 'instant' });
      document.title = `${document.querySelector('h1')?.textContent || SITE.name} · ${SITE.en}`;
    });
    return () => cancelAnimationFrame(frame);
  }, [location.pathname, location.hash]);
  return <><GlassEnvironment/><a className="skip-link" href="#main">跳至主要内容</a><Header/><main id="main" tabIndex={-1}><Router/></main><Footer/><DesignSwitcher/></>;
}
