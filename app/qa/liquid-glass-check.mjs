import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const loaded = process.env.PLAYWRIGHT_MODULE
  ? await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href)
  : await import('playwright');
const { chromium } = loaded.default ?? loaded;
const baseURL = process.env.QA_BASE_URL ?? 'http://127.0.0.1:18180';
const root = path.dirname(fileURLToPath(import.meta.url));
const output = path.join(root, 'liquid-glass');
await fs.mkdir(output, { recursive: true });
const designs = ['glass-1', 'glass-2', 'glass-3'];
const results = [];
const errors = [];
const failedRequests = [];
const externalRequests = new Set();
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const browser = await chromium.launch({
  executablePath: process.env.QA_BROWSER ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: true,
});
const context = await browser.newContext({ viewport: { width: 1440, height: 810 }, permissions: ['clipboard-read', 'clipboard-write'] });
const page = await context.newPage();
page.setDefaultTimeout(8000);
const cdp = await context.newCDPSession(page);
await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-transparency', value: 'no-preference' }] });
page.on('pageerror', error => errors.push({ url: page.url(), message: error.message }));
page.on('console', message => { if (message.type() === 'error') errors.push({ url: page.url(), message: message.text() }); });
page.on('requestfailed', request => failedRequests.push({ url: request.url(), error: request.failure()?.errorText }));
page.on('request', request => {
  if (/^https?:/.test(request.url()) && new URL(request.url()).origin !== new URL(baseURL).origin) externalRequests.add(request.url());
});
async function check(name, task) {
  try { const detail = await task(); results.push({ name, pass: true, detail }); console.log(`PASS ${name}${detail ? `: ${JSON.stringify(detail)}` : ''}`); }
  catch (error) { results.push({ name, pass: false, error: error.message }); console.log(`FAIL ${name}: ${error.message}`); }
}
async function visit(route = '/', design) {
  const url = new URL(route, baseURL);
  if (design) url.searchParams.set('design', design);
  const response = await page.goto(url.href, { waitUntil: 'networkidle' });
  assert.equal(response.status(), 200);
  await page.locator('main h1').waitFor({ state: 'visible' });
  await sleep(800);
}
const currentDesign = () => page.locator('html').getAttribute('data-design');
const currentIndex = async () => Number(await page.getByTestId('leader-carousel').getAttribute('data-index'));
async function expectIndex(value) {
  await page.waitForFunction(index => document.querySelector('[data-testid="leader-carousel"]')?.getAttribute('data-index') === String(index), value);
}
async function selectDesign(design) {
  const target = page.locator(`[data-design-target="${design}"]`);
  await target.click();
  await page.waitForFunction(value => document.documentElement.dataset.design === value, design);
  await sleep(400);
}
async function setMaterial(material) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (await page.locator('html').getAttribute('data-material') === material) return;
    await page.getByTestId('material-preference').click();
    await sleep(100);
  }
  assert.equal(await page.locator('html').getAttribute('data-material'), material, `could not select ${material} material`);
}
function geometry() {
  const frame = document.querySelector('.car-viewport').getBoundingClientRect();
  return { viewport: innerWidth, document: document.documentElement.scrollWidth, portraitWidth: frame.width, portraitHeight: frame.height, portraitRatio: frame.width / frame.height };
}

