"use client";

/**
 * Card 런타임 컴포넌트.
 *
 * 단일 상위 컴포넌트로서 layout 에 따라 grid / carousel / row 를 렌더한다.
 * 각 cell 은 slot 시스템(media/tag/title/body/meta/rating/cta/icon/stepNumber)
 * 으로 콘텐츠를 그린다.
 *
 * 주의:
 * - carousel 의 autoScroll 은 무한 marquee 스타일 (CSS animation 으로 처리)
 * - autoScroll=false 면 사용자가 좌우 드래그/스크롤로만 이동
 * - viewport 별 컬럼 수 / 카드 폭은 부모(PreviewRenderer) 가 viewport prop 으로 결정해서 전달
 */

import { useMemo, useState } from "react";

import { cn } from "@/lib/cn";
import { IconArrowDownToLine, IconArrowRight, IconChevronDown, IconHeadset, IconLink, IconPhoto, IconStar, IconStarFilled } from "@bucketplace/icons";
import type { AssetSlotModalOpenContext } from "@/schema/asset-modal-context";
import {
  CARD_USAGE_PRESETS,
  type CardCell,
  type CardCellTheme,
  type CardLayoutSettings,
  type CardSlotContent,
  type CardSlotName,
  type CardUsagePresetId,
  type ImgcardType,
} from "@/schema/card";
import type { Viewport } from "@/schema/doc";
import type { LinkAction } from "@/schema/card";
import OdsAssetRenderer from "./OdsAssetRenderer";

// ---------------------------------------------------------------------------
// 공용 헬퍼
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Card 컴포넌트 (메인)
// ---------------------------------------------------------------------------

export interface CardPreviewAssetBinding {
  sectionId: string;
  componentId: string;
  onRequestSlot: (ctx: AssetSlotModalOpenContext) => void;
}

interface CardProps {
  usage: CardUsagePresetId;
  layout: CardLayoutSettings;
  cells: CardCell[];
  viewport: Viewport;
  /** imgcard 서브 변형 — bgfullimg(디폴트) | leading-asset */
  cardType?: ImgcardType;
  /** 빌더 프리뷰: 에셋 클릭 시 슬롯 교체 모달 */
  previewAsset?: CardPreviewAssetBinding;
  /** 페이지 타이틀 레이아웃 — center 면 카드 그리드도 중앙 정렬 */
  titleLayout?: "center" | "split";
}

/**
 * CONVENTIONS §11 — minWidth 폴백.
 *
 * grid 가 선택된 상태에서 viewport 기준 per-card 폭이 변형의 minWidth 미만이면
 * `allowedLayouts` 순서로 carousel → list 로 자동 강등한다.
 *
 * 폭 계산은 viewport 기반 휴리스틱 (375/768/1280 에서 페이지 거터를 뺀 사용 폭).
 * 정확한 컨테이너 폭은 ResizeObserver 가 필요하지만 v1 은 단순화.
 */
const APPROX_USABLE_WIDTH_PX: Record<Viewport, number> = {
  mobile: 360,
  tablet: 750,
  desktop: 1200,
};

function resolveLayoutWithFallback(
  usage: CardUsagePresetId,
  layout: CardLayoutSettings,
  viewport: Viewport
): CardLayoutSettings {
  if (layout.type !== "grid") return layout;

  // tablecard: 컴파일러가 행 텍스트 폭을 재서 모바일 2열(columns.mobile=2)을 지정하면 그대로 유지 (좁은 표 2열 배치)
  if (usage === "tablecard" && viewport === "mobile" && layout.settings.columns?.mobile === 2) return layout;
  // 밀도 그리드(짧은 텍스트 카드, compile dense): minWidth 폴백 없이 모바일 2열 유지
  if (usage === "imgcard" && (layout.settings as { dense?: boolean }).dense) return layout;

  const preset = CARD_USAGE_PRESETS[usage];
  const cols = usage === "listcard" ? (viewport === "mobile" ? 1 : 2) : 2;
  const usable = APPROX_USABLE_WIDTH_PX[viewport];
  const perCardWidth = (usable - GRID_FIXED_GAP_PX * (cols - 1)) / cols;

  if (perCardWidth >= preset.minWidth) return layout;

  // 폴백 순서: carousel → list (CONVENTIONS §11.1)
  if (preset.allowedLayouts.includes("carousel")) {
    return {
      type: "carousel",
      settings: {
        cardWidth: {
          mobile: preset.minWidth,
          tablet: preset.minWidth,
          desktop: preset.minWidth,
        },
        gap: 8,
        autoScroll: false,
      },
    };
  }
  if (preset.allowedLayouts.includes("list")) {
    return { type: "list", settings: { gap: 8, align: "start" } };
  }
  // 둘 다 안 되면 원본 grid 유지 (시각적 손상 허용)
  return layout;
}

export default function Card({ usage, layout, cells, viewport, cardType, previewAsset, titleLayout }: CardProps) {
  const effective = resolveLayoutWithFallback(usage, layout, viewport);
  switch (effective.type) {
    case "grid":
      return (
        <GridLayout
          usage={usage}
          cells={cells}
          viewport={viewport}
          settings={effective.settings}
          cardType={cardType}
          previewAsset={previewAsset}
          centered={titleLayout === "center"}
        />
      );
    case "carousel":
      return (
        <CarouselLayout
          usage={usage}
          cells={cells}
          viewport={viewport}
          settings={effective.settings}
          cardType={cardType}
          previewAsset={previewAsset}
          centered={titleLayout === "center"}
        />
      );
    case "list":
      return (
        <ListLayout
          usage={usage}
          cells={cells}
          viewport={viewport}
          settings={effective.settings}
          cardType={cardType}
          previewAsset={previewAsset}
          centered={titleLayout === "center"}
        />
      );
  }
}

