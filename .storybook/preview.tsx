import type { Preview } from "@storybook/nextjs-vite";

import "../app/globals.css";

const preview: Preview = {
  parameters: {
    options: {
      storySort: {
        order: [
          "Catalog",
          ["Section presets", "Component presets"],
          "Preview",
          ["Builder", "ODS", "Lead", "Marketing"],
        ],
      },
    },
    layout: "fullscreen",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    viewport: {
      viewports: {
        mobile: { name: "Mobile (375)", styles: { width: "375px", height: "812px" } },
        tablet: { name: "Tablet (768)", styles: { width: "768px", height: "1024px" } },
        desktop: { name: "Desktop (1280)", styles: { width: "1280px", height: "800px" } },
      },
      defaultViewport: "desktop",
    },
    backgrounds: {
      default: "white",
      values: [
        { name: "white", value: "#FFFFFF" },
        { name: "grey", value: "#F5F5F5" },
        { name: "light", value: "#F7F9FA" },
        { name: "builder", value: "#0F1115" },
      ],
    },
    a11y: { test: "todo" },
  },
  globalTypes: {
    viewport: {
      name: "Viewport",
      description: "랜딩 페이지 뷰포트",
      defaultValue: "desktop",
      toolbar: {
        icon: "mobile",
        items: [
          { value: "mobile", title: "Mobile" },
          { value: "tablet", title: "Tablet" },
          { value: "desktop", title: "Desktop" },
        ],
      },
    },
  },
};

export default preview;