try {
  for (const design of designs) {
    for (const viewport of [{ width: 1440, height: 810 }, { width: 390, height: 844 }]) {
      await page.setViewportSize(viewport);
      await check(`${design} home ${viewport.width}x${viewport.height}`, async () => {
        await visit('/', design);
        await setMaterial('auto');
        assert.equal(await currentDesign(), design);
        const measures = await page.evaluate(geometry);
        assert.ok(measures.document <= measures.viewport + 1, `overflow ${JSON.stringify(measures)}`);
        assert.ok(Math.abs(measures.portraitRatio - 9 / 16) < .003, `portrait ratio ${JSON.stringify(measures)}`);
        assert.equal(await page.locator('.slide[aria-hidden="false"]').count(), 1);
        if (viewport.width === 1440) {
          const bounds = await page.locator('.hero-title,.hero-cta,.hero-stats,[data-testid="leader-carousel"]').evaluateAll(elements => elements.map(element => { const rect = element.getBoundingClientRect(); return { selector: element.className, top: rect.top, bottom: rect.bottom }; }));
          assert.ok(bounds.every(box => box.top >= 0 && box.bottom <= 811), `hero clipped ${JSON.stringify(bounds)}`);
        }
        await page.screenshot({ path: path.join(output, `${design}-home-${viewport.width}x${viewport.height}.png`) });
        return measures;
      });
      await check(`${design} real glass and sharp foreground ${viewport.width}`, async () => {
        const material = await page.evaluate(() => {
          const selectors = ['.hdr', '.proj-card', '.slide-cap'];
          const surfaces = selectors.map(selector => { const element = document.querySelector(selector); const style = getComputedStyle(element); return { selector, backdrop: style.backdropFilter, webkitBackdrop: style.webkitBackdropFilter, background: style.backgroundColor, beforeBackdrop: getComputedStyle(element, '::before').backdropFilter }; });
          const blurredForeground = [];
          for (const element of document.querySelectorAll('.hero-title,.hero-lede,.proj-name')) {
            let current = element;
            while (current && current !== document.body) { const filter = getComputedStyle(current).filter; if (filter !== 'none') blurredForeground.push({ className: current.className, filter }); current = current.parentElement; }
          }
          return { supportsBackdrop: CSS.supports('backdrop-filter', 'blur(20px)'), surfaces, blurredForeground };
        });
        assert.ok(material.supportsBackdrop, 'test browser does not support backdrop-filter');
        for (const surface of material.surfaces) assert.ok([surface.backdrop,surface.webkitBackdrop,surface.beforeBackdrop].some(value => /blur\(|url\(/.test(value ?? '')), `no backdrop processing on ${surface.selector}`);
        assert.deepEqual(material.blurredForeground, [], 'foreground content has a filter');
        return material;
      });
      if (viewport.width === 390) await check(`${design} mobile navigation`, async () => {
        await page.getByRole('button', { name: '打开菜单', exact: true }).click();
        const dialog = page.getByRole('dialog', { name: '主导航' });
        await dialog.waitFor({ state: 'visible' }); await sleep(450);
        assert.equal(await dialog.locator('a[href^="/field/"]').count(), 6);
        await page.screenshot({ path: path.join(output, `${design}-menu-390x844.png`) });
        await dialog.locator('a[href^="/field/biology"]').click();
        await page.waitForURL(url => url.pathname === '/field/biology');
        await dialog.waitFor({ state: 'hidden' });
        assert.equal(await currentDesign(), design);
      });
    }
    await page.setViewportSize({ width: 1440, height: 810 });
    await check(`${design} carousel controls, drag and photo route`, async () => {
      await visit('/', design);
      await page.getByRole('button', { name: '下一位负责人', exact: true }).click(); await expectIndex(1);
      await page.getByRole('button', { name: '上一位负责人', exact: true }).click(); await expectIndex(0); await sleep(800);
      const box = await page.locator('.car-viewport').boundingBox();
      await page.mouse.move(box.x + box.width * .8, box.y + box.height * .4); await page.mouse.down();
      await page.mouse.move(box.x + box.width * .2, box.y + box.height * .4, { steps: 14 }); await page.mouse.up();
      await expectIndex(1); assert.equal(new URL(page.url()).pathname, '/'); await sleep(800);
      const active = page.locator('.slide[aria-hidden="false"]'); const href = await active.getAttribute('href'); await active.click();
      await page.waitForURL(url => url.pathname === new URL(href, baseURL).pathname);
      assert.equal(await currentDesign(), design);
      return { href, finalDesign: await currentDesign() };
    });
    await check(`${design} project progress fills`, async () => {
      await visit('/', design);
      const values = [];
      for (const track of await page.locator('.proj-card .prog-track').all()) {
        await track.scrollIntoViewIfNeeded(); await sleep(1250);
        const value = await track.evaluate(element => ({ expected: Number(element.getAttribute('aria-valuenow')), rendered: element.querySelector('.prog-fill').getBoundingClientRect().width / element.getBoundingClientRect().width * 100 }));
        assert.ok(Math.abs(value.expected - value.rendered) < .1, JSON.stringify(value)); values.push(value);
      }
      await page.locator('#projects').scrollIntoViewIfNeeded(); await sleep(400);
      await page.screenshot({ path: path.join(output, `${design}-projects-1440x810.png`) });
      return values;
    });
  }

  await check('design picker persists across route navigation and reload', async () => {
    await page.setViewportSize({ width: 1440, height: 810 }); await visit('/', 'glass-1');
    assert.equal(await page.getByTestId('design-switcher').count(), 1);
    for (const design of ['glass-2', 'glass-3', 'keynote', 'glass-1']) { await selectDesign(design); assert.equal(new URL(page.url()).searchParams.get('design'), design); }
    await page.locator('.hero-cta a[href^="/cooperation"]').click(); await page.waitForURL(url => url.pathname === '/cooperation');
    assert.equal(await currentDesign(), 'glass-1');
    await page.reload({ waitUntil: 'networkidle' }); assert.equal(await currentDesign(), 'glass-1');
  });

  const routes = [
    ['/', '德尔塔'], ['/field/physics', '物理研究院'], ['/field/biology', '生物研究院'], ['/field/chemistry', '化学研究院'], ['/field/mathematics', '数学研究院'], ['/field/philosophy', '哲学研究院'], ['/field/armed-forces', '武装力量'],
    ['/leader/lanyin', '澜因'], ['/leader/huishi', '慧矢'], ['/leader/redact-chem', '数据删除'], ['/leader/redact-math', '数据删除'], ['/leader/zhiyan', '质湮'],
    ['/project/DRC-PHY-2401', '亚稳态量子相干阵列'], ['/project/DRC-BIO-2402', '自组织细胞图谱'], ['/project/DRC-CHM-2403', '低温催化路径筛选'], ['/project/DRC-MTH-2404', '高维拓扑不变量计算框架'], ['/project/DRC-PHL-2405', '意识边界的形式化描述'], ['/project/DRC-AFR-2406', '分布式感知节点组网'],
    ['/cooperation', '合作'], ['/qa-liquid-glass-not-found', '页面不存在'],
  ];
  for (const [route, title] of routes) await check(`latest design route ${route}`, async () => {
    await visit(route); assert.ok((await page.locator('main h1').innerText()).includes(title)); assert.equal(await currentDesign(), 'glass-1');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    assert.ok((await page.locator('footer').innerText()).includes('本站为虚构科研机构的展示站点'));
  });
  await check('contact clipboard and toast regression', async () => {
    await visit('/cooperation');
    await page.getByRole('button', { name: '复制合作邮箱', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('[role="status"]')?.textContent.includes('已复制：合作邮箱'));
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), 'your-name@lany1n.icu');
  });
  await check('reduced-transparency preference has a solid fallback', async () => {
    await visit('/', 'glass-1');
    await setMaterial('auto');
    await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-transparency', value: 'reduce' }] });
    await visit('/', 'glass-1');
    const fallback = await page.evaluate(() => ({ media: matchMedia('(prefers-reduced-transparency: reduce)').matches, surfaces: ['.hdr','.proj-card','.slide-cap'].map(selector => { const element = document.querySelector(selector); const style = getComputedStyle(element); const rim = getComputedStyle(element,'::after'); return { selector, backdrop: style.backdropFilter, after: rim.backdropFilter, rimOpacity: rim.opacity, background: style.backgroundColor }; }) }));
    assert.ok(fallback.media, 'Chrome did not emulate reduced transparency');
    assert.ok(fallback.surfaces.every(surface => surface.backdrop === 'none' && surface.after === 'none' && Number(surface.rimOpacity) === 0), JSON.stringify(fallback));
    return fallback;
  });
  await check('explicit glass overrides reduced-transparency for comparison', async () => {
    await setMaterial('glass');
    const surfaces = await page.evaluate(() => ['.hdr','.proj-card','.slide-cap'].map(selector => { const element = document.querySelector(selector); return { selector, backdrop: getComputedStyle(element).backdropFilter, after: getComputedStyle(element,'::after').backdropFilter }; }));
    assert.ok(surfaces.every(surface => [surface.backdrop,surface.after].some(value => /blur\(|url\(/.test(value ?? ''))), JSON.stringify(surfaces));
    assert.equal(await page.locator('html').getAttribute('data-material'), 'glass');
    await page.reload({ waitUntil: 'networkidle' });
    assert.equal(await page.locator('html').getAttribute('data-material'), 'glass');
    return surfaces;
  });
  await check('explicit solid material disables backdrop effects', async () => {
    await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-transparency', value: 'no-preference' }] });
    await setMaterial('solid');
    const surfaces = await page.evaluate(() => ['.hdr','.proj-card','.slide-cap'].map(selector => { const element = document.querySelector(selector); return { selector, backdrop: getComputedStyle(element).backdropFilter, after: getComputedStyle(element,'::after').backdropFilter }; }));
    assert.ok(surfaces.every(surface => surface.backdrop === 'none' && surface.after === 'none'), JSON.stringify(surfaces));
    await setMaterial('auto');
    return surfaces;
  });
  await check('no external runtime asset requests', () => assert.deepEqual([...externalRequests], []));
  await check('no failed requests', () => assert.deepEqual(failedRequests, []));
  await check('no console or runtime errors', () => assert.deepEqual(errors, []));
} finally {
  const report = { baseURL, timestamp: new Date().toISOString(), results, errors, failedRequests, externalRequests: [...externalRequests], passed: results.filter(result => result.pass).length, failed: results.filter(result => !result.pass).length };
  await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  await browser.close();
  console.log(`Liquid Glass QA: ${report.passed} PASS / ${report.failed} FAIL`);
  process.exitCode = report.failed ? 1 : 0;
}
