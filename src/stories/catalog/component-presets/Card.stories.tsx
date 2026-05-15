import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Card from "@/components/preview/Card";
import {
  carouselLayout,
  fixtureByPreset,
  gridLayout,
  rowLayout,
} from "@/components/preview/sections/__fixtures__/sectionFixtures";
import type { CardLayout, CardProps, CardUsagePresetId } from "@/schema/card";
import { CARD_USAGE_PRESETS } from "@/schema/card";
import type { Section } from "@/schema/doc";
import type { Viewport } from "@/schema/doc";

import { PresetDocBanner } from "./PresetDocBanner";

function cardPropsFromSection(section: Section): CardProps | null {
  const inst = section.slots.content?.[0];
  if (!inst || inst.preset !== "card") return null;
  return inst.props as unknown as CardProps;
}

const usageFixture: Record<CardUsagePresetId, Section> = {
  usp: fixtureByPreset.usp,
  review: fixtureByPreset.review,
  step: fixtureByPreset.process,
  service: fixtureByPreset["cross-sell"],
  custom: fixtureByPreset.usp,
};

export type CardPresetStoryArgs = {
  usage: CardUsagePresetId;
  layoutType: CardLayout;
  viewport: Viewport;
};

function toCardData(args: CardPresetStoryArgs): CardProps {
  const base = cardPropsFromSection(usageFixture[args.usage]);
  if (!base) {
    throw new Error("Card fixture missing for usage");
  }
  const layout =
    args.layoutType === "grid"
      ? gridLayout
      : args.layoutType === "carousel"
        ? carouselLayout
        : rowLayout;
  if (args.usage === "custom") {
    return { ...base, usage: "custom", layout: gridLayout };
  }
  return { ...base, usage: args.usage, layout };
}

function CardPresetPreview(args: CardPresetStoryArgs) {
  const data = toCardData(args);
  return (
    <div className="bg-white p-4">
      <PresetDocBanner id="card" />
      <p className="mb-4 text-ods-body-sm text-ods-text-secondary">
        Controls 패널에서 <code className="font-mono text-ods-primary">usage</code>·
        <code className="font-mono text-ods-primary">layoutType</code>·
        <code className="font-mono text-ods-primary">viewport</code> 를 바꿔 프리셋별 런타임을
        확인합니다. (
        <a
          className="text-ods-primary underline"
          href="https://storybook.js.org/docs/essentials/controls"
          rel="noreferrer"
          target="_blank"
        >
          Controls
        </a>
        )
      </p>
      <div className="rounded-ods-12 border border-ods-border p-4">
        <Card {...data} viewport={args.viewport} />
      </div>
    </div>
  );
}

const usageOptions = Object.keys(CARD_USAGE_PRESETS) as CardUsagePresetId[];

const meta = {
  title: "Catalog/Component presets/Card",
  component: CardPresetPreview,
  tags: ["autodocs"],
  args: {
    usage: "usp",
    layoutType: "grid",
    viewport: "desktop",
  } satisfies CardPresetStoryArgs,
  argTypes: {
    usage: {
      description: "CARD_USAGE_PRESETS — 셀 슬롯 활성화·제약",
      options: usageOptions,
      control: { type: "select" },
      table: { category: "Card" },
    },
    layoutType: {
      description: "layout.type — grid / carousel / row",
      options: ["grid", "carousel", "row"] satisfies CardLayout[],
      control: { type: "inline-radio" },
      if: { arg: "usage", neq: "custom" },
      table: { category: "Card" },
    },
    viewport: {
      description: "프리뷰 뷰포트",
      options: ["mobile", "tablet", "desktop"] satisfies Viewport[],
      control: { type: "inline-radio" },
      table: { category: "Card" },
    },
  },
  parameters: {
    layout: "padded",
    controls: { sort: "requiredFirst" as const },
    docs: {
      description: {
        component:
          "`COMPONENT_PRESETS.card` — 통합 Card 컴포넌트. primitive `args` 로 조합해 Controls 에서 실시간 탐색합니다.",
      },
    },
  },
} satisfies Meta<typeof CardPresetPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const AllUsagesStatic: Story = {
  name: "Usage 패턴 (정적 나열)",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="space-y-10 bg-white p-4">
      <PresetDocBanner id="card" />
      <div className="space-y-8">
        {usageOptions.map((usage) => {
          const usageMeta = CARD_USAGE_PRESETS[usage];
          const base = cardPropsFromSection(usageFixture[usage]);
          if (!base) return null;
          const data: CardProps =
            usage === "custom"
              ? { ...base, usage: "custom", layout: gridLayout }
              : { ...base, usage };
          return (
            <section key={usage} className="rounded-ods-12 border border-ods-border p-4">
              <h4 className="mb-1 font-semibold text-ods-text-primary">{usageMeta.label}</h4>
              <p className="mb-4 text-ods-body-sm text-ods-text-secondary">{usageMeta.description}</p>
              <Card {...data} viewport="desktop" />
            </section>
          );
        })}
      </div>
    </div>
  ),
};
