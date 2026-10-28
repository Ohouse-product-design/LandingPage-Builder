/**
 * lp-spec 검증 — Section-Guidelines §6(라이팅/글자수) + §4-5(cell 수) + 배포 전 체크리스트.
 * level: error(반드시 수정) | warn(검수 시 확인) | info
 * 글자수는 빌더 validate.ts 와 동일하게 String.length(줄바꿈 포함) 기준.
 */
import { PRESET_RULES, TITLE_LAYOUTS, chooseCardUsage, USAGE_RULES } from "./compile.mjs";

export const LIMITS = {
  hero: { eyebrow: [20, 1], title: [48, 3, true], subtitle: [48, 2], cta: [20, 1] },
  section: { title: [22, 2, true], subtitle: [18, 1] },
  "cta-form": { title: [22, 2, true], subtitle: [24, 1], submit: [12, 1, true] },
  "sticky-cta": { label: [16, 1, true] },
  imgcard: { tag: [12, 1], step: [4, 1], title: [20, 2, true], body: [40, 2] },
  reviewcard: { title: [40, 2, true], body: [180, 3, true] },
  listcard: { title: [20, 1, true], body: [40, 2] },
  tablecard: { title: [24, 1, true], row: [32, 2] },
  faqcard: { q: [80, 2, true], a: [400, 10, true] },
  linkcard: { title: [10, 1, true], link: [24, 1], more: [8, 1] },
  pillcard: { title: [14, 1, true] },
  kvcard: { title: [24, 1], label: [12, 1, true], value: [10, 1, true] },
  stepcard: { title: [20, 2, true], body: [24, 1] },
};

/** 과장·단정·검증 불가 표현 — 근거(각주) 없이 쓰면 안 됨 */
export const BANNED = ["최고", "최저가", "업계 1위", "국내 1위", "무조건", "100%", "완벽", "평생", "절대", "공짜", "대박", "역대급"];
/** CTA 는 행동 동사로 끝나야 함 (해요체/명사형 동작 허용) */
const CTA_OK = /(하기|받기|보기|시작|신청|확인|예약|문의|상담|구독|가입|다운로드|참여|만나기|알아보기|비교|찾기|담기|구매|주문|계산|등록|요청|하러 가기|가기|볼래요|할래요|해요|받아요)$/;

const len = (s) => (s ? String(s).length : 0);
const lines = (s) => (s ? String(s).split(/\r?\n/).length : 0);

