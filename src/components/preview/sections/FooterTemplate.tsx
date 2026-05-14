"use client";

/**
 * 오늘의집 푸터 — 제품 HTML/CSS 스펙 정렬 (3단 그리드 + 회사정보 토글).
 * 인증 마크 래스터: `footer-mcp-assets` (Figma MCP URL, 만료 시 교체).
 */

import { useState } from "react";

import { cn } from "@/lib/cn";
import type { Section } from "@/schema/doc";

import { FOOTER_ASSET } from "./footer-mcp-assets";

const NAV_LINKS = [
  { href: "https://www.bucketplace.com", label: "회사소개", bold: false },
  { href: "https://www.bucketplace.com/careers", label: "채용정보", bold: false },
  { href: "https://ohou.se/usepolicy", label: "이용약관", bold: false },
  { href: "https://ohou.se/privacy", label: "개인정보 처리방침", bold: true },
  { href: "https://ohou.se/customer_notices", label: "공지사항", bold: false },
  { href: "https://safetybucketplace.zendesk.com/hc/ko", label: "권리보호센터", bold: false },
  { href: "#", label: "입점신청", bold: false },
  { href: "https://ohou.se/contacts/new", label: "제휴/광고 문의", bold: false },
  { href: "#", label: "시공파트너 안내", bold: false },
  { href: "https://ohou.se/partner_privacy", label: "파트너 개인정보 처리방침", bold: true },
  { href: "#", label: "상품광고 소개", bold: false },
  { href: "https://ohou.se/contacts/new", label: "고객의 소리", bold: false },
  { href: "https://ohou.se/payment-agency", label: "결제대행 위탁사", bold: false },
] as const;

function SocialYouTube({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="11" fill="currentColor" />
      <path
        d="M18.7 8.63a1.85 1.85 0 0 0-1.3-1.24C16.38 7.1 12 7.1 12 7.1s-4.38 0-5.4.29a1.85 1.85 0 0 0-1.3 1.24A19.4 19.4 0 0 0 5 12a19.4 19.4 0 0 0 .3 3.37A1.85 1.85 0 0 0 6.6 16.6c1.02.29 5.4.29 5.4.29s4.38 0 5.4-.29a1.85 1.85 0 0 0 1.3-1.24A19.4 19.4 0 0 0 19 12a19.4 19.4 0 0 0-.3-3.37ZM10.55 14.07V9.93L14.18 12l-3.63 2.07Z"
        fill="white"
      />
    </svg>
  );
}

function SocialInstagram({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect width="24" height="24" rx="12" fill="currentColor" />
      <path
        d="M12 7.2a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6Zm0 7.92a3.12 3.12 0 1 1 0-6.24 3.12 3.12 0 0 1 0 6.24Zm4.7-9.4a1.12 1.12 0 1 0 0 2.24 1.12 1.12 0 0 0 0-2.24Z"
        fill="white"
      />
    </svg>
  );
}

function SocialFacebook({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="12" fill="currentColor" />
      <path
        d="M15.5 8H13.5C13.2 8 13 8.2 13 8.5V10.5H15.5L15.2 13H13V20H10V13H8V10.5H10V8.5C10 6.6 11.3 5 13.5 5H15.5V8Z"
        fill="white"
      />
    </svg>
  );
}

function SocialNaverBlog({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="12" fill="currentColor" />
      <path d="M13.4 12.3 10.2 7H7v10h3.6v-5.3L13.8 17H17V7h-3.6v5.3Z" fill="white" />
    </svg>
  );
}

