import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import TableTemplate from "./TableTemplate";
import { tableFixture } from "./__fixtures__/sectionFixtures";

const meta: Meta<typeof TableTemplate> = {
  title: "Preview/Sections/Table",
  component: TableTemplate,
  args: { section: tableFixture },
};

export default meta;
type Story = StoryObj<typeof TableTemplate>;

export const Default: Story = {};

export const TwoRows: Story = {
  args: {
    section: {
      ...tableFixture,
      slots: { rows: tableFixture.slots.rows.slice(0, 2) },
    },
  },
};

export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: "mobile" } },
};
