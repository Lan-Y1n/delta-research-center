import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

// QA-only runner. PLAYWRIGHT_MODULE may point to an external Playwright installation.
const playwright = process.env.PLAYWRIGHT_MODULE
  ? await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href)
  : await import('playwright');
const { chromium } = playwright.default ?? playwright;
const baseURL = process.env.QA_BASE_URL ?? 'http://127.0.0.1:18081';
const root = path.dirname(fileURLToPath(import.meta.url));
const output = path.join(root, 'screenshots');
const interactionOnly = process.env.QA_SCOPE === 'interactions';
await fs.mkdir(output, { recursive: true });
const results = [];
const errors = [];
const requests = [];
const brokenLinks = new Set();
const routes = [
  ['/', '德尔塔'],
  ['/field/physics', '物理研究院'],
  ['/field/biology', '生物研究院'],
  ['/field/chemistry', '化学研究院'],
  ['/field/mathematics', '数学研究院'],
  ['/field/philosophy', '哲学研究院'],
  ['/field/armed-forces', '武装力量'],
  ['/leader/lanyin', '澜因'],
  ['/leader/huishi', '慧矢'],
  ['/leader/redact-chem', '数据删除'],
  ['/leader/redact-math', '数据删除'],
  ['/leader/zhiyan', '质湮'],
  ['/project/DRC-PHY-2401', '亚稳态量子相干阵列'],
  ['/project/DRC-BIO-2402', '自组织细胞图谱'],
  ['/project/DRC-CHM-2403', '低温催化路径筛选'],
  ['/project/DRC-MTH-2404', '高维拓扑不变量计算框架'],
  ['/project/DRC-PHL-2405', '意识边界的形式化描述'],
  ['/project/DRC-AFR-2406', '分布式感知节点组网'],
  ['/cooperation', '合作'],
  ['/qa-page-does-not-exist', '页面不存在'],
];
const known = new Set(routes.map(([route]) => route));
const browser = await chromium.launch({
  executablePath: process.env.QA_BROWSER ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: true,
});
const context = await browser.newContext({ viewport: { width: 1440, height: 810 }, permissions: ['clipboard-read', 'clipboard-write'] });
const page = await context.newPage();
page.setDefaultTimeout(8000);
function observe(target) {
  target.on('pageerror', error => errors.push({ url: target.url(), message: error.message }));
  target.on('console', message => { if (message.type() === 'error') errors.push({ url: target.url(), message: message.text() }); });
  target.on('requestfailed', request => requests.push({ url: request.url(), error: request.failure()?.errorText }));
}
observe(page);
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function check(name, task) {
  try { const detail = await task(); results.push({ name, pass: true, detail }); console.log(`PASS ${name}${detail ? `: ${typeof detail === 'string' ? detail : JSON.stringify(detail)}` : ''}`); }
  catch (error) { results.push({ name, pass: false, error: error.message }); console.log(`FAIL ${name}: ${error.message}`); }
}
async function visit(route, target = page) {
  const response = await target.goto(baseURL + route, { waitUntil: 'networkidle' });
  assert.equal(response.status(), 200, `HTTP ${response.status()}`);
  await target.locator('main h1').waitFor({ state: 'visible' });
  await sleep(360);
}
async function index(target = page) {
  return Number(await target.getByTestId('leader-carousel').getAttribute('data-index'));
}
async function activeSlide(target = page) {
  const current = await index(target);
  const leaderFields = ['physics', 'biology', 'chemistry', 'mathematics', 'philosophy'];
  return target.getByTestId('leader-carousel').locator(`.slide[href="/field/${leaderFields[current]}"]`);
}
async function expectIndex(expected, target = page) {
  await target.waitForFunction(value => document.querySelector('[data-testid="leader-carousel"]')?.getAttribute('data-index') === String(value), expected);
}

