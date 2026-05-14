# Landing Page Builder

오늘의집 랜딩페이지 **빌더 어드민** — Next.js 14 + TypeScript + Tailwind.  

- **빌더**: `/` — 섹션 트리, 반응형 프리뷰, 인스펙터(타이틀 / 콘텐츠 슬롯 / 이미지).
- **프리뷰**: `/preview/[slug]` — 동일 문서를 프리텐다드 기준으로 렌더.
- **Lead 데모**: `/lead` — 마케팅용 정적 섹션 데모(별도 스토리/에셋).
- **에셋**: `src/catalog/ods-assets.json` · `ods-icons.json` 로컬 미러 + 프리뷰 시 **`asset.ohousecdn.com`** 정적 URL( design-assets 와 동일 규칙 ). 사내 패키지 대신 **`tsconfig` path shim** 으로 `@bucketplace/assets/image` · `@bucketplace/icons` 를 연결합니다.

## 시작하기

```bash
npm install
npm run dev
```

프리뷰 Lottie 는 코드에서 `lottie-react` 를 import 합니다. 설치 오류가 나면 `npm install lottie-react` 로 추가하세요.

- 빌더: **http://localhost:3000**
- 시드 프리뷰 예: **http://localhost:3000/preview/moving** (`npm run open:preview` — macOS `open`)
- 타입체크: `npm run typecheck`
- 프로덕션 빌드: `npm run build` / `npm run start`
- Storybook: `npm run storybook` (기본 포트 6006)

## 앱 라우트 (`app/`)

| 경로 | 설명 |
|------|------|
| `page.tsx` | 빌더 진입 — `BuilderShell` |
| `preview/[slug]/page.tsx` | 문서 slug 기반 풀 프리뷰 |
| `lead/page.tsx` | Lead 랜딩 데모 페이지 |

## ODS · 에셋 프리뷰

| 구분 | 설명 |
|------|------|
| **카탈로그** | `src/catalog/ods-assets.json`, `src/catalog/ods-icons.json` — 컴포넌트명·타입·import 문자열 ( design-assets / product-design 카탈로그 규칙과 정렬 ). |
| **라이브러리 헬퍼** | `src/lib/ods-asset-library.ts` — 검색·타입 조회. |
| **StillImage URL** | `src/lib/preview-asset-url.ts` — `*StillImage` → `https://asset.ohousecdn.com/static/{Base}/image_480.webp` 등, 실패 시 png·picsum 폴백. `src/shims/bucketplace-assets-image.tsx` 가 `<img>` 에 적용. |
| **Lottie URL** | 동 파일에서 카탈로그에 등록된 `*Lottie` 컴포넌트명 → ohousecdn JSON URL 매핑. `LottieAssetView` + `lottie-react` 로 재생. |
| **렌더** | `OdsAssetRenderer` — image / lottie / `Icon*`(shim 아이콘) 분기. 슬롯 편집 시 `onRequestSlotEdit` 로 버튼 래핑. |
| **에셋 임베드 모달** | `AssetEmbedModal` — 카탈로그 검색, **IntersectionObserver** 로 썸네일 지연 로드, **원본 비율**(`object-contain` 등). |
| **푸터 래스터** | `footer-mcp-assets.ts` — Figma MCP에서 받은 URL(만료 가능). 상용 시 CDN·정적 파일로 교체 권장. |

## 폴더 구조 (요약)

```
app/
  layout.tsx, globals.css
  page.tsx                 # 빌더
  preview/[slug]/page.tsx
  lead/                    # Lead 데모 layout · page · css

src/
  schema/                  # doc, section/card presets, asset-modal-context, …
  store/builder-store.ts   # zustand — doc, selection, viewport, asset modal, embedAsset
  catalog/
    ods-assets.json
    ods-icons.json
  lib/
    seed.ts
    preview-asset-url.ts   # CDN / picsum / Lottie 매핑
    ods-asset-library.ts
    ods-icons.tsx, ods-prototype.tsx
    validate.ts, cn.ts
  shims/
    bucketplace-assets-image.tsx
    bucketplace-icons.tsx
  components/
    builder/
      BuilderShell, SectionTree, PreviewStage, Inspector
      section-add-menu.ts, AssetEmbedModal, ReviewModal, CellUsageSelect
      tabs/PropsTab, SlotsTab, AssetsTab
    preview/
      PreviewRenderer, Section, OdsAssetRenderer, LottieAssetView, Card
      sections/*Template, footer-mcp-assets.ts, __fixtures__/
    lead/                    # Lead 전용 블록·스토리

apps-script/                 # GAS 퍼블리시 골격 (README 참고)
```

