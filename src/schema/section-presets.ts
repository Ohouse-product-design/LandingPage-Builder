/**
 * 섹션 프리셋 카탈로그 (v2 — Card 통합 후).
 *
 * 변경: 모든 카드형 슬롯의 allows 가 단일 "card" 로 통일.
 * Card 인스턴스가 layout(grid/carousel/row) 을 가지므로
 * 섹션 단에서는 "어떤 컨테이너든 들어갈 수 있다" 로 단순화된다.
 */

import type { UISpec } from "./ui-spec";
import type { ComponentPresetId } from "./component-presets";

export type SectionPresetId =
  // 고정 영역 (locked)
  | "header"
  | "hero"
  | "sticky-cta"
  | "footer"
  // 가변 영역
  | "usp"
  | "table"
  | "coverage"
  | "review"
  | "process"
  | "cross-sell"
  | "cta-form";

export interface SectionSlotSpec {
  name: string;
  allows: ComponentPresetId[];
  min: number;
  max: number;
  label: string;
}

export interface SectionAssetSpec {
  slotName: string;
  label: string;
  recommended?: { width: number; height: number };
  required: boolean;
}

export interface SectionPreset {
  id: SectionPresetId;
  label: string;
  description: string;
  category: "fixed" | "hero" | "content" | "cta";
  defaultLocked: boolean;
  icon: string;
  uiSpec: UISpec;
  slots: SectionSlotSpec[];
  assets: SectionAssetSpec[];
  maxPerPage: number;
}

// ---------------------------------------------------------------------------
// 카탈로그
// ---------------------------------------------------------------------------

