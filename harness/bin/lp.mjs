#!/usr/bin/env node
/**
 * lp — LandingPage 하네스 CLI (결정적 단계만 담당. 기획 해석·카피·에셋 판단은 Claude 가 SKILL.md 를 따라 수행)
 *
 *   lp catalog                         섹션 프리셋·슬롯·글자수 규칙 요약 (Claude 가 스펙 작성 전 참조)
 *   lp assets "<키워드>" [--role icon|media] [--limit 8]   ODS 에셋 검색
 *   lp screens "<키워드>" [--limit 8]  스크린 디렉토리 화면 검색 (목업 섹션용) · lp screens sync 로 인덱스 재생성(네트워크 필요)
 *   lp validate <spec.json>            가이드 검증만 (JSON 리포트)
 *   lp build <spec.json> [--out dir] [--force]   compile → validate → render → out/<slug>/{page,preview}.html (--out 의 기존 산출물은 --force 로만 덮어씀)
 *   lp doctor                          환경 점검 (node·sharp·폰트 도구·playwright·design-assets·CDN 폴백)
 *   lp pack-assets [--out file.tgz]    design-assets 원본(480w·svg·adf)만 묶어 읽기 권한 없는 팀원에게 전달
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
import { searchScreens, syncScreens, loadScreens, screenCacheFile, screenImageUrl } from "../lib/screens.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const [cmd, ...rest] = process.argv.slice(2);
const flag = (n, d) => { const i = rest.indexOf(`--${n}`); return i >= 0 ? rest[i + 1] : d; };
const readSpec = (p) => JSON.parse(fs.readFileSync(p, "utf8"));

if (cmd === "screens") {
  if (rest[0] === "sync") { const n = await syncScreens(); console.log(`screens index: ${n} screens`); process.exit(0); }
  const q = rest.filter((x) => !x.startsWith("--") && rest[rest.indexOf(x) - 1] !== "--limit").join(" ");
  if (!q) { console.log(`index: ${loadScreens().length} screens`); process.exit(0); }
  for (const s of searchScreens(q, { limit: Number(flag("limit", 8)) })) console.log(`${String(s.score).padStart(5)}  ${s.id.padEnd(52)} ${s.title}  [${s.cat}]  ${screenCacheFile(s) ? "cached" : "not-cached"}  ${s.summary.slice(0, 50)}`);
  process.exit(0);
}
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
  if (!designAssetsRoot()) console.warn("⚠ design-assets 원본 없음 — CDN 폴백으로 에셋을 받습니다 (실패한 슬롯은 플레이스홀더). `lp doctor` 로 확인");
  const specPath = rest[0];
  const spec = readSpec(specPath);
  const { doc, assetLog, notes, where, breaks, cardChoices } = compileSpec(spec);
  const report = validateSpec(spec, { assetLog, notes, breaks, cardChoices });
  const { assemble } = await import("../lib/assemble.mjs");
  const { page, makePreview, stats, screenMisses = [], screenSources = [] } = await assemble(doc, { report, spec, assetLog });
  for (const s of screenSources) report.issues.push({ level: "info", where: `screen ${s.where}`, msg: `화면 이미지 출처: ${s.source === "loom" ? "Loom 플러그인 캡처" : s.source === "file" ? "지정 파일" : s.source === "cache" ? "로컬 캐시" : "스크린 디렉토리 다운로드"} — ${s.file}` });
  for (const m of screenMisses) report.issues.push({ level: "warn", where: `screen ${m.where}`, msg: `스크린 디렉토리 화면 이미지를 받지 못해 '화면 미정' placeholder — Loom 플러그인이 있으면 workbench_compile_check(shot:true) 로 찍은 PNG 를 screen.file 로 지정(~/Loom 의 .loom/shots 는 자동 탐색), 없으면 네트워크가 열린 곳에서 \`lp screens sync\` 후 재빌드하거나 ${m.url} 을 ~/.lp-draft/screens/ 에 저장` });
  const outDir = flag("out", path.join(here, "../out", doc.meta.slug));
  // --out 으로 지정한 임의 폴더의 기존 산출물은 --force 없이는 덮어쓰지 않는다 (기본 out/<slug>/ 는 하네스 전용 폴더라 예외)
  const isDefaultOut = path.resolve(outDir).startsWith(path.resolve(here, "../out") + path.sep);
  const existing = ["doc.json", "page.html", "preview.html", "report.json"].filter((f) => fs.existsSync(path.join(outDir, f)));
  if (!isDefaultOut && existing.length && !rest.includes("--force")) { console.error(`${outDir} 에 기존 산출물(${existing.join(", ")})이 있습니다 — 덮어쓰려면 --force`); process.exit(2); }
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
  const { cdnState } = await import("../lib/assets.mjs");
  if (cdnState.tried) {
    report.issues.push({ level: cdnState.fail ? "warn" : "info", where: "assets", msg: `design-assets 원본 없음 → CDN 폴백 ${cdnState.ok}개 성공${cdnState.fail ? `, ${cdnState.fail}개 실패(플레이스홀더)` : ""}` });
    for (const l of ["error", "warn", "info"]) report.summary[l] = report.issues.filter((i) => i.level === l).length;
  }
  for (const l of ["error", "warn", "info"]) report.summary[l] = report.issues.filter((i) => i.level === l).length;
  report.ok = report.summary.error === 0;
  const preview = makePreview(report);
  fs.writeFileSync(path.join(outDir, "preview.html"), preview);
  fs.writeFileSync(path.join(outDir, "report.json"), JSON.stringify({ ...report, assetLog }, null, 1));
  console.log(JSON.stringify({ outDir, ...stats, previewKB: Math.round(preview.length / 1024), summary: report.summary, ok: report.ok, cdnFallback: cdnState.tried ? cdnState : undefined }, null, 1));
  for (const i of report.issues.filter((i) => i.level !== "info")) console.log(`  [${i.level}] ${i.where} — ${i.msg}`);
} else if (cmd === "doctor") {
  const { execSync } = await import("node:child_process");
  const ok = (b) => (b ? "✓" : "✗");
  const tryRun = (c) => { try { return execSync(c, { stdio: ["ignore", "pipe", "ignore"] }).toString().trim(); } catch { return null; } };
  const root = designAssetsRoot();
  const lines = [];
  lines.push(`${ok(true)} node ${process.version}`);
  let sharpOk = false; try { await import("sharp"); sharpOk = true; } catch {}
  lines.push(`${ok(sharpOk)} sharp (에셋 변환)${sharpOk ? "" : " — npm install 필요"}`);
  const pyft = tryRun("pyftsubset --help >/dev/null 2>&1 && echo ok") || tryRun("python3 -c 'import fontTools,brotli;print(\"ok\")'");
  lines.push(`${ok(!!pyft)} fonttools+brotli (Pretendard 서브셋)${pyft ? "" : " — pip install fonttools brotli (없어도 빌드는 되지만 폰트가 시스템 폰트로 대체)"}`);
  const pw = tryRun("npm root -g") ; let pwOk = false; try { const { createRequire } = await import("node:module"); const r = createRequire((pw || "") + "/"); r("playwright"); pwOk = true; } catch { try { await import("playwright"); pwOk = true; } catch {} }
  lines.push(`${ok(pwOk)} playwright (렌더 QA)${pwOk ? "" : " — 없으면 --no-qa 로 빌드"}`);
  if (root) {
    const idx = JSON.parse(fs.readFileSync(path.join(here, "../catalog/ods-asset-index.json"), "utf8"));
    const have = idx.filter((a) => fs.existsSync(path.join(root, "assets", a.file))).length;
    const pct = Math.round((have / idx.length) * 100);
    lines.push(`${ok(pct >= 95)} design-assets 원본 (${root}) — 카탈로그 커버리지 ${have}/${idx.length} (${pct}%)${pct < 95 ? ` → 오래된 사본. git -C "${root}" pull 또는 팀원의 pack-assets 로 갱신` : ""}`);
  } else lines.push(`${ok(false)} design-assets 원본 — 없음 → CDN 폴백 사용`);
  const { findAsset } = await import("../lib/assets.mjs");
  const probe = findAsset("AssetBellLargeGenuineBlueView2");
  let cdn = null; try { const r = await fetch(`https://asset.ohousecdn.com/static/${probe.id}/image_480.webp`, { method: "HEAD", signal: AbortSignal.timeout(6000) }); cdn = r.ok; } catch { cdn = false; }
  lines.push(`${ok(cdn)} CDN 폴백 (asset.ohousecdn.com)${cdn ? "" : " — 접근 불가. 원본도 없으면 에셋이 플레이스홀더로 렌더"}`);
  lines.push(`${ok(fs.existsSync(path.join(here, "../.build/render.mjs")))} 렌더 번들 (없으면 첫 build 때 자동 생성)`);
  console.log(lines.join("\n"));
  if (!root && !cdn) { console.log("\n→ design-assets 읽기 권한이 없다면: ① #ai_frontier 에 bucketplace/design-assets 읽기 권한 요청 ② 권한 있는 팀원에게 `lp pack-assets` 결과(ods-assets-pack.tgz)를 받아 풀고 DESIGN_ASSETS_ROOT 로 지정"); }
} else if (cmd === "pack-assets") {
  const root = designAssetsRoot();
  if (!root) { console.error("design-assets 원본이 없어 묶을 수 없습니다"); process.exit(1); }
  const { spawnSync } = await import("node:child_process");
  const out = flag("out", path.resolve("ods-assets-pack.tgz"));
  // 셸을 거치지 않고 인자 배열로 실행 (경로에 셸 구문이 섞여도 명령으로 해석되지 않음)
  const r = spawnSync("tar", ["-czf", out, "-C", root, "--exclude=*_120w*", "--exclude=*_240w*", "--exclude=*_960w*", "--exclude=*_1440w*", "--exclude=*_1920w*", "--exclude=*.avif", "assets"], { stdio: "inherit" });
  if (r.status !== 0) { console.error("tar 실패"); process.exit(r.status ?? 1); }
  console.log(`${out} (${Math.round(fs.statSync(out).size / 1048576)} MB) — 받는 쪽: tar -xzf 후 DESIGN_ASSETS_ROOT=<풀린 폴더> 또는 ~/design-assets 에 배치`);
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
