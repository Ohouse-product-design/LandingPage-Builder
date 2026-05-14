# Landing Page Builder

오늘의집 서비스 랜딩페이지 빌더 어드민 — Next.js 14 + TypeScript + Tailwind 기반.

1차 산출물 범위는 **JSON 스키마 + 핵심 컴포넌트 골격** 입니다.
실제 데이터(Jira/Slack MCP, design-assets 레포)와의 통합은 다음 단계에서 진행됩니다.

## 시작하기

```bash
pnpm install   # 또는 npm/yarn
pnpm dev
```

브라우저에서 `http://localhost:3000` 접속하면 빌더가 열립니다.

타입체크: `pnpm typecheck`
빌드: `pnpm build`

## 폴더 구조

```
app/
  layout.tsx              # 루트 레이아웃 (다크 테마)
  page.tsx                # 빌더 진입점 → <BuilderShell />
  preview/[slug]/page.tsx # 프리뷰 페이지 (iframe 통합 시 사용)
  globals.css             # Tailwind + 스크롤바 스타일

src/
  schema/                 # 모든 타입 정의 — 빌더의 single source of truth
    doc.ts                # LandingPageDoc, Section, ComponentInstance, AssetSlot, TokenBinding
    section-presets.ts    # 11종 섹션 프리셋 (Hero/Usp/Table/Coverage/Review/Process/...)
    component-presets.ts  # 8종 컴포넌트 프리셋 (UspCard/ReviewCard/StepCard/...)
    ods-tokens.ts         # ODS 토큰 카탈로그 (Color/Typography/Radius/Spacing/Gradient)
    ui-spec.ts            # FieldSpec / UISpec — 글자수·줄수·필수 제약

  store/
    builder-store.ts      # zustand — doc, selection, viewport, modal, actions

  lib/
    seed.ts               # /moving 페이지 기반 시드 LandingPageDoc
    validate.ts           # UI Spec 검증 유틸 (validateField/validateProps/countChars/countLines)
    cn.ts                 # clsx 래퍼

  components/
    builder/              # 어드민 UI
      BuilderShell.tsx    # 3-pane 레이아웃 (Header / Tree / Preview / Inspector)
      BuilderHeader.tsx   # 상단 헤더 + 검수/배포 버튼
      SectionTree.tsx     # 좌측 섹션 트리 (DnD + 잠금 + 추가/삭제)
      PreviewStage.tsx    # 가운데 반응형 프리뷰
      Inspector.tsx       # 우측 인스펙터 4탭
      tabs/
        PropsTab.tsx      # 입력 + 실시간 UI Spec 검증
        SlotsTab.tsx      # 슬롯 내 컴포넌트 선택/삭제
        AssetsTab.tsx     # 에셋 슬롯 + 임베드 진입
        TokensTab.tsx     # ODS 토큰 카탈로그 + 바인딩
      AssetEmbedModal.tsx # design-assets 검색 모달 (mock)
      ReviewModal.tsx     # 검수 요청 모달 (Jira/Slack 시뮬레이션)
    preview/
      PreviewRenderer.tsx # 섹션별 mini wireframe — 다음 단계에서 실 컴포넌트로 교체
```

## 데이터 모델 한눈에 보기

```
LandingPageDoc
├─ meta          { slug, title, category, owners }
├─ sections[]
│  └─ Section
│     ├─ preset    : SectionPresetId  (hero | usp | review | ...)
│     ├─ locked    : boolean          (true 면 순서 변경/삭제 불가)
│     ├─ props     : { [key]: any }   (sectionTitle, subtitle, ...)
│     ├─ slots     : { [name]: ComponentInstance[] }
│     │              cards / reviews / steps / rows / services / fields
│     ├─ assets[]  : AssetSlot        (slotName + AssetRef)
│     ├─ tokens[]  : TokenBinding     (propPath ↔ ODS tokenRef)
│     └─ visibility: { mobile, tablet, desktop }
├─ globalTokens[]  : 전역 토큰 오버라이드
└─ audit           : 감사 로그
```

