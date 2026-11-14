# 德尔塔研究中心 官网 · 设计开发任务书（交给 Codex）

> 本文件是自包含的施工说明。**先完整读一遍，再动手。**
> 配套参考资料：
> - 可交互原型（6 套视觉方案，同一份数据）：`I:\PVE\sites\delta-research-center\demo\{a,b,c,d,e,f}.html`（本地预览 `http://127.0.0.1:18080/<字母>.html`）
> - 六套方案的首页截图：`I:\PVE\sites\delta-research-center\demo\preview\scheme-{A..F}-home.png`
> - 数据与路由原型源码：`demo/core.js`（**数据以此为准，直接迁移，不要重写文案**）
> - 参考的 Stitch 方案：`demo/preview/stitch-scheme-1-fullpage.png`、`demo/preview/STITCH-NOTES.md`
> - 端口/网络约定：`I:\PVE\AGENTS-网络与端口约定.md`

---

## 0. 一句话目标

把已经验证过的 **方案 D（KEYNOTE 纯黑发布会）** 视觉方向，重建成一个 **React + TypeScript + Tailwind + Framer Motion** 的正式站点，所有页面可访问、所有交互真实可用、文案与数据严格按本文件，最后可以打成 Docker 镜像跑在 8080 端口。

**不要重新做视觉探索。** 方向已经定了：Apple 官网式的「简约、大气、圆润、高级」。

---

## 1. 项目背景

- 网站名：**德尔塔研究中心 / DELTA RESEARCH CENTER**，一个**虚构**的综合性科研机构官网。
- 定位：高端、严谨、专业、现代；中文为主、英文辅助。
- 站点是个人网站的“科研机构”包装，不是真实机构，**不得出现任何真实机构/人物/联系方式**。
- 所有人物、项目、设施、成果、联系方式都是**示例占位**，必须在 UI 上明确标注（见第 6 节）。

---

## 2. 技术栈与目录

- Vite + React 18/19 + TypeScript（strict）+ Tailwind CSS（建议 v3，若用 v4 自行确认配置）+ Framer Motion（`motion`）+ React Router（`BrowserRouter` 或 `HashRouter`，nginx 需配 SPA fallback）。
- 工作目录：`I:\PVE\sites\delta-research-center\app`
- 建议结构：

```
app/
  src/
    main.tsx, App.tsx, router.tsx
    styles/tokens.css        # 设计变量（见第 3 节），Tailwind 里引用
    data/
      leaders.ts  institutes.ts  projects.ts  contact.ts  site.ts
    components/
      layout/{Header,NavDropdown,MobileMenu,Footer,PageTransition}.tsx
      ui/{Button,GlassCard,StatusPill,ProgressBar,SectionHeading,Plate,Reveal}.tsx
      home/{Hero,LeaderCarousel,ProjectGrid,AboutSection}.tsx
      institute/{InstituteHero,DirectionList,FacilityGrid,LeaderCard}.tsx
      leader/{LeaderHero,PlaceholderSection}.tsx
    pages/{Home,Institute,Leader,Project,Cooperation,NotFound}.tsx
  index.html  tailwind.config.ts  vite.config.ts  package.json
  Dockerfile  nginx.conf  docker-compose.yml  deploy.sh  README.md  .env.example
```

- 数据必须**单一来源**：`src/data/*.ts`。负责人 ↔ 研究院所 ↔ 项目用 `slug` / `code` 关联，不允许在页面里硬编码人名或项目名。
- 图片：人物照片先不放真图，用「档案底板」占位组件（第 6.2 节），留 `image?: string` 字段，未来替换 `public/people/{slug}.jpg` 即可。

---

## 3. 设计系统（方案 D，必须精确复刻）

### 3.1 颜色

| Token | 值 | 用途 |
|---|---|---|
| `--bg` | `#000000` | 页面底色（纯黑） |
| `--surface` | `rgba(255,255,255,.045)` | 卡片/面板 |
| `--surface-hover` | `rgba(255,255,255,.06)` | 卡片 hover |
| `--text` | `#F5F5F7` | 主文字（Apple 白） |
| `--muted` | `#A1A1A6` | 次要文字 |
| `--muted-2` | `#7C7C81` | 说明/占位文字 |
| `--accent` | `#65C9F4` | 主强调（冰蓝） |
| `--accent-soft` | `#AFE9FF` | 次强调/高亮文字 |
| `--line` | `rgba(255,255,255,.09)` | 1px 分隔线 |
| `--line-strong` | `rgba(255,255,255,.20)` | 按钮/输入边框 |
| `--success` | `#30D158` | 运行状态点 |

