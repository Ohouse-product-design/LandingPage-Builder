"use client";

import type { Section } from "@/schema/doc";

export default function SectionTitleBlock({ section }: { section: Section }) {
  const sub = section.props["sectionSubtitle"] as string | undefined;
  const main = section.props["sectionTitle"] as string | undefined;
  if (!sub && !main) return null;
  return (
    <div className="mb-6 md:mb-10">
      {sub && (
        <div className="mb-1 text-ods-body-lg text-ods-text-tertiary">{sub}</div>
      )}
      {main && (
        <div className="whitespace-pre-line text-ods-display-md font-semibold text-ods-text-primary md:text-ods-display-lg">
          {main}
        </div>
      )}
    </div>
  );
}

export const containerPad =
  "px-5 py-8 md:px-10 md:py-12 lg:px-[120px] lg:py-[60px]";
