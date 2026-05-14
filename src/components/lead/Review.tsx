"use client";

import { useRef, useState } from "react";
import clsx from "clsx";
import { IconChevronLeft, IconChevronRight } from "./icons";
import { reviewCopy } from "./data";

export function Review() {
  const [tab, setTab] = useState(reviewCopy.tabs[0].id);
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 294, behavior: "smooth" });
  };

  return (
    <section
      aria-label="Review"
      className="flex w-full flex-col items-center overflow-hidden bg-[#f6f7fa] px-4 py-[60px] md:px-10"
    >
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-center font-pretendard text-[24px] font-semibold leading-8 tracking-[-0.3px] text-ods-text-primary">
          <span className="block">{reviewCopy.titleLine1}</span>
          <span className="block">{reviewCopy.titleLine2}</span>
        </h2>
        <div role="tablist" className="flex h-11 items-center rounded-full bg-white p-1">
          {reviewCopy.tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={clsx(
                "h-9 rounded-full px-6 font-pretendard text-[14px] font-medium leading-[18px] tracking-[-0.3px] transition-colors",
                tab === t.id
                  ? "bg-ods-text-primary text-white"
                  : "text-ods-text-tertiary"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-[30px] w-full max-w-[976px]">
        <div
          ref={trackRef}
          className="no-scrollbar flex w-full snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth"
        >
          {reviewCopy.cards.map((c, i) => (
            <article
              key={i}
              className="flex h-[200px] w-[286px] shrink-0 snap-start flex-col gap-5 rounded-ods-12 bg-white p-4"
            >
              <div className="flex w-full gap-3">
                <div className="flex flex-1 flex-col gap-1.5 tracking-[-0.3px]">
                  <h3 className="font-pretendard text-[16px] font-semibold leading-5 text-ods-text-primary">
                    {c.headline.map((line, idx) => (
                      <span key={idx} className="block">
                        {line}
                      </span>
                    ))}
                  </h3>
                  <div className="flex items-center gap-1 whitespace-nowrap font-pretendard text-[12px] font-medium">
                    {c.meta.map((m, idx) => (
                      <span key={idx} className="text-ods-text-tertiary">
                        {idx > 0 ? " · " : ""}
                        {m}
                      </span>
                    ))}
                    <span className="text-[#c1c1c1]">|</span>
                    <span className="text-ods-text-tertiary">{c.author}</span>
                  </div>
                </div>
                <img
                  src={c.photo}
                  alt=""
                  aria-hidden
                  className="h-12 w-12 rounded-[10px] object-cover"
                />
              </div>
              <p className="font-pretendard text-[14px] leading-5 tracking-[-0.3px] text-ods-text-primary line-clamp-3">
                {c.body}
                <span className="font-semibold">{c.bodyHighlight}</span>
                {c.bodyTail}
              </p>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-[30px] flex items-center justify-center gap-2">
        <button
          type="button"
          aria-label="이전 후기"
          onClick={() => scrollBy(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-black/5 bg-white"
        >
          <IconChevronLeft className="h-4 w-4 text-ods-text-primary" />
        </button>
        <button
          type="button"
          aria-label="다음 후기"
          onClick={() => scrollBy(1)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-black/5 bg-white"
        >
          <IconChevronRight className="h-4 w-4 text-ods-text-primary" />
        </button>
      </div>
    </section>
  );
}
