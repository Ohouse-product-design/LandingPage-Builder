import type { Metadata } from "next";
import "./lead.css";

export const metadata: Metadata = {
  title: "오늘의집 인터넷·렌탈 상담",
  description:
    "인터넷/TV·정수기·가전 렌탈 한 번에 추천받고 최대 100만원 지원금까지.",
};

export default function LeadLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
      />
      <div className="lead-root">{children}</div>
    </>
  );
}
