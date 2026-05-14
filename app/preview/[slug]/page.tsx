import PreviewRenderer from "@/components/preview/PreviewRenderer";
import { seedDoc } from "@/lib/seed";

/**
 * 프리뷰 iframe이 로드하는 페이지.
 * 실제 구현에서는 slug로 DB/스토어에서 LandingPageDoc을 조회하지만,
 * 1차 골격에서는 seed 데이터를 그대로 사용한다.
 */
export default function PreviewPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { viewport?: "mobile" | "tablet" | "desktop"; selected?: string };
}) {
  const viewport = searchParams.viewport ?? "desktop";
  const selectedId = searchParams.selected;

  return (
    <PreviewRenderer
      doc={seedDoc}
      viewport={viewport}
      selectedSectionId={selectedId}
    />
  );
}
