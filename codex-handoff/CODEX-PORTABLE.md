# 德尔塔研究中心 · 单文件交接稿（可脱离原型使用）

> 用途：**换电脑 / 拿不到 `demo/` 原型文件时**，把这一份整篇交给 Codex 即可从零构建。
> 如果 Codex 能拿到 `codex-handoff/demo/` 目录（六套原型 a–f.html），优先让它先看 `demo/d.html` 再读本文件——那是最准的视觉基线。
> 目标：React + TypeScript + Tailwind 的**多页面可交互**站点 + `docker compose` 部署到 Debian 虚拟机（8080）。

---

## 0. 一句话

做一个**虚构科研机构「德尔塔研究中心（DELTA RESEARCH CENTER / DRC）」的官方网站**。视觉基线：**纯黑舞台 + 超大无衬线字号 + 大圆角 20–32px + 玻璃面板 + 柔和冰蓝辉光**（Apple 官网式的简约大气），信息架构是严谨的科研机构（六个研究院所 + 五位负责人 + 在研项目）。**必须真交互，不许只做静态视觉稿。**

---

## 1. 硬性内容（一个字都不要改）

**站点名**：中文「德尔塔研究中心」，英文「DELTA RESEARCH CENTER」，简称 DRC。
**标语**：在可测量的边界之外，重新定义问题。
**性质**：虚构机构，页脚必须标注「虚构机构 · 演示站点 / 人物、项目、设施与联系方式均为示例占位」。

### 1.1 五位负责人（顺序即首页轮播顺序）

| # | slug | 姓名 | nameEn | 职务 | 所属 |
|---|---|---|---|---|---|
| 01 | lanyin | 澜因 | LANYIN | 物理研究院负责人 | physics |
| 02 | huishi | 慧矢 | HUISHI | 生物研究院负责人 | biology |
| 03 | redacted-chemistry | **数据删除** | DATA EXPUNGED | 化学研究院负责人 | chemistry |
| 04 | redacted-mathematics | **数据删除** | DATA EXPUNGED | 数学研究院负责人 | mathematics |
| 05 | zhiyan | 质湮 | ZHIYAN | 哲学研究院负责人 | philosophy |

- 化学、数学两位**姓名必须原样显示「数据删除」**，不得替换、不得编造姓名；详情页显示“人事档案已封存 / 该职位信息未公开”的脱敏说明。
- 五位的个人简介、专业领域、研究方向、学术经历、研究成果**均未提供** → 全部用**显式占位块**（虚线框 + 「占位 · 待补充」），**严禁编造**。
- 武装力量**不设负责人**，也**不进轮播**。

### 1.2 六个领域（各一独立页面）

| # | slug | 中文 | 英文 | 编码 | 类型 | 负责人 |
|---|---|---|---|---|---|---|
| 01 | physics | 物理研究院 | Institute of Physics | DRC-PHY | institute | 澜因 |
| 02 | biology | 生物研究院 | Institute of Biology | DRC-BIO | institute | 慧矢 |
| 03 | chemistry | 化学研究院 | Institute of Chemistry | DRC-CHM | institute | 数据删除 |
| 04 | mathematics | 数学研究院 | Institute of Mathematics | DRC-MTH | institute | 数据删除 |
| 05 | philosophy | 哲学研究院 | Institute of Philosophy | DRC-PHL | institute | 质湮 |
| 06 | armed-forces | 武装力量 | Armed Forces | DRC-AFR | **force**（独立分区，无负责人） | — |

关键词标签示例：物理「物质 · 能量 · 测量」、生物「生命 · 信息 · 演化」、化学「反应 · 结构 · 材料」、数学「结构 · 证明 · 计算」、哲学「意识 · 语言 · 边界」。

### 1.3 六条示例科研项目（明确标注 SAMPLE DATA）

| 编号 | 名称 | 院所 | 进度 | 状态 |
|---|---|---|---|---|
| DRC-PHY-2401 | 亚稳态量子相干阵列 | physics | 12% | 筹备中 planning |
| DRC-BIO-2402 | 自组织细胞图谱 | biology | 64% | 进行中 active |
| DRC-CHM-2403 | 低温催化路径筛选 | chemistry | 38% | 进行中 active |
| DRC-MTH-2404 | 高维拓扑不变量计算框架 | mathematics | 100% | 已完成 completed |
| DRC-PHL-2405 | 意识边界的形式化描述 | philosophy | 21% | 暂停 hold |
| DRC-AFR-2406 | 分布式感知节点组网 | armed-forces | 47% | 进行中 active |