- 背景光：`radial-gradient(900px 620px at 72% -6%, rgba(101,201,244,.18), transparent 68%)` + 第二层 `rgba(120,160,220,.10)`，整体 `filter: blur(40px)`，**只有这一层柔光，不要网格、扫描线、HUD 装饰**。
- 禁止：彩色渐变铺底、廉价霓虹、纯黑上大面积深蓝面板（会显脏）。

### 3.2 字体

- 全站一套无衬线栈：`-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Inter, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif`。
- 中文在 Windows/Android 上回落到 PingFang/微软雅黑即可，**不要引外部字体 CDN**；如要统一，内置 1 个中文子集 woff2（可选，非必须）。
- 字号/字距/行高（桌面 1440 基准）：
  - Hero 主标题：`clamp(56px, 6.4vw, 108px)` / `line-height .96` / `letter-spacing -.045em` / `700`
  - 段落大标题：`clamp(36px, 4.4vw, 68px)` / `1.04` / `-.032em` / `700`
  - 内页标题：`clamp(40px, 5vw, 76px)` / `1.02` / `-.038em` / `700`
  - 正文：`14–15px` / `1.75` / `0`
  - 小标签：`11–12px` / `letter-spacing .14–.18em` / `500` / `uppercase`（英文才大写）
  - 数字（统计、百分比）：`600`，`letter-spacing -.02em`，**用 `font-variant-numeric: tabular-nums`**
- 标题用**两行递进**：第一行纯白渐变（`linear-gradient(180deg,#FFF 22%,#C9E8F7 96%)` 裁切到文字），第二行冰蓝渐变（`#B9E6FA → #5FBBE4`）。这是本站的签名视觉，务必保留。

### 3.3 形状 / 玻璃 / 阴影

- 圆角：卡片 `24px`，大卡片/肖像框 `30px`，胶囊按钮 `999px`，小标签 `999px`。**全站不要出现直角卡片。**
- 卡片：`background: rgba(255,255,255,.045)` + `1px solid rgba(255,255,255,.08)` + `box-shadow: inset 0 1px 0 rgba(255,255,255,.06)`；不使用 backdrop-blur（纯黑底上模糊没效果），只在**浮层**（下拉菜单、吸顶导航、底部提示条、toast）用 `backdrop-filter: saturate(180%) blur(20px)`。
- 强调投影（肖像框）：`0 60px 120px -60px #000, 0 0 120px -40px rgba(101,201,244,.35)`。
- 导航：高 `54px`，`background: rgba(6,8,12,.68)`，底部 1px `--line`，滚动后加深到 `.86`。

### 3.4 节奏

- 区块上下留白：`clamp(90px, 11vw, 150px)`。
- 内容最大宽 `1280px`，左右 padding 桌面 `40px` / 移动 `20px`。
- 栅格：Hero `1.02fr / .98fr`；内容页 `1fr / 340px` 侧栏；项目卡 3 列（≤1080px 2 列，≤680px 1 列）。

### 3.5 动效（克制）

- 统一曲线 `cubic-bezier(.32,.72,0,1)`。
- 入场：`opacity 0 → 1` + `translateY(18px → 0)`，`600–900ms`，同组元素 stagger 40–60ms，用 `IntersectionObserver`（`once: true`）触发。
- 悬停：卡片 `translateY(-6px)` + 边框提亮，`450–550ms`；按钮 `scale(1.03)`。
- 轮播切换：`transform: translateX`，`600–750ms` 同曲线；拖动时跟随手指（`pointer events` + `setPointerCapture`），松手按位移/速度决定翻页，拖动后要抑制误触点击。
- 路由切换：整页遮罩淡入淡出（260ms），或 Framer Motion `AnimatePresence` 淡入 + 8px 位移。
- 必须支持 `prefers-reduced-motion: reduce`（位移取消，只保留透明度过渡）。

