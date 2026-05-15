import { uspCopy } from "./data";

export function USP() {
  return (
    <section
      aria-label="USP"
      className="flex w-full items-center justify-center bg-[#f6f7fa] px-4 py-[60px] md:px-10"
    >
      <div className="flex w-full max-w-[976px] flex-col items-center gap-8">
        <h2 className="font-pretendard text-[24px] font-semibold leading-8 tracking-[-0.3px] text-ods-text-primary">
          {uspCopy.title}
        </h2>
        <div className="flex w-full justify-center gap-2 mobile:flex-col mobile:items-center tablet:flex-row desktop:flex-row">
          {uspCopy.cards.map((card) => (
            <article
              key={card.title}
              className="relative aspect-[3/4] w-full max-w-[240px] overflow-hidden rounded-ods-12"
              style={{
                backgroundImage:
                  "linear-gradient(155.829deg, rgba(239,239,239,0.2) 1.049%, rgba(147,184,210,0.2) 99.182%), linear-gradient(90deg, rgb(245,245,245) 0%, rgb(245,245,245) 100%)",
              }}
            >
              <img
                src={card.image}
                alt=""
                aria-hidden
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/50" />

              {card.footnote ? (
                <div className="absolute bottom-[60px] left-0 w-full px-5 text-left font-pretendard text-[10px] leading-[14px] tracking-[-0.3px] text-white/70">
                  {card.footnote}
                </div>
              ) : null}

              <div className="absolute bottom-0 left-0 w-full px-5 pb-3 pt-2 text-right font-pretendard text-[10px] font-medium leading-[14px] tracking-[-0.3px] text-white/40">
                AI Generated
              </div>

              <div className="absolute bottom-[24px] left-0 w-full px-5 pb-2 text-white">
                <h3 className="font-pretendard text-[20px] font-semibold leading-7 tracking-[-0.3px]">
                  {card.title}
                </h3>
                <p className="mt-1.5 font-pretendard text-[15px] leading-6 tracking-[-0.3px]">
                  {card.body.map((line, i) => (
                    <span key={i} className="block">
                      {line}
                    </span>
                  ))}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
