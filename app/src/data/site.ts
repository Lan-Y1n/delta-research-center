// Fixed copy migrated from demo/core.js and demo/d.html; BRIEF supplies the required badges.
export const SITE = {
  name: '德尔塔研究中心',
  en: 'DELTA RESEARCH CENTER',
  tagline: '在可测量的边界之外，重新定义问题。',
  node: 'NODE · 192.168.10.60',
  sample: '示例占位数据 · SAMPLE DATA',
  placeholder: '占位',
  pending: '待补充',
  fiction: '虚构机构 · 演示站点',
  disclaimer: '本站为虚构科研机构的展示站点。人物、项目、设施与联系方式均为示例占位内容，不对应任何真实机构或个人。',
  copyright: '© 20XX DELTA RESEARCH CENTER',
  archive: 'DRC / ARCHIVE TERMINAL · D',
  nav: { home: '主页', fields: '领域', cooperation: '合作', contact: '联络', fieldHeading: '研究领域', fieldEn: 'RESEARCH FIELDS', fieldSummary: '六个领域 · 05 位负责人', institution: '机构', about: '关于本站', backTop: '返回顶部', projects: '研究项目' },
};

export const PLATE_COPY = {
  portrait: 'PORTRAIT · 档案影像占位',
  removed: '档案已按机构规程移除',
  redacted: '数据删除',
  redactedEn: 'DATA EXPUNGED',
} as const;

export const HOME_COPY = {
  eyebrow: 'RESEARCH INSTITUTE · EST. 20XX',
  title: ['德尔塔', '研究中心'],
  intro: '一个跨物理、生物、化学、数学与哲学的研究机构。以实验、推演与论证为方法，处理尚未被命名的问题。',
  introNote: '介绍文本为占位，待替换',
  explore: '探索研究领域',
  cooperation: '合作联络',
  carouselHint: '拖动切换 · 点击照片进入研究院',
  carouselPrevious: '上一位负责人',
  carouselNext: '下一位负责人',
  carouselPause: '暂停自动轮播',
  carouselResume: '继续自动轮播',
  scroll: 'SCROLL',
  archive: 'DRC · RESEARCH ARCHIVE / 20XX',
  stats: [
    { label: '研究院所', value: '05' },
    { label: '研究领域', value: '06' },
    { label: '在研项目', value: '06' },
    { label: '交叉平台', value: '01' },
  ],
  projectNo: '02',
  projectEn: 'CURRENT RESEARCH PROJECTS',
  projectTitle: '目前研究项目',
  projectNote: '项目名称、简介与进度数字均为占位示例，用于确认信息结构；正式资料待替换。',
  projectCount: '共 06 个项目，其中 06 个为示例占位数据',
  allFields: '查看全部研究领域',
  projectDetails: '项目详情',
};

export const ABOUT_COPY = {
  no: '03', en: 'THE INSTITUTE', title: '关于德尔塔',
  quote: '"我们不假设问题已经被提出。"',
  note: '机构沿革、规模与成果数据为占位',
  intro: [
    '（占位）德尔塔研究中心是一个虚构的综合性科研机构，由五个研究院所与一个独立领域分区构成。组织采用"研究院所 + 交叉平台"的双层结构：各院所负责领域内的长期问题，交叉平台负责跨领域的工具、数据与验证方法。',
    '（占位）本节介绍机构定位、设施功能与组织概况。所有文字均为可替换的占位内容，不包含任何真实的机构、人员或成果信息。',
  ],
  facts: [
    { no: '01', title: '研究定位', body: '（占位）以可验证的方法处理跨学科问题，强调实验、推演与论证的一致性。' },
    { no: '02', title: '设施功能', body: '（占位）低温测量、洁净实验、谱学表征、形式化验证与计算节点等平台。' },
    { no: '03', title: '组织概况', body: '（占位）五个研究院所 + 武装力量分区；负责人档案见各领域页面。' },
  ],
  cooperation: '合作与联络',
} as const;

