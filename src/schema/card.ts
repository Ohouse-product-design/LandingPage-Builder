/**
 * Card — 단일 상위 컴포넌트.
 *
 * 기존의 UspCard / ReviewCard / StepCard / ServiceCard 를 통합한 단일 컴포넌트.
 * Card 는 "레이아웃 컨테이너 + N개의 cell" 구조로 표현되며,
 * 각 cell 은 slot 시스템(media/tag/title/body/meta/rating/cta/icon/stepNumber)
 * 으로 콘텐츠를 갖는다.
 *
 *   Section
 *    └─ Card  (preset="card")
 *        ├─ layout      : "grid" | "carousel" | "row"
 *        ├─ layoutSettings  (레이아웃별 세부 옵션)
 *        └─ cells[]     : CardCell[]
 *             └─ slots  : { media?, tag?, title?, body?, meta?, rating?, ... }
 *
 * 어드민에서 Card 를 선택하면 Inspector 우측에서 layout 토글 + cells 트리를 편집한다.
 */

import type { AssetRef } from "./doc";

// ---------------------------------------------------------------------------
// Layout 타입
// ---------------------------------------------------------------------------

export type CardLayout = "grid" | "carousel" | "row";

/** grid — 화면을 n:n 분할 */
export interface GridLayoutSettings {
  /** 디바이스별 컬럼 수. mobile/tablet/desktop */
  columns: { mobile: number; tablet: number; desktop: number };
  /** 셀 간 간격 (ods spacing 토큰 단위로 매핑되는 px) */
  gap: number;
  /** 카드 자체의 최소 높이 (px). 비어두면 콘텐츠에 맞춤 */
  minCellHeight?: number;
}

/** carousel — 고정 너비 카드 + 좌우 스크롤 */
export interface CarouselLayoutSettings {
  /** 카드 한 장의 너비 (디바이스별) */
  cardWidth: { mobile: number; tablet: number; desktop: number };
  /** 카드 간 간격 (px) */
  gap: number;
  /**
   * x scroll 애니메이션 on/off 토글.
   * - true  : 자동으로 좌→우 흐르는 marquee (무한 루프)
   * - false : 사용자 드래그/스크롤 only
   */
  autoScroll: boolean;
  /** 자동 스크롤 한 사이클 시간 (ms). autoScroll=true 일 때만 사용 */
  autoScrollDurationMs?: number;
  /** loop 여부 (autoScroll=false 일 때 도달 후 처음으로 점프) */
  loop?: boolean;
  /** 좌우 화살표 노출 */
  showArrows?: boolean;
  /** 페이지 인디케이터(dots) 노출 */
  showDots?: boolean;
}

/** row — 한 줄 정렬 */
export interface RowLayoutSettings {
  /** 정렬 방식 */
  align: "start" | "center" | "end" | "between" | "around";
  /** 셀 간 간격 (px) */
  gap: number;
  /** 폭 초과 시 줄바꿈 여부 */
  wrap: boolean;
  /** 디바이스별 정렬을 다르게 가져갈 경우 */
  responsive?: {
    mobile?: { align: RowLayoutSettings["align"]; wrap: boolean };
    tablet?: { align: RowLayoutSettings["align"]; wrap: boolean };
    desktop?: { align: RowLayoutSettings["align"]; wrap: boolean };
  };
}

export type CardLayoutSettings =
  | { type: "grid"; settings: GridLayoutSettings }
  | { type: "carousel"; settings: CarouselLayoutSettings }
  | { type: "row"; settings: RowLayoutSettings };

// ---------------------------------------------------------------------------
// Cell / Slot
// ---------------------------------------------------------------------------

/**
 * Card 의 한 셀이 가질 수 있는 슬롯 이름.
 * - 슬롯은 모두 optional. 채운 슬롯만 렌더된다.
 * - 슬롯 이름은 ODS 디자인 토큰 / 스타일 규칙의 anchor 가 된다.
 */
export type CardSlotName =
  | "media"      // 카드의 메인 이미지/일러스트
  | "icon"       // 작은 아이콘 (서비스/배지 등)
  | "tag"        // 상단 작은 라벨
  | "stepNumber" // 프로세스 스텝 번호
  | "title"      // 카드 제목
  | "body"       // 카드 본문/설명
  | "meta"       // 부가 정보 (작성자/날짜/위치 등)
  | "rating"     // 별점
  | "cta";       // 카드 클릭 시 이동 액션

