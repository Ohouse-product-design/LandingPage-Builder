import { SECTION_PRESETS } from "@/schema/section-presets";
import type { SectionPresetId } from "@/schema/section-presets";

/**
 * `SectionTree` 「+ 섹션 추가」드롭다운과 동일한 preset 목록·표시 라벨 규칙.
 * 동작 설명은 루트 README.md 「좌측 SectionTree와 섹션 추가 메뉴」절을 참고.
 */

/** SectionTree 「+ 섹션 추가」> 기본 그룹 — 순서 유지 */
export const SECTION_ADD_BASIC_PRESET_IDS = [
  "usp",
  "table",
  "coverage",
  "review",
  "process",
  "cross-sell",
  "cta-form",
] as const satisfies readonly SectionPresetId[];

export type SectionAddMarketingEntry = {
  preset: SectionPresetId;
  variant: string;
};

/** SectionTree 「+ 섹션 추가」> 마케팅 풀페이지 UI — `addSection(preset, variant)` 와 동일 */
export const SECTION_ADD_MARKETING_ENTRIES: SectionAddMarketingEntry[] = [
  { preset: "hero", variant: "marketing" },
  { preset: "cta-form", variant: "marketing-form" },
  { preset: "usp", variant: "marketing" },
  { preset: "process", variant: "marketing" },
  { preset: "review", variant: "marketing" },
  { preset: "cta-form", variant: "marketing-contact" },
  { preset: "sticky-cta", variant: "marketing" },
];

/**
 * 드롭다운에 보이는 한 줄 라벨 (트리 행의 preset.label 과 동일 규칙 + 폼 변형만 접미사).
 * `builder-store` 의 새 섹션 `name` 접미사와 맞춤.
 */
export function sectionAddMenuLabel(
  preset: SectionPresetId,
  variant?: string
): string {
  const def = SECTION_PRESETS[preset];
  if (variant === "marketing-form") return `${def.label} · 상담 필드`;
  if (variant === "marketing-contact") return `${def.label} · 문의 박스`;
  return def.label;
}
