# 1. 기획 해석(brief) → 2. 섹션 구성(compose)

## 1-1. 입력 읽기

| 입력 | 읽는 법 |
|---|---|
| 노션 URL | `notion-fetch` 로 본문. 하위 페이지·DB 가 기획 본문이면 한 단계 더 fetch |
| 문서 첨부 (docx·pdf·md) | 파일 읽기 스킬로 텍스트 추출 |
| 자연어 한두 줄 | 그대로 brief 로 |
| 이미 lp-spec / 노션 스냅샷 JSON | 필드를 lp-spec 으로 매핑만 (카피는 §3 규칙으로 다시 다듬기) |

## 1-2. brief 추출 (내부 메모, 사용자에게 길게 보여주지 않음)

```
purpose        : 서비스 소개 | 신청 유도 | 구매 전환 | 멤버십 구독 | 이벤트 참여 | 브랜드 인지도   (노션 Flow Q1)
primaryAction  : 회원가입 | 견적 신청 | 앱 다운로드 | 문의하기 | 구독 …                         (Flow Q2)
target         : 누구에게 (1인 가구, 신혼, 가족, 사업장 …)
problem        : 타깃이 지금 겪는 불편 2–4개
promise        : 우리가 해결하는 방식 = USP 후보 (숫자·보장·조건은 원문 그대로 보존)
proof          : 후기·수치·파트너·보장 근거
flow           : 이용 절차
objections     : FAQ 후보 (가격, 환불, 소요시간, 조건 …)
related        : 함께 쓰면 좋은 서비스 (cross-sell)
tone           : 원문이 지정했으면 그대로, 없으면 오늘의집 기본 톤
seo            : 자동 생성 (목적+액션+brand) 또는 원문 값                                    (Flow Q3)
gaps           : 원문에 없는 것 → assumptions 로 기록
```

**사실은 원문에서만.** 금액·비율·기간·보장 한도·업체 수 같은 숫자는 원문에 있을 때만 쓴다.
없으면 숫자 없는 표현으로 쓰고 `assumptions` 에 "보상 한도 수치 확인 필요"처럼 남긴다. 후기는 원문에 없으면
"예시 후기"임을 `assumptions` 에 명시한다.

## 1-3. 질문은 최소로

목적·핵심 액션·타깃 중 **둘 이상이 원문에서 추론 불가**할 때만 AskUserQuestion 한 번(최대 3문항, 노션 Flow Q1–Q3 선택지 재사용).
그 외에는 가정하고 진행 → 시안에서 확인받는 편이 빠르다.

## 2. 섹션 구성 — 의도 → 프리셋 매핑

| 기획 의도 신호 | preset | 비고 |
|---|---|---|
| 첫 화면 메시지, 서비스 한 줄 정의 | `hero` | 항상 1개, 맨 위 |
| 고객 문제 → 해결, 핵심 가치·혜택 3–4개 | `usp` (bgfullimg) | 기능·화면 설명형이면 `cardType: leading-asset` |
| 타사/기존 방식 비교, 요금제·보장 범위 | `table` | 비교 2열 / 단일 요약 1열 |
| 후기, 사례, 평점 | `review` | 원문에 없으면 예시 + assumptions |
| 이용 방법, 단계, "어떻게" | `process` | 3–5단계 |
| 함께 쓰면 좋은 서비스, 연계 상품 | `cross-sell` | 2–4개 |
| 조건·가격·환불 등 반복 질문 | `faq` | 4개 이상 |
| 상담/신청 폼을 페이지 안에서 받음 | `cta-form` | 외부 신청 플로우로 보내면 생략 |

### 시나리오 기본 스택 (노션 v2 프리셋과 동일)

| 시나리오 | 스택 | 톤 |
|---|---|---|
| 이사 LP | hero · usp(4) · table · review(4) · process(4) · faq · sticky | 신뢰·안심 |
| 인터넷·렌탈 LP | hero · usp(3) · review(4) · process(4) · cross-sell(3) · faq · sticky | 친근·혜택 명확 |
| 사장님센터 LP | hero · usp(leading-asset) · review(성공사례) · process · cta-form | 전문·신뢰 |
| 빈 LP / 서비스 소개 | hero · usp · process · faq · sticky | 오늘의집 기본 |

규칙
- 정보 흐름: **약속(hero) → 왜(usp/table) → 믿음(review) → 어떻게(process) → 확장(cross-sell) → 남은 의문(faq) → 행동(cta)**.
- 원문에 근거가 없는 섹션은 넣지 않는다 (빈 섹션 < 짧은 페이지).
- 카탈로그에 없는 패턴(예: 영상, 지도, 가격 계산기)이 필요하면 가장 가까운 프리셋으로 대체하고
  `assumptions` 에 "카탈로그 확장 요청 후보: …" 로 남긴다 (PRD §6.3 카탈로그 확장 플로우).
