import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import FooterTemplate from "./FooterTemplate";
import { footerFixture } from "./__fixtures__/sectionFixtures";

const meta: Meta<typeof FooterTemplate> = {
  title: "Preview/Sections/Footer",
  component: FooterTemplate,
  args: { section: footerFixture },
};

export default meta;
type Story = StoryObj<typeof FooterTemplate>;

export const Default: Story = {};

export const CustomCopy: Story = {
  args: {
    section: {
      ...footerFixture,
      props: { copyright: "© 2026 Bucket Place. All rights reserved." },
    },
  },
};
