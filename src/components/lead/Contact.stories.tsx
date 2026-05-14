import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Contact } from "./Contact";
import { leadStoryDefaults } from "./_decorators";

const meta: Meta<typeof Contact> = {
  title: "Lead/Contact",
  component: Contact,
  ...leadStoryDefaults,
};

export default meta;
type Story = StoryObj<typeof Contact>;

export const Desktop: Story = {
  parameters: { ...leadStoryDefaults.parameters, viewport: { defaultViewport: "desktop" } },
};

export const Tablet: Story = {
  parameters: { ...leadStoryDefaults.parameters, viewport: { defaultViewport: "tablet" } },
};

export const Mobile: Story = {
  parameters: { ...leadStoryDefaults.parameters, viewport: { defaultViewport: "mobile" } },
};
