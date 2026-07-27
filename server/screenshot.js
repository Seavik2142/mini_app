const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 812, isMobile: true });
  await page.goto('https://mini-app-mzu6.onrender.com/admin/index.html', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: '/Users/ahzarjy/.gemini/antigravity-cli/brain/666770b5-31be-48a0-a657-e40985c150ef/scratch/mobile-admin.png', fullPage: true });
  await page.goto('https://mini-app-mzu6.onrender.com/admin/products.html', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: '/Users/ahzarjy/.gemini/antigravity-cli/brain/666770b5-31be-48a0-a657-e40985c150ef/scratch/mobile-products.png', fullPage: true });
  await browser.close();
})();
