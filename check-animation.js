import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log('--- Checking Sign In Aurora Animation ---');
  await page.goto('http://localhost:4321/signin/');
  await page.waitForTimeout(2000);

  const auroraFrame1 = await page.evaluate(() => {
    const canvas = document.querySelector('.aurora-container canvas');
    return canvas ? canvas.toDataURL() : null;
  });

  await page.waitForTimeout(1000);

  const auroraFrame2 = await page.evaluate(() => {
    const canvas = document.querySelector('.aurora-container canvas');
    return canvas ? canvas.toDataURL() : null;
  });

  console.log('Aurora Frame 1 Length:', auroraFrame1 ? auroraFrame1.length : 0);
  console.log('Aurora Frame 2 Length:', auroraFrame2 ? auroraFrame2.length : 0);
  console.log('Aurora Animating (Frames Different):', auroraFrame1 !== auroraFrame2);

  console.log('--- Checking Homepage Beams Animation ---');
  await page.goto('http://localhost:4321/');
  await page.waitForTimeout(2000);

  const beamsFrame1 = await page.evaluate(() => {
    const canvas = document.querySelector('.beams-container canvas');
    return canvas ? canvas.toDataURL() : null;
  });

  await page.waitForTimeout(1000);

  const beamsFrame2 = await page.evaluate(() => {
    const canvas = document.querySelector('.beams-container canvas');
    return canvas ? canvas.toDataURL() : null;
  });

  console.log('Beams Frame 1 Length:', beamsFrame1 ? beamsFrame1.length : 0);
  console.log('Beams Frame 2 Length:', beamsFrame2 ? beamsFrame2.length : 0);
  console.log('Beams Animating (Frames Different):', beamsFrame1 !== beamsFrame2);

  await browser.close();
})();
