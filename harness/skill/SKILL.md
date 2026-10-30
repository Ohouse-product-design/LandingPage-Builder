---
name: lp-draft
description: 노션·문서·URL·자연어 기획안을 받아 ODS 컴포넌트·에셋 가이드라인을 지킨 오늘의집 랜딩페이지 HTML 시안을 만들고 프리뷰 링크를 준다. "LP 시안 만들어줘", "랜딩페이지 만들어줘", 기획서 링크·기존 페이지 URL과 함께 시안/프리뷰/재제작 요청 시 사용.
---

# LP 시안 하네스 (lp-draft)

비디자이너·비기획자가 던진 기획안을 **오늘의집 랜딩페이지 시안 프리뷰 링크**로 바꾼다.
레이아웃·스타일·에셋 일관성은 Claude 의 감각이 아니라 하네스가 결정적으로 보장한다.

```
기획안(문서 URL / 첨부 문서 / 기존 페이지 URL / 텍스트)
  └─(Claude) 1 brief 해석 → 2 섹션 구성 → 3 UX 라이팅 → spec.json
        └─(lp build) compile: titleLayout 주입 · 카드 변형 자동 채택 · 프리셋 규칙 강제 · ODS 에셋 검색 · 가독성 줄바꿈
              → validate: 글자수·필수·CTA·금기어·문체·레이아웃 택1
              → render: 빌더와 동일한 React 컴포넌트 SSR × 375/768/1280
              → render-QA: 실브라우저 잘림·가로스크롤·깨진 이미지
              → page.html(단일 파일, 에셋·폰트·CSS 임베드) + preview.html(리뷰 셸)
  └─(Claude) 4 에셋 톤 검수 → 필요 시 Figma AI 생성 → 재빌드
  └─(Claude) 5 Artifact 퍼블리시 → 링크 전달
```

**Claude 가 하지 않는 것:** HTML/CSS 직접 작성, 카탈로그 밖 레이아웃 발명, 카드 변형 직접 선택(형태만 맞춤), 카탈로그 밖 에셋 생성·대체, 원문에 없는 숫자 창작.

## 0. 환경 준비 (세션당 1회)

레포 `Ohouse-product-design/LandingPage-Builder` (main 에 머지된 `harness/`). 로컬 사본: `~/Documents/Claude/Projects/LandingPage-Builder/landingpage-builder`.

| 환경 | 준비 |
|---|---|
| Claude Code (Mac) | 레포 루트에서 `bash harness/setup.sh` (`~/design-assets` 있으면 그대로 사용) |
| 클라우드 세션 | ① `add_repo` → clone ② `bucketplace/design-assets` add_repo(read) ③ `bash harness/setup.sh` |

`setup.sh` = npm 의존성 · Pretendard 서브셋 도구 · design-assets 480w sparse checkout · 에셋 인덱스 · 렌더 번들.
design-assets 원본이 없으면 에셋이 플레이스홀더로 렌더되므로 반드시 확인. 입력이 **기존 페이지 URL** 이면 Chrome 으로 열어 본문·FAQ 펼침 텍스트·메타를 전부 추출한 뒤 시작.

## 1–3. 기획 해석 → 섹션 구성 → 라이팅

`harness/prompts/` 를 순서대로 따른다.
- `01-brief-and-compose.md` — 입력 읽기, brief, 질문 최소화(목적·액션·타깃 중 2개 이상 불명일 때만 1회), **titleLayout 택1**, 의도→프리셋, **카드 변형 자동 채택 표**(아이템 형태만 맞추면 하네스가 고름), 시나리오 스택
- `02-ux-writing.md` — 해요체·짧은 문장, 자리별 공식·글자수(변형 4종 포함), **타이틀은 `\n` 없이** 한 줄로(줄바꿈은 하네스)
- `spec-format.md` — lp-spec 필드·asset/icon 표기

필수 규칙
- `titleLayout: "center" | "split"` 최상위 필수, 페이지당 하나. 원문이 중앙 정렬 히어로면 center, 설명 많은 신청형이면 split.
- 사실·숫자·조건은 원문에서만. 없으면 `assumptions` 에 기록(리뷰 셸에 노출).
- 카드 변형: `links[]`→링크 묶음, 설명 없는 ≤14자+icon→혜택 필, 단일 카드 '라벨: 값'+단위→조건 표, ≥5단계/icon만/icon+보조문→세로 단계. 꼭 지정할 때만 `card:`.

스펙은 `harness/out/<slug>/spec.json` 에 저장:
```
node harness/bin/lp.mjs validate harness/out/<slug>/spec.json
```
`error` 0 까지 카피를 고친다. `warn` 은 수정 또는 assumptions 에 근거. `info` 의 "카드 변형 →", "가독성 줄바꿈 적용" 은 결과 확인용.

