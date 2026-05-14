"use client";

import type { Section } from "@/schema/doc";

export default function StickyCtaTemplate({ section }: { section: Section }) {
  const label = (section.props["label"] as string) ?? "버튼";
  return (
    <div className="sticky bottom-0 z-10 border-t border-ods-border bg-white px-4 py-3">
      <button className="w-full rounded-ods-8 bg-ods-primary py-3 text-[14px] font-semibold text-white">
        {label}
      </button>
    </div>
  );
}
