import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Form } from "./Form";
import { leadStoryDefaults } from "./_decorators";

const meta: Meta<typeof Form> = {
  title: "Lead/Form",
  component: Form,
  ...leadStoryDefaults,
};

export default meta;
type Story = StoryObj<typeof Form>;

export const Desktop: Story = {
  parameters: { ...leadStoryDefaults.parameters, viewport: { defaultViewport: "desktop" } },
};

export const Tablet: Story = {
  parameters: { ...leadStoryDefaults.parameters, viewport: { defaultViewport: "tablet" } },
};

export const Mobile: Story = {
  parameters: { ...leadStoryDefaults.parameters, viewport: { defaultViewport: "mobile" } },
};
