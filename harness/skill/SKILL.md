---
name: lp-draft
description: 노션·문서·URL·자연어 기획안을 받아 ODS 컴포넌트·에셋 가이드라인을 지킨 오늘의집 랜딩페이지 HTML 시안을 만들고 프리뷰 링크를 준다. "LP 시안 만들어줘", "랜딩페이지 만들어줘", 기획서 링크·기존 페이지 URL과 함께 시안/프리뷰/재제작 요청 시 사용.
---

# LP 시안 하네스 (lp-draft)

비디자이너·비기획자가 던진 기획안을 **오늘의집 랜딩페이지 시안 프리뷰 링크**로 바꾼다.
레이아웃·스타일·에셋 일관성은 Claude 의 감각이 아니라 하네스가 결정적으로 보장한다.

```
기획안(HTML/URL · 노션 · 문서 · 텍스트)
  └─ 0 세팅·권한 점검 ─ 1 입력 받기 ─ 2 옵션 3개 묻기(한 번에)
        [1] UX 라이팅: 검토·다듬기 | 기획안 그대로
        [2] 섹션 타입: 하네스 추천 자동 | 섹션별 순차 확인
        [3] 히어로 소재: 카탈로그 에셋 | #des_graphic_요청 티켓 초안 | 나중에
  └─ 3 brief → 섹션 구성(옵션 [2]) → 4 라이팅(옵션 [1]) → spec.json
        └─(lp build) compile → validate → SSR ×3폭 → 렌더 QA → page.html + preview.html
  └─ 5 에셋·화면 검수 → 6 Artifact 퍼블리시 → 7 히어로 소재 티켓(옵션 [3])
```

**Claude 가 하지 않는 것:** HTML/CSS 직접 작성, 카탈로그 밖 레이아웃 발명, 카드 변형 직접 선택(형태만 맞춤), 카탈로그 밖 에셋 생성·대체, 원문에 없는 숫자 창작, 사용자 확인 없는 Slack 전송.

## 0. 세팅·권한 점검 (세션당 1회, 시작하자마자)

레포 `Ohouse-product-design/LandingPage-Builder` (`harness/`). 로컬 사본: `~/Documents/Claude/Projects/LandingPage-Builder/landingpage-builder`.

```
bash harness/setup.sh          # 최초 1회: npm · Pretendard 서브셋 도구 · design-assets sparse · 에셋 인덱스 · 렌더 번들
node harness/bin/lp.mjs doctor # 매 세션: 아래 표의 상태를 한 번에 보여 준다
```

| 게이트 | 필요한 것 | 없을 때 |
|---|---|---|
| 렌더 | Node 20+, npm, Chromium(Playwright) | Chromium 없으면 `build --no-qa` (렌더 QA 만 생략) |
| ODS 에셋 | `bucketplace/design-assets` 읽기 권한 → `~/design-assets` (커버리지 ≥95%) | CDN 폴백(자동) → 플레이스홀더. `#ai_frontier` 에 권한 요청 또는 팀원 `pack-assets` 수령. 플레이스홀더 시안을 "완성"이라 말하지 않는다 |
| 기획안 읽기 | 노션 링크 → `Notion` MCP(`notion-fetch`) · 구글독스 → `Google Drive` MCP · HTML/URL → Chrome 확장(`claude-in-chrome`) · 첨부 → 파일 읽기 | 커넥터가 없으면 사용자에게 본문 붙여넣기 요청(추측으로 채우지 않음) |
| 목업 화면 | Loom 플러그인(`bucketplace-loom`): `loom` MCP + `~/Loom` 캡처 | '화면 미정' placeholder + "`/loom-setup` 후 재빌드" 안내 |
| 그래픽 소재 티켓 | `Slack` MCP(드래프트 생성) + `#des_graphic_요청` 채널 멤버 | 티켓 본문만 답변에 적어 주고 직접 올리도록 안내 |
| 퍼블리시 | Artifact 도구 | `preview.html` 파일로 전달 |

점검 결과는 답변 첫 줄에 한 줄로("세팅 OK — 에셋 원본 98%, Loom 있음, Slack 없음") 남기고, 막힌 게이트는 **그 단계에서만** 다시 언급한다.

## 1. 입력 받기

| 입력 | 읽는 법 |
|---|---|
| 기존 페이지 URL / HTML | Chrome 으로 열어 본문·FAQ 펼침 텍스트·메타·이미지 alt 를 전부 추출(WebFetch 요약으로 대체하지 않음). HTML 파일 첨부면 파싱 |
| 노션 링크 | `notion-fetch` 로 본문. 하위 페이지가 기획 본문이면 한 단계 더 |
| 문서(docx·pdf·md) | 파일 읽기 스킬로 텍스트 추출 |
| 자연어 한두 줄 | 그대로 brief 로. 목적·핵심 액션·타깃 중 둘 이상 불명이면 2단계 질문에 Q0 로 끼워 넣는다(최대 3문항 유지) |
| lp-spec / 빌더 doc JSON | 필드 매핑만 |

