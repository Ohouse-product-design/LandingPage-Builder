"use client";

/**
 * 프리뷰 렌더러 (v3 — Section 통합 컴포넌트로 dispatch 위임).
 *
 * 섹션별 렌더 로직은 모두 ./sections/*Template.tsx 로 분리됐고,
 * dispatch 는 ./Section.tsx 가 담당. PreviewRenderer 는
 * doc.sections 를 viewport 필터링 + 선택 outline shell 만 책임진다.
 */

import { cn } from "@/lib/cn";
import type { AssetSlotModalOpenContext } from "@/schema/asset-modal-context";
import type { LandingPageDoc, Section as SectionData, Viewport } from "@/schema/doc";
import Section from "./Section";

interface Props {
  doc: LandingPageDoc;
  viewport: Viewport;
  selectedSectionId?: string;
  onSelectSection?: (id: string) => void;
  onRequestAssetSlot?: (ctx: AssetSlotModalOpenContext) => void;
}

export default function PreviewRenderer({
  doc,
  viewport,
  selectedSectionId,
  onSelectSection,
  onRequestAssetSlot,
}: Props) {
  const visibleSections = doc.sections.filter(
    (s) => s.visibility[viewport] !== false
  );
  return (
    <div className="font-pretendard">
      {visibleSections.map((section) => (
        <SectionShell
          key={section.id}
          section={section}
          selected={selectedSectionId === section.id}
          onSelect={onSelectSection}
          viewport={viewport}
          onRequestAssetSlot={onRequestAssetSlot}
        />
      ))}
    </div>
  );
}

function SectionShell({
  section,
  selected,
  onSelect,
  viewport,
  onRequestAssetSlot,
}: {
  section: SectionData;
  selected: boolean;
  onSelect?: (id: string) => void;
  viewport: Viewport;
  onRequestAssetSlot?: (ctx: AssetSlotModalOpenContext) => void;
}) {
  return (
    <section
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(section.id);
      }}
      className={cn(
        "relative cursor-pointer outline-offset-[-2px] transition",
        selected
          ? "outline outline-2 outline-builder-accent"
          : "hover:outline hover:outline-1 hover:outline-builder-accent/50"
      )}
    >
      <Section
        section={section}
        viewport={viewport}
        onRequestAssetSlot={onRequestAssetSlot}
      />
    </section>
  );
}
