/**
 * Render.gs — LandingPageDoc 의 섹션을 HTML 조각으로 변환하는 헬퍼.
 * Index.html 에서 <?= renderSection(s) ?> 형태로 호출된다.
 *
 * 빌더의 React PreviewRenderer 와 1:1 대응되는 HTML 출력을 목표로 하며,
 * 동일한 ODS 토큰 변수를 사용한다 (Index.html 상단 CSS 변수 정의).
 */

function renderDocument(doc) {
  if (!doc || !doc.sections) return '';
  var html = '';
  for (var i = 0; i < doc.sections.length; i++) {
    html += renderSection(doc.sections[i]);
  }
  return html;
}

function renderSection(s) {
  switch (s.preset) {
    case 'header':      return renderHeader_(s);
    case 'hero':        return renderHero_(s);
    case 'usp':         return renderCardSection_(s);
    case 'table':       return renderTable_(s);
    case 'coverage':    return renderCardSection_(s, true);
    case 'review':      return renderCardSection_(s);
    case 'process':     return renderCardSection_(s);
    case 'cross-sell':  return renderCardSection_(s);
    case 'cta-form':    return renderCtaForm_(s);
    case 'sticky-cta':  return renderStickyCta_(s);
    case 'footer':      return renderFooter_(s);
    default:            return '';
  }
}

// ---------------------------------------------------------------------------
// 유틸
// ---------------------------------------------------------------------------

