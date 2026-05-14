import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import HeaderTemplate from "./HeaderTemplate";
import { headerFixture } from "./__fixtures__/sectionFixtures";

const meta: Meta<typeof HeaderTemplate> = {
  title: "Preview/Sections/Header",
  component: HeaderTemplate,
  args: { section: headerFixture },
};

export default meta;
type Story = StoryObj<typeof HeaderTemplate>;

export const Default: Story = {};

export const LongLogo: Story = {
  args: {
    section: { ...headerFixture, props: { logoText: "오늘의집 이사 서비스" } },
  },
};

export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: "mobile" } },
};
