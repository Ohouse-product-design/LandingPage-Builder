/**
 * Lead preset variants — `app/lead/page.tsx` 의 섹션 컴포넌트를
 * 빌더 프리뷰의 Section dispatcher 가 호출할 수 있는 형태로 래핑.
 *
 * Section data 는 받지만 현재 변형들은 하드코딩된 카피(data.ts)를 사용한다.
 * 빌더에서는 SectionTree 의 「마케팅 풀페이지 UI」 추가 메뉴와 동일한 화면을 보여주는 용도.
 */

import { Hero as LeadHero } from "@/components/lead/Hero";
import { Form as LeadForm } from "@/components/lead/Form";
import { USP as LeadUSP } from "@/components/lead/USP";
import { Process as LeadProcess } from "@/components/lead/Process";
import { Review as LeadReview } from "@/components/lead/Review";
import { Contact as LeadContact } from "@/components/lead/Contact";
import { StickyButton as LeadStickyButton } from "@/components/lead/StickyButton";

export function LeadHeroVariant() {
  return <LeadHero />;
}

export function LeadFormVariant() {
  return <LeadForm />;
}

export function LeadUSPVariant() {
  return <LeadUSP />;
}

export function LeadProcessVariant() {
  return <LeadProcess />;
}

export function LeadReviewVariant() {
  return <LeadReview />;
}

export function LeadContactVariant() {
  return <LeadContact />;
}

export function LeadStickyCtaVariant() {
  return <LeadStickyButton />;
}