## 4. 빌드 + 에셋 톤 검수

```
node harness/bin/lp.mjs build harness/out/<slug>/spec.json --shots
node harness/bin/lp.mjs sheet harness/out/<slug>
```
- `asset-sheet.png` 로 톤(ODS 3D 제뉴인 블루 / 숏컷 Small SVG)·중복·의미 확인 → `prompts/03-assets.md`
- **에셋은 카탈로그(Storybook 정의 ODS)에서만.** 맞는 게 없으면 플레이스홀더로 비워두고, 답변에 "에셋 미정 N곳 — 어느 슬롯·어떤 의미·후보 유무"를 피드백한다(`references/03-assets.md` 형식). 임의 생성·유사 에셋 대체 금지. 생성형은 디자이너가 승인해 `allowGeneratedAssets: true` 를 줬을 때만.
- **목업 섹션(`mockup`) 화면은 Loom 플러그인에서 가져온다.** 기획에 "실제 화면·앱에서 이렇게" 맥락이 있으면 `mockup` 섹션을 두고, 화면은 임의 이미지가 아니라 Loom(Ohouse Design) 정본에서:
  1. 세션에 `loom` MCP 가 있으면 `list_screens({ track })` / `get_screen(id)` 로 화면 id 를 찾는다(없으면 `node harness/bin/lp.mjs screens "키워드"` 로 로컬 인덱스 검색).
  2. `workbench_sketch_new({ slug: "lp-<화면slug>", screen: "<id>" })` → `workbench_compile_check({ project: "sketches/lp-<화면slug>", screenKey: "<id>", shot: true, query: { env: "ios27-iphone-17" } })` 로 PNG 를 찍는다(`~/Loom/.../.loom/shots/`).
  3. 스펙에 `"screen": { "id": "<id>", "file": "<PNG 경로>" }` — file 을 생략해도 하네스가 `~/Loom` 의 shots 를 화면 slug 로 자동 탐색한다(`LOOM_HOME` 존중).
  4. Loom 플러그인이 없고 네트워크도 막혀 이미지를 못 받으면 '화면 미정' placeholder 로 두고 답변에 "화면 미정 — `/loom-setup` 후 재빌드" 로 피드백한다. 다른 화면·스크린샷으로 대체하지 않는다.
- `shot-mobile.png`·`shot-desktop.png` 를 한 번만 보고 명백한 깨짐만 확인.
- 컴포넌트 자체 문제(패딩·폭·정렬)는 `src/components/preview/*` 에서 고치고 README "빌더 소스 변경" 에 기록. 하네스 CSS 덧칠 금지.

## 5. 퍼블리시 + 전달

- `harness/out/<slug>/preview.html` 을 Artifact 로 퍼블리시(첫 publish `icon: layout`, description 한 문장). 같은 LP 수정은 같은 file_path 재퍼블리시로 링크 유지. "다시 제작"은 `<slug>-v2` 로 새 링크(비교용).
- 답변: 프리뷰 링크 + 섹션 구성 한 줄 + `가정한 내용`/`확인 필요` 핵심 1–3개 + **에셋 미정 목록**(있으면). 단계 나열 금지.
- `page.html` 은 개발 핸드오프용 단일 파일(요청 시 전달). 예제로 남길 스펙은 `harness/examples/` 에 복사.
- 레포 반영 요청 시: 브랜치 커밋 → push → PR (GraphQL 불가 → `gh api repos/.../pulls`).

## 수정 요청 루프

문구·섹션·에셋 수정 → spec.json 만 고치고 build → 같은 file_path 재퍼블리시.
카탈로그 밖 요청(전·후 비교, 영상 등) → 가장 가까운 프리셋 + assumptions "카탈로그 확장 후보".

## 실패 시

| 증상 | 조치 |
|---|---|
| `titleLayout` error | 스펙 최상위에 center/split 추가 (섹션별 지정 제거) |
| `design-assets 원본 없음` → CDN 폴백 실패 | `lp doctor` → 권한 요청 / 팀원 `pack-assets` 수령 / 플레이스홀더로 먼저 리뷰 |
| Figma image.url 403 | 허용 목록 밖 → 미리보기(256px) 자동 사용. 원본 필요 시 claude.ai Capabilities 에 figma.com 허용 요청 |
| render-QA 브라우저 실행 불가 | 시스템 playwright 확인, `--no-qa` 로 빌드는 가능 |
| 카드 변형이 기대와 다름 | 아이템 형태(링크/설명 유무/단위/단계 수)를 표에 맞추거나 `card:` 로 명시 |
