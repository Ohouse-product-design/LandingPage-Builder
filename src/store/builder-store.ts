"use client";

/**
 * 빌더 전역 상태 (v2 — Card 통합 후).
 *
 * 추가/변경:
 * - selection.cellId 추가 (Card 인스턴스 내 선택된 cell)
 * - updateCardLayout / updateCardLayoutSettings — layout 토글 + 세부 옵션
 * - addCardCell / removeCardCell — Card 의 cells 배열 조작
 * - updateCardCellSlot — cell 의 slot 내용 변경
 */

import { create } from "zustand";

import { seedDoc } from "@/lib/seed";
import {
  CARD_USAGE_PRESETS,
  defaultLayoutSettings,
  type CardCell,
  type CardLayout,
  type CardLayoutSettings,
  type CardProps,
  type CardSlotContent,
  type CardSlotName,
  type CardUsagePresetId,
} from "@/schema/card";
import type {
  AssetRef,
  ComponentInstance,
  LandingPageDoc,
  Section,
  TokenBinding,
  Viewport,
} from "@/schema/doc";
import {
  SECTION_PRESETS,
  type SectionPresetId,
} from "@/schema/section-presets";

export type InspectorTab = "props" | "slots" | "assets" | "tokens";

export interface Selection {
  sectionId: string | null;
  /** 컴포넌트 인스턴스 ID */
  componentId: string | null;
  /** Card 인스턴스 안의 선택된 cell ID (Card 가 선택된 경우에만) */
  cellId: string | null;
}

export interface BuilderState {
  doc: LandingPageDoc;
  selection: Selection;
  viewport: Viewport;
  inspectorTab: InspectorTab;
  reviewModalOpen: boolean;
  assetModal:
    | null
    | {
        sectionId: string;
        componentId: string | null;
        slotName: string;
      };

  // -------- Selection --------
  selectSection: (sectionId: string | null) => void;
  selectComponent: (sectionId: string, componentId: string) => void;
  setSelectedCell: (cellId: string | null) => void;
  setInspectorTab: (tab: InspectorTab) => void;

  // -------- Viewport --------
  setViewport: (v: Viewport) => void;

  // -------- Section ops --------
  reorderSections: (fromId: string, toId: string) => void;
  addSection: (preset: SectionPresetId) => void;
  removeSection: (sectionId: string) => void;
  updateSectionProp: (sectionId: string, key: string, value: unknown) => void;
  bindSectionToken: (sectionId: string, binding: TokenBinding) => void;
  unbindSectionToken: (sectionId: string, propPath: string) => void;
  toggleSectionVisibility: (sectionId: string, viewport: Viewport) => void;

  // -------- Component ops (generic) --------
  updateComponentProp: (
    sectionId: string,
    componentId: string,
    key: string,
    value: unknown
  ) => void;
  reorderComponents: (
    sectionId: string,
    slotName: string,
    fromId: string,
    toId: string
  ) => void;
  removeComponent: (sectionId: string, componentId: string) => void;

  // -------- Card ops --------
  updateCardLayout: (
    sectionId: string,
    componentId: string,
    layout: CardLayout
  ) => void;
  updateCardLayoutSettings: (
    sectionId: string,
    componentId: string,
    layoutSettings: CardLayoutSettings
  ) => void;
  updateCardUsage: (
    sectionId: string,
    componentId: string,
    usage: CardUsagePresetId
  ) => void;
  addCardCell: (sectionId: string, componentId: string) => void;
  removeCardCell: (
    sectionId: string,
    componentId: string,
    cellId: string
  ) => void;
  updateCardCellSlot: (
    sectionId: string,
    componentId: string,
    cellId: string,
    slotName: CardSlotName,
    content: CardSlotContent
  ) => void;

  // -------- Asset ops --------
  openAssetModal: (ctx: {
    sectionId: string;
    componentId: string | null;
    slotName: string;
  }) => void;
  closeAssetModal: () => void;
  embedAsset: (
    sectionId: string,
    componentId: string | null,
    slotName: string,
    asset: AssetRef
  ) => void;

  // -------- Review --------
  openReviewModal: () => void;
  closeReviewModal: () => void;
}

// ---------------------------------------------------------------------------
// 헬퍼
// ---------------------------------------------------------------------------