每条项目的简介也写成占位（例：「示例占位：围绕计量子单元的相干保持与读取展开，用于确认项目卡片的信息密度与版式。」）。

### 1.4 联系方式（全部占位）

- 邮箱 `your-name@lany1n.icu`（`mailto:`）· 电话 `+86 000 0000 0000` · 地点「中国 · 某某地 · 德尔塔研究中心园区（占位）」
- 社媒 4 个占位：GitHub / X / Telegram / Bilibili，handle 均为 `your-handle`，链接指向平台首页即可
- 页面必须写明「以上均为占位信息，上线前请替换」

---

## 2. 路由与跳转矩阵

| 路由 | 页面 |
|---|---|
| `/` | 首页（首屏 + 在研项目 + 机构介绍） |
| `/field/:slug` | 六个领域页 |
| `/leader/:slug` | 五个负责人详情页 |
| `/project/:code` | 项目详情页 |
| `/cooperation` | 合作页 |
| `*` | 404（保留导航，不白屏） |

必须全部正确的跳转：
1. 首页轮播**点击当前这张照片** → 该负责人所属研究院页
2. 领域页「查看负责人详情（VIEW PROFILE）」按钮 → 该负责人详情页
3. 导航「领域」下拉 6 项 → 对应领域页
4. 「主页」→ 首页；「合作」→ 合作页
5. 项目卡 → 项目详情页
6. 详情页面包屑可逐级返回

---

## 3. 首页（纵向滚动，桌面 16:9 构图基准）

### 3.1 首屏

左栏（自上而下）：eyebrow 小字（`RESEARCH INSTITUTE · EST. 20XX`）→ 中文主标题「德尔塔研究中心」（极大字号、`letter-spacing:-.04em`、`line-height:.96`、白色→冰蓝渐变裁切）→ 英文 `DELTA RESEARCH CENTER`（`letter-spacing:.4em`）→ 标语「在可测量的边界之外，重新定义问题。」→ 一段机构简介（占位）→ 两个按钮「探索研究领域 →」「合作联络 ↗」→ 四联数据（05 研究领域 / 06 研究院所 / 06 在研项目 / 01 交叉平台）。

右栏：**负责人照片轮播（9:16 竖向），同一时间只显示一张。**

轮播必须满足：
- 5 张，横向滑动切换，**同一时刻只显示一张**（父容器轨道宽度 = 5 × 100%，每张 = 视口 100%；不要用百分比宽度叠在 100% 轨道上——那是常见 bug）
- 自动轮播约 5.5s；**鼠标悬停暂停**；有暂停/播放按钮
- 左右按钮、键盘 ← →、鼠标按住拖动、移动端触控滑动
- 切换是平滑过渡（transform + 缓动，不要瞬时跳变）
- 拖拽结束不能误触发「点击照片跳转」（用 `suppressClick` 标志，拖动后 300ms 内拦截 click）
- 图上/图下同步显示：`01 / 05`、姓名、职务、院所英文名
- 未提供真实照片 → 用 CSS/SVG「档案底板」：首字水印（澜/慧/质…，脱敏用「?」）+ 该负责人的 hue 色调 + 细网格 + 扫描线；同时保留 `<img src="/img/leaders/{slug}.jpg" onError=降级>` 位置，以后替换图片即生效

### 3.2 第二屏：在研项目

英文小标 `CURRENT RESEARCH PROJECTS` + 中文大标题「目前研究项目」+ 右上角明确标注 **示例占位数据 SAMPLE DATA**。
3 列卡片（移动 1 列）：项目编号、状态徽章（筹备中/进行中/已完成/暂停）、项目名、所属院所、简介、进度百分比数字、可视化进度条（进入视口时填充动画）、「项目详情 ↗」。悬停轻微高光/抬升，点击进详情。

### 3.3 第三屏及以后：机构介绍

机构简介、设施功能（低温测量平台 / 光学与光谱实验区 / 计算与数据节点 等）、科研定位、组织概况。全部占位文本，每块标「占位」。结尾 CTA 指向合作页。

---

## 4. 领域页统一结构

