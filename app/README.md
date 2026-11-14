# 德尔塔研究中心

迁移 `../demo/core.js` 数据的本地静态展示站点。初版依据 `../BRIEF-CODEX.md` 复刻方案 D；本轮按用户提供的原始提示词、Apple iPhone 18 Pro 页面及 Liquid Glass 实现参考，由 Google Stitch 生成并迭代三版液态玻璃视觉。所有人物、项目、设施和联系方式均为示例占位内容。

底部预览条可切换 `01` 清澈镜片、`02` 冰蓝晶体、`03` 极夜镜面和原版 `D`，支持收起。材质按钮可切换“跟随系统 / 始终玻璃 / 实心面板”，浏览器会记住选择。直接预览示例：`http://127.0.0.1:18180/?design=glass-1&material=glass`。切换不会重建页面或重置轮播。

三版设计原稿与参考见 `design/liquid-glass/README.md`；本轮验收见 `qa/liquid-glass/VERIFICATION.md`。

后续已按用户要求改为清澈按钮：主次操作均去掉实心白底，普通/悬停仅约2%/3%染色，模糊0.8px，保留周边SVG折射。字体采用Stitch确认的角色分工：宋体品牌/章节、无衬线正文、楷体引言、Consolas编号、DIN/Bahnschrift与Georgia指标数字；03保留几何品牌字形。只引用系统字体，不下载或分发字体文件。最新验收见 `qa/clear-type/VERIFICATION.md`。

## 开发与构建

需要 Node.js 22 和 npm。所有命令在 `app/` 运行：

```sh
npm install
npm run dev -- --host 127.0.0.1 --port 18180 --strictPort
npx tsc --noEmit
npm run build
npm run preview -- --host 127.0.0.1 --port 18181 --strictPort
```

开发预览为 `http://127.0.0.1:18180/`。生产构建输出在 `dist/`；部署必须设置 SPA fallback，不能只为根路径提供 HTML。

## 架构

- Vite + React + TypeScript strict + Tailwind CSS + Motion + React Router。
- `src/main.tsx`、`src/App.tsx`、`src/router.tsx`：应用入口、公共布局和路由。
- `src/data/`：唯一内容来源；负责人、院所、项目通过 slug/code 关联。
- `src/components/layout/`：导航、领域下拉、移动端菜单、页脚和页面过渡。
- `src/components/ui/`：按钮、状态、进度、档案底板和入场效果。
- `src/components/home/`、`institute/`、`leader/`：对应页面的可复用组成部分。
- `src/pages/`：首页、领域、负责人、项目、合作、404。
- `src/styles/tokens.css`：方案 D 的颜色、字级、圆角及缓动变量。
- `src/components/design/`：方案与材质偏好、本地 SVG 折射位移图、可收起的切换条。
- `src/styles/liquid-glass.css`、`glass-variants.css`：按 Stitch 修订稿实现的三版几何、字体层级与光学配色。
- `src/styles/glass-material.css`：背景模糊、5px 边缘折射、高光、阴影及降级；不对正文设置滤镜。
- `src/styles/typography.css`：按角色和方案切换的衬线、无衬线、等宽及数字字体栈。
- `src/styles/clear-buttons.css`：清澈操作按钮与其悬停、按压、降低透明度状态。

档案底板由本地代码生成，不请求外部图片或字体。负责人数据预留 `image?: string`，以后可以在 `public/people/` 放本地图片并设置相应路径。

## 路由表

| 路径 | 内容 |
| --- | --- |
| `/` | 首页、负责人轮播、六个示例项目、关于德尔塔 |
| `/field/physics` | 物理研究院 |
| `/field/biology` | 生物研究院 |
| `/field/chemistry` | 化学研究院；负责人姓名原样显示“数据删除” |
| `/field/mathematics` | 数学研究院；负责人姓名原样显示“数据删除” |
| `/field/philosophy` | 哲学研究院 |
| `/field/armed-forces` | 独立武装力量分区；不绑定负责人 |
| `/leader/lanyin`、`/leader/huishi`、`/leader/redact-chem`、`/leader/redact-math`、`/leader/zhiyan` | 五个负责人详情 |
| `/project/DRC-PHY-2401`、`/project/DRC-BIO-2402`、`/project/DRC-CHM-2403`、`/project/DRC-MTH-2404`、`/project/DRC-PHL-2405`、`/project/DRC-AFR-2406` | 六个项目详情 |
| `/cooperation` | mailto、联系方式复制与 toast、平台首页链接 |
| 其他路径及不存在的 slug/code | 404 |

## 数据位置

| 文件 | 内容 |
| --- | --- |
| `src/data/leaders.ts` | 五位负责人、档案底板参数、关联院所 |
| `src/data/institutes.ts` | 六个领域、介绍、方向、设施及武装力量分区 |
| `src/data/projects.ts` | 六个项目与四种状态 |
| `src/data/contact.ts` | 占位邮箱、电话、地址、四个平台首页 |
| `src/data/site.ts` | 站点固定文案与占位区块 |

修改资料时保留占位徽标；尚未提供的经历、资历、成果、联系人或账号不能补写为真实信息。

## 容器交付

这些文件供后续在授权的部署主机运行。本机实现阶段不启动或修改现有容器，也不修改系统网络。

```sh
cp .env.example .env
chmod 600 .env
bash deploy.sh
```

`deploy.sh` 需要 Docker Engine 和 Docker Compose v2（支持 `up --wait`）。脚本构建唯一 UTC 时间 tag，执行 `up -d` 并等待健康检查；启动或健康检查失败时恢复上一 tag。构建失败保留原容器。首次部署没有历史 tag 时停止失败的新容器；镜像不自动清理。`.deploy.lock` 防止同时部署；进程被强行终止后，确认无部署进程再移除该空锁目录。

`.env` 仅含 `IMAGE_NAME` 和 `TAG`，没有密钥。脚本在 Linux 上设置权限 `600`；Windows NTFS 不使用 POSIX 模式位，迁移到 Linux 后执行 `chmod 600 .env`。不要把 `.env` 提交到公共仓库。

手动构建、启动和检查：

```sh
docker compose build
docker compose up -d --wait --wait-timeout 120
docker compose ps
docker compose exec web wget -qO- http://127.0.0.1:8080/
docker compose logs --tail 100 web
```

Dockerfile 使用 `node:22-alpine` 构建、`nginx:alpine` 提供静态文件。nginx 监听容器内 IPv4/IPv6 的 `8080`，Compose 映射 `8080:8080`，重启策略为 `unless-stopped`。健康检查命令为 `wget -qO- http://127.0.0.1:8080/ || exit 1`。`/assets/` 的构建哈希文件缓存一年，HTML 不缓存；未知前端路由回退至 `index.html`；gzip 开启。

该端口映射会绑定部署主机的所有默认接口。上线时由部署人员按已有网络约定确认防火墙和入口；本交付不改变主机网络或现有服务。

## 验证边界

实际命令、浏览器检查、截图及未执行项见 `qa/VERIFICATION.md`。可复验脚本位于 `qa/`，通过 `PLAYWRIGHT_MODULE` 指向独立安装的 Playwright，不增加应用依赖。`qa/report.json`、`qa/interactions-report.json`、`qa/progress-report.json` 为真实浏览器运行结果。

Google Stitch 项目与原始设计留档见 `design/README.md`。施工约束仍以 BRIEF 为准，运行时不加载设计原稿、外部图片或外部字体。

Docker/nginx 运行验收必须在具备 Docker 的环境执行；源码检查不等同容器实际构建或健康检查。脚本及配置作为交付文件，不表示已经在 VM101 部署。
