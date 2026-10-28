"use client";

/**
 * 히어로 — Figma `이사-프로덕트` 모바일 히어로 (node 436:357368, dev mode) 정합.
 *
 * titleLayout (페이지 단위로 하나만):
 * - "center": 세로 스택 중앙 정렬 — eyebrow → headline → 비주얼 → Primary CTA → 스크롤 쉐브론 (기존 동작)
 * - "split" : [타이틀] [에셋] 가로 일렬 — 좌측 텍스트·CTA 좌정렬 / 우측 비주얼. 모바일은 세로 스택(좌정렬).
 * - 배경: 상단 스카이 블루 → 투명 그라데이션 + 하단 그레이 필 (공통)
 */

import type { CSSProperties } from "react";

import { cn } from "@/lib/cn";
import { IconChevronDown } from "@bucketplace/icons";
import type { AssetSlotModalOpenContext } from "@/schema/asset-modal-context";
import type { Section, Viewport } from "@/schema/doc";
import OdsAssetRenderer from "../OdsAssetRenderer";
import { titleLayoutOf } from "./SectionTitleBlock";

const HERO_BG_STYLE: CSSProperties = {
  backgroundImage:
    "linear-gradient(180deg, rgb(196, 232, 250) 0%, rgba(247, 249, 250, 0) 40%), linear-gradient(90deg, rgb(245, 245, 245) 0%, rgb(245, 245, 245) 100%)",
};
const BALANCE: CSSProperties = { textWrap: "balance" } as CSSProperties;

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
  const isMobile = viewport === "mobile";
  const split = titleLayoutOf(section) === "split";

  const visual = (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden",
        split
          ? isMobile
            ? "h-[180px] w-full max-w-[270px]"
            : "h-[240px] w-[360px]"
          : "h-[150px] w-full max-w-[225px]"
      )}
    >
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
  );

  const ctas = (
    <div className={cn("flex flex-col gap-2", split ? (isMobile ? "w-full items-stretch" : "w-[300px] items-stretch") : "w-full max-w-[300px] items-stretch")}>
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
  );

  const textBlock = (
    <div
      className={cn(
        "flex w-full flex-col gap-2 tracking-[-0.3px]",
        split ? "items-start text-left" : "items-center text-center"
      )}
    >
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
        style={BALANCE}
      >
        {title}
      </div>
      {subtitle ? (
        <p className="w-full text-[15px] font-medium leading-6 text-ods-text-secondary">
          {subtitle}
        </p>
      ) : null}
    </div>
  );

  if (split) {
    return (
      <div className="flex w-full flex-col items-center pb-2.5 pt-[30px] text-ods-text-primary" style={HERO_BG_STYLE}>
        <div
          className={cn(
            "flex w-full px-5",
            isMobile ? "max-w-[343px] flex-col gap-6" : "max-w-[1000px] flex-row items-center justify-between gap-10 py-6"
          )}
        >
          <div className={cn("flex min-w-0 flex-col gap-6", isMobile ? "w-full" : "flex-1")}>
            {textBlock}
            {ctas}
          </div>
          <div className={cn("flex shrink-0", isMobile ? "w-full justify-center" : "justify-end")}>{visual}</div>
        </div>
        <div className="flex size-6 shrink-0 items-center justify-center text-ods-text-primary" aria-hidden>
          <IconChevronDown size={20} />
        </div>
      </div>
    );
  }

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
          {textBlock}
          {visual}
          {ctas}
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
