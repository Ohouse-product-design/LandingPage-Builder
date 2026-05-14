import type { AssetRef } from "@/schema/doc";

/** URL 이 Lottie JSON / dotlottie 로 보이면 true (이미지 src 로 쓰지 않음) */
export function isLikelyLottieUrl(url: string): boolean {
  return /\.(json|lottie)(\?|#|$)/i.test(url) || /lottie\.host\//i.test(url);
}

/**
 * design-assets (`packages/assets`) 배포본과 동일한 프로덕션 정적 CDN.
 * @see bucketplace/design-assets `stub.ts` / `.osset-upload-cache.json`
 */
const ODS_STATIC_CDN = "https://asset.ohousecdn.com/static";

/** `packages/assets/src/lottie` 에 대응하는 Lottie JSON (프리뷰 fetch 용) */
const ODS_LOTTIE_PREVIEW_BY_COMPONENT: Record<string, string> = {
  AssetMotionChevronDownLottie: `${ODS_STATIC_CDN}/AssetMotionChevronDown/motion-chevron-down.json`,
  AssetMotionGetPointPCircleLottie: `${ODS_STATIC_CDN}/AssetMotionGetPointPCircle/motion-get-point-p-circle.json`,
  AssetMotionHandPinchZoomInLottie: `${ODS_STATIC_CDN}/AssetMotionHandPinchZoomIn/motion-hand-pinch-zoom-in.json`,
  AssetMotionHandSwipeLeftLottie: `${ODS_STATIC_CDN}/AssetMotionHandSwipeLeft/motion-hand-swipe-left.json`,
  AssetMotionIconMagnifyingGlassViewfinderLottie: `${ODS_STATIC_CDN}/AssetMotionIconMagnifyingGlassViewfinder/motion-icon-magnifying-glass-viewfinder.json`,
  AssetMotionIconMagnifyingGlassViewfinderGenuineBlueLottie: `${ODS_STATIC_CDN}/AssetMotionIconMagnifyingGlassViewfinderGenuineBlue/motion-icon-magnifying-glass-viewfinder-genuine-blue.json`,
  AssetMotionPlusCircleSweepLottie: `${ODS_STATIC_CDN}/AssetMotionPlusCircleSweep/motion-plus-circle-sweep.json`,
  AssetMotionPushBenefitNudgeLottie: `${ODS_STATIC_CDN}/AssetMotionPushBenefitNudge/motion-push-benefit-nudge.json`,
};

const ODS_LOTTIE_PREVIEW_FALLBACK_POOL: readonly string[] = [
  `${ODS_STATIC_CDN}/AssetMotionPlusCircleSweep/motion-plus-circle-sweep.json`,
  `${ODS_STATIC_CDN}/AssetMotionChevronDown/motion-chevron-down.json`,
  `${ODS_STATIC_CDN}/AssetMotionGetPointPCircle/motion-get-point-p-circle.json`,
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return Math.abs(h);
}

/** 카탈로그에 등록된 Lottie 컴포넌트명 → 프리뷰용 fetch 가능한 .json URL */
export function resolveOdsCatalogLottiePreviewSrc(componentName: string): string {
  const id = componentName.trim();
  const mapped = ODS_LOTTIE_PREVIEW_BY_COMPONENT[id];
  if (mapped) return mapped;
  const idx = hashString(id) % ODS_LOTTIE_PREVIEW_FALLBACK_POOL.length;
  return ODS_LOTTIE_PREVIEW_FALLBACK_POOL[idx]!;
}

/**
 * `image_{w}.webp` 가 아닌 업로드 경로 (design-assets osset 기준).
 */
const ODS_STILL_IMAGE_SPECIAL: Record<string, string> = {
  AssetOpenGraphO2OMovingStillImage: "AssetOpenGraphO2OMoving/open-graph-o2o-moving.png",
};

/**
 * ODS StillImage 컴포넌트명 → CDN 첫 후보(`image_480.webp` 또는 특수 경로).
 * design-assets 에 없는 이름이면 null (picsum 등으로 폴백).
 */
export function resolveOdsCatalogStillImagePreviewPrimary(assetId: string): string | null {
  const id = assetId.trim();
  if (!id.endsWith("StillImage")) return null;
  const special = ODS_STILL_IMAGE_SPECIAL[id];
  if (special) return `${ODS_STATIC_CDN}/${special}`;
  const base = id.slice(0, -"StillImage".length);
  return `${ODS_STATIC_CDN}/${base}/image_480.webp`;
}

/** webp 실패 시 시도할 `image_480.png` (특수 경로 전용 StillImage 는 null) */
export function resolveOdsCatalogStillImagePreviewFallbackPng(assetId: string): string | null {
  const id = assetId.trim();
  if (!id.endsWith("StillImage") || ODS_STILL_IMAGE_SPECIAL[id]) return null;
  const base = id.slice(0, -"StillImage".length);
  return `${ODS_STATIC_CDN}/${base}/image_480.png`;
}

/** `assetId` / alt 시드 기반 picsum (ODS CDN 실패 시) */
export function resolvePreviewPlaceholderRasterSrc(
  seedSource: string,
  width = 960,
  height = 540
): string {
  const seed = encodeURIComponent(seedSource.replace(/[/\\]+/g, "-").slice(0, 80));
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

/**
 * 프리뷰용 래스터 이미지 src.
 * - `asset.url` 이 있고 Lottie 가 아니면 그대로 사용
 * - `*StillImage` 이면 design-assets CDN (`image_480.webp` 우선, onError 에서 png·picsum 은 shim 에서 처리)
 * - 그 외 `assetId`(또는 alt) 기반 picsum
 */
export function resolvePreviewRasterImageSrc(
  asset: AssetRef,
  width = 960,
  height = 540
): string {
  if (asset.url && !isLikelyLottieUrl(asset.url)) {
    return asset.url;
  }
  const id = asset.assetId?.trim();
  if (id) {
    const cdn = resolveOdsCatalogStillImagePreviewPrimary(id);
    if (cdn) return cdn;
  }
  const seedSource = id || asset.alt?.trim() || "landing-preview";
  return resolvePreviewPlaceholderRasterSrc(seedSource, width, height);
}

/** `asset.type === "lottie"` 인데 URL 이 없을 때 사용하는 Lottie JSON (design-assets CDN) */
export const PREVIEW_FALLBACK_LOTTIE_JSON_URL =
  `${ODS_STATIC_CDN}/AssetMotionPlusCircleSweep/motion-plus-circle-sweep.json`;