function esc_(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function nl2br_(str) {
  return esc_(str).replace(/\n/g, '<br/>');
}

function sectionTitleBlock_(s) {
  var sub = s.props && s.props.sectionSubtitle;
  var main = s.props && s.props.sectionTitle;
  if (!sub && !main) return '';
  var html = '<div class="lp-section-title">';
  if (sub) html += '<div class="lp-sub">' + esc_(sub) + '</div>';
  if (main) html += '<div class="lp-main">' + nl2br_(main) + '</div>';
  html += '</div>';
  return html;
}

// ---------------------------------------------------------------------------
// 섹션 렌더러
// ---------------------------------------------------------------------------

function renderHeader_(s) {
  var logo = (s.props && s.props.logoText) || '오늘의집';
  return '<header class="lp-header">' +
    '<div class="lp-logo">' + esc_(logo) + '</div>' +
    '<nav class="lp-nav"><span>이사</span><span>렌탈</span><span>인테리어</span></nav>' +
    '</header>';
}

function renderHero_(s) {
  var title = (s.props && s.props.title) || '메인 카피';
  var subtitle = s.props && s.props.subtitle;
  var cta1 = (s.props && s.props.primaryCtaLabel) || '버튼';
  var cta2 = s.props && s.props.secondaryCtaLabel;
  var html = '<section class="lp-hero"><div class="lp-hero-inner">';
  html += '<div class="lp-hero-text"><div class="lp-hero-title">' + nl2br_(title) + '</div>';
  if (subtitle) html += '<div class="lp-hero-sub">' + esc_(subtitle) + '</div>';
  html += '<div class="lp-hero-cta">';
  html += '<button class="lp-btn lp-btn-primary">' + esc_(cta1) + '</button>';
  if (cta2) html += '<button class="lp-btn lp-btn-secondary">' + esc_(cta2) + '</button>';
  html += '</div></div>';
  html += '<div class="lp-hero-image">🖼 Hero Image</div>';
  html += '</div></section>';
  return html;
}

function renderCardSection_(s, withBadge) {
  var contentList = (s.slots && s.slots['content']) || [];
  var card = contentList[0];
  var html = '<section class="lp-section">';
  html += sectionTitleBlock_(s);
  if (withBadge) {
    var badge = (s.props && s.props.badgeLabel) || '책임보장';
    html += '<div class="lp-badge">✓ ' + esc_(badge) + '</div>';
  }
  if (!card || card.preset !== 'card') {
    html += '<div class="lp-empty">카드 컨테이너가 비어있습니다</div>';
  } else {
    html += renderCard_(card);
  }
  html += '</section>';
  return html;
}

function renderCard_(card) {
  var p = card.props || {};
  var layout = p.layout || { type: 'grid', settings: {} };
  var usage = p.usage || 'usp';
  var cells = p.cells || [];

  if (layout.type === 'grid') {
    var cols = (layout.settings && layout.settings.columns) || { desktop: 4, tablet: 2, mobile: 1 };
    var gap = (layout.settings && layout.settings.gap) || 16;
    var html = '<div class="lp-grid" style="--cols-mobile:' + cols.mobile + ';--cols-tablet:' + cols.tablet +
               ';--cols-desktop:' + cols.desktop + ';gap:' + gap + 'px">';
    for (var i = 0; i < cells.length; i++) html += renderCell_(cells[i], usage);
    html += '</div>';
    return html;
  }

  if (layout.type === 'carousel') {
    var s = layout.settings || {};
    var cardWidth = (s.cardWidth && s.cardWidth.desktop) || 320;
    var autoScroll = !!s.autoScroll;
    var dur = (s.autoScrollDurationMs || 30000) / 1000;
    var loopCells = autoScroll ? cells.concat(cells) : cells;
    var inner = '';
    for (var j = 0; j < loopCells.length; j++) {
      inner += '<div class="lp-carousel-item" style="width:' + cardWidth + 'px">' +
               renderCell_(loopCells[j], usage) + '</div>';
    }
    return '<div class="lp-carousel">' +
      '<div class="lp-carousel-track ' + (autoScroll ? 'lp-marquee' : '') + '" ' +
      'style="--marquee-duration:' + dur + 's;gap:' + ((s.gap || 16)) + 'px">' +
      inner + '</div></div>';
  }

  if (layout.type === 'row') {
    var sSet = layout.settings || {};
    var align = sSet.align || 'start';
    var wrap = sSet.wrap ? 'wrap' : 'nowrap';
    var rgap = sSet.gap || 16;
    var rhtml = '<div class="lp-row" style="justify-content:' +
      (align === 'between' ? 'space-between' : align === 'around' ? 'space-around' : align) +
      ';flex-wrap:' + wrap + ';gap:' + rgap + 'px">';
    for (var k = 0; k < cells.length; k++) rhtml += renderCell_(cells[k], usage);
    rhtml += '</div>';
    return rhtml;
  }

  return '';
}

function renderCell_(cell, usage) {
  var slots = cell.slots || {};
  switch (usage) {
    case 'usp': return renderUspCell_(slots);
    case 'review': return renderReviewCell_(slots);
    case 'step': return renderStepCell_(slots);
    case 'service': return renderServiceCell_(slots);
    default: return renderCustomCell_(slots);
  }
}

function renderUspCell_(s) {
  var tag = s.tag && s.tag.kind === 'text' ? s.tag.text : '';
  var title = s.title && s.title.kind === 'text' ? s.title.text : '';
  var body = s.body && s.body.kind === 'text' ? s.body.text : '';
  var mediaAlt = s.media && s.media.kind === 'asset' ? s.media.asset.alt : '';
  var html = '<div class="lp-card lp-card-usp">';
  if (tag) html += '<div class="lp-tag">' + esc_(tag) + '</div>';
  if (title) html += '<div class="lp-card-title">' + nl2br_(title) + '</div>';
  if (body) html += '<div class="lp-card-body">' + nl2br_(body) + '</div>';
  if (mediaAlt) html += '<div class="lp-card-media">🖼 ' + esc_(mediaAlt) + '</div>';
  html += '</div>';
  return html;
}

function renderReviewCell_(s) {
  var rating = s.rating && s.rating.kind === 'rating' ? s.rating.value : 0;
  var max = s.rating && s.rating.kind === 'rating' ? (s.rating.max || 5) : 5;
  var stars = '';
  for (var i = 0; i < max; i++) stars += (i < rating ? '★' : '☆');
  var title = s.title && s.title.kind === 'text' ? s.title.text : '';
  var body = s.body && s.body.kind === 'text' ? s.body.text : '';
  var meta = s.meta && s.meta.kind === 'meta' ? s.meta.items.join(' · ') : '';
  var html = '<div class="lp-card lp-card-review">';
  html += '<div class="lp-rating">' + stars + '</div>';
  if (title) html += '<div class="lp-card-title">' + nl2br_(title) + '</div>';
  if (body) html += '<div class="lp-card-body lp-clamp-5">' + nl2br_(body) + '</div>';
  if (meta) html += '<div class="lp-meta">' + esc_(meta) + '</div>';
  html += '</div>';
  return html;
}

function renderStepCell_(s) {
  var num = s.stepNumber && s.stepNumber.kind === 'text' ? s.stepNumber.text : '';
  var title = s.title && s.title.kind === 'text' ? s.title.text : '';
  var body = s.body && s.body.kind === 'text' ? s.body.text : '';
  var mediaAlt = s.media && s.media.kind === 'asset' ? s.media.asset.alt : '';
  var html = '<div class="lp-card lp-card-step">';
  if (num) html += '<div class="lp-step-num">STEP ' + esc_(num) + '</div>';
  if (title) html += '<div class="lp-card-title">' + esc_(title) + '</div>';
  if (body) html += '<div class="lp-card-body">' + nl2br_(body) + '</div>';
  if (mediaAlt) html += '<div class="lp-card-media">🖼 ' + esc_(mediaAlt) + '</div>';
  html += '</div>';
  return html;
}

function renderServiceCell_(s) {
  var iconAlt = s.icon && s.icon.kind === 'asset' ? s.icon.asset.alt : '';
  var title = s.title && s.title.kind === 'text' ? s.title.text : '';
  var body = s.body && s.body.kind === 'text' ? s.body.text : '';
  var cta = s.cta && s.cta.kind === 'cta' ? s.cta : null;
  var url = cta ? cta.url : '#';
  var html = '<a class="lp-card lp-card-service" href="' + esc_(url) + '">';
  html += '<div class="lp-card-icon">' + (iconAlt ? '🖼' : '') + '</div>';
  if (title) html += '<div class="lp-card-title">' + esc_(title) + '</div>';
  if (body) html += '<div class="lp-card-body">' + esc_(body) + '</div>';
  if (cta) html += '<div class="lp-card-cta">' + esc_(cta.label) + ' →</div>';
  html += '</a>';
  return html;
}

function renderCustomCell_(slots) {
  var html = '<div class="lp-card lp-card-custom">';
  for (var k in slots) {
    var c = slots[k];
    if (!c) continue;
    html += '<div class="lp-slot"><span class="lp-slot-key">' + esc_(k) + ':</span> ';
    if (c.kind === 'text') html += nl2br_(c.text);
    else if (c.kind === 'rating') html += '★ ' + c.value + '/' + (c.max || 5);
    else if (c.kind === 'meta') html += esc_((c.items || []).join(' · '));
    else if (c.kind === 'cta') html += '→ ' + esc_(c.label);
    else if (c.kind === 'asset') html += '🖼 ' + esc_(c.asset.alt);
    html += '</div>';
  }
  html += '</div>';
  return html;
}

// ---------------------------------------------------------------------------
// Table / CtaForm / StickyCta / Footer
// ---------------------------------------------------------------------------

function renderTable_(s) {
  var rows = (s.slots && s.slots.rows) || [];
  var headers = (s.props && s.props.colHeaders) || ['A','B','C'];
  var html = '<section class="lp-section lp-section-table">';
  html += sectionTitleBlock_(s);
  html += '<div class="lp-table">';
  html += '<div class="lp-thead"><div>항목</div>';
  for (var i = 0; i < headers.length; i++) html += '<div>' + esc_(headers[i]) + '</div>';
  html += '</div>';
  for (var j = 0; j < rows.length; j++) {
    var r = rows[j].props || {};
    html += '<div class="lp-trow">' +
      '<div class="lp-tcell-label">' + esc_(r.label || '') + '</div>' +
      '<div>' + esc_(r.colA || '—') + '</div>' +
      '<div class="lp-accent-blue">' + esc_(r.colB || '—') + '</div>' +
      '<div class="lp-accent-green">' + esc_(r.colC || '—') + '</div>' +
      '</div>';
  }
  html += '</div></section>';
  return html;
}

function renderCtaForm_(s) {
  var fields = (s.slots && s.slots.fields) || [];
  var submit = (s.props && s.props.submitLabel) || '신청';
  var html = '<section class="lp-section lp-section-form">';
  html += sectionTitleBlock_(s);
  html += '<form class="lp-form">';
  if (fields.length === 0) {
    html += '<div class="lp-empty">폼 필드를 추가해주세요</div>';
  } else {
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i].props || {};
      html += '<label class="lp-field"><span>' + esc_(f.label || '') + '</span>' +
        '<input placeholder="' + esc_(f.placeholder || '') + '" /></label>';
    }
  }
  html += '<button class="lp-btn lp-btn-primary" type="button">' + esc_(submit) + '</button>';
  html += '</form></section>';
  return html;
}

function renderStickyCta_(s) {
  var label = (s.props && s.props.label) || '버튼';
  return '<div class="lp-sticky-cta"><button class="lp-btn lp-btn-primary">' +
    esc_(label) + '</button></div>';
}

function renderFooter_(s) {
  var copy = (s.props && s.props.copyright) || '© 2026';
  return '<footer class="lp-footer">' +
    '<div class="lp-footer-nav"><span>회사소개</span><span>이용약관</span><span>개인정보처리방침</span></div>' +
    '<div>' + esc_(copy) + '</div></footer>';
}
