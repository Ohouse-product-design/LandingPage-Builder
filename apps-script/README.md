# Apps Script Publisher

LandingPageDoc(JSON) 을 Google Apps Script Web App 으로 퍼블리시하는 골격.
빌더의 React 미리보기와 동일한 ODS 토큰을 사용해, **동일한 시각 결과** 를 GAS Web App URL 에서 노출한다.

## 동작 모식도

```
LandingPage-Builder (Next.js)
   │  Export → LandingPageDoc.json
   │
   ▼
[A] PropertiesService 저장
   POST  https://script.google.com/.../exec
   body  = LandingPageDoc JSON
   header X-Build-Token: <BUILD_TOKEN>
   → ScriptProperties[key = "lp:doc:<slug>"] 에 저장

[B] Drive 업로드 (대용량용)
   Drive 에 LandingPageDoc.json 업로드 → 파일 ID 공유
   GET   https://script.google.com/.../exec?docId=<fileId>

[C] 퍼블리시 (조회)
   GET   https://script.google.com/.../exec?slug=moving
   → Code.gs doGet → Render.gs renderDocument → Index.html
   → 완성된 HTML 반환
```

## 1) 사전 설치 (한 번만)

```bash
cd ~/Documents/Claude/Projects/LandingPage-Builder/apps-script
bash install.sh
```

`install.sh` 가 하는 일:
1. **Homebrew** — 없으면 설치 (시스템 비밀번호 입력 필요할 수 있음)
2. **Node.js** — `brew install node`
3. **@google/clasp** — `npm install -g @google/clasp`
4. **clasp login** — 브라우저 OAuth

이미 설치된 도구는 건너뜁니다.

> 손으로 하는 경우:
> ```bash
> brew install node
> npm install -g @google/clasp
> clasp login
> ```

## 2) Apps Script 프로젝트 생성

처음 한 번:
```bash
cd ~/Documents/Claude/Projects/LandingPage-Builder/apps-script
clasp create --type webapp --title "LandingPage Publisher" --rootDir ./
```

`clasp create` 가 자동으로 `.clasp.json` 의 `scriptId` 를 채워줍니다.
(이미 만들어둔 Apps Script 프로젝트에 붙이는 경우, `.clasp.json` 의 scriptId 를 직접 채워넣고 `clasp pull` → `clasp push`)

## 3) 코드 푸시 & 배포

```bash
clasp push
clasp deploy --description "v0.1 초기 배포"
```

배포 후 출력되는 Web App URL 을 복사 — 이게 빌더에서 publish 할 타겟.

## 4) Apps Script 콘솔에서 초기 설정 (1회)

`clasp open` 으로 Apps Script 편집기를 열고 함수 실행:

1. `setupBuildToken()` 실행 — 로그에 BUILD_TOKEN 이 찍힘. 이걸 빌더에 저장.
2. `seedDefaultDoc()` 실행(선택) — 시드 데이터를 ScriptProperties 에 넣어두면 첫 GET 부터 동작 확인 가능.

## 5) 빌더 → Apps Script 로 push

빌더가 LandingPageDoc 을 POST 하는 예시 (curl):

```bash
curl -X POST "https://script.google.com/macros/s/AKfy.../exec" \
  -H "Content-Type: application/json" \
  -H "X-Build-Token: <BUILD_TOKEN>" \
  -d @LandingPageDoc.json
```

응답:
```json
{ "ok": true, "slug": "moving", "schemaVersion": "1.0.0", "savedAt": "2026-05-14T..." }
```

## 6) 조회

브라우저에서:
- `https://script.google.com/.../exec?slug=moving` — Properties 에 저장된 doc 으로 렌더
- `https://script.google.com/.../exec?slug=moving&viewport=mobile` — 모바일 미리보기
- `https://script.google.com/.../exec?docId=<DriveFileId>` — Drive 의 JSON 으로 렌더

## 파일 구조

```
apps-script/
├── install.sh          # macOS 환경 설치 스크립트 (Homebrew/Node/clasp/login)
├── appsscript.json     # Apps Script 매니페스트 (webapp 설정)
├── .clasp.json         # clasp 가 쓰는 scriptId 매핑 (clasp create 가 채움)
├── .claspignore        # push 시 무시할 파일 (README 등)
├── Code.gs             # doGet/doPost — 라우팅 + Properties/Drive I/O
├── Render.gs           # LandingPageDoc → HTML 조각 변환
└── Index.html          # HtmlService 템플릿 (ODS 토큰 CSS + <?!= renderDocument(doc) ?>)
```

## 보안 / 운영 노트

1. **ACCESS** — `appsscript.json` 의 `webapp.access` 가 `DOMAIN` 으로 되어 있어
   같은 워크스페이스 도메인 사용자만 GET 가능. 외부 공개가 필요하면 `ANYONE` 으로 변경.
2. **EXECUTE AS** — `USER_DEPLOYING` 이라 배포자 권한으로 실행. Drive 파일 접근 권한도 배포자 기준.
3. **BUILD_TOKEN** — ScriptProperties 에 저장된 토큰. POST 시 `X-Build-Token` 헤더 필수.
   토큰을 회전하고 싶으면 `setupBuildToken()` 을 다시 실행 (UUID 가 갱신됨).
4. **데이터 크기** — ScriptProperties 는 키당 약 9KB 제한.
   섹션 수가 많아 doc 가 커지면 Drive 업로드 + `docId` 파라미터 사용 권장.
5. **자동 트리거** — `ScriptApp.newTrigger` 로 시간 기반 트리거(매일 새벽 캐시 워밍 등) 추가 가능.

## 다음 단계

- 빌더의 [배포] 버튼 → 이 Web App URL 로 자동 POST 연결.
- HtmlService 의 `IFRAME` 샌드박스 제약 검토 (외부 도메인 스크립트 일부 차단됨).
- 페이지별 OG 메타/검색 노출 필요 시, `Index.html` head 영역에 doc.meta.* 바인딩 추가.
- 정적 배포로 전환할 경우, Apps Script 대신 동일 Render.gs 의 결과물을 빌드 산출물로 미리 export.