/** 슬롯의 콘텐츠. union 으로 슬롯별 데이터 형태가 결정됨. */
export type CardSlotContent =
  | { kind: "asset"; asset: AssetRef }
  | { kind: "text"; text: string; maxLines?: number }
  | { kind: "rating"; value: number; max?: number }
  | { kind: "meta"; items: string[] }
  | { kind: "cta"; label: string; url: string };

export interface CardCell {
  id: string;
  /** 슬롯별 콘텐츠. 키는 CardSlotName. 비어있는 슬롯은 키 자체가 없거나 undefined. */
  slots: Partial<Record<CardSlotName, CardSlotContent>>;
  /** 셀 단의 토큰 바인딩 (배경/보더 등) */
  tokens?: { propPath: string; tokenRef: string }[];
}

// ---------------------------------------------------------------------------
// Card UI Spec (per-slot 글자수/줄수 제약)
// ---------------------------------------------------------------------------

/**
 * 슬롯별 UI Spec.
 * - 어드민 입력 단계에서 실시간 글자수 카운터 + 줄수 제약을 적용한다.
 * - 텍스트 슬롯에만 maxChar/maxLine 이 의미가 있다.
 */
export interface CardSlotSpec {
  /** 텍스트 슬롯 — 최대 글자수 */
  maxChar?: number;
  /** 텍스트 슬롯 — 최대 줄수 */
  maxLine?: number;
  /** 필수 슬롯 여부 */
  required?: boolean;
  /** 슬롯에 허용되는 콘텐츠 kind */
  allowedKinds: CardSlotContent["kind"][];
  /** 어드민 UI 라벨 */
  label: string;
  /** 도움말 */
  help?: string;
}

/** 어떤 슬롯들이 활성화될지 + 각 슬롯의 스펙 — Card 자체는 변형이 없고, "사용 패턴" 만 다름 */
export type CardSlotSpecMap = Partial<Record<CardSlotName, CardSlotSpec>>;

// ---------------------------------------------------------------------------
// 사용 패턴 (USP/Review/Step/Service 등) — 슬롯 활성화 프리셋
// ---------------------------------------------------------------------------

/**
 * Card 자체는 단일 컴포넌트이지만, 섹션이 "이런 슬롯 조합으로 쓰겠다" 고 선언할 수 있다.
 * 어드민에서 "USP 카드 추가" / "리뷰 카드 추가" 처럼 빠르게 셀을 만들 때
 * 어떤 슬롯을 활성화/비활성화할지 결정하는 가이드.
 */
export type CardUsagePresetId = "usp" | "review" | "step" | "service" | "custom";

export interface CardUsagePreset {
  id: CardUsagePresetId;
  label: string;
  description: string;
  /** 활성화될 슬롯 + 슬롯별 제약 */
  slotSpec: CardSlotSpecMap;
  /** 셀을 새로 만들 때 사용할 기본 콘텐츠 (placeholder) */
  defaultCell: () => Partial<Record<CardSlotName, CardSlotContent>>;
}

