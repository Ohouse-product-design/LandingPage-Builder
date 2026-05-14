import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Hero } from "./Hero";
import { leadStoryDefaults } from "./_decorators";

const meta: Meta<typeof Hero> = {
  title: "Lead/Hero",
  component: Hero,
  ...leadStoryDefaults,
};

export default meta;
type Story = StoryObj<typeof Hero>;

export const Desktop: Story = {
  parameters: { ...leadStoryDefaults.parameters, viewport: { defaultViewport: "desktop" } },
};

export const Tablet: Story = {
  parameters: { ...leadStoryDefaults.parameters, viewport: { defaultViewport: "tablet" } },
};

export const Mobile: Story = {
  parameters: { ...leadStoryDefaults.parameters, viewport: { defaultViewport: "mobile" } },
};
