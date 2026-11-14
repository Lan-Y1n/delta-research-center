import type { Leader } from './types';
export type { Leader } from './types';

export const LEADERS: Leader[] = [
    {
      slug: 'lanyin', no: '01', name: '澜因', en: 'LANYIN', glyph: '澜',
      role: '物理研究院负责人', roleEn: 'DIRECTOR · INSTITUTE OF PHYSICS',
      inst: 'physics', hue: '#65C9F4',
    },
    {
      slug: 'huishi', no: '02', name: '慧矢', en: 'HUISHI', glyph: '慧',
      role: '生物研究院负责人', roleEn: 'DIRECTOR · INSTITUTE OF BIOLOGY',
      inst: 'biology', hue: '#91E5F2',
    },
    {
      slug: 'redact-chem', no: '03', name: '数据删除', en: 'DATA EXPUNGED', glyph: '▒',
      role: '化学研究院负责人', roleEn: 'DIRECTOR · INSTITUTE OF CHEMISTRY',
      inst: 'chemistry', hue: '#6E93B4', redacted: true,
    },
    {
      slug: 'redact-math', no: '04', name: '数据删除', en: 'DATA EXPUNGED', glyph: '▒',
      role: '数学研究院负责人', roleEn: 'DIRECTOR · INSTITUTE OF MATHEMATICS',
      inst: 'mathematics', hue: '#8FA9C4', redacted: true,
    },
    {
      slug: 'zhiyan', no: '05', name: '质湮', en: 'ZHIYAN', glyph: '湮',
      role: '哲学研究院负责人', roleEn: 'DIRECTOR · INSTITUTE OF PHILOSOPHY',
      inst: 'philosophy', hue: '#A9BEE8',
    },
  ];

export const LEADER_BY_SLUG: Readonly<Record<string, Leader | undefined>> = Object.fromEntries(LEADERS.map((leader) => [leader.slug, leader]));
export const getLeader = (slug: string | undefined): Leader | undefined => slug && Object.hasOwn(LEADER_BY_SLUG, slug) ? LEADER_BY_SLUG[slug] : undefined;

// 后台保存后由 runtime 层原址替换，保持模块导出的数组引用不变。
export function replaceLeaders(next: Leader[]): void {
  LEADERS.splice(0, LEADERS.length, ...next);
  const index = LEADER_BY_SLUG as Record<string, Leader | undefined>;
  Object.keys(index).forEach((key) => { delete index[key]; });
  LEADERS.forEach((leader) => { index[leader.slug] = leader; });
}
