---
name: lp-draft
description: 노션·문서·자연어 기획안을 받아 ODS 컴포넌트와 에셋 가이드라인을 지킨 오늘의집 랜딩페이지 HTML 시안을 만들고 프리뷰 링크를 준다. "랜딩페이지 시안 만들어줘", "LP 만들어줘", 노션 기획서 링크와 함께 시안/프리뷰 요청 시 사용.
---

# LP 시안 하네스 (lp-draft)

비디자이너·비기획자가 던진 기획안을 **오늘의집 랜딩페이지 시안 프리뷰 링크**로 바꾼다.
패턴 일관성은 Claude 의 감각이 아니라 하네스가 보장한다:

```
기획안(노션/문서/텍스트)
  └─(Claude) 1 brief 해석 → 2 섹션 구성 → 3 UX 라이팅 → lp-spec.json
        └─(lp build) compile: 프리셋 규칙 강제·ODS 에셋 검색
              → validate: 글자수·필수·CTA·금기어·문체
              → render: 빌더와 동일한 React 컴포넌트 SSR × 375/768/1280
              → render-QA: 실제 브라우저에서 잘림·가로스크롤·깨진 이미지
              → page.html(단일 파일, 에셋·폰트·CSS 임베드) + preview.html(리뷰 셸)
  └─(Claude) 4 에셋 톤 검수 → 필요 시 Figma AI 생성 → 재빌드
  └─(Claude) 5 Artifact 퍼블리시 → 링크 전달
```

**Claude 가 하지 않는 것:** HTML/CSS 직접 작성, 카탈로그 밖 레이아웃 발명, 원문에 없는 숫자 창작.

## 0. 환경 준비 (세션당 1회)

하네스 위치: `LandingPage-Builder` 레포의 `harness/` (원본: 사용자 컴퓨터 `~/Documents/Claude/Projects/LandingPage-Builder/landingpage-builder`).

| 환경 | 준비 |
|---|---|
| Claude Code (Mac 로컬) | 레포 루트에서 `npm install` · `~/design-assets` 가 있으면 그대로 사용 |
| 클라우드 세션 + 컴퓨터 연결 | ① 레포 clone (`Ohouse-product-design/LandingPage-Builder`) ② 연결 폴더의 `landingpage-builder/harness` 와 `src/components/preview/Card.tsx` 를 tar 로 묶어 stage → 레포에 덮어쓰기 ③ `bash harness/setup.sh` |
| 클라우드 세션 단독 | ① + `bash harness/setup.sh` (harness 가 레포에 머지된 경우) |

`setup.sh` 는 npm 의존성, Pretendard, design-assets(ODS 원본 480w 이미지만 sparse checkout)를 준비한다.
design-assets 접근은 `bucketplace/design-assets` 레포 읽기 권한(add_repo)이 필요하다. 원본이 없으면 에셋이 플레이스홀더로 렌더되므로 반드시 확인.

## 1–3. 기획 해석 → 섹션 구성 → 라이팅

`harness/prompts/` 를 순서대로 따른다.
- `01-brief-and-compose.md` — 입력 읽기, brief, 질문 최소화 규칙, 의도→프리셋 매핑, 시나리오 스택
- `02-ux-writing.md` — 오늘의집 톤, 자리별 공식, 길이 감각
- `spec-format.md` — lp-spec 필드·글자수·asset 표기

스펙 최상위에 `titleLayout`(`center` | `split`) 을 **반드시** 넣는다 — 페이지당 하나, 섹션별 변경 불가. 타이틀은 `\n` 없이 쓰고 줄바꿈은 하네스에 맡긴다.

작성한 스펙은 `harness/out/<slug>/spec.json` 에 저장하고:
```
node harness/bin/lp.mjs validate harness/out/<slug>/spec.json
```
`error` 가 0 이 될 때까지 카피를 고친다 (`warn` 은 판단해서 수정 또는 assumptions 에 근거 기록).

## 4. 빌드 + 에셋 톤 검수

```
node harness/bin/lp.mjs build harness/out/<slug>/spec.json --shots
node harness/bin/lp.mjs sheet harness/out/<slug>
```
- `asset-sheet.png` 를 열어 톤·중복·의미를 본다 → `prompts/03-assets.md`
- 리포트의 `생성 필요` 슬롯과 톤이 어긋난 슬롯은 Figma AI 로 생성 → `gen-import` → 스펙 교체 → 재빌드
- `shot-mobile.png` 를 한 번 보고 명백한 깨짐만 확인 (반복 금지)
- 생성형 이미지는 호출마다 Figma AI 크레딧이 든다. 사용할 플랜을 모르면 처음 한 번 물어본다.

## 5. 퍼블리시 + 전달

- `harness/out/<slug>/preview.html` 을 Artifact 로 퍼블리시 (첫 퍼블리시 icon: `layout`, description 한 문장). 같은 LP 수정은 같은 file_path 로 재퍼블리시해 링크 유지.
- 사용자에게: 프리뷰 링크 카드 + 2–3줄 (어떤 섹션으로 구성했는지, `확인 필요`/`가정한 내용` 핵심 1–3개). 단계 나열 금지.
- `page.html` 은 개발 핸드오프용 단일 파일. 요청 시 SendUserFile 또는 연결 폴더에 저장.
- 노션 LP 대시보드(Landing Pages v2 DB) 행이 있으면 `생성 LP URL` 에 링크 기록을 제안한다 (사용자 동의 후).

## 수정 요청 루프

"히어로 문구 바꿔줘", "후기 섹션 빼줘", "에셋 더 밝게" → spec.json 만 고치고 `build` → 같은 file_path 재퍼블리시.
섹션 추가 요청이 카탈로그 밖이면 가장 가까운 프리셋 + assumptions 에 "카탈로그 확장 후보" 기록.

## 실패 시

| 증상 | 조치 |
|---|---|
| `design-assets 원본 없음` | setup.sh 재실행 / DESIGN_ASSETS_ROOT 지정 |
| Figma `image.url` 다운로드 403 | 네트워크 허용 목록 밖 → 자동으로 미리보기(256px) 사용됨. 원본 품질이 필요하면 사용자에게 claude.ai 설정 > Capabilities 에서 `figma.com` 허용 요청 |
| render-QA `브라우저 실행 불가` | 시스템 playwright 확인. QA 없이도 빌드는 완료됨 (`--no-qa`) |
| 컴포넌트가 이상하게 렌더 | 하네스가 아닌 `src/components/preview/*` 이슈 → 디자이너(카탈로그 오너)에게 리포트, 임의 CSS 덧칠 금지 |
