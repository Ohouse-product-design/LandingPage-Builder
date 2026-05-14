import { stickyCtaLabel } from "./data";

export function StickyButton() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex w-full justify-center bg-gradient-to-b from-[rgba(246,247,250,0)] to-[#f6f7fa] p-4 backdrop-blur-[10px]">
      <button
        type="button"
        className="pointer-events-auto h-[50px] w-full max-w-[400px] rounded-ods-4 bg-ods-primary font-pretendard text-[16px] font-bold leading-5 tracking-[-0.3px] text-white"
      >
        {stickyCtaLabel}
      </button>
    </div>
  );
}
