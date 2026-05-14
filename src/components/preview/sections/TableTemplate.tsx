"use client";

import { cn } from "@/lib/cn";
import type { Section } from "@/schema/doc";
import SectionTitleBlock, { containerPad } from "./SectionTitleBlock";

export default function TableTemplate({ section }: { section: Section }) {
  const rows = section.slots["rows"] ?? [];
  const headers = (section.props["colHeaders"] as string[]) ?? ["A", "B", "C"];
  return (
    <div className={cn(containerPad, "bg-ods-surface-light")}>
      <SectionTitleBlock section={section} />
      <div className="overflow-hidden rounded-ods-12 border border-ods-border bg-white">
        <div className="grid grid-cols-4 border-b border-ods-border bg-ods-surface-gray text-ods-caption font-semibold text-ods-text-secondary">
          <div className="p-3">항목</div>
          {headers.map((h, i) => (
            <div key={i} className="p-3 text-center">
              {h}
            </div>
          ))}
        </div>
        {rows.map((r) => (
          <div
            key={r.id}
            className="grid grid-cols-4 border-b border-ods-border-light text-ods-body-md last:border-0"
          >
            <div className="p-3 font-medium text-ods-text-primary">
              {(r.props["label"] as string) ?? ""}
            </div>
            <div className="p-3 text-center text-ods-text-tertiary">
              {(r.props["colA"] as string) ?? "—"}
            </div>
            <div className="p-3 text-center font-semibold text-ods-primary">
              {(r.props["colB"] as string) ?? "—"}
            </div>
            <div className="p-3 text-center font-semibold text-ods-responsibility-green">
              {(r.props["colC"] as string) ?? "—"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
