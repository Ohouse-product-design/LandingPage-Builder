"use client";

/**
 * ODS Asset 렌더러 (프리뷰).
 *
 * - `type: "lottie"` 또는 Lottie 로 보이는 `url` → JSON fetch 후 `lottie-react` 재생
 * - `type: "image"` + `url`(비-Lottie) → `<img>`
 * - `type: "image"` + `assetId` 만 → `resolvePreviewRasterImageSrc` (결정적 플레이스홀더)
 * - `assetId` 가 `Icon*` 이고 로컬 어댑터에 있으면 SVG 아이콘
 * - 그 외 → 이름/타입 placeholder
 */

import * as OdsIcons from "@/lib/ods-icons";
import { isLikelyLottieUrl, resolvePreviewRasterImageSrc } from "@/lib/preview-asset-url";
import type { AssetRef, AssetType } from "@/schema/doc";
import LottieAssetView from "./LottieAssetView";

interface Props {
  asset: AssetRef;
  /** placeholder 사이즈 힌트 (px). 비우면 컨테이너 채움. */
  size?: number;
  /** placeholder 모드에서 컨테이너 스타일을 덮어쓸 때 */
  className?: string;
}

type IconComponent = (props: { size?: number | string; className?: string }) => JSX.Element;

const ICON_MAP = OdsIcons as Record<string, IconComponent>;

export default function OdsAssetRenderer({ asset, size = 24, className }: Props) {
  const imgClass = className ?? "h-full w-full object-cover";

  const wantsLottie =
    asset.type === "lottie" || (!!asset.url && isLikelyLottieUrl(asset.url));

  if (wantsLottie) {
    const lottieSrc =
      asset.url && isLikelyLottieUrl(asset.url)
        ? asset.url
        : asset.type === "lottie"
          ? asset.url || undefined
          : undefined;
    return <LottieAssetView src={lottieSrc} className={className} />;
  }

  if (asset.url) {
    return <img src={asset.url} alt={asset.alt} className={imgClass} />;
  }

  const name = asset.assetId;
  if (!name) {
    return <PlaceholderCard label="(empty)" type={asset.type} className={className} />;
  }

  if (name.startsWith("Icon") && typeof ICON_MAP[name] === "function") {
    const Icon = ICON_MAP[name];
    return <Icon size={size} className={className} />;
  }

  if (asset.type === "image") {
    return (
      <img src={resolvePreviewRasterImageSrc(asset)} alt={asset.alt} className={imgClass} />
    );
  }

  if (asset.type === "video") {
    return <PlaceholderCard label={name} type="video" className={className} />;
  }

  return <PlaceholderCard label={name} type={asset.type} className={className} />;
}

function PlaceholderCard({
  label,
  type,
  className,
}: {
  label: string;
  type: AssetType;
  className?: string;
}) {
  return (
    <div
      className={
        className ??
        "flex h-full w-full flex-col items-center justify-center gap-1 rounded-ods-8 bg-ods-surface-light p-2 text-center"
      }
      title={label}
    >
      <span className="rounded bg-white px-1 py-0.5 text-[9px] uppercase tracking-wider text-ods-text-tertiary">
        {type}
      </span>
      <span className="line-clamp-2 break-all text-[10px] text-ods-text-secondary">
        {label}
      </span>
    </div>
  );
}