### 섹션 프리셋 카탈로그 (11종)

| 카테고리 | 프리셋 | 기본 잠금 | 슬롯 |
|---|---|---|---|
| fixed | `header`, `hero`, `sticky-cta`, `footer` | ✓ | — |
| content | `usp`, `table`, `coverage`, `review`, `process`, `cross-sell` | ✗ | cards/rows/items/reviews/steps/services |
| cta | `cta-form` | ✗ | fields |

각 프리셋의 `uiSpec` 가 어드민 입력 단계에서 글자수/줄수 제약을 강제합니다.

### 컴포넌트 프리셋 카탈로그 (8종)

`usp-card`, `review-card`, `step-card`, `service-card`, `table-row`, `tab`, `badge`, `form-field`

각 컴포넌트는 `uiSpec`(prop 제약) + `assetSlots`(에셋 슬롯) 을 정의합니다.

## 핵심 동작 매핑

| 요구 기능 | 구현 위치 |
|---|---|
| 섹션 순서 변경 (잠긴 영역 제외) | `SectionTree` (HTML5 native drag) + `builder-store.reorderSections` |
| 에셋 임베드 | `AssetsTab` → `AssetEmbedModal` → `builder-store.embedAsset` |
| Responsive Preview 패널 | `PreviewStage` + `VIEWPORT_WIDTH` (375/768/1280) |
| 검수 버튼 → 티켓/Slack | `BuilderHeader` → `ReviewModal` (Jira/Slack 통합은 다음 단계) |
| UI Spec 자동 검증 | `PropsTab` 실시간 카운터 + `ReviewModal` 의 전체 검증 패널 |
| ODS 토큰 바인딩 | `TokensTab` + `builder-store.bindSectionToken` |

## ODS 토큰 매핑

`tailwind.config.ts` 의 색상/타이포/radius/spacing 토큰은 `src/schema/ods-tokens.ts` 카탈로그와 **반드시 1:1 정합** 을 유지해야 합니다.
실제 ods 레포 연동 시 두 파일을 동시에 마이그레이션하세요.

## 배포 — Google Apps Script Web App

`apps-script/` 하위 폴더에 GAS Web App 으로 LandingPageDoc 을 퍼블리시하는 골격이 있습니다.

```bash
cd apps-script
bash install.sh                                # Homebrew / Node / clasp / clasp login
clasp create --type webapp --title "LP Publisher" --rootDir ./
clasp push
clasp deploy
```

자세한 흐름은 [apps-script/README.md](./apps-script/README.md) 참고. 핵심 동작은:
- `POST {webappUrl}` — 빌더에서 LandingPageDoc JSON push (X-Build-Token 인증)
- `GET  {webappUrl}?slug=moving` — Properties 에 저장된 doc 으로 HTML 렌더
- 빌더 React 미리보기와 **동일한 ODS 토큰 CSS** 사용 (Index.html `:root` 참고)

## 다음 단계

1. **실 컴포넌트 연결** — `PreviewRenderer` 의 미니 wireframe 을 첨부한 20개 tsx (UspCards, ReviewCarousel, SectionProcess 등) 실제 컴포넌트로 교체.
2. **DnD 라이브러리 도입** — 1차 골격은 HTML5 native drag. dnd-kit 으로 교체해 키보드 접근성/스크롤 동기화 개선.
3. **에셋 레포 통합** — `AssetEmbedModal` 의 mock 카탈로그를 design-assets GraphQL/REST API 로 교체.
4. **검수 자동화** — `ReviewModal` 의 시뮬레이션 코드를 Jira / Slack MCP 커넥터 호출로 교체.
5. **배포 파이프라인** — `LandingPageDoc` JSON 을 CDN/CMS 로 publish + SSR 단에서 실 페이지 렌더.
6. **히스토리 / undo** — zustand 미들웨어(`zundo`) 추가.
7. **iframe 프리뷰** — 1차는 동일 프로세스 렌더. iframe + postMessage 로 격리 + 디바이스 프레임 적용.
