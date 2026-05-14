/**
 * 컴포넌트 프리셋 카탈로그 (v2 — Card 통합 리팩토링 후).
 *
 * 변경 요약:
 * - 기존 4종(UspCard / ReviewCard / StepCard / ServiceCard) 을 단일 "card" 프리셋으로 통합.
 *   → card 는 layout(grid/carousel/row) + cells(slot 시스템) 구조.
 *   → 사용 패턴(usp/review/step/service/custom) 은 src/schema/card.ts 의 CARD_USAGE_PRESETS 참조.
 * - table-row / form-field / tab / badge 는 카드와 의미가 달라 별도 프리셋으로 유지.
 */

import type { UISpec } from "./ui-spec";

export type ComponentPresetId =
  | "card" // ★ 통합 카드 — layout + cells
  | "table-row"
  | "form-field"
  | "tab"
  | "badge";

export interface ComponentPreset {
  id: ComponentPresetId;
  label: string;
  description: string;
  icon: string;
  /** 컴포넌트 인스턴스의 컨테이너 단 props 에 대한 UI Spec */
  uiSpec: UISpec;
  /** 컴포넌트 인스턴스 단 에셋 슬롯 — card 의 경우 cell 단에서 별도 처리하므로 비어있음 */
  assetSlots: { name: string; label: string; required: boolean }[];
}

export const COMPONENT_PRESETS: Record<ComponentPresetId, ComponentPreset> = {
  card: {
    id: "card",
    label: "Card",
    description:
      "단일 상위 컴포넌트. layout(grid/carousel/row) 으로 배치를 결정하고, 각 cell 은 slot 시스템으로 콘텐츠를 갖는다.",
    icon: "LayoutGrid",
    uiSpec: {
      // 컨테이너 단 옵션 — 자세한 layout 세부 옵션은 CardLayoutSettings 로 별도 관리
      usage: {
        inputType: "enum",
        enumOptions: [
          { value: "usp", label: "USP 카드" },
          { value: "review", label: "리뷰 카드" },
          { value: "step", label: "프로세스 스텝" },
          { value: "service", label: "서비스 카드" },
          { value: "custom", label: "커스텀" },
        ],
        required: true,
        help: "셀의 슬롯 활성화 + 제약을 결정합니다",
      },
    },
    assetSlots: [],
  },

  "table-row": {
    id: "table-row",
    label: "테이블 행",
    description: "비교 테이블의 한 행 — 좌/중/우 셀",
    icon: "Rows",
    uiSpec: {
      label: { maxChar: 20, maxLine: 2, required: true },
      colA: { maxChar: 30, maxLine: 2 },
      colB: { maxChar: 30, maxLine: 2 },
      colC: { maxChar: 30, maxLine: 2 },
    },
    assetSlots: [],
  },

  "form-field": {
    id: "form-field",
    label: "폼 필드",
    description: "라벨/placeholder/유효성을 갖는 입력 필드",
    icon: "FormInput",
    uiSpec: {
      label: { maxChar: 20, maxLine: 1, required: true },
      placeholder: { maxChar: 30, maxLine: 1 },
      fieldType: {
        inputType: "enum",
        enumOptions: [
          { value: "text", label: "텍스트" },
          { value: "tel", label: "전화" },
          { value: "email", label: "이메일" },
          { value: "select", label: "선택" },
          { value: "checkbox", label: "체크박스" },
        ],
      },
    },
    assetSlots: [],
  },

  tab: {
    id: "tab",
    label: "탭",
    description: "탭바의 한 항목 — 라벨 + 콘텐츠 키",
    icon: "PanelTopOpen",
    uiSpec: {
      label: { maxChar: 10, maxLine: 1, required: true },
      contentKey: { maxChar: 30, maxLine: 1, required: true },
    },
    assetSlots: [],
  },

  badge: {
    id: "badge",
    label: "배지",
    description: "아이콘 + 라벨, 그라디언트 배경",
    icon: "BadgeCheck",
    uiSpec: {
      label: { maxChar: 12, maxLine: 1, required: true },
    },
    assetSlots: [{ name: "icon", label: "배지 아이콘", required: false }],
  },
};

export const COMPONENT_PRESET_LIST: ComponentPreset[] =
  Object.values(COMPONENT_PRESETS);
