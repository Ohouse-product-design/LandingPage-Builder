import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { cn } from "@/lib/cn";

import { PresetDocBanner } from "./PresetDocBanner";

export type TabBarPresetArgs = {
  tab1Label: string;
  tab2Label: string;
  tab3Label: string;
  /** 0-based 활성 탭 */
  activeIndex: number;
};

function TabBarPresetPreview({ tab1Label, tab2Label, tab3Label, activeIndex }: TabBarPresetArgs) {
  const labels = [tab1Label, tab2Label, tab3Label];
  const safeIndex = Math.min(labels.length - 1, Math.max(0, Math.floor(activeIndex)));
  return (
    <div className="max-w-lg bg-white p-4">
      <PresetDocBanner id="tab" />
      <div className="flex gap-1 rounded-ods-8 bg-ods-surface-gray p-1">
        {labels.map((label, i) => (
          <button
            key={`${label}-${i}`}
            type="button"
            className={cn(
              "flex-1 rounded-ods-6 py-2 text-ods-body-sm font-medium transition-colors",
              i === safeIndex ? "bg-white text-ods-text-primary shadow-sm" : "text-ods-text-tertiary",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-ods-caption text-ods-text-tertiary">
        스키마상 각 탭은 <code>label</code> + <code>contentKey</code> 로 콘텐츠와 매핑됩니다. 여기서는 라벨·활성
        인덱스만 Controls 로 조정합니다.
      </p>
    </div>
  );
}

const meta = {
  title: "Catalog/Component presets/Tab",
  component: TabBarPresetPreview,
  tags: ["autodocs"],
  args: {
    tab1Label: "견적",
    tab2Label: "후기",
    tab3Label: "FAQ",
    activeIndex: 0,
  } satisfies TabBarPresetArgs,
  argTypes: {
    tab1Label: { control: "text", table: { category: "Labels" } },
    tab2Label: { control: "text", table: { category: "Labels" } },
    tab3Label: { control: "text", table: { category: "Labels" } },
    activeIndex: {
      description: "활성 탭 (0–2)",
      control: { type: "number", min: 0, max: 2, step: 1 },
      table: { category: "State" },
    },
  },
  parameters: {
    layout: "padded",
    controls: { sort: "alpha" as const },
    docs: {
      description: {
        component: "`COMPONENT_PRESETS.tab` — 탭바 한 줄 데모. `activeIndex` 는 number 슬라이더 Controls 입니다.",
      },
    },
  },
} satisfies Meta<typeof TabBarPresetPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
