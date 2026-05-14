/**
 * Storybook 용 Section fixture.
 *
 * src/lib/seed.ts 의 시드 데이터에서 prop/slot 모양만 뽑아 단일 섹션으로 추출.
 * 각 Template.stories / Section.stories 가 import 해서 그대로 또는 args 로 변형해 사용.
 */

import type { CardCell, CardLayoutSettings, CardProps, CardUsagePresetId } from "@/schema/card";
import type { ComponentInstance, Section } from "@/schema/doc";

const baseVisibility = { mobile: true, tablet: true, desktop: true };

function buildCardInstance(args: {
  id: string;
  usage: CardUsagePresetId;
  layout: CardLayoutSettings;
  cells: CardCell[];
}): ComponentInstance {
  const props: CardProps = {
    usage: args.usage,
    layout: args.layout,
    cells: args.cells,
  };
  return {
    id: args.id,
    preset: "card",
    props: props as unknown as Record<string, unknown>,
    assets: [],
  };
}

// ───────────────────────────────────────────────────────────
// Card cells (usage 별)
// ───────────────────────────────────────────────────────────

const uspCells: CardCell[] = [
  { id: "u1", slots: { tag: { kind: "text", text: "FRAGILE" }, title: { kind: "text", text: "파손 걱정" }, body: { kind: "text", text: "비싼 가구가\n흠집 없이 도착할까?" }, media: { kind: "asset", asset: { type: "image", alt: "파손 가구", assetId: "AssetPackageSurpriseIconsStillImage" } } } },
  { id: "u2", slots: { tag: { kind: "text", text: "PRICE" }, title: { kind: "text", text: "비교 견적" }, body: { kind: "text", text: "어떤 업체가\n진짜 합리적일까?" }, media: { kind: "asset", asset: { type: "image", alt: "견적서", assetId: "AssetPercentTicketLargeStillImage" } } } },
  { id: "u3", slots: { tag: { kind: "text", text: "TIME" }, title: { kind: "text", text: "시간 부족" }, body: { kind: "text", text: "이사 준비할\n시간이 부족하다" }, media: { kind: "asset", asset: { type: "image", alt: "시계", assetId: "AssetClockLargeStillImage" } } } },
  { id: "u4", slots: { tag: { kind: "text", text: "TRUST" }, title: { kind: "text", text: "업체 신뢰" }, body: { kind: "text", text: "처음 보는 업체를\n믿을 수 있을까?" }, media: { kind: "asset", asset: { type: "image", alt: "체크", assetId: "AssetLuckyCheckLargeStillImage" } } } },
];

const reviewCells: CardCell[] = [
  { id: "r1", slots: { rating: { kind: "rating", value: 5, max: 5 }, title: { kind: "text", text: "정말 깔끔하게 이사했어요" }, body: { kind: "text", text: "처음 이사하는데 너무 친절하고 빠르게 처리해주셨어요. 짐도 흠집 하나 없이 옮겨주셨습니다." }, meta: { kind: "meta", items: ["김지수", "여성", "성수동"] } } },
  { id: "r2", slots: { rating: { kind: "rating", value: 5, max: 5 }, title: { kind: "text", text: "가격이 합리적이에요" }, body: { kind: "text", text: "다른 업체들보다 30% 저렴하면서도 서비스 품질은 최상급이었습니다." }, meta: { kind: "meta", items: ["박민호", "남성", "잠실"] } } },
  { id: "r3", slots: { rating: { kind: "rating", value: 4, max: 5 }, title: { kind: "text", text: "재이용 의사 100%" }, body: { kind: "text", text: "다음 이사 때도 무조건 여기로 할게요. 파손 보상도 확실합니다." }, meta: { kind: "meta", items: ["이영희", "여성", "마포"] } } },
];

