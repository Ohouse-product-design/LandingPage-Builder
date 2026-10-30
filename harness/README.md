# LP 시안 하네스

기획안(노션 · 문서 · 자연어) → **ODS 컴포넌트·에셋 가이드라인을 지킨 랜딩페이지 HTML 시안 + 프리뷰 링크**.
비디자이너·비기획자가 Claude 에게 기획안을 던지면, Claude 는 `skill/SKILL.md` 절차대로 **콘텐츠만** 만들고
레이아웃·스타일·에셋 일관성은 아래 결정적(deterministic) 파이프라인이 책임진다.

```
           Claude (판단)                                하네스 (결정적)
 ┌───────────────────────────────┐      ┌─────────────────────────────────────────────┐
 │ 1 brief  : 목적·타깃·약속·근거   │      │ compile  프리셋 규칙 강제 (usage/cardType/   │
 │ 2 compose: 의도 → 섹션 프리셋    │ ───▶ │          layout/배경/고정섹션 순서)            │
 │ 3 copy   : 오늘의집 톤·글자수    │ spec │ assets   ODS 920종 검색·팔레트 통일·중복 방지   │
 │ 4 assets : 톤 검수 / AI 생성     │ .json│ validate 글자수·필수·CTA·금기어·문체           │
 └───────────────────────────────┘      │ render   빌더와 같은 React 컴포넌트 SSR ×3폭    │
                 ▲                        │ QA       실브라우저 잘림·가로스크롤·깨진 이미지  │
                 └──── report.json ◀───── │ out      page.html(단일 파일) + preview.html    │
                                          └─────────────────────────────────────────────┘
```

## 왜 이 구조인가
- **HTML 을 LLM 이 쓰지 않는다.** `src/components/preview/*` (디자이너가 승인한 카탈로그)를 그대로 SSR 하므로 빌더 프리뷰와 1:1.
- **LLM 이 고를 수 있는 건 카탈로그 안의 선택지뿐.** 허용되지 않은 layout/cardType 은 컴파일러가 보정하고 리포트에 남긴다.
- **에셋은 ODS 원본에서.** design-assets 의 `.adf.jsonc` 한국어 키워드로 검색 → 480w 원본을 data URI 로 임베드.
  카탈로그에 없으면 ODS 3D 스타일 프롬프트로 Figma AI 생성 → 배경 제거·규격화 후 같은 경로로 임베드.
- **산출물은 외부 의존 0.** CSS(Tailwind ODS 토큰), Pretendard(사용 글자만 서브셋), 이미지 모두 인라인 → Artifact·메일·핸드오프 어디서나 동일.

## 폴더
```
harness/
  skill/SKILL.md            Claude 실행 절차 (lp-draft 스킬)
  prompts/                  brief·구성 / UX 라이팅 / 에셋 / spec 포맷 규칙
  bin/lp.mjs                CLI: catalog · assets · validate · build · sheet · gen-import
  bin/build-asset-index.mjs design-assets → catalog/ods-asset-index.json
  lib/compile.mjs           spec → LandingPageDoc (프리셋 규칙)
  lib/validate.mjs          가이드 검증
  lib/assets.mjs            ODS 검색·임베드
  lib/gen.mjs               생성형 에셋 후처리 (배경 제거·480 정규화)
  lib/assemble.mjs          SSR ×3폭 + CSS + 폰트 + 리뷰 셸
  lib/render-qa.mjs         Playwright 렌더 QA
  render/                   SSR 엔트리·esbuild 설정
  examples/                 샘플 기획 메모·spec
  out/<slug>/               spec.json · doc.json · report.json · page.html · preview.html · asset-sheet.png · gen/
```

## ODS 에셋 원본 — 읽기 권한이 없을 때
`bucketplace/design-assets` 읽기 권한이 없으면 `setup.sh` 가 원본을 받지 못한다. 그래도 빌드는 되고, 에셋은 아래 순서로 채워진다.

| 순위 | 방법 | 결과 |
|---|---|---|
| 1 | 원본 (`~/design-assets`, `~/.lp-draft/design-assets`, `DESIGN_ASSETS_ROOT`) | 480w 원본 임베드 (정상) |
| 2 | **CDN 폴백** `asset.ohousecdn.com/static/<Asset>/image_480.webp` — 자동, `~/.lp-draft/cdn-cache` 에 캐시 | 대부분 정상 (일부 미배포 에셋은 실패) |
| 3 | 플레이스홀더 | 회색 이미지 박스 + 리포트 `warn` |

