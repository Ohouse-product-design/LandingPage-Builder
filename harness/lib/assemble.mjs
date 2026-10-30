/**
 * LandingPageDoc → 단일 self-contained HTML.
 *
 *  page.html   : 실제 LP 페이지. 375/768/1280 각각을 빌더 컴포넌트로 SSR 후 media query 로 전환.
 *                ODS Tailwind CSS·Pretendard 서브셋 폰트·에셋(data URI) 모두 인라인 → 외부 의존 0.
 *  preview.html: Artifact 로 퍼블리시하는 리뷰 셸. page.html 을 iframe(srcdoc)으로 띄우고
 *                뷰포트 토글 · 섹션 목록 · QA 리포트 · 에셋 출처 · HTML 복사를 제공.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { findAsset, toDataUri, PLACEHOLDER_URI, TRANSPARENT_URI } from "./assets.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, "../..");
const require = createRequire(path.join(ROOT, "package.json"));

const VIEWPORTS = ["mobile", "tablet", "desktop"];
const FIGMA_FOOTER_MAP = {
  naverGlyph: "AssetNaverPostSymbolCircleGray",
  facebookGlyph: "AssetFacebookSymbolCircleGray",
  instaGlyph: "AssetInstagramSymbolCircleGray",
  youtubeGlyph: "AssetYoutubeSymbolCircleGray",
  kakaoGlyph: "AssetKakaoTalkSymbolCircle",
};

async function loadRenderer() {
  const bundle = path.join(ROOT, "harness/.build/render.mjs");
  const srcDir = path.join(ROOT, "src");
  const newest = (d) => fs.readdirSync(d, { withFileTypes: true }).reduce((m, e) => Math.max(m, e.isDirectory() ? newest(path.join(d, e.name)) : fs.statSync(path.join(d, e.name)).mtimeMs), 0);
  if (!fs.existsSync(bundle) || fs.statSync(bundle).mtimeMs < Math.max(newest(srcDir), newest(path.join(ROOT, "harness/render")))) {
    execFileSync(process.execPath, [path.join(ROOT, "harness/render/build.mjs")], { stdio: "inherit" });
  }
  return import(bundle + `?t=${Date.now()}`);
}

/** doc 안 모든 AssetRef 를 data URI 키로 치환. 반환: { doc, assets: {key: uri} } */
async function embedAssets(doc) {
  const d = structuredClone(doc);
  const assets = {};
  let k = 0;
  const put = (uri) => {
    const hit = Object.entries(assets).find(([, v]) => v === uri);
    if (hit) return hit[0];
    const key = `a${++k}`;
    assets[key] = uri;
    return key;
  };
  // 슬롯 에셋은 시각 크기 정규화(투명 여백 trim + 정사각 contain) — 같은 섹션 안 에셋 크기 통일 (header/footer 제외)
  const fix = async (a, normalize = true) => {
    if (!a) return;
    let uri = null;
    const tint = normalize ? a.tint || null : null;
    if (a.url?.startsWith("file:")) uri = await toDataUri(a.url.slice(5), { width: 960, normalize, tint });
    else if (a.assetId) uri = await toDataUri(a.assetId, { normalize, tint });
    else if (a.url?.startsWith("data:")) uri = a.url;
    if (!uri) uri = PLACEHOLDER_URI;
    a.url = `lp-asset://${put(uri)}`;
  };
  for (const s of d.sections) {
    const norm = !["header", "footer", "sticky-cta"].includes(s.preset);
    for (const slot of s.assets || []) await fix(slot.asset, norm);
    for (const inst of Object.values(s.slots || {}).flat()) {
      for (const c of inst.props?.cells || []) for (const v of Object.values(c.slots || {})) if (v?.kind === "asset") await fix(v.asset, norm);
    }
  }
  return { doc: d, assets, put };
}

