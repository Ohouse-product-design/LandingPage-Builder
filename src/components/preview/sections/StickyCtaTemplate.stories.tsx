import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import StickyCtaTemplate from "./StickyCtaTemplate";
import { stickyCtaFixture } from "./__fixtures__/sectionFixtures";

const meta: Meta<typeof StickyCtaTemplate> = {
  title: "Preview/Sections/StickyCta",
  component: StickyCtaTemplate,
  args: { section: stickyCtaFixture },
};

export default meta;
type Story = StoryObj<typeof StickyCtaTemplate>;

export const Default: Story = {};

export const ShortLabel: Story = {
  args: { section: { ...stickyCtaFixture, props: { label: "신청" } } },
};

export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: "mobile" } },
};
