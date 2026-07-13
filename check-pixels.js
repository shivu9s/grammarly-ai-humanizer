import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log('--- Checking /signin/ Aurora Canvas pixels ---');
  await page.goto('http://localhost:4321/signin/');
  await page.waitForTimeout(3000);

  const signinData = await page.evaluate(() => {
    const canvas = document.querySelector('.aurora-container canvas');
    if (!canvas) return 'Canvas not found';
    try {
      return {
        dataUrl: canvas.toDataURL().substring(0, 150),
        dataUrlLength: canvas.toDataURL().length
      };
    } catch (e) {
      return { error: e.message };
    }
  });
  console.log('Aurora:', signinData);

  console.log('--- Checking Homepage Beams Canvas pixels ---');
  await page.goto('http://localhost:4321/');
  await page.waitForTimeout(3000);

  const homeData = await page.evaluate(() => {
    const canvas = document.querySelector('.beams-container canvas');
    if (!canvas) return 'Canvas not found';
    try {
      return {
        dataUrl: canvas.toDataURL().substring(0, 150),
        dataUrlLength: canvas.toDataURL().length
      };
    } catch (e) {
      return { error: e.message };
    }
  });
  console.log('Beams:', homeData);

  await browser.close();
})();
