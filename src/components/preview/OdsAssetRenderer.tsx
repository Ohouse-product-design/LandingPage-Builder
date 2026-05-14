"use client";

/**
 * ODS Asset 렌더러 (프리뷰).
 *
 * - `assetId` 가 `src/catalog/ods-assets.json` 의 ODS 컴포넌트명과 일치하면 라이브러리 타입(image/lottie)에 맞춰 렌더
 * - Lottie: 공개 샘플 JSON URL 을 `resolveOdsCatalogLottiePreviewSrc` 로 매핑 후 `lottie-react`
 * - StillImage 등: `url` 우선, 없으면 picsum 시드(이름 기반) 플레이스홀더
 * - `assetId` 가 `Icon*` 이거나 ODS 아이콘 카탈로그명이면 로컬 `ods-icons` SVG
 */

import * as OdsIcons from "@/lib/ods-icons";
import {
  getOdsLibraryAssetByAssetId,
  getOdsLibraryIconByAssetId,
} from "@/lib/ods-asset-library";
import {
  isLikelyLottieUrl,
  resolveOdsCatalogLottiePreviewSrc,
  resolvePreviewRasterImageSrc,
} from "@/lib/preview-asset-url";
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

/** 구 design-assets path / 임시 id → 로컬 ODS 아이콘 컴포넌트명 */
const LEGACY_ASSETID_TO_ICON: Record<string, string> = {
  "ods/icon/check": "IconCheck",
  "ods/icon/star": "IconCheck",
};

function resolveIconComponentName(assetId: string | undefined): string | null {
  if (!assetId?.trim()) return null;
  const raw = assetId.trim();
  if (LEGACY_ASSETID_TO_ICON[raw]) return LEGACY_ASSETID_TO_ICON[raw];
  if (raw.startsWith("Icon")) return raw;
  const odsIcon = getOdsLibraryIconByAssetId(raw);
  return odsIcon ? odsIcon.name : null;
}

export default function OdsAssetRenderer({ asset, size = 24, className }: Props) {
  const imgClass = className ?? "h-full w-full object-cover";

  const odsAsset = getOdsLibraryAssetByAssetId(asset.assetId);
  const wantsLottie =
    (!!asset.url && isLikelyLottieUrl(asset.url)) ||
    asset.type === "lottie" ||
    odsAsset?.type === "lottie";

  if (wantsLottie) {
    const lottieSrc =
      asset.url && isLikelyLottieUrl(asset.url)
        ? asset.url
        : asset.assetId
          ? resolveOdsCatalogLottiePreviewSrc(asset.assetId.trim())
          : undefined;
    return <LottieAssetView src={lottieSrc} className={className} />;
  }

  if (asset.url && !isLikelyLottieUrl(asset.url)) {
    return <img src={asset.url} alt={asset.alt} className={imgClass} />;
  }

  const iconName = resolveIconComponentName(asset.assetId);
  if (iconName && typeof ICON_MAP[iconName] === "function") {
    const Icon = ICON_MAP[iconName];
    return <Icon size={size} className={className} />;
  }

  const name = asset.assetId;
  if (!name) {
    return <PlaceholderCard label="(empty)" type={asset.type} className={className} />;
  }

  if (asset.type === "image" || odsAsset?.type === "image") {
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
