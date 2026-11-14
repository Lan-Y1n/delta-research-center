import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import App from './App';
import { DesignProvider } from './components/design/DesignProvider';
import './styles/preflight.css';
import './styles/tokens.css';
import './styles/global.css';
import './styles/liquid-glass.css';
import './styles/glass-variants.css';
import './styles/glass-material.css';
import './styles/typography.css';
import './styles/clear-buttons.css';

const container = document.getElementById('root')!;
const tree = <React.StrictMode><BrowserRouter><DesignProvider><MotionConfig reducedMotion="user"><App /></MotionConfig></DesignProvider></BrowserRouter></React.StrictMode>;
// 预渲染产物的 #root 里已有服务端 HTML：能 hydration 就 hydration（不重绘），否则首次挂载。
if (container.hasChildNodes()) ReactDOM.hydrateRoot(container, tree);
else ReactDOM.createRoot(container).render(tree);
