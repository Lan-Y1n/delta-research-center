import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import App from './App';
import ContentSync from './ContentSync';
import { DesignProvider } from './components/design/DesignProvider';
import { applyBootstrapContent } from './data/runtime';
import './styles/preflight.css';
import './styles/tokens.css';
import './styles/global.css';
import './styles/liquid-glass.css';
import './styles/glass-variants.css';
import './styles/glass-material.css';
import './styles/typography.css';
import './styles/clear-buttons.css';

// 预渲染页面里内联了 window.__CONTENT__：先应用，保证 hydration 的首帧与服务端 HTML 完全一致。
applyBootstrapContent();

const container = document.getElementById('root')!;
const tree = <React.StrictMode><BrowserRouter><DesignProvider><MotionConfig reducedMotion="user"><ContentSync>{() => <App />}</ContentSync></MotionConfig></DesignProvider></BrowserRouter></React.StrictMode>;
// 预渲染产物的 #root 里已有服务端 HTML：能 hydration 就 hydration（不重绘），否则首次挂载。
if (container.hasChildNodes()) ReactDOM.hydrateRoot(container, tree);
else ReactDOM.createRoot(container).render(tree);