function isMovableIndex(sections: Section[], index: number): boolean {
  return index >= 0 && index < sections.length && !sections[index]!.locked;
}

function findSectionIndex(doc: LandingPageDoc, id: string): number {
  return doc.sections.findIndex((s) => s.id === id);
}

function nowIso() {
  return new Date().toISOString();
}

function bumpAudit(doc: LandingPageDoc): LandingPageDoc {
  return { ...doc, audit: { ...doc.audit, updatedAt: nowIso() } };
}

function asCardProps(instance: ComponentInstance | undefined): CardProps | null {
  if (!instance || instance.preset !== "card") return null;
  return instance.props as unknown as CardProps;
}

function setCardProps(
  instance: ComponentInstance,
  props: CardProps
): ComponentInstance {
  return { ...instance, props: props as unknown as Record<string, unknown> };
}

/** 모든 슬롯에서 Card 인스턴스를 찾아 매핑 함수로 교체 */
function mapCardInstance(
  section: Section,
  componentId: string,
  fn: (c: ComponentInstance, p: CardProps) => ComponentInstance
): Section {
  const slots: Record<string, ComponentInstance[]> = {};
  for (const [k, list] of Object.entries(section.slots)) {
    slots[k] = list.map((c) => {
      if (c.id !== componentId) return c;
      const p = asCardProps(c);
      if (!p) return c;
      return fn(c, p);
    });
  }
  return { ...section, slots };
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useBuilderStore = create<BuilderState>((set) => ({
  doc: seedDoc,
  selection: {
    sectionId: seedDoc.sections.find((s) => !s.locked)?.id ?? null,
    componentId: null,
    cellId: null,
  },
  viewport: "desktop",
  inspectorTab: "props",
  reviewModalOpen: false,
  assetModal: null,

  selectSection: (sectionId) =>
    set({
      selection: { sectionId, componentId: null, cellId: null },
      inspectorTab: "props",
    }),

  selectComponent: (sectionId, componentId) =>
    set({
      selection: { sectionId, componentId, cellId: null },
      inspectorTab: "props",
    }),

  setSelectedCell: (cellId) =>
    set((s) => ({ selection: { ...s.selection, cellId } })),

  setInspectorTab: (tab) => set({ inspectorTab: tab }),

  setViewport: (v) => set({ viewport: v }),

  // ----- Section -----
  reorderSections: (fromId, toId) =>
    set((state) => {
      const fromIdx = findSectionIndex(state.doc, fromId);
      const toIdx = findSectionIndex(state.doc, toId);
      if (fromIdx < 0 || toIdx < 0) return state;
      if (!isMovableIndex(state.doc.sections, fromIdx)) return state;
      if (!isMovableIndex(state.doc.sections, toIdx)) return state;
      const next = state.doc.sections.slice();
      const [moved] = next.splice(fromIdx, 1);
      if (!moved) return state;
      next.splice(toIdx, 0, moved);
      return { doc: bumpAudit({ ...state.doc, sections: next }) };
    }),

  addSection: (preset) =>
    set((state) => {
      const def = SECTION_PRESETS[preset];
      const newSection: Section = {
        id: `sec-${preset}-${Math.random().toString(36).slice(2, 8)}`,
        preset,
        name: def.label,
        locked: def.defaultLocked,
        props: {},
        slots: {},
        assets: [],
        visibility: { mobile: true, tablet: true, desktop: true },
      };
      const stickyIdx = state.doc.sections.findIndex(
        (s) => s.preset === "sticky-cta"
      );
      const next = state.doc.sections.slice();
      if (def.defaultLocked) next.push(newSection);
      else if (stickyIdx >= 0) next.splice(stickyIdx, 0, newSection);
      else next.push(newSection);
      return { doc: bumpAudit({ ...state.doc, sections: next }) };
    }),

  removeSection: (sectionId) =>
    set((state) => {
      const sec = state.doc.sections.find((s) => s.id === sectionId);
      if (!sec || sec.locked) return state;
      const next = state.doc.sections.filter((s) => s.id !== sectionId);
      return {
        doc: bumpAudit({ ...state.doc, sections: next }),
        selection:
          state.selection.sectionId === sectionId
            ? { sectionId: null, componentId: null, cellId: null }
            : state.selection,
      };
    }),

  updateSectionProp: (sectionId, key, value) =>
    set((state) => ({
      doc: bumpAudit({
        ...state.doc,
        sections: state.doc.sections.map((s) =>
          s.id === sectionId ? { ...s, props: { ...s.props, [key]: value } } : s
        ),
      }),
    })),

  bindSectionToken: (sectionId, binding) =>
    set((state) => ({
      doc: bumpAudit({
        ...state.doc,
        sections: state.doc.sections.map((s) => {
          if (s.id !== sectionId) return s;
          const existing = s.tokens ?? [];
          const replaced = [
            ...existing.filter((t) => t.propPath !== binding.propPath),
            binding,
          ];
          return { ...s, tokens: replaced };
        }),
      }),
    })),

  unbindSectionToken: (sectionId, propPath) =>
    set((state) => ({
      doc: bumpAudit({
        ...state.doc,
        sections: state.doc.sections.map((s) => {
          if (s.id !== sectionId) return s;
          return {
            ...s,
            tokens: (s.tokens ?? []).filter((t) => t.propPath !== propPath),
          };
        }),
      }),
    })),

  toggleSectionVisibility: (sectionId, viewport) =>
    set((state) => ({
      doc: bumpAudit({
        ...state.doc,
        sections: state.doc.sections.map((s) =>
          s.id === sectionId
            ? {
                ...s,
                visibility: {
                  ...s.visibility,
                  [viewport]: !s.visibility[viewport],
                },
              }
            : s
        ),
      }),
    })),

  // ----- Component (generic) -----
  updateComponentProp: (sectionId, componentId, key, value) =>
    set((state) => ({
      doc: bumpAudit({
        ...state.doc,
        sections: state.doc.sections.map((s) => {
          if (s.id !== sectionId) return s;
          const slots = { ...s.slots };
          for (const slotName of Object.keys(slots)) {
            slots[slotName] = (slots[slotName] ?? []).map((c) =>
              c.id === componentId
                ? { ...c, props: { ...c.props, [key]: value } }
                : c
            );
          }
          return { ...s, slots };
        }),
      }),
    })),

  reorderComponents: (sectionId, slotName, fromId, toId) =>
    set((state) => ({
      doc: bumpAudit({
        ...state.doc,
        sections: state.doc.sections.map((s) => {
          if (s.id !== sectionId) return s;
          const list = (s.slots[slotName] ?? []).slice();
          const fromIdx = list.findIndex((c) => c.id === fromId);
          const toIdx = list.findIndex((c) => c.id === toId);
          if (fromIdx < 0 || toIdx < 0) return s;
          const [moved] = list.splice(fromIdx, 1);
          if (!moved) return s;
          list.splice(toIdx, 0, moved);
          return { ...s, slots: { ...s.slots, [slotName]: list } };
        }),
      }),
    })),

  removeComponent: (sectionId, componentId) =>
    set((state) => ({
      doc: bumpAudit({
        ...state.doc,
        sections: state.doc.sections.map((s) => {
          if (s.id !== sectionId) return s;
          const slots: Record<string, ComponentInstance[]> = {};
          for (const [k, v] of Object.entries(s.slots)) {
            slots[k] = v.filter((c) => c.id !== componentId);
          }
          return { ...s, slots };
        }),
      }),
    })),

  // ----- Card -----
  updateCardLayout: (sectionId, componentId, layout) =>
    set((state) => ({
      doc: bumpAudit({
        ...state.doc,
        sections: state.doc.sections.map((s) => {
          if (s.id !== sectionId) return s;
          return mapCardInstance(s, componentId, (inst, props) => {
            const next: CardProps = {
              ...props,
              layout: defaultLayoutSettings(layout),
            };
            return setCardProps(inst, next);
          });
        }),
      }),
    })),

  updateCardLayoutSettings: (sectionId, componentId, layoutSettings) =>
    set((state) => ({
      doc: bumpAudit({
        ...state.doc,
        sections: state.doc.sections.map((s) => {
          if (s.id !== sectionId) return s;
          return mapCardInstance(s, componentId, (inst, props) => {
            // 같은 타입일 때만 교체 — 타입이 다르면 updateCardLayout 으로 가야 함
            if (layoutSettings.type !== props.layout.type) return inst;
            return setCardProps(inst, { ...props, layout: layoutSettings });
          });
        }),
      }),
    })),

  updateCardUsage: (sectionId, componentId, usage) =>
    set((state) => ({
      doc: bumpAudit({
        ...state.doc,
        sections: state.doc.sections.map((s) => {
          if (s.id !== sectionId) return s;
          return mapCardInstance(s, componentId, (inst, props) => {
            if (props.usage === usage) return inst;
            // cells 의 slot 데이터는 그대로 유지 — Card 가 usage 별 CellRenderer 로
            // 분기하므로 새 usage 에서 쓰지 않는 슬롯은 자연스럽게 무시된다.
            return setCardProps(inst, { ...props, usage });
          });
        }),
      }),
    })),

  addCardCell: (sectionId, componentId) =>
    set((state) => ({
      doc: bumpAudit({
        ...state.doc,
        sections: state.doc.sections.map((s) => {
          if (s.id !== sectionId) return s;
          return mapCardInstance(s, componentId, (inst, props) => {
            const usagePreset = CARD_USAGE_PRESETS[props.usage];
            const newCell: CardCell = {
              id: `cell-${Math.random().toString(36).slice(2, 8)}`,
              slots: usagePreset.defaultCell(),
            };
            return setCardProps(inst, {
              ...props,
              cells: [...props.cells, newCell],
            });
          });
        }),
      }),
    })),

  removeCardCell: (sectionId, componentId, cellId) =>
    set((state) => ({
      doc: bumpAudit({
        ...state.doc,
        sections: state.doc.sections.map((s) => {
          if (s.id !== sectionId) return s;
          return mapCardInstance(s, componentId, (inst, props) => {
            return setCardProps(inst, {
              ...props,
              cells: props.cells.filter((c) => c.id !== cellId),
            });
          });
        }),
      }),
    })),

  updateCardCellSlot: (sectionId, componentId, cellId, slotName, content) =>
    set((state) => ({
      doc: bumpAudit({
        ...state.doc,
        sections: state.doc.sections.map((s) => {
          if (s.id !== sectionId) return s;
          return mapCardInstance(s, componentId, (inst, props) => {
            return setCardProps(inst, {
              ...props,
              cells: props.cells.map((c) =>
                c.id === cellId
                  ? { ...c, slots: { ...c.slots, [slotName]: content } }
                  : c
              ),
            });
          });
        }),
      }),
    })),

  // ----- Asset -----
  openAssetModal: (ctx) => set({ assetModal: ctx }),
  closeAssetModal: () => set({ assetModal: null }),

  embedAsset: (sectionId, componentId, slotName, asset) =>
    set((state) => ({
      assetModal: null,
      doc: bumpAudit({
        ...state.doc,
        sections: state.doc.sections.map((s) => {
          if (s.id !== sectionId) return s;
          if (componentId === null) {
            const existing = s.assets.filter((a) => a.slotName !== slotName);
            return { ...s, assets: [...existing, { slotName, asset }] };
          }
          const slots: Record<string, ComponentInstance[]> = {};
          for (const [k, list] of Object.entries(s.slots)) {
            slots[k] = list.map((c) => {
              if (c.id !== componentId) return c;
              const existing = c.assets.filter((a) => a.slotName !== slotName);
              return { ...c, assets: [...existing, { slotName, asset }] };
            });
          }
          return { ...s, slots };
        }),
      }),
    })),

  // ----- Review -----
  openReviewModal: () => set({ reviewModalOpen: true }),
  closeReviewModal: () => set({ reviewModalOpen: false }),
}));

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

export function selectSelectedSection(state: BuilderState): Section | null {
  if (!state.selection.sectionId) return null;
  return (
    state.doc.sections.find((s) => s.id === state.selection.sectionId) ?? null
  );
}

export function selectSelectedComponent(
  state: BuilderState
): ComponentInstance | null {
  const sec = selectSelectedSection(state);
  if (!sec || !state.selection.componentId) return null;
  for (const list of Object.values(sec.slots)) {
    const hit = list.find((c) => c.id === state.selection.componentId);
    if (hit) return hit;
  }
  return null;
}
