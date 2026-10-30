/**
 * ODS 에셋 검색 + 임베드.
 *
 * - 인덱스: harness/catalog/ods-asset-index.json (build-asset-index.mjs 로 design-assets 에서 생성)
 * - 원본 파일: DESIGN_ASSETS_ROOT/assets/{file}  (기본: ~/design-assets, /home/claude/design-assets)
 * - 임베드: raster 는 sharp 로 webp(<=480w) 변환 후 data URI, svg 는 그대로 data URI
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const INDEX_PATH = path.join(here, "../catalog/ods-asset-index.json");

let _index = null;
export function loadIndex() {
  if (!_index) _index = JSON.parse(fs.readFileSync(INDEX_PATH, "utf8"));
  return _index;
}

export function designAssetsRoot() {
  // DESIGN_ASSETS_ROOT 를 명시했는데 없으면 폴백 탐색 없이 null (테스트·강제 CDN 모드)
  if (process.env.DESIGN_ASSETS_ROOT) return fs.existsSync(path.join(process.env.DESIGN_ASSETS_ROOT, "assets")) ? process.env.DESIGN_ASSETS_ROOT : null;
  const cands = [
    path.join(os.homedir(), "design-assets"),
    path.join(here, "../../vendor/design-assets"),
    path.join(here, "../vendor/design-assets"),
    path.join(os.homedir(), ".lp-draft", "design-assets"),
  ];
  for (const c of cands) if (fs.existsSync(path.join(c, "assets"))) return c;
  return null;
}

/** "AssetBoltTruckLargeStillImage" / "AssetBoltTruckLarge" / slug 모두 허용 */
export function findAsset(idOrSlug) {
  if (!idOrSlug) return null;
  const raw = String(idOrSlug).trim();
  const id = raw.replace(/(StillImage|Lottie)$/, "");
  const idx = loadIndex();
  return idx.find((a) => a.id === id || a.slug === raw) ?? null;
}

const OFF_PALETTE = /(Purple|CoralRed|MangoOrange|Violet|DarkBlue|JadeGreen|DavyGray|Gray|Pink|Yellow|Red|Orange|Tan\w*|Candy\w*|Brown|Green\w*)(View\d+|KeyVisual)?$/;
/** 같은 오브젝트(색·뷰 바리에이션 무시) 식별 키 — 한 페이지 중복 방지용 */
export const objectKey = (id) => id.replace(/^Asset/, "").replace(/(O2O|Large|Small|KeyVisual|View\d+|GenuineBlue|DarkBlue|Purple|CoralRed|MangoOrange|Violet|JadeGreen|DavyGray|Gray|Isometric)/g, "");
const LOGO_RE = /(Symbol|Horizontal|Vertical|Wordmark|Badge|Logo|Bank|Pay|Card)(White|Black|Yellow|Green|Gray)?$/;
const tokenize = (q) =>
  String(q)
    .toLowerCase()
    .split(/[\s,·/]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 1);

/**
 * 자연어 키워드 → 에셋 후보.
 * role: "media"(큰 3D 일러스트·히어로·카드 이미지) | "icon"(작은 아이콘·리스트카드) | "any"
 */
