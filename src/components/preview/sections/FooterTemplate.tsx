"use client";

/**
 * 이사-프로덕트 푸터 — Figma `Ohouse Footer` (node 440:366703, dev)
 * @see https://www.figma.com/design/O8dlcVJHtXfhuvZK3kAnEw/%EC%9D%B4%EC%82%AC-%ED%94%84%EB%A1%9C%EB%8D%95%ED%8A%B8?node-id=440-366703
 */

import { cn } from "@/lib/cn";
import { IconCheck, IconChevronRight } from "@bucketplace/icons";
import type { Section } from "@/schema/doc";

import { FOOTER_ASSET } from "./footer-mcp-assets";

function SocialIcon({
  outer,
  inner,
  innerClassName,
}: {
  outer: string;
  inner: string;
  innerClassName: string;
}) {
  return (
    <span className="relative inline-block size-6 shrink-0" aria-hidden>
      <img alt="" src={outer} className="absolute inset-[4.17%] size-[91.66%] object-contain" />
      <img alt="" src={inner} className={cn("absolute object-contain", innerClassName)} />
    </span>
  );
}

const LINK_COL_A = [
  "회사소개",
  "채용정보",
  "이용약관",
  "개인정보 처리방침",
  "공지사항",
  "안전거래센터",
] as const;
const LINK_COL_B = [
  "입점신청",
  "제휴/광고 문의",
  "시공파트너 안내",
  "파트너 개인정보 처리방침",
  "상품광고 소개",
  "고객의 소리",
] as const;

function LinkColumn({
  items,
  boldLabels,
}: {
  items: readonly string[];
  boldLabels: readonly string[];
}) {
  return (
    <div className="flex flex-col gap-5 text-[12px] leading-4 tracking-[-0.3px] text-[#2f3438]">
      {items.map((label) => (
        <a
          key={label}
          href="#"
          className={cn(
            "font-pretendard hover:underline",
            boldLabels.includes(label) ? "font-semibold" : "font-normal"
          )}
        >
          {label}
        </a>
      ))}
    </div>
  );
}

