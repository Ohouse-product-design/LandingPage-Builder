"use client";

/**
 * 에셋 임베드 모달.
 * - `src/catalog/ods-assets.json` 기반 ODS Asset Library(image / lottie) 검색·선택
 * - 선택 시 `AssetRef.assetId` 에 ODS 컴포넌트명이 저장되고, 프리뷰는 `OdsAssetRenderer` 가 해석
 * - 썸네일: 스크롤 영역에 들어올 때만 `OdsAssetRenderer` 로 StillImage / Lottie 렌더 (다수 Lottie fetch 완화), 원본 비율 유지(`object-contain` 등)
 */

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";

import OdsAssetRenderer from "@/components/preview/OdsAssetRenderer";
import { cn } from "@/lib/cn";
import { searchOdsLibrary } from "@/lib/ods-asset-library";
import type { AssetRef } from "@/schema/doc";
import { useBuilderStore } from "@/store/builder-store";

function entryToAssetRef(entry: {
  name: string;
  type: AssetRef["type"];
}): AssetRef {
  return {
    assetId: entry.name,
    type: entry.type,
    alt: entry.name,
  };
}

function LazyEmbedAssetThumbnail({
  asset,
  scrollRootRef,
}: {
  asset: AssetRef;
  scrollRootRef: RefObject<HTMLDivElement | null>;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const root = scrollRootRef.current;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting);
        if (hit) {
          setShow(true);
          io.disconnect();
        }
      },
      { root: root ?? undefined, rootMargin: "120px 0px", threshold: 0.01 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [scrollRootRef]);

  return (
    <div
      ref={wrapRef}
      className="mb-2 flex h-24 w-full items-center justify-center overflow-hidden rounded-ods-4 bg-builder-panel-2"
    >
      {show ? (
        <div className="pointer-events-none flex size-full min-h-0 min-w-0 items-center justify-center p-1">
          <OdsAssetRenderer
            asset={asset}
            className={
              asset.type === "lottie"
                ? "flex h-full w-full max-h-full max-w-full items-center justify-center [&_.lottie-react]:max-h-full [&_.lottie-react]:max-w-full"
                : "h-auto w-auto max-h-full max-w-full object-contain"
            }
          />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-0.5 text-[9px] text-builder-muted">
          <span className="rounded px-1 py-px uppercase tracking-wide opacity-80">
            {asset.type}
          </span>
        </div>
      )}
    </div>
  );
}

export default function AssetEmbedModal() {
  const modal = useBuilderStore((s) => s.assetModal);
  const close = useBuilderStore((s) => s.closeAssetModal);
  const embed = useBuilderStore((s) => s.embedAsset);
  const [query, setQuery] = useState("");
  const scrollRootRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const list = searchOdsLibrary(query, { category: "asset" }).filter(
      (e) => e.type === "image" || e.type === "lottie"
    );
    return list.slice(0, 90).map(entryToAssetRef);
  }, [query]);

  if (!modal) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[680px] max-w-full rounded-ods-12 border border-builder-border bg-builder-panel"
      >
        <div className="flex items-center justify-between border-b border-builder-border px-5 py-3">
          <div>
            <div className="text-sm font-semibold">에셋 임베드</div>
            <div className="text-[11px] text-builder-muted">
              {modal.cellId && modal.cardSlotName ? (
                <>
                  ODS Asset Library · 카드 셀 슬롯:{" "}
                  <span className="text-builder-text">{modal.cardSlotName}</span>
                </>
              ) : (
                <>ODS Asset Library · 슬롯: {modal.slotName}</>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            className="text-builder-muted hover:text-builder-text"
          >
            ✕
          </button>
        </div>

        <div className="border-b border-builder-border p-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="컴포넌트명 검색 (예: BoltTruck, Motion…)"
            className="w-full rounded-ods-8 border border-builder-border bg-builder-bg px-3 py-2 text-[12px] outline-none focus:border-builder-accent"
          />
        </div>

        <div
          ref={scrollRootRef}
          className="builder-scroll max-h-[420px] overflow-y-auto p-3"
        >
          <div className="grid grid-cols-3 gap-2">
            {filtered.map((asset) => (
              <button
                key={asset.assetId}
                type="button"
                onClick={() =>
                  embed(modal.sectionId, modal.componentId, modal.slotName, asset)
                }
                className={cn(
                  "rounded-ods-8 border border-builder-border bg-builder-bg p-2 text-left hover:border-builder-accent"
                )}
              >
                <LazyEmbedAssetThumbnail asset={asset} scrollRootRef={scrollRootRef} />
                <div className="truncate text-[11px] text-builder-text">{asset.alt}</div>
                <div className="truncate text-[10px] text-builder-muted">{asset.assetId}</div>
              </button>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-[12px] text-builder-muted">
              일치하는 에셋이 없습니다
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
