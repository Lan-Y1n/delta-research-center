# DELTA RESEARCH CENTER · Codex 交接包

这个目录是「德尔塔研究中心」官网项目的**交接包**，用来交给 Codex（或其他编码代理）继续做成可部署的生产站点。

## 怎么用（3 步）

1. 先看 `PROMPT.md`（任务提示词）——**整段复制进 Codex 的对话框**，或者让它直接读这个文件。
2. 让它读 `SPEC.md`（唯一需求规格：信息架构、数据模型、页面结构、视觉规范、验收清单）。
3. 让它打开 `demo/d.html`、`demo/f.html`、`demo/a.html` 体验交互基线（纯静态，可 `python -m http.server` 后访问）。

## 目录说明

| 路径 | 说明 |
|---|---|
| `PROMPT.md` | 给 Codex 的任务提示词：技术栈、工程结构、容器化、部署到 VM101、7 项验证、硬约束 |
| `SPEC.md` | 需求规格：路由、数据模型（leader/institute/project/contact 字段）、六个领域页、负责人详情、合作页、色板与动效、内容真实性红线、验收清单 |
| `demo/*.html` | 六套可运行原型（a–f），同一套数据与路由，靠 CSS 换视觉 |
| `demo/core.js` | 原型的全部逻辑：数据、视图、哈希路由、轮播（自动/拖动/键盘/暂停）、复制、reveal |
| `demo/theme-a.css … theme-f.css` | 六套视觉。**d/e/f 是 Apple 极简方向（纯黑发布 / 磨砂 / 深空玻璃）** |
| `demo/preview/*.png` | 六版首屏截图 + 内页样例（D 物理研究院、E 项目区） |
| `stitch/STITCH-NOTES.md` | Google Stitch 生成的两版设计记录（项目链接、screen id、可复用的设计思路） |

## 原型怎么看

```powershell
cd demo
python -m http.server 18080
# 然后浏览器打开 http://127.0.0.1:18080/d.html
```

页面是哈希路由：`#/`、`#/field/physics`、`#/leader/lanyin`、`#/project/DRC-PHY-2401`、`#/cooperation`。
右上/右下有 A–F 方案切换器，可以现场对比六套视觉。

## 已经确定的事实（不要在交接过程中被“优化”掉）

- 五位负责人：澜因(物理)、慧矢(生物)、**化学「数据删除」**、**数学「数据删除」**、质湮(哲学)；武装力量无负责人
- 首页轮播**同一时间只能显示一张**负责人照片，且必须是 **9:16 竖向构图**
- 未提供的人物经历/成果/联系方式一律占位，**不得编造**
- 六个领域各有独立页，均含「查看负责人详情（VIEW PROFILE）」入口
- 目标端口 8080（已预留），公网入口由另一台 WAF 反代，本站只监听内网 8080
