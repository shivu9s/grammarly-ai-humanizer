import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.error('BROWSER ERROR:', err));

  console.log('--- Checking /signin/ ---');
  await page.goto('http://localhost:4321/signin/');
  await page.waitForTimeout(3000);

  const signinData = await page.evaluate(() => {
    const container = document.querySelector('.aurora-container');
    const canvas = document.querySelector('.aurora-container canvas');
    return {
      containerFound: !!container,
      containerRect: container ? container.getBoundingClientRect() : null,
      containerOffsetWidth: container ? container.offsetWidth : null,
      containerOffsetHeight: container ? container.offsetHeight : null,
      canvasFound: !!canvas,
      canvasRect: canvas ? canvas.getBoundingClientRect() : null,
      canvasWidthAttr: canvas ? canvas.getAttribute('width') : null,
      canvasHeightAttr: canvas ? canvas.getAttribute('height') : null
    };
  });

  console.log(JSON.stringify(signinData, null, 2));

  console.log('--- Checking Homepage ---');
  await page.goto('http://localhost:4321/');
  await page.waitForTimeout(3000);

  const homeData = await page.evaluate(() => {
    const container = document.querySelector('.beams-container');
    const canvas = document.querySelector('.beams-container canvas');
    return {
      containerFound: !!container,
      containerRect: container ? container.getBoundingClientRect() : null,
      containerOffsetWidth: container ? container.offsetWidth : null,
      containerOffsetHeight: container ? container.offsetHeight : null,
      canvasFound: !!canvas,
      canvasRect: canvas ? canvas.getBoundingClientRect() : null,
      canvasWidthAttr: canvas ? canvas.getAttribute('width') : null,
      canvasHeightAttr: canvas ? canvas.getAttribute('height') : null
    };
  });

  console.log(JSON.stringify(homeData, null, 2));

  await browser.close();
})();