/** SSR 결과에 남은 외부 이미지(CDN/Figma) → data URI 키 */
async function rewriteExternal(html, put) {
  const re = /src="(https?:\/\/[^"]+)"/g;
  const urls = [...new Set([...html.matchAll(re)].map((m) => m[1]))];
  const map = {};
  const { FOOTER_ASSET } = await import(path.join(ROOT, "harness/.build/render.mjs")).catch(() => ({}));
  for (const u of urls) {
    let uri = null;
    const cdn = u.match(/ohousecdn\.com\/static\/([^/]+)\//);
    if (cdn) uri = await toDataUri(cdn[1]).catch(() => null);
    if (!uri && /figma\.com\/api\/mcp\/asset/.test(u)) {
      const name = FOOTER_ASSET && Object.entries(FOOTER_ASSET).find(([, v]) => v === u)?.[0];
      uri = name && FIGMA_FOOTER_MAP[name] ? await toDataUri(FIGMA_FOOTER_MAP[name]) : TRANSPARENT_URI;
    }
    map[u] = put(uri || PLACEHOLDER_URI);
  }
  return html.replace(re, (_, u) => `src="lp-asset://${map[u]}"`);
}

async function buildCss(markup) {
  const postcss = require("postcss");
  const tailwind = require("tailwindcss");
  const loadConfig = require("tailwindcss/loadConfig");
  const cfg = loadConfig(path.join(ROOT, "tailwind.config.ts"));
  const res = await postcss([tailwind({ ...cfg, content: [{ raw: markup, extension: "html" }] })]).process(
    "@tailwind base;\n@tailwind components;\n@tailwind utilities;",
    { from: undefined }
  );
  return res.css;
}

/** 페이지에 실제 쓰인 글자만 남긴 Pretendard Variable woff2 (pyftsubset) */
function buildFontFace(text) {
  const ttf = path.join(ROOT, "node_modules/pretendard/dist/public/variable/PretendardVariable.ttf");
  if (!fs.existsSync(ttf)) return "";
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "lpfont-"));
  const chars = path.join(tmp, "chars.txt");
  const out = path.join(tmp, "p.woff2");
  const ascii = Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)).join("");
  fs.writeFileSync(chars, ascii + "·–—…‘’“”₩%★☆©" + text);
  try {
    execFileSync("pyftsubset", [ttf, `--text-file=${chars}`, "--flavor=woff2", `--output-file=${out}`, "--layout-features=*"], { stdio: "ignore" });
  } catch {
    try { execFileSync("python3", ["-m", "fontTools.subset", ttf, `--text-file=${chars}`, "--flavor=woff2", `--output-file=${out}`, "--layout-features=*"], { stdio: "ignore" }); } catch { return ""; }
  }
  const b64 = fs.readFileSync(out).toString("base64");
  return `@font-face{font-family:"Pretendard";font-weight:45 920;font-style:normal;font-display:swap;src:url(data:font/woff2;base64,${b64}) format("woff2")}`;
}

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const PAGE_CSS = `
html,body{margin:0;background:#fff;color:#141414;word-break:keep-all;overflow-wrap:anywhere;font-family:"Pretendard",-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Malgun Gothic",system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.lp-vp{display:none}
@media (max-width:767px){.lp-vp-mobile{display:block}}
@media (min-width:768px) and (max-width:1023px){.lp-vp-tablet{display:block}}
@media (min-width:1024px){.lp-vp-desktop{display:block}}
.lp-vp-desktop>section>*{margin-inline:auto}
.lp-vp-desktop>section:not([data-preset="hero"]):not([data-preset="footer"]):not([data-preset="header"])>div{max-width:1256px;box-sizing:border-box}
.lp-vp-desktop>section[data-layout="content"]:not([data-preset="hero"]):not([data-preset="footer"]):not([data-preset="header"]):not([data-preset="sticky-cta"])>div{max-width:720px}
.lp-vp-tablet>section[data-layout="content"]:not([data-preset="hero"]):not([data-preset="footer"]):not([data-preset="header"]):not([data-preset="sticky-cta"])>div{max-width:720px;margin-inline:auto}
[data-lottie-placeholder]{background:#F7F9FA;border-radius:12px}
.lp-row::-webkit-scrollbar{display:none}
/* 섹션 스크롤 리빌(기본): 뷰포트에 들어오면 아래→위로 올라오며 나타남. JS 가 html.lp-reveal 을 붙였을 때만 숨김 → JS 없음·리듀스드 모션·QA 캡처는 그대로 보임 */
html.lp-reveal [data-reveal]{opacity:0;transform:translateY(28px);transition:opacity .6s cubic-bezier(.22,.61,.36,1),transform .6s cubic-bezier(.22,.61,.36,1);will-change:opacity,transform}
html.lp-reveal [data-reveal].is-in{opacity:1;transform:none}
@media (prefers-reduced-motion:reduce){html.lp-reveal [data-reveal]{opacity:1;transform:none;transition:none}}
html.lp-outline section{outline:1px dashed rgba(0,161,255,.55);outline-offset:-1px;position:relative}
html.lp-outline section::before{content:attr(data-preset);position:absolute;z-index:30;top:4px;left:4px;font:600 10px/1 system-ui;background:#00A1FF;color:#fff;padding:3px 5px;border-radius:3px}
html.lp-focus section.lp-hit{outline:2px solid #00A1FF;outline-offset:-2px}
`;

