/**
 * 렌더 QA — 실제 브라우저(375/768/1280)에서 page.html 을 열어
 *  - 말줄임/line-clamp 로 잘린 텍스트 (글자수는 통과해도 폭 때문에 잘리는 경우)
 *  - 가로 스크롤 발생, 깨진 이미지
 * 를 섹션·아이템 단위로 찾아 spec 경로로 되돌려준다.
 */
import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import path from "node:path";

async function chromium() {
  try { const pw = createRequire(execSync("npm root -g").toString().trim() + "/")("playwright"); const b = await pw.chromium.launch(); return b; }
  catch { const pw = await import("playwright"); return pw.chromium.launch(); }
}

export async function renderQa(pageFile, { where = {}, screenshots = null } = {}) {
  const issues = [];
  let browser;
  try { browser = await chromium(); } catch (e) { return { issues: [{ level: "info", where: "render-qa", msg: `브라우저 실행 불가 — 렌더 QA 생략 (${e.message.split("\n")[0]})` }] }; }
  for (const [vp, w] of [["mobile", 375], ["tablet", 768], ["desktop", 1280]]) {
    const p = await browser.newPage({ viewport: { width: w, height: 900 } });
    await p.goto("file://" + path.resolve(pageFile));
    await p.waitForTimeout(250);
    const r = await p.evaluate((vp) => {
      const root = document.querySelector(`.lp-vp-${vp}`);
      const out = { overflow: document.documentElement.scrollWidth - innerWidth, broken: 0, cut: [] };
      out.broken = [...root.querySelectorAll("img")].filter((i) => i.getClientRects().length && (!i.complete || !i.naturalWidth)).length;
      for (const el of root.querySelectorAll("h1,h2,h3,h4,p,span,div")) {
        if (el.children.length && [...el.children].some((c) => c.tagName !== "BR" && c.tagName !== "STRONG" && c.tagName !== "B")) continue;
        const cs = getComputedStyle(el);
        const clamp = cs.webkitLineClamp && cs.webkitLineClamp !== "none";
        const ell = cs.textOverflow === "ellipsis";
        if (!clamp && !ell) continue;
        if (el.closest("[aria-hidden=true]")) continue;
        const cutX = ell && el.scrollWidth > el.clientWidth + 1;
        const cutY = clamp && el.scrollHeight > el.clientHeight + 1;
        if (!cutX && !cutY) continue;
        // marquee 캐러셀은 같은 카드가 2번 렌더되므로 중복 제거
        const sec = el.closest("section[data-section-id]");
        const cell = el.closest("[data-cell-id]");
        out.cut.push({ sec: sec?.dataset.sectionId, text: el.textContent.trim().slice(0, 40), lines: cutY ? +cs.webkitLineClamp : 1 });
      }
      return out;
    }, vp);
    if (r.overflow > 0) issues.push({ level: "error", where: `render@${vp}`, msg: `가로 스크롤 ${r.overflow}px 발생` });
    if (r.broken) issues.push({ level: "error", where: `render@${vp}`, msg: `깨진 이미지 ${r.broken}개` });
    const seen = new Set();
    for (const c of r.cut) {
      const k = c.sec + c.text;
      if (seen.has(k)) continue;
      seen.add(k);
      issues.push({ level: "warn", where: `${where[c.sec] || c.sec} @${vp}`, msg: `실제 폭에서 잘림: "${c.text}${c.text.length >= 40 ? "…" : ""}" (${c.lines}줄 제한)`, fix: "문장을 줄이거나 핵심어를 앞으로" });
    }
    if (screenshots) await p.screenshot({ path: `${screenshots}-${vp}.png`, fullPage: true });
    await p.close();
  }
  await browser.close();
  return { issues };
}
