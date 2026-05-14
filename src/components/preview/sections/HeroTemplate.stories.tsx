import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import HeroTemplate from "./HeroTemplate";
import { heroFixture } from "./__fixtures__/sectionFixtures";

const meta: Meta<typeof HeroTemplate> = {
  title: "Preview/Sections/Hero",
  component: HeroTemplate,
  args: { section: heroFixture, viewport: "desktop" },
  argTypes: {
    viewport: { control: "inline-radio", options: ["mobile", "tablet", "desktop"] },
  },
};

export default meta;
type Story = StoryObj<typeof HeroTemplate>;

export const Desktop: Story = {};

export const Mobile: Story = {
  args: { viewport: "mobile" },
  parameters: { viewport: { defaultViewport: "mobile" } },
};

export const Tablet: Story = {
  args: { viewport: "tablet" },
  parameters: { viewport: { defaultViewport: "tablet" } },
};

export const TitleOnly: Story = {
  args: {
    section: {
      ...heroFixture,
      props: { title: "이사,\n오늘의집과 함께", primaryCtaLabel: "시작하기" },
    },
  },
};