export const FIELD_COPY = {
  home: '主页', fields: '领域',
  intro: '研究院所简介', directions: '主要研究方向', facilities: '研究设施与实验条件', projects: '研究项目',
  director: 'DIRECTOR · 负责人', profile: '查看负责人详情', profileEn: 'VIEW PROFILE',
  status: 'FIELD STATUS', code: '领域编号', institute: '研究院所', leader: '负责人', projectCount: '在研项目',
  emptyProjects: '（占位）该领域暂无登记项目。',
  force: {
    intro: '武装力量简介', organization: '组织架构', units: '下属单位及部门', equipment: '装备与技术体系', duties: '任务定位及职能', people: '相关人员', projects: '相关项目',
    organizationRoot: { title: '指挥与协调中心', en: 'COMMAND & COORDINATION' },
    organizationChildren: [
      { title: '技术保障局', en: 'TECHNICAL SUPPORT' },
      { title: '作战支队 ×3', en: 'OPERATIONAL UNITS' },
      { title: '训练与评估组', en: 'TRAINING & ASSESSMENT' },
    ],
    organizationNote: '（占位）实际编制、层级与隶属关系待补充。',
    peopleNote: '（占位）武装力量暂不设置负责人，也不加入首页负责人轮播。人员编制与任职信息待补充，此处不虚构任何姓名或履历。',
    peopleSummary: '暂不设置负责人，资料待补充',
    typeLabel: '组织类型', type: '独立领域分区', leader: '未设置',
    noteTitle: '说明', note: '本页为武装力量的独立组织介绍布局，不与任何研究院所负责人绑定。',
  },
} as const;

export const LEADER_COPY = {
  archive: '负责人档案', back: '返回',
  statusTitle: '档案状态',
  statusNote: '该负责人档案已按机构规程移除。姓名以「数据删除」原样显示，本页不提供任何替代姓名、经历或成果信息。',
  pendingField: '＋ 待补充领域', removedField: '档案已移除',
  noFabrication: '（占位）本页不编造任何经历或资历。',
  sections: [
    { no: '01', title: '个人简介', body: '（占位）此处为负责人个人简介占位文本。姓名、职位与所属研究院所已确认；其余内容待本人或机构提供，本页不编造。' },
    { no: '02', title: '专业领域', body: '（占位）专业领域待补充。本页不编造任何经历或资历。' },
    { no: '03', title: '研究方向', body: '（占位）研究方向清单待补充，最多建议 3–5 项。' },
    { no: '04', title: '学术经历', body: '（占位）教育与任职经历待补充。本页不编造任何学历、机构或年限。' },
    { no: '05', title: '研究成果', body: '（占位）论文、专利、专著等成果条目待补充。' },
    { no: '06', title: '代表性科研项目', body: '（占位）代表性科研项目待补充。本页不编造任何经历或资历。' },
  ],
} as const;

export const PROJECT_COPY = {
  overview: '项目概述', progress: '当前进度', outputs: '阶段产出', participants: '参与单位',
  overviewNote: '（占位）项目背景、目标与验收标准待补充。本页不展示任何真实研究内容。',
  progressNote: '（占位）进度为示例数字，用于确认进度条与状态标签的呈现方式。',
  outputsNote: '（占位）阶段成果、数据集与交付物待补充。',
  participantsNote: '（占位）参与研究院所、合作方与人员名单待补充。',
  data: 'PROJECT DATA', institute: '所属院所', status: '项目状态', completion: '完成度', nature: '数据性质', sample: '示例占位',
} as const;

export const COOPERATION_COPY = {
  eyebrow: 'COOPERATION · CONTACT', title: '合作', en: 'Cooperation',
  intro: '研究合作、访问交流、数据与算力协作，或只是想聊聊某个问题——都可以从这里开始。',
  note: '以下联系方式为占位，上线前请替换为真实信息',
  emailLabel: 'EMAIL · 电子邮箱', emailNote: '占位地址 · 点击调用邮件客户端',
  phone: '联系方式', location: '所在位置', email: '合作邮箱',
  copy: '复制', copied: '已复制：', copyFailed: '复制失败，请手动选择文本',
  extras: [
    { title: '其他合作渠道', body: '（占位）可在此补充：合作申请表单、机构邮箱、PGP 公钥、邮寄地址等。' },
    { title: '回复时间', body: '（占位）工作日 48 小时内回复。此说明为示例文本。' },
  ],
  social: 'SOCIAL · 社交媒体', pending: '待填写',
  socialNote: '账号均为占位，链接指向各平台首页，不指向任何真实账号。',
} as const;

export const NOT_FOUND_COPY = {
  eyebrow: 'ERROR 404', title: '页面不存在', note: '请从导航栏重新进入。', back: '返回主页',
} as const;
