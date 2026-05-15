import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Section from "@/components/preview/Section";
import { fixtureByPreset } from "@/components/preview/sections/__fixtures__/sectionFixtures";
import { SECTION_PRESETS, type SectionPresetId } from "@/schema/section-presets";

const presetOrder = Object.keys(SECTION_PRESETS) as SectionPresetId[];

function PresetBlock({ id }: { id: SectionPresetId }) {
  const preset = SECTION_PRESETS[id];
  return (
    <article className="border-b border-ods-border-light py-8 last:border-b-0">
      <header className="mb-4 max-w-3xl space-y-1 px-4">
        <p className="text-ods-caption font-medium uppercase tracking-wide text-ods-text-tertiary">
          {preset.category} · {preset.defaultLocked ? "locked" : "editable"}
        </p>
        <h2 className="text-xl font-semibold text-ods-text-primary">{preset.label}</h2>
        <p className="text-ods-body-md text-ods-text-secondary">{preset.description}</p>
        <code className="text-ods-caption text-ods-primary">preset: &quot;{id}&quot;</code>
      </header>
      <div className="w-full overflow-x-auto">
        <Section section={fixtureByPreset[id]} viewport="desktop" />
      </div>
    </article>
  );
}

const meta = {
  title: "Catalog/Section presets",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "`SECTION_PRESETS`에 정의된 섹션별로 `fixtureByPreset` 기반 JSX 프리뷰를 한 화면에 모았습니다.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const AllPresets: Story = {
  name: "전체 프리셋",
  render: () => (
    <div className="min-h-screen bg-white">
      <div className="border-b border-ods-border bg-ods-surface-light px-4 py-6">
        <h1 className="text-2xl font-bold text-ods-text-primary">Section preset catalog</h1>
        <p className="mt-1 text-ods-body-md text-ods-text-secondary">
          스키마(`section-presets.ts`)와 동일한 순서로 데스크톱 뷰포트 프리뷰를 표시합니다.
        </p>
      </div>
      <div className="mx-auto max-w-[1280px]">
        {presetOrder.map((id) => (
          <PresetBlock key={id} id={id} />
        ))}
      </div>
    </div>
  ),
};
