import { useEffect, useState } from 'react';

const POINTER_SURFACES = '.proj-card,.btn-ghost,.slide-cap,.menu,.side-panel,.mini-card,.coop-mail,.social';

function makeRefractionMap() {
  const canvas = document.createElement('canvas');
  const size = 256;
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) return '';
  const image = context.createImageData(size, size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const nx = x / (size - 1) * 2 - 1;
      const ny = y / (size - 1) * 2 - 1;
      const distanceX = 1 - Math.abs(nx);
      const distanceY = 1 - Math.abs(ny);
      const blend = Math.max(0, Math.min(1, .5 + (distanceY - distanceX) * 5));
      const normalX = blend * blend * (3 - 2 * blend);
      const normalY = 1 - normalX;
      const magnitude = Math.hypot(normalX, normalY);
      const edge = Math.pow(Math.max(0, 1 - Math.min(distanceX, distanceY) / .35), 3);
      const offset = (y * size + x) * 4;
      // Nearest-boundary normals avoid tangential stretching along straight edges.
      // The CSS perimeter mask, rather than this shared map, protects the center.
      image.data[offset] = Math.round(128 + Math.sign(nx) * normalX / magnitude * edge * 92);
      image.data[offset + 1] = Math.round(128 + Math.sign(ny) * normalY / magnitude * edge * 92);
      image.data[offset + 2] = 128;
      image.data[offset + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);
  return canvas.toDataURL('image/png');
}

export default function GlassEnvironment() {
  // 预渲染（SSR）阶段没有 document：先渲染空滤镜，挂载后再用 canvas 生成折射位移图。
  // 首帧两端都是空串，避免 hydration 不一致；生成后 feImage 才挂上图片。
  const [map, setMap] = useState('');
  useEffect(() => { setMap(makeRefractionMap()); }, []);
  useEffect(() => {
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const reducedTransparency = matchMedia('(prefers-reduced-transparency: reduce)');
    let surface: HTMLElement | null = null;
    let point = { x: 0, y: 0 };
    let frame = 0;
    const clear = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      surface?.style.removeProperty('--glass-x');
      surface?.style.removeProperty('--glass-y');
      surface = null;
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || reducedMotion.matches || reducedTransparency.matches) { clear(); return; }
      const next = event.target instanceof Element ? event.target.closest<HTMLElement>(POINTER_SURFACES) : null;
      if (next !== surface) { clear(); surface = next; }
      if (!surface) return;
      point = { x: event.clientX, y: event.clientY };
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!surface) return;
        const rect = surface.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const x = Math.max(0, Math.min(100, (point.x - rect.left) / rect.width * 100));
        const y = Math.max(0, Math.min(100, (point.y - rect.top) / rect.height * 100));
        surface.style.setProperty('--glass-x', `${x.toFixed(2)}%`);
        surface.style.setProperty('--glass-y', `${y.toFixed(2)}%`);
      });
    };
    const leave = (event: PointerEvent) => {
      if (surface && !(event.relatedTarget instanceof Node && surface.contains(event.relatedTarget))) clear();
    };
    document.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerout', leave, { passive: true });
    reducedMotion.addEventListener('change', clear);
    reducedTransparency.addEventListener('change', clear);
    return () => {
      clear();
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerout', leave);
      reducedMotion.removeEventListener('change', clear);
      reducedTransparency.removeEventListener('change', clear);
    };
  }, []);

  return <>
    <svg className="glass-filter-definitions" width="0" height="0" aria-hidden="true" focusable="false"><defs><filter id="liquid-refraction" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB"><feImage href={map || undefined} x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="liquid-map" /><feDisplacementMap in="SourceGraphic" in2="liquid-map" scale="18" xChannelSelector="R" yChannelSelector="G" /></filter></defs></svg>
    <div className="glass-environment" aria-hidden="true"><span className="glass-light glass-light--one" /><span className="glass-light glass-light--two" /><span className="glass-light glass-light--three" /><span className="glass-background-ribbon glass-background-ribbon--one" /><span className="glass-background-ribbon glass-background-ribbon--two" /></div>
  </>;
}
