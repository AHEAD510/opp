/**
 * TOP の Works セクション — microCMS works API（最新4件）
 * 依存: cms-config.js
 */
(function () {
  'use strict';

  var API_NAME = 'works';
  var LIMIT = 4;
  var DEFAULT_THUMB = './ogp.jpg';
  var EXCERPT_LEN = 80;
  var MOD_CLASSES = ['__01', '__02', '__03', '__04'];

  function imageFieldUrl(field) {
    if (!field) return null;
    if (typeof field === 'string') return field;
    if (field.url) return field.url;
    return null;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escapeAttr(str) {
    return escapeHtml(str).replace(/'/g, '&#39;');
  }

  function buildHref(item) {
    if (item.slug != null && item.slug !== '') {
      return './works/det/?slug=' + encodeURIComponent(item.slug);
    }
    if (item.id) {
      return './works/det/?id=' + encodeURIComponent(item.id);
    }
    return './works/';
  }

  /** body から HTML を除去して約80文字 */
  function bodyExcerpt(html) {
    if (!html) return '';
    var raw = html;
    if (raw.indexOf('&lt;') !== -1) {
      raw = raw
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
    }
    var div = document.createElement('div');
    div.innerHTML = raw;
    var text = (div.textContent || div.innerText || '')
      .replace(/\s+/g, ' ')
      .trim();
    if (text.length <= EXCERPT_LEN) return text;
    return text.slice(0, EXCERPT_LEN) + '…';
  }

  function viewBtnHtml(href) {
    return [
      '<p class="tp_worksSect_view">',
      '<a href="' + href + '" class="el_viewBtn">',
      '<span class="el_viewBtn_arrowWrap">',
      '<span class="el_viewBtn_arrowOut">',
      '<span class="el_viewBtn_arrow"></span>',
      '</span>',
      '</span>',
      '<span class="el_viewBtn_txt">View Details</span>',
      '</a>',
      '</p>'
    ].join('');
  }

  function renderItem(item, index) {
    var modClass = MOD_CLASSES[index % MOD_CLASSES.length];
    var label = 'Works' + String(index + 1).padStart(2, '0');
    var href = buildHref(item);
    var rawThumb = imageFieldUrl(item.thumbnail);
    var imgSrc = rawThumb ? rawThumb + '?w=1014&q=82' : DEFAULT_THUMB;
    var title = item.title || '';
    var excerpt = bodyExcerpt(item.body);
    var dataNum =
      index > 0 ? ' data-num="' + escapeAttr(label) + '"' : '';

    return [
      '<li class="tp_works_item">',
      '<article class="tp_worksSect"' + dataNum + '>',
      '<div class="tp_worksSect_main ' + modClass + '">',
      '<div class="tp_worksSect_label">' + escapeHtml(label) + '</div>',
      '<div class="tp_worksSect_inner">',
      '<h3 class="tp_worksSect_ttl">' + escapeHtml(title) + '</h3>',
      '<p class="tp_worksSect_txt">' + escapeHtml(excerpt) + '</p>',
      viewBtnHtml(href),
      '</div>',
      '</div>',
      '<figure class="tp_worksSect_fig">',
      '<a href="' + href + '" class="tp_works_link">',
      '<img src="' +
      escapeAttr(imgSrc) +
      '" alt="' +
      escapeAttr(title) +
      '" width="1014" loading="lazy">',
      '</a>',
      '</figure>',
      '</article>',
      '</li>'
    ].join('');
  }

  function run() {
    if (typeof CMS_CONFIG === 'undefined' || !CMS_CONFIG.apiKey) return;

    var listEl = document.getElementById('js_topWorksList');
    if (!listEl) return;

    var base =
      'https://' + CMS_CONFIG.serviceDomain + '.microcms.io/api/v1/' + API_NAME;
    var qs =
      '?orders=-date' +
      '&limit=' +
      LIMIT +
      '&fields=id,title,slug,date,category,client,thumbnail,body';
    var headers = { 'X-MICROCMS-API-KEY': CMS_CONFIG.apiKey };

    fetch(base + qs, { headers: headers })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        if (!data.contents || data.contents.length === 0) {
          listEl.innerHTML = '';
          return;
        }

        listEl.innerHTML = data.contents
          .slice(0, LIMIT)
          .map(renderItem)
          .join('');
      })
      .catch(function (err) {
        console.error('[TOP WORKS] fetch error:', err);
        listEl.innerHTML = '';
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