// ---------------------------------------------------------------------------
// Grid layout — Figma 31:777 (Lead 태블릿) 스펙
//
// 규칙: 카드 사이 간격 8px 고정.
// - `usage === "service"`: 모바일 뷰포트 `grid-cols-1`, 태블릿·데스크톱 `grid-cols-2`.
// - 그 외: 항상 `grid-cols-2` (Lead UI spec).
// - settings.columns / settings.gap 은 schema 호환을 위해 유지되나 service 가 아니면 2 col 고정.
// ---------------------------------------------------------------------------

const GRID_FIXED_GAP_PX = 8;
/** imgcard 카드 폭 범위 — max 300 (디자인 요청), min 260 (태블릿에서 3열+고아 카드 방지) */
const IMGCARD_MAX_PX = 300;
const IMGCARD_MIN_PX = 260;

function GridLayout({
  usage,
  cells,
  viewport,
  settings: _settings,
  cardType,
  previewAsset,
  centered,
}: {
  usage: CardUsagePresetId;
  cells: CardCell[];
  viewport: Viewport;
  settings: Extract<CardLayoutSettings, { type: "grid" }>["settings"];
  cardType?: ImgcardType;
  previewAsset?: CardPreviewAssetBinding;
  centered?: boolean;
}) {
  const gridCols =
    usage === "listcard" || usage === "pillcard"
      ? viewport === "mobile"
        ? "grid-cols-1"
        : "grid-cols-2"
      : usage === "linkcard"
        ? viewport === "mobile" ? "grid-cols-1" : viewport === "tablet" ? "grid-cols-2" : "grid-cols-3"
        : "grid-cols-2";

  // imgcard: 카드 최대 폭 300px (데스크톱 2열 시 카드가 ~600px 로 과대해지는 문제) —
  // 들어가는 만큼 열을 채우고(1280 → 4열, 768 → 2열) 남는 폭은 좌측 정렬로 비운다.
  const isImgcard = usage === "imgcard";
  // 밀도 그리드(짧은 텍스트 카드, compile dense): 모바일도 2열로 채운다
  const isDense = isImgcard && (_settings as { dense?: boolean }).dense === true;
  const dense = isDense && viewport === "mobile";
  return (
    <div
      className={cn("grid w-full", !isImgcard && gridCols, dense && "grid-cols-2")}
      data-dense={isDense ? "true" : undefined}
      style={{
        gap: `${GRID_FIXED_GAP_PX}px`,
        ...(isImgcard && !dense
          ? {
              // 밀도 그리드는 태블릿·데스크톱에서 160 고정 카드로 촘촘히(720 컨테이너 → 4열). auto-fill 은 max 트랙으로 개수를 세므로 고정폭 사용
              gridTemplateColumns: isDense
                ? `repeat(auto-fill, 160px)`
                : `repeat(auto-fill, minmax(min(100%, ${IMGCARD_MIN_PX}px), ${IMGCARD_MAX_PX}px))`,
              justifyContent: centered ? "center" : "start",
            }
          : null),
      }}
    >
      {cells.map((cell) => (
        <div key={cell.id} className="min-w-0 w-full">
          <CellRenderer
            cell={cell}
            usage={usage}
            viewport={viewport}
            cardType={cardType}
            previewAsset={previewAsset}
            dense={(_settings as { dense?: boolean }).dense === true}
          />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Carousel layout — Figma 31:777 (Lead 태블릿) 스펙
//
// 규칙: 카드 고정 너비, 카드 좌우 패딩 제거(= 컨테이너에 horizontal padding 없음,
// 셀 wrapper 도 padding 없이 cardWidth 그대로).
// - settings.cardWidth[viewport] 는 그대로 사용
// - settings.gap 은 schema 호환을 위해 유지되나 카드 사이 간격은 8로 고정
// - autoScroll on/off 동작은 동일하게 유지.
// ---------------------------------------------------------------------------

const CAROUSEL_FIXED_GAP_PX = 8;

function CarouselLayout({
  usage,
  cells,
  viewport,
  settings,
  cardType,
  previewAsset,
  centered,
}: {
  usage: CardUsagePresetId;
  cells: CardCell[];
  viewport: Viewport;
  settings: Extract<CardLayoutSettings, { type: "carousel" }>["settings"];
  cardType?: ImgcardType;
  previewAsset?: CardPreviewAssetBinding;
  centered?: boolean;
}) {
  const rawWidth = settings.cardWidth[viewport] ?? 320;
  const cardWidth = usage === "imgcard" ? Math.min(rawWidth, IMGCARD_MAX_PX) : rawWidth;

  const renderedCells = settings.autoScroll ? [...cells, ...cells] : cells;
  const durationSec = (settings.autoScrollDurationMs ?? 30000) / 1000;

  const animKey = useMemo(
    () => `card-marquee-${cells.length}-${durationSec}`,
    [cells.length, durationSec]
  );

  // 수동(가로 배치) 모드: 한 줄로 두고 컨테이너를 넘치면 가로 스크롤 + 스냅. 들어가면 스크롤 없이 그대로(centered 면 가운데)
  const manual = !settings.autoScroll;
  return (
    <div className={cn("relative px-0", manual ? "lp-row overflow-x-auto" : "overflow-hidden")} style={manual ? { scrollSnapType: "x proximity", WebkitOverflowScrolling: "touch", scrollbarWidth: "none" } : undefined}>
      <div
        className={cn("flex px-0", manual ? "w-max min-w-full" : "w-max")}
        style={{
          gap: `${CAROUSEL_FIXED_GAP_PX}px`,
          animation: settings.autoScroll
            ? `${animKey} ${durationSec}s linear infinite`
            : undefined,
          ...(manual ? { justifyContent: centered ? "safe center" : "flex-start" } : null),
        }}
      >
        {renderedCells.map((cell, i) => (
          <div
            key={`${cell.id}-${i}`}
            className="p-0"
            style={{ width: `${cardWidth}px`, flexShrink: 0, ...(manual ? { scrollSnapAlign: "start" } : null) }}
          >
            <CellRenderer
              cell={cell}
              usage={usage}
              viewport={viewport}
              cardType={cardType}
              previewAsset={previewAsset}
              dense={(settings as { dense?: boolean }).dense === true}
            />
          </div>
        ))}
      </div>

      {settings.showArrows && !settings.autoScroll && (
        <>
          <button
            type="button"
            aria-label="이전"
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-sm shadow"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="다음"
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-sm shadow"
          >
            ›
          </button>
        </>
      )}

      {settings.autoScroll && (
        <style>{`@keyframes ${animKey} { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Row layout — Figma 31:777 (Lead 태블릿) 스펙
//
// 규칙: 카드 full width(100%) + 위→아래 세로 스택 + 간격 8px 고정.
// - `usage === "service"` (크로스셀): 모바일 뷰포트는 1열 flex, 태블릿·데스크톱은 2×2 grid.
// - 그 외: 기존과 동일하게 세로 스택만 사용.
// ---------------------------------------------------------------------------

const ROW_FIXED_GAP_PX = 8;

function ListLayout({
  usage,
  cells,
  viewport,
  settings: _settings,
  cardType,
  previewAsset,
  centered,
}: {
  usage: CardUsagePresetId;
  cells: CardCell[];
  viewport: Viewport;
  settings: Extract<CardLayoutSettings, { type: "list" }>["settings"];
  cardType?: ImgcardType;
  previewAsset?: CardPreviewAssetBinding;
  centered?: boolean;
}) {
  if (usage === "stepcard") {
    return (
      <div className={cn("flex w-full flex-col rounded-ods-16 bg-ods-surface-gray px-5 py-6", viewport !== "mobile" && "max-w-[720px]", centered && "mx-auto")}>
        {cells.map((cell, i) => (
          <div key={cell.id} className="relative flex w-full gap-4">
            {i < cells.length - 1 && (
              <div aria-hidden className="absolute left-5 top-10 h-[calc(100%-32px)] w-px -translate-x-1/2 bg-ods-border" />
            )}
            <CellRenderer cell={cell} usage={usage} viewport={viewport} cardType={cardType} previewAsset={previewAsset} />
          </div>
        ))}
      </div>
    );
  }

  if (usage === "pillcard" || usage === "kvcard") {
    // 세로형 읽기 컴포넌트: 데스크톱에서도 1열, 콘텐츠 컨테이너 720 (캐로셀 외 공통)
    return (
      <div className={cn("flex w-full flex-col", viewport !== "mobile" && "max-w-[720px]", centered && "mx-auto")} style={{ gap: `${ROW_FIXED_GAP_PX}px` }}>
        {cells.map((cell) => (
          <div key={cell.id} className="min-w-0 w-full">
            <CellRenderer cell={cell} usage={usage} viewport={viewport} cardType={cardType} previewAsset={previewAsset} />
          </div>
        ))}
      </div>
    );
  }

  if (usage === "listcard") {
    const isMobile = viewport === "mobile";
    return (
      <div
        className={cn(
          "w-full",
          isMobile ? "flex flex-col" : "grid grid-cols-2"
        )}
        style={{ gap: `${ROW_FIXED_GAP_PX}px` }}
      >
        {cells.map((cell) => (
          <div key={cell.id} className="min-w-0 w-full">
            <CellRenderer
              cell={cell}
              usage={usage}
              viewport={viewport}
              cardType={cardType}
              previewAsset={previewAsset}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className="flex w-full flex-col"
      style={{ gap: `${ROW_FIXED_GAP_PX}px` }}
    >
      {cells.map((cell) => (
        <div key={cell.id} className="w-full">
          <CellRenderer
            cell={cell}
            usage={usage}
            viewport={viewport}
            cardType={cardType}
            previewAsset={previewAsset}
          />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cell 렌더러 — usage 별 슬롯 조합 + 스타일
// ---------------------------------------------------------------------------

function CellRenderer({
  cell,
  usage,
  viewport: _viewport,
  cardType,
  previewAsset,
  dense,
}: {
  cell: CardCell;
  usage: CardUsagePresetId;
  viewport: Viewport;
  cardType?: ImgcardType;
  previewAsset?: CardPreviewAssetBinding;
  /** 짧은 텍스트 밀도 그리드 — 카드 높이를 낮춤 */
  dense?: boolean;
}) {
  const openSlot = (slot: CardSlotName) => {
    if (!previewAsset) return;
    previewAsset.onRequestSlot({
      sectionId: previewAsset.sectionId,
      componentId: previewAsset.componentId,
      slotName: slot,
      cellId: cell.id,
      cardSlotName: slot,
    });
  };
  const slotEdit = (slot: CardSlotName) =>
    previewAsset ? () => openSlot(slot) : undefined;

  switch (usage) {
    case "imgcard":
      // cardType 으로 분기: bgfullimg(디폴트, 풀배경) / leading-asset(상단 에셋)
      return cardType === "leading-asset"
        ? <CardLeadingAssetCell cell={cell} dense={dense} onRequestSlotEdit={slotEdit("media")} />
        : <CardBgFullImgCell cell={cell} onRequestSlotEdit={slotEdit("media")} />;
    case "reviewcard":
      return <CardReviewCell cell={cell} onRequestSlotEdit={slotEdit("media")} />;
    case "listcard":
      return <ListCell cell={cell} onRequestSlotEdit={slotEdit("icon")} />;
    case "tablecard":
      return <CardTableCell cell={cell} />;
    case "faqcard":
      return <CardFaqCell cell={cell} />;
    case "linkcard":
      return <CardLinkGroupCell cell={cell} />;
    case "pillcard":
      return <CardPillCell cell={cell} onRequestSlotEdit={slotEdit("icon")} />;
    case "kvcard":
      return <CardKvCell cell={cell} />;
    case "stepcard":
      // stepcard 는 ListLayout 이 컨테이너·연결선을 그리고 셀은 행만 렌더
      return <CardStepCell cell={cell} onRequestSlotEdit={slotEdit("icon")} />;
  }
}

// ---------------------------------------------------------------------------
// 슬롯 접근 헬퍼
// ---------------------------------------------------------------------------

function slot<K extends CardSlotName>(
  cell: CardCell,
  name: K
): CardSlotContent | undefined {
  return cell.slots[name];
}

function asText(c?: CardSlotContent): string | null {
  if (!c || c.kind !== "text") return null;
  return c.text;
}

function asMeta(c?: CardSlotContent): string[] | null {
  if (!c || c.kind !== "meta") return null;
  return c.items;
}

function asRating(c?: CardSlotContent): { value: number; max: number } | null {
  if (!c || c.kind !== "rating") return null;
  return { value: c.value, max: c.max ?? 5 };
}

function asAssetAlt(c?: CardSlotContent): string | null {
  if (!c || c.kind !== "asset") return null;
  return c.asset.alt;
}

function asAssetUrl(c?: CardSlotContent): { url: string; alt: string } | null {
  if (!c || c.kind !== "asset") return null;
  const url = c.asset.url ?? "";
  if (!url) return null;
  return { url, alt: c.asset.alt };
}

function asAsset(c?: CardSlotContent): import("@/schema/doc").AssetRef | null {
  if (!c || c.kind !== "asset") return null;
  return c.asset;
}

/**
 * 본문에 인라인 **bold** 마커가 들어있으면 SemiBold span 으로 변환.
 * 빌더 입력자는 강조 구간을 `**...**` 로 감싸서 작성한다.
 */
function renderRichText(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <span key={i} className="font-semibold">
          {part.slice(2, -2)}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function asLinks(c?: CardSlotContent) {
  return c?.kind === "links" ? c.items : null;
}
function asRows(c?: CardSlotContent) {
  return c?.kind === "rows" ? c.items : null;
}

function asCta(c?: CardSlotContent): { label: string; url: string } | null {
  if (!c || c.kind !== "cta") return null;
  return { label: c.label, url: c.url };
}

// ---------------------------------------------------------------------------
// Usage 별 cell 스타일
// ---------------------------------------------------------------------------

/**
 * USP 카드 — Figma `card_usp` 스펙.
 * - 카드 셸: `border-radius: 12px`, 배경 그라데이션 + `#F5F5F5` 베이스
 * - 풀-블리드 배경 사진 + 어두운 dim gradient + 흰 텍스트 오버레이
 * - 미디어 영역 비율: **3:4** (가로:세로, 세로형 카드) — 그리드 열 너비에 맞춤
 * - title / body / tag 레이아웃 동일
 */
function CardBgFullImgCell({
  cell,
  onRequestSlotEdit,
}: {
  cell: CardCell;
  onRequestSlotEdit?: () => void;
}) {
  const tag = asText(slot(cell, "tag"));
  const title = asText(slot(cell, "title"));
  const body = asText(slot(cell, "body"));
  const media = asAsset(slot(cell, "media"));
  return (
    <div
      className="relative aspect-[3/4] w-full overflow-hidden"
      style={{
        borderRadius: "12px",
        background:
          "linear-gradient(160deg, rgba(239, 239, 239, 0.20) -1.05%, rgba(147, 184, 210, 0.20) 99.18%), #F5F5F5",
      }}
    >
      {media ? (
        <OdsAssetRenderer
          asset={media}
          className="absolute inset-0 flex h-full w-full items-center justify-center object-cover"
          onRequestSlotEdit={onRequestSlotEdit}
        />
      ) : onRequestSlotEdit ? (
        <OdsAssetRenderer
          asset={{ type: "image", alt: "미디어 슬롯" }}
          className="absolute inset-0 flex h-full w-full items-center justify-center object-cover"
          onRequestSlotEdit={onRequestSlotEdit}
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/50" />
      <p className="absolute bottom-3 right-5 font-pretendard text-[10px] font-medium leading-[14px] tracking-[-0.3px] text-white/40">
        AI Generated
      </p>
      <div className="absolute bottom-0 left-0 w-full px-5 pb-[24px] pt-[40px] text-white">
        {/* tag 는 타이틀 바로 위 흐름에 둔다 (absolute 고정 시 body 2줄과 겹치던 문제 수정) */}
        {tag && (
          <p className="mb-1 text-left font-pretendard text-[10px] leading-[14px] tracking-[-0.3px] text-white/70">
            {tag}
          </p>
        )}
        {title && (
          <h3 className="overflow-hidden text-ellipsis whitespace-nowrap font-pretendard text-[20px] font-semibold leading-7 tracking-[-0.3px]">
            {title}
          </h3>
        )}
        {body && (
          <p className="mt-1.5 max-w-[200px] whitespace-pre-line font-pretendard text-[15px] leading-6 tracking-[-0.3px] line-clamp-2">
            {body}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * 리뷰 카드 — 후기 리스트 섹션(seed.ts `sec-review` / section.quote-list) 캐노니컬 스펙.
 *
 * 구조 (위→아래):
 *   1. ★★★★★  별점 (Yellow, 18px)
 *   2. 헤드라인 (Body16 SemiBold 16/20, `\n` 다중줄, line-clamp 없음)
 *   3. 메타 (Detail12 Medium 12/16, 마지막 항목 앞에 `|`, 나머지는 `·` join)
 *   4. 본문 (Body14 Regular 14/20, line-clamp-3, `**...**` SemiBold 변환)
 *
 * - 컨테이너: 흰 배경, p-4, rounded-ods-12, 높이 가변(콘텐츠 기반).
 * - 작성자 사진(media) 슬롯은 사용하지 않음 — 후기 리스트 섹션에 없음.
 * - 폭은 부모 layout 이 결정 (CONVENTIONS §11 minWidth=254).
 */
function CardReviewCell({ cell }: { cell: CardCell; onRequestSlotEdit?: () => void }) {
  const rating = asRating(slot(cell, "rating"));
  const title = asText(slot(cell, "title"));
  const body = asText(slot(cell, "body"));
  const meta = asMeta(slot(cell, "meta"));
  const metaHead = meta && meta.length > 1 ? meta.slice(0, -1) : meta ?? [];
  const metaTail = meta && meta.length > 1 ? meta[meta.length - 1] : null;
  return (
    <div className="flex w-full flex-col gap-3 rounded-ods-12 bg-white p-4">
      {rating && (
        <div
          className="flex gap-0.5"
          role="img"
          aria-label={`별점 ${rating.value}점 만점 ${rating.max}점`}
        >
          {Array.from({ length: rating.max }).map((_, i) => (
            <span key={i} className="inline-flex shrink-0" aria-hidden>
              {i < rating.value ? (
                <IconStarFilled size={18} className="text-ods-star-yellow" />
              ) : (
                <IconStar size={18} className="text-ods-star-yellow opacity-45" />
              )}
            </span>
          ))}
        </div>
      )}
      <div className="flex flex-col gap-1.5 tracking-[-0.3px]">
        {title && (
          <h3 className="whitespace-pre-line font-pretendard text-[16px] font-semibold leading-5 text-ods-text-primary">
            {title}
          </h3>
        )}
        {meta && meta.length > 0 && (
          <div className="flex items-center gap-1 whitespace-nowrap font-pretendard text-[12px] font-medium leading-4">
            {metaHead.length > 0 && (
              <span className="overflow-hidden text-ellipsis text-ods-text-tertiary">
                {metaHead.join(" · ")}
              </span>
            )}
            {metaTail && (
              <>
                <span className="text-[#c1c1c1]">|</span>
                <span className="text-ods-text-tertiary">{metaTail}</span>
              </>
            )}
          </div>
        )}
      </div>
      {body && (
        <p className="mt-1 font-pretendard text-[14px] leading-5 tracking-[-0.3px] text-ods-text-primary line-clamp-3">
          {renderRichText(body)}
        </p>
      )}
    </div>
  );
}

/**
 * 프로세스 스텝 — Figma `card_process/md` (node 34:2983) 스펙 적용.
 * - 컨테이너 최소 260px(콘텐츠에 맞춰 늘어남, 같은 행은 h-full 로 높이 동일) 그라데이션 배경, `px-5 pb-5` rounded-12. `justify-between` 으로 그래픽·텍스트를 카드 안에서 위·아래 배치.
 * - imgGraphic 영역 : `max-w-[240px]` 래퍼에 `pt-2`(8px), 내부 `240×160` 박스. media 가 있으면 이미지, 없으면 placeholder chip 표시.
 * - title  : Heading20 SemiBold 20/28 -0.3 #141414 opacity-80, 1줄 ellipsis.
 *            stepNumber 가 별도로 있으면 "{n}. {title}" 으로 prefix.
 * - body   : Body15 Regular 15/24 -0.3 #141414 opacity-80, 2줄 ellipsis (whitespace-pre-line).
 */
function CardLeadingAssetCell({
  cell,
  dense = false,
  onRequestSlotEdit,
}: {
  cell: CardCell;
  dense?: boolean;
  onRequestSlotEdit?: () => void;
}) {
  const stepNumber = asText(slot(cell, "stepNumber"));
  const title = asText(slot(cell, "title"));
  const body = asText(slot(cell, "body"));
  const media = asAsset(slot(cell, "media"));
  const displayTitle = title; // 넘버링은 leading 컴포넌트가 담당 (접두어 중복 방지)
  return (
    <div
      // 디자인 시안: 좌측 정렬(items-start), 하단 패딩 20px(pb-5). 카드 안 에셋은 40×40 고정 (2026-10 규칙)
      className={cn("flex h-full w-full flex-col items-start justify-between rounded-ods-12 pb-5 pt-5", dense ? "min-h-[132px] gap-4 px-4" : "min-h-[180px] gap-6 px-5")}
      style={{
        backgroundImage:
          "linear-gradient(173.759deg, rgba(239,239,239,0.2) 1.5877%, rgba(139,195,235,0.2) 92.346%), linear-gradient(90deg, rgb(245,245,245) 0%, rgb(245,245,245) 100%)",
      }}
    >
      <div className="flex size-10 shrink-0 items-center justify-center">
        {stepNumber && !media ? (
          <LeadingNumber n={stepNumber} />
        ) : media ? (
          <OdsAssetRenderer asset={media} size={CARD_ASSET_PX} className="size-10 object-contain" onRequestSlotEdit={onRequestSlotEdit} />
        ) : (
          <div className="flex size-10 items-center justify-center rounded-ods-8 bg-white/70 text-ods-text-tertiary" aria-label="에셋 미정"><IconPhoto size={18} /></div>
        )}
      </div>
      <div className="flex w-full shrink-0 flex-col gap-1 text-left tracking-[-0.3px] text-ods-text-primary">
        {displayTitle && (
          <h3 className="overflow-hidden text-ellipsis whitespace-nowrap font-pretendard text-[20px] font-semibold leading-7 opacity-80">
            {displayTitle}
          </h3>
        )}
        {body && (
          <p className="whitespace-pre-line font-pretendard text-[15px] leading-6 opacity-80 line-clamp-2">
            {body}
          </p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 에셋 사이즈 규칙 (2026-10 디자인 결정)
//   - 리스트 leading icon(listcard·pillcard·stepcard 좌측): bg 박스 40×40 안에 에셋 최대 24×24
//   - 카드 안 에셋(leading-asset 카드): 40×40 고정
//   - 프로세스: 에셋 대신 넘버링 leading 컴포넌트
//   - 에셋은 Storybook/ODS 카탈로그에 정의된 것만. 없으면 placeholder(IconPhoto)로 비운다
// ---------------------------------------------------------------------------
export const LEADING_ICON_PX = 24;
/** 리스트 타입(pillcard) 아이콘 — 28, 좌우 패딩 4 (2026-10) */
export const PILL_ICON_PX = 28;
export const CARD_ASSET_PX = 40;

/**
 * 리스트 leading icon — 24px 에셋. 에셋 없으면 placeholder
 *   tone "gray": 흰 배경 위(listcard) → surface.gray 박스 40
 *   tone "none": 배경색 카드·회색 컨테이너 안(pillcard·stepcard) → 박스 없이 에셋만 (흰 배경 박스 사용 안 함, 2026-10)
 *   compact: 래퍼를 24 로 줄여 에셋이 좌측 패딩에 붙게 (pillcard)
 */
function LeadingIcon({ asset, tone = "gray", compact = false, size = LEADING_ICON_PX, onRequestSlotEdit }: { asset: import("@/schema/doc").AssetRef | null; tone?: "gray" | "none"; compact?: boolean; size?: number; onRequestSlotEdit?: () => void }) {
  return (
    <div className={cn("flex shrink-0 items-center justify-center", compact ? "px-1" : "size-10 rounded-ods-8", tone === "gray" && "bg-ods-surface-gray")} style={compact ? { width: size + 8, height: size } : undefined}>
      {asset ? (
        <OdsAssetRenderer asset={asset} size={size} className={cn("object-contain", size === 28 ? "size-7" : "size-6")} onRequestSlotEdit={onRequestSlotEdit} />
      ) : (
        <IconPhoto size={18} className="text-ods-text-tertiary" aria-label="에셋 미정" />
      )}
    </div>
  );
}

/** 넘버링 leading — 프로세스 단계 (에셋 대신) */
function LeadingNumber({ n }: { n: string }) {
  return (
    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ods-primary font-pretendard text-[15px] font-bold leading-none tracking-[-0.3px] text-white" style={{ fontVariantNumeric: "tabular-nums" }}>
      {n}
    </div>
  );
}

/**
 * 서비스 리스트 셀 — Figma `이사-프로덕트` CrossSelling `CardService` (node 640:9365 근방).
 * - 96px 높이 가로 카드, `rounded-ods-8`, 좌 96×96 이미지 + 우측 타이틀/설명
 * - 타이틀 18px Semibold / 본문 15px Regular 70% opacity (피그마 Body15)
 * - 카드 전체 링크; 별도 "보러가기" 텍스트는 시안에 없음 (`aria-label`에 CTA 반영)
 * - 모바일 뷰포트: `RowLayout` 1열 + 카드 `w-full` (360px 캡 없음)
 * - 태블릿·데스크톱: `RowLayout` 2×2 `grid`, 셀 너비에 맞춤
 */
function ListCell({
  cell,
  onRequestSlotEdit,
}: {
  cell: CardCell;
  onRequestSlotEdit?: () => void;
}) {
  const iconAsset = asAsset(slot(cell, "icon"));
  const title = asText(slot(cell, "title"));
  const body = asText(slot(cell, "body"));
  const cta = asCta(slot(cell, "cta"));
  const label =
    [title, cta?.label].filter(Boolean).join(" — ") || "서비스 카드";

  return (
    <div className="flex min-h-[96px] w-full min-w-0 flex-row items-center gap-4 overflow-hidden rounded-ods-8 bg-white px-4 text-left shadow-none transition-shadow hover:shadow-sm">
      <LeadingIcon asset={iconAsset} onRequestSlotEdit={onRequestSlotEdit} />
      <a
        href={cta?.url ?? "#"}
        aria-label={label}
        className="flex min-h-0 min-w-0 flex-1 flex-col justify-center gap-1 bg-white py-5 no-underline"
      >
        {title ? (
          <p className="truncate font-pretendard text-[18px] font-semibold leading-6 tracking-[-0.3px] text-ods-text-primary">
            {title}
          </p>
        ) : null}
        {body ? (
          <p className="line-clamp-2 font-pretendard text-[15px] font-normal leading-6 tracking-[-0.3px] text-ods-text-primary opacity-70">
            {body}
          </p>
        ) : null}
      </a>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Table 카드 — Figma 2:166 (table) 스펙
//
// 구조:
//   ┌────────────────────────┐  ← 타이틀 바 (Heading17 SemiBold, h-40)
//   │       타이틀           │
//   ├────────────────────────┤
//   │     row 텍스트 1       │  ← row (Body16 Medium 또는 Semibold, h-64)
//   │  ─── divider 1px ───   │
//   │     row 텍스트 2       │
//   │       ...              │
//   └────────────────────────┘
//
// cell.slots.title         → 타이틀 바 텍스트
// cell.slots.meta.items    → 각 row 텍스트
// cell.theme               → grey / blue / green (색상 + 보더 + 섀도우)
// ---------------------------------------------------------------------------

const TABLE_THEMES: Record<CardCellTheme, {
  titleBar: string;
  titleColor: string;
  rowBg: string;
  rowColor: string;
  rowFont: "medium" | "semibold";
  divider: string;
  border: string;
  shadow: string;
  rowPaddingX: number;
}> = {
  grey: {
    titleBar: "#E0E0E0",
    titleColor: "#141414",
    rowBg: "#F5F5F5",
    rowColor: "#141414",
    rowFont: "medium",
    divider: "#E0E0E0",
    border: "none",
    shadow: "none",
    rowPaddingX: 12,
  },
  blue: {
    titleBar: "#00A1FF",
    titleColor: "#FFFFFF",
    rowBg: "#F0F8FC",
    rowColor: "#141414",
    rowFont: "medium",
    divider: "#EDEDED",
    border: "1px solid #00A1FF",
    shadow: "none",
    rowPaddingX: 16,
  },
  green: {
    titleBar: "#0AB261",
    titleColor: "#FFFFFF",
    rowBg: "#F2FFF8",
    rowColor: "#05924E",
    rowFont: "semibold",
    divider: "#EDEDED",
    border: "2px solid #0AB261",
    shadow: "0 0 30px 0 rgba(10, 178, 97, 0.3)",
    rowPaddingX: 20,
  },
};

function CardTableCell({ cell }: { cell: CardCell }) {
  const theme = TABLE_THEMES[(cell.theme as keyof typeof TABLE_THEMES) ?? "grey"] ?? TABLE_THEMES.grey;
  const title = asText(slot(cell, "title")) ?? "";
  const meta = asMeta(slot(cell, "meta")) ?? [];

  return (
    <div
      className="flex w-full min-w-0 flex-col overflow-hidden rounded-ods-8"
      style={{
        border: theme.border,
        boxShadow: theme.shadow,
      }}
    >
      {/* 타이틀 바 */}
      <div
        className="flex h-10 w-full flex-col items-center justify-center"
        style={{ background: theme.titleBar }}
      >
        <p
          className="w-full text-center font-pretendard text-[17px] font-semibold leading-[22px] tracking-[-0.3px]"
          style={{ color: theme.titleColor }}
        >
          {title}
        </p>
      </div>

      {/* row 컨테이너 */}
      <div
        className="flex w-full flex-col items-stretch"
        style={{
          background: theme.rowBg,
          padding: `0 ${theme.rowPaddingX}px 8px`,
        }}
      >
        {meta.map((rowText, i) => (
          <div key={i}>
            <div className="flex min-h-16 w-full flex-col items-center justify-center py-3">
              <p
                className={cn(
                  "w-full whitespace-pre-line break-keep text-center font-pretendard text-[16px] leading-5 tracking-[-0.3px]",
                  theme.rowFont === "semibold" ? "font-semibold" : "font-medium"
                )}
                style={{ color: theme.rowColor }}
              >
                {rowText}
              </p>
            </div>
            {i < meta.length - 1 && (
              <div
                aria-hidden
                className="h-px w-full"
                style={{ background: theme.divider }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 링크 묶음 카드 — 레퍼런스: IR "주요 투자정보"
//   surface-gray 컨테이너 radius-16, 그룹 제목(title-lg) + 더보기 원형 화살표,
//   링크 행(body-lg) 3~5개는 border 구분선, 우측 액션 아이콘(download/audio/link/arrow)
// ---------------------------------------------------------------------------

const LINK_ACTION_ICON = {
  download: IconArrowDownToLine,
  audio: IconHeadset,
  link: IconLink,
  arrow: IconArrowRight,
} as const;

function CardLinkGroupCell({ cell }: { cell: CardCell }) {
  const title = asText(slot(cell, "title"));
  const more = asCta(slot(cell, "cta"));
  const links = asLinks(slot(cell, "links")) ?? [];
  return (
    <div className="flex h-full w-full flex-col rounded-ods-16 bg-ods-surface-gray px-5 pb-2 pt-6">
      <div className="mb-8 flex items-center gap-2">
        {title && (
          <h3 className="font-pretendard text-ods-title-lg font-semibold text-ods-text-primary">{title}</h3>
        )}
        {more && (
          <a
            href={more.url || "#"}
            aria-label={more.label || `${title ?? ""} 더보기`}
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-ods-border-light text-ods-text-primary"
          >
            <IconArrowRight size={14} />
          </a>
        )}
      </div>
      <ul className="m-0 flex list-none flex-col p-0">
        {links.map((l, i) => (
          <li key={i} className="flex items-center justify-between gap-3 border-t border-ods-border py-4">
            <a href={l.url || "#"} className="min-w-0 flex-1 truncate font-pretendard text-ods-body-lg text-ods-text-primary">
              {l.label}
            </a>
            <span className="flex shrink-0 items-center gap-4 text-ods-text-primary">
              {((l.actions && l.actions.length ? l.actions : ["arrow"]) as LinkAction[]).map((a) => {
                const Icon = LINK_ACTION_ICON[a] ?? IconArrowRight;
                return <Icon key={a} size={18} aria-label={a} />;
              })}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 혜택 필 — 레퍼런스: 적금 "매달 자동이체로 편하게"
//   테두리 1px border-default, radius-16, 좌 아이콘 48px + 한 줄 굵은 제목(title-md)
// ---------------------------------------------------------------------------

// 리스트 타입 카드 배경 톤 (2026-10): 조건·단순 나열 = gray 일괄, 다양한 케이스 = 베리언츠
const PILL_TONE_BG: Record<string, string> = {
  gray: "#F7F9FA",
  mint: "#EAF7F0",
  pink: "#FDEDED",
  yellow: "#FFF7E0",
  sky: "#EAF1FB",
};

/**
 * 리스트 타입 카드 (pillcard) — usp·조건 설명 섹션의 기본 컴포넌트
 *   - 배경색 카드(보더 없음) + 좌측 아이콘 24(흰 bg 박스 40) + 제목 18 semibold
 *   - 서브타이틀(body) 있으면 제목 아래 15px tertiary 1줄 (타이틀만 / 서브타이틀 2가지 변형)
 *   - theme: gray(기본) | mint | pink | yellow | sky
 */
function CardPillCell({ cell, onRequestSlotEdit }: { cell: CardCell; onRequestSlotEdit?: () => void }) {
  const icon = asAsset(slot(cell, "icon"));
  const title = asText(slot(cell, "title"));
  const body = asText(slot(cell, "body"));
  const bg = PILL_TONE_BG[cell.theme ?? "gray"] ?? PILL_TONE_BG.gray; // 흰 배경 없음 — 항상 톤 배경
  return (
    <div className="flex w-full items-center gap-3 rounded-ods-16 px-[25px] py-[25px]" style={{ background: bg }}>
      <LeadingIcon asset={icon} tone="none" compact size={PILL_ICON_PX} onRequestSlotEdit={onRequestSlotEdit} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="min-w-0 truncate font-pretendard text-[18px] font-semibold leading-6 tracking-[-0.3px] text-ods-text-primary">
          {title}
        </p>
        {body && (
          <p className="min-w-0 truncate font-pretendard text-[15px] font-normal leading-5 tracking-[-0.3px] text-ods-text-tertiary">
            {body}
          </p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 조건 표 — 레퍼런스: 적금 "기간별 금리"
//   좌측 그라데이션 레일(primary 저투명도) + 흰 점, 행: 라벨(body-lg, secondary) · 값(title-lg, 우측, tabular-nums)
// ---------------------------------------------------------------------------

function CardKvCell({ cell }: { cell: CardCell }) {
  const title = asText(slot(cell, "title"));
  const rows = asRows(slot(cell, "rows")) ?? [];
  const rail = cell.theme !== "grey"; // theme:"grey" 로 레일 끔 (하네스 rail:false)
  return (
    <div className="w-full">
      {title && (
        <h3 className="mb-4 font-pretendard text-ods-title-md font-semibold text-ods-text-primary">{title}</h3>
      )}
      <div className="relative">
        {rail && (
          <div
            aria-hidden
            className="absolute bottom-0 left-0 top-0 w-3 rounded-full"
            style={{ background: "linear-gradient(180deg, rgba(0,161,255,0.22) 0%, rgba(0,161,255,0.06) 100%)" }}
          />
        )}
        <ul className={cn("m-0 flex list-none flex-col p-0", rail && "pl-10")}>
          {rows.map((r, i) => (
            <li key={i} className="relative flex items-baseline justify-between gap-4 py-4">
              {rail && (
                <span aria-hidden className="absolute -left-10 top-1/2 size-3 -translate-y-1/2 translate-x-0 rounded-full bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.06)]" />
              )}
              <span className="min-w-0 flex-1 truncate font-pretendard text-ods-body-lg text-ods-text-secondary">{r.label}</span>
              <span
                className={cn(
                  "shrink-0 font-pretendard text-ods-title-lg font-bold tracking-[-0.3px]",
                  r.highlight ? "text-ods-primary" : "text-ods-text-primary"
                )}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {r.value}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 세로 단계 — 레퍼런스: K-패스 "이미 쓰던 카드가 있어도"
//   ListLayout(stepcard) 가 surface-gray 컨테이너와 세로 연결선을 그리고, 셀은 아이콘 40px + 제목(title-md) + 보조(body-md tertiary)
// ---------------------------------------------------------------------------

function CardStepCell({ cell, onRequestSlotEdit }: { cell: CardCell; onRequestSlotEdit?: () => void }) {
  const icon = asAsset(slot(cell, "icon"));
  const stepNumber = asText(slot(cell, "stepNumber"));
  const title = asText(slot(cell, "title"));
  const body = asText(slot(cell, "body"));
  return (
    <div className="flex w-full gap-4 py-3">
      <div className="relative z-[1] shrink-0">
        {icon ? <LeadingIcon asset={icon} tone="none" onRequestSlotEdit={onRequestSlotEdit} /> : <LeadingNumber n={stepNumber ?? ""} />}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1 pt-2">
        {title && (
          <p className="whitespace-pre-line font-pretendard text-[17px] font-semibold leading-[22px] tracking-[-0.3px] text-ods-text-primary">
            {title}
          </p>
        )}
        {body && (
          <p className="truncate font-pretendard text-ods-body-md text-ods-text-tertiary">{body}</p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FAQ 카드 — accordion (collapsible Q&A)
//
// cell.slots.title → 질문 (Body16 SemiBold)
// cell.slots.body  → 답변 (Body14 Regular, 펼쳤을 때만)
// ODS 토큰: bg-white, border-ods-border-light, text-ods-text-primary / -secondary, rounded-ods-8.
// ---------------------------------------------------------------------------

function CardFaqCell({ cell }: { cell: CardCell }) {
  const [open, setOpen] = useState(false);
  const question = asText(slot(cell, "title")) ?? "";
  const answer = asText(slot(cell, "body")) ?? "";

  return (
    <div className="w-full overflow-hidden rounded-ods-8 border border-ods-border-light bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-ods-surface-gray"
      >
        <span className="font-pretendard text-[16px] font-semibold leading-5 tracking-[-0.3px] text-ods-text-primary">
          {question}
        </span>
        <IconChevronDown
          size={18}
          className={cn(
            "shrink-0 text-ods-text-tertiary transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      {/* 닫힘 상태도 DOM 에 남겨 SSR(정적 HTML export)에서 답변이 유실되지 않게 한다 */}
      <div data-faq-answer hidden={!open} className="border-t border-ods-border-light px-5 py-4">
        <p className="whitespace-pre-line font-pretendard text-[14px] leading-5 tracking-[-0.3px] text-ods-text-secondary">
          {answer}
        </p>
      </div>
    </div>
  );
}

