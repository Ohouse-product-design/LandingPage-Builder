import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import SectionPresetMenu from "./SectionPresetMenu";
import { SECTION_PRESETS } from "@/schema/section-presets";
import {
  SECTION_ADD_BASIC_PRESET_IDS,
  SECTION_ADD_MARKETING_ENTRIES,
  sectionAddMenuLabel,
} from "./section-add-menu";

/**
 * "+ 섹션 추가" 메뉴의 preset 라벨/설명을 Storybook Controls 패널에서
 * 실시간으로 편집해볼 수 있는 스토리.
 *
 * `AsInSectionTree` / `WithMarketingLayouts` 는 `SectionTree` 와 동일한 옵션 구성
 * (`section-add-menu.ts`). 자세한 규칙은 루트 README.md 「좌측 SectionTree와 섹션 추가 메뉴」절을 참고.
 */

const treeDefaultEntries = SECTION_ADD_BASIC_PRESET_IDS.map((p) => ({
  id: p,
  label: SECTION_PRESETS[p].label,
  description: SECTION_PRESETS[p].description,
  group: "기본",
}));

const marketingLayoutEntries = SECTION_ADD_MARKETING_ENTRIES.map((e, i) => ({
  id: `${e.preset}-${e.variant}-${i}`,
  label: sectionAddMenuLabel(e.preset, e.variant),
  group: "마케팅 풀페이지 UI",
}));

// 전체 스키마 카탈로그 (문서·스펙 참고용 — 빌더 드롭다운과 항목 수가 다름)
const fullCatalogEntries = Object.values(SECTION_PRESETS).map((p) => ({
  id: p.id,
  label: p.label,
  description: p.description,
  group: "전체 카탈로그",
}));

const meta: Meta<typeof SectionPresetMenu> = {
  title: "Builder/Editor/SectionPresetMenu",
  component: SectionPresetMenu,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          'SectionTree 의 "+ 섹션 추가" 메뉴를 라벨 편집 가능한 형태로 노출합니다. ' +
          "Controls 패널에서 각 항목의 label/description 을 수정하면 즉시 반영됩니다.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof SectionPresetMenu>;

/** SectionTree 「기본」그룹과 동일 — 7개 프리셋 */
export const AsInSectionTree: Story = {
  args: { entries: treeDefaultEntries },
};

/** SectionTree 「기본」+「마케팅 풀페이지 UI」와 동일 */
export const WithMarketingLayouts: Story = {
  args: { entries: [...treeDefaultEntries, ...marketingLayoutEntries] },
};

/** SECTION_PRESETS 전체 (고정 영역 포함) — 스키마 검토용 */
export const FullCatalog: Story = {
  args: { entries: fullCatalogEntries },
};

/**
 * 라벨만 빠르게 수정 — 자주 바뀌는 4개 항목을 따로 보기.
 */
export const QuickLabelEdit: Story = {
  args: {
    entries: [
      { id: "usp", label: "USP 카드", description: "강점/문제정의 카드", group: "편집 대상" },
      { id: "review", label: "리뷰", description: "고객 후기 (carousel)", group: "편집 대상" },
      { id: "process", label: "프로세스", description: "이용 단계 N-step", group: "편집 대상" },
      { id: "cta-form", label: "폼 / 전화 CTA", description: "상담 신청 폼 또는 전화 CTA 박스", group: "편집 대상" },
    ],
  },
};
