"use client";

import { cn } from "@/lib/cn";
import type { CardProps } from "@/schema/card";
import type { ComponentInstance, Section, Viewport } from "@/schema/doc";
import Card from "../Card";
import SectionTitleBlock, { containerPad } from "./SectionTitleBlock";

export type CardSectionBg = "white" | "gray" | "light";

function getCardProps(instance: ComponentInstance | undefined): CardProps | null {
  if (!instance || instance.preset !== "card") return null;
  return instance.props as unknown as CardProps;
}

export default function CardSectionTemplate({
  section,
  viewport,
  bg,
  badge = false,
}: {
  section: Section;
  viewport: Viewport;
  bg: CardSectionBg;
  badge?: boolean;
}) {
  const cardInstance = (section.slots["content"] ?? [])[0];
  const cardProps = getCardProps(cardInstance);
  const bgClass =
    bg === "white"
      ? "bg-white"
      : bg === "gray"
        ? "bg-ods-surface-gray"
        : "bg-ods-surface-light";
  const badgeLabel = badge
    ? ((section.props["badgeLabel"] as string) ?? "책임보장")
    : null;

  return (
    <div className={cn(containerPad, bgClass)}>
      <SectionTitleBlock section={section} />
      {badgeLabel && (
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-ods-16 bg-ods-gradient-responsibility px-3 py-1 text-ods-caption font-semibold text-white">
          ✓ {badgeLabel}
        </div>
      )}
      {cardProps ? (
        <Card
          usage={cardProps.usage}
          layout={cardProps.layout}
          cells={cardProps.cells}
          viewport={viewport}
        />
      ) : (
        <div className="rounded-ods-8 border border-dashed border-ods-border p-6 text-center text-ods-body-md text-ods-text-tertiary">
          카드 컨테이너가 비어있습니다 — 인스펙터에서 추가하세요
        </div>
      )}
    </div>
  );
}
