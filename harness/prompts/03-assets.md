# 4. 에셋 — ODS 매칭 우선, 없으면 생성형

## 우선순위
1. **ODS 카탈로그** (`catalog/ods-asset-index.json`, design-assets 920종, 한국어 키워드)
   - 스펙에 `asset: { query }` 로 적으면 컴파일러가 검색·선택·중복 방지·팔레트 통일까지 처리
   - 미리 보려면 `node bin/lp.mjs assets "키워드" [--role icon]`
2. **생성형 (Figma AI `generate_image`)** — 리포트에 `생성 필요` 가 뜬 슬롯, 또는 컨택트시트에서 톤이 어긋난 슬롯만
3. 플레이스홀더 — 생성도 불가할 때. 리뷰 셸에 경고로 남는다

## 톤 검수 (빌드 후 1회)
`node bin/lp.mjs sheet out/<slug>` → `asset-sheet.png` 를 열어 본다. 확인할 것:
- 한 페이지 = 한 일러스트 언어 (ODS 3D, 기본 제뉴인 블루). 실사(Photographic)·평면 SVG·다른 팔레트가 섞였는지
- 같은 오브젝트 중복
- 의미가 맞는지 (예: "일정" 에 엉뚱한 달력)
어긋나면 query 를 바꾸거나 `id` 로 대안을 지정하거나 생성형으로 교체.

## 생성형 절차
1. Figma 파일 확보: 사용자 지정 플랜에 `LP Harness — Generated Assets` 디자인 파일 (없으면 `create_new_file`, `create_session`)
2. `generate_image` — 아래 스타일 프롬프트에 오브젝트만 바꿔 넣는다. 1024×1024, 기본 모델
3. `node bin/lp.mjs gen-import --name <kebab> --slug <slug> --url <image.url> --file <도구가 저장한 미리보기 경로>`
   - url 다운로드가 되면 풀해상도, 네트워크에서 막히면 미리보기(256px)로 대체 → 리포트에 표시
   - 단색 배경 제거 + 480px 정사각 PNG 로 정규화
4. 스펙의 해당 슬롯을 `{ "file": "out/<slug>/gen/<name>.png", "prompt": "<요약>", "alt": "…" }` 로 교체 후 재빌드

### ODS 3D 스타일 프롬프트 (오브젝트 부분만 교체)
```
A single 3D icon illustration of {OBJECT}, in the style of a modern app design system asset library.
Soft rounded 3D shapes, smooth matte-glossy plastic material, monochrome vivid blue palette
(gradients from #5AB4FF to #1F6FEB) with small pure white accents, gentle studio lighting from upper left,
soft subtle highlights, three-quarter isometric view, object centered with generous padding,
no outlines, no text, no logos, no drop shadow on the floor. Plain solid light gray background #EDEFF2.
```
- 사람·손·얼굴·실존 브랜드·글자는 넣지 않는다 (ODS 에셋 언어와 어긋나고 오인 위험)
- 보장·안심 메시지는 ODS 기존 `ShieldWithCheck…JadeGreen` 처럼 그린 예외 허용 (`color.responsibility-green`)
- 생성 에셋은 리뷰 셸 "에셋 출처"에 `생성형 AI` 로 표기되고, 카드에는 컴포넌트 기본 `AI Generated` 라벨이 붙는다
