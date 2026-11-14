# 实际验收记录 · 2026-11-11

工作目录：`I:\PVE\sites\delta-research-center\app`。本机 Windows，浏览器为本机 Chrome；Playwright 独立安装在 `I:\PVE\.delta-qa-runtime`，不加入应用依赖。

验收结束后已停止本次创建的临时 Vite 服务；再次预览请执行 `npm run dev`。

| 命令 | 实际结果 |
| --- | --- |
| `npm install` | 退出 0，added 142 packages in 2m |
| `npx tsc --noEmit` | 退出 0，无输出、零错误；strict/noUnusedLocals/noUnusedParameters 启用 |
| `npm run build` | 退出 0；Vite 6.4.6，480 modules transformed，built in 1.65s |
| `npm run dev` | Vite ready，`http://127.0.0.1:18180/`，仅本机回环监听 |

最后构建：HTML 0.91 kB；CSS 34.78 kB（gzip 8.60 kB）；JS 448.71 kB（gzip 143.98 kB）。

## 页面与浏览器

`report.json`：62 PASS / 0 FAIL。主页、六领域、五负责人、六项目、合作和不存在路径共 20 条路径，在 1440×810 和 390×844 各实际打开一次（40 次访问）；H1、页脚声明、页面宽度检查均通过。四个包含原型属性名的无效路径也正确进入 404。实际链接均指向已实现路由。

| 必验项目 | 结论 |
| --- | --- |
| 自动播放 | 真实等待 5.6s 后从第 1 人切到第 2 人，通过 |
| 悬停暂停 | 等待后索引不变，通过；焦点暂停也通过 |
| 左右按钮 | 前后切换、索引同步，通过；键盘左右也通过 |
| 鼠标拖动 | 切换并抑制误跳转，通过；速度衔接与最终位置复验通过 |
| 点击照片 | 跳转当前负责人的领域页，通过 |
| 触屏滑动 | 移动环境发送真实触控事件，通过 |
| 手动暂停 | 暂停/继续状态可切换，通过 |
| 桌面菜单 | hover、点击切换、Esc、点击外部关闭均通过 |
| 移动菜单 | 390×844 全屏、六领域、焦点约束、Esc、选择后关闭均通过 |
| 合作页 | 三项复制实际读取剪贴板核对，toast 反馈通过；社交入口均为平台首页 |
| 首屏 | 1440×810 和 1280×800 的标题、按钮、统计、完整轮播全部在视口内 |
| 减少动态效果 | 对 11 个真实动效区块检查，无入场位移，通过 |
| 控制台 / 网络 | 浏览器运行时及控制台错误 0，失败请求 0 |

`interactions-report.json`：对最后交互版本复验 17 PASS / 0 FAIL。

`progress-report.json`：14 PASS / 0 FAIL。截图检查发现中列进度未展开，已将观察目标移至稳定父元素；六项目在桌面和移动端实际宽度分别达到 12/64/38/100/21/47%，误差小于 0.006 个百分点。拖动松手位置实际 -318.375px 与目标 -318.375px 一致。

## 视觉检查与保护检查

已打开并检查 `screenshots/` 中的双尺寸首页、稳定移动菜单、项目区、物理领域、武装力量领域、遮蔽负责人档案和合作页截图。纯黑、冰蓝、两行标题、圆角和底板比例按 BRIEF/方案 D 核对。

`input-hashes-before.json` 保存 demo 与 archive 中 38 个受保护文件的 SHA256；完成后逐个复算，改变文件数为 0。没有修改系统网络或现有容器。

## 部署文件与未验证项

Dockerfile 多阶段 Node22→nginx:alpine，nginx 8080、SPA fallback、gzip、静态缓存，Compose 8080:8080、unless-stopped 及指定 wget 健康检查已核对。

`deploy.sh` Bash 语法检查通过；用模拟 Docker 验证成功、构建失败保留当前版本、启动失败恢复上一 tag、首次失败停止新容器、停止失败准确报告等分支。模拟不等于容器实测。

本机没有 Docker/nginx/其他容器运行时，因此未执行真实镜像构建、nginx 运行或容器 wget 健康检查；未连接 VM101 部署。Lighthouse 为可选项，本次未运行。Windows NTFS 无 POSIX 600 模式位，`.env` 不含密钥，部署脚本在 Linux 上执行 `chmod 600 .env`。

## 复验

先运行 `npm run dev`，另一个终端执行：

```powershell
$env:PLAYWRIGHT_MODULE='I:\PVE\.delta-qa-runtime\node_modules\playwright\index.mjs'
$env:QA_BASE_URL='http://127.0.0.1:18180'
node qa/browser-check.mjs
node qa/progress-check.mjs
```

其他电脑可将 `PLAYWRIGHT_MODULE` 和 `QA_BROWSER` 改为该机已安装的 Playwright 模块及 Chrome 路径。应用运行本身不需要 Playwright。