export default function FooterTemplate({ section }: { section: Section }) {
  const copyrightOverride = (section.props["copyright"] as string | undefined)?.trim();
  const [companyOpen, setCompanyOpen] = useState(false);

  return (
    <footer className="w-full bg-[#f7f9fa] py-10 font-pretendard text-[#424242] [&_a:hover]:underline">
      <div className="mx-auto w-full max-w-[1200px] px-4 text-[12px] leading-4 tracking-[-0.3px] text-[#2f3438]">
        <div
          className={cn(
            "grid gap-6",
            "lg:grid-cols-[256px_1px_256px_1px_minmax(0,1fr)] lg:gap-x-6 lg:gap-y-0"
          )}
        >
          {/* 1열: 고객센터 */}
          <div className="min-w-0 text-[#2f3438]">
            <div className="flex items-center gap-0.5">
              <a
                href="https://ohou.se/customer_center"
                className="flex items-center text-[18px] font-bold leading-6 tracking-[-0.3px] text-inherit no-underline hover:underline"
              >
                고객센터
              </a>
              <span className="inline-block text-[14px] leading-none text-[#2f3438]" aria-hidden>
                ›
              </span>
            </div>
            <div className="mb-2 mt-5 flex flex-wrap items-center">
              <a
                href="tel:1670-0876"
                className="mr-1 whitespace-nowrap text-[16px] font-bold leading-5 tracking-[-0.3px] text-inherit no-underline hover:underline"
              >
                1670-0876
              </a>
              <time className="text-[14px] font-normal leading-5 tracking-[-0.3px]" dateTime="09:00">
                09:00
              </time>
              ~
              <time className="text-[14px] font-normal leading-5 tracking-[-0.3px]" dateTime="18:00">
                18:00
              </time>
            </div>
            <div className="mb-3 text-[12px] leading-5 tracking-[-0.3px]">
              <div className="relative pl-5 before:absolute before:left-[7px] before:top-0 before:text-[10px] before:content-['•']">
                평일: 전체 문의 상담
              </div>
              <div className="relative pl-5 before:absolute before:left-[7px] before:top-0 before:text-[10px] before:content-['•']">
                토요일, 공휴일: 오늘의집 직접배송 주문건 상담
              </div>
              <div className="relative pl-5 before:absolute before:left-[7px] before:top-0 before:text-[10px] before:content-['•']">
                일요일: 휴무
              </div>
            </div>
            <div className="mt-3 flex flex-col gap-3">
              <button
                type="button"
                className="inline-flex h-8 w-fit cursor-pointer items-center justify-center whitespace-nowrap rounded border border-[#e0e0e0] bg-transparent px-2 text-left text-[14px] font-normal leading-5 tracking-[-0.3px] text-[#2f3438] hover:bg-[#f7f9fa]"
              >
                카톡 상담(평일 09:00~18:00)
              </button>
              <a
                href="https://ohou.se/contacts/new"
                className="inline-flex h-8 w-fit items-center justify-center whitespace-nowrap rounded border border-[#e0e0e0] bg-transparent px-2 text-[14px] font-normal leading-5 tracking-[-0.3px] text-[#2f3438] no-underline hover:bg-[#f7f9fa]"
              >
                이메일 문의
              </a>
            </div>
          </div>

          <div className="hidden h-full min-h-[1px] w-px bg-[#eaeddf] lg:block" aria-hidden />

          <div className="h-px w-full bg-[#eaeddf] lg:hidden" aria-hidden />

          {/* 2열: 링크 (grid-auto-flow: column, 2 cols × 7 rows) */}
          <nav
            className="grid min-w-0 grid-flow-col grid-cols-2 grid-rows-[repeat(7,min-content)] gap-x-2 gap-y-5"
            aria-label="푸터 링크"
          >
            {NAV_LINKS.map(({ href, label, bold }) => (
              <a
                key={label}
                href={href}
                className={cn(
                  "inline-block whitespace-nowrap text-[12px] leading-4 tracking-[-0.3px] text-[#2f3438] no-underline hover:underline",
                  bold ? "font-bold" : "font-normal"
                )}
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="hidden h-full min-h-[1px] w-px bg-[#eaeddf] lg:block" aria-hidden />

          <div className="h-px w-full bg-[#eaeddf] lg:hidden" aria-hidden />

          {/* 3열: 회사정보 + 인증 + 소셜 */}
          <div className="flex min-w-0 flex-col gap-3 text-[10px] leading-[14px] tracking-[-0.3px] text-[#828c94]">
            <div>
              <button
                type="button"
                onClick={() => setCompanyOpen((o) => !o)}
                className="m-0 flex cursor-pointer items-center gap-0.5 border-0 bg-transparent p-0 text-[12px] font-bold leading-4 tracking-[-0.3px] text-[#2f3438]"
                aria-expanded={companyOpen}
              >
                (주)버킷플레이스{" "}
                <span className="inline-block text-[14px] leading-none" aria-hidden>
                  {companyOpen ? "∧" : "∨"}
                </span>
              </button>
              <div
                className={cn(
                  "mt-2 text-[10px] leading-[14px] text-[#828c94] [&_a]:text-inherit",
                  companyOpen ? "block" : "hidden"
                )}
              >
                <span>(주)버킷플레이스</span> | <span>대표이사 이승재</span> |{" "}
                <span>서울 서초구 서초대로74길 4 삼성생명서초타워 25층, 27층</span> |{" "}
                <a href="mailto:contact@bucketplace.net" className="no-underline hover:underline">
                  contact@bucketplace.net
                </a>
                <br />
                <span>사업자등록번호 119-86-91245</span> |{" "}
                <a
                  href="https://www.ftc.go.kr/bizCommPop.do?wrkr_no=1198691245"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="no-underline hover:underline"
                >
                  사업자정보확인
                </a>{" "}
                | <span>통신판매업신고번호 제2018-서울서초-0580호</span>
              </div>
            </div>

            <div className="overflow-x-hidden">
              <p className="m-0 text-[10px] leading-[14px] text-[#828c94]">
                고객님이 현금결제한 금액에 대해 우리은행과 채무지급보증 계약을 체결하여 안전거래를 보장하고 있습니다.{" "}
                <a
                  href="https://ohouse.notion.site/da111ffbfc7c45a0a1327e23a7bd5dde"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-[#828c94] no-underline hover:underline"
                >
                  서비스가입사실확인
                </a>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <img
                  alt="ISMS 인증"
                  src={FOOTER_ASSET.isms}
                  className="size-12 object-contain"
                />
                <div className="flex flex-col text-[10px] leading-[14px] text-[#828c94]">
                  <span>오늘의집 서비스 운영</span>
                  <span className="text-[10px] leading-[14px]">2024. 09. 08 ~ 2027. 09. 07</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <img
                  alt="ISO 27001"
                  src={FOOTER_ASSET.iso27001}
                  className="size-12 object-contain"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <img alt="PCR 인증" src={FOOTER_ASSET.pcr} className="size-12 object-contain" />
              </div>
            </div>

            <p className="m-0 text-[10px] leading-[14px] text-[#828c94]">
              (주)버킷플레이스는 통신판매중개자로 거래 당사자가 아니므로, 판매자가 등록한 상품정보 및 거래 등에 대해 책임을 지지 않습니다. 단,
              (주)버킷플레이스가 판매자로 등록 판매한 상품은 판매자로서 책임을 부담합니다.
            </p>

            <div className="flex flex-wrap items-center">
              <a
                href="https://www.youtube.com/channel/UCBKtitA1RwY7F32rCniV1dA"
                target="_blank"
                rel="noopener noreferrer"
                className="mr-3 inline-block text-[#828c94] no-underline transition-colors hover:text-[#656e75]"
                aria-label="YouTube"
              >
                <SocialYouTube className="block" />
              </a>
              <a
                href="https://www.instagram.com/todayhouse"
                target="_blank"
                rel="noopener noreferrer"
                className="mr-3 inline-block text-[#828c94] no-underline transition-colors hover:text-[#656e75]"
                aria-label="Instagram"
              >
                <SocialInstagram className="block" />
              </a>
              <a
                href="https://www.facebook.com/interiortoday"
                target="_blank"
                rel="noopener noreferrer"
                className="mr-3 inline-block text-[#828c94] no-underline transition-colors hover:text-[#656e75]"
                aria-label="Facebook"
              >
                <SocialFacebook className="block" />
              </a>
              <a
                href="https://naver.me/51ckkDZh"
                target="_blank"
                rel="noopener noreferrer"
                className="mr-3 inline-block text-[#828c94] no-underline transition-colors hover:text-[#656e75]"
                aria-label="Naver Blog"
              >
                <SocialNaverBlog className="block" />
              </a>
            </div>

            <p className="m-0 text-[10px] leading-[14px] text-[#828c94]">
              {copyrightOverride || "Copyright 2014. bucketplace, Co., Ltd. All rights reserved."}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
