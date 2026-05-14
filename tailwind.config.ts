import type { Config } from "tailwindcss";

/**
 * ODS(Ohouse Design System) 토큰을 Tailwind theme에 매핑.
 * 실제 ods 레포 연동 전까지는 mock 값을 사용하고,
 * src/schema/ods-tokens.ts 의 카탈로그와 1:1 정합이 유지되어야 한다.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ods: {
          primary: "#00A1FF",
          "responsibility-green": "#05A558",
          "star-yellow": "#FFC300",
          text: {
            primary: "#141414",
            secondary: "#2F3438",
            tertiary: "#8C8C8C",
            inverse: "#FFFFFF",
          },
          border: {
            DEFAULT: "#E0E0E0",
            light: "#EDEDED",
          },
          surface: {
            DEFAULT: "#FFFFFF",
            gray: "#F5F5F5",
            light: "#F7F9FA",
          },
        },
        builder: {
          bg: "#0F1115",
          panel: "#171A21",
          "panel-2": "#1F232C",
          border: "#262B36",
          accent: "#7C5CFF",
          "accent-2": "#5B8CFF",
          text: "#E6E8EE",
          muted: "#8A92A6",
          danger: "#FF5C70",
          success: "#3BD16F",
        },
      },
      fontFamily: {
        pretendard: [
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Roboto",
          "Helvetica Neue",
          "Segoe UI",
          "sans-serif",
        ],
      },
      fontSize: {
        // ODS Typography scale (size / lineHeight / letterSpacing)
        "ods-display-lg": ["32px", { lineHeight: "42px", letterSpacing: "-0.3px", fontWeight: "600" }],
        "ods-display-md": ["24px", { lineHeight: "32px", letterSpacing: "-0.3px", fontWeight: "600" }],
        "ods-title-lg": ["20px", { lineHeight: "28px", letterSpacing: "-0.3px", fontWeight: "600" }],
        "ods-title-md": ["17px", { lineHeight: "22px", letterSpacing: "-0.3px", fontWeight: "600" }],
        "ods-body-lg": ["15px", { lineHeight: "24px", letterSpacing: "-0.3px", fontWeight: "500" }],
        "ods-body-md": ["14px", { lineHeight: "20px", letterSpacing: "-0.3px", fontWeight: "400" }],
        "ods-caption": ["12px", { lineHeight: "15px", letterSpacing: "-0.3px", fontWeight: "500" }],
      },
      borderRadius: {
        "ods-2": "2px",
        "ods-4": "4px",
        "ods-8": "8px",
        "ods-12": "12px",
        "ods-16": "16px",
      },
      spacing: {
        // ODS 8pt grid + 추가 토큰
        "ods-1": "4px",
        "ods-2": "8px",
        "ods-3": "12px",
        "ods-4": "16px",
        "ods-5": "20px",
        "ods-6": "24px",
        "ods-7": "30px",
        "ods-8": "40px",
        "ods-9": "60px",
      },
      screens: {
        mobile: { max: "767px" },
        tablet: { min: "768px", max: "1023px" },
        desktop: { min: "1024px" },
      },
      backgroundImage: {
        "ods-gradient-responsibility":
          "linear-gradient(90deg, #59D99B 0%, #0AB261 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
