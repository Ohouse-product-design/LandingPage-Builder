/**
 * lp-spec (LLM 이 쓰는 간결한 기획 스펙) → LandingPageDoc (빌더 표준 직렬화).
 *
 * 패턴 일관성은 여기서 강제된다:
 *  - 섹션별 card usage / cardType / layout / 배경은 PRESET_RULES 로 고정 (스펙에서 임의 지정 불가, 허용된 변형만)
 *  - header / hero / sticky-cta / footer 는 자동 보정 (누락 시 추가, 순서 고정)
 *  - 에셋은 ODS 카탈로그 id 로만 해석 (query → 검색, 실패 시 생성형 슬롯으로 표시)
 */
import { findAsset, searchAssets, objectKey } from "./assets.mjs";
import { breakLines, SLOT_METRICS } from "./linebreak.mjs";

export const TITLE_LAYOUTS = ["center", "split"];

const GRID = (m, t, d, gap = 16) => ({ type: "grid", settings: { columns: { mobile: m, tablet: t, desktop: d }, gap } });
const CAROUSEL = { type: "carousel", settings: { cardWidth: { mobile: 280, tablet: 320, desktop: 360 }, gap: 16, autoScroll: true, autoScrollDurationMs: 30000, loop: true, showArrows: false, showDots: false } };
const LIST = { type: "list", settings: { gap: 16, align: "start" } };

/** 섹션 프리셋 → 허용 패턴. 기본값은 seed.ts(디자이너 승인 캐노니컬)와 동일 */
export const PRESET_RULES = {
  usp: { usage: "imgcard", allowedUsages: ["imgcard", "pillcard", "stepcard", "linkcard"], cardTypes: ["bgfullimg", "leading-asset"], defaultCardType: "bgfullimg", layouts: { grid: (n) => GRID(1, 2, n >= 4 ? 4 : n), carousel: () => CAROUSEL }, defaultLayout: "grid", count: [2, 6], recommended: 4 },
  process: { usage: "imgcard", allowedUsages: ["imgcard", "stepcard"], cardTypes: ["leading-asset"], defaultCardType: "leading-asset", layouts: { grid: (n) => GRID(1, 2, n >= 4 ? 4 : n), carousel: () => CAROUSEL }, defaultLayout: "grid", count: [3, 5], recommended: 4 },
  review: { usage: "reviewcard", allowedUsages: ["reviewcard"], layouts: { carousel: () => CAROUSEL, grid: () => GRID(1, 2, 4) }, defaultLayout: "carousel", count: [3, 8], recommended: 4 },
  "cross-sell": { usage: "listcard", allowedUsages: ["listcard", "linkcard"], layouts: { list: () => LIST, grid: () => GRID(1, 2, 2) }, defaultLayout: "list", count: [2, 4], recommended: 3 },
  table: { usage: "tablecard", allowedUsages: ["tablecard", "kvcard"], layouts: { grid: (n) => GRID(1, n >= 2 ? 2 : 1, n >= 2 ? 2 : 1, 2) }, defaultLayout: "grid", count: [1, 2], recommended: 2 },
  faq: { usage: "faqcard", allowedUsages: ["faqcard"], layouts: { list: () => LIST }, defaultLayout: "list", count: [4, 10], recommended: 4 },
};
/** 변형별 고정 레이아웃·개수 (기본 usage 가 아닐 때 PRESET_RULES 대신 적용) */
export const USAGE_RULES = {
  linkcard: { layouts: { grid: (n) => GRID(1, 2, Math.min(3, n)), list: () => LIST }, defaultLayout: "grid", count: [2, 4], rows: [2, 5] },
  pillcard: { layouts: { list: () => LIST }, defaultLayout: "list", count: [2, 5] },
  kvcard: { layouts: { list: () => LIST }, defaultLayout: "list", count: [1, 1], rows: [3, 8] },
  stepcard: { layouts: { list: () => LIST }, defaultLayout: "list", count: [2, 5] },
};

