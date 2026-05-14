"use client";

import type { Section } from "@/schema/doc";

export default function FooterTemplate({ section }: { section: Section }) {
  const copy = (section.props["copyright"] as string) ?? "© 2026";
  return (
    <footer className="bg-[#1A1A1A] px-5 py-8 text-[11px] text-white/60 md:px-10">
      <div className="mb-3 flex gap-4 text-white/80">
        <span>회사소개</span>
        <span>이용약관</span>
        <span>개인정보처리방침</span>
      </div>
      <div>{copy}</div>
    </footer>
  );
}
