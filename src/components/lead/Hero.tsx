import { IconChevronDown, OhouseLogo } from "./icons";
import { heroCopy } from "./data";

export function Hero() {
  return (
    <section
      aria-label="Hero"
      className="relative w-full overflow-hidden mobile:h-[304px] tablet:h-[346px] desktop:h-[346px] text-white"
    >
      <img
        src="/lead/hero.png"
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/30 mix-blend-darken" />
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(51,76,98,0.5)] to-[rgba(86,108,127,0)] mix-blend-darken" />

      <OhouseLogo
        aria-label="오늘의집"
        className="absolute left-5 top-5 h-5 w-[70.66px] text-white"
      />

      <div className="relative z-10 mx-auto flex h-full max-w-[1024px] flex-col items-center px-5 pt-[88px] mobile:pt-[80px] tablet:px-10 tablet:pt-[100px] desktop:px-10 desktop:pt-[100px] text-center">
        <h1
          className="font-pretendard font-semibold tracking-[-0.3px] mobile:text-[28px] mobile:leading-[36px] tablet:text-[36px] tablet:leading-[45px] desktop:text-[36px] desktop:leading-[45px]"
        >
          <span className="block text-[#e2f5ff]">{heroCopy.titleLine1}</span>
          <span className="block">{heroCopy.titleLine2}</span>
        </h1>
        <p className="mt-2 font-pretendard text-[15px] font-medium leading-6 tracking-[-0.3px]">
          {heroCopy.sub}
        </p>

        <div className="mt-auto flex w-full justify-center pb-5">
          <IconChevronDown className="h-6 w-6 text-white" aria-hidden />
        </div>
      </div>
    </section>
  );
}
