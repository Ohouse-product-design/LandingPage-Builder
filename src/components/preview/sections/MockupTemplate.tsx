"use client";

import { cn } from "@/lib/cn";
import type { AssetSlotModalOpenContext } from "@/schema/asset-modal-context";
import type { Section, Viewport } from "@/schema/doc";
import { IconPhoto } from "@bucketplace/icons";
import OdsAssetRenderer from "../OdsAssetRenderer";
import { containerPad, titleLayoutOf } from "./SectionTitleBlock";

/**
 * 목업 섹션 — 실제 서비스 화면 소개 (2026-10 추가)
 *
 * 레퍼런스: [태그 필] → 타이틀(2줄) → 설명(2줄) → 하늘색 라운드 컨테이너 안에 폰 목업(상단 정렬, 하단은 컨테이너에 잘림)
 *   - 섹션 배경: surface.gray / 목업 컨테이너: #C9E4FF 계열(primary 저채도) rounded-24
 *   - 폰 프레임: CSS 베젤(다크, rounded-44) + 스크린샷(스크린 디렉토리 썸네일 804×1748 = iPhone 2x). 화면 비율 402:874
 *   - 타이틀 레이아웃: center → 텍스트 중앙, split → 좌측 (페이지 공통 규칙)
 *   - 텍스트 블록과 목업은 모든 뷰포트에서 세로 스택 (콘텐츠 컨테이너 720 안)
 *   - 스크린이 없으면 폰 프레임 안에 중립 placeholder("화면 미정") — 하네스 리포트 warn
 */
const PHONE_W = { mobile: 280, tablet: 320, desktop: 340 } as const;
const SCREEN_RATIO = 874 / 402;

export default function MockupTemplate({
  section,
  viewport,
  onRequestAssetSlot,
}: {
  section: Section;
  viewport: Viewport;
  onRequestAssetSlot?: (ctx: AssetSlotModalOpenContext) => void;
}) {
  const tag = section.props["tag"] as string | undefined;
  const title = section.props["sectionTitle"] as string | undefined;
  const body = section.props["sectionSubtitle"] as string | undefined;
  const screen = section.assets.find((a) => a.slotName === "screen")?.asset ?? null;
  const centered = titleLayoutOf(section) === "center";
  const phoneW = PHONE_W[viewport];
  const screenH = Math.round(phoneW * SCREEN_RATIO);
  // 컨테이너 높이: 폰 높이의 ~62% 만 보여주고 하단은 잘라 "화면이 이어지는" 인상 (레퍼런스)
  const containerH = Math.round(screenH * 0.62);

  return (
    <div className={cn(containerPad, "bg-ods-surface-gray")}>
      <div className={cn("mb-6 flex flex-col gap-3 md:mb-8", centered ? "items-center text-center" : "items-start text-left")}>
        {tag && (
          <span className="inline-flex h-8 items-center rounded-ods-8 px-3 font-pretendard text-[14px] font-semibold leading-none tracking-[-0.3px] text-ods-primary" style={{ background: "#E5F3FF" }}>
            {tag}
          </span>
        )}
        {title && (
          <h2
            className="whitespace-pre-line font-pretendard text-[24px] font-bold leading-[34px] tracking-[-0.3px] text-ods-text-primary md:text-[30px] md:leading-[42px]"
            style={{ textWrap: "balance" } as React.CSSProperties}
          >
            {title}
          </h2>
        )}
        {body && (
          <p className="whitespace-pre-line font-pretendard text-[16px] leading-6 tracking-[-0.3px] text-ods-text-secondary md:text-[18px] md:leading-7">
            {body}
          </p>
        )}
      </div>

      <div
        className="relative mx-auto w-full overflow-hidden rounded-[24px]"
        style={{ background: "#C9E4FF", height: containerH, maxWidth: 720 }}
        data-mockup
      >
        {/* 폰 프레임 — 상단 24px 에서 시작, 하단은 컨테이너에 잘림 */}
        <div
          className="absolute left-1/2 top-6 -translate-x-1/2 rounded-[44px] bg-[#1C1C1E] p-[10px] shadow-[0_12px_32px_rgba(0,0,0,0.18)]"
          style={{ width: phoneW + 20 }}
          aria-hidden={!screen}
        >
          <div className="relative overflow-hidden rounded-[36px] bg-white" style={{ width: phoneW, height: screenH }}>
            {screen ? (
              <OdsAssetRenderer asset={screen} className="h-full w-full object-cover object-top" onRequestSlotEdit={onRequestAssetSlot ? () => onRequestAssetSlot({ sectionId: section.id, componentId: null, slotName: "screen" }) : undefined} />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-ods-surface-light text-ods-text-tertiary" aria-label="화면 미정" title="화면 미정 — 스크린 디렉토리에서 맥락에 맞는 화면 지정 필요">
                <IconPhoto size={28} />
                <span className="font-pretendard text-[13px] tracking-[-0.3px]">화면 미정</span>
              </div>
            )}
            {/* 다이내믹 아일랜드 */}
            <div className="absolute left-1/2 top-3 h-[26px] w-[90px] -translate-x-1/2 rounded-full bg-[#1C1C1E]" />
          </div>
        </div>
      </div>
    </div>
  );
}