권한이 없을 때 할 일:
1. `node harness/bin/lp.mjs doctor` 로 현재 상태 확인 (원본 유무·**카탈로그 커버리지**·CDN 도달 여부). 커버리지 95% 미만이면 오래된 사본 → `git pull`
2. `#ai_frontier` 에 **bucketplace/design-assets 읽기 권한** 요청 (Product Design 팀원은 대부분 보유)
3. 급하면 권한 있는 팀원에게 `node harness/bin/lp.mjs pack-assets` 결과(`ods-assets-pack.tgz`, 약 40MB)를 받아 `tar -xzf` 후 `DESIGN_ASSETS_ROOT=<풀린 폴더>` 로 지정 (또는 `~/design-assets` 에 배치)
4. CDN 도 막힌 환경(사내 프록시 등)이면 플레이스홀더로 시안을 먼저 보고, 에셋은 권한 확보 후 재빌드

## 마켓플레이스 임베드본
`node harness/bin/pack-plugin.mjs <dest>` 가 렌더에 필요한 `src` 서브셋 + 하네스 런타임 + 최소 package.json 을 묶어 독립 폴더를 만든다 (Next 앱·빌더 어드민 제외, 약 2MB). 마켓플레이스 `plugins/product-design/skills/lp-draft/harness/` 가 이 결과물이며, 레포 쪽이 원본이다 — 하네스를 고치면 다시 pack 해서 MR.

## 빠른 시작
```bash
bash harness/setup.sh                                   # 의존성 · design-assets · 인덱스 · 번들
node harness/bin/lp.mjs build harness/examples/moving.spec.json --shots
open harness/out/moving-1person/preview.html
```

## 카드 변형 9종과 자동 채택
`imgcard(leading-asset) · reviewcard · listcard · tablecard · faqcard` + **`linkcard · pillcard · kvcard · stepcard`** (2026-10 추가, `src/schema/card.ts` 단일 Card usage).
`lib/compile.mjs chooseCardUsage` 가 아이템 형태 신호로 결정적으로 고르고(`links[]` → linkcard, 설명 없는 ≤14자+아이콘 → pillcard, 단일 카드 '라벨: 값'+단위 → kvcard, ≥5단계/아이콘만/보조문 안내 → stepcard), 스펙 `card:` 로 허용 목록 안에서 override. 근거는 리포트 `info`. 필·단계 아이콘은 `icon-small` 역할로 ODS 숏컷(Small SVG) 우선.

## 에셋 규칙 (2026-10)
- Storybook/ODS 카탈로그에 정의된 에셋만. 없으면 플레이스홀더 + 리포트 `warn`(어느 슬롯이 비었는지) — 임의 생성·유사 대체 금지. 생성형은 `allowGeneratedAssets: true` 일 때만
- 슬롯 크기로 역할 결정: **24 이하 → 아이콘(숏컷 SVG)**, 24 초과 → 3D 에셋. 리스트 leading icon: bg 박스 40 안에 ≤24 · 카드 안 에셋: 40 고정 · 프로세스: 넘버링 leading(에셋 없음) · 히어로는 예외
- usp·조건 설명 섹션의 기본은 **리스트 타입(pillcard)**: 배경색 카드 + 아이콘 24 + 제목(+서브타이틀 1줄). 배경은 회색 일괄(베리언츠는 스펙 `tone:"cases"` 명시 시에만)
- 같은 섹션 아이콘 팔레트 틴트(blue/red/orange/green/mono): 임베드 시 hue 치환(명도·채도 보존), 평면 아이콘 중간 회색도 착색. 섹션 `palette` > 페이지 `assetPalette` > blue
- 리스트 타입 아이콘 28 + 좌우 패딩 4 (박스 없음)
- 짧은 텍스트 usp(제목 ≤127px@20px, 설명 ≤2줄) 3개↑ → 밀도 카드 그리드(모바일 2열, 데스크톱 160 고정 4열, 카드 높이 132)
- 2×n 그리드 홀수 개 → 가로 한 줄(`ROW`, carousel autoScroll:false): 들어가면 그대로(`safe center`), 넘치면 가로 스크롤 스냅. CarouselLayout 수동 모드 스크롤 버그(outer overflow-hidden) 수정
- 같은 섹션은 한 에셋 스타일만(flat 숏컷 / 3d / photo): 슬롯 역할이 스타일을 정하고(≤24 flat, >24 3d, '실사' 요청 시 photo) 검색은 그 스타일만 후보, 다른 스타일 id 지정은 비움+warn, 혼용은 validate error
- 캐로셀이 아닌 콘텐츠 컨테이너는 데스크톱·태블릿 max-width 720 (`data-layout="content"`; 캐로셀 섹션은 1256 유지)
- 같은 섹션 에셋의 시각 크기 통일: `toDataUri(..., {normalize:true})` 가 투명 여백 trim + 정사각 contain (SVG viewBox 재작성, 비트맵 trim/extend). 리스트 leading icon 은 흰 배경 박스 없이 24 (흰 배경 위 listcard 만 gray 박스)
- 섹션 스크롤 리빌(기본): 콘텐츠 섹션(`data-reveal`, header·sticky·footer 제외)이 뷰포트에 들어오면 28px 아래에서 올라오며 나타남(0.6s). IntersectionObserver 가 `html.lp-reveal` 을 붙였을 때만 숨기므로 JS 없음·reduced-motion·QA 캡처(`__LP_NO_REVEAL`)는 그대로 보임
- 리스트 타입 카드 안쪽 패딩 25 (기존 20 의 125%)
- 히어로 chevron 은 상하 바운스 어포던스(`animate-bounce`, reduced-motion 시 정지)
- 풀배경 카드(bgfullimg)는 제외 — usp 는 leading-asset 으로 일괄 적용 (스펙에 bgfullimg 를 써도 compile 이 보정하고 리포트에 남김)
- 표 2개: 행 텍스트가 모바일 2열 셀 폭(136px) 안에 1줄이면 모바일도 2열 나란히, 아니면 1열 스택 (`columns.mobile` 을 compile 이 결정, Card 가 그대로 따름)

