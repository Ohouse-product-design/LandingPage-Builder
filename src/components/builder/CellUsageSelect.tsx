"use client";

/**
 * CellUsageSelect — SlotsTab 의 Cell Usage dropdown 과 동일한 UI 를
 * 데이터 props 로만 그리는 presentational 컴포넌트.
 *
 * 빌더 본체는 CARD_USAGE_PRESETS 카탈로그를 직접 읽지만, 이 컴포넌트는
 * 외부에서 옵션의 label 을 주입받아 Storybook Controls 에서 라벨 문구를
 * 실시간으로 편집·미리보기 할 수 있게 한다.
 */

export interface CellUsageOption {
  id: string;
  label: string;
}

export interface CellUsageSelectProps {
  options: CellUsageOption[];
  value?: string;
  onChange?: (value: string) => void;
}

export default function CellUsageSelect({
  options,
  value,
  onChange,
}: CellUsageSelectProps) {
  return (
    <div className="w-[320px] rounded-ods-8 bg-builder-panel p-3">
      <div className="mb-1 text-[11px] uppercase tracking-wider text-builder-muted">
        Cell Usage
      </div>
      <select
        value={value ?? options[0]?.id ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full rounded-ods-4 border border-builder-border bg-builder-bg px-2 py-1.5 text-[11px] text-builder-text outline-none focus:border-builder-accent"
      >
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
      <ul className="mt-3 space-y-1 text-[10px] text-builder-muted">
        {options.map((opt) => (
          <li key={opt.id}>
            <span className="text-builder-text">{opt.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
