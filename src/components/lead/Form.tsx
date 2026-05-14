"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { IconCheck, IconChevronRight } from "./icons";
import { formCopy } from "./data";

export function Form() {
  const [selected, setSelected] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);

  const ctaEnabled = useMemo(
    () => selected.length > 0 && name.trim().length > 0 && phone.trim().length > 0,
    [selected, name, phone]
  );

  const toggleOption = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <section
      aria-label="상담 신청 폼"
      className="flex w-full items-center justify-center bg-white px-4 py-[60px] md:px-10"
    >
      <div className="flex w-full max-w-[480px] flex-col gap-6">
        <header className="flex flex-col items-center gap-2 text-center tracking-[-0.3px]">
          <h2 className="font-pretendard text-[24px] font-semibold leading-8 text-ods-text-primary">
            {formCopy.title}
          </h2>
          <p className="font-pretendard text-[15px] leading-6 text-ods-text-tertiary">
            {formCopy.sub}
          </p>
        </header>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-[10px]">
            <p className="font-pretendard text-[14px] font-medium leading-[18px] tracking-[-0.3px] text-[#828c94]">
              {formCopy.selectGroupLabel}
            </p>
            <div className="flex w-full gap-1">
              {formCopy.options.map((opt) => {
                const isSelected = selected.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleOption(opt.id)}
                    aria-pressed={isSelected}
                    className={clsx(
                      "relative flex min-w-[148px] flex-1 flex-col items-center justify-center overflow-hidden rounded-ods-8 bg-white",
                      isSelected
                        ? "border-[1.5px] border-ods-text-primary p-[13.5px]"
                        : "border border-ods-border p-[13px]"
                    )}
                  >
                    <span
                      aria-hidden
                      className={clsx(
                        "absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-[6px]",
                        isSelected
                          ? "bg-ods-text-primary"
                          : "border border-ods-border bg-white"
                      )}
                    >
                      {isSelected ? (
                        <IconCheck className="h-3 w-3 text-white" />
                      ) : null}
                    </span>
                    <img
                      src={opt.image}
                      alt=""
                      aria-hidden
                      className="h-[60px] w-[60px] object-contain"
                    />
                    <span className="mt-2 font-pretendard text-[16px] font-medium leading-5 tracking-[-0.3px] text-ods-text-primary">
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {formCopy.inputs.map((field) => (
            <label key={field.id} className="flex flex-col gap-2">
              <span className="font-pretendard text-[14px] font-medium leading-[18px] tracking-[-0.3px] text-ods-text-primary">
                {field.label}
              </span>
              <input
                type={field.id === "phone" ? "tel" : "text"}
                value={field.id === "name" ? name : phone}
                onChange={(e) =>
                  field.id === "name" ? setName(e.target.value) : setPhone(e.target.value)
                }
                placeholder={field.placeholder}
                inputMode={field.id === "phone" ? "numeric" : undefined}
                className="h-10 w-full rounded-ods-8 border border-ods-border bg-white px-3 font-pretendard text-[14px] leading-5 tracking-[-0.3px] text-ods-text-primary placeholder:text-ods-text-tertiary focus:border-ods-text-primary focus:outline-none"
              />
            </label>
          ))}

          <label className="inline-flex w-fit cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="peer sr-only"
            />
            <span
              aria-hidden
              className={clsx(
                "flex h-5 w-5 items-center justify-center transition-colors",
                consent
                  ? "rounded-[4px] bg-ods-text-primary"
                  : "rounded-[6px] border border-ods-border bg-white"
              )}
            >
              {consent ? <IconCheck className="h-3 w-3 text-white" /> : null}
            </span>
            <span className="font-pretendard text-[14px] leading-[18px] tracking-[-0.3px] text-ods-text-primary">
              {formCopy.consentLabel}
            </span>
          </label>
        </div>

        <div className="flex flex-col items-center gap-4">
          <button
            type="submit"
            disabled={!ctaEnabled}
            className={clsx(
              "h-14 w-full rounded-ods-12 font-pretendard text-[16px] font-semibold leading-6 tracking-[-0.3px] transition-colors",
              ctaEnabled
                ? "bg-ods-primary text-white"
                : "cursor-not-allowed bg-ods-border-light text-[#c1c1c1]"
            )}
          >
            {formCopy.ctaLabel}
          </button>
          <a
            href="#privacy"
            className="inline-flex items-center gap-1 font-pretendard text-[14px] leading-[18px] tracking-[-0.3px] text-ods-text-tertiary"
          >
            {formCopy.privacyLabel}
            <IconChevronRight className="h-4 w-4" aria-hidden />
          </a>
        </div>
      </div>
    </section>
  );
}
