/**
 * ODS(Ohouse Design System) 토큰 카탈로그.
 *
 * 실제 ods 레포 연동 전까지의 mock 카탈로그.
 * tailwind.config.ts 와 1:1 정합 유지가 필수.
 *
 * 빌더 어드민의 Tokens 탭에서 사용자가 선택할 수 있는 옵션이며,
 * Section / ComponentInstance.tokens 의 tokenRef 필드는
 * 반드시 이 카탈로그에 존재하는 키여야 한다.
 */

export type OdsTokenCategory = "color" | "typography" | "radius" | "spacing" | "gradient";

export interface OdsTokenEntry {
  /** 토큰 키. e.g. "color.primary", "typography.display-lg" */
  key: string;
  /** UI 표시 라벨 */
  label: string;
  category: OdsTokenCategory;
  /** mock 값 — 빌드시 실제 ods 값으로 치환 */
  value: string;
  /** preview 용 CSS — swatch/typo 미리보기에 사용 */
  preview?: string;
  /** Tailwind 매핑 클래스 (있을 경우) */
  tailwind?: string;
  /** 어느 prop 에 쓰일 수 있는지 (필터링용) */
  applicableProps: ("color" | "background" | "borderColor" | "fontSize" | "fontFamily" | "borderRadius" | "spacing")[];
}

/** Section / ComponentInstance.tokens 의 tokenRef 가 이 키 중 하나여야 함 */
export type OdsTokenRef = string;

export const ODS_TOKENS: OdsTokenEntry[] = [
  // ---------- Color ----------
  {
    key: "color.primary",
    label: "Primary Blue",
    category: "color",
    value: "#00A1FF",
    preview: "background:#00A1FF",
    tailwind: "bg-ods-primary",
    applicableProps: ["color", "background", "borderColor"],
  },
  {
    key: "color.responsibility-green",
    label: "Responsibility Green",
    category: "color",
    value: "#05A558",
    preview: "background:#05A558",
    tailwind: "bg-ods-responsibility-green",
    applicableProps: ["color", "background", "borderColor"],
  },
  {
    key: "color.star-yellow",
    label: "Star Yellow",
    category: "color",
    value: "#FFC300",
    preview: "background:#FFC300",
    applicableProps: ["color", "background"],
  },
  {
    key: "color.text.primary",
    label: "Text / Primary",
    category: "color",
    value: "#141414",
    preview: "background:#141414",
    applicableProps: ["color"],
  },
  {
    key: "color.text.secondary",
    label: "Text / Secondary",
    category: "color",
    value: "#2F3438",
    preview: "background:#2F3438",
    applicableProps: ["color"],
  },
  {
    key: "color.text.tertiary",
    label: "Text / Tertiary",
    category: "color",
    value: "#8C8C8C",
    preview: "background:#8C8C8C",
    applicableProps: ["color"],
  },
  {
    key: "color.surface.gray",
    label: "Surface / Gray",
    category: "color",
    value: "#F5F5F5",
    preview: "background:#F5F5F5",
    applicableProps: ["background"],
  },
  {
    key: "color.surface.light",
    label: "Surface / Light",
    category: "color",
    value: "#F7F9FA",
    preview: "background:#F7F9FA",
    applicableProps: ["background"],
  },
  {
    key: "color.border.default",
    label: "Border / Default",
    category: "color",
    value: "#E0E0E0",
    preview: "background:#E0E0E0",
    applicableProps: ["borderColor"],
  },

  // ---------- Gradient ----------
  {
    key: "gradient.responsibility",
    label: "Responsibility Gradient",
    category: "gradient",
    value: "linear-gradient(90deg, #59D99B 0%, #0AB261 100%)",
    preview: "background:linear-gradient(90deg,#59D99B,#0AB261)",
    applicableProps: ["background"],
  },

  // ---------- Typography ----------
  {
    key: "typography.display-lg",
    label: "Display / LG (32/42 600)",
    category: "typography",
    value: "32px / 42px / -0.3px / 600",
    applicableProps: ["fontSize"],
  },
  {
    key: "typography.display-md",
    label: "Display / MD (24/32 600)",
    category: "typography",
    value: "24px / 32px / -0.3px / 600",
    applicableProps: ["fontSize"],
  },
  {
    key: "typography.title-lg",
    label: "Title / LG (20/28 600)",
    category: "typography",
    value: "20px / 28px / -0.3px / 600",
    applicableProps: ["fontSize"],
  },
  {
    key: "typography.title-md",
    label: "Title / MD (17/22 600)",
    category: "typography",
    value: "17px / 22px / -0.3px / 600",
    applicableProps: ["fontSize"],
  },
  {
    key: "typography.body-lg",
    label: "Body / LG (15/24 500)",
    category: "typography",
    value: "15px / 24px / -0.3px / 500",
    applicableProps: ["fontSize"],
  },
  {
    key: "typography.body-md",
    label: "Body / MD (14/20 400)",
    category: "typography",
    value: "14px / 20px / -0.3px / 400",
    applicableProps: ["fontSize"],
  },
  {
    key: "typography.caption",
    label: "Caption (12/15 500)",
    category: "typography",
    value: "12px / 15px / -0.3px / 500",
    applicableProps: ["fontSize"],
  },

  // ---------- Radius ----------
  { key: "radius.2", label: "Radius 2", category: "radius", value: "2px", applicableProps: ["borderRadius"] },
  { key: "radius.4", label: "Radius 4", category: "radius", value: "4px", applicableProps: ["borderRadius"] },
  { key: "radius.8", label: "Radius 8", category: "radius", value: "8px", applicableProps: ["borderRadius"] },
  { key: "radius.12", label: "Radius 12", category: "radius", value: "12px", applicableProps: ["borderRadius"] },
  { key: "radius.16", label: "Radius 16", category: "radius", value: "16px", applicableProps: ["borderRadius"] },

  // ---------- Spacing ----------
  { key: "spacing.1", label: "Spacing 4", category: "spacing", value: "4px", applicableProps: ["spacing"] },
  { key: "spacing.2", label: "Spacing 8", category: "spacing", value: "8px", applicableProps: ["spacing"] },
  { key: "spacing.3", label: "Spacing 12", category: "spacing", value: "12px", applicableProps: ["spacing"] },
  { key: "spacing.4", label: "Spacing 16", category: "spacing", value: "16px", applicableProps: ["spacing"] },
  { key: "spacing.5", label: "Spacing 20", category: "spacing", value: "20px", applicableProps: ["spacing"] },
  { key: "spacing.6", label: "Spacing 24", category: "spacing", value: "24px", applicableProps: ["spacing"] },
  { key: "spacing.7", label: "Spacing 30", category: "spacing", value: "30px", applicableProps: ["spacing"] },
  { key: "spacing.8", label: "Spacing 40", category: "spacing", value: "40px", applicableProps: ["spacing"] },
  { key: "spacing.9", label: "Spacing 60", category: "spacing", value: "60px", applicableProps: ["spacing"] },
];

export const ODS_TOKEN_MAP: Record<string, OdsTokenEntry> = Object.fromEntries(
  ODS_TOKENS.map((t) => [t.key, t])
);

export function lookupToken(ref: OdsTokenRef): OdsTokenEntry | undefined {
  return ODS_TOKEN_MAP[ref];
}
