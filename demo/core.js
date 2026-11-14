/* ============================================================================
   DELTA RESEARCH CENTER — demo core
   数据层 + 视图渲染 + 路由 + 轮播 + 滚动动效。三套主题共用同一份 DOM 结构，
   主题差异全部由 theme-*.css 负责（这也顺便验证了"数据与表现分离"）。
   ========================================================================== */
(function () {
  'use strict';

  /* ---------------------------------------------------------------- data --- */

  const LEADERS = [
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

  const INSTITUTES = [
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

  const STATUS = {
    planning: { cn: '筹备中', en: 'PLANNING', cls: 'planning' },
    progress: { cn: '进行中', en: 'IN PROGRESS', cls: 'progress' },
    completed: { cn: '已完成', en: 'COMPLETED', cls: 'completed' },
    hold: { cn: '暂停', en: 'ON HOLD', cls: 'hold' },
  };

  const PROJECTS = [
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

  const CONTACT = {
    email: 'your-name@lany1n.icu',
    phone: '+86 000 0000 0000',
    location: '（占位）中国 · 某地 · 德尔塔研究中心园区',
    socials: [
      { name: 'GitHub', handle: '@your-handle', url: 'https://github.com/' },
      { name: 'X', handle: '@your-handle', url: 'https://x.com/' },
      { name: 'Telegram', handle: '@your-handle', url: 'https://telegram.org/' },
      { name: 'Bilibili', handle: '@your-handle', url: 'https://www.bilibili.com/' },
    ],
  };

  const INST_BY_SLUG = Object.fromEntries(INSTITUTES.map((i) => [i.slug, i]));
  const LEADER_BY_SLUG = Object.fromEntries(LEADERS.map((l) => [l.slug, l]));
  const leaderOf = (inst) => (inst.leader ? LEADER_BY_SLUG[inst.leader] : null);
  const projectsOf = (instSlug) => PROJECTS.filter((p) => p.inst === instSlug);

  /* --------------------------------------------------------------- utils --- */

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const arrowUpRight = '<span class="arw" aria-hidden="true">↗</span>';

  function plate(leader, size) {
    const cls = ['plate', size === 'lg' ? 'plate-lg' : '', leader.redacted ? 'is-redacted' : '']
      .filter(Boolean).join(' ');
    return (
      '<div class="' + cls + '" style="--hue:' + leader.hue + '">' +
      '<span class="plate-idx">' + leader.no + '</span>' +
      '<span class="plate-grid"></span>' +
      '<span class="plate-glyph">' + esc(leader.glyph) + '</span>' +
      (leader.redacted
        ? '<span class="plate-redact"><i>数据删除</i><b>DATA EXPUNGED</b><em>档案已按机构规程移除</em></span>'
        : '') +
      '<span class="plate-scan"></span>' +
      '<span class="plate-meta"><b>' + esc(leader.en) + '</b><i>PORTRAIT · 档案影像占位</i></span>' +
      '<span class="plate-name-v">' + esc(leader.name) + '</span>' +
      '</div>'
    );
  }

  function plateWrap(leader, opts) {
    const o = opts || {};
    return (
      '<div class="plate-wrap' + (o.cls ? ' ' + o.cls : '') + '">' +
      '<span class="corner c1"></span><span class="corner c2"></span>' +
      '<span class="corner c3"></span><span class="corner c4"></span>' +
      plate(leader, o.size) +
      (o.caption === false ? '' : (
        '<div class="plate-cap">' +
        '<span class="pc-no">' + leader.no + ' / 05</span>' +
        '<span class="pc-name">' + esc(leader.name) + '</span>' +
        '<span class="pc-role">' + esc(leader.role) + '</span>' +
        '<span class="pc-inst">' + esc(INST_BY_SLUG[leader.inst].cn) + ' · ' + esc(INST_BY_SLUG[leader.inst].en) + '</span>' +
        '</div>'
      )) +
      '</div>'
    );
  }

  function statusPill(s) {
    const st = STATUS[s];
    return '<span class="status s-' + st.cls + '"><i></i>' + st.cn + ' · ' + st.en + '</span>';
  }

  function progBlock(pct) {
    return (
      '<div class="prog">' +
      '<div class="prog-track"><i class="prog-fill"></i></div>' +
      '<div class="prog-num">' + pct + '<span>%</span></div>' +
      '</div>'
    );
  }

  /* ---------------------------------------------------------------- views --- */

  function viewHome() {
    const slides = LEADERS.map((l) => (
      '<a class="slide" href="#/field/' + l.inst + '" data-inst="' + l.inst + '" aria-label="' +
      esc(l.name + '，' + l.role + '，进入' + INST_BY_SLUG[l.inst].cn) + '">' +
      plate(l) +
      '<span class="slide-cap">' +
      '<span class="sc-k">' + l.no + ' / 05</span>' +
      '<span class="sc-name">' + esc(l.name) + '</span>' +
      '<span class="sc-role">' + esc(l.role) + '</span>' +
      '<span class="sc-inst">' + esc(INST_BY_SLUG[l.inst].cn) + ' · ' + esc(INST_BY_SLUG[l.inst].en) + '</span>' +
      '</span>' +
      '<span class="slide-hover"><b>进入 ' + esc(INST_BY_SLUG[l.inst].cn) + '</b><i>↗</i></span>' +
      '</a>'
    )).join('');

    const bars = LEADERS.map((l, i) => (
      '<button class="cbar' + (i === 0 ? ' on' : '') + '" data-i="' + i + '" aria-label="切换到' +
      esc(l.name) + '"><i></i></button>'
    )).join('');

    const cards = PROJECTS.map((p, i) => {
      const inst = INST_BY_SLUG[p.inst];
      return (
        '<a class="proj-card reveal" href="#/project/' + p.code + '" style="--p:' + p.progress + '%;--i:' + i + '">' +
        '<div class="proj-top"><span class="proj-code">' + p.code + '</span>' + statusPill(p.status) + '</div>' +
        '<h3 class="proj-name">' + esc(p.name) + '</h3>' +
        '<div class="proj-inst">' + esc(inst.cn) + ' · ' + esc(inst.en) + '</div>' +
        '<p class="proj-desc">' + esc(p.desc) + '</p>' +
        progBlock(p.progress) +
        '<div class="proj-foot"><span>项目详情</span>' + arrowUpRight + '</div>' +
        '<span class="card-sheen" aria-hidden="true"></span>' +
        '</a>'
      );
    }).join('');

    return (
      '<section class="hero" id="hero">' +
      '<div class="hero-amb" aria-hidden="true"><i class="g g1"></i><i class="g g2"></i><i class="beam"></i></div>' +
      '<div class="hero-in">' +

      '<div class="hero-brand">' +
      '<div class="eyebrow reveal"><i class="dot"></i>RESEARCH INSTITUTE · EST. 20XX' +
      '<span class="anno">NODE · 192.168.10.60</span></div>' +
      '<h1 class="hero-title"><span>德尔塔</span><span class="l2">研究中心</span></h1>' +
      '<div class="hero-en">DELTA&nbsp;&nbsp;RESEARCH&nbsp;&nbsp;CENTER</div>' +
      '<p class="hero-lede">在可测量的边界之外，重新定义问题。</p>' +
      '<p class="hero-sub">一个跨物理、生物、化学、数学与哲学的研究机构。以实验、推演与论证为方法，处理尚未被命名的问题。' +
      '<span class="ph">介绍文本为占位，待替换</span></p>' +
      '<div class="hero-cta">' +
      '<a class="btn btn-solid" href="#/field/physics"><span>探索研究领域</span>' + arrowUpRight + '</a>' +
      '<a class="btn btn-ghost" href="#/cooperation"><span>合作联络</span><span class="arw" aria-hidden="true">→</span></a>' +
      '</div>' +
      '<dl class="hero-stats">' +
      '<div><dt>研究院所</dt><dd>05</dd></div>' +
      '<div><dt>研究领域</dt><dd>06</dd></div>' +
      '<div><dt>在研项目</dt><dd>06</dd></div>' +
      '<div><dt>交叉平台</dt><dd>01</dd></div>' +
      '</dl>' +
      '</div>' +

      '<div class="hero-carousel" id="carousel">' +
      '<div class="car-frame">' +
      '<div class="car-viewport"><div class="car-track">' + slides + '</div></div>' +
      '<div class="car-hint"><span>拖动切换 · 点击照片进入研究院</span><b id="carCounter">01 — 05</b></div>' +
      '</div>' +
      '<div class="car-ui">' +
      '<div class="car-btns">' +
      '<button class="rbtn" data-dir="-1" aria-label="上一位负责人">←</button>' +
      '<button class="rbtn" data-dir="1" aria-label="下一位负责人">→</button>' +
      '</div>' +
      '<div class="car-bars">' + bars + '</div>' +
      '<button class="car-play" id="carPlay" aria-pressed="false" aria-label="暂停自动轮播">II</button>' +
      '</div>' +
      '</div>' +

      '</div>' +
      '<div class="hero-foot">' +
      '<button class="scroll-cue" type="button" data-scroll="projects"><span>SCROLL</span><i></i></button>' +
      '<span class="hero-foot-r">DRC · RESEARCH ARCHIVE / 20XX</span>' +
      '</div>' +
      '</section>' +

      '<section class="sec sec-projects" id="projects">' +
      '<div class="sec-head reveal">' +
      '<div class="sec-kicker"><span class="sec-no">02</span>CURRENT RESEARCH PROJECTS</div>' +
      '<h2 class="sec-title">目前研究项目</h2>' +
      '<p class="sec-note"><span class="ph-badge">示例占位数据 · SAMPLE DATA</span>' +
      '项目名称、简介与进度数字均为占位示例，用于确认信息结构；正式资料待替换。</p>' +
      '</div>' +
      '<div class="proj-grid">' + cards + '</div>' +
      '<div class="sec-foot"><span class="ph">共 06 个项目，其中 06 个为示例占位数据</span>' +
      '<a class="link-more" href="#/field/physics">查看全部研究领域' + arrowUpRight + '</a></div>' +
      '</section>' +

      '<section class="sec sec-about" id="about">' +
      '<div class="about-grid">' +
      '<div class="about-left reveal">' +
      '<div class="sec-kicker"><span class="sec-no">03</span>THE INSTITUTE</div>' +
      '<h2 class="sec-title">关于德尔塔</h2>' +
      '<p class="about-quote">"我们不假设问题已经被提出。"</p>' +
      '<span class="ph">机构沿革、规模与成果数据为占位</span>' +
      '</div>' +
      '<div class="about-right">' +
      '<p class="reveal">（占位）德尔塔研究中心是一个虚构的综合性科研机构，由五个研究院所与一个独立领域分区构成。' +
      '组织采用"研究院所 + 交叉平台"的双层结构：各院所负责领域内的长期问题，交叉平台负责跨领域的工具、数据与验证方法。</p>' +
      '<p class="reveal">（占位）本节介绍机构定位、设施功能与组织概况。所有文字均为可替换的占位内容，' +
      '不包含任何真实的机构、人员或成果信息。</p>' +
      '<div class="about-facts">' +
      '<div class="fact reveal"><span class="f-no">01</span><h4>研究定位</h4><p>（占位）以可验证的方法处理跨学科问题，强调实验、推演与论证的一致性。</p></div>' +
      '<div class="fact reveal"><span class="f-no">02</span><h4>设施功能</h4><p>（占位）低温测量、洁净实验、谱学表征、形式化验证与计算节点等平台。</p></div>' +
      '<div class="fact reveal"><span class="f-no">03</span><h4>组织概况</h4><p>（占位）五个研究院所 + 武装力量分区；负责人档案见各领域页面。</p></div>' +
      '</div>' +
      '<div class="about-cta reveal"><a class="btn btn-ghost" href="#/cooperation"><span>合作与联络</span>' +
      '<span class="arw" aria-hidden="true">→</span></a></div>' +
      '</div>' +
      '</div>' +
      '</section>'
    );
  }

  function miniProjects(instSlug) {
    const list = projectsOf(instSlug);
    if (!list.length) return '<p class="ph">（占位）该领域暂无登记项目。</p>';
    return '<div class="mini-list">' + list.map((p) => (
      '<a class="mini-proj" href="#/project/' + p.code + '">' +
      '<span class="mp-code">' + p.code + '</span>' +
      '<span class="mp-name">' + esc(p.name) + '</span>' +
      statusPill(p.status) +
      '<span class="mp-pct">' + p.progress + '%</span>' +
      '<span class="arw" aria-hidden="true">↗</span>' +
      '</a>'
    )).join('') + '</div>';
  }

  function viewField(slug) {
    const inst = INST_BY_SLUG[slug];
    if (!inst) return viewNotFound();
    const leader = leaderOf(inst);

    const head =
      '<div class="p-head">' +
      '<div class="p-crumb"><a href="#/">主页</a><i>/</i><span>领域</span><i>/</i><b>' + esc(inst.cn) + '</b></div>' +
      '<div class="p-no"><span>' + inst.no + '</span> / 06</div>' +
      '<div class="p-eyebrow">' + esc(inst.en.toUpperCase()) + ' · ' + inst.code + '</div>' +
      '<h1 class="p-title"><span>' + esc(inst.cn) + '</span><i>' + esc(inst.en) + '</i></h1>' +
      '<div class="p-tag">' + esc(inst.tag) + '</div>' +
      '</div>';

    if (inst.force) {
      return (
        '<section class="page page-field page-force">' + head +
        '<div class="field-body">' +
        '<div class="field-main">' +
        '<section class="blk reveal"><div class="blk-h"><span>01</span><h3>武装力量简介</h3></div>' +
        '<p>' + esc(inst.intro[0]) + '</p><p>' + esc(inst.intro[1]) + '</p></section>' +

        '<section class="blk reveal"><div class="blk-h"><span>02</span><h3>组织架构</h3>' +
        '<span class="ph-badge">占位</span></div>' +
        '<div class="org">' +
        '<div class="org-top"><b>指挥与协调中心</b><i>COMMAND &amp; COORDINATION</i></div>' +
        '<div class="org-line"></div>' +
        '<div class="org-cols">' +
        '<div class="org-col"><b>技术保障局</b><i>TECHNICAL SUPPORT</i></div>' +
        '<div class="org-col"><b>作战支队 ×3</b><i>OPERATIONAL UNITS</i></div>' +
        '<div class="org-col"><b>训练与评估组</b><i>TRAINING &amp; ASSESSMENT</i></div>' +
        '</div>' +
        '<p class="ph">（占位）实际编制、层级与隶属关系待补充。</p>' +
        '</div></section>' +

        '<section class="blk reveal"><div class="blk-h"><span>03</span><h3>下属单位及部门</h3></div>' +
        '<div class="cards-3">' + inst.units.map((u) => (
          '<div class="mini-card"><b>' + esc(u.t) + '</b><p>' + esc(u.d) + '</p></div>'
        )).join('') + '</div></section>' +

        '<section class="blk reveal"><div class="blk-h"><span>04</span><h3>装备与技术体系</h3></div>' +
        '<div class="spec-list">' + inst.equipment.map((e, i) => (
          '<div class="spec-row"><span class="sp-no">' + String(i + 1).padStart(2, '0') + '</span>' +
          '<b>' + esc(e.t) + '</b><span class="sp-d">' + esc(e.d) + '</span><span class="ph-badge">占位</span></div>'
        )).join('') + '</div></section>' +

        '<section class="blk reveal"><div class="blk-h"><span>05</span><h3>任务定位及职能</h3></div>' +
        '<div class="cards-2">' + inst.duties.map((d) => (
          '<div class="mini-card"><b>' + esc(d.t) + '</b><p>' + esc(d.d) + '</p></div>'
        )).join('') + '</div></section>' +

        '<section class="blk reveal"><div class="blk-h"><span>06</span><h3>相关人员</h3>' +
        '<span class="ph-badge">占位</span></div>' +
        '<p class="ph">（占位）武装力量暂不设置负责人，也不加入首页负责人轮播。人员编制与任职信息待补充，' +
        '此处不虚构任何姓名或履历。</p></section>' +
        '</div>' +

        '<aside class="field-side">' +
        '<div class="side-panel reveal">' +
        '<div class="side-kicker">FIELD STATUS</div>' +
        '<div class="side-rows">' +
        '<div><span>领域编号</span><b>' + inst.code + '</b></div>' +
        '<div><span>组织类型</span><b>独立领域分区</b></div>' +
        '<div><span>负责人</span><b>未设置</b></div>' +
        '<div><span>在研项目</span><b>' + String(projectsOf(inst.slug).length).padStart(2, '0') + '</b></div>' +
        '</div>' +
        '<a class="btn btn-ghost btn-block" href="#/cooperation"><span>合作与联络</span>' +
        '<span class="arw" aria-hidden="true">→</span></a>' +
        '</div>' +
        '<div class="side-note reveal"><b>说明</b><p>本页为武装力量的独立组织介绍布局，不与任何研究院所负责人绑定。</p></div>' +
        '</aside>' +
        '</div>' +

        '<div class="field-projects reveal"><div class="blk-h"><span>07</span><h3>相关项目</h3></div>' +
        miniProjects(inst.slug) + '</div>' +
        '</section>'
      );
    }

    return (
      '<section class="page page-field">' + head +
      '<div class="field-body">' +
      '<div class="field-main">' +
      '<section class="blk reveal"><div class="blk-h"><span>01</span><h3>研究院所简介</h3>' +
      '<span class="ph-badge">占位</span></div>' +
      '<p>' + esc(inst.intro[0]) + '</p><p>' + esc(inst.intro[1]) + '</p></section>' +

      '<section class="blk reveal"><div class="blk-h"><span>02</span><h3>主要研究方向</h3></div>' +
      '<ol class="dirs">' + inst.directions.map((d, i) => (
        '<li><span class="d-no">' + String(i + 1).padStart(2, '0') + '</span>' +
        '<div><b>' + esc(d.t) + '</b><p>' + esc(d.d) + '</p></div></li>'
      )).join('') + '</ol></section>' +

      '<section class="blk reveal"><div class="blk-h"><span>03</span><h3>研究设施与实验条件</h3></div>' +
      '<div class="cards-3">' + inst.facilities.map((f) => (
        '<div class="mini-card"><b>' + esc(f.t) + '</b><p>' + esc(f.d) + '</p><span class="ph-badge">占位</span></div>'
      )).join('') + '</div></section>' +

      '<section class="blk reveal"><div class="blk-h"><span>04</span><h3>研究项目</h3></div>' +
      miniProjects(inst.slug) + '</section>' +
      '</div>' +

      '<aside class="field-side">' +
      (leader ?
        '<div class="leader-card reveal">' +
        '<div class="side-kicker">DIRECTOR · 负责人</div>' +
        plateWrap(leader, { size: 'lg', caption: false }) +
        '<div class="lc-body">' +
        '<h3 class="lc-name">' + esc(leader.name) + '</h3>' +
        '<div class="lc-role">' + esc(leader.role) + '</div>' +
        '<a class="btn btn-solid btn-block" href="#/leader/' + leader.slug + '">' +
        '<span>查看负责人详情</span><i>VIEW PROFILE</i></a>' +
        '</div>' +
        '</div>' : '') +
      '<div class="side-panel reveal">' +
      '<div class="side-kicker">FIELD STATUS</div>' +
      '<div class="side-rows">' +
      '<div><span>领域编号</span><b>' + inst.code + '</b></div>' +
      '<div><span>研究院所</span><b>' + esc(inst.cn) + '</b></div>' +
      '<div><span>负责人</span><b>' + esc(leader ? leader.name : '—') + '</b></div>' +
      '<div><span>在研项目</span><b>' + String(projectsOf(inst.slug).length).padStart(2, '0') + '</b></div>' +
      '</div>' +
      '</div>' +
      '</aside>' +
      '</div>' +
      '</section>'
    );
  }

  function viewLeader(slug) {
    const l = LEADER_BY_SLUG[slug];
    if (!l) return viewNotFound();
    const inst = INST_BY_SLUG[l.inst];
    const redacted = !!l.redacted;

    const placeholderSection = (no, title, note) => (
      '<section class="blk reveal"><div class="blk-h"><span>' + no + '</span><h3>' + title + '</h3>' +
      '<span class="ph-badge">待补充</span></div>' +
      '<p class="ph">' + note + '</p></section>'
    );

    return (
      '<section class="page page-leader">' +
      '<div class="p-crumb"><a href="#/">主页</a><i>/</i><a href="#/field/' + inst.slug + '">' + esc(inst.cn) + '</a>' +
      '<i>/</i><b>负责人档案</b></div>' +

      '<div class="leader-grid">' +
      '<div class="leader-left">' +
      '<div class="ll-sticky">' +
      plateWrap(l, { size: 'lg', caption: false }) +
      '<div class="ll-index"><span>' + l.no + '</span><i>/ 05</i></div>' +
      '<a class="ll-back" href="#/field/' + inst.slug + '">← 返回' + esc(inst.cn) + '</a>' +
      '</div>' +
      '</div>' +

      '<div class="leader-right">' +
      '<div class="p-eyebrow">' + esc(l.roleEn) + '</div>' +
      '<h1 class="leader-name">' + esc(l.name) + '</h1>' +
      '<div class="leader-en">' + esc(l.en) + '</div>' +
      '<div class="leader-tags"><span>' + esc(l.role) + '</span><span>' + esc(inst.cn) + ' · ' + esc(inst.en) + '</span></div>' +
      (redacted
        ? '<div class="redact-note reveal"><b>档案状态</b><p>该负责人档案已按机构规程移除。姓名以「数据删除」原样显示，' +
          '本页不提供任何替代姓名、经历或成果信息。</p></div>'
        : '') +

      placeholderSection('01', '个人简介',
        '（占位）此处为负责人个人简介占位文本。姓名、职位与所属研究院所已确认；其余内容待本人或机构提供，本页不编造。') +

      '<section class="blk reveal"><div class="blk-h"><span>02</span><h3>专业领域</h3></div>' +
      '<div class="chips">' + (redacted
        ? '<span class="chip ph">档案已移除</span>'
        : '<span class="chip ph">＋ 待补充领域</span><span class="chip ph">＋ 待补充领域</span><span class="chip ph">＋ 待补充领域</span>') +
      '</div></section>' +

      placeholderSection('03', '研究方向', '（占位）研究方向清单待补充，最多建议 3–5 项。') +
      placeholderSection('04', '学术经历', '（占位）教育与任职经历待补充。本页不编造任何学历、机构或年限。') +
      placeholderSection('05', '研究成果', '（占位）论文、专利、专著等成果条目待补充。') +
      '<section class="blk reveal"><div class="blk-h"><span>06</span><h3>代表性科研项目</h3></div>' +
      miniProjects(inst.slug) + '</section>' +
      '<div class="leader-cta reveal"><a class="btn btn-ghost" href="#/field/' + inst.slug + '">' +
      '<span>返回' + esc(inst.cn) + '</span><span class="arw" aria-hidden="true">→</span></a></div>' +
      '</div>' +
      '</div>' +
      '</section>'
    );
  }

  function viewProject(code) {
    const p = PROJECTS.find((x) => x.code === code);
    if (!p) return viewNotFound();
    const inst = INST_BY_SLUG[p.inst];
    const st = STATUS[p.status];
    return (
      '<section class="page page-project">' +
      '<div class="p-crumb"><a href="#/">主页</a><i>/</i><a href="#/field/' + inst.slug + '">' + esc(inst.cn) + '</a>' +
      '<i>/</i><b>' + p.code + '</b></div>' +
      '<div class="proj-detail-head">' +
      '<div class="pd-meta"><span class="proj-code">' + p.code + '</span>' + statusPill(p.status) +
      '<span class="ph-badge">示例数据</span></div>' +
      '<h1 class="p-title"><span>' + esc(p.name) + '</span></h1>' +
      '<div class="p-tag">' + esc(inst.cn) + ' · ' + esc(inst.en) + '</div>' +
      '</div>' +
      '<div class="proj-detail-grid">' +
      '<div class="field-main">' +
      '<section class="blk reveal"><div class="blk-h"><span>01</span><h3>项目概述</h3><span class="ph-badge">占位</span></div>' +
      '<p>' + esc(p.desc) + '</p><p class="ph">（占位）项目背景、目标与验收标准待补充。本页不展示任何真实研究内容。</p></section>' +
      '<section class="blk reveal"><div class="blk-h"><span>02</span><h3>当前进度</h3></div>' +
      progBlock(p.progress) +
      '<p class="ph">（占位）进度为示例数字，用于确认进度条与状态标签的呈现方式。</p></section>' +
      '<section class="blk reveal"><div class="blk-h"><span>03</span><h3>阶段产出</h3><span class="ph-badge">待补充</span></div>' +
      '<p class="ph">（占位）阶段成果、数据集与交付物待补充。</p></section>' +
      '<section class="blk reveal"><div class="blk-h"><span>04</span><h3>参与单位</h3><span class="ph-badge">待补充</span></div>' +
      '<p class="ph">（占位）参与研究院所、合作方与人员名单待补充。</p></section>' +
      '</div>' +
      '<aside class="field-side"><div class="side-panel reveal"><div class="side-kicker">PROJECT DATA</div>' +
      '<div class="side-rows">' +
      '<div><span>所属院所</span><b>' + esc(inst.cn) + '</b></div>' +
      '<div><span>项目状态</span><b>' + st.cn + '</b></div>' +
      '<div><span>完成度</span><b>' + p.progress + '%</b></div>' +
      '<div><span>数据性质</span><b>示例占位</b></div>' +
      '</div></div></aside>' +
      '</div>' +
      '</section>'
    );
  }

  function viewCooperation() {
    const copy = (val, label) =>
      '<button class="copy-btn" data-copy="' + esc(val) + '" aria-label="复制' + esc(label) + '">复制</button>';
    return (
      '<section class="page page-coop">' +
      '<div class="coop-head">' +
      '<div class="p-eyebrow">COOPERATION · CONTACT</div>' +
      '<h1 class="p-title"><span>合作</span><i>Cooperation</i></h1>' +
      '<p class="coop-lede">研究合作、访问交流、数据与算力协作，或只是想聊聊某个问题——都可以从这里开始。' +
      '<span class="ph">以下联系方式为占位，上线前请替换为真实信息</span></p>' +
      '</div>' +

      '<div class="coop-grid">' +
      '<div class="coop-main">' +
      '<a class="coop-mail" href="mailto:' + esc(CONTACT.email) + '">' +
      '<span class="cm-k">EMAIL · 电子邮箱</span>' +
      '<span class="cm-v">' + esc(CONTACT.email) + '</span>' +
      '<span class="cm-note">占位地址 · 点击调用邮件客户端</span>' +
      arrowUpRight +
      '</a>' +

      '<div class="coop-rows">' +
      '<div class="coop-row"><span class="cr-k">联系方式</span><span class="cr-v">' + esc(CONTACT.phone) + '</span>' +
      '<span class="ph-badge">占位</span>' + copy(CONTACT.phone, '联系方式') + '</div>' +
      '<div class="coop-row"><span class="cr-k">所在位置</span><span class="cr-v">' + esc(CONTACT.location) + '</span>' +
      '<span class="ph-badge">占位</span></div>' +
      '<div class="coop-row"><span class="cr-k">合作邮箱</span><span class="cr-v">' + esc(CONTACT.email) + '</span>' +
      '<span class="ph-badge">占位</span>' + copy(CONTACT.email, '邮箱') + '</div>' +
      '</div>' +

      '<div class="coop-extra reveal">' +
      '<div class="ce-block"><b>其他合作渠道</b><p>（占位）可在此补充：合作申请表单、机构邮箱、PGP 公钥、邮寄地址等。</p>' +
      '<span class="ph-badge">待补充</span></div>' +
      '<div class="ce-block"><b>回复时间</b><p>（占位）工作日 48 小时内回复。此说明为示例文本。</p></div>' +
      '</div>' +
      '</div>' +

      '<aside class="coop-side">' +
      '<div class="side-panel">' +
      '<div class="side-kicker">SOCIAL · 社交媒体</div>' +
      '<div class="socials">' + CONTACT.socials.map((s) => (
        '<a class="social" href="' + s.url + '" target="_blank" rel="noopener noreferrer">' +
        '<span class="so-name">' + esc(s.name) + '</span>' +
        '<span class="so-handle">' + esc(s.handle) + '<i>待填写</i></span>' +
        '<span class="arw" aria-hidden="true">↗</span>' +
        '</a>'
      )).join('') + '</div>' +
      '<p class="ph">账号均为占位，链接指向各平台首页，不指向任何真实账号。</p>' +
      '</div>' +
      '</aside>' +
      '</div>' +
      '</section>'
    );
  }

  function viewNotFound() {
    return (
      '<section class="page page-404">' +
      '<div class="p-eyebrow">ERROR 404</div>' +
      '<h1 class="p-title"><span>页面不存在</span></h1>' +
      '<p class="ph">请从导航栏重新进入。</p>' +
      '<a class="btn btn-solid" href="#/"><span>返回主页</span><span class="arw" aria-hidden="true">→</span></a>' +
      '</section>'
    );
  }

  /* --------------------------------------------------------------- router --- */

  const view = document.getElementById('view');
  const veil = document.getElementById('veil');
  const hdr = document.getElementById('hdr');

  const ROUTES = [
    { re: /^$/, nav: 'home', render: viewHome, after: initHome },
    { re: /^field\/([\w-]+)$/, nav: 'fields', render: viewField, after: initPage },
    { re: /^leader\/([\w-]+)$/, nav: 'fields', render: viewLeader, after: initPage },
    { re: /^project\/([\w-]+)$/, nav: 'fields', render: viewProject, after: initPage },
    { re: /^cooperation$/, nav: 'coop', render: viewCooperation, after: initPage },
  ];

  function currentPath() {
    return (location.hash || '').replace(/^#\/?/, '');
  }

  let navigating = false;

  function render(first) {
    const path = currentPath();
    let hit = null;
    let arg = null;
    for (const r of ROUTES) {
      const m = path.match(r.re);
      if (m) { hit = r; arg = m[1]; break; }
    }

    const paint = () => {
      const html = hit ? hit.render(arg) : viewNotFound();
      view.innerHTML = html;
      updateNav(hit ? hit.nav : '');
      window.scrollTo({ top: 0, behavior: 'auto' });
      document.body.classList.remove('is-menu-open');
      document.querySelectorAll('.nav-item.open').forEach((n) => n.classList.remove('open'));
      if (hit && hit.after) hit.after();
      else initPage();
      navigating = false;
    };

    if (first) { paint(); return; }
    if (navigating) return;
    navigating = true;
    veil.classList.add('on');
    window.setTimeout(() => {
      paint();
      window.setTimeout(() => veil.classList.remove('on'), 40);
    }, 260);
  }

  function go(hash) {
    if (location.hash === hash) return;
    location.hash = hash;
  }

  function updateNav(navKey) {
    document.querySelectorAll('[data-nav]').forEach((el) => {
      const k = el.getAttribute('data-nav');
      el.classList.toggle('is-active', k === navKey || (k === 'fields' && navKey === 'fields'));
      if (k === 'fields') el.setAttribute('aria-current', navKey === 'fields' ? 'true' : 'false');
    });
  }

  /* ---------------------------------------------------------------- header --- */

  function initHeader() {
    const item = document.getElementById('navFields');
    const trigger = item.querySelector('.nav-trigger');
    let hoverTimer = null;

    const open = (v) => {
      item.classList.toggle('open', v);
      trigger.setAttribute('aria-expanded', v ? 'true' : 'false');
    };

    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      // 桌面端 hover 已经展开菜单，此时点击不应立刻收起（否则“悬停后点击”看起来像无响应）
      if (window.matchMedia('(hover: hover)').matches && item.matches(':hover')) {
        open(true);
        return;
      }
      open(!item.classList.contains('open'));
    });
    item.addEventListener('mouseenter', () => {
      if (window.matchMedia('(hover: hover)').matches) { clearTimeout(hoverTimer); open(true); }
    });
    item.addEventListener('mouseleave', () => {
      if (window.matchMedia('(hover: hover)').matches) {
        hoverTimer = setTimeout(() => open(false), 140);
      }
    });
    document.addEventListener('click', (e) => {
      if (!item.contains(e.target)) open(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { open(false); document.body.classList.remove('is-menu-open'); }
    });
    item.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => open(false)));

    const burger = document.getElementById('burger');
    burger.addEventListener('click', () => document.body.classList.toggle('is-menu-open'));
    document.querySelectorAll('.mob a').forEach((a) =>
      a.addEventListener('click', () => document.body.classList.remove('is-menu-open')));

    const onScroll = () => hdr.classList.toggle('is-scrolled', window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const clock = document.getElementById('hudClock');
    if (clock) {
      const tick = () => {
        const d = new Date();
        const p = (n) => String(n).padStart(2, '0');
        clock.textContent = p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
      };
      tick();
      setInterval(tick, 1000);
    }
  }

  /* -------------------------------------------------------------- carousel --- */

  function initCarousel() {
    const root = document.getElementById('carousel');
    if (!root) return;
    const track = root.querySelector('.car-track');
    const slides = Array.from(root.querySelectorAll('.slide'));
    const bars = Array.from(root.querySelectorAll('.cbar'));
    const counter = document.getElementById('carCounter');
    const play = document.getElementById('carPlay');
    const n = slides.length;
    let index = 0;
    let playing = true;
    let timer = null;
    let hovering = false;

    const pad = (v) => String(v).padStart(2, '0');

    function paint(anim) {
      track.style.transition = anim ? '' : 'none';
      track.style.transform = 'translate3d(' + (-index * 100 / n) + '%,0,0)';
      bars.forEach((b, i) => b.classList.toggle('on', i === index));
      if (counter) counter.textContent = pad(index + 1) + ' — ' + pad(n);
      slides.forEach((s, i) => s.setAttribute('aria-hidden', i === index ? 'false' : 'true'));
    }

    function goTo(i) {
      index = (i + n) % n;
      paint(true);
    }

    function next() { goTo(index + 1); }
    function prev() { goTo(index - 1); }

    function start() {
      stop();
      if (!playing) return;
      timer = setInterval(() => { if (!hovering && !document.hidden) next(); }, 5600);
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    root.querySelectorAll('.rbtn').forEach((b) => {
      b.addEventListener('click', () => {
        const dir = Number(b.dataset.dir);
        dir > 0 ? next() : prev();
        start();
      });
    });
    bars.forEach((b) => b.addEventListener('click', () => { goTo(Number(b.dataset.i)); start(); }));

    if (play) {
      play.addEventListener('click', () => {
        playing = !playing;
        play.classList.toggle('is-paused', !playing);
        play.setAttribute('aria-pressed', playing ? 'false' : 'true');
        play.setAttribute('aria-label', playing ? '暂停自动轮播' : '继续自动轮播');
        play.textContent = playing ? 'II' : '▶';
        start();
      });
    }

    root.addEventListener('mouseenter', () => { hovering = true; });
    root.addEventListener('mouseleave', () => { hovering = false; start(); });
    root.addEventListener('focusin', () => { hovering = true; });
    root.addEventListener('focusout', () => { hovering = false; });

    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); next(); start(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); start(); }
    });

    /* pointer drag / touch swipe */
    let drag = null;
    let suppressClick = false;
    const viewport = root.querySelector('.car-viewport');
    const width = () => viewport.getBoundingClientRect().width;

    viewport.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      drag = { x: e.clientX, dx: 0, t: Date.now(), moved: false, id: e.pointerId };
      viewport.setPointerCapture(e.pointerId);
      track.classList.add('is-dragging');
    });

    viewport.addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      drag.dx = e.clientX - drag.x;
      if (Math.abs(drag.dx) > 6) drag.moved = true;
      track.style.transition = 'none';
      track.style.transform = 'translate3d(calc(' + (-index * 100 / n) + '% + ' + drag.dx + 'px),0,0)';
    });

    function endDrag(e) {
      if (!drag) return;
      const dx = drag.dx;
      const dt = Math.max(1, Date.now() - drag.t);
      const v = Math.abs(dx) / dt;
      const threshold = width() * 0.18;
      track.classList.remove('is-dragging');
      if (drag.moved) {
        suppressClick = true;
        setTimeout(() => { suppressClick = false; }, 340);
      }
      if (drag.moved && (Math.abs(dx) > threshold || v > 0.45)) {
        dx < 0 ? next() : prev();
        e.preventDefault();
      } else {
        paint(true);
      }
      drag = null;
      start();
    }
    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', () => {
      drag = null;
      suppressClick = false;
      track.classList.remove('is-dragging');
      paint(true);
    });

    /* suppress the click that ends a real drag (so it doesn't navigate) */
    viewport.addEventListener('click', (e) => {
      if (suppressClick) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);

    document.addEventListener('visibilitychange', () => { document.hidden ? stop() : start(); });

    paint(false);
    start();
  }

  /* ----------------------------------------------------------------- reveal --- */

  let io = null;
  function initReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach((e) => e.classList.add('in'));
      return;
    }
    if (!io) {
      io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('in');
            io.unobserve(en.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    }
    els.forEach((e, i) => {
      if (!e.style.getPropertyValue('--d')) e.style.setProperty('--d', Math.min(i, 6) * 45 + 'ms');
      io.observe(e);
    });
  }

  function initPage() {
    initReveal();
    initCopy();
    initSheen();
    initScrollCtl();
  }

  function initScrollCtl() {
    document.querySelectorAll('[data-scroll]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const t = document.getElementById(btn.getAttribute('data-scroll'));
        if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  function initHome() {
    initPage();
    initCarousel();
  }

  /* cursor sheen on cards (used by theme A/C) */
  function initSheen() {
    document.querySelectorAll('.proj-card, .mini-card, .leader-card').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  function initCopy() {
    document.querySelectorAll('[data-copy]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const val = btn.getAttribute('data-copy');
        try {
          await navigator.clipboard.writeText(val);
          toast('已复制：' + val);
        } catch (err) {
          const ta = document.createElement('textarea');
          ta.value = val;
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand('copy'); toast('已复制：' + val); }
          catch (e) { toast('复制失败，请手动选择文本'); }
          ta.remove();
        }
      });
    });
  }

  let toastTimer = null;
  function toast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('on'), 2400);
  }

  /* ------------------------------------------------------------------ boot --- */

  history.scrollRestoration = 'manual';
  if (!location.hash) location.replace('#/');
  initHeader();
  window.addEventListener('hashchange', () => render(false));
  render(true);
})();
