import type { Decorator } from "@storybook/nextjs-vite";

/**
 * Lead 컴포넌트 Storybook 데코레이터.
 * - 빌더의 다크 배경 globals.css 영향에서 격리해 흰 배경 + Pretendard 적용.
 */
export const leadDecorator: Decorator = (Story) => (
  <>
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
    />
    <div className="font-pretendard text-[#141414]" style={{ background: "#ffffff" }}>
      <Story />
    </div>
  </>
);

export const leadStoryDefaults = {
  parameters: {
    layout: "fullscreen" as const,
    backgrounds: { default: "white" },
  },
  decorators: [leadDecorator],
};
