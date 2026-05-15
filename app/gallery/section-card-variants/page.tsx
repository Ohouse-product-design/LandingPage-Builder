import type { Metadata } from "next";

import SectionCardVariantsGallery from "@/components/gallery/SectionCardVariantsGallery";

export const metadata: Metadata = {
  title: "Section & Card variants | Landing Page Builder",
  description:
    "section-presets 전체와 Card usage·layout 변형을 한 화면에서 확인합니다. Storybook Gallery 스토리와 동일한 내용입니다.",
};

export default function SectionCardVariantsPage() {
  return <SectionCardVariantsGallery />;
}
