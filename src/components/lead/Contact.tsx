import { IconBubbleRight, IconPhoneFilled } from "./icons";
import { contactCopy } from "./data";

export function Contact() {
  return (
    <section
      aria-label="Contact"
      className="flex w-full flex-col items-center overflow-hidden bg-white px-4 pb-[80px] pt-[60px] md:px-10 md:pb-[120px]"
    >
      <h2 className="text-center font-pretendard text-[24px] font-semibold leading-8 tracking-[-0.3px] text-ods-text-primary">
        <span className="block">{contactCopy.titleLine1}</span>
        <span className="block">{contactCopy.titleLine2}</span>
      </h2>
      <div className="mt-8 flex w-full items-center justify-center gap-1 mobile:flex-col tablet:flex-row desktop:flex-row">
        {contactCopy.buttons.map((b) => (
          <button
            key={b.id}
            type="button"
            className="flex h-12 w-[198px] items-center justify-center gap-2 rounded-ods-12 border border-ods-border bg-white px-4 font-pretendard text-[14px] font-semibold leading-5 tracking-[-0.3px] text-ods-text-primary"
          >
            {b.icon === "phone" ? (
              <IconPhoneFilled className="h-[18px] w-[18px]" />
            ) : (
              <IconBubbleRight className="h-[18px] w-[18px]" />
            )}
            {b.label}
          </button>
        ))}
      </div>
      <p className="mt-8 whitespace-nowrap text-center font-pretendard text-[15px] leading-6 tracking-[-0.3px] text-ods-text-tertiary">
        {contactCopy.hours}
      </p>
    </section>
  );
}
