# 4. 에셋 — Storybook/ODS 카탈로그에 정의된 것만

## 원칙 (2026-10 디자인 결정)
- **임의로 만들지 않는다.** 에셋은 `catalog/ods-asset-index.json`(design-assets = Storybook 에 정의된 ODS 에셋 920종)에서만 고른다.
- 맥락에 맞는 에셋이 없으면 **플레이스홀더로 비워두고** 리포트 `warn` 으로 어느 슬롯이 비었는지 사용자에게 피드백한다 ("디자이너에게 에셋 요청"). 비슷해 보이는 엉뚱한 에셋으로 채우지 않는다.
- 생성형(Figma AI 등) 에셋은 기본 차단. 디자이너가 승인한 경우에만 스펙 최상위 `allowGeneratedAssets: true` + `{file, prompt, alt}` 로 허용한다.

## 사이즈 규칙 (컴포넌트가 강제 — 스펙에서 조절 불가)
| 자리 | 규칙 |
|---|---|
| 리스트 타입 카드(pillcard) 좌측 | 에셋 **28×28** + 좌우 패딩 4, 박스 없음. 카드 안쪽 패딩 25 |
| 리스트 leading icon (listcard·stepcard 좌측) | 에셋 **24×24**. 흰 배경 위(listcard)만 `surface.gray` 박스 40, 회색 컨테이너 안(stepcard)은 박스 없이 |
| 카드 안 에셋 (imgcard leading-asset) | **40×40 고정**, 카드 좌상단 |
| 풀배경 카드 (bgfullimg) | **사용하지 않음** — usp 는 항상 leading-asset 으로 일괄 적용 |
| 히어로 비주얼 | center 225×150 / split 360×240 |
| 프로세스 | 에셋 없음 — **넘버링 leading**(01·02·03, primary 원형) |

## 스타일 통일 — 같은 섹션은 한 스타일만 (compile 강제)
에셋 스타일은 `flat`(숏컷 SVG) · `3d`(ODS 3D 일러스트) · `photo`(실사 `AssetPhoto*`) 세 가지. 슬롯 역할이 스타일을 정한다 — 24 이하(리스트 leading)는 **flat만**, 24 초과(카드 안 40·히어로)는 **3d만**(query 에 '사진·실사' 가 있으면 photo만). 검색은 해당 스타일만 후보로 보고, `id` 로 다른 스타일을 지정하면 비우고 warn. 한 섹션에 두 스타일이 섞이면 validate error.

## 목업 섹션 화면 — 스크린 디렉토리에서만
`mockup` 섹션의 폰 화면은 **Loom 플러그인(bucketplace-loom)이 동기화한 정본 화면**에서 가져온다 — `loom` MCP `list_screens`/`get_screen` 으로 id 를 찾고 `workbench_sketch_new` → `workbench_compile_check({shot:true, query:{env:"ios27-iphone-17"}})` 로 찍은 PNG 를 `screen.file` 로(생략 시 `~/Loom` 의 `.loom/shots` 를 자동 탐색). 하네스는 PNG 를 402:874 비율로 상단 크롭해 임베드. Loom 이 없으면 스크린 디렉토리 인덱스(`lp screens "키워드"`)·캐시·다운로드 순으로 시도하고, 그래도 없으면 '화면 미정' placeholder + warn — 다른 화면·임의 이미지로 대체하지 않는다.

## 팔레트 틴트 — 같은 섹션은 한 색 계열 (렌더 시 자동)
섹션 `palette: blue | red | orange | green | mono` (생략 시 페이지 `assetPalette` 계열, 기본 blue). 임베드 단계에서 섹션 안 모든 아이콘·에셋의 채도 있는 색 hue 를 팔레트 hue 로 바꾸고 명도·채도는 유지(음영 보존), mono 는 채도 0. 평면 아이콘의 중간 톤 회색도 팔레트 색으로 입히고, 흰·검(하이라이트·외곽)은 그대로. 검색도 같은 계열 ODS 컬러(GenuineBlue·CoralRed·MangoOrange·JadeGreen·DavyGray)를 우선.

## 시각 크기 통일 (렌더 시 자동)
같은 섹션의 에셋은 시각적으로 같은 크기로 보이도록 임베드 단계에서 **투명 여백을 잘라내고 정사각 박스에 contain** 으로 맞춘다 (SVG 는 viewBox 재작성으로 벡터 유지, 비트맵은 trim+extend). 원본에 여백이 많은 숏컷도 다른 에셋과 같은 크기로 보인다. header·footer 로고는 제외.

## 역할별 검색 — 슬롯 크기로 결정 (24 이하 = 아이콘, 24 초과 = 에셋)
- **24 초과 슬롯**(히어로 225/360 · 카드 안 40) → `asset: { query }` — ODS 3D 일러스트, 제뉴인 블루 우선, 실사·평면 SVG 배제
- **24 이하 슬롯**(리스트 leading: pillcard·stepcard·listcard·cross-sell) → `icon: { query }` — ODS 숏컷 아이콘(Small SVG) 우선, 블루·그레이 계열. 3D 에셋은 차선
- 스펙에 `asset` 을 써도 슬롯이 24 이하면 compile 이 아이콘 역할로 검색한다
- 미리 보려면 `node bin/lp.mjs assets "키워드" [--role icon-small]`
- 점수 3 미만이면 채택하지 않고 플레이스홀더
- 이미지 출처: design-assets 원본 → (SVG) 패키지 동봉 `catalog/svg/` → (3D) CDN `asset.ohousecdn.com/static/<Asset>/image_480.png`(Storybook `@bucketplace/assets` 와 같은 경로) → 플레이스홀더. 즉 원본 권한이 없어도 CDN 이 열린 환경이면 전부 채워진다

## 톤 검수 (빌드 후 1회)
`node bin/lp.mjs sheet out/<slug>` → `asset-sheet.png`: 한 페이지 = 한 일러스트 언어, 같은 오브젝트 중복 없음, 의미 일치. 어긋나면 query 를 바꾸거나 `id` 로 지정. 그래도 없으면 비워두고 피드백.

## 피드백 형식 (답변에 포함)
```
에셋 미정 2곳 — 카탈로그에 맞는 에셋이 없어 비워뒀어요
- sections[2](usp).items[0] "신축 아파트": 후보 없음 → 디자이너에게 3D 아파트 에셋 요청
- sections[0](hero) "청소 도구": AssetCleaningToolLargeGenuineBlueView1 (점수 2.5, 미달) → 확인 후 id 지정 가능
```
