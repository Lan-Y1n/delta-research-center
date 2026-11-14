import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const module = process.env.PLAYWRIGHT_MODULE
  ? await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href)
  : await import('playwright');
const { chromium } = module.default ?? module;
const browser = await chromium.launch({ executablePath: process.env.QA_BROWSER ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 810 } });
const page = await context.newPage();
const output = path.join(path.dirname(fileURLToPath(import.meta.url)), 'screenshots');
const baseURL = process.env.QA_BASE_URL ?? 'http://127.0.0.1:18180';
await fs.mkdir(output, { recursive: true });
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
try {
  for (const [route, name] of [['/field/physics', 'field-physics'], ['/field/armed-forces', 'field-armed-forces'], ['/leader/redact-chem', 'leader-redacted'], ['/cooperation', 'cooperation']]) {
    await page.goto(baseURL + route, { waitUntil: 'networkidle' });
    await page.locator('main h1').waitFor();
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < height; y += 500) { await page.evaluate(value => window.scrollTo(0, value), y); await sleep(150); }
    await page.evaluate(() => window.scrollTo(0, 0)); await sleep(850);
    await page.screenshot({ path: path.join(output, `${name}-1440.png`), fullPage: true });
    console.log(`Captured ${name}-1440.png`);
  }
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await page.locator('#projects').scrollIntoViewIfNeeded(); await sleep(1000);
  await page.screenshot({ path: path.join(output, 'projects-1440x810.png'), fullPage: false });
  console.log('Captured projects-1440x810.png');
} finally { await browser.close(); }