export const SECTION_PRESETS: Record<SectionPresetId, SectionPreset> = {
  header: {
    id: "header",
    label: "헤더",
    description: "로고/네비게이션. 모든 페이지 공통, 순서 변경 불가",
    category: "fixed",
    defaultLocked: true,
    icon: "PanelTop",
    uiSpec: { logoText: { maxChar: 10, maxLine: 1 } },
    slots: [],
    assets: [
      { slotName: "logo", label: "로고", required: false, recommended: { width: 120, height: 32 } },
    ],
    maxPerPage: 1,
  },

  hero: {
    id: "hero",
    label: "히어로",
    description: "메인 카피·서브 카피·CTA·메인 이미지",
    category: "hero",
    defaultLocked: true,
    icon: "Sparkles",
    uiSpec: {
      eyebrow: { maxChar: 20, maxLine: 1 },
      title: { maxChar: 48, maxLine: 3, required: true },
      subtitle: { maxChar: 48, maxLine: 2 },
      primaryCtaLabel: { maxChar: 20, maxLine: 1, required: true },
      secondaryCtaLabel: { maxChar: 20, maxLine: 1 },
    },
    slots: [],
    assets: [
      {
        slotName: "background",
        label: "히어로 이미지",
        required: true,
        recommended: { width: 600, height: 400 },
      },
    ],
    maxPerPage: 1,
  },

  usp: {
    id: "usp",
    label: "USP 카드",
    description: "강점/문제정의 카드 — 통상 grid 레이아웃 사용",
    category: "content",
    defaultLocked: false,
    icon: "LayoutGrid",
    uiSpec: {
      sectionTitle: { maxChar: 22, maxLine: 2, required: true },
      sectionSubtitle: { maxChar: 18, maxLine: 1 },
    },
    slots: [
      {
        name: "content",
        label: "카드 컨테이너",
        allows: ["card"], // ★ 단일 card
        min: 1,
        max: 1,
      },
    ],
    assets: [],
    maxPerPage: 3,
  },

  table: {
    id: "table",
    label: "비교 테이블",
    description: "타사 vs 자사 vs 책임보장 등 비교형 표",
    category: "content",
    defaultLocked: false,
    icon: "Table",
    uiSpec: {
      sectionTitle: { maxChar: 22, maxLine: 2, required: true },
      sectionSubtitle: { maxChar: 18, maxLine: 1 },
      colHeaders: { maxLine: 1 },
    },
    slots: [
      {
        name: "rows",
        label: "비교 행",
        allows: ["table-row"],
        min: 1,
        max: 12,
      },
    ],
    assets: [],
    maxPerPage: 2,
  },

  coverage: {
    id: "coverage",
    label: "책임보장 (신뢰)",
    description: "보장 범위·파트너 로고 등으로 신뢰 강화",
    category: "content",
    defaultLocked: false,
    icon: "ShieldCheck",
    uiSpec: {
      sectionTitle: { maxChar: 22, maxLine: 2, required: true },
      sectionSubtitle: { maxChar: 18, maxLine: 1 },
    },
    slots: [
      {
        name: "content",
        label: "카드 컨테이너",
        allows: ["card"],
        min: 1,
        max: 1,
      },
    ],
    assets: [{ slotName: "partnerLogos", label: "파트너 로고", required: false }],
    maxPerPage: 2,
  },

  review: {
    id: "review",
    label: "리뷰",
    description: "고객 후기 — 통상 carousel 레이아웃 (autoScroll on/off)",
    category: "content",
    defaultLocked: false,
    icon: "MessagesSquare",
    uiSpec: {
      sectionTitle: { maxChar: 22, maxLine: 2, required: true },
      sectionSubtitle: { maxChar: 18, maxLine: 1 },
    },
    slots: [
      {
        name: "content",
        label: "카드 컨테이너",
        allows: ["card"],
        min: 1,
        max: 1,
      },
      { name: "tabs", label: "탭 (선택)", allows: ["tab"], min: 0, max: 4 },
    ],
    assets: [],
    maxPerPage: 2,
  },

  process: {
    id: "process",
    label: "프로세스",
    description: "이용 단계 N-step. grid 또는 row 레이아웃",
    category: "content",
    defaultLocked: false,
    icon: "ListOrdered",
    uiSpec: {
      sectionTitle: { maxChar: 22, maxLine: 2, required: true },
      sectionSubtitle: { maxChar: 18, maxLine: 1 },
    },
    slots: [
      {
        name: "content",
        label: "카드 컨테이너",
        allows: ["card"],
        min: 1,
        max: 1,
      },
    ],
    assets: [],
    maxPerPage: 2,
  },

  "cross-sell": {
    id: "cross-sell",
    label: "크로스셀링",
    description: "관련 서비스 카드 — row 또는 grid",
    category: "content",
    defaultLocked: false,
    icon: "Boxes",
    uiSpec: {
      sectionTitle: { maxChar: 22, maxLine: 2, required: true },
      sectionSubtitle: { maxChar: 18, maxLine: 1 },
    },
    slots: [
      {
        name: "content",
        label: "카드 컨테이너",
        allows: ["card"],
        min: 1,
        max: 1,
      },
    ],
    assets: [],
    maxPerPage: 1,
  },

  "cta-form": {
    id: "cta-form",
    label: "폼 / 전화 CTA",
    description: "상담 신청 폼 또는 전화 CTA 박스",
    category: "cta",
    defaultLocked: false,
    icon: "PhoneCall",
    uiSpec: {
      sectionTitle: { maxChar: 22, maxLine: 2, required: true },
      sectionSubtitle: { maxChar: 24, maxLine: 1 },
      submitLabel: { maxChar: 12, maxLine: 1, required: true },
      consentText: { maxChar: 100, maxLine: 3 },
    },
    slots: [
      { name: "fields", label: "폼 필드", allows: ["form-field"], min: 1, max: 8 },
    ],
    assets: [],
    maxPerPage: 2,
  },

  "sticky-cta": {
    id: "sticky-cta",
    label: "하단 고정 CTA",
    description: "스크롤 따라오는 고정 버튼 바",
    category: "fixed",
    defaultLocked: true,
    icon: "ArrowDownToLine",
    uiSpec: { label: { maxChar: 16, maxLine: 1, required: true } },
    slots: [],
    assets: [],
    maxPerPage: 1,
  },

  footer: {
    id: "footer",
    label: "푸터",
    description: "회사 정보·약관 링크. 공통 영역, 순서 변경 불가",
    category: "fixed",
    defaultLocked: true,
    icon: "PanelBottom",
    uiSpec: { copyright: { maxChar: 60, maxLine: 1 } },
    slots: [],
    assets: [],
    maxPerPage: 1,
  },
};

export const SECTION_PRESET_LIST: SectionPreset[] = Object.values(SECTION_PRESETS);

export function isLockedByDefault(preset: SectionPresetId): boolean {
  return SECTION_PRESETS[preset].defaultLocked;
}
