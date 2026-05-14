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

import { useMemo } from "react";

import { cn } from "@/lib/cn";
import { IconPhoto, IconStar, IconStarFilled } from "@/lib/ods-icons";
import type { AssetSlotModalOpenContext } from "@/schema/asset-modal-context";
import type {
  CardCell,
  CardLayoutSettings,
  CardSlotContent,
  CardSlotName,
  CardUsagePresetId,
} from "@/schema/card";
import type { Viewport } from "@/schema/doc";
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
  /** 빌더 프리뷰: 에셋 클릭 시 슬롯 교체 모달 */
  previewAsset?: CardPreviewAssetBinding;
}

export default function Card({ usage, layout, cells, viewport, previewAsset }: CardProps) {
  switch (layout.type) {
    case "grid":
      return (
        <GridLayout
          usage={usage}
          cells={cells}
          viewport={viewport}
          settings={layout.settings}
          previewAsset={previewAsset}
        />
      );
    case "carousel":
      return (
        <CarouselLayout
          usage={usage}
          cells={cells}
          viewport={viewport}
          settings={layout.settings}
          previewAsset={previewAsset}
        />
      );
    case "row":
      return (
        <RowLayout
          usage={usage}
          cells={cells}
          viewport={viewport}
          settings={layout.settings}
          previewAsset={previewAsset}
        />
      );
  }
}

// ---------------------------------------------------------------------------
// Grid layout — Figma 31:777 (Lead 태블릿) 스펙
//
// 규칙: 2×2 full-width, 카드 사이 간격 8px 고정.
// - settings.columns / settings.gap 은 schema 호환을 위해 유지되나
//   렌더는 항상 2 col / gap 8 로 강제 (Lead UI spec).
// ---------------------------------------------------------------------------

const GRID_FIXED_GAP_PX = 8;

