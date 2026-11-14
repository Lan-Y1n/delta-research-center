import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const output = path.dirname(fileURLToPath(import.meta.url));
const app = path.resolve(output, '../..');
const modulePath = process.env.PLAYWRIGHT_MODULE ?? 'I:/PVE/.delta-qa-runtime/node_modules/playwright/index.mjs';
const { chromium } = await import(pathToFileURL(modulePath).href);
const css = await fs.readFile(path.join(app, 'src/styles/glass-material.css'), 'utf8');
const source = await fs.readFile(path.join(app, 'src/components/design/GlassEnvironment.tsx'), 'utf8');
const mapFunction = source.slice(source.indexOf('function makeRefractionMap'), source.indexOf('export default'));
const browser = await chromium.launch({ executablePath: process.env.QA_BROWSER ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const results = [];
const report = {
  timestamp: new Date().toISOString(),
  scope: 'Isolated renderer probe of the actual material stylesheet and displacement-map generator; separate from app route QA.',
  sourceFiles: ['src/styles/glass-material.css', 'src/components/design/GlassEnvironment.tsx'],
  preferenceCombinations: [],
  optical: null,
  browser: '',
  passed: 0,
  failed: 0,
};
try {
  const page = await browser.newPage({ viewport: { width: 800, height: 500 } });
  const session = await page.context().newCDPSession(page);
  report.browser = await page.evaluate(() => navigator.userAgent);
  await page.setContent(`<!doctype html><html data-design="glass-1" data-material="auto"><style>${css}</style><div class="proj-card">Sharp foreground</div></html>`);
  for (const preference of ['no-preference', 'reduce']) {
    await session.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-transparency', value: preference }] });
    for (const material of ['auto', 'glass', 'solid']) {
      await page.evaluate(value => { document.documentElement.dataset.material = value; }, material);
      const actual = await page.locator('.proj-card').evaluate(element => ({
        foregroundFilter: getComputedStyle(element).filter,
        backdrop: getComputedStyle(element).backdropFilter,
        background: getComputedStyle(element).backgroundColor,
        edgeOpacity: getComputedStyle(element, '::after').opacity,
        edgeFilter: getComputedStyle(element, '::after').backdropFilter,
      }));
      const shouldBeGlass = material === 'glass' || material === 'auto' && preference === 'no-preference';
      assert.equal(actual.foregroundFilter, 'none');
      assert.equal(actual.backdrop.includes('blur('), shouldBeGlass);
      assert.equal(actual.edgeFilter.includes('liquid-refraction'), shouldBeGlass);
      if (!shouldBeGlass) assert.equal(actual.edgeOpacity, '0');
      report.preferenceCombinations.push({ preference, material, pass: true, ...actual });
      results.push(true);
    }
  }

  await page.setContent(`<!doctype html><html data-design="glass-1" data-material="glass"><style>
    *{box-sizing:border-box}body{margin:0;background:repeating-linear-gradient(75deg,#102080 0 24px,#2a7280 24px 48px);height:500px}
    .proj-card{position:absolute;left:160px;top:100px;width:400px;height:240px;border-radius:30px;display:grid;place-items:center;color:white;font:700 32px Arial}
    ${css}</style><svg width="0" height="0"><defs><filter id="liquid-refraction" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feImage id="map" x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="liquid-map"/><feDisplacementMap in="SourceGraphic" in2="liquid-map" scale="18" xChannelSelector="R" yChannelSelector="G"/></filter></defs></svg><div class="proj-card"><span>SHARP FOREGROUND</span></div></html>`);
  await page.addScriptTag({ content: `${mapFunction}document.getElementById('map').setAttribute('href',makeRefractionMap());` });
  await page.waitForTimeout(300);
  const refracted = await page.locator('.proj-card').screenshot();
  await fs.writeFile(path.join(output, 'material-edge-refraction.png'), refracted);
  await page.addStyleTag({ content: '.proj-card::after{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}' });
  await page.waitForTimeout(300);
  const normal = await page.locator('.proj-card').screenshot();
  await fs.writeFile(path.join(output, 'material-no-refraction.png'), normal);

  const pixels = await page.evaluate(async ({ a, b }) => {
    const decode = async value => {
      const image = new Image();
      image.src = `data:image/png;base64,${value}`;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0);
      return context.getImageData(0, 0, canvas.width, canvas.height);
    };
    const first = await decode(a), second = await decode(b);
    let changed = 0, centerChanged = 0;
    for (let index = 0; index < first.data.length; index += 4) {
      const x = index / 4 % first.width, y = Math.floor(index / 4 / first.width);
      if (first.data[index] !== second.data[index] || first.data[index + 1] !== second.data[index + 1] || first.data[index + 2] !== second.data[index + 2]) {
        changed += 1;
        if (x > 12 && x < first.width - 12 && y > 12 && y < first.height - 12) centerChanged += 1;
      }
    }
    return { changedPixels: changed, changedCenterPixels: centerChanged, width: first.width, height: first.height, centerInset: 12 };
  }, { a: refracted.toString('base64'), b: normal.toString('base64') });
  assert.ok(pixels.changedPixels > 100, 'Displacement must change visible backdrop pixels.');
  assert.ok(pixels.changedCenterPixels <= 2, 'The inner content region must remain unchanged apart from compositor rounding.');
  report.optical = {
    pass: true,
    ...pixels,
    maskWidth: '5px',
    before: 'material-no-refraction.png',
    after: 'material-edge-refraction.png',
    note: 'Only the perimeter pseudo-element displacement filter is toggled; base backdrop blur and all foreground content remain identical. Tiny antialias/compositor differences are reported rather than hidden.',
  };
  results.push(true);
  report.passed = results.length;
} catch (error) {
  report.failed = 1;
  report.error = error.message;
  process.exitCode = 1;
} finally {
  await fs.mkdir(output, { recursive: true });
  await fs.writeFile(path.join(output, 'optical-probe-report.json'), JSON.stringify(report, null, 2));
  await browser.close();
}
console.log(JSON.stringify(report));
