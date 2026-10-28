"use client";

import { cn } from "@/lib/cn";
import type { Section } from "@/schema/doc";

/**
 * 페이지 전체에 하나만 쓰는 타이틀 레이아웃.
 * - "center": [타이틀] [에셋] 세로 중앙 정렬 (섹션 타이틀 중앙, 카드 그리드 중앙)
 * - "split" : [타이틀] [에셋] 가로 일렬 (히어로는 좌 텍스트 / 우 에셋, 섹션 타이틀 좌측)
 * 섹션마다 섞어 쓰지 않는다 — 하네스 compile 이 페이지 단위로 모든 섹션 props 에 동일 값을 주입.
 */
export type TitleLayout = "center" | "split";

export function titleLayoutOf(section: Section): TitleLayout {
  return section.props["titleLayout"] === "center" ? "center" : "split";
}

export default function SectionTitleBlock({ section }: { section: Section }) {
  const sub = section.props["sectionSubtitle"] as string | undefined;
  const main = section.props["sectionTitle"] as string | undefined;
  if (!sub && !main) return null;
  const centered = titleLayoutOf(section) === "center";
  return (
    <div className={cn("mb-6 md:mb-10", centered && "text-center")}>
      {sub && (
        <div className="mb-1 text-ods-body-lg text-ods-text-tertiary">{sub}</div>
      )}
      {main && (
        <div
          className="whitespace-pre-line text-ods-display-md font-semibold text-ods-text-primary md:text-ods-display-lg"
          style={{ textWrap: "balance" } as React.CSSProperties}
        >
          {main}
        </div>
      )}
    </div>
  );
}

/**
 * 섹션 좌우 패딩: 모든 브레이크포인트에서 16px(px-4).
 * 수직 패딩은 디바이스별 디자인 의도를 유지.
 */
export const containerPad = "px-4 py-8 md:py-12 lg:py-[60px]";