const stepCells: CardCell[] = [
  { id: "s1", slots: { stepNumber: { kind: "text", text: "01" }, title: { kind: "text", text: "견적 요청" }, body: { kind: "text", text: "원하는 일정과\n물량을 입력하세요" } } },
  { id: "s2", slots: { stepNumber: { kind: "text", text: "02" }, title: { kind: "text", text: "업체 매칭" }, body: { kind: "text", text: "검증된 업체에서\n견적을 받아보세요" } } },
  { id: "s3", slots: { stepNumber: { kind: "text", text: "03" }, title: { kind: "text", text: "예약 확정" }, body: { kind: "text", text: "원하는 업체와\n날짜를 확정하세요" } } },
  { id: "s4", slots: { stepNumber: { kind: "text", text: "04" }, title: { kind: "text", text: "이사 완료" }, body: { kind: "text", text: "안전하게 이사하고\n후기를 남기세요" } } },
];

const serviceCells: CardCell[] = [
  { id: "sv1", slots: { title: { kind: "text", text: "렌탈" }, body: { kind: "text", text: "필요한 만큼만" }, cta: { kind: "cta", label: "보러가기", url: "#" } } },
  { id: "sv2", slots: { title: { kind: "text", text: "인테리어" }, body: { kind: "text", text: "감각있는 시공" }, cta: { kind: "cta", label: "보러가기", url: "#" } } },
  { id: "sv3", slots: { title: { kind: "text", text: "수납" }, body: { kind: "text", text: "공간 활용" }, cta: { kind: "cta", label: "보러가기", url: "#" } } },
];

// ───────────────────────────────────────────────────────────
// 레이아웃 헬퍼
// ───────────────────────────────────────────────────────────

export const gridLayout: CardLayoutSettings = {
  type: "grid",
  settings: { columns: { mobile: 1, tablet: 2, desktop: 4 }, gap: 16 },
};

