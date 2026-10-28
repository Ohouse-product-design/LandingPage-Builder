#!/usr/bin/env node
/**
 * design-assets(.adf.jsonc) → harness/catalog/ods-asset-index.json
 * usage: node harness/bin/build-asset-index.mjs <design-assets-root>
 * 각 에셋의 이름·키워드·설명·480w 파일 경로를 모아 자연어 검색용 인덱스를 만든다.
 */
import fs from "node:fs";
import path from "node:path";
const root = process.argv[2] || process.env.DESIGN_ASSETS_ROOT;
if (!root) { console.error("design-assets 경로를 넘겨주세요"); process.exit(1); }
const stripJsonc = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'])\/\/.*$/gm, "$1").replace(/,(\s*[}\]])/g, "$1");
const dir = path.join(root, "assets");
const out = [];
for (const slug of fs.readdirSync(dir)) {
  const d = path.join(dir, slug);
  const adf = fs.readdirSync(d).find((f) => f.endsWith(".adf.jsonc"));
  if (!adf) continue;
  let meta;
  try { meta = JSON.parse(stripJsonc(fs.readFileSync(path.join(d, adf), "utf8"))); } catch { continue; }
  if (meta.deprecated) continue;
  const files = meta.files || [];
  let file = null, kind = null;
  for (const f of files) {
    if (f.type === "image") {
      const s = (f.scales || []).find((x) => String(x.size) === "480");
      if (s && fs.existsSync(path.join(d, s.file))) { file = s.file; kind = "image"; break; }
    }
    if (f.type === "svg" || f.type === "vector") {
      const p = f.file || (f.scales && f.scales[0]?.file);
      if (p && fs.existsSync(path.join(d, p))) { file = p; kind = "svg"; break; }
    }
  }
  if (!file) {
    const svg = path.join(d, "svg");
    if (fs.existsSync(svg)) { const s = fs.readdirSync(svg).find((x) => x.endsWith(".svg")); if (s) { file = "svg/" + s; kind = "svg"; } }
  }
  if (!file) continue;
  out.push({ id: meta.name, slug, kind, file: `${slug}/${file}`, keywords: meta.keywords || [], description: meta.description || "" });
}
out.sort((a, b) => a.id.localeCompare(b.id));
const dest = path.join(path.dirname(new URL(import.meta.url).pathname), "../catalog/ods-asset-index.json");
fs.writeFileSync(dest, JSON.stringify(out, null, 0).replace(/},{/g, "},\n{"));
const by = out.reduce((m, a) => ((m[a.kind] = (m[a.kind] || 0) + 1), m), {});
console.log(`indexed ${out.length}`, by);
