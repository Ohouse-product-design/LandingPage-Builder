import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Card from "@/components/preview/Card";
import { fixtureByPreset, gridLayout } from "@/components/preview/sections/__fixtures__/sectionFixtures";
import { cn } from "@/lib/cn";
import type { CardProps, CardUsagePresetId } from "@/schema/card";
import { CARD_USAGE_PRESETS } from "@/schema/card";
import { COMPONENT_PRESETS, COMPONENT_PRESET_LIST, type ComponentPresetId } from "@/schema/component-presets";
import type { Section } from "@/schema/doc";

function PresetDoc({ id }: { id: ComponentPresetId }) {
  const p = COMPONENT_PRESETS[id];
  return (
    <header className="mb-4 space-y-1">
      <h3 className="text-lg font-semibold text-ods-text-primary">{p.label}</h3>
      <p className="text-ods-body-md text-ods-text-secondary">{p.description}</p>
      <code className="text-ods-caption text-ods-primary">preset: &quot;{id}&quot;</code>
    </header>
  );
}

function cardPropsFromSection(section: Section): Omit<CardProps, "viewport" | "previewAsset"> | null {
  const inst = section.slots.content?.[0];
  if (!inst || inst.preset !== "card") return null;
  return inst.props as unknown as Omit<CardProps, "viewport" | "previewAsset">;
}

const usageFixture: Record<CardUsagePresetId, Section> = {
  usp: fixtureByPreset.usp,
  review: fixtureByPreset.review,
  step: fixtureByPreset.process,
  service: fixtureByPreset["cross-sell"],
  custom: fixtureByPreset.usp,
};

const meta = {
  title: "Catalog/Component presets",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "`COMPONENT_PRESETS` 기준으로 카드·테이블 행·폼 필드·탭·배지의 런타임 모양을 스토리북에서 확인합니다.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const CardByUsage: Story = {
  name: "Card — usage 패턴",
  render: () => (
    <div className="space-y-10 bg-white p-4">
      <PresetDoc id="card" />
      <div className="space-y-8">
        {(Object.keys(CARD_USAGE_PRESETS) as CardUsagePresetId[]).map((usage) => {
          const usageMeta = CARD_USAGE_PRESETS[usage];
          const base = cardPropsFromSection(usageFixture[usage]);
          if (!base) return null;
          const props: CardProps =
            usage === "custom"
              ? { ...base, usage: "custom", layout: gridLayout }
              : { ...base, usage };
          return (
            <section key={usage} className="rounded-ods-12 border border-ods-border p-4">
              <h4 className="mb-1 font-semibold text-ods-text-primary">{usageMeta.label}</h4>
              <p className="mb-4 text-ods-body-sm text-ods-text-secondary">{usageMeta.description}</p>
              <Card {...props} viewport="desktop" />
            </section>
          );
        })}
      </div>
    </div>
  ),
};

export const TableRow: Story = {
  name: "Table row",
  render: () => (
    <div className="max-w-3xl bg-white p-4">
      <PresetDoc id="table-row" />
      <div className="overflow-hidden rounded-ods-12 border border-ods-border bg-white">
        <div className="grid grid-cols-4 border-b border-ods-border bg-ods-surface-gray text-ods-caption font-semibold text-ods-text-secondary">
          <div className="p-3">항목</div>
          <div className="p-3 text-center">타사</div>
          <div className="p-3 text-center">오늘의집</div>
          <div className="p-3 text-center">책임보장</div>
        </div>
        <div className="grid grid-cols-4 border-b border-ods-border-light text-ods-body-md last:border-0">
          <div className="p-3 font-medium text-ods-text-primary">비교 견적</div>
          <div className="p-3 text-center text-ods-text-tertiary">X</div>
          <div className="p-3 text-center font-semibold text-ods-primary">O</div>
          <div className="p-3 text-center font-semibold text-ods-responsibility-green">O</div>
        </div>
      </div>
    </div>
  ),
};

export const FormField: Story = {
  name: "Form field",
  render: () => (
    <div className="max-w-md bg-white p-4">
      <PresetDoc id="form-field" />
      <div className="rounded-ods-12 border border-ods-border bg-white p-5">
        <div className="mb-3">
          <div className="mb-1 text-ods-caption text-ods-text-secondary">이름</div>
          <div className="h-10 rounded-ods-8 border border-ods-border bg-white px-3 text-ods-body-md leading-10 text-ods-text-tertiary">
            홍길동
          </div>
        </div>
      </div>
    </div>
  ),
};

export const Tab: Story = {
  name: "Tab",
  render: () => (
    <div className="max-w-lg bg-white p-4">
      <PresetDoc id="tab" />
      <div className="flex gap-1 rounded-ods-8 bg-ods-surface-gray p-1">
        {["견적", "후기", "FAQ"].map((label, i) => (
          <button
            key={label}
            type="button"
            className={cn(
              "flex-1 rounded-ods-6 py-2 text-ods-body-sm font-medium transition-colors",
              i === 0 ? "bg-white text-ods-text-primary shadow-sm" : "text-ods-text-tertiary",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-ods-caption text-ods-text-tertiary">
        스키마상 각 탭은 <code>label</code> + <code>contentKey</code> 로 콘텐츠 영역과 매핑됩니다.
      </p>
    </div>
  ),
};

export const Badge: Story = {
  name: "Badge",
  render: () => (
    <div className="bg-white p-4">
      <PresetDoc id="badge" />
      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-ods-primary to-purple-600 px-3 py-1 text-ods-caption font-semibold text-white">
        <span aria-hidden className="inline-block size-1.5 rounded-full bg-white/90" />
        BEST
      </span>
    </div>
  ),
};

export const PresetIndex: Story = {
  name: "프리셋 메타 목록",
  render: () => (
    <div className="max-w-2xl space-y-4 bg-white p-4">
      <h2 className="text-xl font-bold text-ods-text-primary">COMPONENT_PRESET_LIST</h2>
      <ul className="divide-y divide-ods-border-light rounded-ods-12 border border-ods-border">
        {COMPONENT_PRESET_LIST.map((p) => (
          <li key={p.id} className="flex gap-3 px-4 py-3">
            <span className="text-ods-caption font-mono text-ods-text-tertiary">{p.icon}</span>
            <div>
              <div className="font-semibold text-ods-text-primary">{p.label}</div>
              <div className="text-ods-body-sm text-ods-text-secondary">{p.description}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  ),
};
