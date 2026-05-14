import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.waitForTimeout(500);

// open section add menu
await page.getByText("+ 섹션 추가").click();
await page.waitForTimeout(400);
await page.screenshot({ path: "/tmp/admin-add-menu.png", fullPage: false });
console.log("saved /tmp/admin-add-menu.png");

// click marketing USP row (dropdown appears after tree rows in DOM — use last match)
await page.getByText("USP 카드", { exact: true }).last().click();
await page.waitForTimeout(500);
await page.screenshot({ path: "/tmp/admin-with-lead-usp.png", fullPage: false });
console.log("saved /tmp/admin-with-lead-usp.png");

// add marketing hero — open menu again
await page.getByText("+ 섹션 추가").click();
await page.waitForTimeout(300);
await page.getByText("히어로", { exact: true }).last().click();
await page.waitForTimeout(500);
await page.screenshot({ path: "/tmp/admin-with-lead-hero.png", fullPage: false });
console.log("saved /tmp/admin-with-lead-hero.png");

await browser.close();
