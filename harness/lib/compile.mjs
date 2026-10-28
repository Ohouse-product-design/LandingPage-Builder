/**
 * lp-spec (LLM 이 쓰는 간결한 기획 스펙) → LandingPageDoc (빌더 표준 직렬화).
 *
 * 패턴 일관성은 여기서 강제된다:
 *  - 섹션별 card usage / cardType / layout / 배경은 PRESET_RULES 로 고정 (스펙에서 임의 지정 불가, 허용된 변형만)
 *  - header / hero / sticky-cta / footer 는 자동 보정 (누락 시 추가, 순서 고정)
 *  - 에셋은 ODS 카탈로그 id 로만 해석 (query → 검색, 실패 시 생성형 슬롯으로 표시)
 */
import { findAsset, searchAssets, objectKey } from "./assets.mjs";

const GRID = (m, t, d, gap = 16) => ({ type: "grid", settings: { columns: { mobile: m, tablet: t, desktop: d }, gap } });
const CAROUSEL = { type: "carousel", settings: { cardWidth: { mobile: 280, tablet: 320, desktop: 360 }, gap: 16, autoScroll: true, autoScrollDurationMs: 30000, loop: true, showArrows: false, showDots: false } };
const LIST = { type: "list", settings: { gap: 16, align: "start" } };

/** 섹션 프리셋 → 허용 패턴. 기본값은 seed.ts(디자이너 승인 캐노니컬)와 동일 */
export const PRESET_RULES = {
  usp: { usage: "imgcard", cardTypes: ["bgfullimg", "leading-asset"], defaultCardType: "bgfullimg", layouts: { grid: (n) => GRID(1, 2, n >= 4 ? 4 : n), carousel: () => CAROUSEL }, defaultLayout: "grid", count: [2, 6], recommended: 4 },
  process: { usage: "imgcard", cardTypes: ["leading-asset"], defaultCardType: "leading-asset", layouts: { grid: (n) => GRID(1, 2, n >= 4 ? 4 : n), carousel: () => CAROUSEL }, defaultLayout: "grid", count: [3, 5], recommended: 4 },
  review: { usage: "reviewcard", layouts: { carousel: () => CAROUSEL, grid: () => GRID(1, 2, 4) }, defaultLayout: "carousel", count: [3, 8], recommended: 4 },
  "cross-sell": { usage: "listcard", layouts: { list: () => LIST, grid: () => GRID(1, 2, 2) }, defaultLayout: "list", count: [2, 4], recommended: 3 },
  table: { usage: "tablecard", layouts: { grid: (n) => GRID(1, n >= 2 ? 2 : 1, n >= 2 ? 2 : 1, 2) }, defaultLayout: "grid", count: [1, 2], recommended: 2 },
  faq: { usage: "faqcard", layouts: { list: () => LIST }, defaultLayout: "list", count: [4, 10], recommended: 4 },
};
export const CONTENT_PRESETS = Object.keys(PRESET_RULES);
export const ALL_PRESETS = ["header", "hero", ...CONTENT_PRESETS, "cta-form", "sticky-cta", "footer"];

const ALL = { mobile: true, tablet: true, desktop: true };
const text = (t) => (t === undefined || t === null || t === "" ? undefined : { kind: "text", text: String(t) });

/** 스펙의 asset 표기 → AssetRef + 해석 기록 */
function resolveAsset(spec, { role, alt, used, log, where }) {
  if (!spec) return undefined;
  const s = typeof spec === "string" ? (spec.startsWith("Asset") ? { id: spec } : { query: spec }) : spec;
  const a = { alt: s.alt || alt || "", type: "image" };
  if (s.file) {
    // 생성형 AI 로 만든 로컬 파일 (harness/out/<slug>/gen/*.png)
    log.push({ where, source: "generated", file: s.file, prompt: s.prompt });
    return { ...a, url: `file:${s.file}` };
  }
  if (s.id) {
    const hit = findAsset(s.id);
    if (hit) {
      used.add(hit.id);
      log.push({ where, source: "ods", id: hit.id });
      return { ...a, assetId: hit.id, type: hit.kind === "svg" ? "svg" : "image" };
    }
    log.push({ where, source: "missing", id: s.id, level: "warn", note: "카탈로그에 없는 assetId" });
  }
  if (s.query) {
    const [best, ...rest] = searchAssets(s.query, { role, exclude: [...used].map(objectKey), palette: PALETTE.value });
    if (best && best.score >= 3) {
      used.add(best.id);
      log.push({ where, source: "ods-search", query: s.query, id: best.id, score: best.score, alternatives: rest.slice(0, 3).map((r) => r.id) });
      return { ...a, assetId: best.id, type: best.kind === "svg" ? "svg" : "image" };
    }
    log.push({ where, source: "needs-generation", query: s.query, level: "warn", note: "ODS 카탈로그에 적합한 에셋 없음 → 생성형 이미지 필요", candidates: [best, ...rest].filter(Boolean).slice(0, 3).map((r) => `${r.id}(${r.score})`) });
  }
  return { ...a, placeholder: true };
}

