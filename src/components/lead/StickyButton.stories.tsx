import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { StickyButton } from "./StickyButton";
import { leadStoryDefaults } from "./_decorators";

const meta: Meta<typeof StickyButton> = {
  title: "Lead/StickyButton",
  component: StickyButton,
  ...leadStoryDefaults,
};

export default meta;
type Story = StoryObj<typeof StickyButton>;

export const Default: Story = {
  decorators: [
    (Story) => (
      <div style={{ minHeight: 400, position: "relative" }}>
        <Story />
      </div>
    ),
    ...(leadStoryDefaults.decorators ?? []),
  ],
};
