import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Process } from "./Process";
import { leadStoryDefaults } from "./_decorators";

const meta: Meta<typeof Process> = {
  title: "Lead/Process",
  component: Process,
  ...leadStoryDefaults,
};

export default meta;
type Story = StoryObj<typeof Process>;

export const Desktop: Story = {
  parameters: { ...leadStoryDefaults.parameters, viewport: { defaultViewport: "desktop" } },
};

export const Tablet: Story = {
  parameters: { ...leadStoryDefaults.parameters, viewport: { defaultViewport: "tablet" } },
};

export const Mobile: Story = {
  parameters: { ...leadStoryDefaults.parameters, viewport: { defaultViewport: "mobile" } },
};