1. 页头：面包屑 + eyebrow（`INSTITUTE OF PHYSICS · DRC-PHY`）+ 中文名 + 英文名 + 关键词标签 + 右上 `01 / 06`
2. 研究院简介（2 段占位）
3. 主要研究方向（3 条，标题 + 占位说明）
4. 研究设施与实验条件（3 张卡）
5. 研究项目（引用该院所的 PROJECTS）
6. 侧栏：负责人卡（9:16 视觉 + 姓名 + 职务 + **「查看负责人详情 VIEW PROFILE」按钮**）、院情信息（编号/编码/负责人/在研项目数）

**武装力量页**（`/field/armed-forces`）特殊：独立组织介绍布局，无负责人卡，编号 `06 / 06`，包含：简介、组织架构、下属单位与部门（6 项）、装备与技术体系（4 项）、任务定位与职能（4 项）、相关人员（占位）。

---

## 5. 负责人详情页

左：9:16 人物视觉（sticky）+ 编号 + 返回本院所链接。
右：姓名（超大）、英文名、职务与所属院所标签、个人简介、专业领域、研究方向、学术经历、研究成果、代表性科研项目。
未提供的内容用可编辑占位块（虚线框 + 「占位 · 待补充」）。`redacted` 两位显示脱敏说明。
数据来自同一份 `leaders.ts`，首页 / 领域页 / 详情页必须一致。

---

## 6. 合作页

大邮箱卡（`mailto:`）+ 说明 → 可复制的联系信息行（邮箱/电话/地点，点击复制并 toast 提示）→ 4 个社媒条目（名称 + 占位 handle + 外链，`target="_blank" rel="noopener noreferrer"`）→ 其他合作渠道占位块 → 占位声明。

---

## 7. 视觉规范

**色板（写成 CSS 变量 / Tailwind theme）**

| 用途 | 值 |
|---|---|
| 页面背景 | `#07111F`（纯黑方案可用 `#000` 作舞台底） |
| 次级背景 | `#0B192B` |
| 面板 | `#13263B` |
| 主强调 | `#65C9F4` |
| 次强调 | `#91E5F2` |
| 辅助文字 | `#9BB4CA` |
| 主文字 | `#EAF4FC` |
| 边框 | `rgba(101,201,244,.14)` ～ `rgba(145,229,242,.32)` |

**风格**
- 未来主义 + 现代科研机构；冷色系；克制、专业
- 字体：`-apple-system, "SF Pro Display", "Helvetica Neue", Inter, "PingFang SC", "Microsoft YaHei", sans-serif`（Apple 方案统一无衬线，不要混衬线/等宽）
- 液态玻璃 + 高斯模糊：导航 `backdrop-filter: blur(20px)`、玻璃卡片、背景光斑、装饰层 `filter: blur()`；**模糊只作用于背景/装饰层，绝不模糊文字、照片和主要信息**
- `@supports not (backdrop-filter: blur(1px))` 时降级为半透明纯色
- 大圆角：卡片 20–32px，轮播框 24–34px；柔和外辉光（不要廉价塑料感、不要过度发光）
- 纯黑/深空底色 + 局部冰蓝光源

**动效（克制）**
- 路由切换淡入 200–300ms；轮播滑动；卡片悬停高光/抬升 4–8px；进度条进入视口填充；下拉菜单展开收起；滚动 reveal 淡入；按钮按压反馈
- 禁止：闪烁、满屏粒子、影响可读性的背景特效、强制滚动
- 必须支持 `prefers-reduced-motion: reduce`（关闭大位移与自动轮播）

**响应式**
- ≥1280 / 1024–1280 / 768–1024 / <768 四档
- 桌面首屏在 1280×800 内**完整可见不裁切**
- 移动端：左右分栏改上下堆叠、文字不溢出、图片不变形、轮播可触控、汉堡菜单可用、玻璃效果不掉帧

---

## 8. 技术栈与工程结构

Vite + React 19 + TypeScript(strict) + Tailwind CSS + `motion` + `react-router-dom`；不引 UI 组件库；图标内联 SVG。

```
app/
├─ index.html  package.json  vite.config.ts  tsconfig.json
├─ Dockerfile  nginx.conf  .env.example
├─ src/
│  ├─ main.tsx  App.tsx
│  ├─ styles/tokens.css  index.css
│  ├─ data/{types,site,leaders,institutes,projects,contact}.ts
│  ├─ components/{Layout,Header,NavMenu,MobileMenu,Footer,Reveal,GlassCard,
│  │              StatusBadge,ProgressBar,LeaderPlate,LeaderCarousel,
│  │              ProjectCard,PageHeader,Toast}.tsx
│  ├─ views/{Home,Field,Leader,Project,Cooperation,NotFound}.tsx
│  └─ hooks/{useCarousel,useCopy,useReducedMotion}.ts
└─ public/img/leaders/{lanyin,huishi,redacted-chemistry,redacted-mathematics,zhiyan}.jpg
```

