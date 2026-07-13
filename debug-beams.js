import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.error('BROWSER ERROR:', err));

  console.log('--- Navigating to homepage ---');
  await page.goto('http://localhost:4321/');
  await page.waitForTimeout(3000);

  const data = await page.evaluate(() => {
    const main = document.querySelector('main');
    const hero = document.querySelector('section');
    const canvas = document.querySelectorAll('canvas');
    return {
      mainHtml: main ? main.innerHTML.substring(0, 1000) : 'Main not found',
      heroHtml: hero ? hero.outerHTML.substring(0, 1000) : 'Hero not found',
      canvasCount: canvas.length,
      canvasDetails: Array.from(canvas).map(c => ({
        className: c.className,
        parentClass: c.parentElement ? c.parentElement.className : null,
        rect: c.getBoundingClientRect()
      }))
    };
  });

  console.log(JSON.stringify(data, null, 2));
  await browser.close();
})();
