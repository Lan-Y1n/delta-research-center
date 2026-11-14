# 给 Codex 的任务提示词（直接整段粘贴）

你是一名资深前端 + DevOps 工程师。请在当前机器上，从一个已有的高保真 HTML 原型出发，**重写并交付**一个可用于生产部署的 React 站点，然后把它部署到一台 Debian 虚拟机上并用真实 HTTP 请求验证。

---

## 0. 包里有什么（先读，别改原型）

```
codex-handoff/
├─ PROMPT.md          ← 本文件（任务提示词）
├─ SPEC.md            ← 唯一需求规格，所有功能/内容/验收以它为准
├─ demo/              ← 可运行的 HTML 原型（6 套视觉方案，同一套数据与路由）
│   ├─ a.html … f.html        六个入口页（哈希路由，双击即可看）
│   ├─ core.js                数据层 + 视图 + 路由 + 轮播/交互（唯一的 JS）
│   ├─ theme-a.css … theme-f.css  六套视觉（e/f/d 是 Apple 极简方向）
│   └─ preview/*.png          六版首屏截图 + 内页截图
└─ stitch/            ← Google Stitch 生成的设计参考与说明
```

**先做的事**：用浏览器打开 `demo/d.html`（Apple 风格基线）、`demo/f.html`、`demo/a.html`，把首页、点开「领域」下拉、翻 5 张负责人、进研究院页、点「查看负责人详情」、进合作页全部点一遍。**这就是要交付的交互基线**，你的 React 版本必须做到同等或更好。原型只是视觉/交互参考，**不要把它当成要保留的代码**。

> 原型是纯 `file://` 可直接打开的静态页；若要在本机预览，可在 `demo/` 目录里 `python -m http.server 18080`，然后访问 `http://127.0.0.1:18080/d.html`。

---

## 1. 第一阶段：搭建工程

在 `I:\PVE\sites\delta-research-center\` 下新建 `app/` 目录（**不要覆盖 `demo/` 与 `codex-handoff/`**），技术栈固定：

- Vite + React 19 + TypeScript（strict）
- Tailwind CSS（v4 或 v3 均可，用 CSS 变量承载主题色板）
- `motion`（Framer Motion 的现行包名）做动画
- `react-router-dom` 做路由（BrowserRouter，生产环境 nginx 做 SPA fallback）
- 不引入 UI 组件库（Ant/MUI/shadcn 都不要），组件自己写
- 图标用内联 SVG，不引图标库

建议目录：

```
app/
├─ index.html
├─ package.json
├─ vite.config.ts
├─ tsconfig.json
├─ Dockerfile
├─ nginx.conf
├─ .env.example
├─ src/
│  ├─ main.tsx  App.tsx
│  ├─ styles/tokens.css  index.css
│  ├─ data/{types.ts,site.ts,leaders.ts,institutes.ts,projects.ts,contact.ts}
│  ├─ components/  (Layout, Header, NavMenu, MobileMenu, Footer, Reveal,
│  │                GlassCard, StatusBadge, ProgressBar, LeaderPlate,
│  │                LeaderCarousel, ProjectCard, PageHeader, Toast …)
│  ├─ views/       (Home, Field, Leader, Project, Cooperation, NotFound)
│  └─ hooks/       (useCarousel, useCopy, useReducedMotion …)
└─ public/img/leaders/  （5 个 9:16 肖像位：lanyin.jpg / huishi.jpg /
                         redacted-chemistry.jpg / redacted-mathematics.jpg / zhiyan.jpg）
