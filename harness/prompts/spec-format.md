# lp-spec 포맷 (v1)

Claude 가 기획서를 해석해 작성하는 **유일한 산출물**. HTML·CSS·레이아웃은 쓰지 않는다.
컴파일러(`lib/compile.mjs`)가 이 스펙을 빌더 표준 `LandingPageDoc` 으로 바꾸면서 프리셋 규칙을 강제하고,
렌더러가 빌더와 같은 React 컴포넌트로 HTML 을 굽는다.

```jsonc
{
  "source":  { "type": "notion|doc|text", "ref": "<노션 URL 또는 파일명/요약>" },
  "intent":  { "purpose": "신청 유도", "target": "이사 앞둔 신혼부부", "primaryAction": "견적 신청", "tone": ["신뢰", "간결"] },
  "assumptions": ["기획서에 없어서 가정한 내용 — 리뷰 셸에 그대로 노출"],
  "titleLayout": "center" | "split",         // 필수 · 페이지당 하나. center=[타이틀][에셋] 중앙 정렬 / split=[타이틀][에셋] 일렬(좌 텍스트·우 에셋)
  "autoLineBreak": true,                     // 선택. false 면 타이틀 자동 줄바꿈 끔 (기본 true)
  "assetPalette": "GenuineBlue",            // 선택. ODS 에셋 컬러 우선순위 (기본 GenuineBlue)
  "meta": { "slug": "moving-clean", "title": "SEO title ≤60", "description": "≤120", "category": "moving|rental|interior|other", "brand": "오늘의집" },
  "cta":  { "label": "견적 받기 (≤20, 동사형)", "href": "#apply" },
  "sections": [ /* 아래 프리셋들. header·sticky-cta·footer 는 생략하면 자동 추가 */ ]
}
```

## 섹션 프리셋

| preset | 필드 | items 필드 | 개수 |
|---|---|---|---|
| `hero` | `eyebrow≤20` `title≤48/3줄` `subtitle≤48/2줄` `cta≤20` `asset` | – | 1 (필수) |
| `usp` | `subtitle≤18` `title≤22/2줄` `cardType: bgfullimg\|leading-asset` `layout: grid\|carousel` | `tag≤12` `title≤20` `body≤40` `asset` | 2–6 (4) |
| `table` | `subtitle` `title` | `title≤24` `rows[4–6]≤32` `theme: grey\|blue\|green` | 1–2 (2) |
| `review` | `subtitle` `title` `layout: carousel\|grid` | `rating 1–5` `title≤40/2줄` `body≤180` `meta[]` `author` | 3–8 (4) |
| `process` | `subtitle` `title` | `step≤4`(생략 시 01,02…) `title≤20` `body≤40` `asset` | 3–5 (4) |
| `cross-sell` | `subtitle` `title` | `title≤20/1줄` `body≤40` `asset` `href` `ctaLabel` | 2–4 (3) |
| `faq` | `subtitle` `title` | `q≤80` `a≤400` | 4–10 (4) |
| `usp`→`linkcard` | `card:"linkcard"` 또는 자동 | `title≤10` `moreHref` `moreLabel≤8` `links[2–5]{label≤24,url,actions[]}` | 2–4 |
| `usp`→`pillcard` | 자동(설명 없는 ≤14자 + icon) | `title≤14/1줄` `icon` | 2–5 |
| `table`→`kvcard` | 자동(단일 카드 + 단위 값) | `title≤24` `rows[3–8]` "라벨: 값" 또는 `{label≤12,value≤10,highlight}` `rail` | 1 |
| `process`/`usp`→`stepcard` | 자동(≥5단계·icon만·layout:list / icon+body) | `title≤20/2줄` `body≤24/1줄` `icon` `step` | 2–5 |
| `cta-form` | `title` `subtitle≤24` `submit≤12` `fields[{label,placeholder,type}]` | – | 0–1 |
| `sticky-cta` | `label≤16` (생략 시 cta.label) | – | 자동 |

- **타이틀 줄바꿈은 하네스에 맡긴다.** `\n` 없이 쓰면 compile 이 Pretendard 실측 글자폭으로 모바일 폭을 재고, 쉼표·조사 뒤 등 의미 경계에서 균형 잡힌 2줄로 끊는다("다른 | 모습" 같은 수식어-명사 분리는 피함). 특정 위치에서 꼭 끊어야 할 때만 `\n` 을 직접 쓴다(그 경우 폭 초과만 검사).
- 카드 타이틀(1줄 ellipsis)은 폭을 넘으면 리포트 `warn` — 카피를 줄인다. 글자수는 줄바꿈 포함 `String.length`.
- 리뷰 본문 강조는 `**문구**` 1회 이하.
- 테이블 2개 비교 시 행 수를 맞추고, 오늘의집 쪽을 마지막(`blue` 또는 최강조 `green`)에 둔다.

## asset 표기

```jsonc
"asset": { "query": "이사 트럭", "alt": "이삿짐 트럭" }     // ODS 카탈로그 검색 (기본)
"asset": { "id": "AssetBellLargeGenuineBlueView2" }          // 확정 id
"asset": { "file": "out/<slug>/gen/<name>.png", "prompt": "생성 프롬프트 요약", "alt": "…" }  // 생성형
"asset": "이사 트럭"                                          // query 축약형
"icon":  { "query": "자물쇠 보안" }                            // pillcard·stepcard 아이콘 → ODS 숏컷(Small SVG) 우선 검색
```
