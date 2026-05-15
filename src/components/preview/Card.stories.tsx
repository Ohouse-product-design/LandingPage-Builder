import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Card from "./Card";
import {
  carouselLayout,
  fixtureByPreset,
  gridLayout,
  rowLayout,
} from "./sections/__fixtures__/sectionFixtures";
import type { CardLayout, CardProps, CardUsagePresetId } from "@/schema/card";
import type { Section } from "@/schema/doc";
import type { Viewport } from "@/schema/doc";

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

type CardStoryArgs = {
  usage: CardUsagePresetId;
  layoutType: CardLayout;
  viewport: Viewport;
};

function toCardProps(args: CardStoryArgs): ComponentProps<typeof Card> {
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
    return { ...base, usage: "custom", layout: gridLayout, viewport: args.viewport };
  }
  return { ...base, usage: args.usage, layout, viewport: args.viewport };
}

const meta = {
  title: "Preview/Card",
  tags: ["autodocs"],
  args: {
    usage: "usp",
    layoutType: "grid",
    viewport: "desktop",
  } satisfies CardStoryArgs,
  argTypes: {
    usage: {
      control: "select",
      options: ["usp", "review", "step", "service", "custom"] satisfies CardUsagePresetId[],
      description: "CARD_USAGE_PRESETS 기준 사용 패턴",
    },
    layoutType: {
      control: "inline-radio",
      options: ["grid", "carousel", "row"] satisfies CardLayout[],
      description: "레이아웃 컨테이너 종류",
    },
    viewport: {
      control: "inline-radio",
      options: ["mobile", "tablet", "desktop"] satisfies Viewport[],
    },
  },
  render: (args: CardStoryArgs) => {
    const props = toCardProps(args);
    return <Card {...props} />;
  },
} satisfies Meta<CardStoryArgs>;

export default meta;

type Story = StoryObj<CardStoryArgs>;

/** Controls 로 usage / layout / viewport 를 바꿔가며 확인 */
export const Playground: Story = {};

/** 튜토리얼의 Default / Pinned / Archived 처럼 대표 상태를 고정 args 로 노출 */
export const UspGridDesktop: Story = {
  name: "USP · Grid · Desktop",
  args: { usage: "usp", layoutType: "grid", viewport: "desktop" },
};

export const ReviewCarousel: Story = {
  name: "Review · Carousel",
  args: { usage: "review", layoutType: "carousel", viewport: "desktop" },
};

export const StepGrid: Story = {
  name: "Step · Grid",
  args: { usage: "step", layoutType: "grid", viewport: "desktop" },
};

export const ServiceRow: Story = {
  name: "Service · Row",
  args: { usage: "service", layoutType: "row", viewport: "desktop" },
};

export const CustomUsage: Story = {
  name: "Custom usage",
  args: { usage: "custom", layoutType: "grid", viewport: "desktop" },
};

export const MobileViewport: Story = {
  name: "USP · Grid · Mobile",
  args: { usage: "usp", layoutType: "grid", viewport: "mobile" },
};
