"use client";

import { useMemo } from "react";

import { cn } from "@/lib/cn";
import { VIEWPORT_WIDTH, type Viewport } from "@/schema/doc";
import { useBuilderStore } from "@/store/builder-store";
import PreviewRenderer from "../preview/PreviewRenderer";

/**
 * 가운데 프리뷰 패널.
 * - 디바이스 토글: Mobile / Tablet / Desktop
 * - 검수 요청: 상단 바 우측 (`ReviewModal` 연동)
 * - 1차 골격: iframe 대신 동일 프로세스에서 PreviewRenderer 를 직접 렌더하고
 *   고정 width container 로 시뮬레이션 — 추후 실 iframe + postMessage 동기화로 교체.
 */
export default function PreviewStage() {
  const viewport = useBuilderStore((s) => s.viewport);
  const setViewport = useBuilderStore((s) => s.setViewport);
  const doc = useBuilderStore((s) => s.doc);
  const selection = useBuilderStore((s) => s.selection);
  const selectSection = useBuilderStore((s) => s.selectSection);
  const openReviewModal = useBuilderStore((s) => s.openReviewModal);

  const width = useMemo(() => VIEWPORT_WIDTH[viewport], [viewport]);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-builder-border bg-builder-panel px-4">
        <div className="flex items-center gap-1">
          {(["mobile", "tablet", "desktop"] as Viewport[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setViewport(v)}
              className={cn(
                "rounded-ods-4 px-2.5 py-1 text-[11px]",
                viewport === v
                  ? "bg-builder-accent text-white"
                  : "text-builder-muted hover:bg-builder-panel-2 hover:text-builder-text"
              )}
            >
              {v}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 text-[11px] text-builder-muted">
            <span>
              {width}px · /preview/{doc.meta.slug}
            </span>
          </div>
          <button
            type="button"
            onClick={() => openReviewModal()}
            className="rounded-ods-8 bg-builder-success px-2.5 py-1 text-[11px] font-medium text-black hover:bg-builder-success/90"
          >
            검수 요청
          </button>
        </div>
      </div>

      <div className="builder-scroll flex-1 overflow-y-auto bg-[#0a0c12] p-6">
        <div
          className="mx-auto rounded-ods-12 border border-builder-border bg-white text-black shadow-2xl transition-all"
          style={{ width: `${width}px`, maxWidth: "100%" }}
        >
          <PreviewRenderer
            doc={doc}
            viewport={viewport}
            selectedSectionId={selection.sectionId ?? undefined}
            onSelectSection={selectSection}
          />
        </div>
        <div className="mt-3 text-center text-[11px] text-builder-muted">
          {viewport === "mobile" && "iPhone 13 기준 · 375 × 812"}
          {viewport === "tablet" && "iPad Mini 기준 · 768 × 1024"}
          {viewport === "desktop" && "Desktop · 1280 × auto"}
        </div>
      </div>
    </div>
  );
}
