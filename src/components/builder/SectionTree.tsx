"use client";

import { useState } from "react";

import { cn } from "@/lib/cn";
import { IconChevronRight } from "@/lib/ods-icons";
import { SECTION_PRESETS } from "@/schema/section-presets";
import { useBuilderStore } from "@/store/builder-store";
import {
  SECTION_ADD_BASIC_PRESET_IDS,
  SECTION_ADD_MARKETING_ENTRIES,
  sectionAddMenuLabel,
} from "./section-add-menu";

/**
 * 좌측 섹션 트리.
 * - 잠긴 섹션(Hero/Header/Footer/StickyCta) 은 드래그 핸들 숨김.
 * - 드래그앤드롭 — HTML5 native drag events 로 구현. 1차 골격이므로 단순화.
 * - "+ 섹션 추가" 메뉴 — 옵션 목록은 `section-add-menu.ts` 와 공유.
 */
export default function SectionTree() {
  const sections = useBuilderStore((s) => s.doc.sections);
  const selection = useBuilderStore((s) => s.selection);
  const selectSection = useBuilderStore((s) => s.selectSection);
  const reorderSections = useBuilderStore((s) => s.reorderSections);
  const removeSection = useBuilderStore((s) => s.removeSection);
  const addSection = useBuilderStore((s) => s.addSection);

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [addMenuOpen, setAddMenuOpen] = useState(false);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-12 items-center justify-between border-b border-builder-border px-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-builder-muted">
          섹션
        </span>
        <span className="text-[11px] text-builder-muted">
          {sections.length}개
        </span>
      </div>

      <div className="builder-scroll flex-1 overflow-y-auto py-2">
        {sections.map((section) => {
          const preset = SECTION_PRESETS[section.preset];
          const isSelected = selection.sectionId === section.id;
          const isDraggedOver = hoverId === section.id && draggedId !== section.id;

          return (
            <div
              key={section.id}
              draggable={!section.locked}
              onDragStart={() => setDraggedId(section.id)}
              onDragEnd={() => {
                setDraggedId(null);
                setHoverId(null);
              }}
              onDragOver={(e) => {
                if (section.locked || !draggedId || draggedId === section.id)
                  return;
                e.preventDefault();
                setHoverId(section.id);
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (draggedId && !section.locked) {
                  reorderSections(draggedId, section.id);
                }
                setDraggedId(null);
                setHoverId(null);
              }}
              onClick={() => selectSection(section.id)}
              className={cn(
                "group mx-2 mb-1 flex cursor-pointer items-center gap-2 rounded-ods-8 border px-2 py-2 transition",
                isSelected
                  ? "border-builder-accent bg-builder-accent/10"
                  : "border-transparent hover:border-builder-border hover:bg-builder-panel-2",
                isDraggedOver && "border-builder-accent-2",
                section.locked && "opacity-90"
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-3 items-center justify-center text-builder-muted",
                  section.locked ? "cursor-not-allowed" : "cursor-grab"
                )}
                aria-hidden
              >
                {section.locked ? "🔒" : "≡"}
              </span>
              <div className="min-w-0 flex-1 truncate text-[13px] font-medium">
                {preset.label}
              </div>
              {!section.locked && (
                <button
                  type="button"
                  className="hidden h-5 w-5 items-center justify-center rounded text-builder-muted hover:bg-builder-danger/20 hover:text-builder-danger group-hover:flex"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`"${section.name}" 섹션을 삭제할까요?`)) {
                      removeSection(section.id);
                    }
                  }}
                  aria-label="섹션 삭제"
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="relative shrink-0 border-t border-builder-border p-3">
        <button
          type="button"
          onClick={() => setAddMenuOpen((v) => !v)}
          className="flex w-full items-center justify-center gap-1 rounded-ods-8 border border-dashed border-builder-border py-2 text-xs text-builder-muted hover:border-builder-accent hover:text-builder-text"
        >
          + 섹션 추가
        </button>
        {addMenuOpen && (
          <div className="absolute bottom-14 left-3 right-3 z-10 max-h-[60vh] overflow-y-auto rounded-ods-8 border border-builder-border bg-builder-panel-2 p-1 shadow-xl">
            <p className="px-2 pt-1 pb-0.5 text-[10px] uppercase tracking-wider text-builder-muted">
              기본
            </p>
            {SECTION_ADD_BASIC_PRESET_IDS.map((p) => {
              const def = SECTION_PRESETS[p];
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    addSection(p);
                    setAddMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-builder-panel"
                >
                  <IconChevronRight size={12} className="shrink-0 text-builder-muted" />
                  <span className="block text-[12px]">{def.label}</span>
                </button>
              );
            })}
            <p className="mt-1 px-2 pt-1 pb-0.5 text-[10px] uppercase tracking-wider text-builder-muted">
              마케팅 풀페이지 UI
            </p>
            {SECTION_ADD_MARKETING_ENTRIES.map((entry) => (
              <button
                key={`${entry.preset}-${entry.variant}`}
                type="button"
                onClick={() => {
                  addSection(entry.preset, entry.variant);
                  setAddMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-builder-panel"
              >
                <IconChevronRight size={12} className="shrink-0 text-builder-muted" />
                <span className="block text-[12px]">
                  {sectionAddMenuLabel(entry.preset, entry.variant)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
