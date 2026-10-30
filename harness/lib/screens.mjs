/**
 * 스크린 디렉토리 (오늘의집 디자인 · Screens) 연동 — 목업 섹션용 실제 서비스 화면
 *
 *   디렉토리: https://static-contents.datapl.datahou.se/v2/common/ohouse-design/categories/  (SSR HTML, 331 screens)
 *   화면별 아티팩트: screen-artifacts/screens/<track>/<group>/<slug>/<hash>/
 *       manifest.json        title · summary · aliases · renders[].env
 *       thumb-<env>.webp     804×1748 (iPhone 17 2x) — 목업에 쓰는 이미지
 *
 *   인덱스: catalog/ohouse-screens-index.json  (`lp screens sync` 가 디렉토리에서 재생성, 네트워크가 막힌 환경은 커밋본 사용)
 *   Loom 플러그인(bucketplace-loom)이 있으면 그쪽이 1순위:
 *       - 화면 찾기: loom MCP list_screens({track}) / get_screen(id)
 *       - 이미지: workbench_sketch_new({slug, screen:id}) → workbench_compile_check({project:"sketches/<slug>", screenKey:id, shot:true, query:{env:"ios27-iphone-17"}})
 *                 → PNG 가 ~/Loom/tracks/sketches/projects/<slug>/.loom/shots/ 에 생김. 스펙 screen.file 로 넘기거나, 하네스가 ~/Loom 의 shots 를 화면 slug 로 자동 탐색
 *   이미지 캐시: ~/.lp-draft/screens/<hash>-<env>.webp  (또는 catalog/screens/, LP_SCREENS_DIR)
 *   네트워크가 막힌 환경(사내 프록시 등)에서 캐시에 없으면 placeholder + 리포트 warn — 임의 화면으로 대체하지 않음
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
export const SCREENS_ROOT = "https://static-contents.datapl.datahou.se/v2/common/ohouse-design/";
export const SCREENS_INDEX = path.join(here, "..", "catalog", "ohouse-screens-index.json");
export const DEFAULT_ENV = "ios27-iphone-17";

export function loomHome() { return process.env.LOOM_HOME || path.join(os.homedir(), "Loom"); }
/** Loom 작업 폴더의 compile_check 캡처(.loom/shots/*.png) 중 화면 slug·env 가 맞는 최신 파일 */
export function findLoomShot(screenId, env = DEFAULT_ENV) {
  const root = loomHome();
  if (!fs.existsSync(root)) return null;
  const slug = screenId.split("/").pop();
  const hits = [];
  const walk = (dir, depth) => {
    if (depth > 7) return;
    let ents = []; try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of ents) {
      const f = path.join(dir, e.name);
      if (e.isDirectory()) { if (e.name === "node_modules" || e.name === ".loom-engines" || e.name === ".cache") continue; walk(f, depth + 1); }
      else if (/\.png$/i.test(e.name) && dir.includes(`${path.sep}.loom${path.sep}shots`) && e.name.includes(slug)) {
        hits.push({ f, mtime: fs.statSync(f).mtimeMs, envMatch: e.name.includes(env) ? 1 : 0 });
      }
    }
  };
  walk(root, 0);
  hits.sort((a, b) => b.envMatch - a.envMatch || b.mtime - a.mtime);
  return hits[0]?.f || null;
}

export function screensCacheDirs() {
  return [process.env.LP_SCREENS_DIR, path.join(here, "..", "catalog", "screens"), path.join(os.homedir(), ".lp-draft", "screens")].filter(Boolean);
}

let _idx = null;
export function loadScreens() {
  if (_idx) return _idx;
  if (!fs.existsSync(SCREENS_INDEX)) return (_idx = []);
  _idx = JSON.parse(fs.readFileSync(SCREENS_INDEX, "utf8")).screens || [];
  return _idx;
}
export function findScreen(id) {
  return loadScreens().find((s) => s.id === id || s.id.endsWith("/" + id)) || null;
}

