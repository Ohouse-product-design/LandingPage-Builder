"use client";

/**
 * Slots 탭 (v2 — Card 통합 후).
 *
 * 변경:
 * - 선택된 섹션이 Card 컨테이너를 갖는 경우(usp/coverage/review/process/cross-sell),
 *   Card 의 layout 토글 + cells 트리 + 각 cell 의 slot 편집 진입을 통합 노출한다.
 * - 그 외 섹션(table/cta-form/review.tabs)은 기존처럼 컴포넌트 인스턴스 목록을 보여준다.
 */

import { cn } from "@/lib/cn";
import { COMPONENT_PRESETS } from "@/schema/component-presets";
import { SECTION_PRESETS } from "@/schema/section-presets";
import {
  CARD_USAGE_PRESETS,
  type CardCell,
  type CardLayout,
  type CardProps,
  type CardUsagePresetId,
} from "@/schema/card";
import {
  selectSelectedComponent,
  selectSelectedSection,
  useBuilderStore,
} from "@/store/builder-store";

export default function SlotsTab() {
  const section = useBuilderStore(selectSelectedSection);
  const selectComponent = useBuilderStore((s) => s.selectComponent);
  const removeComponent = useBuilderStore((s) => s.removeComponent);
  const updateCardLayout = useBuilderStore((s) => s.updateCardLayout);
  const updateCardUsage = useBuilderStore((s) => s.updateCardUsage);
  const addCardCell = useBuilderStore((s) => s.addCardCell);
  const removeCardCell = useBuilderStore((s) => s.removeCardCell);
  const setSelectedCell = useBuilderStore((s) => s.setSelectedCell);
  const selectedCellId = useBuilderStore((s) => s.selection.cellId);
  const selectedComponent = useBuilderStore(selectSelectedComponent);

  if (!section) return null;

  const preset = SECTION_PRESETS[section.preset];

  // -------- Card 사용 섹션 --------
  const contentSlot = preset.slots.find(
    (sl) => sl.name === "content" && sl.allows.includes("card")
  );
  if (contentSlot) {
    const cardInstance = (section.slots["content"] ?? [])[0];
    const cardProps = cardInstance && cardInstance.preset === "card"
      ? (cardInstance.props as unknown as CardProps)
      : null;
    if (!cardInstance || !cardProps) {
      return (
        <div className="rounded-ods-8 border border-dashed border-builder-border p-3 text-center text-[11px] text-builder-muted">
          카드 컨테이너가 없습니다
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div>
          <div className="mb-1 text-[11px] uppercase tracking-wider text-builder-muted">
            Layout
          </div>
          <div className="flex gap-1">
            {(["grid", "carousel", "row"] as CardLayout[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => updateCardLayout(section.id, cardInstance.id, l)}
                className={cn(
                  "flex-1 rounded-ods-4 border px-2 py-1.5 text-[11px]",
                  cardProps.layout.type === l
                    ? "border-builder-accent bg-builder-accent/10 text-builder-text"
                    : "border-builder-border text-builder-muted hover:text-builder-text"
                )}
              >
                {l}
              </button>
            ))}
          </div>
          <p className="mt-1 text-[10px] text-builder-muted">
            {cardProps.layout.type === "grid" && "n:n 분할 — Props 탭에서 컬럼 수 조정"}
            {cardProps.layout.type === "carousel" && "고정 너비 + 좌우 스크롤 (autoScroll 토글)"}
            {cardProps.layout.type === "row" && "한 줄 정렬"}
          </p>
        </div>

        <div>
          <div className="mb-1 text-[11px] uppercase tracking-wider text-builder-muted">
            Cell Usage
          </div>
          <select
            value={cardProps.usage}
            onChange={(e) =>
              updateCardUsage(
                section.id,
                cardInstance.id,
                e.target.value as CardUsagePresetId
              )
            }
            className="mb-3 w-full rounded-ods-4 border border-builder-border bg-builder-bg px-2 py-1.5 text-[11px] text-builder-text outline-none focus:border-builder-accent"
          >
            {Object.values(CARD_USAGE_PRESETS).map((p) => (
              <option key={p.id} value={p.id}>
                {p.label} — {p.description}
              </option>
            ))}
          </select>

          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-builder-muted">
              Cells ({cardProps.cells.length})
            </span>
          </div>
          <div className="space-y-1.5">
            {cardProps.cells.map((cell, idx) => {
              const isSelected = selectedCellId === cell.id;
              const titleSlot = cell.slots.title;
              const previewLabel =
                titleSlot?.kind === "text" && titleSlot.text
                  ? titleSlot.text.split("\n")[0]
                  : `Cell #${idx + 1}`;
              const filledCount = Object.values(cell.slots).filter(Boolean).length;
              return (
                <div
                  key={cell.id}
                  onClick={() => {
                    selectComponent(section.id, cardInstance.id);
                    setSelectedCell(cell.id);
                  }}
                  className={cn(
                    "group flex cursor-pointer items-center gap-2 rounded-ods-8 border px-2 py-1.5",
                    isSelected
                      ? "border-builder-accent bg-builder-accent/10"
                      : "border-builder-border bg-builder-bg hover:border-builder-accent/60"
                  )}
                >
                  <span className="text-[10px] text-builder-muted">#{idx + 1}</span>
                  <span className="flex-1 truncate text-[12px] text-builder-text">
                    {previewLabel}
                  </span>
                  <span className="text-[10px] text-builder-muted">
                    {filledCount} slots
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeCardCell(section.id, cardInstance.id, cell.id);
                    }}
                    className="hidden text-[10px] text-builder-muted hover:text-builder-danger group-hover:inline"
                  >
                    ×
                  </button>
                </div>
              );
            })}
            <button
              type="button"
              onClick={() => addCardCell(section.id, cardInstance.id)}
              className="w-full rounded-ods-8 border border-dashed border-builder-border py-1.5 text-[11px] text-builder-muted hover:border-builder-accent hover:text-builder-text"
            >
              + Cell 추가 ({cardProps.usage})
            </button>
          </div>
        </div>

        {selectedComponent?.id === cardInstance.id && selectedCellId && (
          <CellSlotEditor
            cellId={selectedCellId}
            cells={cardProps.cells}
            sectionId={section.id}
            componentId={cardInstance.id}
            usage={cardProps.usage}
          />
        )}
      </div>
    );
  }

  // -------- 그 외 (table/form/tab) --------
  if (preset.slots.length === 0) {
    return (
      <p className="text-[12px] text-builder-muted">
        이 섹션은 슬롯이 없습니다.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {preset.slots.map((slotSpec) => {
        const list = section.slots[slotSpec.name] ?? [];
        return (
          <div key={slotSpec.name}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[12px] font-medium text-builder-text">
                {slotSpec.label}
              </span>
              <span
                className={cn(
                  "text-[11px]",
                  list.length < slotSpec.min || list.length > slotSpec.max
                    ? "text-builder-danger"
                    : "text-builder-muted"
                )}
              >
                {list.length}/{slotSpec.min}–{slotSpec.max}
              </span>
            </div>
            <div className="space-y-1.5">
              {list.map((c, idx) => {
                const cPreset = COMPONENT_PRESETS[c.preset];
                return (
                  <div
                    key={c.id}
                    onClick={() => selectComponent(section.id, c.id)}
                    className="group flex cursor-pointer items-center gap-2 rounded-ods-8 border border-builder-border bg-builder-bg px-2 py-1.5 hover:border-builder-accent/60"
                  >
                    <span className="text-[10px] text-builder-muted">
                      #{idx + 1}
                    </span>
                    <span className="flex-1 truncate text-[12px] text-builder-text">
                      {String(
                        c.props["label"] ??
                          c.props["title"] ??
                          cPreset.label
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeComponent(section.id, c.id);
                      }}
                      className="hidden text-[10px] text-builder-muted hover:text-builder-danger group-hover:inline"
                    >
                      삭제
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 선택된 cell 의 slot 편집기
// ---------------------------------------------------------------------------

function CellSlotEditor({
  cellId,
  cells,
  sectionId,
  componentId,
  usage,
}: {
  cellId: string;
  cells: CardCell[];
  sectionId: string;
  componentId: string;
  usage: CardProps["usage"];
}) {
  const cell = cells.find((c) => c.id === cellId);
  const updateCellSlot = useBuilderStore((s) => s.updateCardCellSlot);
  if (!cell) return null;

  // usage 별 활성 슬롯 — card.ts CARD_USAGE_PRESETS 에서 가져오지만 여기서는 간단히 cell.slots 키 사용
  const activeKeys = Object.keys(cell.slots);
  void usage;

  return (
    <div>
      <div className="mb-1 text-[11px] uppercase tracking-wider text-builder-muted">
        Cell Slots — #{cell.id.slice(-3)}
      </div>
      <div className="space-y-2">
        {activeKeys.map((k) => {
          const content = cell.slots[k as keyof typeof cell.slots];
          if (!content) return null;
          return (
            <div key={k} className="rounded-ods-8 border border-builder-border bg-builder-bg p-2">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[11px] font-medium text-builder-text">{k}</span>
                <span className="text-[10px] text-builder-muted">{content.kind}</span>
              </div>
              {content.kind === "text" && (
                <textarea
                  rows={2}
                  value={content.text}
                  onChange={(e) =>
                    updateCellSlot(sectionId, componentId, cellId, k as keyof typeof cell.slots, {
                      kind: "text",
                      text: e.target.value,
                    })
                  }
                  className="w-full resize-none rounded-ods-4 border border-builder-border bg-builder-bg px-2 py-1 text-[11px] text-builder-text outline-none focus:border-builder-accent"
                />
              )}
              {content.kind === "meta" && (
                <input
                  type="text"
                  value={content.items.join(" / ")}
                  onChange={(e) =>
                    updateCellSlot(sectionId, componentId, cellId, k as keyof typeof cell.slots, {
                      kind: "meta",
                      items: e.target.value.split("/").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="/ 로 구분"
                  className="w-full rounded-ods-4 border border-builder-border bg-builder-bg px-2 py-1 text-[11px] outline-none focus:border-builder-accent"
                />
              )}
              {content.kind === "rating" && (
                <input
                  type="number"
                  min={0}
                  max={content.max ?? 5}
                  value={content.value}
                  onChange={(e) =>
                    updateCellSlot(sectionId, componentId, cellId, k as keyof typeof cell.slots, {
                      kind: "rating",
                      value: Number(e.target.value),
                      max: content.max,
                    })
                  }
                  className="w-20 rounded-ods-4 border border-builder-border bg-builder-bg px-2 py-1 text-[11px] outline-none focus:border-builder-accent"
                />
              )}
              {content.kind === "asset" && (
                <div className="text-[11px] text-builder-muted">
                  Asset: {content.asset.assetId ?? content.asset.url ?? "—"} ({content.asset.alt})
                </div>
              )}
              {content.kind === "cta" && (
                <div className="space-y-1">
                  <input
                    type="text"
                    value={content.label}
                    onChange={(e) =>
                      updateCellSlot(sectionId, componentId, cellId, k as keyof typeof cell.slots, {
                        kind: "cta",
                        label: e.target.value,
                        url: content.url,
                      })
                    }
                    placeholder="라벨"
                    className="w-full rounded-ods-4 border border-builder-border bg-builder-bg px-2 py-1 text-[11px] outline-none focus:border-builder-accent"
                  />
                  <input
                    type="text"
                    value={content.url}
                    onChange={(e) =>
                      updateCellSlot(sectionId, componentId, cellId, k as keyof typeof cell.slots, {
                        kind: "cta",
                        label: content.label,
                        url: e.target.value,
                      })
                    }
                    placeholder="URL"
                    className="w-full rounded-ods-4 border border-builder-border bg-builder-bg px-2 py-1 text-[11px] outline-none focus:border-builder-accent"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
