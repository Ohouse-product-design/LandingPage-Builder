import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PresetDocBanner } from "./PresetDocBanner";

export type BadgePresetArgs = {
  label: string;
};

function BadgePresetPreview({ label }: BadgePresetArgs) {
  return (
    <div className="bg-white p-4">
      <PresetDocBanner id="badge" />
      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-ods-primary to-purple-600 px-3 py-1 text-ods-caption font-semibold text-white">
        <span aria-hidden className="inline-block size-1.5 rounded-full bg-white/90" />
        {label}
      </span>
    </div>
  );
}

const meta = {
  title: "Catalog/Component presets/Badge",
  component: BadgePresetPreview,
  tags: ["autodocs"],
  args: {
    label: "BEST",
  } satisfies BadgePresetArgs,
  argTypes: {
    label: { control: "text", description: "uiSpec.label (max 12 chars 권장)" },
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "`COMPONENT_PRESETS.badge` — 그라디언트 배지. `label` 은 text Control 입니다.",
      },
    },
  },
} satisfies Meta<typeof BadgePresetPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