export function searchAssets(query, { role = "media", limit = 5, exclude = [], palette = "GenuineBlue" } = {}) {
  const tokens = tokenize(query);
  const brandAsked = tokens.some((t) => /로고|logo|symbol|브랜드|kakao|카카오|naver|네이버/.test(t));
  const scored = [];
  for (const a of loadIndex()) {
    if (exclude.includes(a.id) || exclude.includes(objectKey(a.id))) continue;
    const kws = a.keywords.map((k) => String(k).toLowerCase());
    const name = (a.id + " " + a.slug).toLowerCase();
    let s = 0;
    for (const t of tokens) {
      if (kws.includes(t)) s += 3;
      else if (t.length >= 2 && kws.some((k) => k.length >= 2 && (k.includes(t) || t.includes(k)))) s += 1.5;
      if (/^[a-z0-9-]+$/.test(t) && t.length >= 3 && name.includes(t)) s += 1;
    }
    if (s === 0) continue;
    if (role === "media") {
      if (a.kind === "image") s += 1.2;
      if (/Large|Isometric|View\d/.test(a.id)) s += 0.6;
      if (/Small|Shortcut/i.test(a.id) || kws.includes("숏컷")) s -= 1.5;
      if (a.kind === "svg") s -= 3; // 평면 SVG 는 3D 일러스트 슬롯에 섞지 않음
    } else if (role === "icon-small" || role === "icon") {
      // 24 이하 슬롯(리스트 leading icon)은 아이콘(숏컷 SVG) 언어, 24 초과 슬롯만 3D 에셋 (2026-10 규칙)
      // pillcard·stepcard 아이콘: ODS 숏컷(Small SVG) 언어를 우선, 3D 일러스트는 차선
      if (a.kind === "svg") s += 2.5;
      if (/Small/.test(a.id) || kws.includes("숏컷")) s += 1.5;
      if (a.kind === "image") s -= 2;
      // 숏컷 아이콘 색: 한 리스트 안에서 블루·그레이 계열로 모이게 (웜 컬러는 차선)
      if (/GenuineBlue/.test(a.id)) s += 1; else if (/DarkBlue|DavyGray/.test(a.id)) s += 0.5; else if (/MangoOrange|CoralRed|CandyPink|Violet|TanYellow|JadeGreen/.test(a.id)) s -= 1;
    }
    if (/OnSquircle/.test(a.id)) s -= 1.5;
    if (/^Asset(Banner|OpenGraph)/.test(a.id)) s -= 4; // 배너·OG 합성 이미지는 슬롯 에셋으로 쓰지 않음 // 배경 도형이 붙은 변형은 카드 안에서 이중 배경이 됨
    if (!brandAsked && LOGO_RE.test(a.id)) s -= 3;
    if (/Disabled|Dev$/.test(a.id)) s -= 2;
    // 한 페이지 안 일러스트 톤 통일: 기본은 ODS 3D 일러스트, 실사(Photographic)는 '사진/실사' 요청 시에만
    const photoAsked = tokens.some((t) => /사진|실사|photo/.test(t));
    if (/^AssetPhoto/.test(a.id) && !photoAsked) s -= 4; // Photographic·Photo…Isometric(실사) 은 요청 시에만
    // 팔레트 통일: 같은 오브젝트의 컬러 바리에이션 중 페이지 팔레트(기본 GenuineBlue) 우선
    if (palette && a.id.includes(palette)) s += 1;
    else if (OFF_PALETTE.test(a.id)) s -= role === "icon" ? 2 : 1;
    if (s <= 0) continue;
    scored.push({ ...a, score: Math.round(s * 10) / 10 });
  }
  scored.sort((x, y) => y.score - x.score || x.id.length - y.id.length);
  // 같은 계열(View1~4) 중복은 1개만
  const seen = new Set();
  const out = [];
  for (const a of scored) {
    const fam = a.id.replace(/View\d+$/, "");
    if (seen.has(fam)) continue;
    seen.add(fam);
    out.push(a);
    if (out.length >= limit) break;
  }
  return out;
}

const _cache = new Map();
/** design-assets 원본이 없을 때 쓰는 CDN 폴백 (프로덕션 정적 경로 규칙). 결과는 ~/.lp-draft/cdn-cache 에 캐시 */
const CDN = "https://asset.ohousecdn.com/static";
const CACHE_DIR = path.join(os.homedir(), ".lp-draft", "cdn-cache");
export const cdnState = { tried: 0, ok: 0, fail: 0 };
async function fetchCdnAsset(hit) {
  const cands = hit.kind === "svg"
    ? [`${CDN}/${hit.id}/${hit.slug}.svg`]
    : [`${CDN}/${hit.id}/image_480.webp`, `${CDN}/${hit.id}/image_480.png`];
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  for (const url of cands) {
    const local = path.join(CACHE_DIR, `${hit.id}${path.extname(url)}`);
    if (fs.existsSync(local)) return local;
    cdnState.tried++;
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!r.ok) continue;
      fs.writeFileSync(local, Buffer.from(await r.arrayBuffer()));
      cdnState.ok++;
      return local;
    } catch { /* 다음 후보 */ }
  }
  cdnState.fail++;
  return null;
}

/** ODS 에셋 id 또는 로컬 파일 경로 → data URI (원본 없음·CDN 실패 시 null → 호출부가 플레이스홀더) */
export async function toDataUri(ref, { width = 480 } = {}) {
  const key = `${ref}@${width}`;
  if (_cache.has(key)) return _cache.get(key);
  let file = null;
  const hit = findAsset(ref);
  if (hit) {
    const root = designAssetsRoot();
    if (root && fs.existsSync(path.join(root, "assets", hit.file))) file = path.join(root, "assets", hit.file);
    else file = await fetchCdnAsset(hit);
  } else {
    // 생성형 에셋: 절대경로 · cwd 기준 · harness 기준 순으로 탐색
    for (const c of [ref, path.resolve(ref), path.join(here, "..", ref)]) if (fs.existsSync(c)) { file = c; break; }
  }
  if (!file || !fs.existsSync(file)) return null;
  let uri;
  if (file.endsWith(".svg")) {
    uri = "data:image/svg+xml;base64," + fs.readFileSync(file).toString("base64");
  } else {
    const sharp = (await import("sharp")).default;
    const buf = await sharp(file).resize({ width, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
    uri = "data:image/webp;base64," + buf.toString("base64");
  }
  _cache.set(key, uri);
  return uri;
}

/** 해석 불가 이미지용 중립 플레이스홀더 (ODS surface 톤) */
export const PLACEHOLDER_URI =
  "data:image/svg+xml;base64," +
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="160" viewBox="0 0 240 160"><rect width="240" height="160" rx="12" fill="#F7F9FA"/><path d="M96 98l16-20 12 14 8-9 16 15z" fill="#DADDE0"/><circle cx="104" cy="66" r="7" fill="#DADDE0"/></svg>`
  ).toString("base64");
export const TRANSPARENT_URI =
  "data:image/svg+xml;base64," + Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>`).toString("base64");
