import { Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Institute from './pages/Institute';
import Leader from './pages/Leader';
import Project from './pages/Project';
import Cooperation from './pages/Cooperation';
import NotFound from './pages/NotFound';
import PageTransition from './components/layout/PageTransition';
export default function Router() {
  const location = useLocation();
  return <PageTransition key={location.pathname}><Routes location={location}><Route path="/" element={<Home/>}/><Route path="/field/:slug" element={<Institute/>}/><Route path="/leader/:slug" element={<Leader/>}/><Route path="/project/:code" element={<Project/>}/><Route path="/cooperation" element={<Cooperation/>}/><Route path="*" element={<NotFound/>}/></Routes></PageTransition>;
}
