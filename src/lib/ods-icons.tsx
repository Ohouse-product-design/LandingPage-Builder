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
  return svg(
    "0 0 24 24",
    <>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </>,
    props,
    false
  );
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
