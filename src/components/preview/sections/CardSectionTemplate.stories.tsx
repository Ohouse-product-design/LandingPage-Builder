import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import CardSectionTemplate from "./CardSectionTemplate";
import {
  buildCardSectionFixture,
  carouselLayout,
  coverageFixture,
  crossSellFixture,
  gridLayout,
  processFixture,
  reviewFixture,
  rowLayout,
  uspFixture,
} from "./__fixtures__/sectionFixtures";

const meta: Meta<typeof CardSectionTemplate> = {
  title: "Preview/Sections/CardSection",
  component: CardSectionTemplate,
  args: { viewport: "desktop", bg: "white", badge: false },
  argTypes: {
    viewport: { control: "inline-radio", options: ["mobile", "tablet", "desktop"] },
    bg: { control: "inline-radio", options: ["white", "gray", "light"] },
    badge: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof CardSectionTemplate>;

// ───── usage 별 ─────
export const Usp: Story = { args: { section: uspFixture } };
export const Coverage: Story = { args: { section: coverageFixture, badge: true } };
export const Review: Story = { args: { section: reviewFixture, bg: "gray" } };
export const Process: Story = { args: { section: processFixture } };
export const CrossSell: Story = { args: { section: crossSellFixture, bg: "gray" } };

// ───── layout 스왑 (같은 cells, layout 만 교체) ─────
export const UspAsCarousel: Story = {
  name: "USP · Layout: Carousel",
  args: {
    section: buildCardSectionFixture({
      preset: "usp",
      usage: "usp",
      layout: carouselLayout,
      cells: uspFixture.slots.content[0].props["cells"] as never,
      sectionTitle: "USP — Carousel 레이아웃",
    }),
  },
};

export const UspAsRow: Story = {
  name: "USP · Layout: Row",
  args: {
    section: buildCardSectionFixture({
      preset: "usp",
      usage: "usp",
      layout: rowLayout,
      cells: uspFixture.slots.content[0].props["cells"] as never,
      sectionTitle: "USP — Row 레이아웃",
    }),
  },
};

export const ReviewAsGrid: Story = {
  name: "Review · Layout: Grid",
  args: {
    section: buildCardSectionFixture({
      preset: "review",
      usage: "review",
      layout: gridLayout,
      cells: reviewFixture.slots.content[0].props["cells"] as never,
      sectionTitle: "Review — Grid 레이아웃",
    }),
    bg: "gray",
  },
};

// ───── 반응형 ─────
export const UspMobile: Story = {
  args: { section: uspFixture, viewport: "mobile" },
  parameters: { viewport: { defaultViewport: "mobile" } },
};
