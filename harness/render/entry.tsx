/**
 * SSR 엔트리 — 빌더 프리뷰와 "같은 React 컴포넌트"로 LandingPageDoc 을 정적 마크업으로 굽는다.
 * (패턴 일관성의 핵심: HTML 을 LLM 이 쓰지 않고, 디자이너가 승인한 컴포넌트가 쓴다)
 */
import { renderToStaticMarkup } from "react-dom/server";
import Section from "@/components/preview/Section";
import type { LandingPageDoc, Viewport } from "@/schema/doc";

export function renderSections(doc: LandingPageDoc, viewport: Viewport): string {
  return doc.sections
    .filter((s) => s.visibility?.[viewport] !== false)
    .map(
      (s) =>
        `<section data-section-id="${s.id}" data-preset="${s.preset}" aria-label="${(s.name || s.preset).replace(/"/g, "&quot;")}">` +
        renderToStaticMarkup(<Section section={s} viewport={viewport} />) +
        `</section>`
    )
    .join("\n");
}
export { seedDoc } from "@/lib/seed";
export { FOOTER_ASSET } from "@/components/preview/sections/footer-mcp-assets";
