import type { AssetRef } from "@/schema/doc";

/** URL 이 Lottie JSON / dotlottie 로 보이면 true (이미지 src 로 쓰지 않음) */
export function isLikelyLottieUrl(url: string): boolean {
  return /\.(json|lottie)(\?|#|$)/i.test(url) || /lottie\.host\//i.test(url);
}

/**
 * 프리뷰용 래스터 이미지 src.
 * - `asset.url` 이 있고 Lottie 가 아니면 그대로 사용
 * - 그렇지 않으면 `assetId`(또는 alt) 기반 결정적 플레이스홀더 (picsum)
 */
export function resolvePreviewRasterImageSrc(
  asset: AssetRef,
  width = 960,
  height = 540
): string {
  if (asset.url && !isLikelyLottieUrl(asset.url)) {
    return asset.url;
  }
  const seedSource = asset.assetId?.trim() || asset.alt?.trim() || "landing-preview";
  const seed = encodeURIComponent(seedSource.replace(/[/\\]+/g, "-").slice(0, 80));
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

/** `asset.type === "lottie"` 인데 URL 이 없을 때 사용하는 공개 Lottie JSON */
export const PREVIEW_FALLBACK_LOTTIE_JSON_URL =
  "https://assets2.lottiefiles.com/packages/lf20_aefljR.json";
