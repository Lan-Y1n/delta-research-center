import { useEffect, useSyncExternalStore, type ReactNode } from 'react';
import { contentVersion, refreshContent, startContentSync, subscribeContent } from './data/runtime';

/**
 * 订阅后台内容版本。children 用函数传入：版本号变化时会重新创建元素，
 * 从而让整棵路由树重新渲染（直接传 <App/> 元素会被 React 复用，不会重渲染）。
 */
export function ContentSync({ children }: { children: (version: number) => ReactNode }) {
  const version = useSyncExternalStore(subscribeContent, contentVersion, contentVersion);

  useEffect(() => {
    void startContentSync();
    const onVisible = () => { if (document.visibilityState === 'visible') void refreshContent(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  return <>{children(version)}</>;
}

export default ContentSync;
