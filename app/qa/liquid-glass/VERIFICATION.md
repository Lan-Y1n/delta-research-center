# Liquid Glass 实际验收 · 2026-11-11

## 编译

`npx tsc --noEmit` 退出0，零错误。

`npm run build` 退出0：Vite6.4.6，486 modules transformed，built in2.35s。HTML0.91kB；CSS60.86kB/gzip12.99kB；JS455.10kB/gzip146.11kB。本轮没有增加应用依赖。

## 浏览器与功能

本机 Chrome157 + 独立 Playwright，开发服务仅监听127.0.0.1:18180。

验收结束已停止本次临时开发服务；继续比较请在app目录执行`npm run dev`。

`final-report.json`：**49 PASS / 0 FAIL**。第一轮的3项手机溢出由项目区全宽背景计算引起，已修复；保留初始报告并针对最终样式重测六个首页，最终报告明确记录复验结果。

- 三版各1440×810、390×844首屏与9:16档案比例通过；手机文档宽度均390px，无横向溢出。
- 桌面标题、按钮、统计与完整轮播均在首屏内；手机正常上下堆叠。
- 每版轮播左右、拖动、点击领域跳转；移动菜单和导航；六项目进度比例均通过。
- 切换方案不重置页面和轮播，路由导航及刷新后保留选择；可收起切换条。
- 20条路由烟雾检查、合作页复制与toast通过。
- 实际计算样式确认背景模糊和SVG折射存在，正文祖先没有内容滤镜。
- 自动材质遵守降低透明度；始终玻璃可明确覆盖；实心模式关闭背景滤镜；偏好刷新后保留。
- 外部运行时请求0，控制台及运行时错误0，失败请求0。

普通材质截图明确模拟 `prefers-reduced-transparency:no-preference`；另行验证reduce降级。本机系统默认开启降低透明度，因此观看效果可在预览条选择“始终玻璃”，或使用`?material=glass`。

## 光学单独验证

`optical-probe-report.json`：**7 PASS / 0 FAIL**，使用应用实际材料CSS和位移图生成器。六组系统偏好/材质组合正确；仅切换边缘折射滤镜后，400×240测试板的6171个边缘像素发生变化，内缩12px的中心区域变化0像素。该测试是材质隔离验证，与应用路由测试分开记录。

`material-no-refraction.png`、`material-edge-refraction.png` 保存对照；复验脚本为`material-probe.mjs`。

## 内容与保护

`data-report.json`：LEADERS、INSTITUTES、PROJECTS、STATUS、CONTACT五组声明体与demo/core.js全部相同，5 PASS。完成后复算先前受保护demo/archive的38个文件SHA256，改变0。

没有修改系统网络或现有容器；本机仍没有Docker，本轮没有执行镜像构建或部署。之前的Docker交付文件与回滚脚本继续保留。

## 截图

`glass-{1,2,3}-home-{1440x810,390x844}.png`为最终应用页面；另有移动菜单和项目区截图。`design/liquid-glass/*-revision.png`为Stitch原稿，不应与应用截图混称。

## 复验命令

```powershell
$env:PLAYWRIGHT_MODULE='I:\PVE\.delta-qa-runtime\node_modules\playwright\index.mjs'
$env:QA_BASE_URL='http://127.0.0.1:18180'
node qa/liquid-glass-check.mjs
node qa/liquid-glass/material-probe.mjs
```
