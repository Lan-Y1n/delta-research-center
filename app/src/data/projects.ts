import type { FieldSlug, Project, ProjectStatus, Status } from './types';
export type { Project, ProjectStatus } from './types';

export const STATUS: Record<ProjectStatus, Status> = {
    planning: { cn: '筹备中', en: 'PLANNING', cls: 'planning' },
    progress: { cn: '进行中', en: 'IN PROGRESS', cls: 'progress' },
    completed: { cn: '已完成', en: 'COMPLETED', cls: 'completed' },
    hold: { cn: '暂停', en: 'ON HOLD', cls: 'hold' },
  };

export const PROJECTS: Project[] = [
    {
      code: 'DRC-PHY-2401', name: '亚稳态量子相干阵列', inst: 'physics',
      desc: '示例占位：围绕阵列化量子单元的相干保持与读取展开，用于确认项目卡片的信息密度与版式。',
      progress: 12, status: 'planning',
    },
    {
      code: 'DRC-BIO-2402', name: '自组织细胞图谱', inst: 'biology',
      desc: '示例占位：构建跨尺度的细胞类型图谱，验证从样本到结构化数据的处理链路。',
      progress: 64, status: 'progress',
    },
    {
      code: 'DRC-CHM-2403', name: '低温催化路径筛选', inst: 'chemistry',
      desc: '示例占位：在低温条件下筛选候选反应路径，评估可重复性与产率稳定性。',
      progress: 38, status: 'progress',
    },
    {
      code: 'DRC-MTH-2404', name: '高维拓扑不变量计算框架', inst: 'mathematics',
      desc: '示例占位：把高维拓扑量的计算整理为可复用的形式化框架，并接入计算节点。',
      progress: 100, status: 'completed',
    },
    {
      code: 'DRC-PHL-2405', name: '意识边界的形式化描述', inst: 'philosophy',
      desc: '示例占位：尝试用形式语言描述"可观测边界"这一概念，形成可讨论的定义草案。',
      progress: 21, status: 'hold',
    },
    {
      code: 'DRC-AFR-2406', name: '分布式感知节点组网', inst: 'armed-forces',
      desc: '示例占位：把感知节点组织为具备冗余的观测网络，覆盖园区关键设施。',
      progress: 47, status: 'progress',
    },
  ];

export const projectsOf = (instSlug: FieldSlug | string): Project[] => PROJECTS.filter((project) => project.inst === instSlug);
export const getProject = (code: string | undefined): Project | undefined => PROJECTS.find((project) => project.code === code);