export const carouselLayout: CardLayoutSettings = {
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

export const rowLayout: CardLayoutSettings = {
  type: "row",
  settings: { align: "start", gap: 16, wrap: false },
};

// ───────────────────────────────────────────────────────────
// 섹션 fixture
// ───────────────────────────────────────────────────────────

export const headerFixture: Section = {
  id: "fix-header",
  preset: "header",
  name: "헤더",
  locked: true,
  props: { logoText: "오늘의집" },
  slots: {},
  assets: [],
  visibility: baseVisibility,
};

export const heroFixture: Section = {
  id: "fix-hero",
  preset: "hero",
  name: "히어로",
  locked: true,
  props: {
    eyebrow: "오늘의집 이사",
    title: "집을 잘 아니까,\n이사도 오늘의집에서",
    subtitle: "",
    primaryCtaLabel: "무료 견적 신청하기",
    secondaryCtaLabel: "",
  },
  slots: {},
  assets: [],
  visibility: baseVisibility,
};

export function buildCardSectionFixture(args: {
  preset: "usp" | "coverage" | "review" | "process" | "cross-sell";
  usage: CardUsagePresetId;
  layout: CardLayoutSettings;
  cells: CardCell[];
  sectionTitle?: string;
  sectionSubtitle?: string;
}): Section {
  return {
    id: `fix-${args.preset}`,
    preset: args.preset,
    name: args.preset,
    locked: false,
    props: {
      sectionTitle: args.sectionTitle ?? "섹션 제목",
      sectionSubtitle: args.sectionSubtitle ?? "서브 카피",
    },
    slots: {
      content: [
        buildCardInstance({
          id: `card-${args.preset}`,
          usage: args.usage,
          layout: args.layout,
          cells: args.cells,
        }),
      ],
    },
    assets: [],
    visibility: baseVisibility,
  };
}

export const uspFixture = buildCardSectionFixture({
  preset: "usp",
  usage: "usp",
  layout: gridLayout,
  cells: uspCells,
  sectionTitle: "이사, 이런 게 고민이셨죠?",
  sectionSubtitle: "이사할 때 가장 많이 듣는 4가지 걱정",
});

export const coverageFixture = buildCardSectionFixture({
  preset: "coverage",
  usage: "usp",
  layout: { type: "grid", settings: { columns: { mobile: 1, tablet: 2, desktop: 2 }, gap: 16 } },
  cells: uspCells.slice(0, 2),
  sectionTitle: "안전한 이사를 위한\n책임보장 시스템",
  sectionSubtitle: "Coverage",
});

export const reviewFixture = buildCardSectionFixture({
  preset: "review",
  usage: "review",
  layout: carouselLayout,
  cells: reviewCells,
  sectionTitle: "10만+ 고객의 진짜 후기",
  sectionSubtitle: "Review",
});

export const processFixture = buildCardSectionFixture({
  preset: "process",
  usage: "step",
  layout: gridLayout,
  cells: stepCells,
  sectionTitle: "이사는 4단계로 끝!",
  sectionSubtitle: "Process",
});

export const crossSellFixture = buildCardSectionFixture({
  preset: "cross-sell",
  usage: "service",
  layout: { type: "row", settings: { align: "start", gap: 16, wrap: true } },
  cells: serviceCells,
  sectionTitle: "이사 외에도\n오늘의집의 다양한 서비스",
  sectionSubtitle: "Cross-sell",
});

// ───────────────────────────────────────────────────────────
// 그 외 섹션 (table / cta-form / sticky-cta / footer)
// ───────────────────────────────────────────────────────────

export const tableFixture: Section = {
  id: "fix-table",
  preset: "table",
  name: "비교 테이블",
  locked: false,
  props: {
    sectionTitle: "왜 오늘의집 이사인가요?",
    sectionSubtitle: "Comparison",
    colHeaders: ["타사", "오늘의집", "책임보장"],
  },
  slots: {
    rows: [
      { id: "tr1", preset: "table-row", props: { label: "비교 견적", colA: "X", colB: "O", colC: "O" }, assets: [] },
      { id: "tr2", preset: "table-row", props: { label: "파손 보상", colA: "X", colB: "O", colC: "O" }, assets: [] },
      { id: "tr3", preset: "table-row", props: { label: "사전 방문", colA: "△", colB: "O", colC: "O" }, assets: [] },
      { id: "tr4", preset: "table-row", props: { label: "투명 가격", colA: "X", colB: "O", colC: "O" }, assets: [] },
    ],
  },
  assets: [],
  visibility: baseVisibility,
};

export const ctaFormFixture: Section = {
  id: "fix-ctaform",
  preset: "cta-form",
  name: "상담 신청",
  locked: false,
  props: {
    sectionTitle: "지금 바로 견적 받아보세요",
    sectionSubtitle: "30초면 충분합니다",
    submitLabel: "무료 견적 받기",
  },
  slots: {
    fields: [
      { id: "f1", preset: "form-field", props: { label: "이름", placeholder: "홍길동" }, assets: [] },
      { id: "f2", preset: "form-field", props: { label: "연락처", placeholder: "010-0000-0000" }, assets: [] },
      { id: "f3", preset: "form-field", props: { label: "이사 예정일", placeholder: "YYYY-MM-DD" }, assets: [] },
    ],
  },
  assets: [],
  visibility: baseVisibility,
};

export const stickyCtaFixture: Section = {
  id: "fix-sticky",
  preset: "sticky-cta",
  name: "하단 고정 CTA",
  locked: true,
  props: { label: "무료 견적 받기" },
  slots: {},
  assets: [],
  visibility: baseVisibility,
};

export const footerFixture: Section = {
  id: "fix-footer",
  preset: "footer",
  name: "푸터",
  locked: true,
  props: { copyright: "© 2026 오늘의집" },
  slots: {},
  assets: [],
  visibility: baseVisibility,
};

// preset 별 기본 fixture 매핑 (Section.stories 에서 사용)
export const fixtureByPreset = {
  header: headerFixture,
  hero: heroFixture,
  usp: uspFixture,
  table: tableFixture,
  coverage: coverageFixture,
  review: reviewFixture,
  process: processFixture,
  "cross-sell": crossSellFixture,
  "cta-form": ctaFormFixture,
  "sticky-cta": stickyCtaFixture,
  footer: footerFixture,
} as const;