---

## 4. 页面与交互（硬性验收点）

路由：

| 路径 | 页面 |
|---|---|
| `/` | 主页 |
| `/field/:slug` | 六个领域页（physics / biology / chemistry / mathematics / philosophy / armed-forces） |
| `/leader/:slug` | 5 个负责人详情页 |
| `/project/:code` | 项目详情页 |
| `/cooperation` | 合作页 |
| `*` | 404 |

### 4.1 顶部导航（所有页面）

- 固定吸顶、纯黑半透明玻璃，左侧三角标记 + `德尔塔研究中心 / DELTA RESEARCH CENTER`（中英两行，英文 8.5px、字距 .22em、`#86868B`）。
- 中部：`主页` / `领域`（下拉 6 项）/ `合作`，12.5px `500`；当前页高亮为纯白，其余 `rgba(245,245,247,.72)`；**不要下划线**。
- 右侧：`NODE · 192.168.10.60`（10px、`#6E6E73`、绿色呼吸点）+ `联络 →` 胶囊按钮。
- 下拉：`hover` 展开 + 点击切换；`aria-expanded` 同步；`Esc` 与点击外部关闭；面板 640px、圆角 24px、2 列 6 项，每项「编号 + 中文 + 英文 + ↗」，`hover` 背景 `rgba(255,255,255,.07)`。
- 移动端（≤940px）：汉堡 → 全屏抽屉（含 6 个领域），点击后关闭。

### 4.2 首页第一屏（16:9 基准，必须一屏装下）

- 桌面：`grid-template-columns: 1.02fr .98fr`，高度 `calc(100svh - 54px)`，内容垂直居中；1440×810 / 1280×800 下**不得出现滚动才能看全首屏主体**。
- 左栏：eyebrow（`RESEARCH INSTITUTE · EST. 20XX`，冰蓝，12px，字距 .16em）→ 两行大标题 → `DELTA RESEARCH CENTER`（12.5px，字距 .42em，`#86868B`）→ 标语「在可测量的边界之外，重新定义问题。」（19–24px，`500`，`#E8E8ED`）→ 两行机构介绍（14px，`#8E8E93`）→ 两个胶囊按钮（`探索研究领域` 白底黑字主按钮 / `合作联络` 描边幽灵）→ 4 项统计（05 研究院所 / 06 研究领域 / 06 在研项目 / 01 交叉平台，数字 30–42px `600`，左侧 1px 分隔线）。
- 右栏：**轮播，同一时刻只能显示一张**，9:16 竖向卡片，宽度上限 460px，圆角 30px，超大柔和外发光；卡片内是「档案底板」（见 6.2）；卡片底部内侧浮一层磨砂胶囊，显示 `01 / 05` + 姓名 + 职位 + 院所。
- 卡片下方：`拖动切换 · 点击照片进入研究院` + `01 — 05` 计数；再一行：`←` `→` 圆形按钮 + 5 段细进度条 + 暂停按钮。
- 交互：自动播放 5.6s；`hover`/`focus` 暂停；左右按钮、键盘 ←/→、鼠标拖动、触屏滑动；暂停按钮可切换；切换时姓名/职位/院所同步；**点击当前照片 → 对应 `/field/:slug`**。
- 五位负责人顺序固定：澜因(物理) → 慧矢(生物) → 数据删除(化学) → 数据删除(数学) → 质湮(哲学)。武装力量**不出现**在轮播里。

### 4.3 首页第二屏：目前研究项目

- 标题区：`02 · CURRENT RESEARCH PROJECTS`（11px，`#86868B`）+ 「目前研究项目」大标题 + 右侧说明：`示例占位数据 · SAMPLE DATA` 徽标 + 一句「项目名称、简介与进度数字均为占位示例，正式资料待替换。」
- 3 列卡片（gutter 20px）：编号 `DRC-XXX-XXXX`（10px `#7C7C81`）、状态胶囊、项目名（21px `600`）、院所中英、简介（13px/1.7）、进度条（4px 圆角，渐变填充，动画到位）+ 百分比（15px `600`）、底部「项目详情 ↗」。
- 状态四种：筹备中 Planning（灰）、进行中 In Progress（冰蓝）、已完成 Completed（绿 `#30D158`）、暂停 On Hold（橙 `#FF9F0A`）。
- 卡片 hover：上浮 6px + 边框提亮 + 投影加深。
- 点击卡片 → `/project/:code`。

