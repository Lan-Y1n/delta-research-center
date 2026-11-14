# 给 Codex 的提示词（直接整段复制粘贴）

> 使用前把变量替换好：`__WORKDIR__` 建议为 `I:\PVE\sites\delta-research-center`（Windows 路径）。
> 若 Codex 在 WSL / 另一台机器上跑，改成对应挂载路径即可；BRIEF 与 demo 都在同一个目录树里。

---

```
你是资深前端工程师 + 视觉设计工程师。请在 __WORKDIR__ 下，按施工说明把这个网站从零实现出来。

【第一步 · 必读，不要跳过】
1. 完整读取 __WORKDIR__\BRIEF-CODEX.md —— 这是唯一施工依据，包含技术栈、目录结构、完整设计 token、每个页面的硬性验收点、数据清单、占位规则、工程自检清单和禁止事项。
2. 打开 __WORKDIR__\demo\core.js 读数据层（LEADERS / INSTITUTES / PROJECTS / CONTACT），文案与数据以它为准，直接迁移成 TypeScript，不要改写、不要新增虚构内容。
3. 参考已完成的视觉原型（同一份数据、只换 CSS）：
   - __WORKDIR__\demo\d.html  ← 本次基线（Apple 风纯黑发布会）
   - __WORKDIR__\demo\theme-d.css  ← 设计 token 与组件样式，逐条对照实现
   - 截图：__WORKDIR__\demo\preview\scheme-D-home.png、scheme-D-field.png、scheme-E-projects.png
   如果能起本地服务，可用 `python -m http.server 18080`（在该目录）在浏览器里对照，但不要修改 demo 目录里的任何文件。

【第二步 · 实现】
- 技术栈固定：Vite + React + TypeScript(strict) + Tailwind CSS + Framer Motion(motion) + React Router。
- 代码目录：__WORKDIR__\app（新建）。按 BRIEF 第 2 节的结构组织，数据放 src/data/*.ts，组件化拆分。
- 视觉严格按 BRIEF 第 3 节的设计系统：纯黑 #000 底、#F5F5F7 主文字、#65C9F4/#AFE9FF 冰蓝强调、24–30px 圆角、胶囊按钮、柔和外发光、克制动效（cubic-bezier(.32,.72,0,1)）。整体要像 Apple 官网的产品页：大量留白、超大字号、极少装饰、没有网格线/扫描线/霓虹。
- 首页第一屏 16:9：左侧品牌+标语+两个胶囊按钮+4 项统计，右侧 9:16 负责人轮播（同一时刻只显示一张，5 人，自动播放 5.6s + hover 暂停 + 左右按钮 + 拖动 + 触屏滑动 + 点击照片跳对应领域页）。
- 六个领域页、5 个负责人详情页、6 个项目详情页、合作页、404，路由与交互按 BRIEF 第 4 节逐条实现；不得有死链、空白页、无功能按钮。
- 未提供资料一律显示「（占位）」+「待补充 / 示例占位数据 · SAMPLE DATA」徽标，绝不编造人物经历、学历、成果、真实联系方式。化学和数学负责人姓名必须原样显示「数据删除」。武装力量是独立分区且不绑定负责人。
- 人物照片用代码生成的 9:16 档案底板组件（Plate）：深黑底 + 主色极淡光晕 + 细网格 + 巨大汉字水印 + 竖排姓名 + 编号 + 底部「PORTRAIT · 档案影像占位」，化学/数学用遮蔽纹理 + 「DATA EXPUNGED」。

【第三步 · 自检（必须真实执行，不要只声称）】
- `npm install` → `npx tsc --noEmit`（零错误）→ `npm run build`（成功）
- `npm run dev` 启动后，用能用的方式逐页验证：/、/field/{6 个 slug}、/leader/{5 个 slug}、/project/{6 个 code}、/cooperation、一个不存在的路径（404）
- 轮播：自动播放 / 悬停暂停 / 左右按钮 / 鼠标拖动 / 点击照片跳转，五项都在浏览器里过一遍
- 1440×810 与 390×844 各看一次首屏和移动端菜单
- 把自检结果（命令输出摘要 + 每项结论）写在最终回复里

【第四步 · 交付】
- 完整 app/ 源码 + README.md（架构、路由表、数据文件位置、命令）
- Dockerfile（多阶段 node 构建 → nginx:alpine）、nginx.conf（listen 8080、SPA fallback、gzip）、docker-compose.yml（8080:8080、restart: unless-stopped、healthcheck）、deploy.sh（build + up -d，失败回滚上一 tag）、.env.example
- 注意：nginx 必须监听 8080，容器以非 root 运行，healthcheck 用 `wget -qO- http://127.0.0.1:8080/`

【约束】
- 不要引 UI 组件库（Ant Design / MUI / shadcn 等），不要引图标库（用内联 SVG），不要引 Google Fonts 或任何外部图片/CDN。
- 不要做后端、登录、数据库、表单提交；合作页只做 mailto + 一键复制 + toast。
- 不要修改 __WORKDIR__\demo、archive、preview 目录里的文件，也不要改动系统网络/端口/现有容器。
- 不要留 TODO、注释掉的死代码、未使用依赖。所有中文文案使用 UTF-8，不动 BRIEF 里的既定文案。
- 遇到 BRIEF 未覆盖的设计细节，按「Apple 官网式极简」自行决策并在最终回复里列出你做的判断（不要反问、不要停下来等确认）。

现在开始：先读 BRIEF 与 demo 源码，再做一个 3–5 行的实施计划，然后一次性实现，最后跑自检并汇报。
```

---

## 备注

- 只想让 Codex 出**设计稿**（不写完整代码）时：把「第二步 · 实现」换成「先只做首页 + 一个领域页 + 一个负责人页的高保真静态 React 页面，其余页面留占位路由」，其余不变。
- 想换视觉方向（E 磨砂工作室 / F 深空玻璃）：把 BRIEF 第 3 节的 token 换成对应 `theme-e.css` / `theme-f.css` 里的值，并在提示词里加一句「基线改用方案 E/F」。
- 部署阶段（VM101 / 8080 / 7 项验证 / 回写端口文档）不要交给 Codex，另起一步做，避免它动到生产容器。
