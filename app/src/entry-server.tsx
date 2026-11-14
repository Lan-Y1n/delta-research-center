import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { MotionConfig } from 'motion/react';
import App from './App';
import { DesignProvider } from './components/design/DesignProvider';
import { LEADERS } from './data/leaders';
import { INSTITUTES } from './data/institutes';
import { PROJECTS } from './data/projects';
import { SITE } from './data/site';

/** 供预渲染脚本调用：把某个 URL 渲染成静态 HTML 字符串。 */
export function render(url: string): string {
  return renderToString(
    <StaticRouter location={url}>
      <DesignProvider>
        {/* isStatic：预渲染时跳过动画初始态，输出可见的最终状态 */}
        <MotionConfig isStatic reducedMotion="always">
          <App />
        </MotionConfig>
      </DesignProvider>
    </StaticRouter>,
  );
}

/** 需要生成静态页的所有路由（与 src/router.tsx 的 Routes 保持一致）。 */
export const routes: string[] = [
  '/',
  ...INSTITUTES.map(field => `/field/${field.slug}`),
  ...LEADERS.map(leader => `/leader/${leader.slug}`),
  ...PROJECTS.map(project => `/project/${project.code}`),
  '/cooperation',
];

export const siteEn: string = SITE.en;
