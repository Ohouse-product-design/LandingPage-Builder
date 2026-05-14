"use client";

import { cn } from "@/lib/cn";
import { COMPONENT_PRESETS } from "@/schema/component-presets";
import { SECTION_PRESETS } from "@/schema/section-presets";
import type { CardProps, CardLayout } from "@/schema/card";
import type { FieldSpec } from "@/schema/ui-spec";
import { countChars, countLines, validateField } from "@/lib/validate";
import {
  selectSelectedComponent,
  selectSelectedSection,
  useBuilderStore,
} from "@/store/builder-store";

/**
 * Props 탭.
 * - 섹션 선택 → 섹션 props (sectionTitle 등) 편집
 * - Card 컴포넌트 선택 → usage + layout 세부 옵션 편집
 * - 그 외 컴포넌트 선택 → 컴포넌트 props 편집
 */
export default function PropsTab() {
  const section = useBuilderStore(selectSelectedSection);
  const component = useBuilderStore(selectSelectedComponent);
  const updateSectionProp = useBuilderStore((s) => s.updateSectionProp);
  const updateComponentProp = useBuilderStore((s) => s.updateComponentProp);
  const updateCardLayoutSettings = useBuilderStore(
    (s) => s.updateCardLayoutSettings
  );

  if (!section) return null;

  // ---------- Card 컴포넌트가 선택된 경우 ----------
  if (component?.preset === "card") {
    const props = component.props as unknown as CardProps;
    return (
      <div className="space-y-4">
        <div className="text-[11px] uppercase tracking-wider text-builder-muted">
          Card · {props.layout.type}
        </div>
        {props.layout.type === "grid" && (
          <GridSettingsEditor
            sectionId={section.id}
            componentId={component.id}
            settings={props.layout.settings}
            onChange={(s) =>
              updateCardLayoutSettings(section.id, component.id, {
                type: "grid",
                settings: s,
              })
            }
          />
        )}
        {props.layout.type === "carousel" && (
          <CarouselSettingsEditor
            sectionId={section.id}
            componentId={component.id}
            settings={props.layout.settings}
            onChange={(s) =>
              updateCardLayoutSettings(section.id, component.id, {
                type: "carousel",
                settings: s,
              })
            }
          />
        )}
        {props.layout.type === "row" && (
          <RowSettingsEditor
            sectionId={section.id}
            componentId={component.id}
            settings={props.layout.settings}
            onChange={(s) =>
              updateCardLayoutSettings(section.id, component.id, {
                type: "row",
                settings: s,
              })
            }
          />
        )}
      </div>
    );
  }

  // ---------- 일반 props 편집 ----------
  const target = component ?? section;
  const spec = component
    ? COMPONENT_PRESETS[component.preset].uiSpec
    : SECTION_PRESETS[section.preset].uiSpec;
  const keys = Object.keys(spec);
  if (keys.length === 0) {
    return (
      <p className="text-[12px] text-builder-muted">
        이 프리셋은 props 가 정의되어 있지 않습니다.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      <div className="text-[11px] uppercase tracking-wider text-builder-muted">
        {component
          ? COMPONENT_PRESETS[component.preset].label
          : SECTION_PRESETS[section.preset].label}{" "}
        Props
      </div>
      {keys.map((key) => (
        <PropField
          key={key}
          field={key}
          spec={spec[key] ?? {}}
          value={target.props[key]}
          onChange={(v) => {
            if (component) {
              updateComponentProp(section.id, component.id, key, v);
            } else {
              updateSectionProp(section.id, key, v);
            }
          }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Grid / Carousel / Row 세부 옵션 에디터
// ---------------------------------------------------------------------------

function NumberField({
  label,
  value,
  onChange,
  min = 1,
  max = 12,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <label className="flex items-center justify-between gap-2">
      <span className="text-[11px] text-builder-muted">{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-20 rounded-ods-4 border border-builder-border bg-builder-bg px-2 py-1 text-[11px] text-builder-text outline-none focus:border-builder-accent"
      />
    </label>
  );
}

function GridSettingsEditor({
  settings,
  onChange,
}: {
  sectionId: string;
  componentId: string;
  settings: Extract<CardProps["layout"], { type: "grid" }>["settings"];
  onChange: (s: Extract<CardProps["layout"], { type: "grid" }>["settings"]) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="text-[11px] uppercase tracking-wider text-builder-muted">
        Grid 컬럼
      </div>
      <NumberField
        label="Mobile"
        value={settings.columns.mobile}
        onChange={(v) =>
          onChange({ ...settings, columns: { ...settings.columns, mobile: v } })
        }
      />
      <NumberField
        label="Tablet"
        value={settings.columns.tablet}
        onChange={(v) =>
          onChange({ ...settings, columns: { ...settings.columns, tablet: v } })
        }
      />
      <NumberField
        label="Desktop"
        value={settings.columns.desktop}
        onChange={(v) =>
          onChange({ ...settings, columns: { ...settings.columns, desktop: v } })
        }
      />
      <NumberField
        label="Gap (px)"
        value={settings.gap}
        onChange={(v) => onChange({ ...settings, gap: v })}
        min={0}
        max={64}
      />
    </div>
  );
}

function CarouselSettingsEditor({
  settings,
  onChange,
}: {
  sectionId: string;
  componentId: string;
  settings: Extract<CardProps["layout"], { type: "carousel" }>["settings"];
  onChange: (s: Extract<CardProps["layout"], { type: "carousel" }>["settings"]) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="text-[11px] uppercase tracking-wider text-builder-muted">
        Carousel 카드 너비
      </div>
      <NumberField
        label="Mobile (px)"
        value={settings.cardWidth.mobile}
        onChange={(v) =>
          onChange({ ...settings, cardWidth: { ...settings.cardWidth, mobile: v } })
        }
        min={120}
        max={800}
      />
      <NumberField
        label="Tablet (px)"
        value={settings.cardWidth.tablet}
        onChange={(v) =>
          onChange({ ...settings, cardWidth: { ...settings.cardWidth, tablet: v } })
        }
        min={120}
        max={800}
      />
      <NumberField
        label="Desktop (px)"
        value={settings.cardWidth.desktop}
        onChange={(v) =>
          onChange({ ...settings, cardWidth: { ...settings.cardWidth, desktop: v } })
        }
        min={120}
        max={800}
      />
      <NumberField
        label="Gap (px)"
        value={settings.gap}
        onChange={(v) => onChange({ ...settings, gap: v })}
        min={0}
        max={64}
      />

      <label className="flex items-center gap-2 pt-2">
        <input
          type="checkbox"
          checked={settings.autoScroll}
          onChange={(e) =>
            onChange({ ...settings, autoScroll: e.target.checked })
          }
        />
        <span className="text-[12px] text-builder-text">
          x scroll animation (autoScroll)
        </span>
      </label>
      {settings.autoScroll && (
        <NumberField
          label="Duration (ms)"
          value={settings.autoScrollDurationMs ?? 30000}
          onChange={(v) => onChange({ ...settings, autoScrollDurationMs: v })}
          min={5000}
          max={120000}
        />
      )}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={settings.loop ?? false}
          onChange={(e) => onChange({ ...settings, loop: e.target.checked })}
        />
        <span className="text-[12px] text-builder-text">Loop</span>
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={settings.showArrows ?? false}
          onChange={(e) =>
            onChange({ ...settings, showArrows: e.target.checked })
          }
        />
        <span className="text-[12px] text-builder-text">Show arrows</span>
      </label>
    </div>
  );
}

function RowSettingsEditor({
  settings,
  onChange,
}: {
  sectionId: string;
  componentId: string;
  settings: Extract<CardProps["layout"], { type: "row" }>["settings"];
  onChange: (s: Extract<CardProps["layout"], { type: "row" }>["settings"]) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-builder-muted">Align</span>
        <select
          value={settings.align}
          onChange={(e) =>
            onChange({ ...settings, align: e.target.value as typeof settings.align })
          }
          className="rounded-ods-4 border border-builder-border bg-builder-bg px-2 py-1 text-[11px]"
        >
          {["start", "center", "end", "between", "around"].map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </label>
      <NumberField
        label="Gap (px)"
        value={settings.gap}
        onChange={(v) => onChange({ ...settings, gap: v })}
        min={0}
        max={64}
      />
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={settings.wrap}
          onChange={(e) => onChange({ ...settings, wrap: e.target.checked })}
        />
        <span className="text-[12px] text-builder-text">Wrap</span>
      </label>
    </div>
  );
}

// Used to silence unused import warnings — CardLayout 는 향후 토글 UI 확장에 사용
void undefined as unknown as CardLayout;

// ---------------------------------------------------------------------------
// 일반 PropField
// ---------------------------------------------------------------------------

function PropField({
  field,
  spec,
  value,
  onChange,
}: {
  field: string;
  spec: FieldSpec;
  value: unknown;
  onChange: (v: string) => void;
}) {
  const stringValue =
    typeof value === "string" ? value : value == null ? "" : String(value);
  const error = validateField(stringValue, spec);
  const chars = countChars(stringValue);
  const lines = countLines(stringValue);
  const maxLine = spec.maxLine ?? 1;
  const isTextarea = maxLine > 1;

  return (
    <label className="block">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[12px] text-builder-text">
          {field}
          {spec.required && <span className="ml-0.5 text-builder-danger">*</span>}
        </span>
        <span
          className={cn(
            "text-[11px]",
            error ? "text-builder-danger" : "text-builder-muted"
          )}
        >
          {spec.maxChar !== undefined && `${chars}/${spec.maxChar}자`}
          {spec.maxLine !== undefined &&
            spec.maxLine > 1 &&
            ` · ${lines}/${spec.maxLine}줄`}
        </span>
      </div>
      {isTextarea ? (
        <textarea
          rows={Math.min(maxLine + 1, 6)}
          value={stringValue}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full resize-none rounded-ods-8 border bg-builder-bg px-2.5 py-1.5 text-[12px] text-builder-text outline-none focus:border-builder-accent",
            error ? "border-builder-danger" : "border-builder-border"
          )}
        />
      ) : (
        <input
          type="text"
          value={stringValue}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full rounded-ods-8 border bg-builder-bg px-2.5 py-1.5 text-[12px] text-builder-text outline-none focus:border-builder-accent",
            error ? "border-builder-danger" : "border-builder-border"
          )}
        />
      )}
      {error && (
        <div className="mt-1 text-[11px] text-builder-danger">{error}</div>
      )}
      {spec.help && (
        <div className="mt-0.5 text-[10px] text-builder-muted">{spec.help}</div>
      )}
    </label>
  );
}