원문에서 **섹션 명세**(소제목·블록·순서)가 보이면 그 순서를 그대로 보존하고, 각 블록에 임시 id 를 매긴다 — 2단계 [2] 에서 블록별로 묻기 위해.

## 2. 옵션 묻기 (AskUserQuestion 1회, 3문항)

입력을 읽은 직후, 작업 전에 **한 번만** 묻는다. 사용자가 이미 답을 말했으면 그 문항은 뺀다.

| # | 질문 | 선택지 | 기본값(무응답·무인 실행) |
|---|---|---|---|
| [1] | UX 라이팅 | **검토·다듬기** — 오늘의집 톤(해요체·짧은 문장·글자수)으로 고치고, 바뀐 문구는 리뷰 셸 `assumptions` 에 "원문 → 수정" 으로 남김 / **기획안 그대로** — 글자수·금기어만 하네스가 검사, 넘치면 최소 수정 후 표기 | 검토·다듬기 |
| [2] | 섹션 타입 결정 | **하네스 추천 자동** — `01-brief-and-compose.md` 매핑 + `chooseCardUsage` 결과로 바로 빌드 / **섹션별 순차 확인** — 3단계에서 블록마다 타입 선택지를 묻고 진행 | 자동 |
| [3] | 히어로 소재 | **카탈로그 에셋** — ODS 3D 에셋 검색 / **그래픽 소재 제작 요청** — 시안은 카탈로그(또는 플레이스홀더)로 먼저 만들고, 7단계에서 `#des_graphic_요청` 티켓 초안을 만든다 / **나중에** | 카탈로그 에셋 |

## 3. brief → 섹션 구성

`references/01-brief-and-compose.md` 대로 brief 를 뽑고 섹션을 구성한다. 사실·숫자·조건은 원문에서만, 없으면 `assumptions`.
`titleLayout: "center" | "split"` 은 페이지당 하나 — 원문이 중앙 정렬 히어로면 center, 설명 많은 신청형이면 split.

**[2] = 섹션별 순차 확인일 때**
1. 임시 spec.json 을 만들고 `node harness/bin/lp.mjs outline <spec>` 으로 블록별 **채택 타입·근거·대안**을 받는다.
2. 블록마다 AskUserQuestion 1문항(최대 4블록씩 묶어 한 번에) — 질문은 "〈블록 제목〉 섹션을 어떤 타입으로?" , 선택지는 `chosen`(추천, 첫 번째) + `alternatives`(필요한 아이템 형태를 설명에) + `presetAlternatives`(목업·절차·표). 사용자가 고른 타입은 스펙에 `card:` / `preset` 으로 고정한다.
3. 고를 수 없는 요청(영상·지도·계산기)은 가장 가까운 프리셋 + `assumptions` "카탈로그 확장 후보".

**[2] = 자동일 때** 묻지 않고 추천대로 구성하되, 답변에 섹션 구성 한 줄(블록 → 타입)을 남긴다.

## 4. 라이팅

`references/02-ux-writing.md`. **[1] = 검토·다듬기**면 해요체·짧은 문장·자리별 글자수로 다듬고 바뀐 문구를 `assumptions` 에 기록. **[1] = 그대로**면 원문 유지, 글자수 초과·금기어만 하네스 리포트에 따라 최소 수정하고 그것도 기록. 타이틀은 `\n` 없이(줄바꿈은 하네스).

스펙은 `harness/out/<slug>/spec.json` (slug 는 영문 소문자·숫자·하이픈):
```
node harness/bin/lp.mjs validate harness/out/<slug>/spec.json
```
`error` 0 까지 고친다. `warn` 은 수정 또는 assumptions 에 근거.

## 5. 빌드 + 에셋·화면 검수

```
node harness/bin/lp.mjs build harness/out/<slug>/spec.json --shots
node harness/bin/lp.mjs sheet harness/out/<slug>
```
- `asset-sheet.png` 로 톤·중복·의미 확인 → `references/03-assets.md`. **에셋은 카탈로그(Storybook 정의 ODS)에서만**, 같은 섹션은 한 스타일(flat/3d/photo)·한 팔레트(하네스 자동). 맞는 게 없으면 플레이스홀더로 두고 답변에 "에셋 미정 N곳 — 슬롯·의미·후보" 피드백. 생성형은 `allowGeneratedAssets: true` 일 때만.
- **히어로 소재가 [3] = 제작 요청**이면 히어로는 카탈로그 최선 후보(또는 플레이스홀더)로 두고 `assumptions` 에 "히어로 소재 제작 요청 예정" 표기.
- **목업 섹션(`mockup`)** 화면은 Loom 플러그인에서: `loom` MCP `list_screens({track})`/`get_screen(id)` 로 id → `workbench_sketch_new({slug:"lp-<화면slug>", screen:id})` → `workbench_compile_check({project:"sketches/lp-<화면slug>", screenKey:id, shot:true, query:{env:"ios27-iphone-17"}})` → 스펙 `screen: {id, file}`(file 생략 시 `~/Loom` 캡처 자동 탐색). 없으면 '화면 미정' + "`/loom-setup` 후 재빌드". 다른 화면으로 대체하지 않는다.
- `shot-mobile.png`·`shot-desktop.png` 는 한 번만 보고 명백한 깨짐만 확인. 컴포넌트 문제는 `src/components/preview/*` 에서 고치고 README 에 기록(하네스 CSS 덧칠 금지).

