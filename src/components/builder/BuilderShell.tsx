"use client";

/**
 * 3-pane Builder Shell (상단 앱 헤더 없음).
 *
 * ┌──────────────┬───────────────────────────────┬──────────────────┐
 * │ SectionTree  │  PreviewStage (Responsive)    │  Inspector       │
 * │  (260px)     │  (flex 1)                     │  (340px)         │
 * └──────────────┴───────────────────────────────┴──────────────────┘
 */

import SectionTree from "./SectionTree";
import PreviewStage from "./PreviewStage";
import Inspector from "./Inspector";
import AssetEmbedModal from "./AssetEmbedModal";
import ReviewModal from "./ReviewModal";

export default function BuilderShell() {
  return (
    <div className="flex h-screen w-screen flex-col bg-builder-bg text-builder-text">
      <div className="flex min-h-0 flex-1">
        <aside className="w-[260px] shrink-0 border-r border-builder-border bg-builder-panel">
          <SectionTree />
        </aside>
        <main className="flex min-w-0 flex-1 flex-col">
          <PreviewStage />
        </main>
        <aside className="w-[340px] shrink-0 border-l border-builder-border bg-builder-panel">
          <Inspector />
        </aside>
      </div>
      <AssetEmbedModal />
      <ReviewModal />
    </div>
  );
}
