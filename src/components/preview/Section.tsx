"use client";

/**
 * 통합 Section 컴포넌트.
 *
 * preset 별로 분리된 Template 들을 단일 진입점으로 dispatch.
 * - 빌더의 PreviewRenderer 가 섹션마다 이걸 호출
 * - Storybook 의 Section.stories 가 preset prop 으로 모든 변형을 한 자리에서 컨트롤
 *
 *   <Section section={section} viewport={viewport} />
 */

import type { Section as SectionData, Viewport } from "@/schema/doc";
import type { SectionPresetId } from "@/schema/section-presets";
import CardSectionTemplate from "./sections/CardSectionTemplate";
import CtaFormTemplate from "./sections/CtaFormTemplate";
import FooterTemplate from "./sections/FooterTemplate";
import HeaderTemplate from "./sections/HeaderTemplate";
import HeroTemplate from "./sections/HeroTemplate";
import StickyCtaTemplate from "./sections/StickyCtaTemplate";
import TableTemplate from "./sections/TableTemplate";

interface Props {
  section: SectionData;
  viewport: Viewport;
}

export default function Section({ section, viewport }: Props) {
  const renderers: Record<SectionPresetId, () => JSX.Element> = {
    header: () => <HeaderTemplate section={section} />,
    hero: () => <HeroTemplate section={section} viewport={viewport} />,
    usp: () => (
      <CardSectionTemplate section={section} viewport={viewport} bg="white" />
    ),
    table: () => <TableTemplate section={section} />,
    coverage: () => (
      <CardSectionTemplate section={section} viewport={viewport} bg="white" badge />
    ),
    review: () => (
      <CardSectionTemplate section={section} viewport={viewport} bg="gray" />
    ),
    process: () => (
      <CardSectionTemplate section={section} viewport={viewport} bg="white" />
    ),
    "cross-sell": () => (
      <CardSectionTemplate section={section} viewport={viewport} bg="gray" />
    ),
    "cta-form": () => <CtaFormTemplate section={section} />,
    "sticky-cta": () => <StickyCtaTemplate section={section} />,
    footer: () => <FooterTemplate section={section} />,
  };
  return renderers[section.preset]();
}
