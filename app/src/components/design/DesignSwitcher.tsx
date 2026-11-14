import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { DESIGNS, MATERIALS, useDesign } from './DesignProvider';

/** 只有显式带调试参数时才显示切换器：?switcher=1，或 URL 里已有 design / material。
 *  正常访问（线上默认）完全不渲染，避免悬浮控件遮挡正文、项目卡片和复制按钮。 */
function switcherRequested(search: string) {
  const params = new URLSearchParams(search);
  return params.has('switcher') || params.has('design') || params.has('material');
}

export default function DesignSwitcher() {
  const location = useLocation();
  const { design, setDesign, material, setMaterial } = useDesign();
  const [collapsed, setCollapsed] = useState(false);
  if (!switcherRequested(location.search)) return null;
  const materialIndex = MATERIALS.findIndex(option => option.id === material);
  const nextMaterial = MATERIALS[(materialIndex + 1) % MATERIALS.length];
  return <aside className={`design-switcher${collapsed ? ' is-collapsed' : ''}`} data-testid="design-switcher" aria-label="Stitch 设计方案切换">
    <div className="design-switcher-heading"><span>STITCH · LIQUID GLASS</span><button className="design-material-toggle" data-testid="material-preference" data-material-preference={material} type="button" aria-label={`材质：${MATERIALS[materialIndex].label}；点击切换为${nextMaterial.label}`} onClick={() => setMaterial(nextMaterial.id)}>{MATERIALS[materialIndex].label}</button><button className="design-switcher-toggle" type="button" aria-label={collapsed ? '展开设计方案切换' : '收起设计方案切换'} aria-expanded={!collapsed} aria-controls="design-options" onClick={() => setCollapsed(value => !value)}>{collapsed ? '＋' : '−'}</button></div>
    <div className="design-switcher-options" id="design-options" hidden={collapsed} style={collapsed ? { display: 'none' } : undefined} role="group" aria-label="选择设计方案">
      {DESIGNS.map(option => <button className={`design-option${design === option.id ? ' is-selected' : ''}`} key={option.id} type="button" data-design-target={option.id} aria-label={option.label} aria-pressed={design === option.id} onClick={() => setDesign(option.id)}><span className="design-option-index">{option.shortLabel}</span><span className="design-option-label">{option.label}</span></button>)}
    </div>
  </aside>;
}
