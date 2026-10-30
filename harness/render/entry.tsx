/**
 * SSR 엔트리 — 빌더 프리뷰와 "같은 React 컴포넌트"로 LandingPageDoc 을 정적 마크업으로 굽는다.
 * (패턴 일관성의 핵심: HTML 을 LLM 이 쓰지 않고, 디자이너가 승인한 컴포넌트가 쓴다)
 */
import { renderToStaticMarkup } from "react-dom/server";
import Section from "@/components/preview/Section";
import type { LandingPageDoc, Viewport } from "@/schema/doc";

/** 섹션 안 카드 레이아웃 종류 — 캐로셀이 아닌 콘텐츠 컨테이너는 데스크톱 max-width 720 (2026-10) */
function sectionLayout(s: LandingPageDoc["sections"][number]): string {
  const insts = Object.values((s as { slots?: Record<string, unknown[]> }).slots ?? {}).flat() as { props?: { layout?: { type?: string } } }[];
  return insts.some((i) => i?.props?.layout?.type === "carousel") ? "carousel" : "content";
}
export function renderSections(doc: LandingPageDoc, viewport: Viewport): string {
  return doc.sections
    .filter((s) => s.visibility?.[viewport] !== false)
    .map(
      (s) =>
        `<section data-section-id="${s.id}" data-preset="${s.preset}" data-layout="${sectionLayout(s)}" aria-label="${(s.name || s.preset).replace(/"/g, "&quot;")}">` +
        renderToStaticMarkup(<Section section={s} viewport={viewport} />) +
        `</section>`
    )
    .join("\n");
}
export { seedDoc } from "@/lib/seed";
export { FOOTER_ASSET } from "@/components/preview/sections/footer-mcp-assets";
