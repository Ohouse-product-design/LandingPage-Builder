"use client";

import { cn } from "@/lib/cn";
import type { Section, Viewport } from "@/schema/doc";

export default function HeroTemplate({
  section,
  viewport,
}: {
  section: Section;
  viewport: Viewport;
}) {
  const title = (section.props["title"] as string) ?? "메인 카피";
  const subtitle = (section.props["subtitle"] as string) ?? "";
  const cta1 = (section.props["primaryCtaLabel"] as string) ?? "버튼";
  const cta2 = section.props["secondaryCtaLabel"] as string | undefined;
  return (
    <div
      className={cn(
        "bg-ods-surface-gray",
        viewport === "desktop"
          ? "flex items-center gap-12 px-[120px] py-[60px]"
          : "flex flex-col gap-6 px-5 py-10"
      )}
    >
      <div className="flex-1">
        <div className="whitespace-pre-line text-ods-display-md text-ods-text-primary md:text-ods-display-lg">
          {title}
        </div>
        {subtitle && (
          <div className="mt-3 text-ods-body-lg text-ods-text-secondary">
            {subtitle}
          </div>
        )}
        <div className="mt-6 flex gap-2">
          <button className="rounded-ods-8 bg-ods-primary px-5 py-3 text-[14px] font-semibold text-white">
            {cta1}
          </button>
          {cta2 && (
            <button className="rounded-ods-8 border border-ods-border px-5 py-3 text-[14px] font-semibold text-ods-text-primary">
              {cta2}
            </button>
          )}
        </div>
      </div>
      <div className="flex h-[180px] w-full flex-1 items-center justify-center rounded-ods-12 bg-ods-surface-light text-[10px] text-ods-text-tertiary md:h-[280px]">
        🖼 Hero Image
      </div>
    </div>
  );
}