### 4.4 首页第三屏：关于德尔塔

- 两栏：左侧 `03 · THE INSTITUTE` + 「关于德尔塔」+ 一句大字引言；右侧 2 段占位介绍 + 3 条要点（研究定位 / 设施功能 / 组织概况）+ 一个幽灵按钮「合作与联络」。
- 文案全部写成「（占位）」并标注可替换。

### 4.5 六个领域页（统一结构）

顺序：面包屑 → `01 / 06` 编号 → 英文院所名 + 编号 → 中英标题 → 关键词行（如 `物质 · 能量 · 测量`）→ 简介 2 段（占位）→ 主要研究方向 3 条（占位）→ 研究设施与实验条件 3 张卡（占位）→ 研究项目列表（按 `inst` 过滤）→ 右侧 sticky 负责人卡（9:16 底板 + 姓名 + 职位 + **「查看负责人详情 VIEW PROFILE」**按钮）→ 右侧 FIELD STATUS 数据卡。

- 化学 / 数学：负责人姓名**必须原样显示「数据删除」**，不得替换或虚构；底板用“档案已移除”的遮蔽样式（可参考原型 `.plate.is-redacted`）。
- 武装力量 `/field/armed-forces`：**独立分区布局，不是普通院所**，且**不绑定任何负责人**。内容：简介、组织架构（指挥中心 → 技术保障局 / 作战支队×3 / 训练与评估组）、下属单位 6 项、装备与技术体系（表格行）、任务定位 4 项、相关人员（明确写“暂不设置负责人，资料待补充”）。全部占位。

### 4.6 负责人详情页（5 个）

- 左侧 sticky：9:16 档案底板（30px 圆角）、索引 `01 / 05`、返回院所链接。
- 右侧：英文职位 → 姓名（超大 700，76–82px）→ 英文名（12px，字距 .34em）→ 2 个标签（中文职位 / 院所中英）→ 「个人简介 / 专业领域 / 研究方向 / 学术经历 / 研究成果 / 代表性科研项目」六个区，**每区明确标注「待补充」**，正文写“（占位）……本页不编造任何经历或资历”。
- 化学/数学负责人：顶部一条「档案状态」提示条，说明档案已按机构规程移除、姓名以「数据删除」原样显示。
- 专业领域用胶囊 chip；未提供时显示 `＋ 待补充领域`。

### 4.7 合作页

- 大号 mailto 卡片（`your-name@lany1n.icu` 占位，点击调起邮件客户端）+ 3 行联系方式（均可一键复制，复制成功弹 toast）+ 2 个补充区块（其他渠道 / 回复时间）+ 右侧 4 个社交入口（GitHub / X / Telegram / Bilibili，**链接指向平台首页，不指向真实账号**，每项标注“待填写”）。
- 所有联系方式必须带「占位」徽标；**不得编造真实电话/账号**。

### 4.8 项目详情页

`/project/:code`：编号 + 状态 + SAMPLE 徽标 → 项目名 → 所属院所 → 项目概述（占位）→ 当前进度（进度条 + 百分比）→ 阶段产出（待补充）→ 参与单位（待补充）→ 右侧 PROJECT DATA 卡（所属院所 / 状态 / 完成度 / 数据性质=示例占位）。

---

## 5. 内容数据（直接从 `demo/core.js` 迁移）

- 5 位负责人：`lanyin 澜因 LANYIN`（物理）、`huishi 慧矢 HUISHI`（生物）、`redact-chem 数据删除 DATA EXPUNGED`（化学）、`redact-math 数据删除 DATA EXPUNGED`（数学）、`zhiyan 质湮 ZHIYAN`（哲学）。
- 6 个领域：physics / biology / chemistry / mathematics / philosophy / armed-forces（前 5 个 `leader` 指向负责人，武装力量 `leader: null`）。
- 6 个项目：`DRC-PHY-2401 亚稳态量子相干阵列 12% 筹备中`、`DRC-BIO-2402 自组织细胞图谱 64% 进行中`、`DRC-CHM-2403 低温催化路径筛选 38% 进行中`、`DRC-MTH-2404 高维拓扑不变量计算框架 100% 已完成`、`DRC-PHL-2405 意识边界的形式化描述 21% 暂停`、`DRC-AFR-2406 分布式感知节点组网 47% 进行中`。
- 文案、占位段落、设施名、方向名全部沿用 `core.js`，**不要改写、不要新增虚构内容**。

