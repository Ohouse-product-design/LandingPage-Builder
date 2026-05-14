import { chromium } from "playwright";

const URL = "http://localhost:3000/lead";
const viewports = [
  { name: "mobile-375", width: 375, height: 800 },
  { name: "tablet-768", width: 768, height: 900 },
  { name: "desktop-1024", width: 1024, height: 900 },
];

const browser = await chromium.launch();
for (const vp of viewports) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `/tmp/lead-${vp.name}.png`, fullPage: true });
  console.log(`saved /tmp/lead-${vp.name}.png`);
  await ctx.close();
}
await browser.close();
