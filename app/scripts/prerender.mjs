// 预渲染：把每个路由渲染成 dist/<route>/index.html，便于搜索引擎与不执行 JS 的抓取。
// 由 `npm run build` 在 vite build 之后调用：node scripts/prerender.mjs
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(root, 'dist');
const templatePath = join(distDir, 'index.html');
const serverEntry = join(root, 'dist-ssr', 'entry-server.js');
const seedPath = join(root, 'server', 'content.seed.json');

const { render, applyContent, snapshotContent } = await import(pathToFileURL(serverEntry).href);

// 若仓库里已有种子内容（后台导出或上次构建生成），预渲染就使用它，保证静态 HTML 与线上数据一致。
let seeded = false;
if (existsSync(seedPath)) {
  try {
    const parsed = JSON.parse(readFileSync(seedPath, 'utf8'));
    applyContent(parsed.content ?? parsed);
    seeded = true;
  } catch (error) {
    console.warn(`种子内容读取失败，回退到代码内置数据：${error.message}`);
  }
}

const content = snapshotContent();
const siteEn = content.site.en;

const routes = [
  '/',
  ...content.institutes.map(field => `/field/${field.slug}`),
  ...content.leaders.map(leader => `/leader/${leader.slug}`),
  ...content.projects.map(project => `/project/${project.code}`),
  '/cooperation',
];

const template = readFileSync(templatePath, 'utf8');
const contentScript = `<script>window.__CONTENT__=${JSON.stringify(content).replace(/</g, '\\u003c')};</script>`;

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
  page = page.replace('</body>', `${contentScript}</body>`);
  const outFile = route === '/' ? templatePath : join(distDir, route.replace(/^\//, ''), 'index.html');
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, page, 'utf8');
  return { route, outFile, bytes: Buffer.byteLength(page), title: title ?? '(默认)' };
}

const results = routes.map(writeRoute);

// 内容快照：静态站可用 /content.json，服务端首次启动可用同结构的种子文件。
writeFileSync(join(distDir, 'content.json'), `${JSON.stringify(content, null, 2)}\n`, 'utf8');
if (!existsSync(seedPath)) {
  writeFileSync(seedPath, `${JSON.stringify({ ...content, revision: 1, updatedAt: new Date().toISOString() }, null, 2)}\n`, 'utf8');
  console.log(`已生成内容种子：server/content.seed.json${seeded ? '' : '（来自代码内置数据）'}`);
}

console.log(`预渲染完成：${results.length} 个页面（首页已写入 dist/index.html）`);
for (const item of results) {
  console.log(`  ${item.route.padEnd(28)} → ${item.outFile.replace(`${root}\\`, '').replace(`${root}/`, '')}  ${item.bytes} B  ${item.title}`);
}
if (!readFileSync(templatePath, 'utf8').includes('id="root"><')) {
  console.error('警告：首页 HTML 里没有预渲染内容，请检查 dist-ssr 构建是否成功。');
  process.exitCode = 1;
}
