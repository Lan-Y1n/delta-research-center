# Google Stitch 设计留档

- 项目：[德尔塔研究中心 · KEYNOTE D 正式站](https://stitch.withgoogle.com/projects/6664094569121667532)
- 设计系统：`assets/763a558de6d64e40a98d2364a1d2354f`，名称 Keynote Nocturne。
- 原始首页设计图：`stitch-preview.png`，认证下载自该项目的 `thumbnailScreenshot`，原生尺寸 2560 × 5484。
- 设计系统：`stitch-design-system.json` 和 `stitch-design-systems.json`。

向 Stitch 提供了完整 BRIEF、方案 D CSS、原型数据与首页文案；设计由 Stitch 生成。生成调用出现连接断开，后台保留了完整首页图与设计系统，随后通过官方 MCP API 的 `get_project` / `download_file` 取回。`list_screens` 返回空，因此没有声称取得或直接使用 Stitch 导出的页面 HTML。

应用采用 BRIEF、方案 D 和该设计输出核对后实现为 React 组件。原稿中自动生成的字体、局部装饰及新增文案与施工约束存在差异；正式页面按 BRIEF 使用系统字体、仅档案底板细网格和 core.js 原文。原稿仅供追溯设计过程，不是新增施工依据，也不在应用中加载。

工程判断：桌面以视口高度限制肖像宽度来保持真实 9:16 和完整首屏；采用 BrowserRouter 配 nginx SPA fallback；复制使用 Clipboard API 并保留兼容回退；减少动态效果时保留透明度反馈、取消入场位移。

API 密钥仅在本次工具会话中使用，没有写入项目文件。
