import { processCopy } from "./data";

type IllustrationKind = "chip" | "chat" | "tech" | "gift";

function Illustration({ kind }: { kind: IllustrationKind }) {
  if (kind === "chip") {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <span className="rounded-ods-12 bg-ods-primary px-8 py-4 font-pretendard text-[16px] font-semibold leading-6 tracking-[-0.3px] text-white">
          상담 신청하기
        </span>
      </div>
    );
  }
  if (kind === "chat") {
    return (
      <div className="relative h-full w-full">
        <div className="absolute left-2 top-[29px] rounded-tl-ods-12 rounded-tr-ods-12 rounded-br-ods-12 rounded-bl-[4px] bg-[#ffe97e] px-2 py-2.5">
          <span className="font-pretendard text-[14px] leading-[18px] tracking-[-0.3px] text-ods-text-primary">
            1인가구 요금제 추천해주세요
          </span>
        </div>
        <div className="absolute right-2 top-[74px] w-[168px] rounded-tl-ods-12 rounded-tr-ods-12 rounded-br-[4px] rounded-bl-ods-12 bg-white px-2.5 py-2.5 shadow-sm">
          <span className="font-pretendard text-[14px] leading-[18px] tracking-[-0.3px] text-ods-text-primary">
            웹서핑, 동영상 시청 위주면, 100MB 상품으로 충분해요!
          </span>
        </div>
      </div>
    );
  }
  if (kind === "tech") {
    return (
      <div className="relative h-full w-full">
        <div className="absolute left-1/2 top-1/2 w-[168px] -translate-x-1/2 -translate-y-1/2 rounded-ods-12 bg-white p-4 text-center shadow-sm">
          <span className="font-pretendard text-[14px] font-medium leading-[18px] tracking-[-0.3px] text-ods-text-primary">
            기사님이 9시
            <br />
            방문 예정이에요
          </span>
        </div>
        <img
          src="/lead/process-tech.png"
          alt=""
          aria-hidden
          className="absolute -right-2 bottom-0 h-[100px] w-[100px] object-contain"
        />
      </div>
    );
  }
  // gift
  return (
    <div className="relative h-full w-full">
      <div className="absolute left-1/2 top-1/2 w-[168px] -translate-x-1/2 -translate-y-1/2 rounded-ods-12 bg-white p-4 text-center shadow-sm">
        <span className="font-pretendard text-[14px] font-medium leading-[18px] tracking-[-0.3px] text-ods-text-primary">
          설치 당일 사은품 지급 완료!
        </span>
      </div>
      <img
        src="/lead/process-gift.png"
        alt=""
        aria-hidden
        className="absolute -right-2 bottom-0 h-[100px] w-[100px] object-contain"
      />
    </div>
  );
}

export function Process() {
  return (
    <section
      aria-label="Process"
      className="flex w-full flex-col items-center bg-white px-4 py-[60px] md:px-10"
    >
      <h2 className="font-pretendard text-[24px] font-semibold leading-8 tracking-[-0.3px] text-ods-text-primary text-center">
        <span className="block">{processCopy.titleLine1}</span>
        <span className="block">{processCopy.titleLine2}</span>
      </h2>
      <div
        className="mt-[30px] grid w-full max-w-[976px] gap-2
                   mobile:grid-cols-1
                   tablet:grid-cols-2
                   desktop:grid-cols-4"
      >
        {processCopy.cards.map((card) => (
          <article
            key={card.id}
            className="flex h-[300px] w-full flex-col rounded-ods-12 px-5 pb-5"
            style={{
              backgroundImage:
                "linear-gradient(169.574deg, rgba(239,239,239,0.2) 1.5877%, rgba(139,195,235,0.2) 92.346%), linear-gradient(90deg, rgb(245,245,245) 0%, rgb(245,245,245) 100%)",
            }}
          >
            <div className="relative h-[200px] w-full">
              <Illustration kind={card.illustration as IllustrationKind} />
            </div>
            <div className="mt-auto flex w-full flex-col gap-1 text-ods-text-primary">
              <h3 className="font-pretendard text-[20px] font-semibold leading-7 tracking-[-0.3px] opacity-80">
                {card.title}
              </h3>
              <p className="font-pretendard text-[15px] leading-6 tracking-[-0.3px] opacity-80">
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
    </section>
  );
}
