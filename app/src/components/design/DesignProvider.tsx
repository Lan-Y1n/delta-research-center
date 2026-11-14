import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export type DesignId = 'glass-1' | 'glass-2' | 'glass-3' | 'keynote';
export type MaterialPreference = 'auto' | 'glass' | 'solid';
export const DESIGNS: ReadonlyArray<{ id: DesignId; label: string; shortLabel: string }> = [
  { id: 'glass-1', label: 'Liquid Glass · 方案 1', shortLabel: '01' },
  { id: 'glass-2', label: 'Liquid Glass · 方案 2', shortLabel: '02' },
  { id: 'glass-3', label: 'Liquid Glass · 方案 3', shortLabel: '03' },
  { id: 'keynote', label: 'Keynote · 原版', shortLabel: 'D' },
];
const STORAGE_KEY = 'delta-research-center.design';
const MATERIAL_STORAGE_KEY = 'delta-research-center.material';
export const MATERIALS: ReadonlyArray<{ id: MaterialPreference; label: string }> = [
  { id: 'auto', label: '跟随系统' },
  { id: 'glass', label: '始终玻璃' },
  { id: 'solid', label: '实心面板' },
];
const isDesignId = (value: string | null): value is DesignId => DESIGNS.some(design => design.id === value);
const isMaterialPreference = (value: string | null): value is MaterialPreference => MATERIALS.some(material => material.id === value);

type DesignContextValue = { design: DesignId; setDesign: (design: DesignId) => void; material: MaterialPreference; setMaterial: (material: MaterialPreference) => void };
const DesignContext = createContext<DesignContextValue | null>(null);

function initialDesign(): DesignId {
  const requested = new URLSearchParams(window.location.search).get('design');
  if (isDesignId(requested)) return requested;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isDesignId(stored)) return stored;
  } catch { /* A blocked preference store does not prevent viewing a design. */ }
  return 'glass-1';
}

function initialMaterial(): MaterialPreference {
  const requested = new URLSearchParams(window.location.search).get('material');
  if (isMaterialPreference(requested)) return requested;
  try {
    const stored = localStorage.getItem(MATERIAL_STORAGE_KEY);
    if (isMaterialPreference(stored)) return stored;
  } catch { /* A blocked preference store does not prevent viewing a material. */ }
  return 'auto';
}

export function DesignProvider({ children }: { children: ReactNode }) {
  const [design, updateDesign] = useState<DesignId>(initialDesign);
  const [material, updateMaterial] = useState<MaterialPreference>(initialMaterial);
  const location = useLocation();
  const navigate = useNavigate();

  useLayoutEffect(() => {
    const requested = new URLSearchParams(location.search).get('design');
    if (isDesignId(requested)) updateDesign(requested);
    const requestedMaterial = new URLSearchParams(location.search).get('material');
    if (isMaterialPreference(requestedMaterial)) updateMaterial(requestedMaterial);
  }, [location.search]);

  useLayoutEffect(() => {
    document.documentElement.dataset.design = design;
    document.documentElement.dataset.material = material;
  }, [design, material]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, design); } catch { /* Preferences remain available in memory. */ }
  }, [design]);

  useEffect(() => {
    try { localStorage.setItem(MATERIAL_STORAGE_KEY, material); } catch { /* Preferences remain available in memory. */ }
  }, [material]);

  const setDesign = useCallback((next: DesignId) => {
    updateDesign(next);
    const search = new URLSearchParams(location.search);
    search.set('design', next);
    navigate({ pathname: location.pathname, search: `?${search.toString()}`, hash: location.hash }, { replace: true, preventScrollReset: true });
  }, [location.hash, location.pathname, location.search, navigate]);

  const setMaterial = useCallback((next: MaterialPreference) => {
    updateMaterial(next);
    const search = new URLSearchParams(location.search);
    search.set('material', next);
    navigate({ pathname: location.pathname, search: `?${search.toString()}`, hash: location.hash }, { replace: true, preventScrollReset: true });
  }, [location.hash, location.pathname, location.search, navigate]);

  const value = useMemo(() => ({ design, setDesign, material, setMaterial }), [design, setDesign, material, setMaterial]);
  return <DesignContext.Provider value={value}>{children}</DesignContext.Provider>;
}

export function useDesign() {
  const context = useContext(DesignContext);
  if (!context) throw new Error('useDesign requires DesignProvider');
  return context;
}
