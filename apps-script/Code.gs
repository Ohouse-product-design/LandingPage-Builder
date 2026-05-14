/**
 * Code.gs — Apps Script 엔트리.
 *
 * 동작:
 * - doGet(e) : 쿼리에 따라 LandingPageDoc 을 읽어서 HTML 로 렌더해 반환.
 *   - ?slug=moving   : PropertiesService 에 저장된 slug 키 의 문서를 로드
 *   - ?docId=...     : Drive 파일 ID 의 JSON 을 로드 (대용량/외부 협업용)
 *   - 기본          : Properties 의 default 키 사용
 * - doPost(e) : 빌더에서 PUT/POST 로 LandingPageDoc 을 업로드 (JSON body)
 *   - body 의 meta.slug 를 키로 ScriptProperties 에 저장.
 *   - X-Build-Token 헤더로 간단한 인증.
 *
 * 배포 후:
 *   GET   {webapp_url}?slug=moving
 *   POST  {webapp_url}  (Content-Type: application/json, 본문 = LandingPageDoc JSON)
 */

/** 빌더 → Apps Script 로 push 할 때 사용할 토큰. ScriptProperties 에 설정. */
function getBuildToken_() {
  return PropertiesService.getScriptProperties().getProperty('BUILD_TOKEN') || '';
}

/** Properties 키 컨벤션 */
function propKeyForSlug_(slug) {
  return 'lp:doc:' + slug;
}

// ---------------------------------------------------------------------------
// GET — HTML 퍼블리시
// ---------------------------------------------------------------------------

function doGet(e) {
  var slug = (e && e.parameter && e.parameter.slug) || 'default';
  var driveId = (e && e.parameter && e.parameter.docId) || null;
  var viewport = (e && e.parameter && e.parameter.viewport) || 'desktop';

  var doc;
  if (driveId) {
    doc = loadDocFromDrive_(driveId);
  } else {
    doc = loadDocFromProperties_(slug);
  }

  if (!doc) {
    return HtmlService.createHtmlOutput(
      '<h1>LandingPageDoc not found</h1><p>slug=' + slug + '</p>'
    );
  }

  var template = HtmlService.createTemplateFromFile('Index');
  template.doc = doc;
  template.viewport = viewport;

  var output = template.evaluate()
    .setTitle((doc.meta && doc.meta.title) || 'Landing Page')
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');

  return output;
}

// ---------------------------------------------------------------------------
// POST — LandingPageDoc 업로드
// ---------------------------------------------------------------------------

function doPost(e) {
  var headers = e.parameter || {};
  var token = (e.parameter && e.parameter.token) ||
              ((e.postData && e.postData.headers && e.postData.headers['X-Build-Token']) || '');
  if (getBuildToken_() && token !== getBuildToken_()) {
    return ContentService.createTextOutput(JSON.stringify({
      ok: false,
      error: 'invalid build token'
    })).setMimeType(ContentService.MimeType.JSON);
  }

  var body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      ok: false,
      error: 'invalid JSON: ' + err.message
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (!body || !body.meta || !body.meta.slug) {
    return ContentService.createTextOutput(JSON.stringify({
      ok: false,
      error: 'missing meta.slug'
    })).setMimeType(ContentService.MimeType.JSON);
  }

  saveDocToProperties_(body);
  void headers;

  return ContentService.createTextOutput(JSON.stringify({
    ok: true,
    slug: body.meta.slug,
    schemaVersion: body.schemaVersion,
    savedAt: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

// ---------------------------------------------------------------------------
// Storage 헬퍼
// ---------------------------------------------------------------------------

function saveDocToProperties_(doc) {
  var key = propKeyForSlug_(doc.meta.slug);
  PropertiesService.getScriptProperties().setProperty(key, JSON.stringify(doc));
}

function loadDocFromProperties_(slug) {
  var key = propKeyForSlug_(slug);
  var raw = PropertiesService.getScriptProperties().getProperty(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

/**
 * Drive 의 JSON 파일에서 doc 로드.
 * - 빌더가 출력한 LandingPageDoc.json 을 Drive 에 업로드하고 파일 ID 만 공유하는 패턴.
 * - 대용량/협업 케이스에 사용. (PropertiesService 는 키당 약 9KB 제한 — 큰 문서는 Drive 권장)
 */
function loadDocFromDrive_(fileId) {
  try {
    var blob = DriveApp.getFileById(fileId).getBlob();
    return JSON.parse(blob.getDataAsString('UTF-8'));
  } catch (err) {
    return null;
  }
}

// ---------------------------------------------------------------------------
// 유틸 — 콘솔에서 실행해 초기 설정
// ---------------------------------------------------------------------------

/**
 * Apps Script 콘솔에서 한 번 실행하여 BUILD_TOKEN 을 등록.
 * 토큰은 빌더가 POST 요청 시 X-Build-Token (or ?token=) 으로 보내야 한다.
 */
function setupBuildToken() {
  var token = Utilities.getUuid();
  PropertiesService.getScriptProperties().setProperty('BUILD_TOKEN', token);
  Logger.log('BUILD_TOKEN: ' + token);
}

/**
 * 콘솔에서 실행: 시드 LandingPageDoc 을 Properties 에 미리 저장 (테스트용).
 * 실제 운영에서는 빌더에서 POST 로 push 한다.
 */
function seedDefaultDoc() {
  var doc = {
    schemaVersion: '1.0.0',
    id: 'doc-moving-001',
    meta: { slug: 'moving', title: '이사 — 오늘의집', category: 'moving' },
    sections: [
      { id: 'sec-hero', preset: 'hero', name: '히어로', locked: true,
        props: { title: '이사, 더 쉽고\n안심되게', primaryCtaLabel: '무료 견적 받기' },
        slots: {}, assets: [], visibility: { mobile: true, tablet: true, desktop: true } }
    ],
    audit: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
             createdBy: 'seed', updatedBy: 'seed' }
  };
  saveDocToProperties_(doc);
  Logger.log('seeded slug=moving');
}
