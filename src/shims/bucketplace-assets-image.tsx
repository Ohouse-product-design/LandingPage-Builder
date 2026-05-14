"use client";

/**
 * `@bucketplace/assets/image` 대체 구현.
 * 사내 패키지가 설치되면 tsconfig paths 에서 이 파일 대신 패키지를 가리키면 된다.
 *
 * 카탈로그 StillImage 컴포넌트명은 `preview-asset-url` 의 결정적 플레이스홀더와 동일 규칙으로 미리보기한다.
 */

import { resolvePreviewRasterImageSrc } from "@/lib/preview-asset-url";
import type { AssetRef } from "@/schema/doc";

function rasterSrcForComponentName(name: string): string {
  const asset: AssetRef = {
    type: "image",
    alt: name,
    assetId: name,
  };
  return resolvePreviewRasterImageSrc(asset);
}

export function AssetGiftLargeStillImage({ className }: { className?: string }) {
  return (
    <img
      src={rasterSrcForComponentName("AssetGiftLargeStillImage")}
      alt=""
      className={className}
      draggable={false}
    />
  );
}

/** 카탈로그에 등록된 임의 StillImage 이름 — OdsAssetRenderer 가 image 슬롯에 사용 */
export function BucketplaceCatalogStillImage({
  assetId,
  className,
}: {
  assetId: string;
  className?: string;
}) {
  return (
    <img
      src={rasterSrcForComponentName(assetId.trim())}
      alt=""
      className={className}
      draggable={false}
    />
  );
}
