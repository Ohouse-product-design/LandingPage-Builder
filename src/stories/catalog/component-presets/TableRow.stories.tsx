import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PresetDocBanner } from "./PresetDocBanner";

export type TableRowPresetArgs = {
  label: string;
  colA: string;
  colB: string;
  colC: string;
};

function TableRowPresetPreview({ label, colA, colB, colC }: TableRowPresetArgs) {
  return (
    <div className="max-w-3xl bg-white p-4">
      <PresetDocBanner id="table-row" />
      <div className="overflow-hidden rounded-ods-12 border border-ods-border bg-white">
        <div className="grid grid-cols-4 border-b border-ods-border bg-ods-surface-gray text-ods-caption font-semibold text-ods-text-secondary">
          <div className="p-3">항목</div>
          <div className="p-3 text-center">타사</div>
          <div className="p-3 text-center">오늘의집</div>
          <div className="p-3 text-center">책임보장</div>
        </div>
        <div className="grid grid-cols-4 border-b border-ods-border-light text-ods-body-md last:border-0">
          <div className="p-3 font-medium text-ods-text-primary">{label}</div>
          <div className="p-3 text-center text-ods-text-tertiary">{colA}</div>
          <div className="p-3 text-center font-semibold text-ods-primary">{colB}</div>
          <div className="p-3 text-center font-semibold text-ods-responsibility-green">{colC}</div>
        </div>
      </div>
    </div>
  );
}

const meta = {
  title: "Catalog/Component presets/Table row",
  component: TableRowPresetPreview,
  tags: ["autodocs"],
  args: {
    label: "비교 견적",
    colA: "X",
    colB: "O",
    colC: "O",
  } satisfies TableRowPresetArgs,
  argTypes: {
    label: { control: "text", description: "행 제목 (uiSpec.label)", table: { category: "Cells" } },
    colA: { control: "text", description: "첫 비교 열", table: { category: "Cells" } },
    colB: { control: "text", description: "두 번째 열", table: { category: "Cells" } },
    colC: { control: "text", description: "세 번째 열", table: { category: "Cells" } },
  },
  parameters: {
    layout: "padded",
    controls: { sort: "alpha" as const },
    docs: {
      description: {
        component:
          "`COMPONENT_PRESETS['table-row']` — 비교 테이블 한 행. 텍스트 `args` 로 Controls 에서 값을 바꿉니다.",
      },
    },
  },
} satisfies Meta<typeof TableRowPresetPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const PartialEmpty: Story = {
  name: "△ / 빈 셀 예시",
  args: { label: "사전 방문", colA: "△", colB: "O", colC: "O" },
};
