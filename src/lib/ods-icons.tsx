/**
 * ODS Icons — Bucketplace 디자인 시스템의 `@bucketplace/icons` 패키지에 대응하는
 * 로컬 어댑터. 카탈로그 이름·import 문은 `design-assets`(및 product-design catalog)와
 * 맞추는 것이 목표다.
 *
 * 카탈로그 출처:
 *   - https://github.com/bucketplace/design-assets (사내) 및
 *     github.com/bucketplace/product-design/.../catalog/icons.json
 *   (프로젝트 내 미러 사본: src/catalog/ods-icons.json)
 *
 * `@bucketplace/icons` npm 패키지는 현재 사내 registry 에 있어 직접 설치할 수
 * 없으므로, 카탈로그에 정의된 ODS 이름을 그대로 export 하고 내부 구현은
 * 동등한 currentColor SVG 로 채워둔다.
 * 사내 패키지가 사용 가능해지면 아래 한 줄을 교체하는 것으로 전환된다:
 *
 *   import { IconChevronRight, IconPhoneFilled, ... } from "@bucketplace/icons";
 *
 * 모든 컴포넌트는 `size` prop (number|string, default "1em") 과 표준 SVG props 를 받는다.
 */

import type { SVGProps } from "react";

interface OdsIconProps extends Omit<SVGProps<SVGSVGElement>, "width" | "height"> {
  size?: number | string;
}

