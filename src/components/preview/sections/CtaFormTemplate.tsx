"use client";

import { cn } from "@/lib/cn";
import type { Section } from "@/schema/doc";
import SectionTitleBlock, { containerPad } from "./SectionTitleBlock";

export default function CtaFormTemplate({ section }: { section: Section }) {
  const fields = section.slots["fields"] ?? [];
  const submit = (section.props["submitLabel"] as string) ?? "신청";
  return (
    <div className={cn(containerPad, "bg-ods-surface-light")}>
      <SectionTitleBlock section={section} />
      <div className="rounded-ods-12 bg-white p-5">
        {fields.length === 0 ? (
          <div className="rounded-ods-8 border border-dashed border-ods-border p-6 text-center text-ods-body-md text-ods-text-tertiary">
            폼 필드를 추가해주세요
          </div>
        ) : (
          fields.map((f) => (
            <div key={f.id} className="mb-3">
              <div className="mb-1 text-ods-caption text-ods-text-secondary">
                {(f.props["label"] as string) ?? ""}
              </div>
              <div className="h-10 rounded-ods-8 border border-ods-border bg-white px-3 text-ods-body-md leading-10 text-ods-text-tertiary">
                {(f.props["placeholder"] as string) ?? ""}
              </div>
            </div>
          ))
        )}
        <button className="mt-2 w-full rounded-ods-8 bg-ods-primary py-3 text-[14px] font-semibold text-white">
          {submit}
        </button>
      </div>
    </div>
  );
}
