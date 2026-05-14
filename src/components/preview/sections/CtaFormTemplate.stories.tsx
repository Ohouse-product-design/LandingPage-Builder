import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import CtaFormTemplate from "./CtaFormTemplate";
import { ctaFormFixture } from "./__fixtures__/sectionFixtures";

const meta: Meta<typeof CtaFormTemplate> = {
  title: "Preview/Sections/CtaForm",
  component: CtaFormTemplate,
  args: { section: ctaFormFixture },
};

export default meta;
type Story = StoryObj<typeof CtaFormTemplate>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    section: { ...ctaFormFixture, slots: { fields: [] } },
  },
};

export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: "mobile" } },
};
