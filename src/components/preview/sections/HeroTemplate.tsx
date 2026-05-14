"use client";

/**
 * 히어로 — Figma `이사-프로덕트` 모바일 히어로 (node 436:357368, dev mode) 정합.
 * - 배경: 상단 스카이 블루 → 투명 그라데이션 + 하단 그레이 필
 * - 세로 스택 중앙 정렬: eyebrow → headline → 비주얼(고정 프레임, object-contain 으로 잘림 없음) → Primary CTA → 스크롤 쉐브론
 * - 데스크톱은 동일 리듬에 타이포·최대 폭만 확대
 */

import type { CSSProperties } from "react";

import { cn } from "@/lib/cn";
import { IconChevronDown } from "@bucketplace/icons";
import type { AssetSlotModalOpenContext } from "@/schema/asset-modal-context";
import type { Section, Viewport } from "@/schema/doc";
import OdsAssetRenderer from "../OdsAssetRenderer";

const HERO_BG_STYLE: CSSProperties = {
  backgroundImage:
    "linear-gradient(180deg, rgb(196, 232, 250) 0%, rgba(247, 249, 250, 0) 40%), linear-gradient(90deg, rgb(245, 245, 245) 0%, rgb(245, 245, 245) 100%)",
};

export default function HeroTemplate({
  section,
  viewport,
  onRequestAssetSlot,
}: {
  section: Section;
  viewport: Viewport;
  onRequestAssetSlot?: (ctx: AssetSlotModalOpenContext) => void;
}) {
  const eyebrow = (section.props["eyebrow"] as string) || "";
  const title = (section.props["title"] as string) ?? "메인 카피";
  const subtitle = (section.props["subtitle"] as string) ?? "";
  const cta1 = (section.props["primaryCtaLabel"] as string) ?? "버튼";
  const cta2Raw = section.props["secondaryCtaLabel"];
  const cta2 =
    typeof cta2Raw === "string" && cta2Raw.trim() ? cta2Raw.trim() : undefined;
  const bgAsset = section.assets.find((a) => a.slotName === "background")?.asset;

  const onHeroBgEdit = onRequestAssetSlot
    ? () =>
        onRequestAssetSlot({
          sectionId: section.id,
          componentId: null,
          slotName: "background",
        })
    : undefined;

  const isDesktop = viewport === "desktop";

  return (
    <div
      className="flex w-full flex-col items-center pb-2.5 pt-[30px] text-ods-text-primary"
      style={HERO_BG_STYLE}
    >
      <div
        className={cn(
          "flex w-full flex-col items-center gap-10 px-5",
          isDesktop ? "max-w-[720px]" : "max-w-[318px]"
        )}
      >
        <div className="flex w-full flex-col items-center gap-5">
          <div className="flex w-full flex-col items-center gap-2 text-center tracking-[-0.3px]">
            {eyebrow ? (
              <p className="w-full text-[14px] font-normal leading-[18px] text-ods-text-primary opacity-60">
                {eyebrow}
              </p>
            ) : null}
            <div
              className={cn(
                "w-full whitespace-pre-line font-semibold",
                isDesktop ? "text-[32px] leading-[40px]" : "text-[28px] leading-8"
              )}
            >
              {title}
            </div>
            {subtitle ? (
              <p className="w-full text-[15px] font-medium leading-6 text-ods-text-secondary">
                {subtitle}
              </p>
            ) : null}
          </div>

          <div className="relative h-[150px] w-full max-w-[225px] shrink-0 overflow-hidden">
            {bgAsset ? (
              <OdsAssetRenderer
                asset={bgAsset}
                className="absolute inset-0 flex size-full items-center justify-center object-contain"
                onRequestSlotEdit={onHeroBgEdit}
              />
            ) : onHeroBgEdit ? (
              <OdsAssetRenderer
                asset={{ type: "image", alt: "히어로 배경" }}
                className="absolute inset-0 flex size-full items-center justify-center object-contain"
                onRequestSlotEdit={onHeroBgEdit}
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-ods-surface-light text-[11px] text-ods-text-tertiary">
                히어로 이미지
              </div>
            )}
          </div>

          <div className="flex w-full max-w-[300px] flex-col items-stretch gap-2">
            <button
              type="button"
              className="rounded-ods-4 bg-ods-primary px-12 py-[15px] text-center text-[16px] font-semibold leading-5 tracking-[-0.3px] text-white"
            >
              {cta1}
            </button>
            {cta2 ? (
              <button
                type="button"
                className="rounded-ods-4 border border-ods-border bg-white px-5 py-3 text-[14px] font-semibold text-ods-text-primary"
              >
                {cta2}
              </button>
            ) : null}
          </div>
        </div>

        <div
          className="flex size-6 shrink-0 items-center justify-center text-ods-text-primary"
          aria-hidden
        >
          <IconChevronDown size={20} />
        </div>
      </div>
    </div>
  );
}
