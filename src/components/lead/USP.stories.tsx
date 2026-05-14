import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { USP } from "./USP";
import { leadStoryDefaults } from "./_decorators";

const meta: Meta<typeof USP> = {
  title: "Lead/USP",
  component: USP,
  ...leadStoryDefaults,
};

export default meta;
type Story = StoryObj<typeof USP>;

export const Desktop: Story = {
  parameters: { ...leadStoryDefaults.parameters, viewport: { defaultViewport: "desktop" } },
};

export const Tablet: Story = {
  parameters: { ...leadStoryDefaults.parameters, viewport: { defaultViewport: "tablet" } },
};

export const Mobile: Story = {
  parameters: { ...leadStoryDefaults.parameters, viewport: { defaultViewport: "mobile" } },
};