const tokenize = (q) => String(q || "").toLowerCase().split(/[\s,·/|]+/).filter((t) => t.length >= 2);
/** 한국어 키워드로 화면 검색 — title·aliases·cat·summary·id 가중치 */
export function searchScreens(query, { limit = 5, track = null } = {}) {
  const tokens = tokenize(query);
  const out = [];
  for (const s of loadScreens()) {
    if (track && !s.id.startsWith(track)) continue;
    const title = (s.title || "").toLowerCase(), cat = (s.cat || "").toLowerCase(), sum = (s.summary || "").toLowerCase(), al = (s.aliases || []).join(" ").toLowerCase(), id = s.id.toLowerCase();
    let sc = 0;
    for (const t of tokens) {
      if (title.includes(t)) sc += 4;
      if (al.includes(t)) sc += 2.5;
      if (cat.includes(t)) sc += 2;
      if (sum.includes(t)) sc += 1.5;
      if (id.includes(t)) sc += 1;
    }
    if (sc <= 0) continue;
    if (!s.envs?.includes(DEFAULT_ENV)) sc -= 1; // 폰 목업은 iPhone 렌더가 있는 화면 우선
    if (/어드민|admin|-jp$|jp\b/.test(cat + id)) sc -= 2; // 어드민·JP 화면은 국내 서비스 LP 에 안 씀
    out.push({ ...s, score: Math.round(sc * 10) / 10 });
  }
  return out.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function screenImageEnv(s) {
  return s.envs?.includes(DEFAULT_ENV) ? DEFAULT_ENV : s.thumbEnv || s.envs?.[0] || DEFAULT_ENV;
}
export function screenImageUrl(s, env = screenImageEnv(s)) {
  return `${SCREENS_ROOT}screen-artifacts/screens/${s.id}/${s.hash}/thumb-${env}.webp`;
}
export function screenCacheFile(s, env = screenImageEnv(s)) {
  const name = `${s.hash}-${env}.webp`;
  for (const d of screensCacheDirs()) { const f = path.join(d, name); if (fs.existsSync(f)) return f; }
  return null;
}

/** 지정 file → Loom 캡처(~/Loom 안의 .loom/shots) → 캐시 → 다운로드 시도(사내 프록시 환경은 실패) → null. 반환 {file, source} */
export async function resolveScreenImage(s, { env = screenImageEnv(s), file = null } = {}) {
  if (file) { for (const c of [file, path.resolve(file), file.replace(/^~/, os.homedir())]) if (fs.existsSync(c)) return { file: c, source: "file" }; }
  const loom = s ? findLoomShot(s.id, env) : null;
  if (loom) return { file: loom, source: "loom" };
  const f = s ? await fetchScreenImage(s, env) : null;
  return f ? { file: f, source: screenCacheFile(s, env) === f ? "cache" : "download" } : null;
}
export async function fetchScreenImage(s, env = screenImageEnv(s)) {
  const cached = screenCacheFile(s, env);
  if (cached) return cached;
  const dir = path.join(os.homedir(), ".lp-draft", "screens");
  try {
    const r = await fetch(screenImageUrl(s, env), { signal: AbortSignal.timeout(12000) });
    if (!r.ok) return null;
    fs.mkdirSync(dir, { recursive: true });
    const f = path.join(dir, `${s.hash}-${env}.webp`);
    fs.writeFileSync(f, Buffer.from(await r.arrayBuffer()));
    return f;
  } catch { return null; }
}

/** 디렉토리에서 인덱스 재생성 (네트워크 필요) */
export async function syncScreens({ log = console.error } = {}) {
  const html = await (await fetch(SCREENS_ROOT + "categories/", { signal: AbortSignal.timeout(20000) })).text();
  const re = /<a[^>]+href="([^"]*\/d\/[a-z0-9-]+\/s\/[a-z0-9-]+)"[\s\S]*?<img[^>]+src="[^"]*screen-artifacts\/screens\/([^/"]+\/[^/"]+\/[^/"]+)\/([0-9a-f]+)\/thumb-([a-z0-9-]+)\.webp"[\s\S]*?<\/a>/g;
  const rows = []; let m;
  while ((m = re.exec(html))) rows.push({ href: m[1], id: m[2], hash: m[3], thumbEnv: m[4] });
  log(`screens: ${rows.length} entries`);
  const screens = [];
  for (let i = 0; i < rows.length; i += 12) {
    await Promise.all(rows.slice(i, i + 12).map(async (r) => {
      try {
        const j = await (await fetch(`${SCREENS_ROOT}screen-artifacts/screens/${r.id}/${r.hash}/manifest.json`, { signal: AbortSignal.timeout(15000) })).json();
        const y = j.screen?.yaml || {};
        screens.push({ id: r.id, hash: r.hash, title: y.title || r.id, cat: r.id.split("/")[1], summary: (y.summary || "").slice(0, 140), aliases: (y.aliases || []).slice(0, 4), envs: (j.renders || []).map((x) => x.env), thumbEnv: r.thumbEnv });
      } catch { screens.push({ id: r.id, hash: r.hash, title: r.id, cat: r.id.split("/")[1], summary: "", aliases: [], envs: [], thumbEnv: r.thumbEnv }); }
    }));
  }
  screens.sort((a, b) => a.id.localeCompare(b.id));
  fs.mkdirSync(path.dirname(SCREENS_INDEX), { recursive: true });
  fs.writeFileSync(SCREENS_INDEX, JSON.stringify({ syncedAt: new Date().toISOString(), source: SCREENS_ROOT + "categories/", screens }, null, 1));
  _idx = null;
  return screens.length;
}