```

**内容全部取自 `SPEC.md` 第 3 节**：数据必须放进独立的 `src/data/*.ts`，三张表用 `slug` 交叉引用，不允许在组件里硬编码文案，不允许三处各写一份负责人信息。

---

## 2. 第二阶段：实现功能（按 SPEC 逐条）

必做要点（其余细节看 `SPEC.md`）：

1. **路由**：`/`、`/field/:slug`、`/leader/:slug`、`/project/:code`、`/cooperation`、`*` 404。所有链接可直达、可刷新、可前进后退。
2. **首页首屏**：桌面 16:9 构图，左文案右 9:16 轮播；**同一时间只显示一张**；自动轮播 + 悬停暂停 + 暂停按钮 + 左右按钮 + 键盘 + 鼠标拖动 + 移动端触控；拖拽后不误触发跳转；**点击照片进入所属研究院页**。
3. **项目区**：6 条示例数据 + 明确 SAMPLE DATA 标注 + 进度条进入视口填充 + 点击进详情。
4. **六个领域页**：统一结构；武装力量走独立组织布局、无负责人、编号 `06 / 06`。
5. **五个负责人详情**：9:16 视觉 + 信息分栏；化学/数学姓名固定「数据删除」并显示脱敏说明；未提供内容用占位块，**严禁编造**。
6. **合作页**：mailto、点击复制（带 toast）、4 个社媒外链（新窗口 + `rel="noopener noreferrer"`）、占位声明。
7. **视觉**：把 `SPEC.md` 第 8 节色板写成 CSS 变量；玻璃 + `backdrop-filter`；`@supports not` 降级；大圆角（20–32px）；柔和辉光；克制动效；`prefers-reduced-motion` 降级。
8. **响应式**：≥1280 / 1024 / 768 / <768 四档；首屏在 1280×800 内完整可见；移动端汉堡菜单、轮播可滑。
9. **可访问性**：语义化标签、`aria-*`、键盘可达、焦点可见、对比度合理。
10. **人物图**：未提供真实照片 → 用 CSS/SVG 生成“档案底板”（首字水印 + hue 色调 + 细网格），但必须保留 `<img src="/img/leaders/{slug}.jpg">` 与 `onError` 降级，替换图片即生效。

**质量红线**：不允许存在没有功能的按钮；不允许死链；不允许 `any` 满天飞；`npm run build` 必须 0 error；`npm run lint`（若配置）0 error。

---

## 3. 第三阶段：容器化

在 `app/` 里提供：

- **多阶段 `Dockerfile`**：`node:22-alpine` 构建 → `nginx:1.27-alpine` 运行；`COPY nginx.conf`；暴露 8080
- **`nginx.conf`**：监听 `8080`；`try_files $uri $uri/ /index.html`（SPA fallback）；对 `index.html` 禁用缓存、对 `assets/` 长缓存；`gzip on`；`server_tokens off`；不写 access_log 到文件（走 docker logs 即可）
- 容器 `TZ=Asia/Shanghai`

**注意**：目标虚拟机**没有 Node**，也**不要**在虚拟机上装 Node——只在 Docker 构建阶段用 Node 镜像。这台 Windows 开发机可以正常 `npm i` / `npm run build`。

---

## 4. 第四阶段：部署到 VM101（`/opt/delta-research-center/`）

目标机信息（**已确认，不要改动**）：

- Debian 13 (trixie)，IP `192.168.10.60/24`，网关/DNS `192.168.10.1`
- IPv6：实际地址是 `2408:8220:6b4b:e811::60`（注意是 `e811`，不是任务书里写的 `e812`；以 `ip -6 addr show ens18` 为准）
- 登录：`ssh lany1n@192.168.10.60`（在 docker 与 sudo 组；**密码由用户提供，不要写进任何文件、不要回显、不要写进日志**）
- Docker 29.9.3 / Compose v5.7.0，已配 3 个镜像加速器（docker.1panel.live、hub.1panel.dev、docker.1ms.run）
- 资源：28 vCPU / 6GB 内存 / 100GB 磁盘（`df -h` 实测 12G 已用、77G 可用）
- **8080/TCP 已确认空闲且已预留给本站**（WAF 上游 `http://192.168.10.60:8080`）
- 已在运行的容器，**绝对不要 stop / restart / 修改 / 改端口**：`1Panel-openresty`（占 80/443）、`new-api`（3000）、`1Panel-mysql`、`new-api-postgres`、`new-api-redis`、`1Panel-frps`
- 不要安装/修改系统级 nginx/openresty，不要重启虚拟机，不要改网络/DNS/路由，不要动 OpenWrt(192.168.1.2) 与 PVE(192.168.1.100)

目录与文件（全部放在 `/opt/delta-research-center/`）：

```
/opt/delta-research-center/
├─ docker-compose.yml     # build 或 image，端口 "8080:8080"，restart: unless-stopped，
│                         # healthcheck（curl -f http://127.0.0.1:8080/ 或 wget），
│                         # TZ=Asia/Shanghai，日志轮转 json-file max-size=10m max-file=3
├─ .env                   # 真实值，权限 600
├─ .env.example           # 占位值，不含任何真实密钥
├─ deploy.sh              # set -euo pipefail；build/pull → up -d → 健康检查；
│                         # 失败自动回滚到上一个镜像 tag（打 tag 前先把当前镜像 tag 存成 previous）
├─ README.md              # 架构、端口、数据位置、备份/恢复、常用命令、回滚方法
├─ data/                  # bind mount 的数据目录（容器重建不丢）
├─ logs/                  # 如需文件日志
└─ src/                   # 构建上下文（或直接从 app/ 同步过来）
```

**数据持久化**：`data/site.json`（可选，用于运行时覆盖文案）必须 bind mount 到容器内，容器重建后内容不变。
**健康检查**：`docker compose ps` 必须显示 `healthy`。
**备份/恢复**：README 里给出 `tar -czf backup-$(date +%F).tar.gz data/` 与恢复命令。
**回滚**：`deploy.sh` 里实现「新镜像起不来 → 自动 `docker tag previous` → `up -d` 回滚」。

---

## 5. 第五阶段：验证（必须贴真实输出，不许编造）

按顺序执行并把**原始命令 + 原始输出**贴进最终报告：

```bash
# 1. 容器状态（全部 healthy / running）
docker compose ps

# 2. 本机
curl -I http://127.0.0.1:8080/          # 期望 HTTP/1.1 200 OK

# 3. 局域网（从 Windows 开发机执行）
curl -I http://192.168.10.60:8080/      # 期望 200

# 4. IPv6（用实际地址）
curl -6 -I http://[2408:8220:6b4b:e811::60]:8080/   # 期望 200

# 5. 重启后数据仍在（先在 data/ 里放一个 timestamp 文件或改一个字段，再 restart 验证）
docker compose restart && ls -l data/ && cat data/*.json | head

# 6. 出网（IPv4 必须正常；IPv6 出网是既有故障，如失败请如实报告，不要改网络）
curl -4 -s -o /dev/null -w '%{http_code}\n' https://www.baidu.com
curl -6 -s -o /dev/null -w '%{http_code}\n' https://www.baidu.com
```

另外补充：页面级冒烟测试（首页、6 个领域页、5 个负责人页、合作页、1 个项目页、404 页，逐个 `curl -I` 应返回 200），以及 `docker logs` 里无报错。

> 提示：IPv6 出站不通是这台机器的**既有环境问题**（OpenWrt 侧），与本次部署无关；你只需确认 `curl -6 http://[2408:...e811::60]:8080/` 能通，出网失败就如实写进报告。

---

## 6. 硬约束

1. 不停止/修改既有容器，不占用 8080 之外的端口，不开 5432/6379/3306 到公网
2. 不改网络配置、不做端口映射、不配 DNS（由用户自己完成）
3. 不安装面板/数据库管理工具，不装 Node 到宿主机
4. 需要 sudo 时按用户给的方式获取，**不要猜密码、不要改 root 密码**
5. 任何有风险的变更（删文件、重建容器、改系统配置）先说明再执行
6. 密钥、密码、SSH 密码一律不写进仓库、不写进 README、不回显到日志

---

## 7. 交付物（Definition of Done）

- [ ] `app/` 工程：`npm ci && npm run build` 通过，产物可在本地预览
- [ ] 全部页面与交互按 `SPEC.md` 第 10 节功能清单逐条自查通过（报告里打勾）
- [ ] `Dockerfile` + `nginx.conf` 可构建镜像（`docker build` 成功，镜像可运行）
- [ ] `/opt/delta-research-center/` 下 6 个交付文件齐全，`.env` 权限 600
- [ ] 部署完成，7 项验证的原始输出贴在最终报告里
- [ ] README 能让别人在 5 分钟内重建/恢复/回滚
- [ ] 最终报告包含：架构图（文字描述即可）、端口、数据位置、备份命令、回滚命令、已知问题
