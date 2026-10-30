# 4. 에셋 — Storybook/ODS 카탈로그에 정의된 것만

## 원칙 (2026-10 디자인 결정)
- **임의로 만들지 않는다.** 에셋은 `catalog/ods-asset-index.json`(design-assets = Storybook 에 정의된 ODS 에셋 920종)에서만 고른다.
- 맥락에 맞는 에셋이 없으면 **플레이스홀더로 비워두고** 리포트 `warn` 으로 어느 슬롯이 비었는지 사용자에게 피드백한다 ("디자이너에게 에셋 요청"). 비슷해 보이는 엉뚱한 에셋으로 채우지 않는다.
- 생성형(Figma AI 등) 에셋은 기본 차단. 디자이너가 승인한 경우에만 스펙 최상위 `allowGeneratedAssets: true` + `{file, prompt, alt}` 로 허용한다.

## 사이즈 규칙 (컴포넌트가 강제 — 스펙에서 조절 불가)
| 자리 | 규칙 |
|---|---|
| 리스트 leading icon (listcard·pillcard·stepcard 좌측) | bg 박스 40×40(`surface.gray`, 배경색 카드·회색 컨테이너 안에서는 white) 안에 에셋 **최대 24×24** |
| 카드 안 에셋 (imgcard leading-asset) | **40×40 고정**, 카드 좌상단 |
| 풀배경 카드 (bgfullimg) | **사용하지 않음** — usp 는 항상 leading-asset 으로 일괄 적용 |
| 히어로 비주얼 | center 225×150 / split 360×240 |
| 프로세스 | 에셋 없음 — **넘버링 leading**(01·02·03, primary 원형) |

## 역할별 검색 — 슬롯 크기로 결정 (24 이하 = 아이콘, 24 초과 = 에셋)
- **24 초과 슬롯**(히어로 225/360 · 카드 안 40) → `asset: { query }` — ODS 3D 일러스트, 제뉴인 블루 우선, 실사·평면 SVG 배제
- **24 이하 슬롯**(리스트 leading: pillcard·stepcard·listcard·cross-sell) → `icon: { query }` — ODS 숏컷 아이콘(Small SVG) 우선, 블루·그레이 계열. 3D 에셋은 차선
- 스펙에 `asset` 을 써도 슬롯이 24 이하면 compile 이 아이콘 역할로 검색한다
- 미리 보려면 `node bin/lp.mjs assets "키워드" [--role icon-small]`
- 점수 3 미만이면 채택하지 않고 플레이스홀더

## 톤 검수 (빌드 후 1회)
`node bin/lp.mjs sheet out/<slug>` → `asset-sheet.png`: 한 페이지 = 한 일러스트 언어, 같은 오브젝트 중복 없음, 의미 일치. 어긋나면 query 를 바꾸거나 `id` 로 지정. 그래도 없으면 비워두고 피드백.

## 피드백 형식 (답변에 포함)
```
에셋 미정 2곳 — 카탈로그에 맞는 에셋이 없어 비워뒀어요
- sections[2](usp).items[0] "신축 아파트": 후보 없음 → 디자이너에게 3D 아파트 에셋 요청
- sections[0](hero) "청소 도구": AssetCleaningToolLargeGenuineBlueView1 (점수 2.5, 미달) → 확인 후 id 지정 가능
```
