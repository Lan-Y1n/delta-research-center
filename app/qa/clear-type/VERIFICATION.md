# 清澈按钮与多字体实际验收 · 2026-11-11

## 命令

- `npx tsc --noEmit`：退出0，零错误。
- `npm run build`：退出0；488 modules transformed；built in2.86s。CSS69.37kB/gzip14.27kB；JS455.10kB/gzip146.11kB。
- 开发服务：127.0.0.1:18180，Vite6.4.6。验收结束后停止临时服务；再查看请在app目录执行`npm run dev`。

## 实际浏览器结果

`final-report.json`：**27 PASS / 0 FAIL**。本机Chrome，独立Playwright，无浏览器下载、无新增应用依赖。

- 三版各1440×810和390×844首屏；文字、按钮与9:16比例正常，无横向溢出。
- 主次CTA、顶部联络、复制、圆形控制及方案切换按钮：普通/悬停染色实测约.02/.03，选中标签.035；没有不透明白色填充或不透明背景渐变；背景模糊.8px。
- SVG边缘折射存在，正文及文字祖先没有内容滤镜。
- 透明按钮在条纹背景上的内部亮度细节保留率约**95.48%**。这是局部测试图中避开文字及周边的亮度标准差比，不是物理光学透射率。
- 移动导航、复制/toast、透明度降级与明确玻璃模式覆盖均通过。
- 外部运行时资源请求0、失败请求0、控制台及运行时错误0。

初次报告有3个字体测试选择器歧义：统计dd匹配4个元素。只修正测试定位并复验全部6项字体/档案检查，未改产品源码。`initial-report.json`、`font-report.json`与合并后的`final-report.json`均保留。

## 真实字体证据

通过DevTools `CSS.getPlatformFontsForNode`读取浏览器实际使用的字体，避免只凭CSS字体列表判断。

| 方案 | 实际渲染字体 |
| --- | --- |
| 01 | STSong品牌、微软雅黑正文、Consolas标注、Bahnschrift数字、STKaiti与Georgia引言 |
| 02 | STSong品牌、DengXian正文、Bahnschrift英文、Consolas编号、Georgia数字 |
| 03 | DengXian品牌、微软雅黑正文、Bahnschrift英文、Consolas编号、Georgia数字、STKaiti引言 |

`font-report.json`：6 PASS / 0 FAIL。字体按各终端可用系统字体回退，本次没有下载字体或复制系统字库。

## 截图与保护

六个`glass-N-home-*`截图为最终应用；另有菜单、关于区排印、合作页按钮和条纹透射对照。原稿保存在`design/liquid-glass/clear-type/`，与应用截图分开。

受保护demo/archive的38个文件SHA256复算无变化；没有修改内容数据、系统网络或现有容器。本次只新增两个样式文件并接入导入，未改业务路由。

## 复验

```powershell
$env:PLAYWRIGHT_MODULE='I:\PVE\.delta-qa-runtime\node_modules\playwright\index.mjs'
$env:QA_BASE_URL='http://127.0.0.1:18180'
node qa/clear-type-check.mjs
```
