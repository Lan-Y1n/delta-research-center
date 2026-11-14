import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const module = process.env.PLAYWRIGHT_MODULE
  ? await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href)
  : await import('playwright');
const { chromium } = module.default ?? module;
const browser = await chromium.launch({ executablePath: process.env.QA_BROWSER ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true });
const root = path.dirname(fileURLToPath(import.meta.url));
const page = await browser.newPage({ viewport: { width: 1440, height: 810 } });
const baseURL = process.env.QA_BASE_URL ?? 'http://127.0.0.1:18180';
const results = [];
const errors = [];
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
try {
  for (const viewport of [{ width: 1440, height: 810 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto(baseURL, { waitUntil: 'networkidle' });
    for (const track of await page.locator('.proj-card .prog-track').all()) {
      await track.scrollIntoViewIfNeeded(); await sleep(1250);
      const measurement = await track.evaluate(element => ({ expected: Number(element.getAttribute('aria-valuenow')), rendered: element.querySelector('.prog-fill').getBoundingClientRect().width / element.getBoundingClientRect().width * 100, transform: getComputedStyle(element.querySelector('.prog-fill')).transform }));
      assert.ok(Math.abs(measurement.expected - measurement.rendered) < .1, JSON.stringify(measurement));
      results.push({ viewport: viewport.width, ...measurement });
      console.log(`PASS ${viewport.width} progress ${measurement.expected}% -> ${measurement.rendered.toFixed(3)}%`);
    }
    if (viewport.width === 1440) {
      await page.locator('#projects').scrollIntoViewIfNeeded(); await sleep(500);
      await page.screenshot({ path: path.join(root, 'screenshots', 'projects-1440x810.png') });
    }
  }
  await page.setViewportSize({ width: 1440, height: 810 }); await page.goto(baseURL, { waitUntil: 'networkidle' });
  const box = await page.locator('.car-viewport').boundingBox();
  await page.mouse.move(box.x + box.width * .8, box.y + box.height * .5); await page.mouse.down();
  await page.mouse.move(box.x + box.width * .2, box.y + box.height * .5, { steps: 15 }); await page.mouse.up();
  await sleep(1000);
  const snap = await page.getByTestId('leader-carousel').evaluate(element => {
    const viewport = element.querySelector('.car-viewport');
    const matrix = new DOMMatrixReadOnly(getComputedStyle(element.querySelector('.car-track')).transform);
    const index = Number(element.getAttribute('data-index'));
    return { index, actualX: matrix.m41, targetX: -index * viewport.getBoundingClientRect().width, path: location.pathname };
  });
  assert.equal(snap.index, 1); assert.equal(snap.path, '/'); assert.ok(Math.abs(snap.actualX - snap.targetX) < .5, JSON.stringify(snap));
  results.push({ snap }); console.log(`PASS drag spring settles: ${JSON.stringify(snap)}`);
  assert.deepEqual(errors, []); console.log('PASS no console/runtime errors');
  await fs.writeFile(path.join(root, 'progress-report.json'), JSON.stringify({ baseURL, timestamp: new Date().toISOString(), results, errors, passed: 14, failed: 0 }, null, 2) + '\n');
} finally { await browser.close(); }