数据模型（三表用 slug 交叉引用，禁止组件里硬编码文案）：

```ts
Leader   { slug, no, name, nameEn, glyph, role, roleEn, instituteSlug, hue, redacted?, portrait?, bio?, fields?, directions?, career?, achievements?, projects? }
Institute{ slug, no, name, nameEn, code, tagline, kind:'institute'|'force', leaderSlug:string|null,
           intro:string[], directions:{title,desc}[], facilities:{name,desc}[],
           units?, equipment?, duties? }
Project  { code, name, instituteSlug, desc, progress:number, status:'planning'|'active'|'completed'|'hold',
           statusLabel:{cn,en} }
Contact  { email, phone, location, socials:{name,handle,url}[] }
```

质量红线：不允许没有功能的按钮、不允许死链、不允许 `any` 满天飞、`npm run build` 必须 0 error。

---

## 9. 部署（如果可以连到 VM101）

**目标机已确认**：Debian 13 trixie，`192.168.10.60/24`，网关/DNS `192.168.10.1`；实际 IPv6 为 `2408:8220:6b4b:e811::60`（注意是 **e811**，以 `ip -6 addr show ens18` 为准）；SSH `lany1n@192.168.10.60`（docker + sudo 组，**密码由用户提供，不写进任何文件、不回显、不进日志**）。
Docker 29.9.3 / Compose v5.7.0，已配镜像加速器。**8080/TCP 空闲且已预留给本站**（公网入口是另一台雷池 WAF 反代，本站只监听内网 8080）。
**绝对不要动**已在运行的容器：`1Panel-openresty`(80/443)、`new-api`(3000)、`1Panel-mysql`、`new-api-postgres`、`new-api-redis`、`1Panel-frps`；不要改系统级 nginx/openresty、不改网络/DNS/路由、不重启虚拟机、不动 OpenWrt(192.168.1.2)/PVE(192.168.1.100)。

`/opt/delta-research-center/` 交付：
- `docker-compose.yml`：`"8080:8080"`、`restart: unless-stopped`、healthcheck、`TZ=Asia/Shanghai`、日志 `json-file max-size=10m max-file=3`
- `Dockerfile`（多阶段：node:22-alpine 构建 → nginx:1.27-alpine 运行，监听 8080）+ `nginx.conf`（`try_files $uri $uri/ /index.html`、gzip、`server_tokens off`）
- `.env`（600）/ `.env.example`（占位）
- `deploy.sh`（build/pull → up -d → 健康检查；失败自动回滚到上一个镜像 tag）
- `README.md`（架构/端口/数据位置/备份恢复/回滚/常用命令）
- `data/`（bind mount，容器重建不丢）、`logs/`

**如果连不到虚拟机**：做完镜像构建为止，产出 `DEPLOY-RUNBOOK.md`（含上面所有命令、期望输出、回滚步骤），等能连上再执行。

---

## 10. 验证清单（逐条打勾，贴真实输出）

功能：16:9 首屏 ✓｜9:16 照片且同时只显示一张 ✓｜5 人横向轮播 ✓｜点照片进对应院所（5 条）✓｜第二屏项目 + 百分比进度条 ✓｜6 个领域入口 + 6 个独立页 ✓｜领域页有负责人详情按钮并正确跳转 ✓｜5 个负责人详情独立存在 ✓｜化学/数学显示「数据删除」✓｜合作页可复制/可 mailto/外链可开 ✓｜玻璃 + 模糊含降级 ✓｜无空按钮无死链无白屏 ✓｜桌面与移动均可用 ✓

部署（连得上时）：`docker compose ps` 全 healthy｜`curl -I http://127.0.0.1:8080/` 200｜`curl -I http://192.168.10.60:8080/` 200｜`curl -6 -I http://[2408:8220:6b4b:e811::60]:8080/` 200｜`docker compose restart` 后 `data/` 仍在｜`curl -4 https://www.baidu.com` 正常（IPv6 出网是这台机器的既有故障，如实报告即可）。