## 목업 섹션 (2026-10)
`mockup` 프리셋: [태그 필] → 타이틀 → 설명 → 하늘색(#C9E4FF) 라운드 컨테이너 안 폰 목업(CSS 베젤 + 스크린 디렉토리 썸네일, 하단 잘림). 섹션 배경 회색. `lib/screens.mjs` 가 `catalog/ohouse-screens-index.json`(331개, `lp screens sync` 로 재생성)에서 한국어 검색 → `~/.lp-draft/screens/` 캐시 → 다운로드 → 실패 시 '화면 미정' placeholder + warn. 빌더 쪽: `section-presets.ts` mockup, `MockupTemplate.tsx`, 추가 메뉴·썸네일 등록.

## 레이아웃·줄바꿈 규칙
- `titleLayout` 은 페이지당 하나(`center` | `split`). compile 이 모든 섹션 props 에 같은 값을 주입하고, 섹션별 지정은 validate 에서 error.
  - center: 히어로 세로 스택 중앙, 섹션 타이틀 중앙, imgcard 그리드 중앙 정렬
  - split: 히어로 좌 텍스트·CTA / 우 에셋(360px), 모바일은 좌정렬 세로 스택, 섹션 타이틀 좌측
- 타이틀 줄바꿈(`lib/linebreak.mjs`): Pretendard SemiBold 실측 글자폭(`catalog/font-widths.json`) × font-size 로 모바일 폭을 재고, 쉼표·조사 뒤 우선 / 수식어 뒤·1글자 고아 회피 / 줄 길이 편차 최소로 2줄 분할. 카드 타이틀은 폭 초과 시 warn.

## 빌더 소스 변경 (이 하네스 도입 시 함께 반영)
- `Card.tsx` FAQ 답변: 닫힘 상태도 `hidden` 으로 DOM 유지 (정적 export 에서 답변 유실 방지, 빌더 동작 동일)
- `Card.tsx` bgfullimg 태그: absolute 고정 → 타이틀 위 흐름 배치 (본문 2줄일 때 겹침 수정)
- `card.ts` + `Card.tsx` + `Card.stories.tsx`: 변형 4종(linkcard·pillcard·kvcard·stepcard) 슬롯 `links`/`rows`, 셀 렌더러, 스토리. `ods-icons.tsx` 에 IconArrowDownToLine·IconHeadset·IconLink(design-assets 원본 패스) 추가, IconArrowRight 원본 패스로 교체
- `Card.tsx`/`OdsAssetRenderer.tsx`/`HeroTemplate.tsx`: `LeadingIcon`(bg 40 + 에셋 24)·`LeadingNumber`, leading-asset 카드 에셋 40 고정, 빈 슬롯은 선물 이미지 대신 중립 placeholder
- `StickyCtaTemplate.tsx`: fixed + spacer, ATF(히어로) 지나간 뒤 노출(240ms 트랜지션), 흰색 dim 그라데이션, 모바일 100% / PC max-width 480. 빌더는 컴포넌트 effect, 정적 export 는 page 스크립트가 같은 규칙으로 토글. PC 에서도 기본 노출
- `SectionTitleBlock.tsx` / `HeroTemplate.tsx` / `Card.tsx`: `props.titleLayout`(center | split) 분기 — 히어로 split 변형(좌 텍스트/우 에셋), 섹션 타이틀 중앙 정렬, imgcard 그리드 중앙 정렬. 타이틀에 `text-wrap: balance`
- `Card.tsx` imgcard 카드 폭 260–300px: grid 는 `auto-fill` 로 들어가는 만큼 열 생성(1280→4열, 768→2열), carousel 카드폭도 300 상한

## 카탈로그 오너 확인 필요
- footer 인증 마크(ISMS·ISO·PCR)가 Figma MCP 임시 URL → design-assets 에 정식 에셋 등록 필요 (현재 정적 export 에서 비표시)
- design-assets 에 없는 3D 오브젝트(스마트폰·달력·쿠폰·클립보드 등)는 생성형으로 채워짐 → 자주 쓰이면 정식 에셋화 후보