const PAGE_JS = `(function(){if('IntersectionObserver' in window&&!window.__LP_NO_REVEAL&&!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('lp-reveal');var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('is-in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -12% 0px',threshold:0.08});document.querySelectorAll('[data-reveal]').forEach(function(s){io.observe(s)})}})();
(function(){var A=JSON.parse(document.getElementById('lp-assets').textContent);
document.querySelectorAll('img[data-lpa]').forEach(function(i){i.src=A[i.getAttribute('data-lpa')]||''});
document.addEventListener('click',function(e){var b=e.target.closest('button[aria-expanded]');if(!b)return;var p=b.nextElementSibling;if(!p||!p.hasAttribute('data-faq-answer'))return;var o=b.getAttribute('aria-expanded')!=='true';b.setAttribute('aria-expanded',o);p.hidden=!o;var s=b.querySelector('svg');if(s)s.classList.toggle('rotate-180',o)});
(function(){var raf=0;function upd(){raf=0;document.querySelectorAll('.lp-vp').forEach(function(vp){if(!vp.offsetParent&&getComputedStyle(vp).display==='none')return;var s=vp.querySelector('[data-sticky-cta]');if(!s)return;var h=vp.querySelector('section[data-preset="hero"]');var past=!h||h.getBoundingClientRect().bottom<=0;s.setAttribute('data-visible',past?'true':'false');s.setAttribute('aria-hidden',past?'false':'true')})}function q(){if(!raf)raf=requestAnimationFrame(upd)}window.addEventListener('scroll',q,{passive:true});window.addEventListener('resize',q);document.addEventListener('DOMContentLoaded',upd);upd()})();
window.addEventListener('message',function(e){var d=e.data||{};if(d.type==='lp:outline')document.documentElement.classList.toggle('lp-outline',!!d.on);if(d.type==='lp:focus'){document.querySelectorAll('section.lp-hit').forEach(function(s){s.classList.remove('lp-hit')});var vp=document.querySelector('.lp-vp:not([style*=none])');var all=document.querySelectorAll('section[data-section-id="'+d.id+'"]');all.forEach(function(s){if(s.offsetParent!==null||s.getClientRects().length){s.classList.add('lp-hit');s.scrollIntoView({behavior:'smooth',block:'start'})}});document.documentElement.classList.add('lp-focus')}});
})();`;

export async function assemble(doc, { report = null, spec = null, assetLog = [] } = {}) {
  const { renderSections } = await loadRenderer();
  const { doc: embedded, assets, put } = await embedAssets(doc);
  let body = "";
  for (const vp of VIEWPORTS) body += `<div class="lp-vp lp-vp-${vp}" data-viewport="${vp}">${renderSections(embedded, vp)}</div>\n`;
  body = await rewriteExternal(body, put);
  body = body.replace(/src="lp-asset:\/\/(a\d+)"/g, 'data-lpa="$1" src="data:,"');

  const css = await buildCss(body);
  const textContent = body.replace(/<[^>]+>/g, " ");
  const font = buildFontFace(textContent + (doc.meta.title || ""));
  const page = `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(doc.meta.title)}</title>
<meta name="description" content="${esc(doc.meta.description)}">
<meta property="og:title" content="${esc(doc.meta.title)}"><meta property="og:description" content="${esc(doc.meta.description)}">
<meta name="generator" content="ohouse-lp-harness">
<style>${font}\n${css}\n${PAGE_CSS}</style></head>
<body>
${body}
<script type="application/json" id="lp-assets">${JSON.stringify(assets)}</script>
<script>${PAGE_JS}</script>
</body></html>`;

  const makePreview = (finalReport = report) => buildPreviewShell({ page, doc, report: finalReport, spec, assetLog, font });
  return { page, makePreview, stats: { pageKB: Math.round(page.length / 1024), assets: Object.keys(assets).length } };
}

