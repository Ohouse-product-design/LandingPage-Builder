"use client";

import { useState } from "react";

import { cn } from "@/lib/cn";
import { ODS_TOKENS, type OdsTokenCategory } from "@/schema/ods-tokens";
import { selectSelectedSection, useBuilderStore } from "@/store/builder-store";

const CATEGORIES: { id: OdsTokenCategory; label: string }[] = [
  { id: "color", label: "Color" },
  { id: "typography", label: "Typography" },
  { id: "radius", label: "Radius" },
  { id: "spacing", label: "Spacing" },
  { id: "gradient", label: "Gradient" },
];

/**
 * Tokens 탭.
 * - 선택된 섹션에 묶인 토큰 바인딩 목록을 보여주고, 카탈로그에서 새 토큰을 묶을 수 있다.
 * - propPath 는 자유 입력(string) — 1차 골격에서는 단순 prompt 로 받는다.
 */
export default function TokensTab() {
  const section = useBuilderStore(selectSelectedSection);
  const bindToken = useBuilderStore((s) => s.bindSectionToken);
  const unbindToken = useBuilderStore((s) => s.unbindSectionToken);
  const [category, setCategory] = useState<OdsTokenCategory>("color");

  if (!section) return null;

  const tokens = section.tokens ?? [];
  const filtered = ODS_TOKENS.filter((t) => t.category === category);

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 text-[11px] uppercase tracking-wider text-builder-muted">
          묶인 토큰
        </div>
        {tokens.length === 0 ? (
          <div className="rounded-ods-8 border border-dashed border-builder-border p-3 text-center text-[11px] text-builder-muted">
            아직 묶인 토큰이 없습니다
          </div>
        ) : (
          <div className="space-y-1.5">
            {tokens.map((b) => (
              <div
                key={b.propPath}
                className="flex items-center gap-2 rounded-ods-8 border border-builder-border bg-builder-bg px-2 py-1.5"
              >
                <span className="flex-1 truncate text-[12px] text-builder-text">
                  {b.propPath}
                </span>
                <span className="rounded bg-builder-panel-2 px-1.5 py-0.5 text-[10px] text-builder-muted">
                  {b.tokenRef}
                </span>
                <button
                  type="button"
                  onClick={() => unbindToken(section.id, b.propPath)}
                  className="text-[10px] text-builder-muted hover:text-builder-danger"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider text-builder-muted">
            토큰 카탈로그
          </span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as OdsTokenCategory)}
            className="rounded-ods-4 border border-builder-border bg-builder-bg px-2 py-1 text-[11px]"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div
          className={cn(
            "grid gap-1.5",
            category === "color" || category === "gradient"
              ? "grid-cols-3"
              : "grid-cols-1"
          )}
        >
          {filtered.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                const propPath = window.prompt(
                  `어떤 prop 에 ${t.key} 토큰을 묶을까요?\n(e.g. title.color, background)`,
                  "background"
                );
                if (!propPath) return;
                bindToken(section.id, { propPath, tokenRef: t.key });
              }}
              className="group flex flex-col items-start gap-1 rounded-ods-8 border border-builder-border bg-builder-bg p-1.5 text-left hover:border-builder-accent"
            >
              {(t.category === "color" || t.category === "gradient") && (
                <span
                  className="block h-6 w-full rounded-ods-4 border border-builder-border"
                  style={{ background: t.value }}
                />
              )}
              <span className="truncate text-[10px] text-builder-text">
                {t.label}
              </span>
              <span className="truncate text-[9px] text-builder-muted">
                {t.key}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
