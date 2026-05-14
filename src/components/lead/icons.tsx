/**
 * Lead 컴포넌트가 사용하는 아이콘 — ODS 카탈로그(`@bucketplace/icons`) 이름을
 * 그대로 re-export. 실제 구현은 `src/lib/ods-icons.tsx` 의 로컬 어댑터를 따른다.
 *
 * 구현은 `tsconfig` paths 로 `@bucketplace/icons` → 로컬 shim → `ods-icons` 어댑터.
 */

export {
  IconChevronDown,
  IconChevronRight,
  IconChevronLeft,
  IconPhoneFilled,
  IconBubbleRight,
  IconCheck,
  IconPhoto,
} from "@bucketplace/icons";

// ODS 카탈로그에는 별도 로고 아이콘이 없으므로 텍스트 마크로 유지.
import type { SVGProps } from "react";
export function OhouseLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 71 20"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <text x="0" y="15" fontFamily="Pretendard, sans-serif" fontWeight="700" fontSize="14">
        오늘의집
      </text>
    </svg>
  );
}