try {
  if (!interactionOnly) for (const viewport of [{ width: 1440, height: 810 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    for (const [route, expected] of routes) {
      await check(`${viewport.width} route ${route}`, async () => {
        await visit(route);
        assert.ok((await page.locator('main h1').innerText()).includes(expected));
        const dimensions = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
        assert.ok(dimensions.document <= dimensions.viewport + 1, `horizontal overflow ${JSON.stringify(dimensions)}`);
        assert.ok((await page.locator('footer').innerText()).includes('本站为虚构科研机构的展示站点'));
        const links = await page.locator('a[href]').evaluateAll(anchors => anchors.map(anchor => anchor.getAttribute('href')));
        for (const href of links) {
          if (href.startsWith('/') && !href.startsWith('//') && !known.has(href.split('#')[0])) brokenLinks.add(href);
          assert.ok(href !== '#' && href !== '', 'empty link');
        }
        if (route === '/') await page.screenshot({ path: path.join(output, `home-${viewport.width}x${viewport.height}.png`), fullPage: false });
        return `${expected}; ${dimensions.document}px / ${dimensions.viewport}px`;
      });
    }
  }
  if (!interactionOnly) for (const route of ['/field/__proto__', '/field/toString', '/leader/__proto__', '/leader/toString']) {
    await check(`unknown inherited-key route ${route} returns 404`, async () => {
      await visit(route);
      assert.ok((await page.locator('main h1').innerText()).includes('页面不存在'));
    });
  }
  if (!interactionOnly) await check('internal links resolve to implemented routes', () => assert.deepEqual([...brokenLinks], []));
  await page.setViewportSize({ width: 1440, height: 810 });
  await check('1440×810 complete hero in viewport', async () => {
    await visit('/');
    const bounds = await page.evaluate(() => {
      const selectors = ['.hero-title', '.hero-cta', '.hero-stats', '[data-testid="leader-carousel"]'];
      return selectors.map(selector => { const rect = document.querySelector(selector).getBoundingClientRect(); return { selector, top: rect.top, bottom: rect.bottom }; });
    });
    for (const box of bounds) { assert.ok(box.top >= 0 && box.bottom <= 811, JSON.stringify(box)); }
    return bounds;
  });
  await check('1280×800 complete hero in viewport', async () => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await visit('/');
    const bottoms = await page.locator('.hero-stats, [data-testid="leader-carousel"]').evaluateAll(elements => elements.map(element => element.getBoundingClientRect().bottom));
    assert.ok(bottoms.every(bottom => bottom <= 801), JSON.stringify(bottoms));
    return bottoms;
  });
  await page.setViewportSize({ width: 1440, height: 810 });
  await check('carousel autoplay after 5.6 seconds', async () => {
    await visit('/'); await page.mouse.move(4, 100); await page.locator('body').click({ position: { x: 3, y: 90 } });
    const before = await index(); await sleep(6000); assert.notEqual(await index(), before);
    return { before, after: await index() };
  });
  await check('carousel hover pauses autoplay', async () => {
    await page.getByTestId('leader-carousel').hover(); const before = await index();
    await sleep(6000); assert.equal(await index(), before); return before;
  });
  await check('carousel focus pauses autoplay', async () => {
    await (await activeSlide()).focus(); await page.mouse.move(4, 100); const before = await index();
    await sleep(6000); assert.equal(await index(), before); return before;
  });
  await check('carousel next and previous buttons', async () => {
    const before = await index();
    await page.getByRole('button', { name: '下一位负责人', exact: true }).click(); await expectIndex((before + 1) % 5);
    await page.getByRole('button', { name: '上一位负责人', exact: true }).click(); await expectIndex(before);
  });
  await check('carousel keyboard left/right', async () => {
    const before = await index(); await (await activeSlide()).focus();
    await page.keyboard.press('ArrowRight'); await expectIndex((before + 1) % 5);
    await page.keyboard.press('ArrowLeft'); await expectIndex(before);
  });
  await check('carousel pause/resume button', async () => {
    const pause = page.getByRole('button', { name: '暂停自动轮播', exact: true });
    await pause.click(); const resume = page.getByRole('button', { name: '继续自动轮播', exact: true });
    assert.equal(await resume.getAttribute('aria-pressed'), 'true');
    await resume.click(); assert.equal(await pause.getAttribute('aria-pressed'), 'false');
  });
  await check('carousel mouse drag advances without navigating', async () => {
    const before = await index(); const box = await (await activeSlide()).boundingBox();
    const start = { x: box.x + box.width * .75, y: box.y + box.height * .45 };
    await page.mouse.move(start.x, start.y); await page.mouse.down();
    await page.mouse.move(start.x - box.width * .55, start.y, { steps: 14 }); await page.mouse.up();
    await expectIndex((before + 1) % 5); assert.equal(new URL(page.url()).pathname, '/');
  });
  await check('carousel photo navigates to corresponding field', async () => {
    const link = await activeSlide(); const href = await link.getAttribute('href'); await sleep(700); await link.click();
    await page.waitForURL(baseURL + href); assert.equal(new URL(page.url()).pathname, href);
  });
  await check('desktop field menu hover, Escape, outside and click toggle', async () => {
    await visit('/'); const trigger = page.getByRole('button', { name: '领域', exact: true });
    await trigger.hover(); assert.equal(await trigger.getAttribute('aria-expanded'), 'true');
    assert.equal(await page.locator('.menu a[href^="/field/"]').count(), 6);
    await page.keyboard.press('Escape'); assert.equal(await trigger.getAttribute('aria-expanded'), 'false');
    await page.mouse.move(4, 150); await trigger.dispatchEvent('click'); assert.equal(await trigger.getAttribute('aria-expanded'), 'true');
    await trigger.dispatchEvent('click'); assert.equal(await trigger.getAttribute('aria-expanded'), 'false');
    await trigger.hover(); await page.mouse.click(4, 200); assert.equal(await trigger.getAttribute('aria-expanded'), 'false');
  });
  await check('mobile menu full screen, focus trap, Escape and navigation', async () => {
    await page.setViewportSize({ width: 390, height: 844 }); await visit('/');
    const burger = page.getByRole('button', { name: '打开菜单', exact: true }); await burger.click();
    const close = page.getByRole('button', { name: '关闭菜单', exact: true }); assert.equal(await close.getAttribute('aria-expanded'), 'true');
    const dialog = page.locator('[role="dialog"]'); await dialog.waitFor({ state: 'visible' });
    assert.equal(await dialog.locator('a[href^="/field/"]').count(), 6);
    await sleep(450);
    await page.screenshot({ path: path.join(output, 'mobile-menu-390x844.png'), fullPage: false });
    const focusable = dialog.locator('a,button'); await focusable.last().focus(); await page.keyboard.press('Tab');
    assert.ok(await dialog.evaluate(element => element.contains(document.activeElement)), 'focus escaped mobile dialog');
    await page.keyboard.press('Escape'); await burger.waitFor({ state: 'visible' }); assert.equal(await burger.getAttribute('aria-expanded'), 'false');
    await burger.click(); await page.locator('[role="dialog"] a[href="/field/biology"]').click();
    await page.waitForURL(baseURL + '/field/biology'); await page.locator('[role="dialog"]').waitFor({ state: 'hidden' });
  });
  await check('cooperation copies phone, location and email with toast', async () => {
    await visit('/cooperation');
    for (const [label, value] of [['联系方式', '+86 000 0000 0000'], ['所在位置', '（占位）中国 · 某地 · 德尔塔研究中心园区'], ['合作邮箱', 'your-name@lany1n.icu']]) {
      await page.getByRole('button', { name: `复制${label}`, exact: true }).click();
      await page.waitForFunction(text => [...document.querySelectorAll('[role="status"]')].some(element => element.textContent.includes('已复制：' + text)), label);
      assert.equal(await page.evaluate(() => navigator.clipboard.readText()), value);
    }
    assert.equal(await page.locator('a[href="mailto:your-name@lany1n.icu"]').count(), 1);
    const socials = await page.locator('.social').evaluateAll(links => links.map(link => link.href));
    assert.deepEqual(socials, ['https://github.com/', 'https://x.com/', 'https://telegram.org/', 'https://www.bilibili.com/']);
  });
  await check('mobile touch swipe advances without navigating', async () => {
    const touchContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const touchPage = await touchContext.newPage(); observe(touchPage); await visit('/', touchPage);
    const slide = await activeSlide(touchPage); await slide.scrollIntoViewIfNeeded(); const box = await slide.boundingBox(); const before = await index(touchPage);
    const cdp = await touchContext.newCDPSession(touchPage); const x = box.x + box.width * .8; const y = box.y + box.height * .45;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    for (let step = 1; step <= 10; step++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - box.width * .6 * step / 10, y }] }); await sleep(20); }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expectIndex((before + 1) % 5, touchPage); assert.equal(new URL(touchPage.url()).pathname, '/'); await touchContext.close();
  });
  await check('reduced-motion preference is honored', async () => {
    const reducedContext = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 810 } });
    const reduced = await reducedContext.newPage(); observe(reduced); await visit('/', reduced);
    assert.ok(await reduced.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches));
    const transforms = await reduced.locator('.sec-head, .proj-grid > div, .about-left, .fact').evaluateAll(elements => elements.map(element => getComputedStyle(element).transform));
    assert.ok(transforms.length >= 10, 'animated sections were not found');
    assert.ok(transforms.every(value => value === 'none' || value === 'matrix(1, 0, 0, 1, 0, 0)'), JSON.stringify(transforms));
    await reducedContext.close(); return transforms.length;
  });
  await check('no browser console or runtime errors', () => assert.deepEqual(errors, []));
  await check('no failed network requests', () => assert.deepEqual(requests, []));
} finally {
  const report = { baseURL, scope: interactionOnly ? 'interactions' : 'all', timestamp: new Date().toISOString(), results, errors, failedRequests: requests, passed: results.filter(result => result.pass).length, failed: results.filter(result => !result.pass).length };
  await fs.writeFile(path.join(root, interactionOnly ? 'interactions-report.json' : 'report.json'), JSON.stringify(report, null, 2) + '\n');
  await browser.close();
  console.log(`Browser QA: ${report.passed} PASS / ${report.failed} FAIL`);
  process.exitCode = report.failed ? 1 : 0;
}