## 데이터 모델 한눈에 보기

```
LandingPageDoc
├─ meta          { slug, title, category, owners }
├─ sections[]
│  └─ Section
│     ├─ preset    : SectionPresetId
│     ├─ locked    : boolean
│     ├─ props     : { [key]: any }
│     ├─ slots     : { [name]: ComponentInstance[] }
│     ├─ assets[]  : AssetSlot (slotName + AssetRef)
│     ├─ tokens[]  : TokenBinding
│     └─ visibility: { mobile, tablet, desktop }
├─ globalTokens[]
└─ audit
```

### 섹션 프리셋 (요약)

`header`, `hero`, `sticky-cta`, `footer` 는 기본 잠금; `usp`, `table`, `coverage`, `review`, `process`, `cross-sell`, `cta-form` 등 가변 섹션은 `section-presets.ts` · `SectionTree` / `section-add-menu.ts` 와 연동됩니다.

### 컴포넌트 프리셋

카드·행·탭·뱃지·폼 필드 등은 `component-presets.ts` 와 `Card` 프리뷰 셀(예: `CardStepCell`, 리뷰·USP 등)에서 소비됩니다.

## 좌측 SectionTree · 섹션 추가

- 트리 라벨은 `SECTION_PRESETS[preset].label` 기준.
- 추가 메뉴 단일 소스: `section-add-menu.ts` (기본 세트 + 마케팅 변형).
- Storybook `SectionPresetMenu` 스토리가 동일 규칙을 따릅니다.

## 핵심 동작 매핑

| 기능 | 위치 |
|------|------|
| 섹션 순서 (잠금 제외) | `SectionTree` + `builder-store.reorderSections` |
| 섹션 추가 | `section-add-menu.ts` + `builder-store.addSection` |
| 프리뷰 에셋 | `OdsAssetRenderer` + `preview-asset-url.ts` + image shim |
| 에셋 슬롯 교체 | 프리뷰 클릭 → `openAssetModal` / `AssetEmbedModal` → `embedAsset` |
| 뷰포트 | `PreviewStage` + 고정 폭 (375 / 768 / 1280) |
| 검수 요청 UI | `ReviewModal` (Jira/Slack 실연동은 추후) |
| UI Spec 검증 | `PropsTab` · `validate.ts` |
| 토큰 바인딩 데이터 | `doc.tokens` / `globalTokens` — 전용 인스펙터 탭은 없음 |

## 섹션 프리뷰 메모

- **Hero** (`HeroTemplate`): 배경 그라데이션, 배경 에셋 프레임(예: 225×150), **`object-contain`** 으로 잘림 최소화.
- **Footer** (`FooterTemplate`): 오늘의집 푸터형 **3단 그리드**(고객센터 | 링크 | 회사·인증·소셜), 회사정보 **토글**, 소셜은 인라인 SVG, 인증 이미지는 `footer-mcp-assets`.
- **Process 카드** (`CardStepCell`): 그라데이션 카드, 그래픽 영역 + `justify-between` 레이아웃 등.

## ODS 토큰 (Tailwind)

`tailwind.config.ts` 의 색·타이포·radius·spacing 은 `src/schema/ods-tokens.ts` 와 맞춥니다. 토큰 대규모 변경 시 두 곳을 함께 조정하세요.

## 배포 — Google Apps Script

`apps-script/` 에 Web App 퍼블리시 골격이 있습니다. 자세한 절차는 [apps-script/README.md](./apps-script/README.md) 를 참고하세요.

## 다음 단계 (아이디어)

1. **사내 패키지** — `@bucketplace/assets/image` 실패 시 shim 대신 workspace 패키지 연결.
2. **푸터 MCP URL** — 만료 시 design-assets 정적 경로 또는 `public/` 으로 교체.
3. **DnD 고도화** — 필요 시 `@dnd-kit` 등으로 키보드·스크롤 동기화.
4. **검수 연동** — `ReviewModal` 을 Jira / Slack API 로 교체.
5. **undo** — `zundo` 등 zustand 미들웨어.
6. **iframe 프리뷰** — 디바이스 프레임·격리가 필요할 때 `postMessage` 설계.

## design-assets 레포

아이콘·래스터·Lottie 메타의 소스 오브 트루스는 사내 **design-assets** 저장소입니다. 카탈로그 JSON 은 수동으로 동기화하거나, 클론 후 경로를 참고해 `src/catalog/` 을 갱신할 수 있습니다.
