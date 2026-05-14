"use client";

import type { Section } from "@/schema/doc";

export default function HeaderTemplate({ section }: { section: Section }) {
  const logo = (section.props["logoText"] as string) ?? "오늘의집";
  return (
    <header className="flex h-14 items-center justify-between border-b border-ods-border px-4 md:px-10">
      <div className="text-ods-title-md font-semibold text-ods-text-primary">
        {logo}
      </div>
      <nav className="flex gap-4 text-[12px] text-ods-text-secondary">
        <span>이사</span>
        <span>렌탈</span>
        <span>인테리어</span>
      </nav>
    </header>
  );
}