// ─────────────────────────────────────────────────────────────────────────────
// 리뷰 셸 (Artifact). Artifact 규약: doctype/html/head/body 없이 작성, 모든 리소스 인라인.
// ─────────────────────────────────────────────────────────────────────────────
function buildPreviewShell({ page, doc, report, spec, assetLog, font }) {
  const pageJson = JSON.stringify(page).replace(/<\//g, "<\\/").replace(/<!--/g, "<\\!--");
  const sections = doc.sections.map((s) => ({ id: s.id, preset: s.preset, title: String(s.props?.sectionTitle || s.props?.title || s.props?.label || "").replace(/\n/g, " "), count: (s.slots?.content?.[0]?.props?.cells || s.slots?.fields || []).length }));
  const data = JSON.stringify({ meta: doc.meta, sections, report, assetLog, source: spec?.source || null, intent: spec?.intent || null, assumptions: spec?.assumptions || [], generatedAt: new Date().toISOString() }).replace(/<\//g, "<\\/");
  return `<title>${esc(doc.meta.title.split("·")[0].trim() || "LP 시안")} 시안</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>
/* Layout: 상단 툴바 + 좌측 디바이스 스테이지 + 우측 검수 패널 (좁은 폭에선 세로 스택) */
${font}
:root{
  --bg:#F3F5F7; --panel:#FFFFFF; --ink:#141414; --ink-2:#4A5056; --ink-3:#8C9196; --line:#E3E6E9;
  --accent:#00A1FF; --accent-ink:#FFFFFF; --stage:#E9ECEF;
  --err:#E5484D; --warn:#C27C0E; --ok:#05A558; --info:#6B7280;
  --f-ui:"Pretendard",-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo",system-ui,sans-serif;
  --f-mono:ui-monospace,"SF Mono",Menlo,Consolas,monospace;
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#121416;--panel:#1A1D20;--ink:#ECEEF0;--ink-2:#B4B9BE;--ink-3:#80868C;--line:#2A2E33;--stage:#0D0F11;--err:#FF6B70;--warn:#F2B13A;--ok:#3DD68C;--info:#9AA1A8;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#121416;--panel:#1A1D20;--ink:#ECEEF0;--ink-2:#B4B9BE;--ink-3:#80868C;--line:#2A2E33;--stage:#0D0F11;--err:#FF6B70;--warn:#F2B13A;--ok:#3DD68C;--info:#9AA1A8;color-scheme:dark}
html,body{height:100%}
body{background:var(--bg);color:var(--ink);font-family:var(--f-ui);font-size:14px;letter-spacing:-.2px;margin:0}
*{box-sizing:border-box}
button{font:inherit;color:inherit}
.bar{position:sticky;top:env(safe-area-inset-top,0px);z-index:5;display:flex;flex-wrap:wrap;align-items:center;gap:12px 16px;padding-block:12px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));background:var(--panel);border-bottom:1px solid var(--line)}
body::before{content:"";position:fixed;inset:0 0 auto;height:env(safe-area-inset-top,0px);z-index:10;background:var(--panel)}
.id{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1 1 220px}
.id b{font-size:16px;font-weight:700;text-wrap:balance}
.id span{color:var(--ink-3);font-size:12px;font-family:var(--f-mono);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.seg{display:inline-flex;background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:2px}
.seg button{border:0;background:transparent;padding:6px 12px;border-radius:6px;cursor:pointer;font-weight:600;font-size:13px;color:var(--ink-2);display:flex;gap:6px;align-items:baseline}
.seg button small{font-family:var(--f-mono);font-weight:400;font-size:11px;color:var(--ink-3)}
.seg button[aria-pressed="true"]{background:var(--panel);color:var(--ink);box-shadow:0 1px 2px rgba(0,0,0,.08)}
.tools{display:flex;gap:8px;flex-wrap:wrap}
.btn{border:1px solid var(--line);background:var(--panel);padding:7px 12px;border-radius:8px;cursor:pointer;font-weight:600;font-size:13px}
.btn.primary{background:var(--accent);border-color:var(--accent);color:var(--accent-ink)}
.btn:focus-visible,.seg button:focus-visible,.sec:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.main{display:grid;grid-template-columns:minmax(0,1fr) 360px;min-height:calc(100% - 64px)}
@media (max-width:1100px){.main{grid-template-columns:minmax(0,1fr)}}
.stage{background:var(--stage);padding:24px max(16px,env(safe-area-inset-left,0px));overflow-x:auto;display:flex;gap:24px;justify-content:center;align-items:flex-start}
.dev{display:flex;flex-direction:column;gap:8px;align-items:center;flex:none}
.dev-label{font-family:var(--f-mono);font-size:11px;color:var(--ink-3)}
.frame{background:#fff;border-radius:14px;box-shadow:0 0 0 1px var(--line),0 12px 32px rgba(0,0,0,.10);overflow:hidden}
.frame iframe{display:block;border:0;width:100%;height:100%}
.side{background:var(--panel);border-left:1px solid var(--line);padding:20px max(16px,env(safe-area-inset-right,0px)) 40px 20px;display:flex;flex-direction:column;gap:24px;min-width:0}
@media (max-width:1100px){.side{border-left:0;border-top:1px solid var(--line);padding-left:max(16px,env(safe-area-inset-left,0px))}}
h2{font-size:12px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:var(--ink-3);margin:0 0 10px}
.score{display:flex;gap:8px;flex-wrap:wrap}
.pill{display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border-radius:999px;font-weight:700;font-size:12px;border:1px solid var(--line);font-variant-numeric:tabular-nums}
.pill i{width:8px;height:8px;border-radius:50%;display:inline-block}
.secs{display:flex;flex-direction:column;gap:2px;margin:0;padding:0;list-style:none}
.sec{display:grid;grid-template-columns:84px minmax(0,1fr) auto;gap:8px;align-items:baseline;width:100%;text-align:left;border:0;background:transparent;padding:7px 8px;border-radius:6px;cursor:pointer}
.sec:hover{background:var(--bg)}
.sec code{font-family:var(--f-mono);font-size:11px;color:var(--accent)}
.sec span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--ink-2)}
.sec em{font-style:normal;font-size:11px;color:var(--ink-3);font-variant-numeric:tabular-nums}
.issues{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}
.issue{display:grid;grid-template-columns:4px minmax(0,1fr);gap:10px;font-size:13px;line-height:1.45}
.issue::before{content:"";border-radius:2px;background:var(--c)}
.issue code{display:block;font-family:var(--f-mono);font-size:11px;color:var(--ink-3);word-break:break-all}
.issue small{display:block;color:var(--ink-3)}
.assets{display:flex;flex-direction:column;gap:6px;font-size:12px}
.asset{display:grid;grid-template-columns:auto minmax(0,1fr);gap:8px;align-items:baseline}
.tag{font-family:var(--f-mono);font-size:10px;padding:2px 6px;border-radius:4px;background:var(--bg);color:var(--ink-2);white-space:nowrap}
.asset span{word-break:break-all;color:var(--ink-2)}
.kv{display:grid;grid-template-columns:88px minmax(0,1fr);gap:6px 10px;font-size:13px;margin:0}
.kv dt{color:var(--ink-3)}.kv dd{margin:0;word-break:break-word}
.kv a{color:var(--accent)}
.toast{position:fixed;left:50%;bottom:calc(20px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);background:var(--ink);color:var(--panel);padding:8px 14px;border-radius:8px;font-weight:600;font-size:13px}
.empty{color:var(--ink-3);font-size:13px}
@media (prefers-reduced-motion:reduce){*{scroll-behavior:auto!important}}
</style>

<header class="bar">
  <div class="id"><b id="t-title"></b><span id="t-slug"></span></div>
  <div class="seg" role="group" aria-label="디바이스 폭">
    <button type="button" data-vp="mobile" aria-pressed="true">Mobile <small>375</small></button>
    <button type="button" data-vp="tablet" aria-pressed="false">Tablet <small>768</small></button>
    <button type="button" data-vp="desktop" aria-pressed="false">Desktop <small>1280</small></button>
    <button type="button" data-vp="all" aria-pressed="false">3폭 비교</button>
  </div>
  <div class="tools">
    <button type="button" class="btn" id="b-outline" aria-pressed="false">섹션 경계</button>
    <button type="button" class="btn primary" id="b-copy">HTML 복사</button>
  </div>
</header>

<div class="main">
  <div class="stage" id="stage"></div>
  <aside class="side">
    <section><h2>검수 결과</h2><div class="score" id="score"></div></section>
    <section><h2>섹션 구성</h2><ul class="secs" id="secs"></ul></section>
    <section><h2>확인 필요</h2><ul class="issues" id="issues"></ul></section>
    <section><h2>에셋 출처</h2><div class="assets" id="assets"></div></section>
    <section><h2>기획 맥락</h2><dl class="kv" id="ctx"></dl></section>
    <section id="as-wrap"><h2>가정한 내용 · 기획 확인 필요</h2><ul class="issues" id="asm"></ul></section>
  </aside>
</div>
<textarea id="src" hidden aria-hidden="true"></textarea>

<script>
(function(){
var PAGE=${pageJson};
var D=${data};
var W={mobile:375,tablet:768,desktop:1280};
var H={mobile:760,tablet:960,desktop:820};
var stage=document.getElementById('stage');
var outline=false;
var $=function(id){return document.getElementById(id)};
$('t-title').textContent=D.meta.title;
$('t-slug').textContent='/'+D.meta.slug+' · '+D.sections.length+' sections · '+new Date(D.generatedAt).toLocaleString('ko-KR');

function frames(){return stage.querySelectorAll('iframe')}
function post(msg){frames().forEach(function(f){try{f.contentWindow.postMessage(msg,'*')}catch(e){}})}
function device(vp,scale){
  var wrap=document.createElement('div');wrap.className='dev';
  var lab=document.createElement('div');lab.className='dev-label';lab.textContent=vp+' · '+W[vp]+'px';
  var fr=document.createElement('div');fr.className='frame';
  var w=W[vp]*scale,h=H[vp]*scale;fr.style.width=w+'px';fr.style.height=h+'px';
  var ifr=document.createElement('iframe');ifr.title=vp+' 미리보기';
  ifr.style.width=W[vp]+'px';ifr.style.height=H[vp]+'px';ifr.style.transform='scale('+scale+')';ifr.style.transformOrigin='0 0';
  ifr.srcdoc=PAGE;ifr.addEventListener('load',function(){if(outline)post({type:'lp:outline',on:true})});
  fr.appendChild(ifr);wrap.appendChild(lab);wrap.appendChild(fr);return wrap;
}
function show(vp){
  document.querySelectorAll('[data-vp]').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.vp===vp)});
  stage.innerHTML='';
  var avail=Math.max(320,stage.clientWidth-48);
  if(vp==='all'){var tot=W.mobile+W.tablet+W.desktop+48;var s=Math.min(1,avail/tot);['mobile','tablet','desktop'].forEach(function(v){stage.appendChild(device(v,Math.max(.3,s)))});stage.style.justifyContent=s<.3?'flex-start':'center'}
  else{stage.style.justifyContent='center';stage.appendChild(device(vp,Math.min(1,avail/W[vp])))}
  try{localStorage.setItem('lp-vp',vp)}catch(e){}
}
document.querySelectorAll('[data-vp]').forEach(function(b){b.addEventListener('click',function(){show(b.dataset.vp)})});
$('b-outline').addEventListener('click',function(){outline=!outline;this.setAttribute('aria-pressed',outline);post({type:'lp:outline',on:outline})});
$('b-copy').addEventListener('click',function(){
  var done=function(m){var t=document.createElement('div');t.className='toast';t.textContent=m;document.body.appendChild(t);setTimeout(function(){t.remove()},1800)};
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(PAGE).then(function(){done('HTML을 복사했어요')},function(){fallback()})}else fallback();
  function fallback(){var ta=$('src');ta.hidden=false;ta.value=PAGE;ta.select();try{document.execCommand('copy');done('HTML을 복사했어요')}catch(e){done('복사가 막혀 있어요')}ta.hidden=true}
});

var secs=$('secs');
D.sections.forEach(function(s){var li=document.createElement('li');var b=document.createElement('button');b.type='button';b.className='sec';
  b.innerHTML='<code></code><span></span><em></em>';b.children[0].textContent=s.preset;b.children[1].textContent=s.title||'—';b.children[2].textContent=s.count?s.count+'개':'';
  b.addEventListener('click',function(){post({type:'lp:focus',id:s.id})});li.appendChild(b);secs.appendChild(li)});

var C={error:'var(--err)',warn:'var(--warn)',info:'var(--info)'};
var L={error:'수정 필요',warn:'확인',info:'자동 보정'};
var r=D.report||{summary:{error:0,warn:0,info:0},issues:[]};
var sc=$('score');
[['error','수정 필요'],['warn','확인'],['info','자동 보정']].forEach(function(p){var e=document.createElement('span');e.className='pill';e.innerHTML='<i></i>';e.firstChild.style.background=C[p[0]];e.appendChild(document.createTextNode(p[1]+' '+(r.summary[p[0]]||0)));sc.appendChild(e)});
if(r.ok){var ok=document.createElement('span');ok.className='pill';ok.innerHTML='<i></i>';ok.firstChild.style.background='var(--ok)';ok.appendChild(document.createTextNode('가이드 통과'));sc.prepend(ok)}
var iss=$('issues');
var list=r.issues.filter(function(i){return i.level!=='info'}).concat(r.issues.filter(function(i){return i.level==='info'}));
if(!list.length)iss.innerHTML='<li class="empty">글자수·필수 항목·CTA·문체 규칙을 모두 통과했어요.</li>';
list.forEach(function(i){var li=document.createElement('li');li.className='issue';li.style.setProperty('--c',C[i.level]);var d=document.createElement('div');
  var c=document.createElement('code');c.textContent=L[i.level]+' · '+i.where;var m=document.createTextNode(i.msg);d.appendChild(c);d.appendChild(m);
  if(i.fix){var f=document.createElement('small');f.textContent='→ '+i.fix;d.appendChild(f)}li.appendChild(d);iss.appendChild(li)});

var as=$('assets');var SRC={ods:'ODS','ods-search':'ODS 검색',generated:'생성형 AI','needs-generation':'생성 필요',missing:'누락'};
if(!D.assetLog.length)as.innerHTML='<div class="empty">사용된 에셋이 없어요.</div>';
D.assetLog.forEach(function(a){var row=document.createElement('div');row.className='asset';var t=document.createElement('span');t.className='tag';t.textContent=SRC[a.source]||a.source;
  var v=document.createElement('span');v.textContent=(a.id||a.file||'')+(a.query?'  ← "'+a.query+'"':'')+(a.prompt?'  ← '+a.prompt:'');row.appendChild(t);row.appendChild(v);as.appendChild(row)});

var ctx=$('ctx');var kv=[];
if(D.source&&D.source.ref)kv.push(['기획서',D.source.ref,true]);
if(D.intent){if(D.intent.purpose)kv.push(['목적',D.intent.purpose]);if(D.intent.target)kv.push(['타깃',D.intent.target]);if(D.intent.primaryAction)kv.push(['핵심 액션',D.intent.primaryAction]);if(D.intent.tone)kv.push(['톤',[].concat(D.intent.tone).join(' · ')])}
kv.push(['SEO',D.meta.title]);if(D.meta.description)kv.push(['설명',D.meta.description]);
kv.forEach(function(p){var dt=document.createElement('dt');dt.textContent=p[0];var dd=document.createElement('dd');
  if(p[2]&&/^https?:/.test(p[1])){var a=document.createElement('a');a.href=p[1];a.target='_blank';a.rel='noopener';a.textContent='원문 열기';dd.appendChild(a)}else dd.textContent=p[1];ctx.appendChild(dt);ctx.appendChild(dd)});

var asm=$('asm');if(!D.assumptions.length)$('as-wrap').hidden=true;
D.assumptions.forEach(function(t){var li=document.createElement('li');li.className='issue';li.style.setProperty('--c','var(--accent)');var d=document.createElement('div');d.textContent=t;li.appendChild(d);asm.appendChild(li)});
var start='mobile';try{start=localStorage.getItem('lp-vp')||'mobile'}catch(e){}
show(W[start]||start==='all'?start:'mobile');
var rt;window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){var p=document.querySelector('[data-vp][aria-pressed="true"]');show(p?p.dataset.vp:'mobile')},200)});
})();
</script>`;
}
