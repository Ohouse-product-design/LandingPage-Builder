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
import type {
  CardCell,
  CardLayoutSettings,
  CardSlotContent,
  CardSlotName,
  CardUsagePresetId,
} from "@/schema/card";
import type { Viewport } from "@/schema/doc";

// ---------------------------------------------------------------------------
// 공용 헬퍼
// ---------------------------------------------------------------------------

const GRID_COLS_CLASS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
};

const ROW_ALIGN_CLASS: Record<string, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
};

// ---------------------------------------------------------------------------
// Card 컴포넌트 (메인)
// ---------------------------------------------------------------------------

interface CardProps {
  usage: CardUsagePresetId;
  layout: CardLayoutSettings;
  cells: CardCell[];
  viewport: Viewport;
}

export default function Card({ usage, layout, cells, viewport }: CardProps) {
  switch (layout.type) {
    case "grid":
      return <GridLayout usage={usage} cells={cells} viewport={viewport} settings={layout.settings} />;
    case "carousel":
      return <CarouselLayout usage={usage} cells={cells} viewport={viewport} settings={layout.settings} />;
    case "row":
      return <RowLayout usage={usage} cells={cells} viewport={viewport} settings={layout.settings} />;
  }
}

// ---------------------------------------------------------------------------
// Grid layout
// ---------------------------------------------------------------------------

