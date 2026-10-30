// 렌더 검수용 스크린샷: node bin/shot.mjs <page.html> <outPrefix>
import { createRequire } from "node:module";
import { execSync } from "node:child_process";
// 시스템에 설치된 playwright(브라우저 포함)를 우선 사용, 없으면 로컬 패키지
let pw;
try { pw = createRequire(execSync("npm root -g").toString().trim() + "/")("playwright"); await pw.chromium.launch().then((b) => b.close()); }
catch { pw = await import("playwright"); }
const { chromium } = pw;
import path from "node:path";
const [file, prefix] = process.argv.slice(2);
const b = await chromium.launch();
for (const [vp, w] of [["mobile", 375], ["tablet", 768], ["desktop", 1280]]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  await p.addInitScript(() => { window.__LP_NO_REVEAL = true; });
  await p.goto("file://" + path.resolve(file));
  await p.waitForTimeout(300);
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  const broken = await p.evaluate(() => [...document.images].filter((i) => i.offsetParent && (!i.complete || !i.naturalWidth)).length);
  await p.screenshot({ path: `${prefix}-${vp}.png`, fullPage: true });
  console.log(vp, { overflowPx: overflow, brokenImages: broken, height: await p.evaluate(() => document.body.scrollHeight) });
}
await b.close();
