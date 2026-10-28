#!/usr/bin/env node
/**
 * lp — LandingPage 하네스 CLI (결정적 단계만 담당. 기획 해석·카피·에셋 판단은 Claude 가 SKILL.md 를 따라 수행)
 *
 *   lp catalog                         섹션 프리셋·슬롯·글자수 규칙 요약 (Claude 가 스펙 작성 전 참조)
 *   lp assets "<키워드>" [--role icon|media] [--limit 8]   ODS 에셋 검색
 *   lp validate <spec.json>            가이드 검증만 (JSON 리포트)
 *   lp build <spec.json> [--out dir]   compile → validate → render → out/<slug>/{page,preview}.html
 *   lp sheet <out/slug>                 선택된 에셋 컨택트시트(PNG) — 톤 일관성 육안 검수용
 *   lp gen-import --name <이름> [--url <figma image.url>] [--file <미리보기 경로>] [--slug <slug>]
 *                                      Figma AI 생성 이미지 → 배경 제거·480px 정규화 → spec 에 넣을 file 경로 출력
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compileSpec, PRESET_RULES, USAGE_RULES } from "../lib/compile.mjs";
import { validateSpec, LIMITS, BANNED } from "../lib/validate.mjs";
import { searchAssets, designAssetsRoot } from "../lib/assets.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const [cmd, ...rest] = process.argv.slice(2);
const flag = (n, d) => { const i = rest.indexOf(`--${n}`); return i >= 0 ? rest[i + 1] : d; };
const readSpec = (p) => JSON.parse(fs.readFileSync(p, "utf8"));

if (cmd === "catalog") {
  const out = { titleLayout: { required: true, options: { center: "[타이틀] [에셋] 중앙 정렬 (히어로 세로 스택, 섹션 타이틀·카드 중앙)", split: "[타이틀] [에셋] 일렬 정렬 (히어로 좌 텍스트/우 에셋, 섹션 타이틀 좌측)" }, rule: "페이지당 하나, 섹션별 변경 불가" }, presets: {}, limits: LIMITS, banned: BANNED };
  for (const [k, r] of Object.entries(PRESET_RULES)) out.presets[k] = { card: r.usage, allowedCards: r.allowedUsages, cardTypes: r.cardTypes, layouts: Object.keys(r.layouts), defaultLayout: r.defaultLayout, items: r.count, recommended: r.recommended };
  out.cardVariants = { linkcard: "그룹 제목 + 더보기 + 링크 행(액션: download|audio|link|arrow) — items[].links[] 있으면 자동", pillcard: "아이콘 + ≤14자 제목 한 줄 — usp 에서 설명 없는 짧은 혜택이면 자동", kvcard: "레일 + '라벨: 값' 행 — table 단일 카드에 단위 값이면 자동 (rail:false 로 레일 끔)", stepcard: "아이콘 + 제목 + 보조문 세로 단계 — process ≥5단계/아이콘만/layout:list, usp 안내형이면 자동" };
  console.log(JSON.stringify(out, null, 1));
} else if (cmd === "assets") {
  const q = rest.filter((x, i) => !x.startsWith("--") && !rest[i - 1]?.startsWith("--")).join(" ");
  const res = searchAssets(q, { role: flag("role", "media"), limit: Number(flag("limit", 8)) });
  for (const a of res) console.log(`${String(a.score).padStart(4)}  ${a.id.padEnd(48)} ${a.kind.padEnd(5)} ${a.keywords.slice(0, 8).join(", ")}`);
  if (!res.length) console.log("(결과 없음 → 생성형 이미지 대상)");
} else if (cmd === "validate") {
  const spec = readSpec(rest[0]);
  const { assetLog, notes, breaks, cardChoices } = compileSpec(spec);
  console.log(JSON.stringify(validateSpec(spec, { assetLog, notes, breaks, cardChoices }), null, 1));
} else if (cmd === "build") {
  if (!designAssetsRoot()) console.warn("⚠ design-assets 원본 없음 — 에셋이 플레이스홀더로 표시됩니다 (README 'ODS 에셋 원본' 참고)");
  const specPath = rest[0];
  const spec = readSpec(specPath);
  const { doc, assetLog, notes, where, breaks, cardChoices } = compileSpec(spec);
  const report = validateSpec(spec, { assetLog, notes, breaks, cardChoices });
  const { assemble } = await import("../lib/assemble.mjs");
  const { page, makePreview, stats } = await assemble(doc, { report, spec, assetLog });
  const outDir = flag("out", path.join(here, "../out", doc.meta.slug));
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "doc.json"), JSON.stringify(doc, null, 1));
  fs.writeFileSync(path.join(outDir, "page.html"), page);
  // 렌더 QA (실 브라우저 3폭) → 리포트 병합
  if (!rest.includes("--no-qa")) {
    const { renderQa } = await import("../lib/render-qa.mjs");
    const qa = await renderQa(path.join(outDir, "page.html"), { where, screenshots: rest.includes("--shots") ? path.join(outDir, "shot") : null });
    report.issues.push(...qa.issues);
    for (const l of ["error", "warn", "info"]) report.summary[l] = report.issues.filter((i) => i.level === l).length;
    report.ok = report.summary.error === 0;
  }
  const preview = makePreview(report);
  fs.writeFileSync(path.join(outDir, "preview.html"), preview);
  fs.writeFileSync(path.join(outDir, "report.json"), JSON.stringify({ ...report, assetLog }, null, 1));
  console.log(JSON.stringify({ outDir, ...stats, previewKB: Math.round(preview.length / 1024), summary: report.summary, ok: report.ok }, null, 1));
  for (const i of report.issues.filter((i) => i.level !== "info")) console.log(`  [${i.level}] ${i.where} — ${i.msg}`);
} else if (cmd === "sheet") {
  const dir = rest[0];
  const rep = JSON.parse(fs.readFileSync(path.join(dir, "report.json"), "utf8"));
  const { toDataUri } = await import("../lib/assets.mjs");
  const sharp = (await import("sharp")).default;
  const tiles = [];
  for (const a of rep.assetLog.filter((x) => x.id || x.file)) {
    const uri = await toDataUri(a.id || a.file, { width: 200 });
    if (!uri) continue;
    const buf = Buffer.from(uri.split(",")[1], "base64");
    const label = `${a.where.replace(/^sections/, "s")}\n${(a.id || "generated").replace(/^Asset/, "")}`.slice(0, 80);
    const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="220" height="40"><text x="4" y="14" font-size="11" font-family="sans-serif">${label.split("\n")[0]}</text><text x="4" y="30" font-size="10" fill="#666" font-family="sans-serif">${label.split("\n")[1] || ""}</text></svg>`);
    const tile = await sharp({ create: { width: 220, height: 260, channels: 4, background: "#F5F5F5" } })
      .composite([{ input: await sharp(buf).resize(180, 180, { fit: "contain", background: "#0000" }).png().toBuffer(), top: 14, left: 20 }, { input: svg, top: 214, left: 0 }]).png().toBuffer();
    tiles.push(tile);
  }
  const cols = 6, rows = Math.ceil(tiles.length / cols);
  const out = path.join(dir, "asset-sheet.png");
  await sharp({ create: { width: cols * 224, height: rows * 264, channels: 4, background: "#FFFFFF" } })
    .composite(tiles.map((t, i) => ({ input: t, left: (i % cols) * 224, top: Math.floor(i / cols) * 264 }))).png().toFile(out);
  console.log(out);
} else if (cmd === "gen-import") {
  const { importGenerated } = await import("../lib/gen.mjs");
  const name = flag("name", `gen-${Date.now()}`);
  const outDir = path.join(here, "../out", flag("slug", "_gen"), "gen");
  const r = await importGenerated({ url: flag("url"), file: flag("file"), name, outDir });
  console.log(JSON.stringify(r, null, 1));
  if (r.origin !== "full-res") console.log("※ 풀해상도 다운로드 불가 → 미리보기(" + r.sourceSize + "px)로 대체. figma.com 을 허용 도메인에 추가하면 원본을 씁니다.");
} else {
  console.log(fs.readFileSync(fileURLToPath(import.meta.url), "utf8").split("*/")[0]);
}
