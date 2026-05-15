import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import SectionCardVariantsGallery from "@/components/gallery/SectionCardVariantsGallery";

/**
 * Task 튜토리얼 스타일: 컴포넌트를 독립 환경에서 상태별로 나열해 CDD 흐름으로 검토합니다.
 * @see https://storybook.js.org/docs/get-started/whats-a-story
 */
const meta = {
  title: "Gallery/Section & Card variants",
  component: SectionCardVariantsGallery,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "모든 섹션 프리셋 프리뷰와 Card 의 usage·layout 변형을 한 페이지에 모았습니다. 앱에서는 `/gallery/section-card-variants` 로도 동일한 화면을 열 수 있습니다.",
      },
    },
  },
} satisfies Meta<typeof SectionCardVariantsGallery>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FullPage: Story = {
  name: "전체 갤러리 (HTML 페이지와 동일)",
};
