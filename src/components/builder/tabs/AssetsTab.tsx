"use client";

import { COMPONENT_PRESETS } from "@/schema/component-presets";
import { SECTION_PRESETS } from "@/schema/section-presets";
import type { AssetSlot } from "@/schema/doc";
import {
  selectSelectedComponent,
  selectSelectedSection,
  useBuilderStore,
} from "@/store/builder-store";

/**
 * Assets 탭.
 * - 섹션/컴포넌트가 갖는 에셋 슬롯 목록 + 임베드 버튼.
 * - 임베드 버튼 클릭 → openAssetModal 로 design-assets 검색 모달 오픈.
 */
export default function AssetsTab() {
  const section = useBuilderStore(selectSelectedSection);
  const component = useBuilderStore(selectSelectedComponent);
  const openAssetModal = useBuilderStore((s) => s.openAssetModal);

  if (!section) return null;

  // 어떤 슬롯 스펙을 그릴지 결정
  const slotSpecs = component
    ? COMPONENT_PRESETS[component.preset].assetSlots
    : SECTION_PRESETS[section.preset].assets.map((a) => ({
        name: a.slotName,
        label: a.label,
        required: a.required,
      }));

  const slots = component ? component.assets : section.assets;

  if (slotSpecs.length === 0) {
    return (
      <p className="text-[12px] text-builder-muted">
        이 프리셋은 에셋 슬롯이 없습니다.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-[11px] uppercase tracking-wider text-builder-muted">
        Asset Slots
      </div>
      {slotSpecs.map((spec) => {
        const filled = slots.find((a) => a.slotName === spec.name);
        return (
          <AssetSlotRow
            key={spec.name}
            name={spec.name}
            label={spec.label}
            required={spec.required}
            asset={filled}
            onEmbed={() =>
              openAssetModal({
                sectionId: section.id,
                componentId: component?.id ?? null,
                slotName: spec.name,
              })
            }
          />
        );
      })}
    </div>
  );
}

function AssetSlotRow({
  name,
  label,
  required,
  asset,
  onEmbed,
}: {
  name: string;
  label: string;
  required: boolean;
  asset?: AssetSlot;
  onEmbed: () => void;
}) {
  return (
    <div className="rounded-ods-8 border border-builder-border bg-builder-bg p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[12px] text-builder-text">
          {label}
          {required && <span className="ml-0.5 text-builder-danger">*</span>}
        </span>
        <span className="text-[10px] text-builder-muted">{name}</span>
      </div>
      {asset?.asset ? (
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-ods-4 bg-builder-panel-2 text-[10px] text-builder-muted">
            {asset.asset.type === "svg" ? "SVG" : asset.asset.type === "video" ? "VID" : "IMG"}
          </div>
          <div className="min-w-0 flex-1 text-[11px]">
            <div className="truncate text-builder-text">
              {asset.asset.assetId ?? asset.asset.url}
            </div>
            <div className="truncate text-builder-muted">{asset.asset.alt}</div>
          </div>
          <button
            type="button"
            onClick={onEmbed}
            className="rounded-ods-4 border border-builder-border px-2 py-1 text-[11px] text-builder-text hover:border-builder-accent"
          >
            교체
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onEmbed}
          className="w-full rounded-ods-8 border border-dashed border-builder-border py-3 text-[12px] text-builder-muted hover:border-builder-accent hover:text-builder-text"
        >
          + 에셋 임베드
        </button>
      )}
    </div>
  );
}