export const CARD_USAGE_PRESETS: Record<CardUsagePresetId, CardUsagePreset> = {
  usp: {
    id: "CardContents",
    label: "콘텐츠 카드",
    description: "키메시지와 이미지로 구성된 콘텐츠 카드",
    slotSpec: {
      tag: { maxChar: 12, maxLine: 1, allowedKinds: ["text"], label: "태그" },
      title: { maxChar: 20, maxLine: 2, required: true, allowedKinds: ["text"], label: "헤드라인" },
      body: { maxChar: 32, maxLine: 2, allowedKinds: ["text"], label: "설명" },
      media: { allowedKinds: ["asset"], label: "이미지" },
    },
    defaultCell: () => ({
      tag: { kind: "text", text: "" },
      title: { kind: "text", text: "" },
      body: { kind: "text", text: "" },
    }),
  },

  review: {
    id: "CardReview",
    label: "리뷰 카드",
    description: "리뷰 항목으로 구성된 카드",
    slotSpec: {
      rating: { allowedKinds: ["rating"], label: "별점" },
      title: { maxChar: 24, maxLine: 2, required: true, allowedKinds: ["text"], label: "제목" },
      body: { maxChar: 120, maxLine: 5, required: true, allowedKinds: ["text"], label: "본문" },
      meta: { allowedKinds: ["meta"], label: "닉네임/성별/지역" },
    },
    defaultCell: () => ({
      rating: { kind: "rating", value: 5, max: 5 },
      title: { kind: "text", text: "" },
      body: { kind: "text", text: "" },
      meta: { kind: "meta", items: [] },
    }),
  },

  step: {
    id: "CardStep",
    label: "스텝",
    description: "스텝 번호 + 타이틀 + 설명 + 이미지",
    slotSpec: {
      stepNumber: { maxChar: 4, maxLine: 1, allowedKinds: ["text"], label: "스텝 번호" },
      title: { maxChar: 12, maxLine: 1, required: true, allowedKinds: ["text"], label: "타이틀" },
      body: { maxChar: 40, maxLine: 2, allowedKinds: ["text"], label: "설명" },
      media: { allowedKinds: ["asset"], label: "이미지" },
    },
    defaultCell: () => ({
      stepNumber: { kind: "text", text: "01" },
      title: { kind: "text", text: "" },
      body: { kind: "text", text: "" },
    }),
  },

  service: {
    id: "service",
    label: "서비스 카드",
    description: "아이콘 + 짧은 타이틀 + 짧은 설명 + 링크",
    slotSpec: {
      icon: { required: true, allowedKinds: ["asset"], label: "아이콘" },
      title: { maxChar: 8, maxLine: 1, required: true, allowedKinds: ["text"], label: "타이틀" },
      body: { maxChar: 20, maxLine: 1, allowedKinds: ["text"], label: "설명" },
      cta: { allowedKinds: ["cta"], label: "링크" },
    },
    defaultCell: () => ({
      title: { kind: "text", text: "" },
      body: { kind: "text", text: "" },
    }),
  },

  custom: {
    id: "custom",
    label: "커스텀",
    description: "원하는 슬롯을 자유롭게 활성화",
    slotSpec: {
      media: { allowedKinds: ["asset"], label: "이미지" },
      icon: { allowedKinds: ["asset"], label: "아이콘" },
      tag: { maxChar: 16, maxLine: 1, allowedKinds: ["text"], label: "태그" },
      stepNumber: { maxChar: 6, maxLine: 1, allowedKinds: ["text"], label: "스텝 번호" },
      title: { maxChar: 30, maxLine: 2, allowedKinds: ["text"], label: "제목" },
      body: { maxChar: 200, maxLine: 6, allowedKinds: ["text"], label: "본문" },
      meta: { allowedKinds: ["meta"], label: "메타" },
      rating: { allowedKinds: ["rating"], label: "별점" },
      cta: { allowedKinds: ["cta"], label: "CTA" },
    },
    defaultCell: () => ({}),
  },
};

// ---------------------------------------------------------------------------
// Card 인스턴스 형태 (ComponentInstance.props 의 shape)
// ---------------------------------------------------------------------------

/**
 * Card 컴포넌트는 ComponentInstance.preset === "card" 일 때
 * ComponentInstance.props 가 아래 형태를 갖는다 (CardProps 로 캐스팅).
 */
export interface CardProps {
  /** 어떤 사용 패턴인지 (USP/Review/Step/Service/Custom) */
  usage: CardUsagePresetId;
  /** 레이아웃 */
  layout: CardLayoutSettings;
  /** 셀 목록 */
  cells: CardCell[];
}

// ---------------------------------------------------------------------------
// 기본값 헬퍼
// ---------------------------------------------------------------------------

export function defaultLayoutSettings(layout: CardLayout): CardLayoutSettings {
  switch (layout) {
    case "grid":
      return {
        type: "grid",
        settings: {
          columns: { mobile: 1, tablet: 2, desktop: 4 },
          gap: 16,
        },
      };
    case "carousel":
      return {
        type: "carousel",
        settings: {
          cardWidth: { mobile: 280, tablet: 320, desktop: 360 },
          gap: 16,
          autoScroll: true,
          autoScrollDurationMs: 30000,
          loop: true,
          showArrows: false,
          showDots: false,
        },
      };
    case "row":
      return {
        type: "row",
        settings: { align: "start", gap: 16, wrap: false },
      };
  }
}
