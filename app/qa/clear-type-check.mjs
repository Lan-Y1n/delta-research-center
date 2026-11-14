import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const loaded = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE ?? 'I:/PVE/.delta-qa-runtime/node_modules/playwright/index.mjs').href);
const { chromium } = loaded.default ?? loaded;
const baseURL = process.env.QA_BASE_URL ?? 'http://127.0.0.1:18180';
const scope = process.env.QA_SCOPE ?? 'all';
const output = path.join(path.dirname(fileURLToPath(import.meta.url)), 'clear-type');
await fs.mkdir(output, { recursive: true });
const results = [];
const errors = [];
const failedRequests = [];
const externalRequests = new Set();
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const browser = await chromium.launch({ executablePath: process.env.QA_BROWSER ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 810 }, permissions: ['clipboard-read', 'clipboard-write'] });
const page = await context.newPage();
page.setDefaultTimeout(8000);
const cdp = await context.newCDPSession(page);
await cdp.send('DOM.enable');
await cdp.send('CSS.enable');
await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-transparency', value: 'no-preference' }] });
page.on('pageerror', error => errors.push({ url: page.url(), message: error.message }));
page.on('console', message => { if (message.type() === 'error') errors.push({ url: page.url(), message: message.text() }); });
page.on('requestfailed', request => failedRequests.push({ url: request.url(), error: request.failure()?.errorText }));
page.on('request', request => { if (/^https?:/.test(request.url()) && new URL(request.url()).origin !== new URL(baseURL).origin) externalRequests.add(request.url()); });

async function check(name, task) {
  if (scope === 'fonts' && !name.includes('font')) return;
  try { const detail = await task(); results.push({ name, pass: true, detail }); console.log(`PASS ${name}`); }
  catch (error) { results.push({ name, pass: false, error: error.message }); console.log(`FAIL ${name}: ${error.message}`); }
}
async function visit(route = '/', design = 'glass-1', material = 'glass') {
  const url = new URL(route, baseURL);
  url.searchParams.set('design', design);
  url.searchParams.set('material', material);
  const response = await page.goto(url.href, { waitUntil: 'networkidle' });
  assert.equal(response.status(), 200);
  await page.locator('main h1').waitFor({ state: 'visible' });
  await page.evaluate(() => document.fonts.ready);
  await sleep(1000);
}
async function renderedFonts(selector) {
  const { root } = await cdp.send('DOM.getDocument');
  const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector });
  if (!nodeId) return [];
  const { fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId });
  return fonts.map(font => ({ family: font.familyName, postScriptName: font.postScriptName, custom: font.isCustomFont, glyphs: font.glyphCount }));
}
function readButton(element) {
  const style = getComputedStyle(element);
  const after = getComputedStyle(element, '::after');
  const before = getComputedStyle(element, '::before');
  const bounds = element.getBoundingClientRect();
  const parseAlpha = color => {
    if (color === 'transparent') return 0;
    const match = color.match(/^rgba?\((.*)\)$/);
    if (!match) return 1;
    const parts = match[1].replaceAll(',', ' ').replace('/', ' ').trim().split(/\s+/).map(Number);
    return parts.length > 3 ? parts[3] : 1;
  };
  const gradients = [...style.backgroundImage.matchAll(/rgba?\([^)]*\)/g)].map(match => ({ color: match[0], alpha: parseAlpha(match[0]) }));
  const blurs = [...`${style.backdropFilter} ${style.webkitBackdropFilter}`.matchAll(/blur\(([\d.]+)px\)/g)].map(match => Number(match[1]));
  let foregroundFilter = 'none';
  for (let current = element; current && current !== document.body; current = current.parentElement) {
    if (getComputedStyle(current).filter !== 'none') { foregroundFilter = `${current.className}: ${getComputedStyle(current).filter}`; break; }
  }
  return { className: element.className, text: element.textContent?.trim(), width: bounds.width, height: bounds.height, visible: bounds.width > 0 && bounds.height > 0, background: style.backgroundColor, fillAlpha: parseAlpha(style.backgroundColor), backgroundImage: style.backgroundImage, gradientColors: gradients, backdrop: style.backdropFilter, maxBlur: Math.max(0, ...blurs), foregroundFilter, edgeFilter: after.backdropFilter, beforeFilter: before.backdropFilter, edgeOpacity: after.opacity };
}
function assertClear(button, label) {
  assert.ok(button.fillAlpha <= .041, `${label} opaque tint: ${JSON.stringify(button)}`);
  assert.ok(!button.gradientColors.some(color => color.alpha > .12), `${label} opaque painted gradient: ${JSON.stringify(button)}`);
  assert.ok(button.maxBlur <= 2.01, `${label} frosted rather than clear: ${JSON.stringify(button)}`);
  assert.equal(button.foregroundFilter, 'none', `${label} foreground is filtered`);
  assert.ok(button.height >= 43.5 && button.width >= 43.5, `${label} target below44px: ${JSON.stringify(button)}`);
}

