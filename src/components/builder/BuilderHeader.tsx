"use client";

import { useBuilderStore } from "@/store/builder-store";

export default function BuilderHeader() {
  const doc = useBuilderStore((s) => s.doc);
  const openReview = useBuilderStore((s) => s.openReviewModal);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-builder-border bg-builder-panel px-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-ods-8 bg-builder-accent text-sm font-semibold">
          LB
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium">{doc.meta.title}</span>
          <span className="text-xs text-builder-muted">/{doc.meta.slug}</span>
        </div>
        <span className="ml-2 rounded-ods-4 bg-builder-panel-2 px-2 py-0.5 text-[11px] text-builder-muted">
          v{doc.schemaVersion}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-ods-8 border border-builder-border bg-builder-panel-2 px-3 py-1.5 text-xs text-builder-text hover:border-builder-accent"
        >
          미리보기
        </button>
        <button
          type="button"
          onClick={openReview}
          className="rounded-ods-8 bg-builder-success px-3 py-1.5 text-xs font-medium text-black hover:bg-builder-success/90"
        >
          ✓ 검수 요청
        </button>
        <button
          type="button"
          className="rounded-ods-8 bg-builder-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-builder-accent/90"
        >
          배포
        </button>
      </div>
    </header>
  );
}