export function validateSpec(spec, { assetLog = [], notes = [], breaks = [], cardChoices = [] } = {}) {
  const issues = [];
  const push = (level, where, msg, fix) => issues.push({ level, where, msg, ...(fix ? { fix } : {}) });
  const check = (where, value, [max, maxLine, required]) => {
    if (required && !String(value ?? "").trim()) return push("error", where, "필수 항목이 비어 있음");
    if (!value) return;
    if (len(value) > max) push("error", where, `${max}자 초과 (현재 ${len(value)}자)`, "의미 단위로 줄이거나 \\n 으로 끊기");
    if (maxLine && lines(value) > maxLine) push("error", where, `${maxLine}줄 초과 (현재 ${lines(value)}줄)`);
    for (const w of BANNED) if (String(value).includes(w)) push("warn", where, `과장/단정 표현 '${w}' — 근거 각주가 없으면 교체 권장`);
  };
  const checkCta = (where, label) => {
    if (label && !CTA_OK.test(String(label).trim())) push("warn", where, `CTA '${label}' 가 행동 동사로 끝나지 않음`, "예: 견적 받기 · 상담 신청하기 · 자세히 보기");
  };

  if (!TITLE_LAYOUTS.includes(spec.titleLayout)) push("error", "titleLayout", `페이지 타이틀 레이아웃을 반드시 택1: ${TITLE_LAYOUTS.map((t) => `'${t}'`).join(" | ")} (center=[타이틀][에셋] 중앙 정렬 · split=[타이틀][에셋] 일렬 정렬)`);
  for (const [i, s] of (spec.sections || []).entries()) if (s.titleLayout && s.titleLayout !== spec.titleLayout) push("error", `sections[${i}].titleLayout`, `섹션별 레이아웃 지정 금지 — 한 페이지는 하나의 titleLayout('${spec.titleLayout}')`);
  if (!spec.meta?.slug) push("error", "meta.slug", "slug 필요");
  if (!spec.meta?.title) push("error", "meta.title", "SEO title 필요");
  else if (len(spec.meta.title) > 60) push("warn", "meta.title", `SEO title 60자 초과 (${len(spec.meta.title)}자)`);
  if (spec.meta?.description && len(spec.meta.description) > 120) push("warn", "meta.description", "120자 초과");
  if (!spec.cta?.label) push("error", "cta.label", "전역 CTA 라벨 필요");
  else { check("cta.label", spec.cta.label, [20, 1, true]); checkCta("cta.label", spec.cta.label); }

  const sections = spec.sections || [];
  const contentCount = sections.filter((s) => PRESET_RULES[s.preset]).length;
  if (contentCount < 2) push("warn", "sections", `본문 섹션이 ${contentCount}개 — 최소 2개(가치 제안 + 신뢰/절차) 권장`);

  sections.forEach((s, si) => {
    const at = `sections[${si}](${s.preset})`;
    if (s.preset === "hero") {
      const L = LIMITS.hero;
      check(`${at}.eyebrow`, s.eyebrow, L.eyebrow); check(`${at}.title`, s.title, L.title); check(`${at}.subtitle`, s.subtitle, L.subtitle);
      check(`${at}.cta`, s.cta, L.cta); checkCta(`${at}.cta`, s.cta);
      if (!s.asset) push("warn", `${at}.asset`, "히어로 비주얼 미지정 → 기본 플레이스홀더");
      return;
    }
    if (s.preset === "sticky-cta") { check(`${at}.label`, s.label, [16, 1]); checkCta(`${at}.label`, s.label); return; }
    if (s.preset === "cta-form") {
      const L = LIMITS["cta-form"];
      check(`${at}.title`, s.title, L.title); check(`${at}.subtitle`, s.subtitle, L.subtitle); check(`${at}.submit`, s.submit || spec.cta?.label, L.submit);
      return;
    }
    const preset = PRESET_RULES[s.preset];
    if (!preset) return;
    check(`${at}.title`, s.title, LIMITS.section.title);
    check(`${at}.subtitle`, s.subtitle, LIMITS.section.subtitle);
    const items = s.items || [];
    const pick = chooseCardUsage(s.preset, s);
    const rule = pick.usage === preset.usage ? preset : { ...preset, usage: pick.usage, ...USAGE_RULES[pick.usage] };
    const [mn, mx] = rule.count;
    if (items.length === 0) push("error", `${at}.items`, "콘텐츠 0개 — 섹션이 렌더되지 않음");
    else if (items.length < mn || items.length > mx) push("warn", `${at}.items`, `${items.length}개 — ${rule.usage} 권장 ${mn}~${mx}개${rule.recommended ? ` (기본 ${rule.recommended})` : ""}`);
    const L = LIMITS[rule.usage];
    items.forEach((it, ii) => {
      const w = `${at}.items[${ii}]`;
      if (rule.usage === "imgcard") { check(`${w}.tag`, it.tag, L.tag); check(`${w}.step`, it.step, L.step); check(`${w}.title`, it.title, L.title); check(`${w}.body`, it.body, L.body); }
      if (rule.usage === "reviewcard") {
        check(`${w}.title`, it.title, L.title); check(`${w}.body`, it.body, L.body);
        const bolds = (String(it.body || "").match(/\*\*[^*]+\*\*/g) || []).length;
        if (bolds > 1) push("warn", `${w}.body`, `강조(**) ${bolds}회 — 1회 이하 권장`);
        if (it.rating !== undefined && (it.rating < 1 || it.rating > 5)) push("error", `${w}.rating`, "별점은 1~5");
      }
      if (rule.usage === "listcard") { check(`${w}.title`, it.title, L.title); check(`${w}.body`, it.body, L.body); }
      if (rule.usage === "tablecard") {
        check(`${w}.title`, it.title, L.title);
        const rows = it.rows || [];
        if (rows.length < 4 || rows.length > 6) push("error", `${w}.rows`, `행 ${rows.length}개 — tablecard 는 4~6행`);
        rows.forEach((r, ri) => check(`${w}.rows[${ri}]`, r, L.row));
      }
      if (rule.usage === "faqcard") { check(`${w}.q`, it.q ?? it.title, L.q); check(`${w}.a`, it.a ?? it.body, L.a); }
      if (rule.usage === "linkcard") {
        check(`${w}.title`, it.title, L.title); check(`${w}.moreLabel`, it.moreLabel, L.more);
        const links = it.links || []; const [lmn, lmx] = USAGE_RULES.linkcard.rows;
        if (links.length < lmn || links.length > lmx) push("warn", `${w}.links`, `링크 ${links.length}개 — ${lmn}~${lmx}개 권장`);
        links.forEach((l, li) => { const lab = typeof l === "string" ? l : l.label; check(`${w}.links[${li}]`, lab, L.link); const acts = (typeof l === "object" && l.actions) || []; for (const a of acts) if (!["download", "audio", "link", "arrow"].includes(a)) push("error", `${w}.links[${li}].actions`, `알 수 없는 액션 '${a}' — download | audio | link | arrow`); });
      }
      if (rule.usage === "pillcard") { check(`${w}.title`, it.title, L.title); if (!(it.asset || it.icon)) push("warn", `${w}.icon`, "혜택 필은 아이콘이 있어야 함"); }
      if (rule.usage === "kvcard") {
        check(`${w}.title`, it.title, L.title);
        const rows = it.rows || []; const [rmn, rmx] = USAGE_RULES.kvcard.rows;
        if (rows.length < rmn || rows.length > rmx) push("warn", `${w}.rows`, `행 ${rows.length}개 — ${rmn}~${rmx}행 권장`);
        rows.forEach((r, ri) => { const kv = typeof r === "object" ? r : (String(r).match(/^(.+?)\s*[:：|]\s*(.+)$/) || []).slice(1); const label = kv.label ?? kv[0], value = kv.value ?? kv[1]; check(`${w}.rows[${ri}].label`, label, L.label); check(`${w}.rows[${ri}].value`, value, L.value); });
      }
      if (rule.usage === "stepcard") { check(`${w}.title`, it.title, L.title); check(`${w}.body`, it.body, L.body); }
    });
    if (rule.usage === "tablecard" && items.length === 2) {
      const r0 = (items[0].rows || []).length, r1 = (items[1].rows || []).length;
      if (r0 !== r1) push("warn", `${at}.items`, `비교 카드 행 수 불일치 (${r0} vs ${r1}) — 같은 기준으로 맞추기`);
    }
    // 같은 섹션 안 문체 혼용 (해요체 vs 합니다체/반말 종결)
    const bodies = items.map((it) => [it.body, it.a].filter(Boolean).join(" ")).join(" ");
    const yo = (bodies.match(/요[.!?]?(\s|$)/g) || []).length;
    const da = (bodies.match(/(니다|한다|했다|이다)[.!?]?(\s|$)/g) || []).length;
    if (yo && da) push("warn", at, `문체 혼용 (해요체 ${yo} / 합니다·평서체 ${da}) — 한 섹션 안에서 통일`);
  });

  for (const c of cardChoices) push(c.warn ? "warn" : "info", c.where, `카드 변형 → ${c.usage} (${c.reason})`);
  for (const b of breaks) {
    if (b.overflow) push("warn", b.where, `실측 글자폭 기준 ${b.maxLinePx}px > ${b.limitPx}px (${b.maxLines ?? ""}줄 제한) — 모바일에서 잘림`, "핵심어를 앞으로 당기고 짧게");
    else push("info", b.where, `가독성 줄바꿈 적용: ${JSON.stringify(b.to)}`);
  }
  for (const a of assetLog) if (a.level) push(a.level, a.where, `${a.note}${a.query ? ` · query="${a.query}"` : ""}${a.candidates?.length ? ` · 후보: ${a.candidates.join(", ")}` : ""}`);
  for (const n of notes) push("info", "compile", n);

  const count = (l) => issues.filter((i) => i.level === l).length;
  return { ok: count("error") === 0, summary: { error: count("error"), warn: count("warn"), info: count("info") }, issues };
}
