"use client";

import type { ReactNode } from "react";

/**
 * ODS Asset 렌더러 (프리뷰).
 *
 * - `assetId` 가 `src/catalog/ods-assets.json` 의 ODS 컴포넌트명과 일치하면 라이브러리 타입(image/lottie)에 맞춰 렌더
 * - StillImage: `@bucketplace/assets/image` (tsconfig shim 또는 사내 패키지)
 * - 비어 있는 image 슬롯 기본값: `AssetGiftLargeStillImage`
 * - Lottie: 공개 샘플 JSON URL 매핑 후 `lottie-react`
 * - `Icon*` / ODS 아이콘 카탈로그명: 로컬 `ods-icons` SVG
 */

import {
  AssetGiftLargeStillImage,
  BucketplaceCatalogStillImage,
} from "@bucketplace/assets/image";

import { cn } from "@/lib/cn";
import * as OdsIcons from "@/lib/ods-icons";
import {
  getOdsLibraryAssetByAssetId,
  getOdsLibraryIconByAssetId,
} from "@/lib/ods-asset-library";
import {
  isLikelyLottieUrl,
  resolveOdsCatalogLottiePreviewSrc,
} from "@/lib/preview-asset-url";
import type { AssetRef, AssetType } from "@/schema/doc";
import LottieAssetView from "./LottieAssetView";

interface Props {
  asset: AssetRef;
  size?: number;
  className?: string;
  /** 빌더 프리뷰: 클릭 시 에셋 슬롯 교체 모달 */
  onRequestSlotEdit?: () => void;
}

type IconComponent = (props: { size?: number | string; className?: string }) => JSX.Element;

const ICON_MAP = OdsIcons as Record<string, IconComponent>;

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

function withSlotEdit(node: ReactNode, onRequestSlotEdit: (() => void) | undefined) {
  if (!onRequestSlotEdit) return node;
  return (
    <button
      type="button"
      aria-label="에셋 교체"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onRequestSlotEdit();
      }}
      className={cn(
        "m-0 inline-flex max-h-full max-w-full border-0 bg-transparent p-0 text-left",
        "cursor-pointer rounded-ods-4 outline outline-2 outline-offset-2 outline-transparent",
        "hover:outline-blue-500/35 focus-visible:outline-blue-500/60"
      )}
    >
      <span className="pointer-events-none flex size-full min-h-0 min-w-0 [&>img]:size-full [&>img]:max-h-none [&>img]:max-w-none [&>svg]:size-full">
        {node}
      </span>
    </button>
  );
}

export default function OdsAssetRenderer({
  asset,
  size = 24,
  className,
  onRequestSlotEdit,
}: Props) {
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
    return withSlotEdit(
      <LottieAssetView src={lottieSrc} className={className} />,
      onRequestSlotEdit
    );
  }

  if (asset.url && !isLikelyLottieUrl(asset.url)) {
    return withSlotEdit(
      <img src={asset.url} alt={asset.alt} className={imgClass} />,
      onRequestSlotEdit
    );
  }

  const iconName = resolveIconComponentName(asset.assetId);
  if (iconName && typeof ICON_MAP[iconName] === "function") {
    const Icon = ICON_MAP[iconName];
    return withSlotEdit(<Icon size={size} className={className} />, onRequestSlotEdit);
  }

  const name = asset.assetId;
  if (!name) {
    return withSlotEdit(
      <AssetGiftLargeStillImage className={imgClass} />,
      onRequestSlotEdit
    );
  }

  if (asset.type === "image" || odsAsset?.type === "image") {
    return withSlotEdit(
      <BucketplaceCatalogStillImage assetId={name} className={imgClass} />,
      onRequestSlotEdit
    );
  }

  if (asset.type === "video") {
    return withSlotEdit(
      <PlaceholderCard label={name} type="video" className={className} />,
      onRequestSlotEdit
    );
  }

  return withSlotEdit(
    <PlaceholderCard label={name} type={asset.type} className={className} />,
    onRequestSlotEdit
  );
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
  if (type === "image") {
    return (
      <AssetGiftLargeStillImage className={className ?? "h-full w-full object-cover"} />
    );
  }
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
