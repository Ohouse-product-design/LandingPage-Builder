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

## 빠른 시작
```bash
bash harness/setup.sh                                   # 의존성 · design-assets · 인덱스 · 번들
node harness/bin/lp.mjs build harness/examples/moving.spec.json --shots
open harness/out/moving-1person/preview.html
```

## 카드 변형 9종과 자동 채택
`imgcard(bgfullimg|leading-asset) · reviewcard · listcard · tablecard · faqcard` + **`linkcard · pillcard · kvcard · stepcard`** (2026-10 추가, `src/schema/card.ts` 단일 Card usage).
`lib/compile.mjs chooseCardUsage` 가 아이템 형태 신호로 결정적으로 고르고(`links[]` → linkcard, 설명 없는 ≤14자+아이콘 → pillcard, 단일 카드 '라벨: 값'+단위 → kvcard, ≥5단계/아이콘만/보조문 안내 → stepcard), 스펙 `card:` 로 허용 목록 안에서 override. 근거는 리포트 `info`. 필·단계 아이콘은 `icon-small` 역할로 ODS 숏컷(Small SVG) 우선.

## 레이아웃·줄바꿈 규칙
- `titleLayout` 은 페이지당 하나(`center` | `split`). compile 이 모든 섹션 props 에 같은 값을 주입하고, 섹션별 지정은 validate 에서 error.
  - center: 히어로 세로 스택 중앙, 섹션 타이틀 중앙, imgcard 그리드 중앙 정렬
  - split: 히어로 좌 텍스트·CTA / 우 에셋(360px), 모바일은 좌정렬 세로 스택, 섹션 타이틀 좌측
- 타이틀 줄바꿈(`lib/linebreak.mjs`): Pretendard SemiBold 실측 글자폭(`catalog/font-widths.json`) × font-size 로 모바일 폭을 재고, 쉼표·조사 뒤 우선 / 수식어 뒤·1글자 고아 회피 / 줄 길이 편차 최소로 2줄 분할. 카드 타이틀은 폭 초과 시 warn.

## 빌더 소스 변경 (이 하네스 도입 시 함께 반영)
- `Card.tsx` FAQ 답변: 닫힘 상태도 `hidden` 으로 DOM 유지 (정적 export 에서 답변 유실 방지, 빌더 동작 동일)
- `Card.tsx` bgfullimg 태그: absolute 고정 → 타이틀 위 흐름 배치 (본문 2줄일 때 겹침 수정)
- `card.ts` + `Card.tsx` + `Card.stories.tsx`: 변형 4종(linkcard·pillcard·kvcard·stepcard) 슬롯 `links`/`rows`, 셀 렌더러, 스토리. `ods-icons.tsx` 에 IconArrowDownToLine·IconHeadset·IconLink(design-assets 원본 패스) 추가, IconArrowRight 원본 패스로 교체
- `SectionTitleBlock.tsx` / `HeroTemplate.tsx` / `Card.tsx`: `props.titleLayout`(center | split) 분기 — 히어로 split 변형(좌 텍스트/우 에셋), 섹션 타이틀 중앙 정렬, imgcard 그리드 중앙 정렬. 타이틀에 `text-wrap: balance`
- `Card.tsx` imgcard 카드 폭 260–300px: grid 는 `auto-fill` 로 들어가는 만큼 열 생성(1280→4열, 768→2열), carousel 카드폭도 300 상한

## 카탈로그 오너 확인 필요
- footer 인증 마크(ISMS·ISO·PCR)가 Figma MCP 임시 URL → design-assets 에 정식 에셋 등록 필요 (현재 정적 export 에서 비표시)
- design-assets 에 없는 3D 오브젝트(스마트폰·달력·쿠폰·클립보드 등)는 생성형으로 채워짐 → 자주 쓰이면 정식 에셋화 후보