---

## 6. 占位规则（重要，违反即返工）

1. 任何未提供的资料：正文写「（占位）…」，区块标题旁放 `待补充` 徽标；项目相关一律 `示例占位数据 · SAMPLE DATA`。
2. 人物照片不要找真实人像。用代码生成的 **9:16 档案底板**：
   - 深黑底 + 该负责人主色的极淡光晕 + 细网格（透明度 ≤.08）+ 巨大汉字水印（`澜/慧/湮`，透明度 .14–.16）+ 右上竖排姓名 + 左上编号 + 底部 `PORTRAIT · 档案影像占位`。
   - 化学/数学用遮蔽纹理 + 「数据删除 / DATA EXPUNGED / 档案已按机构规程移除」。
   - 组件名 `Plate`，接收 `{ name, en, glyph, hue, no, redacted }`。
3. 禁止编造：学历、任职经历、论文、奖项、真实联系方式、真实账号、真实合作方。
4. 页脚必须有：「本站为虚构科研机构的展示站点。人物、项目、设施与联系方式均为示例占位内容，不对应任何真实机构或个人。」

---

## 7. 响应式 / 可访问性

- 断点：≤1080（两栏收起）、≤940（隐藏桌面导航，汉堡菜单）、≤680（单列、字号下调）。
- 移动端：Hero 上下堆叠，肖像卡居中，宽 ≤420px；文字不溢出、图片不变形；轮播支持触屏滑动；导航抽屉可用。
- 触控目标 ≥44px；所有按钮 `<button>` 或 `<a>` 有可读 `aria-label`；下拉/菜单有 `aria-expanded`；焦点态可见（1px 冰蓝 outline）。
- `prefers-reduced-motion` 生效。

---

## 8. 工程与自检（必须全部通过再交付）

- `npm install` → `npm run dev` 可用；
- `npx tsc --noEmit` 零错误；`npm run build` 成功；
- 路由逐个手测（首页 / 6 领域 / 5 负责人 / 6 项目 / 合作 / 404），**不允许出现死链、空白页、无功能按钮**；
- 轮播：自动播放、hover 暂停、左右、拖动、点击跳转五项全过；
- 首屏在 1440×810 下完整可见；
- Lighthouse 桌面 Performance ≥ 85（可选，尽量）；
- 控制台无报错。

---

## 9. 交付物

1. 完整可运行的 `app/` 源码（含 `README.md`：架构、路由、数据位置、常用命令）。
2. `Dockerfile`（多阶段：node 构建 → `nginx:alpine`）、`nginx.conf`（`listen 8080;`、SPA fallback、gzip、静态缓存头）、`docker-compose.yml`（端口 `8080:8080`、`restart: unless-stopped`、healthcheck `wget -qO- http://127.0.0.1:8080/ || exit 1`）、`deploy.sh`（build + up -d，失败回滚上一 tag）、`.env.example`、`.env`（600）。
3. 所有图片/字体用本地资源，不依赖外部 CDN（内网可访问）。

> 部署由后续步骤负责（VM101 `192.168.10.60`，`/opt/delta-research-center/`）。Codex 只需保证镜像可构建、容器监听 8080、健康检查通过。

---

## 10. 禁止事项

- 不要改 `I:\PVE\AGENTS-网络与端口约定.md` 以外的网络/端口配置；不要用 80/443/3000/7000/7500/5432/6379 等已占端口。
- 不要引入 UI 组件库（Ant Design / MUI / shadcn 等）；不要引入图标库（图标用内联 SVG）。
- 不要用外部图片、图库 URL、Google Fonts。
- 不要做真实后端、登录、数据库、表单提交（合作页只做 mailto + 复制）。
- 不要留 `TODO`、注释掉的死代码、未使用的依赖。