function GridLayout({
  usage,
  cells,
  viewport,
  settings,
}: {
  usage: CardUsagePresetId;
  cells: CardCell[];
  viewport: Viewport;
  settings: Extract<CardLayoutSettings, { type: "grid" }>["settings"];
}) {
  const cols = settings.columns[viewport] ?? 4;
  return (
    <div
      className={cn("grid", GRID_COLS_CLASS[cols] ?? "grid-cols-4")}
      style={{ gap: `${settings.gap}px` }}
    >
      {cells.map((cell) => (
        <CellRenderer key={cell.id} cell={cell} usage={usage} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Carousel layout — autoScroll on/off
// ---------------------------------------------------------------------------

function CarouselLayout({
  usage,
  cells,
  viewport,
  settings,
}: {
  usage: CardUsagePresetId;
  cells: CardCell[];
  viewport: Viewport;
  settings: Extract<CardLayoutSettings, { type: "carousel" }>["settings"];
}) {
  const cardWidth = settings.cardWidth[viewport] ?? 320;

  // autoScroll=true 면 marquee 형태로 cells 를 두 번 반복하고 keyframe 으로 무한 이동
  const renderedCells = settings.autoScroll ? [...cells, ...cells] : cells;
  const durationSec = (settings.autoScrollDurationMs ?? 30000) / 1000;

  // 고유 animation name (autoScroll on/off 토글 시 재시작되도록 key 부여)
  const animKey = useMemo(
    () => `card-marquee-${cells.length}-${durationSec}`,
    [cells.length, durationSec]
  );

  return (
    <div className="relative overflow-hidden">
      <div
        className={cn("flex w-max", settings.autoScroll ? "" : "overflow-x-auto")}
        style={{
          gap: `${settings.gap}px`,
          animation: settings.autoScroll
            ? `${animKey} ${durationSec}s linear infinite`
            : undefined,
        }}
      >
        {renderedCells.map((cell, i) => (
          <div key={`${cell.id}-${i}`} style={{ width: `${cardWidth}px`, flexShrink: 0 }}>
            <CellRenderer cell={cell} usage={usage} />
          </div>
        ))}
      </div>

      {/* 좌우 화살표 */}
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

      {/* keyframes — translateX(0) → translateX(-50%) (절반만 이동하면 두 번 반복한 cells 의 처음으로 매끄럽게 돌아감) */}
      {settings.autoScroll && (
        <style>{`@keyframes ${animKey} { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Row layout
// ---------------------------------------------------------------------------

function RowLayout({
  usage,
  cells,
  viewport,
  settings,
}: {
  usage: CardUsagePresetId;
  cells: CardCell[];
  viewport: Viewport;
  settings: Extract<CardLayoutSettings, { type: "row" }>["settings"];
}) {
  // responsive override 가 있으면 viewport 별로 align/wrap 결정
  const resolved = settings.responsive?.[viewport] ?? settings;
  return (
    <div
      className={cn(
        "flex",
        ROW_ALIGN_CLASS[resolved.align] ?? "justify-start",
        resolved.wrap ? "flex-wrap" : "flex-nowrap"
      )}
      style={{ gap: `${settings.gap}px` }}
    >
      {cells.map((cell) => (
        <div key={cell.id} className="flex-1 min-w-0">
          <CellRenderer cell={cell} usage={usage} />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cell 렌더러 — usage 별 슬롯 조합 + 스타일
// ---------------------------------------------------------------------------

function CellRenderer({ cell, usage }: { cell: CardCell; usage: CardUsagePresetId }) {
  switch (usage) {
    case "usp":
      return <UspCell cell={cell} />;
    case "review":
      return <ReviewCell cell={cell} />;
    case "step":
      return <StepCell cell={cell} />;
    case "service":
      return <ServiceCell cell={cell} />;
    case "custom":
      return <CustomCell cell={cell} />;
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

function asCta(c?: CardSlotContent): { label: string; url: string } | null {
  if (!c || c.kind !== "cta") return null;
  return { label: c.label, url: c.url };
}

// ---------------------------------------------------------------------------
// Usage 별 cell 스타일
// ---------------------------------------------------------------------------

function UspCell({ cell }: { cell: CardCell }) {
  const tag = asText(slot(cell, "tag"));
  const title = asText(slot(cell, "title"));
  const body = asText(slot(cell, "body"));
  const mediaAlt = asAssetAlt(slot(cell, "media"));
  return (
    <div className="h-full rounded-ods-12 border border-ods-border p-4">
      {tag && (
        <div className="mb-2 inline-block rounded-ods-4 bg-ods-surface-gray px-2 py-0.5 text-ods-caption text-ods-text-secondary">
          {tag}
        </div>
      )}
      {title && (
        <div className="whitespace-pre-line text-ods-title-lg text-ods-text-primary">
          {title}
        </div>
      )}
      {body && (
        <div className="mt-1 whitespace-pre-line text-ods-body-lg text-ods-text-tertiary">
          {body}
        </div>
      )}
      {mediaAlt && (
        <div className="mt-3 flex h-20 items-center justify-center rounded-ods-8 bg-ods-surface-light text-[10px] text-ods-text-tertiary">
          🖼 {mediaAlt}
        </div>
      )}
    </div>
  );
}

function ReviewCell({ cell }: { cell: CardCell }) {
  const rating = asRating(slot(cell, "rating"));
  const title = asText(slot(cell, "title"));
  const body = asText(slot(cell, "body"));
  const meta = asMeta(slot(cell, "meta"));
  return (
    <div className="h-full rounded-ods-12 bg-white p-4 shadow-sm">
      {rating && (
        <div className="flex gap-0.5 text-ods-star-yellow">
          {Array.from({ length: rating.max }).map((_, i) => (
            <span key={i}>{i < rating.value ? "★" : "☆"}</span>
          ))}
        </div>
      )}
      {title && (
        <div className="mt-2 whitespace-pre-line text-ods-title-md text-ods-text-primary">
          {title}
        </div>
      )}
      {body && (
        <div className="mt-2 line-clamp-5 text-ods-body-md text-ods-text-tertiary">
          {body}
        </div>
      )}
      {meta && meta.length > 0 && (
        <div className="mt-3 text-ods-caption text-ods-text-tertiary">
          {meta.join(" · ")}
        </div>
      )}
    </div>
  );
}

function StepCell({ cell }: { cell: CardCell }) {
  const stepNumber = asText(slot(cell, "stepNumber"));
  const title = asText(slot(cell, "title"));
  const body = asText(slot(cell, "body"));
  const mediaAlt = asAssetAlt(slot(cell, "media"));
  return (
    <div className="h-full rounded-ods-12 bg-ods-surface-light p-4">
      {stepNumber && (
        <div className="text-ods-caption font-semibold text-ods-primary">
          STEP {stepNumber}
        </div>
      )}
      {title && (
        <div className="mt-1 text-ods-title-md text-ods-text-primary">{title}</div>
      )}
      {body && (
        <div className="mt-1 whitespace-pre-line text-ods-body-md text-ods-text-tertiary">
          {body}
        </div>
      )}
      {mediaAlt && (
        <div className="mt-3 flex h-24 items-center justify-center rounded-ods-8 bg-white text-[10px] text-ods-text-tertiary">
          🖼 {mediaAlt}
        </div>
      )}
    </div>
  );
}

function ServiceCell({ cell }: { cell: CardCell }) {
  const iconAlt = asAssetAlt(slot(cell, "icon"));
  const title = asText(slot(cell, "title"));
  const body = asText(slot(cell, "body"));
  const cta = asCta(slot(cell, "cta"));
  return (
    <a
      href={cta?.url ?? "#"}
      className="flex h-full flex-col items-center rounded-ods-12 bg-white p-4 text-center hover:shadow-sm"
    >
      <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-ods-surface-light text-[10px] text-ods-text-tertiary">
        {iconAlt ? "🖼" : ""}
      </div>
      {title && (
        <div className="text-ods-title-md text-ods-text-primary">{title}</div>
      )}
      {body && (
        <div className="mt-1 text-ods-body-md text-ods-text-tertiary">{body}</div>
      )}
      {cta && (
        <div className="mt-2 text-ods-caption text-ods-primary">
          {cta.label} →
        </div>
      )}
    </a>
  );
}

function CustomCell({ cell }: { cell: CardCell }) {
  // 커스텀 — 채워진 슬롯만 순서대로 렌더
  const slots = cell.slots;
  return (
    <div className="h-full rounded-ods-12 border border-ods-border p-4">
      {Object.entries(slots).map(([k, c]) => (
        <div key={k} className="mb-2 text-[12px] text-ods-text-secondary">
          <span className="text-[10px] uppercase text-ods-text-tertiary">{k}:</span>{" "}
          {c?.kind === "text" && c.text}
          {c?.kind === "rating" && `★ ${c.value}/${c.max ?? 5}`}
          {c?.kind === "meta" && c.items.join(" · ")}
          {c?.kind === "cta" && `→ ${c.label}`}
          {c?.kind === "asset" && `🖼 ${c.asset.alt}`}
        </div>
      ))}
    </div>
  );
}