export default function FooterTemplate({ section }: { section: Section }) {
  const copyrightOverride = (section.props["copyright"] as string | undefined)?.trim();

  return (
    <footer className="w-full bg-[#f7f9fa] py-10 text-[#2f3438]">
      <div className="mx-auto max-w-[1280px] px-4 md:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-6">
          {/* 고객센터 */}
          <div className="flex min-w-0 flex-1 flex-col gap-5">
            <a
              href="#"
              className="inline-flex items-center gap-0.5 font-pretendard text-[18px] font-bold leading-6 tracking-[-0.3px] hover:underline"
            >
              고객센터
              <IconChevronRight size={12} className="text-[#2f3438]" aria-hidden />
            </a>
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-1.5 font-pretendard tracking-[-0.3px] text-[#2f3438]">
                <span className="text-[16px] font-bold leading-5">1670-0876</span>
                <span className="text-[14px] font-normal leading-5">09:00~18:00</span>
              </div>
              <ul className="space-y-0 font-pretendard text-[12px] leading-5 tracking-[-0.3px] text-[#2f3438]">
                <li className="relative pl-5">
                  <span className="absolute left-0 top-0 text-black">•</span>
                  평일: 전체 문의 상담
                </li>
                <li className="relative pl-5">
                  <span className="absolute left-0 top-0 text-black">•</span>
                  토요일, 공휴일: 오늘의집 직접배송, 이사/시공/제품설치 문의 상담
                </li>
                <li className="relative pl-5">
                  <span className="absolute left-0 top-0 text-black">•</span>
                  일요일: 휴무
                </li>
              </ul>
              <div className="flex flex-col gap-3 pt-1">
                <button
                  type="button"
                  className="inline-flex min-h-8 max-w-full items-center justify-center gap-1 rounded border border-[#e6e6e6] bg-white px-2 font-pretendard text-[14px] font-normal leading-5 tracking-[-0.3px] text-[#2f3438]"
                >
                  <IconCheck size={14} className="shrink-0" aria-hidden />
                  카톡 상담(평일 09:00~18:00)
                  <IconChevronRight size={14} className="shrink-0 opacity-80" aria-hidden />
                </button>
                <button
                  type="button"
                  className="inline-flex min-h-8 max-w-full items-center justify-center gap-1 rounded border border-[#e6e6e6] bg-white px-2 font-pretendard text-[14px] font-normal leading-5 tracking-[-0.3px] text-[#2f3438]"
                >
                  <IconCheck size={14} className="shrink-0" aria-hidden />
                  이메일 문의
                  <IconChevronRight size={14} className="shrink-0 opacity-80" aria-hidden />
                </button>
              </div>
            </div>
          </div>

          <div
            className="hidden shrink-0 bg-[#eaedef] lg:block lg:w-px"
            aria-hidden
          />
          <div className="h-px shrink-0 bg-[#eaedef] lg:hidden" aria-hidden />

          {/* 링크 2열 */}
          <div className="flex min-w-0 flex-1 gap-2 font-pretendard text-[12px] leading-4 tracking-[-0.3px] text-[#2f3438]">
            <div className="min-w-0 flex-1">
              <LinkColumn
                items={LINK_COL_A}
                boldLabels={["개인정보 처리방침"]}
              />
            </div>
            <div className="min-w-0 flex-1">
              <LinkColumn
                items={LINK_COL_B}
                boldLabels={["파트너 개인정보 처리방침"]}
              />
            </div>
          </div>
        </div>

        <div className="my-6 h-px w-full bg-[#eaedef]" aria-hidden />

        <div className="flex flex-col gap-3">
          <div className="font-pretendard text-[12px] leading-5 tracking-[-0.3px] text-[#828c94]">
            <p className="mb-0">
              (주)버킷플레이스 | 대표이사 이승재 | 서울 서초구 서초대로74길 4 삼성생명서초타워 25, 27층
              contact@bucketplace.net | 사업자등록번호 119-86-91245{" "}
              <a href="#" className="font-semibold text-[#828c94] hover:underline">
                사업자정보확인
              </a>
            </p>
            <p className="mt-0">통신판매업신고번호 제2018-서울서초-0580호</p>
          </div>
          <p className="font-pretendard text-[10px] leading-[14px] tracking-[-0.3px] text-[#828c94]">
            고객님이 현금결제한 금액에 대해 우리은행과 채무지급보증 계약을 체결하여 안전거래를 보장하고 있습니다.{" "}
            <a href="#" className="font-semibold hover:underline">
              서비스가입사실확인
            </a>
          </p>

          <div className="flex flex-wrap gap-1.5">
            <div className="flex h-10 max-w-full shrink-0 items-center gap-1.5 border border-black/[0.08] px-1.5 py-px">
              <div className="relative size-8 shrink-0 overflow-hidden">
                <img
                  alt="ISMS"
                  src={FOOTER_ASSET.isms}
                  className="absolute left-[-12.5%] top-[-12.5%] size-[125%] max-w-none object-contain"
                />
              </div>
              <div className="font-pretendard text-[10px] leading-[14px] tracking-[-0.3px] text-[#828c94]">
                <p className="m-0 whitespace-nowrap">오늘의집 서비스 운영</p>
                <p className="m-0 whitespace-nowrap">2021. 09. 08 ~ 2024. 09. 07</p>
              </div>
            </div>
            <div className="flex h-10 min-w-0 max-w-[116px] flex-1 items-center justify-center border border-black/[0.08] px-1.5 py-px">
              <img
                alt="ISO 27001"
                src={FOOTER_ASSET.iso27001}
                className="h-[31px] w-8 object-contain"
              />
            </div>
            <div className="flex h-10 min-w-0 max-w-[116px] flex-1 items-center justify-center border border-black/[0.08] px-1.5 py-px">
              <img alt="PCR" src={FOOTER_ASSET.pcr} className="size-8 object-contain" />
            </div>
          </div>

          <p className="font-pretendard text-[10px] leading-[14px] tracking-[-0.3px] text-[#828c94]">
            (주)버킷플레이스는 통신판매중개자로 거래 당사자가 아니므로, 판매자가 등록한 상품정보 및 거래 등에 대해 책임을 지지 않습니다. 단,
            (주)버킷플레이스가 판매자로 등록 판매한 상품은 판매자로서 책임을 부담합니다.
          </p>

          <div className="flex flex-wrap gap-3 pt-1">
            <a href="#" className="inline-flex items-center p-0.5" aria-label="YouTube">
              <SocialIcon
                outer={FOOTER_ASSET.socialEllipse}
                inner={FOOTER_ASSET.youtubeGlyph}
                innerClassName="inset-[29.58%_20.83%_29.58%_20.83%]"
              />
            </a>
            <a href="#" className="inline-flex items-center p-0.5" aria-label="Instagram">
              <SocialIcon
                outer={FOOTER_ASSET.socialEllipse}
                inner={FOOTER_ASSET.instaGlyph}
                innerClassName="inset-[20.83%]"
              />
            </a>
            <a href="#" className="inline-flex items-center p-0.5" aria-label="Facebook">
              <span className="relative inline-block size-6 shrink-0" aria-hidden>
                <img
                  alt=""
                  src={FOOTER_ASSET.facebookGlyph}
                  className="absolute inset-[4.17%] size-[91.66%] object-contain"
                />
              </span>
            </a>
            <a href="#" className="inline-flex items-center p-0.5" aria-label="카카오스토리">
              <SocialIcon
                outer={FOOTER_ASSET.socialEllipse}
                inner={FOOTER_ASSET.kakaoGlyph}
                innerClassName="inset-[27.08%_36.25%_22.01%_36.25%]"
              />
            </a>
            <a href="#" className="inline-flex items-center p-0.5" aria-label="네이버포스트">
              <SocialIcon
                outer={FOOTER_ASSET.socialEllipse}
                inner={FOOTER_ASSET.naverGlyph}
                innerClassName="inset-[24.03%_33.19%_19.09%_33.19%]"
              />
            </a>
          </div>

          <p className="font-pretendard text-[10px] leading-[14px] tracking-[-0.3px] text-[#828c94]">
            {copyrightOverride || "Copyright 2014. bucketplace, Co., Ltd. All rights reserved."}
          </p>
        </div>
      </div>
    </footer>
  );
}
