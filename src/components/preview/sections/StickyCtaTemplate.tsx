"use client";

/**
 * 하단 고정 CTA.
 *
 * 동작 스펙 (2026-10):
 * - ATF(히어로) 영역이 화면에 있는 동안은 숨김 — 히어로 하단이 뷰포트 위로 지나가면 노출
 * - 노출/숨김은 translateY + opacity 트랜지션 (240ms ease-out, reduced-motion 시 즉시)
 * - 배경: 아래로 갈수록 흰색이 짙어지는 dim 그라데이션 (콘텐츠가 버튼 뒤로 비쳐 보이되 가독성 유지)
 * - 폭: 모바일 100%, 태블릿·PC 는 max-width 480 중앙 정렬
 *
 * 빌더 프리뷰에서는 아래 effect 가, 정적 export(page.html)에서는 하네스 page 스크립트가 같은 규칙으로 data-visible 을 토글한다.
 */

import { useEffect, useRef } from "react";

import type { Section } from "@/schema/doc";

export const STICKY_CTA_HEIGHT_PX = 76;

export default function StickyCtaTemplate({ section }: { section: Section }) {
  const label = (section.props["label"] as string) ?? "버튼";
  const href = (section.props["href"] as string) || "#";
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = el.closest<HTMLElement>("[data-viewport]") ?? document.body;
    const hero = root.querySelector<HTMLElement>('[data-preset="hero"], [data-section-preset="hero"]');
    if (!hero) {
      el.dataset.visible = "true";
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const past = hero.getBoundingClientRect().bottom <= 0;
      el.dataset.visible = past ? "true" : "false";
      el.setAttribute("aria-hidden", past ? "false" : "true");
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      {/* 고정 바가 가리는 만큼 문서 흐름에 여백을 둔다 (푸터가 버튼 뒤에 숨지 않게) */}
      <div aria-hidden style={{ height: STICKY_CTA_HEIGHT_PX }} />
      <div
        ref={ref}
        data-sticky-cta
        data-visible="false"
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-4 pt-10 transition-[transform,opacity] duration-[240ms] ease-out data-[visible=false]:translate-y-full data-[visible=false]:opacity-0 data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100 motion-reduce:transition-none"
        style={{
          paddingBottom: "max(16px, env(safe-area-inset-bottom, 0px))",
          backgroundImage:
            "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.86) 36%, rgba(255,255,255,0.98) 100%)",
        }}
      >
        <a
          href={href}
          className="pointer-events-auto block w-full max-w-[480px] rounded-ods-8 bg-ods-primary py-[15px] text-center text-[16px] font-semibold leading-5 tracking-[-0.3px] text-white shadow-[0_6px_20px_rgba(0,161,255,0.28)]"
        >
          {label}
        </a>
      </div>
    </>
  );
}
