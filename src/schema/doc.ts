/**
 * LandingPageDoc — 랜딩페이지 빌더의 직렬화 산출물.
 *
 * 어드민에서 편집되는 모든 상태는 이 타입 하나로 표현되며,
 * - 좌측 SectionTree 는 doc.sections 를 렌더 (각 행 라벨은 `SECTION_PRESETS[preset].label` 만 사용)
 * - 가운데 PreviewStage 는 doc 전체를 iframe 으로 렌더
 * - 우측 Inspector 는 selectedSectionId 가 가리키는 Section / ComponentInstance 를 편집
 *
 * 배포 시 이 JSON 이 그대로 CDN 에 업로드되거나, SSR 단에서 컴포넌트 트리로
 * 매핑되어 실 페이지가 만들어진다.
 */

import type { SectionPresetId } from "./section-presets";
import type { ComponentPresetId } from "./component-presets";
import type { OdsTokenRef } from "./ods-tokens";

// ---------------------------------------------------------------------------
// Asset (ODS Asset Library — `src/catalog/ods-assets.json` 컴포넌트명, 빌드 시 번들/CDN 으로 치환)
// ---------------------------------------------------------------------------

export type AssetType = "image" | "svg" | "video" | "lottie";

export interface AssetRef {
  /** ODS StillImage / Lottie 컴포넌트명(`AssetBoltTruckLargeStillImage` 등) 또는 레거시 path id */
  assetId?: string;
  /** 직접 URL 을 지정하는 경우 (assetId 가 없을 때 폴백) */
  url?: string;
  /** alt text — 접근성 필수 */
  alt: string;
  /** 어떤 디바이스에서 어떤 에셋을 쓸지 — 비워두면 단일 에셋 */
  responsive?: {
    mobile?: { assetId?: string; url?: string };
    tablet?: { assetId?: string; url?: string };
    desktop?: { assetId?: string; url?: string };
  };
  type: AssetType;
  /** 디버그/검수용 메타 */
  meta?: {
    width?: number;
    height?: number;
    sizeKB?: number;
    updatedAt?: string;
  };
}

export interface AssetSlot {
  /** 슬롯 이름. 컴포넌트 스키마에서 정의된 key 와 매칭. e.g. "hero.background" */
  slotName: string;
  /** 슬롯에 묶인 에셋. 비어있으면 placeholder 렌더 */
  asset?: AssetRef;
}

// ---------------------------------------------------------------------------
// Token Binding (ODS 토큰을 prop 에 묶기)
// ---------------------------------------------------------------------------

export interface TokenBinding {
  /** 어떤 prop 경로에 토큰을 바인딩하는지. e.g. "title.color" */
  propPath: string;
  tokenRef: OdsTokenRef;
}

// ---------------------------------------------------------------------------
// Component Instance — 섹션 안에 들어가는 카드/스텝/리뷰 등
// ---------------------------------------------------------------------------

export interface ComponentInstance {
  id: string;
  /** 컴포넌트 프리셋 ID — UspCard, ReviewCard, StepCard ... */
  preset: ComponentPresetId;
  /** 사용자가 입력한 자유 텍스트/숫자 등 */
  props: Record<string, unknown>;
  /** 컴포넌트가 갖는 에셋 슬롯 */
  assets: AssetSlot[];
  /** 컴포넌트 단의 토큰 바인딩 (없으면 섹션 토큰을 상속) */
  tokens?: TokenBinding[];
}

// ---------------------------------------------------------------------------
// Section — 랜딩페이지의 한 영역
// ---------------------------------------------------------------------------

export interface SectionVisibility {
  mobile: boolean;
  tablet: boolean;
  desktop: boolean;
}

export interface Section {
  id: string;
  /** 섹션 프리셋 ID — Hero, Usp, Review ... */
  preset: SectionPresetId;
  /**
   * 섹션 식별용 이름 (`addSection` 시 프리셋 라벨·변형 접미사 등).
   * 좌측 트리 라벨에는 쓰이지 않음 — 트리는 `preset` → `SECTION_PRESETS[].label` 만 표시.
   * 삭제 확인·Inspector 헤더·프리뷰 태그 등에 사용.
   */
  name: string;
  /**
   * 고정 영역 여부. true 면 SectionTree 에서 드래그 핸들이 숨겨지고
   * 순서 변경/삭제가 비활성화된다.
   * - Hero, Header, Footer, StickyCta 는 기본 true
   */
  locked: boolean;
  /** 섹션 단위 props (섹션 타이틀, 서브카피 등) */
  props: Record<string, unknown>;
  /**
   * 컴포넌트 슬롯. 키는 섹션 프리셋이 정의한 slot 이름.
   * e.g. UspSection 은 { cards: ComponentInstance[] }
   * e.g. ReviewSection 은 { reviews: ComponentInstance[] }
   */
  slots: Record<string, ComponentInstance[]>;
  /** 섹션 자체의 에셋 (배경 이미지 등) */
  assets: AssetSlot[];
  /** 섹션 단의 토큰 바인딩 */
  tokens?: TokenBinding[];
  /** 디바이스별 표시 여부 */
  visibility: SectionVisibility;
}

// ---------------------------------------------------------------------------
// LandingPageDoc (최상위)
// ---------------------------------------------------------------------------

export interface LandingPageMeta {
  /** 페이지 슬러그 — URL 경로의 마지막 segment */
  slug: string;
  /** 페이지 타이틀 (SEO/탭) */
  title: string;
  /** 페이지 설명 (meta description) */
  description?: string;
  /** 페이지 OG 이미지 */
  ogImage?: AssetRef;
  /** 페이지 카테고리. /moving, /rental 등 */
  category: "moving" | "rental" | "interior" | "other";
  /** 담당자 — [검수] 클릭 시 Jira assignee / Slack mention 대상 */
  owners: {
    designer?: { name: string; email?: string; slackId?: string };
    developer?: { name: string; email?: string; slackId?: string };
    pm?: { name: string; email?: string; slackId?: string };
  };
}

export interface LandingPageDoc {
  /** 페이지 고유 ID (UUID) */
  id: string;
  /** 스키마 버전. 마이그레이션 시 사용 */
  schemaVersion: "1.0.0";
  meta: LandingPageMeta;
  /**
   * 섹션 순서. SectionTree 의 위에서 아래 순서.
   * 고정 섹션(locked=true)은 항상 같은 자리에 머무르도록 reorder 로직에서 강제됨.
   */
  sections: Section[];
  /** 페이지 전역 토큰 바인딩 (theme override) */
  globalTokens?: TokenBinding[];
  /** 감사 로그용 */
  audit: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
  };
}

// ---------------------------------------------------------------------------
// Helper types
// ---------------------------------------------------------------------------

export type Viewport = "mobile" | "tablet" | "desktop";

export const VIEWPORT_WIDTH: Record<Viewport, number> = {
  mobile: 375,
  tablet: 768,
  desktop: 1280,
};
