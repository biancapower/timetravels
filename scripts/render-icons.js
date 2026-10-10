// Renders the app icon's PNG sizes from its SVG sources with Playwright's
// Chromium. Run after changing public/icons/icon.svg or maskable.svg:
//   node scripts/render-icons.js
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';

const dir = new URL('../public/icons/', import.meta.url);
const read = (name) => readFileSync(new URL(name, dir), 'utf8');
const square = (svg) => svg.replace(/ rx="\d+"/, '');

const outputs = [
  [read('icon.svg'), 192, 'icon-192.png'],
  [read('icon.svg'), 512, 'icon-512.png'],
  [read('maskable.svg'), 512, 'maskable-512.png'],
  [square(read('icon.svg')), 180, 'apple-touch-icon.png'],
];

const browser = await chromium.launch();
const page = await browser.newPage();
for (const [svg, size, name] of outputs) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<body style="margin:0">${svg.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body>`,
  );
  await page.screenshot({
    path: new URL(name, dir).pathname,
    omitBackground: true,
  });
}
await browser.close();
