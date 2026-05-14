import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Review } from "./Review";
import { leadStoryDefaults } from "./_decorators";

const meta: Meta<typeof Review> = {
  title: "Lead/Review",
  component: Review,
  ...leadStoryDefaults,
};

export default meta;
type Story = StoryObj<typeof Review>;

export const Desktop: Story = {
  parameters: { ...leadStoryDefaults.parameters, viewport: { defaultViewport: "desktop" } },
};

export const Tablet: Story = {
  parameters: { ...leadStoryDefaults.parameters, viewport: { defaultViewport: "tablet" } },
};

export const Mobile: Story = {
  parameters: { ...leadStoryDefaults.parameters, viewport: { defaultViewport: "mobile" } },
};
