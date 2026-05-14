"use client";

/**
 * 에셋 임베드 모달.
 * - 실제 구현에서는 design-assets 레포 검색 API 를 호출하지만,
 *   1차 골격에서는 mock 카탈로그를 검색하는 시뮬레이션.
 */

import { useMemo, useState } from "react";

import { cn } from "@/lib/cn";
import type { AssetRef } from "@/schema/doc";
import { useBuilderStore } from "@/store/builder-store";

const MOCK_ASSETS: AssetRef[] = [
  {
    assetId: "moving/hero/main",
    type: "image",
    alt: "이사 트럭 메인",
    meta: { width: 1280, height: 720, sizeKB: 184 },
  },
  {
    assetId: "moving/usp/fragile",
    type: "image",
    alt: "파손 위험",
    meta: { width: 440, height: 300, sizeKB: 42 },
  },
  {
    assetId: "moving/usp/price",
    type: "image",
    alt: "견적 비교",
    meta: { width: 440, height: 300, sizeKB: 38 },
  },
  {
    assetId: "moving/usp/time",
    type: "image",
    alt: "시간 부족",
    meta: { width: 440, height: 300, sizeKB: 41 },
  },
  {
    assetId: "moving/usp/trust",
    type: "image",
    alt: "신뢰",
    meta: { width: 440, height: 300, sizeKB: 36 },
  },
  {
    assetId: "service/interior",
    type: "image",
    alt: "인테리어 서비스",
    meta: { width: 96, height: 96, sizeKB: 8 },
  },
  {
    assetId: "service/cleaning",
    type: "image",
    alt: "청소 서비스",
    meta: { width: 96, height: 96, sizeKB: 7 },
  },
  {
    assetId: "ods/icon/check",
    type: "svg",
    alt: "체크 아이콘",
    meta: { width: 24, height: 24, sizeKB: 1 },
  },
  {
    assetId: "ods/icon/star",
    type: "svg",
    alt: "별 아이콘",
    meta: { width: 24, height: 24, sizeKB: 1 },
  },
];

export default function AssetEmbedModal() {
  const modal = useBuilderStore((s) => s.assetModal);
  const close = useBuilderStore((s) => s.closeAssetModal);
  const embed = useBuilderStore((s) => s.embedAsset);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MOCK_ASSETS;
    return MOCK_ASSETS.filter(
      (a) =>
        a.assetId?.toLowerCase().includes(q) ||
        a.alt.toLowerCase().includes(q)
    );
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
              design-assets 레포에서 검색 · 슬롯: {modal.slotName}
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
            placeholder="에셋 ID 또는 alt 텍스트로 검색"
            className="w-full rounded-ods-8 border border-builder-border bg-builder-bg px-3 py-2 text-[12px] outline-none focus:border-builder-accent"
          />
        </div>

        <div className="builder-scroll max-h-[420px] overflow-y-auto p-3">
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
                <div className="mb-2 flex h-24 items-center justify-center rounded-ods-4 bg-builder-panel-2 text-[10px] text-builder-muted">
                  {asset.type.toUpperCase()}
                </div>
                <div className="truncate text-[11px] text-builder-text">
                  {asset.alt}
                </div>
                <div className="truncate text-[10px] text-builder-muted">
                  {asset.assetId}
                </div>
                <div className="text-[9px] text-builder-muted">
                  {asset.meta?.width}×{asset.meta?.height} · {asset.meta?.sizeKB}KB
                </div>
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
