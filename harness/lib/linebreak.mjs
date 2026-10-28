/**
 * 가독성 줄바꿈 — 타이틀/카드 문구의 줄바꿈을 실제 글꼴 폭으로 판단한다.
 *
 *  - 폭: Pretendard SemiBold 실측 글자폭(catalog/font-widths.json, em 단위) × font-size
 *  - 경계: 공백에서만 끊되, 의미 단위를 우선 — 쉼표·가운뎃점 뒤 > 조사(은/는/이/가/도/를/을/에/로/과/와/의/까지/부터/면/에서) 뒤 > 일반 공백
 *  - 균형: 줄 수 최소 → 줄 길이 편차 최소 (text-wrap: balance 와 같은 목표) → 마지막 줄이 1~2글자 고아가 되지 않게
 *  - 이미 `\n` 이 있으면 손대지 않고, 각 줄이 폭을 넘는지만 검사한다
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const FW = JSON.parse(fs.readFileSync(path.join(here, "../catalog/font-widths.json"), "utf8"));
const LETTER_SPACING_EM = -0.3 / 16; // -0.3px @16px 기준 근사

export function textWidthPx(text, fontPx) {
  let em = 0;
  for (const ch of text) {
    const c = ch.codePointAt(0);
    if (c >= 0xac00 && c <= 0xd7a3) em += FW.hangul;
    else if (FW.ascii[ch] !== undefined) em += FW.ascii[ch];
    else if (FW.extra[ch] !== undefined) em += FW.extra[ch];
    else if (c >= 0x3130 && c <= 0x318f) em += FW.hangul; // 자모
    else em += FW.hangul; // CJK 기호 등 보수적으로 1em 근사
    em += LETTER_SPACING_EM;
  }
  return em * fontPx;
}

const PARTICLE = /(은|는|이|가|도|을|를|에|로|과|와|의|까지|부터|면|에서|보다|처럼|마다|라면|니까)$/;
const PUNCT_END = /[,，·…!?]$/;
/** 뒤 명사를 꾸미는 말 — 다음 단어와 떼어놓지 않는다 ("다른 | 모습", "검증된 | 전문가") */
const DETERMINER = /^(다른|새|첫|큰|작은|모든|어떤|이런|그런|저런|같은|많은|여러|각|매|온|한|두|세|네|몇|진짜|더)$/;
const ADNOMINAL_END = /(한|된|는|던|될|할|인|올|온|운|은)$/;
const TINY = (w) => [...w].length <= 1;

/** 공백 경계의 "끊기 좋음" 점수 (높을수록 좋음) */
function boundaryScore(prevWord, nextWord) {
  let s = 0;
  if (PUNCT_END.test(prevWord)) s += 3;
  else if (PARTICLE.test(prevWord)) s += 2;
  if (TINY(prevWord)) s -= 2; // "집 \n" 처럼 1글자 남기기 회피
  if (TINY(nextWord)) s -= 1;
  if (DETERMINER.test(prevWord)) s -= 4;
  else if (ADNOMINAL_END.test(prevWord) && !PARTICLE.test(prevWord)) s -= 2.5;
  return s;
}

/**
 * @returns {{text:string, lines:string[], changed:boolean, overflow:boolean, maxLinePx:number}}
 */
export function breakLines(text, { maxWidthPx, fontPx, maxLines = 2, preferTwoLinesFrom = Infinity }) {
  const raw = String(text ?? "");
  const width = (t) => textWidthPx(t, fontPx);
  if (raw.includes("\n")) {
    const lines = raw.split("\n");
    const maxLinePx = Math.max(...lines.map(width));
    return { text: raw, lines, changed: false, overflow: maxLinePx > maxWidthPx || lines.length > maxLines, maxLinePx };
  }
  const words = raw.split(/\s+/).filter(Boolean);
  // 헤드라인은 글자수가 어느 정도 되면 균형 잡힌 2줄이 더 읽기 좋다 (참고 시안과 동일한 판단)
  const wantTwo = [...raw.replace(/\s/g, "")].length >= preferTwoLinesFrom && words.length >= 3;
  if (words.length <= 1 || (width(raw) <= maxWidthPx && !wantTwo)) {
    return { text: raw, lines: [raw], changed: false, overflow: width(raw) > maxWidthPx, maxLinePx: width(raw) };
  }

  // 모든 분할 조합(단어 ≤ 12개 기준 충분히 작음) 중 최적 탐색
  const n = words.length;
  let best = null;
  const evalSplit = (breaks) => {
    const lines = [];
    let start = 0;
    for (const b of [...breaks, n]) { lines.push(words.slice(start, b).join(" ")); start = b; }
    const widths = lines.map(width);
    const maxPx = Math.max(...widths);
    const over = maxPx > maxWidthPx;
    const mean = widths.reduce((a, b) => a + b, 0) / widths.length;
    const variance = widths.reduce((a, b) => a + (b - mean) ** 2, 0) / widths.length;
    let bonus = 0;
    for (const b of breaks) bonus += boundaryScore(words[b - 1], words[b]);
    const lastLen = [...lines[lines.length - 1]].length;
    const orphan = lastLen <= 2 ? 1 : 0;
    // 목표: 줄 수 ↓, 넘침 ✗, 편차 ↓, 경계 점수 ↑, 고아 ✗
    const lineCost = wantTwo ? Math.abs(lines.length - 2) * 1e4 : lines.length * 1e4;
    const cost = (over ? 1e6 : 0) + lineCost + Math.sqrt(variance) * 2 - bonus * 40 + orphan * 500;
    return { lines, cost, maxPx, over };
  };
  const rec = (start, breaks) => {
    if (breaks.length >= maxLines - 1) { const r = evalSplit(breaks); if (!best || r.cost < best.cost) best = r; return; }
    const r0 = evalSplit(breaks); if (!best || r0.cost < best.cost) best = r0;
    for (let b = start + 1; b < n; b++) rec(b, [...breaks, b]);
  };
  rec(0, []);
  const lines = best.lines;
  return { text: lines.join("\n"), lines, changed: lines.length > 1, overflow: best.over, maxLinePx: best.maxPx };
}

/**
 * 자리별 측정 규격 — 렌더 컴포넌트의 폰트/컨테이너와 1:1.
 * 모바일(375)이 가장 좁아 기준이 되고, 데스크톱은 폰트만 커지므로 별도 검사.
 */
export const SLOT_METRICS = {
  heroTitle:     { center: { mobile: { w: 318 - 40, f: 28 }, desktop: { w: 720 - 40, f: 32 } }, split: { mobile: { w: 343 - 40, f: 28 }, desktop: { w: 560, f: 32 } }, maxLines: 3 },
  sectionTitle:  { mobile: { w: 375 - 32, f: 24 }, desktop: { w: 1256 - 32, f: 32 }, maxLines: 2 },
  imgcardTitle:  { mobile: { w: 300 - 40, f: 20 }, maxLines: 1 },        // bgfullimg: nowrap ellipsis, 카드 폭 ≤300 - px-5
  leadingTitle:  { mobile: { w: 300 - 40, f: 20 }, maxLines: 1 },
  reviewTitle:   { mobile: { w: 280 - 32, f: 16 }, maxLines: 2 },
  listcardTitle: { mobile: { w: 375 - 32 - 16 - 56 - 48, f: 16 }, maxLines: 1 },
};
