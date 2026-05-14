import type { AssetRef } from "@/schema/doc";

/** URL 이 Lottie JSON / dotlottie 로 보이면 true (이미지 src 로 쓰지 않음) */
export function isLikelyLottieUrl(url: string): boolean {
  return /\.(json|lottie)(\?|#|$)/i.test(url) || /lottie\.host\//i.test(url);
}

/**
 * ODS Lottie 컴포넌트(`@bucketplace/assets/lottie`)는 사내 패키지 JSON URL이 없으므로,
 * 프리뷰에서는 공개 샘플 JSON 을 `assetId` 기준으로 결정적으로 매핑한다.
 * (추후 사내 CDN/번들 JSON 으로 교체 가능)
 */
const ODS_LOTTIE_PREVIEW_JSON_URLS = [
  "https://assets2.lottiefiles.com/packages/lf20_aefljR.json",
  "https://assets2.lottiefiles.com/packages/lf20_jcikwtox.json",
  "https://assets5.lottiefiles.com/packages/lf20_cn1awqs7.json",
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return Math.abs(h);
}

/** 카탈로그에 등록된 Lottie 컴포넌트명 → 프리뷰용 fetch 가능한 .json URL */
export function resolveOdsCatalogLottiePreviewSrc(componentName: string): string {
  const idx = hashString(componentName) % ODS_LOTTIE_PREVIEW_JSON_URLS.length;
  return ODS_LOTTIE_PREVIEW_JSON_URLS[idx]!;
}

/**
 * 프리뷰용 래스터 이미지 src.
 * - `asset.url` 이 있고 Lottie 가 아니면 그대로 사용
 * - 그렇지 않으면 `assetId`(또는 alt) 기반 결정적 플레이스홀더 (picsum) — ODS StillImage 이름도 동일 규칙
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
