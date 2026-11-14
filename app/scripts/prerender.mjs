// 预渲染：把每个路由渲染成 dist/<route>/index.html，便于搜索引擎与不执行 JS 的抓取。
// 由 `npm run build` 在 vite build 之后调用：node scripts/prerender.mjs
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(root, 'dist');
const templatePath = join(distDir, 'index.html');
const serverEntry = join(root, 'dist-ssr', 'entry-server.js');

const template = readFileSync(templatePath, 'utf8');
const { render, routes, siteEn } = await import(pathToFileURL(serverEntry).href);

function pageTitle(html) {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  if (!h1) return null;
  const inner = h1[1];
  const en = inner.match(/<i[^>]*>([\s\S]*?)<\/i>/);
  // 中文标题不带空格（h1 里可能是多个 <span> 拼接），英文副标题用「·」隔开
  const name = inner
    .replace(/<i[^>]*>[\s\S]*?<\/i>/, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, '')
    .trim();
  const enText = en ? en[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : '';
  const combined = enText ? `${name} · ${enText}` : name;
  return combined ? `${combined} · ${siteEn}` : null;
}

function writeRoute(route) {
  const html = render(route);
  const title = pageTitle(html);
  let page = template.replace('<div id="root"></div>', `<div id="root">${html}</div>`);
  if (title) page = page.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);
  const outFile = route === '/' ? templatePath : join(distDir, route.replace(/^\//, ''), 'index.html');
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, page, 'utf8');
  return { route, outFile, bytes: Buffer.byteLength(page), title: title ?? '(默认)' };
}

const results = routes.map(writeRoute);
const renderedRoot = readFileSync(templatePath, 'utf8');
console.log(`预渲染完成：${results.length} 个页面（首页已写入 dist/index.html）`);
for (const item of results) {
  console.log(`  ${item.route.padEnd(28)} → ${item.outFile.replace(`${root}\\`, '').replace(`${root}/`, '')}  ${item.bytes} B  ${item.title}`);
}
if (!renderedRoot.includes('id="root"><')) {
  console.error('警告：首页 HTML 里没有预渲染内容，请检查 dist-ssr 构建是否成功。');
  process.exitCode = 1;
}