function GridLayout({
  usage,
  cells,
  previewAsset,
}: {
  usage: CardUsagePresetId;
  cells: CardCell[];
  viewport: Viewport;
  settings: Extract<CardLayoutSettings, { type: "grid" }>["settings"];
  previewAsset?: CardPreviewAssetBinding;
}) {
  return (
    <div
      className="grid w-full grid-cols-2"
      style={{ gap: `${GRID_FIXED_GAP_PX}px` }}
    >
      {cells.map((cell) => (
        <div key={cell.id} className="w-full">
          <CellRenderer cell={cell} usage={usage} previewAsset={previewAsset} />
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
  previewAsset,
}: {
  usage: CardUsagePresetId;
  cells: CardCell[];
  viewport: Viewport;
  settings: Extract<CardLayoutSettings, { type: "carousel" }>["settings"];
  previewAsset?: CardPreviewAssetBinding;
}) {
  const cardWidth = settings.cardWidth[viewport] ?? 320;

  const renderedCells = settings.autoScroll ? [...cells, ...cells] : cells;
  const durationSec = (settings.autoScrollDurationMs ?? 30000) / 1000;

  const animKey = useMemo(
    () => `card-marquee-${cells.length}-${durationSec}`,
    [cells.length, durationSec]
  );

  return (
    <div className="relative overflow-hidden px-0">
      <div
        className={cn(
          "flex w-max px-0",
          settings.autoScroll ? "" : "overflow-x-auto"
        )}
        style={{
          gap: `${CAROUSEL_FIXED_GAP_PX}px`,
          animation: settings.autoScroll
            ? `${animKey} ${durationSec}s linear infinite`
            : undefined,
        }}
      >
        {renderedCells.map((cell, i) => (
          <div
            key={`${cell.id}-${i}`}
            className="p-0"
            style={{ width: `${cardWidth}px`, flexShrink: 0 }}
          >
            <CellRenderer cell={cell} usage={usage} previewAsset={previewAsset} />
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
// - 기존의 수평 row 배치(align/wrap/horizontal flex) 는 Lead UI spec 에서
//   vertical stack 으로 재정의됨. align/wrap/responsive 는 schema 호환을 위해
//   유지되나 렌더에는 반영되지 않는다.
// ---------------------------------------------------------------------------

const ROW_FIXED_GAP_PX = 8;

function RowLayout({
  usage,
  cells,
  previewAsset,
}: {
  usage: CardUsagePresetId;
  cells: CardCell[];
  viewport: Viewport;
  settings: Extract<CardLayoutSettings, { type: "row" }>["settings"];
  previewAsset?: CardPreviewAssetBinding;
}) {
  return (
    <div
      className="flex w-full flex-col"
      style={{ gap: `${ROW_FIXED_GAP_PX}px` }}
    >
      {cells.map((cell) => (
        <div key={cell.id} className="w-full">
          <CellRenderer cell={cell} usage={usage} previewAsset={previewAsset} />
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
  previewAsset,
}: {
  cell: CardCell;
  usage: CardUsagePresetId;
  previewAsset?: CardPreviewAssetBinding;
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
    case "usp":
      return <CardContentsCell cell={cell} onRequestSlotEdit={slotEdit("media")} />;
    case "review":
      return <CardReviewCell cell={cell} onRequestSlotEdit={slotEdit("media")} />;
    case "step":
      return <CardStepCell cell={cell} onRequestSlotEdit={slotEdit("media")} />;
    case "service":
      return <ListCell cell={cell} onRequestSlotEdit={slotEdit("icon")} />;
    case "custom":
      return <CardContentsCell cell={cell} onRequestSlotEdit={slotEdit("media")} />;
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
 * - title / body / tag 레이아웃 동일
 */
function CardContentsCell({
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
      className="relative h-[300px] w-full overflow-hidden"
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
      {tag && (
        <p className="absolute bottom-[60px] left-0 w-full px-5 text-left font-pretendard text-[10px] leading-[14px] tracking-[-0.3px] text-white/70">
          {tag}
        </p>
      )}
      <p className="absolute bottom-3 right-5 font-pretendard text-[10px] font-medium leading-[14px] tracking-[-0.3px] text-white/40">
        AI Generated
      </p>
      <div className="absolute bottom-0 left-0 w-full px-5 pb-[24px] pt-[40px] text-white">
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
 * 리뷰 카드 — Figma `card_review_internet` (node 132:4457) 스펙 적용.
 * - 컨테이너 200px 높이 흰 배경 p-16 rounded-12
 * - title  : Body16 SemiBold 16/20 -0.3, 2줄 ellipsis (whitespace-pre-line)
 * - meta   : Detail12 Medium 12/16. items 가 3개 이상이면 마지막 항목은 `|` 로 구분.
 *            중간 항목들은 `·` 로 join. (예: 신혼 · U+ 500MB TV결합 | km***)
 * - media  : 48×48 rounded-10 작성자/제품 사진 + 5% 검정 오버레이.
 * - body   : Body14 Regular 14/20 -0.3, w-254 ellipsis 3줄. `**...**` 마커는 SemiBold 변환.
 * - rating : 선택 슬롯이 채워진 경우만 별점 노출 (기본 Lead 시안은 사용 안 함).
 */
function CardReviewCell({
  cell,
  onRequestSlotEdit,
}: {
  cell: CardCell;
  onRequestSlotEdit?: () => void;
}) {
  const rating = asRating(slot(cell, "rating"));
  const title = asText(slot(cell, "title"));
  const body = asText(slot(cell, "body"));
  const meta = asMeta(slot(cell, "meta"));
  const media = asAsset(slot(cell, "media"));
  const metaHead = meta && meta.length > 1 ? meta.slice(0, -1) : meta ?? [];
  const metaTail = meta && meta.length > 1 ? meta[meta.length - 1] : null;
  return (
    <div className="flex h-[200px] w-full flex-col gap-5 rounded-ods-12 bg-white p-4">
      <div className="flex w-full gap-3">
        <div className="flex flex-1 flex-col gap-1.5 tracking-[-0.3px]">
          {rating && (
            <div
              className="flex gap-0.5 text-ods-star-yellow"
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
          {title && (
            <h3 className="whitespace-pre-line font-pretendard text-[16px] font-semibold leading-5 text-ods-text-primary line-clamp-2">
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
        {media ? (
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[10px]">
            <OdsAssetRenderer
              asset={media}
              size={32}
              className="absolute inset-0 flex h-full w-full items-center justify-center object-cover"
              onRequestSlotEdit={onRequestSlotEdit}
            />
            <div className="absolute inset-0 bg-black/5" />
          </div>
        ) : onRequestSlotEdit ? (
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[10px]">
            <OdsAssetRenderer
              asset={{ type: "image", alt: "미디어 슬롯" }}
              size={32}
              className="absolute inset-0 flex h-full w-full items-center justify-center object-cover"
              onRequestSlotEdit={onRequestSlotEdit}
            />
            <div className="absolute inset-0 bg-black/5" />
          </div>
        ) : null}
      </div>
      {body && (
        <p className="font-pretendard text-[14px] leading-5 tracking-[-0.3px] text-ods-text-primary line-clamp-3">
          {renderRichText(body)}
        </p>
      )}
    </div>
  );
}

/**
 * 프로세스 스텝 — Figma `card_process/md` (node 34:2983) 스펙 적용.
 * - 컨테이너 260px 높이 그라데이션 배경, px-20 pb-20 rounded-12.
 * - imgGraphic 영역 : 240×160. media 가 있으면 이미지, 없으면 placeholder chip 표시.
 * - title  : Heading20 SemiBold 20/28 -0.3 #141414 opacity-80, 1줄 ellipsis.
 *            stepNumber 가 별도로 있으면 "{n}. {title}" 으로 prefix.
 * - body   : Body15 Regular 15/24 -0.3 #141414 opacity-80, 2줄 ellipsis (whitespace-pre-line).
 */
function CardStepCell({
  cell,
  onRequestSlotEdit,
}: {
  cell: CardCell;
  onRequestSlotEdit?: () => void;
}) {
  const stepNumber = asText(slot(cell, "stepNumber"));
  const title = asText(slot(cell, "title"));
  const body = asText(slot(cell, "body"));
  const media = asAsset(slot(cell, "media"));
  const displayTitle = stepNumber && title ? `${stepNumber}. ${title}` : title;
  return (
    <div
      className="flex h-[260px] w-full flex-col items-center justify-end gap-4 rounded-ods-12 px-5 pb-5"
      style={{
        backgroundImage:
          "linear-gradient(173.759deg, rgba(239,239,239,0.2) 1.5877%, rgba(139,195,235,0.2) 92.346%), linear-gradient(90deg, rgb(245,245,245) 0%, rgb(245,245,245) 100%)",
      }}
    >
      <div className="relative h-[160px] w-full max-w-[240px] shrink-0 overflow-hidden">
        {media ? (
          <OdsAssetRenderer
            asset={media}
            className="absolute inset-0 flex h-full w-full items-center justify-center object-contain"
            onRequestSlotEdit={onRequestSlotEdit}
          />
        ) : onRequestSlotEdit ? (
          <OdsAssetRenderer
            asset={{ type: "image", alt: "그래픽 슬롯" }}
            className="absolute inset-0 flex h-full w-full items-center justify-center object-contain"
            onRequestSlotEdit={onRequestSlotEdit}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="rounded-ods-12 bg-ods-primary px-8 py-4 font-pretendard text-[16px] font-semibold leading-6 tracking-[-0.3px] text-white">
              {title ?? "상담 신청하기"}
            </span>
          </div>
        )}
      </div>
      <div className="flex w-full flex-col gap-1 tracking-[-0.3px] text-ods-text-primary">
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

/**
 * 서비스 리스트 셀 — Figma `이사-프로덕트` CrossSelling `CardService` (node 640:9365 근방).
 * - 96px 높이 가로 카드, `rounded-ods-8`, 좌 96×96 이미지 + 우측 타이틀/설명
 * - 타이틀 18px Semibold / 본문 15px Regular 70% opacity (피그마 Body15)
 * - 카드 전체 링크; 별도 "보러가기" 텍스트는 시안에 없음 (`aria-label`에 CTA 반영)
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
    <div className="flex h-[96px] w-full min-w-0 max-w-[360px] flex-row items-stretch overflow-hidden rounded-ods-8 bg-white text-left shadow-none transition-shadow hover:shadow-sm">
      <div className="relative h-full w-24 shrink-0 bg-ods-surface-light">
        {iconAsset || onRequestSlotEdit ? (
          <OdsAssetRenderer
            asset={iconAsset ?? { type: "image", alt: "아이콘 슬롯" }}
            className="absolute inset-0 size-full object-cover"
            onRequestSlotEdit={onRequestSlotEdit}
          />
        ) : (
          <div className="flex size-full items-center justify-center text-ods-text-tertiary">
            <IconPhoto size={28} />
          </div>
        )}
      </div>
      <a
        href={cta?.url ?? "#"}
        aria-label={label}
        className="flex min-h-0 min-w-0 flex-1 flex-col justify-center gap-1 bg-white px-4 py-5 no-underline"
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

