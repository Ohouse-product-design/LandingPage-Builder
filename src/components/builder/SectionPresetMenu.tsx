"use client";

/**
 * SectionPresetMenu — SectionTree 의 "+ 섹션 추가" 메뉴와 동일한 UI 를
 * 데이터 props 로만 그리는 presentational 컴포넌트.
 *
 * 빌더 `SectionTree` 의 옵션 목록은 `section-add-menu.ts` 와 동기화되어 있다.
 * 이 컴포넌트는 외부에서 라벨/설명을 주입받아 Storybook Controls 패널에서 라벨 문구를
 * 실시간으로 편집·미리보기 할 수 있게 한다.
 */

import { IconChevronRight } from "@/lib/ods-icons";

export interface SectionPresetMenuEntry {
  id: string;
  label: string;
  /** 없으면 SectionTree 와 같이 한 줄만 표시 */
  description?: string;
  group?: string;
}

export interface SectionPresetMenuProps {
  entries: SectionPresetMenuEntry[];
  onPick?: (id: string) => void;
}

export default function SectionPresetMenu({
  entries,
  onPick,
}: SectionPresetMenuProps) {
  // 그룹별 묶기 (group 이 없으면 "기본")
  const groups = entries.reduce<Record<string, SectionPresetMenuEntry[]>>(
    (acc, e) => {
      const key = e.group ?? "기본";
      (acc[key] = acc[key] ?? []).push(e);
      return acc;
    },
    {}
  );

  return (
    <div className="max-h-[60vh] w-[320px] overflow-y-auto rounded-ods-8 border border-builder-border bg-builder-panel-2 p-1 shadow-xl">
      {Object.entries(groups).map(([group, list]) => (
        <div key={group}>
          <p className="px-2 pt-1 pb-0.5 text-[10px] uppercase tracking-wider text-builder-muted">
            {group}
          </p>
          {list.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => onPick?.(entry.id)}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-builder-panel"
            >
              <IconChevronRight size={12} className="shrink-0 text-builder-muted" />
              <span>
                <span className="block text-[12px] text-builder-text">{entry.label}</span>
                {entry.description ? (
                  <span className="block text-[10px] text-builder-muted">{entry.description}</span>
                ) : null}
              </span>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
