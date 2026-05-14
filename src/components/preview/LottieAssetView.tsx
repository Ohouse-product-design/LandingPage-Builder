"use client";

import { useEffect, useState } from "react";
import Lottie from "lottie-react";

import placeholderAnimation from "@/lib/preview-placeholder-lottie.json";
import { PREVIEW_FALLBACK_LOTTIE_JSON_URL } from "@/lib/preview-asset-url";

type Props = {
  /** Lottie JSON URL (https … .json). 비어 있으면 공개 폴백 URL 시도 후 로컬 애니메이션 */
  src?: string | null;
  className?: string;
};

async function fetchLottieJson(url: string): Promise<object> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(String(r.status));
  return r.json();
}

/**
 * 프리뷰 전용 — JSON 을 fetch 해 `lottie-react` 로 재생.
 * `.lottie` 바이너리는 미지원(번들 플레이스홀더 JSON 사용).
 */
export default function LottieAssetView({ src, className }: Props) {
  const [data, setData] = useState<object | null>(null);
  const [failed, setFailed] = useState(false);

  const resolvedSrc = src?.trim() || PREVIEW_FALLBACK_LOTTIE_JSON_URL;

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setFailed(false);

    if (/\.lottie(\?|#|$)/i.test(resolvedSrc)) {
      setData(placeholderAnimation as object);
      return;
    }

    (async () => {
      try {
        const json = await fetchLottieJson(resolvedSrc);
        if (!cancelled) setData(json);
      } catch {
        if (cancelled) return;
        if (resolvedSrc !== PREVIEW_FALLBACK_LOTTIE_JSON_URL) {
          try {
            const json = await fetchLottieJson(PREVIEW_FALLBACK_LOTTIE_JSON_URL);
            if (!cancelled) setData(json);
            return;
          } catch {
            /* fall through */
          }
        }
        if (!cancelled) {
          setData(placeholderAnimation as object);
          setFailed(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [resolvedSrc]);

  if (!data) {
    return (
      <div
        className={
          className ??
          "flex min-h-[48px] w-full animate-pulse items-center justify-center rounded-ods-8 bg-ods-surface-light/40"
        }
        aria-hidden
      />
    );
  }

  if (failed) {
    return (
      <div className={className ?? "flex h-full w-full flex-col items-center justify-center"}>
        <Lottie animationData={data} loop className="h-full max-h-full w-full max-w-full opacity-80" />
        <span className="sr-only">원격 Lottie 로드 실패, 로컬 플레이스홀더 재생 중</span>
      </div>
    );
  }

  return (
    <div className={className ?? "flex h-full w-full items-center justify-center"}>
      <Lottie animationData={data} loop className="h-full max-h-full w-full max-w-full" />
    </div>
  );
}
