import type { Field, Leader } from './types';
import { getLeader } from './leaders';
export type { Institute, ArmedForcesInstitute, Field } from './types';

export const INSTITUTES: Field[] = [
    {
      slug: 'physics', no: '01', cn: '物理研究院', en: 'Institute of Physics',
      code: 'DRC-PHY', short: '物理', tag: '物质 · 能量 · 测量', leader: 'lanyin',
      intro: [
        '（占位）物理研究院关注物质在极端条件下的行为，以及"测量"本身如何定义可以被研究的边界。本段为可替换的说明文本，正式介绍尚未提供。',
        '（占位）研究院以实验平台与理论推演并行的方式组织研究，具体历史、规模与成果数据待补充。',
      ],
      directions: [
        { t: '量子相干与退相干', d: '（占位）研究方向描述待补充。' },
        { t: '低温与高压物态', d: '（占位）研究方向描述待补充。' },
        { t: '精密测量与计量', d: '（占位）研究方向描述待补充。' },
      ],
      facilities: [
        { t: '低温测量平台', d: '（占位）设施参数与准入条件待补充。' },
        { t: '光学与光谱实验区', d: '（占位）设施参数与准入条件待补充。' },
        { t: '计算与数据节点', d: '（占位）设施参数与准入条件待补充。' },
      ],
    },
    {
      slug: 'biology', no: '02', cn: '生物研究院', en: 'Institute of Biology',
      code: 'DRC-BIO', short: '生物', tag: '生命 · 系统 · 演化', leader: 'huishi',
      intro: [
        '（占位）生物研究院把生命视为可观测、可扰动、可建模的系统，关注从分子到组织尺度的组织规律。本段为可替换的说明文本。',
        '（占位）研究院的样本库、伦理审查与数据治理框架待补充。',
      ],
      directions: [
        { t: '自组织与形态发生', d: '（占位）研究方向描述待补充。' },
        { t: '细胞图谱与谱系追踪', d: '（占位）研究方向描述待补充。' },
        { t: '环境适应与演化动力学', d: '（占位）研究方向描述待补充。' },
      ],
      facilities: [
        { t: '洁净细胞实验区', d: '（占位）设施参数与准入条件待补充。' },
        { t: '成像与显微平台', d: '（占位）设施参数与准入条件待补充。' },
        { t: '样本库（低温）', d: '（占位）设施参数与准入条件待补充。' },
      ],
    },
    {
      slug: 'chemistry', no: '03', cn: '化学研究院', en: 'Institute of Chemistry',
      code: 'DRC-CHM', short: '化学', tag: '分子 · 反应 · 材料', leader: 'redact-chem',
      intro: [
        '（占位）化学研究院关注分子层面的构造与转化，以及如何在可重复的条件下稳定地得到目标产物。本段为可替换的说明文本。',
        '（占位）研究院的合成能力、表征手段与安全规程待补充。',
      ],
      directions: [
        { t: '催化与反应路径', d: '（占位）研究方向描述待补充。' },
        { t: '功能材料合成', d: '（占位）研究方向描述待补充。' },
        { t: '分子表征方法', d: '（占位）研究方向描述待补充。' },
      ],
      facilities: [
        { t: '合成实验室', d: '（占位）设施参数与准入条件待补充。' },
        { t: '谱学表征平台', d: '（占位）设施参数与准入条件待补充。' },
        { t: '危化品存储与处置', d: '（占位）设施参数与准入条件待补充。' },
      ],
    },
    {
      slug: 'mathematics', no: '04', cn: '数学研究院', en: 'Institute of Mathematics',
      code: 'DRC-MTH', short: '数学', tag: '结构 · 证明 · 计算', leader: 'redact-math',
      intro: [
        '（占位）数学研究院以结构、证明与计算为三条主线，为其他研究院所提供形式化工具与可验证的推理框架。本段为可替换的说明文本。',
        '（占位）研究院的课题方向、讨论班制度与合作网络待补充。',
      ],
      directions: [
        { t: '拓扑与几何结构', d: '（占位）研究方向描述待补充。' },
        { t: '形式化证明', d: '（占位）研究方向描述待补充。' },
        { t: '数值方法与高性能计算', d: '（占位）研究方向描述待补充。' },
      ],
      facilities: [
        { t: '形式化验证环境', d: '（占位）设施参数与准入条件待补充。' },
        { t: '计算集群节点', d: '（占位）设施参数与准入条件待补充。' },
        { t: '研讨与协作空间', d: '（占位）设施参数与准入条件待补充。' },
      ],
    },
    {
      slug: 'philosophy', no: '05', cn: '哲学研究院', en: 'Institute of Philosophy',
      code: 'DRC-PHL', short: '哲学', tag: '意识 · 语言 · 边界', leader: 'zhiyan',
      intro: [
        '（占位）哲学研究院处理科学实践本身的前提问题：概念如何被定义、证据如何被接受、结论在什么范围内成立。本段为可替换的说明文本。',
        '（占位）研究院的议题清单、出版计划与跨学科工作坊安排待补充。',
      ],
      directions: [
        { t: '意识与主体性', d: '（占位）研究方向描述待补充。' },
        { t: '科学语言与概念分析', d: '（占位）研究方向描述待补充。' },
        { t: '技术与伦理', d: '（占位）研究方向描述待补充。' },
      ],
      facilities: [
        { t: '档案与文献室', d: '（占位）设施参数与准入条件待补充。' },
        { t: '跨学科讨论室', d: '（占位）设施参数与准入条件待补充。' },
        { t: '口述史采集设备', d: '（占位）设施参数与准入条件待补充。' },
      ],
    },
    {
      slug: 'armed-forces', no: '06', cn: '武装力量', en: 'Armed Forces',
      code: 'DRC-AFR', short: '武装力量', tag: '防御 · 响应 · 保障', leader: null, force: true,
      intro: [
        '（占位）武装力量是德尔塔研究中心的独立领域分区，而非普通研究院所。它承担设施防护、应急响应与技术保障职能。编制、装备与人员资料尚未提供，本页为可替换的结构占位。',
        '（占位）本页不绑定任何研究院所负责人；相关指挥与人员信息待补充。',
      ],
      units: [
        { t: '指挥与协调中心', d: '（占位）职能描述待补充。' },
        { t: '技术保障局', d: '（占位）职能描述待补充。' },
        { t: '第一支队', d: '（占位）编制与任务待补充。' },
        { t: '第二支队', d: '（占位）编制与任务待补充。' },
        { t: '第三支队', d: '（占位）编制与任务待补充。' },
        { t: '训练与评估组', d: '（占位）编制与任务待补充。' },
      ],
      equipment: [
        { t: '分布式感知节点', d: '（占位）技术参数待补充。' },
        { t: '通信中继系统', d: '（占位）技术参数待补充。' },
        { t: '移动实验平台', d: '（占位）技术参数待补充。' },
        { t: '应急电源与生命保障', d: '（占位）技术参数待补充。' },
      ],
      duties: [
        { t: '设施防护', d: '（占位）任务定位待补充。' },
        { t: '应急响应', d: '（占位）任务定位待补充。' },
        { t: '技术支援', d: '（占位）任务定位待补充。' },
        { t: '数据与信息安全', d: '（占位）任务定位待补充。' },
      ],
    },
  ];

export const INST_BY_SLUG: Readonly<Record<string, Field | undefined>> = Object.fromEntries(INSTITUTES.map((field) => [field.slug, field]));
export const getInstitute = (slug: string | undefined): Field | undefined => slug && Object.hasOwn(INST_BY_SLUG, slug) ? INST_BY_SLUG[slug] : undefined;
export const leaderOf = (field: Field): Leader | null => field.leader ? getLeader(field.leader) ?? null : null;