const UNIT_RE = /(%|원|개월|일|년|시간|분|건|회|kg|km|㎡|평|명|만|천|배|p)$/;
const splitKv = (r) => {
  if (r && typeof r === "object") return { label: r.label, value: r.value, highlight: !!r.highlight };
  const m = String(r).match(/^(.+?)\s*[:：|]\s*(.+)$/);
  return m ? { label: m[1].trim(), value: m[2].trim() } : null;
};

/**
 * 카드 변형 자동 채택 — 기획 맥락의 "형태 신호"로 결정적으로 고른다 (같은 기획 → 같은 카드).
 * 스펙 `card` 로 명시하면 허용 목록 안에서 우선. 반환: { usage, reason }
 */
export function chooseCardUsage(preset, s) {
  const rule = PRESET_RULES[preset];
  const items = s.items || [];
  if (s.card) {
    if (rule.allowedUsages.includes(s.card)) return { usage: s.card, reason: `스펙 지정 card: ${s.card}` };
    return { usage: rule.usage, reason: `card '${s.card}' 는 ${preset} 에서 허용되지 않아 기본 ${rule.usage} 사용 (허용: ${rule.allowedUsages.join(", ")})`, warn: true };
  }
  const n = items.length;
  const hasLinks = n > 0 && items.every((it) => Array.isArray(it.links) && it.links.length);
  if (hasLinks && rule.allowedUsages.includes("linkcard")) return { usage: "linkcard", reason: `아이템 ${n}개 모두 links[] 보유 → 링크 묶음` };

  if (preset === "table" && n === 1 && rule.allowedUsages.includes("kvcard")) {
    const rows = (items[0].rows || []).map(splitKv);
    if (rows.length && rows.every(Boolean) && rows.filter((r) => UNIT_RE.test(r.value)).length >= Math.ceil(rows.length / 2))
      return { usage: "kvcard", reason: `단일 카드 + '라벨: 값' ${rows.length}행, 값에 단위(%·원·개월…) → 조건 표` };
  }
  if (preset === "usp" && n >= 2 && rule.allowedUsages.includes("pillcard")) {
    const short = items.every((it) => it.title && [...String(it.title)].length <= 14 && !it.body && !it.tag);
    const iconed = items.every((it) => it.asset || it.icon);
    if (short && iconed) return { usage: "pillcard", reason: `모든 아이템이 설명 없이 ≤14자 제목 + 아이콘 → 혜택 필` };
  }
  if (rule.allowedUsages.includes("stepcard")) {
    const subtexts = items.filter((it) => it.body).length;
    const bigMedia = items.some((it) => it.asset && (typeof it.asset === "object" ? it.asset.file || it.asset.query?.includes("3D") : false));
    const iconOnly = items.every((it) => it.icon && !it.asset);
    if (preset === "process" && (n >= 5 || iconOnly || (s.layout === "list"))) return { usage: "stepcard", reason: n >= 5 ? `단계 ${n}개(≥5) → 세로 단계` : iconOnly ? `큰 이미지 없이 아이콘만 → 세로 단계` : `layout: list 요청 → 세로 단계` };
    if (preset === "usp" && iconOnly && subtexts >= 1 && n <= 5 && !bigMedia) return { usage: "stepcard", reason: `아이콘 + 보조 문장 있는 안내 ${n}개 → 세로 단계` };
  }
  return { usage: rule.usage, reason: `기본 ${rule.usage}` };
}
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
  // 타이틀 레이아웃: 페이지에 하나만. 섹션별 지정은 무시하고 notes 로 알린다 (validate 가 error 처리)
  const titleLayout = TITLE_LAYOUTS.includes(spec.titleLayout) ? spec.titleLayout : "split";
  const breaks = []; // 자동 줄바꿈 기록 → 리포트
  const cardChoices = []; // 카드 변형 채택 근거 → 리포트
  const autoBreak = (where, text, metric, opts = {}) => {
    if (!text || spec.autoLineBreak === false) return text;
    const m = metric.mobile;
    const r = breakLines(text, { maxWidthPx: m.w, fontPx: m.f, maxLines: metric.maxLines, ...opts });
    if (r.changed) breaks.push({ where, from: text, to: r.text });
    if (r.overflow) breaks.push({ where, from: text, to: r.text, overflow: true, maxLinePx: Math.round(r.maxLinePx), limitPx: m.w });
    return r.text;
  };
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
    if (s.titleLayout && s.titleLayout !== titleLayout) notes.push(`${where[id]}: 섹션별 titleLayout('${s.titleLayout}') 은 허용되지 않음 — 페이지 값 '${titleLayout}' 으로 통일`);
    const TL = { titleLayout };

    if (p === "header") { out.push({ ...base, props: { ...TL, logoText: meta.brand || "오늘의집" } }); continue; }
    if (p === "footer") { out.push({ ...base, props: { ...TL, copyright: s.copyright || "© 2026 BUCKETPLACE Co., Ltd." } }); continue; }
    if (p === "sticky-cta") {
      out.push({ ...base, props: { ...TL, label: s.label || ctaLabel, href: s.href || cta.href || "#" }, visibility: { mobile: true, tablet: true, desktop: true, ...(s.visibility || {}) } }); // PC 도 노출 (max-width 480 중앙)
      continue;
    }
    if (p === "hero") {
      const asset = resolveAsset(s.asset, { role: "media", alt: s.title, used, log: assetLog, where: `${id}.background` });
      const heroTitle = autoBreak(`${where[id]}.title`, s.title || "", { ...SLOT_METRICS.heroTitle[titleLayout], maxLines: SLOT_METRICS.heroTitle.maxLines }, { preferTwoLinesFrom: 12 });
      out.push({ ...base, props: { ...TL, eyebrow: s.eyebrow || "", title: heroTitle, subtitle: s.subtitle || "", primaryCtaLabel: s.cta || ctaLabel, secondaryCtaLabel: s.secondaryCta || "" }, assets: asset ? [{ slotName: "background", asset }] : [] });
      continue;
    }
    if (p === "cta-form") {
      const fields = (s.fields || [{ label: "이름", placeholder: "이름을 입력해 주세요" }, { label: "연락처", placeholder: "010-0000-0000", type: "tel" }]).map((f, i) => ({ id: `${id}-f${i + 1}`, preset: "form-field", props: { label: f.label, placeholder: f.placeholder || "", fieldType: f.type || "text", required: f.required !== false }, assets: [] }));
      out.push({ ...base, props: { ...TL, sectionTitle: autoBreak(`${where[id]}.title`, s.title || "", SLOT_METRICS.sectionTitle, { preferTwoLinesFrom: 12 }), sectionSubtitle: s.subtitle || "", submitLabel: s.submit || ctaLabel, consentText: s.consent || "" }, slots: { fields } });
      continue;
    }

    // ── 본문 카드 섹션 ──
    const preset = PRESET_RULES[p];
    const items = s.items || [];
    const pick = chooseCardUsage(p, s);
    cardChoices.push({ where: where[id], preset: p, usage: pick.usage, reason: pick.reason, warn: !!pick.warn });
    // 선택된 usage 가 기본이 아니면 USAGE_RULES 의 레이아웃·개수 규칙으로 교체 (usage 필드만 덮어씀)
    const rule = pick.usage === preset.usage ? preset : { ...preset, usage: pick.usage, cardTypes: undefined, ...USAGE_RULES[pick.usage] };
    const layoutKey = rule.layouts[s.layout] ? s.layout : rule.defaultLayout;
    if (s.layout && !rule.layouts[s.layout]) notes.push(`${id}: layout '${s.layout}' 는 ${rule.usage} 에서 허용되지 않아 '${rule.defaultLayout}' 로 보정`);
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
      } else if (rule.usage === "linkcard") {
        Object.assign(c.slots, { title: text(it.title), links: { kind: "links", items: (it.links || []).map((l) => (typeof l === "string" ? { label: l } : { label: l.label, url: l.url, actions: l.actions })) } });
        if (it.href || it.moreHref) c.slots.cta = { kind: "cta", label: it.moreLabel || "더보기", url: it.moreHref || it.href };
      } else if (rule.usage === "pillcard") {
        Object.assign(c.slots, { title: text(it.title) });
        const ic = resolveAsset(it.asset || it.icon, { role: "icon-small", alt: it.title, used, log: assetLog, where });
        if (ic) c.slots.icon = { kind: "asset", asset: ic };
      } else if (rule.usage === "kvcard") {
        Object.assign(c.slots, { title: text(it.title), rows: { kind: "rows", items: (it.rows || []).map(splitKv).filter(Boolean) } });
        if (it.rail === false || s.rail === false) c.theme = "grey"; // 레일 끔
      } else if (rule.usage === "stepcard") {
        Object.assign(c.slots, { stepNumber: text(it.step ?? String(i + 1)), title: text(it.title), body: text(it.body) });
        const ic = resolveAsset(it.icon || it.asset, { role: "icon-small", alt: it.title, used, log: assetLog, where });
        if (ic) c.slots.icon = { kind: "asset", asset: ic };
      }
      for (const k of Object.keys(c.slots)) if (c.slots[k] === undefined) delete c.slots[k];
      return c;
    });

    const card = { id: `${id}-card`, preset: "card", props: { usage: rule.usage, layout: rule.layouts[layoutKey](cells.length), cells, cardType }, assets: [] };
    // 카드 타이틀은 1줄(ellipsis) 또는 2줄 제한 — 폭을 넘으면 리포트에 올려 카피를 줄이게 한다
    const cardMetric = rule.usage === "imgcard" ? (cardType === "leading-asset" ? SLOT_METRICS.leadingTitle : SLOT_METRICS.imgcardTitle) : rule.usage === "reviewcard" ? SLOT_METRICS.reviewTitle : rule.usage === "listcard" ? SLOT_METRICS.listcardTitle : rule.usage === "pillcard" ? SLOT_METRICS.pillTitle : rule.usage === "stepcard" ? SLOT_METRICS.stepTitle : rule.usage === "linkcard" ? SLOT_METRICS.linkGroupTitle : null;
    if (cardMetric) items.forEach((it, i) => { const t = it.title; if (!t) return; const r = breakLines(t, { maxWidthPx: cardMetric.mobile.w, fontPx: cardMetric.mobile.f, maxLines: cardMetric.maxLines }); if (r.overflow) breaks.push({ where: `${where[id]}.items[${i}].title`, from: t, overflow: true, maxLinePx: Math.round(r.maxLinePx), limitPx: cardMetric.mobile.w, maxLines: cardMetric.maxLines }); });
    out.push({ ...base, props: { ...TL, sectionTitle: autoBreak(`${where[id]}.title`, s.title || "", SLOT_METRICS.sectionTitle, { preferTwoLinesFrom: 12 }), sectionSubtitle: s.subtitle || "" }, slots: { content: [card] } });
  }

  for (const a of assetLog) a.where = a.where.replace(/^sec-[a-z-]+-\d+/, (m) => where[m] || m);
  const now = new Date().toISOString();
  const doc = {
    id: `doc-${meta.slug || "draft"}`,
    schemaVersion: "1.0.0",
    meta: { slug: meta.slug || "draft", title: meta.title || "랜딩페이지 시안", description: meta.description || "", category: meta.category || "other", owners: {}, titleLayout },
    sections: out,
    audit: { createdAt: now, updatedAt: now, createdBy: spec.author || "lp-harness", updatedBy: spec.author || "lp-harness" },
  };
  return { doc, assetLog, notes, where, breaks, titleLayout, cardChoices };
}
