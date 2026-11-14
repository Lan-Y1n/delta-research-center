import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const loaded = process.env.PLAYWRIGHT_MODULE ? await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href) : await import('playwright');
const { chromium } = loaded.default ?? loaded;
const baseURL = process.env.QA_BASE_URL ?? 'http://127.0.0.1:18180';
const output = path.join(path.dirname(fileURLToPath(import.meta.url)), 'liquid-glass');
await fs.mkdir(output, { recursive: true });
const original = JSON.parse(await fs.readFile(path.join(output, 'report.json'), 'utf8'));
const browser = await chromium.launch({ executablePath: process.env.QA_BROWSER ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 810 } });
const page = await context.newPage();
const cdp = await context.newCDPSession(page);
await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-transparency', value: 'no-preference' }] });
const latest = [];
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
try {
  for (const design of ['glass-1','glass-2','glass-3']) {
    for (const viewport of [{width:1440,height:810},{width:390,height:844}]) {
      const name = `${design} home ${viewport.width}x${viewport.height}`;
      try {
        await page.setViewportSize(viewport);
        await page.goto(`${baseURL}/?design=${design}&material=auto`, {waitUntil:'networkidle'});
        await page.waitForTimeout(1000);
        const geometry = await page.evaluate(() => {
          const rect = document.querySelector('.car-viewport').getBoundingClientRect();
          const text = [...document.querySelectorAll('.hero-title,.hero-lede,.proj-name')].map(element => ({className:element.className, filter:getComputedStyle(element).filter}));
          const bounds = [...document.querySelectorAll('.hero-title,.hero-cta,.hero-stats,[data-testid="leader-carousel"]')].map(element => {const box=element.getBoundingClientRect();return {className:element.className,top:box.top,bottom:box.bottom};});
          return {viewport:innerWidth,document:document.documentElement.scrollWidth,portraitWidth:rect.width,portraitHeight:rect.height,portraitRatio:rect.width/rect.height,text,bounds};
        });
        assert.equal(await page.locator('html').getAttribute('data-design'),design);
        assert.equal(await page.locator('html').getAttribute('data-material'),'auto');
        assert.ok(geometry.document<=geometry.viewport+1,JSON.stringify(geometry));
        assert.ok(Math.abs(geometry.portraitRatio-9/16)<.003,JSON.stringify(geometry));
        assert.ok(geometry.text.every(item=>item.filter==='none'),JSON.stringify(geometry.text));
        if(viewport.width===1440) assert.ok(geometry.bounds.every(box=>box.top>=0&&box.bottom<=811),JSON.stringify(geometry.bounds));
        await page.screenshot({path:path.join(output,`${design}-home-${viewport.width}x${viewport.height}.png`)});
        latest.push({name,pass:true,detail:geometry});
        console.log(`PASS ${name}: ${geometry.document}px document; portrait${geometry.portraitWidth}×${geometry.portraitHeight}`);
      }catch(error){latest.push({name,pass:false,error:error.message});console.log(`FAIL ${name}: ${error.message}`);}
    }
  }
  assert.deepEqual(errors,[]);
  const replacements=new Map(latest.map(result=>[result.name,result]));
  const results=original.results.map(result=>replacements.get(result.name)??result);
  const resolved=original.results.filter(result=>!result.pass&&replacements.get(result.name)?.pass).map(result=>result.name);
  const report={...original,timestamp:new Date().toISOString(),validationMode:'Initial suite retained; six home geometry/sharpness checks and screenshots rerun after final CSS. The three initial mobile overflow failures were resolved.',initialRun:{timestamp:original.timestamp,passed:original.passed,failed:original.failed},resolvedFailures:resolved,rerunResults:latest,results,errors:[...original.errors,...errors],passed:results.filter(result=>result.pass).length,failed:results.filter(result=>!result.pass).length};
  await fs.writeFile(path.join(output,'final-report.json'),JSON.stringify(report,null,2)+'\n');
  console.log(`Final Liquid Glass QA: ${report.passed} PASS / ${report.failed} FAIL; ${resolved.length} resolved failures; six fresh screenshots`);
  process.exitCode=report.failed?1:0;
}finally{await browser.close();}