## 6. 퍼블리시 + 전달

- `harness/out/<slug>/preview.html` 을 Artifact 로 퍼블리시(첫 publish `icon: layout`). 수정은 같은 file_path 재퍼블리시, "다시 제작"은 `<slug>-v2`.
- 답변: 세팅 한 줄 + 프리뷰 링크 + 섹션 구성 한 줄(블록 → 타입) + 선택한 옵션 요약 + `가정한 내용`/`확인 필요` 1–3개 + **에셋 미정·화면 미정 목록**. 단계 나열 금지.
- `page.html` 은 핸드오프용(요청 시). 예제로 남길 스펙은 `harness/examples/`.

## 7. 히어로 소재 제작 요청 티켓 ([3] = 제작 요청일 때)

`#des_graphic_요청`(C08D7GRCJVB) 은 워크플로우 폼으로 접수되는 채널이다(제목 / 요청팀 / 우선순위 / 이슈(내용) / 관련문서 링크 / 완료 희망일). 채널 토픽대로 **요청 전에 노션 가이드 확인**을 안내한다.

1. 아래 형식으로 티켓 본문을 작성한다. 내용은 시안에서 뽑는다 — 히어로 카피(원문), 타깃·톤, 쓰일 자리(히어로 center 225×150 / split 360×240, ODS 3D 톤·제뉴인 블루), 참고로 쓴 카탈로그 후보 id, 프리뷰 링크.
   ```
   제목: [LP] <페이지명> 히어로 그래픽 제작 요청
   요청팀: <팀>
   우선순위: 중간 (런칭일 D-7 이내면 높음)
   이슈(내용):
   ① 배경 — <LP 목적 한 줄>, 프리뷰: <Artifact 링크>
   ② 요청 — 히어로 영역 3D 그래픽 1종 (<center 225×150 | split 360×240>, 투명 배경, ODS 3D 제뉴인 블루 톤)
   ③ 메시지 — "<히어로 타이틀>" / 서브 "<서브타이틀>"
   ④ 참고 — 카탈로그 후보 <AssetId…>(톤 참고), 시안에는 임시 에셋/플레이스홀더 적용
   관련문서 링크: <프리뷰 링크> · <기획안 링크>
   완료 희망일: <사용자 입력, 없으면 "조율 가능">
   ```
2. **반드시 사용자에게 본문을 보여 주고 확인을 받은 뒤**, `Slack` MCP `slack_send_message_draft(channel_id: "C08D7GRCJVB", message)` 로 **드래프트만** 만든다(전송·워크플로우 제출은 사용자가 Slack 에서). 완료 희망일이 없으면 이때 함께 묻는다.
3. Slack MCP 가 없거나 채널 멤버가 아니면(`not_in_channel`) 본문을 답변에 그대로 적고 채널 링크를 준다.
4. 답변에 "그래픽 티켓 초안 생성됨(드래프트) — Slack 에서 확인 후 워크플로우로 제출" 한 줄.

## 수정 요청 루프

문구·섹션·에셋 수정 → spec.json 만 고치고 build → 같은 file_path 재퍼블리시(직전 산출물은 `out/<slug>/prev/`). 옵션을 다시 묻지 않는다 — 사용자가 "타입 바꿔줘"라고 하면 그 섹션만 `lp outline` 선택지로 묻는다.

## 실패 시

| 증상 | 조치 |
|---|---|
| `titleLayout` error | 스펙 최상위에 center/split 추가 (섹션별 지정 제거) |
| `meta.slug` 거부 | 영문 소문자·숫자·하이픈으로 |
| `design-assets 원본 없음` → CDN 폴백 실패 | `lp doctor` → 권한 요청 / 팀원 `pack-assets` 수령 / 플레이스홀더로 먼저 리뷰 |
| 노션·드라이브 커넥터 없음 | 본문 붙여넣기 요청 |
| 화면 미정 (목업) | Loom 플러그인 `/loom-setup` → `compile_check shot` → 재빌드 |
| Slack `not_in_channel` / MCP 없음 | 티켓 본문을 답변에 적고 채널 링크 안내 |
| render-QA 브라우저 실행 불가 | `--no-qa` 로 빌드 |
| 카드 변형이 기대와 다름 | 아이템 형태를 표에 맞추거나 `card:` 로 명시 (`lp outline` 으로 대안 확인) |