const PALETTE = { value: "GenuineBlue" };
export function compileSpec(spec) {
  PALETTE.value = spec.assetPalette ?? "GenuineBlue";
  const used = new Set();
  const assetLog = [];
  const notes = [];
  const meta = spec.meta || {};
  const cta = spec.cta || {};
  const ctaLabel = cta.label || "신청하기";
  let n = 0;
  const sid = (p) => `sec-${p}-${++n}`;
  const out = [];

  const input = (spec.sections || []).map((x, i) => ({ ...x, __i: i }));
  const where = {};
  const has = (p) => input.some((s) => s.preset === p);
  if (!has("header")) input.unshift({ preset: "header" });
  if (!has("hero")) { input.splice(1, 0, { preset: "hero", title: meta.title || "메인 카피" }); notes.push("hero 누락 → 자동 추가"); }
  if (!has("sticky-cta") && spec.stickyCta !== false) input.push({ preset: "sticky-cta" });
  if (!has("footer")) input.push({ preset: "footer" });
  // 고정 섹션 순서 강제: header, hero 맨 위 / sticky-cta, footer 맨 아래
  const order = (p) => (p === "header" ? 0 : p === "hero" ? 1 : p === "sticky-cta" ? 8 : p === "footer" ? 9 : 5);
  input.sort((a, b) => order(a.preset) - order(b.preset));

  for (const s of input) {
    const p = s.preset;
    if (!ALL_PRESETS.includes(p)) { notes.push(`알 수 없는 preset '${p}' 무시 — 허용: ${ALL_PRESETS.join(", ")}`); continue; }
    const id = s.id || sid(p);
    where[id] = s.__i === undefined ? `auto(${p})` : `sections[${s.__i}](${p})`;
    const base = { id, preset: p, name: s.name || s.title?.replace(/\n/g, " ") || p, locked: ["header", "hero", "sticky-cta", "footer"].includes(p), slots: {}, assets: [], visibility: { ...ALL, ...(s.visibility || {}) } };

    if (p === "header") { out.push({ ...base, props: { logoText: meta.brand || "오늘의집" } }); continue; }
    if (p === "footer") { out.push({ ...base, props: { copyright: s.copyright || "© 2026 BUCKETPLACE Co., Ltd." } }); continue; }
    if (p === "sticky-cta") {
      out.push({ ...base, props: { label: s.label || ctaLabel, href: s.href || cta.href || "#" }, visibility: { mobile: true, tablet: true, desktop: false, ...(s.visibility || {}) } });
      continue;
    }
    if (p === "hero") {
      const asset = resolveAsset(s.asset, { role: "media", alt: s.title, used, log: assetLog, where: `${id}.background` });
      out.push({ ...base, props: { eyebrow: s.eyebrow || "", title: s.title || "", subtitle: s.subtitle || "", primaryCtaLabel: s.cta || ctaLabel, secondaryCtaLabel: s.secondaryCta || "" }, assets: asset ? [{ slotName: "background", asset }] : [] });
      continue;
    }
    if (p === "cta-form") {
      const fields = (s.fields || [{ label: "이름", placeholder: "이름을 입력해 주세요" }, { label: "연락처", placeholder: "010-0000-0000", type: "tel" }]).map((f, i) => ({ id: `${id}-f${i + 1}`, preset: "form-field", props: { label: f.label, placeholder: f.placeholder || "", fieldType: f.type || "text", required: f.required !== false }, assets: [] }));
      out.push({ ...base, props: { sectionTitle: s.title || "", sectionSubtitle: s.subtitle || "", submitLabel: s.submit || ctaLabel, consentText: s.consent || "" }, slots: { fields } });
      continue;
    }

    // ── 본문 카드 섹션 ──
    const rule = PRESET_RULES[p];
    const items = s.items || [];
    const layoutKey = rule.layouts[s.layout] ? s.layout : rule.defaultLayout;
    if (s.layout && !rule.layouts[s.layout]) notes.push(`${id}: layout '${s.layout}' 는 ${p} 에서 허용되지 않아 '${rule.defaultLayout}' 로 보정`);
    let cardType = rule.cardTypes ? (rule.cardTypes.includes(s.cardType) ? s.cardType : rule.defaultCardType) : undefined;
    if (s.cardType && rule.cardTypes && !rule.cardTypes.includes(s.cardType)) notes.push(`${id}: cardType '${s.cardType}' 보정 → ${cardType}`);

    const cells = items.map((it, i) => {
      const where = `${id}.items[${i}]`;
      const c = { id: `${id}-c${i + 1}`, slots: {} };
      if (rule.usage === "imgcard") {
        Object.assign(c.slots, { tag: text(it.tag), stepNumber: text(it.step ?? (p === "process" ? String(i + 1).padStart(2, "0") : undefined)), title: text(it.title), body: text(it.body) });
        const m = resolveAsset(it.asset, { role: "media", alt: it.title, used, log: assetLog, where });
        if (m) c.slots.media = { kind: "asset", asset: m };
      } else if (rule.usage === "reviewcard") {
        const metaItems = [...(it.meta || []), it.author].filter(Boolean);
        Object.assign(c.slots, { rating: { kind: "rating", value: Math.max(1, Math.min(5, Number(it.rating ?? 5))), max: 5 }, title: text(it.title), body: text(it.body), meta: metaItems.length ? { kind: "meta", items: metaItems } : undefined });
      } else if (rule.usage === "listcard") {
        Object.assign(c.slots, { title: text(it.title), body: text(it.body) });
        const ic = resolveAsset(it.asset || it.icon, { role: "icon", alt: it.title, used, log: assetLog, where });
        if (ic) c.slots.icon = { kind: "asset", asset: ic };
        if (it.href || it.ctaLabel) c.slots.cta = { kind: "cta", label: it.ctaLabel || "보러가기", url: it.href || "#" };
      } else if (rule.usage === "tablecard") {
        Object.assign(c.slots, { title: text(it.title), meta: { kind: "meta", items: it.rows || [] } });
        c.theme = ["grey", "blue", "green"].includes(it.theme) ? it.theme : i === items.length - 1 && items.length > 1 ? "blue" : "grey";
      } else if (rule.usage === "faqcard") {
        Object.assign(c.slots, { title: text(it.q ?? it.title), body: text(it.a ?? it.body) });
      }
      for (const k of Object.keys(c.slots)) if (c.slots[k] === undefined) delete c.slots[k];
      return c;
    });

    const card = { id: `${id}-card`, preset: "card", props: { usage: rule.usage, layout: rule.layouts[layoutKey](cells.length), cells, cardType }, assets: [] };
    out.push({ ...base, props: { sectionTitle: s.title || "", sectionSubtitle: s.subtitle || "" }, slots: { content: [card] } });
  }

  for (const a of assetLog) a.where = a.where.replace(/^sec-[a-z-]+-\d+/, (m) => where[m] || m);
  const now = new Date().toISOString();
  const doc = {
    id: `doc-${meta.slug || "draft"}`,
    schemaVersion: "1.0.0",
    meta: { slug: meta.slug || "draft", title: meta.title || "랜딩페이지 시안", description: meta.description || "", category: meta.category || "other", owners: {} },
    sections: out,
    audit: { createdAt: now, updatedAt: now, createdBy: spec.author || "lp-harness", updatedBy: spec.author || "lp-harness" },
  };
  return { doc, assetLog, notes, where };
}