try {
  for (const design of ['glass-1', 'glass-2', 'glass-3']) {
    for (const viewport of [{ width: 1440, height: 810 }, { width: 390, height: 844 }]) {
      await page.setViewportSize(viewport);
      await check(`${design} layout and screenshot ${viewport.width}`, async () => {
        await visit('/', design);
        const geometry = await page.evaluate(() => {
          const portrait = document.querySelector('.car-viewport').getBoundingClientRect();
          const hero = [...document.querySelectorAll('.hero-title,.hero-cta,.hero-stats,[data-testid="leader-carousel"]')].map(element => { const rect = element.getBoundingClientRect(); return { className: element.className, top: rect.top, bottom: rect.bottom }; });
          return { viewport: innerWidth, document: document.documentElement.scrollWidth, portraitRatio: portrait.width / portrait.height, hero };
        });
        assert.ok(geometry.document <= viewport.width + 1, `horizontal overflow: ${JSON.stringify(geometry)}`);
        assert.ok(Math.abs(geometry.portraitRatio - 9 / 16) < .003, `portrait aspect: ${geometry.portraitRatio}`);
        if (viewport.width === 1440) assert.ok(geometry.hero.every(box => box.top >= 0 && box.bottom <= 811), `desktop hero clipped: ${JSON.stringify(geometry.hero)}`);
        await page.screenshot({ path: path.join(output, `${design}-home-${viewport.width}x${viewport.height}.png`) });
        return geometry;
      });
      await check(`${design} clear buttons normal and hover ${viewport.width}`, async () => {
        const buttons = page.locator('.hero-cta .btn,.hdr-cta,.rbtn,.car-play,.burger,.design-option,.design-material-toggle,.design-switcher-toggle');
        const samples = [];
        for (const button of await buttons.all()) {
          if (!await button.isVisible()) continue;
          const normal = await button.evaluate(readButton);
          assertClear(normal, 'normal');
          await button.hover(); await sleep(500);
          const hovered = await button.evaluate(readButton);
          assertClear(hovered, 'hover');
          samples.push({ normal, hover: hovered });
        }
        assert.ok(samples.some(sample => sample.normal.className.includes('btn-solid')), 'primary action was not checked');
        assert.ok(samples.some(sample => [sample.normal.edgeFilter,sample.normal.beforeFilter].some(value => /liquid/.test(value))), 'no clear action has a refraction edge');
        return samples;
      });
      if (viewport.width === 390) await check(`${design} mobile menu regression`, async () => {
        await page.getByRole('button', { name: '打开菜单', exact: true }).click();
        const dialog = page.getByRole('dialog', { name: '主导航' });
        await dialog.waitFor(); await sleep(400);
        assert.equal(await dialog.locator('a[href^="/field/"]').count(), 6);
        await page.screenshot({ path: path.join(output, `${design}-menu-390x844.png`) });
        await dialog.locator('a[href="/field/physics"]').click();
        await page.waitForURL(url => url.pathname === '/field/physics');
        await dialog.waitFor({ state: 'hidden' });
      });
    }
    await page.setViewportSize({ width: 1440, height: 810 });
    await check(`${design} rendered font hierarchy`, async () => {
      await visit('/', design);
      const selectors = { brand: '.hero-title span:first-child', body: '.hero-sub', english: '.hero-en', label: '.eyebrow', digits: '.hero-stats > div:first-child dd', quote: '.about-quote' };
      const fonts = {};
      for (const [role, selector] of Object.entries(selectors)) {
        fonts[role] = { style: await page.locator(selector).evaluate(element => ({ family: getComputedStyle(element).fontFamily, weight: getComputedStyle(element).fontWeight, style: getComputedStyle(element).fontStyle })), actual: await renderedFonts(selector) };
      }
      assert.notEqual(fonts.brand.style.family, fonts.body.style.family, 'brand and body still share one font stack');
      assert.notEqual(fonts.english.style.family, fonts.body.style.family, 'English display type still shares the body stack');
      assert.match(fonts.label.style.family, /mono|Consolas|Courier/i, 'Technical labels should use a distinct monospace font');
      const actualFamilies = new Set(Object.values(fonts).flatMap(role => role.actual).filter(font => font.glyphs > 0).map(font => font.family));
      assert.ok(actualFamilies.size >= 3, `only ${actualFamilies.size} effective font families: ${JSON.stringify(fonts)}`);
      assert.ok(fonts.brand.actual.length && fonts.body.actual.length && fonts.english.actual.length, 'platform font proof unavailable');
      const dominantFamily = role => [...role.actual].sort((a,b) => b.glyphs - a.glyphs)[0]?.family;
      assert.notEqual(dominantFamily(fonts.brand), dominantFamily(fonts.body), `brand and body resolve to the same effective font: ${JSON.stringify(fonts)}`);
      await page.locator('#about').scrollIntoViewIfNeeded(); await sleep(800);
      await page.screenshot({ path: path.join(output, `${design}-type-about-1440x810.png`) });
      return { ...fonts, distinctRenderedFamilies: [...actualFamilies] };
    });
    await check(`${design} profile title font`, async () => {
      await visit('/leader/lanyin', design);
      const actual = await renderedFonts('.leader-name');
      const style = await page.locator('.leader-name').evaluate(element => ({ family: getComputedStyle(element).fontFamily, fontStyle: getComputedStyle(element).fontStyle }));
      assert.ok(actual.length, 'profile title platform font proof unavailable');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      return { style, actual };
    });
  }

  await check('copy buttons remain clear and copy correctly', async () => {
    await visit('/cooperation', 'glass-1');
    for (const button of await page.locator('.copy-btn').all()) {
      const normal = await button.evaluate(readButton); assertClear(normal, 'copy normal');
      await button.hover(); await sleep(400); const hover = await button.evaluate(readButton); assertClear(hover, 'copy hover');
    }
    await page.getByRole('button', { name: '复制合作邮箱', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('[role="status"]')?.textContent.includes('已复制：合作邮箱'));
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), 'your-name@lany1n.icu');
    await page.screenshot({ path: path.join(output, 'cooperation-clear-buttons-1440x810.png') });
  });

  await check('button material accessibility and explicit override', async () => {
    const conditions = [];
    for (const [preference, material] of [['reduce','auto'],['reduce','glass'],['no-preference','solid']]) {
      await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-transparency', value: preference }] });
      await visit('/', 'glass-1', material);
      const button = await page.locator('.hero-cta .btn-solid').evaluate(readButton);
      if (material === 'glass') assertClear(button, 'explicit glass');
      else { assert.equal(button.backdrop, 'none'); assert.ok(button.fillAlpha >= .8, `${material} fallback must be readable`); }
      conditions.push({ preference, material, button });
    }
    await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-transparency', value: 'no-preference' }] });
    return conditions;
  });

  await check('clear lens preserves visible background detail', async () => {
    await visit('/', 'glass-1', 'glass');
    await page.evaluate(() => {
      const stage = document.createElement('div'); stage.id = 'qa-clear-lens-stage';
      stage.style.cssText = 'position:fixed;z-index:99999;left:100px;top:150px;width:260px;height:130px;display:grid;place-items:center;background:repeating-linear-gradient(90deg,rgb(18,125,158) 0 12px,rgb(80,38,116) 12px 24px);';
      const holder = document.createElement('div'); holder.className = 'hero-cta'; holder.style.cssText = 'margin:0;width:200px;height:52px;';
      const original = document.querySelector('.hero-cta .btn-solid');
      const copy = original.cloneNode(true); copy.id = 'qa-clear-lens-button'; copy.removeAttribute('href'); copy.style.cssText = 'width:200px;height:52px;'; holder.append(copy); stage.append(holder); document.body.append(stage);
    });
    await sleep(300);
    const box = await page.locator('#qa-clear-lens-button').boundingBox();
    const glass = await page.screenshot({ clip: box }); await fs.writeFile(path.join(output, 'button-clear-over-pattern.png'), glass);
    await page.locator('#qa-clear-lens-button').evaluate(element => { element.style.visibility = 'hidden'; });
    const bare = await page.screenshot({ clip: box }); await fs.writeFile(path.join(output, 'button-pattern-without-lens.png'), bare);
    const optics = await page.evaluate(async ({ glass, bare }) => {
      const decode = async base64 => { const image = new Image(); image.src = `data:image/png;base64,${base64}`; await image.decode(); const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height; const context = canvas.getContext('2d'); context.drawImage(image,0,0); return context.getImageData(0,0,canvas.width,canvas.height); };
      const front = await decode(glass), back = await decode(bare);
      const deviation = data => { const values=[]; for(let y=10;y<14;y++) for(let x=20;x<data.width-20;x++) { const index=(y*data.width+x)*4; values.push(.2126*data.data[index]+.7152*data.data[index+1]+.0722*data.data[index+2]); } const mean=values.reduce((a,b)=>a+b,0)/values.length; return Math.sqrt(values.reduce((sum,value)=>sum+(value-mean)**2,0)/values.length); };
      return { backgroundDeviation: deviation(back), glassDeviation: deviation(front), detailPreservation: deviation(front)/deviation(back), measurement: 'Standard deviation of visible backdrop luminance in the interior top band; excludes text and perimeter.' };
    }, { glass: glass.toString('base64'), bare: bare.toString('base64') });
    await page.locator('#qa-clear-lens-stage').evaluate(element => element.remove());
    assert.ok(optics.detailPreservation >= .45, `button obscures background detail: ${JSON.stringify(optics)}`);
    return optics;
  });

  await check('no external runtime asset requests', () => assert.deepEqual([...externalRequests], []));
  await check('no failed requests', () => assert.deepEqual(failedRequests, []));
  await check('no console or runtime errors', () => assert.deepEqual(errors, []));
} finally {
  const report = { baseURL, scope, timestamp: new Date().toISOString(), results, errors, failedRequests, externalRequests: [...externalRequests], passed: results.filter(result => result.pass).length, failed: results.filter(result => !result.pass).length };
  await fs.writeFile(path.join(output, scope === 'fonts' ? 'font-report.json' : 'report.json'), JSON.stringify(report, null, 2) + '\n');
  await browser.close();
  console.log(`Clear/type QA: ${report.passed} PASS / ${report.failed} FAIL`);
  process.exitCode = report.failed ? 1 : 0;
}