function svg(
  viewBox: string,
  paths: React.ReactNode,
  { size = "1em", fill = "currentColor", stroke, ...props }: OdsIconProps,
  filled = true
) {
  return (
    <svg
      viewBox={viewBox}
      width={size}
      height={size}
      fill={filled ? fill : "none"}
      stroke={!filled ? (stroke ?? "currentColor") : stroke}
      strokeWidth={!filled ? 1.5 : undefined}
      strokeLinecap={!filled ? "round" : undefined}
      strokeLinejoin={!filled ? "round" : undefined}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {paths}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Chevrons / Arrows
// ---------------------------------------------------------------------------

export function IconChevronDown(props: OdsIconProps) {
  return svg("0 0 24 24", <path d="M6 9l6 6 6-6" />, props, false);
}

export function IconChevronUp(props: OdsIconProps) {
  return svg("0 0 24 24", <path d="M18 15l-6-6-6 6" />, props, false);
}

export function IconChevronLeft(props: OdsIconProps) {
  return svg("0 0 24 24", <path d="M15 6l-6 6 6 6" />, props, false);
}

export function IconChevronRight(props: OdsIconProps) {
  return svg("0 0 24 24", <path d="M9 6l6 6-6 6" />, props, false);
}

export function IconArrowRight(props: OdsIconProps) {
  return svg("0 0 480 480", <><path d="M254.717 89.905c6.265-6.23 16.396-6.203 22.628.062l138 138.75.286.296c5.919 6.26 5.824 16.126-.286 22.27l-138 138.75c-6.232 6.265-16.363 6.293-22.628.062-6.265-6.232-6.293-16.363-.062-22.628L365.521 256H76c-8.837 0-16-7.163-16-16s7.164-16 16-16h289.521L254.655 112.533c-6.231-6.265-6.203-16.396.062-22.628" /></>, props, true);
}

// ---------------------------------------------------------------------------
// Phone / Bubble
// ---------------------------------------------------------------------------

export function IconPhoneFilled(props: OdsIconProps) {
  return svg(
    "0 0 24 24",
    <path d="M4.8 3c-.55 0-1 .45-1 1 0 9.94 7.06 17 17 17 .55 0 1-.45 1-1v-3.06c0-.45-.3-.85-.74-.97l-3.85-.96c-.39-.1-.8.05-1.04.38l-1.49 2.04a14.05 14.05 0 0 1-6.35-6.35l2.04-1.49c.33-.24.48-.65.38-1.04l-.96-3.85A1 1 0 0 0 8.82 3z" />,
    props
  );
}

export function IconBubbleRight(props: OdsIconProps) {
  return svg(
    "0 0 24 24",
    <path d="M12 3c5.52 0 10 3.8 10 8.5 0 4.7-4.48 8.5-10 8.5-1.16 0-2.27-.17-3.31-.48l-3.32 1.84a.5.5 0 0 1-.73-.55l.85-3.18C3.65 16.06 2 13.94 2 11.5 2 6.8 6.48 3 12 3z" />,
    props
  );
}

// ---------------------------------------------------------------------------
// Check / Checkbox
// ---------------------------------------------------------------------------

export function IconCheck(props: OdsIconProps) {
  return svg("0 0 24 24", <path d="M4 12l5 5 11-11" />, props, false);
}

export function IconCheckboxChecked(props: OdsIconProps) {
  return svg(
    "0 0 24 24",
    <>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path
        d="M7 12l3.5 3.5L17 9"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>,
    props
  );
}

// ---------------------------------------------------------------------------
// Star — 카탈로그 `IconStar`, `IconStarFilled` (@bucketplace/icons)
// ---------------------------------------------------------------------------

/** Heroicons 24 solid star geometry — ODS `IconStarFilled` / `IconStar` 공통 path */
const STAR_FILLED_PATH_24 =
  "M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.563.563 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z";

/** ODS 카탈로그 `IconStar` — 별 윤곽 (rating empty) */
export function IconStar(props: OdsIconProps) {
  return svg(
    "0 0 24 24",
    <path
      d={STAR_FILLED_PATH_24}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.35}
      strokeLinejoin="round"
    />,
    props,
    false
  );
}

/** ODS 카탈로그 `IconStarFilled` — 별 채움 (rating filled) */
export function IconStarFilled(props: OdsIconProps) {
  return svg("0 0 24 24", <path d={STAR_FILLED_PATH_24} />, props, true);
}

// ---------------------------------------------------------------------------
// Photo / Image
// ---------------------------------------------------------------------------

export function IconPhoto(props: OdsIconProps) {
  return svg(
    "0 0 24 24",
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="11" r="1.5" />
      <path d="M21 16l-5-5-9 8" />
    </>,
    props,
    false
  );
}

// ---------------------------------------------------------------------------
// linkcard 행 액션 아이콘 — design-assets packages/icons `*MonochromeRegular` 원본 패스 (viewBox 480)
// ---------------------------------------------------------------------------

export function IconArrowDownToLine(props: OdsIconProps) {
  return svg("0 0 480 480", <><path d="M395 385.941c8.837 0 16 7.164 16 16s-7.163 16-16 16H85c-8.836 0-16-7.163-16-16s7.163-16 16-16zM240 50.379c8.836 0 16 7.164 16 16v216.59l72.721-72.281c6.267-6.23 16.397-6.198 22.627.069 6.229 6.267 6.199 16.397-.069 22.627l-100 99.393c-6.24 6.203-16.318 6.203-22.558 0l-100-99.393c-6.268-6.23-6.298-16.36-.069-22.627 6.23-6.267 16.36-6.299 22.627-.069L224 282.969V66.379c0-8.836 7.164-16 16-16" /></>, props, true);
}

export function IconHeadset(props: OdsIconProps) {
  return svg("0 0 480 480", <><path d="M240.075 35c68.716 0 129.632 40.474 138.653 106.502 25.026 2.004 45.903 9.368 61.214 23.515C458.434 182.102 466 206.449 466 234.441s-7.565 52.341-26.058 69.426c-15.114 13.964-35.65 21.32-60.248 23.435-3.824 72.063-67.416 116.749-139.62 116.749-8.836 0-16-7.164-16-16s7.164-16 16-16c62.212 0 107.723-38.161 107.802-91.517V158.377C347.718 105.094 302.233 67 240.075 67c-62.266 0-107.802 38.227-107.803 91.655h-.148v148.299c0 11.506-9.418 21.253-21.44 20.927-30.069-.815-54.897-8.577-72.16-25.473C21.122 285.376 14 261.616 14 234.441c0-27.992 7.566-52.339 26.058-69.424 15.342-14.175 36.272-21.541 61.365-23.528C110.449 75.469 171.363 35 240.075 35M100.124 173.744c-18.235 1.985-30.426 7.455-38.35 14.777C51.967 197.58 46 211.988 46 234.441c0 21.824 5.647 36.034 14.907 45.098 7.908 7.74 20.295 13.54 39.217 15.599zm279.752 121.394c18.235-1.986 30.426-7.453 38.351-14.775 9.805-9.059 15.773-23.468 15.773-45.922s-5.968-36.861-15.773-45.92c-7.925-7.322-20.116-12.792-38.351-14.777z" /></>, props, true);
}

export function IconLink(props: OdsIconProps) {
  return svg("0 0 480 480", <><path d="M109.893 198.989c6.248-6.248 16.379-6.248 22.628 0s6.248 16.379 0 22.627l-14.849 14.849c-23.96 23.96-33.498 44.518-33.498 62.932s9.538 38.973 33.498 62.932 44.516 33.497 62.931 33.497 38.972-9.538 62.932-33.498l14.849-14.849c6.248-6.248 16.378-6.248 22.627 0s6.248 16.38 0 22.628l-14.849 14.849c-26.952 26.952-55.185 42.871-85.559 42.871-30.375 0-58.607-15.92-85.558-42.871s-42.87-55.183-42.871-85.558c0-30.374 15.918-58.608 42.87-85.56z" /><path d="M273.975 182.26c6.248-6.249 16.379-6.249 22.628 0s6.247 16.378 0 22.627l-93.938 93.937c-6.248 6.249-16.38 6.249-22.628 0s-6.248-16.378 0-22.627z" /><path d="M299.396 52.172c30.375 0 58.608 15.919 85.559 42.87s42.87 55.183 42.87 85.558c0 30.374-15.918 58.608-42.871 85.56l-14.849 14.848c-6.248 6.248-16.378 6.248-22.626 0s-6.249-16.379 0-22.627l14.847-14.849c23.961-23.96 33.498-44.518 33.498-62.932s-9.538-38.972-33.497-62.931c-23.959-23.96-44.516-33.497-62.931-33.497s-38.972 9.537-62.932 33.497l-14.849 14.849c-6.248 6.248-16.379 6.248-22.628 0s-6.248-16.379 0-22.627l14.849-14.849c26.952-26.952 55.186-42.87 85.56-42.87" /></>, props, true);
}
