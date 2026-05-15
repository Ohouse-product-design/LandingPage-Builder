import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { COMPONENT_PRESET_LIST } from "@/schema/component-presets";

const meta = {
  title: "Catalog/Component presets/Overview",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    controls: { disable: true },
    docs: {
      description: {
        component:
          "`COMPONENT_PRESET_LIST` 요약과 하위 스토리 링크 안내. 각 프리셋은 같은 폴더 아래 **Card / Table row / …** 메뉴에서 **args + argTypes** 기반 Controls 로 탐색합니다. ([Controls 문서](https://storybook.js.org/docs/essentials/controls))",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const PresetList: Story = {
  name: "프리셋 메타 목록",
  render: () => (
    <div className="max-w-2xl space-y-4 bg-white p-4">
      <h2 className="text-xl font-bold text-ods-text-primary">COMPONENT_PRESET_LIST</h2>
      <p className="text-ods-body-md text-ods-text-secondary">
        사이드바 <strong>Catalog → Component presets</strong> 에서 개별 메뉴를 열고 Controls 패널을 사용하세요.
      </p>
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
