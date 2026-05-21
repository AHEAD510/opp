/**
 * TOP の NEWS セクション — microCMS news API（最新6件）
 * 依存: cms-config.js, swiper-bundle.min.js（後続で initNewsSwiper）
 */
(function () {
  'use strict';

  var API_NAME = 'news';
  var DEFAULT_THUMB = './ogp.jpg';

  function imageFieldUrl(field) {
    if (!field) return null;
    if (typeof field === 'string') return field;
    if (field.url) return field.url;
    return null;
  }

  function categoryLabel(cat) {
    if (cat == null || cat === '') return '';
    if (typeof cat === 'string') return cat;
    if (Array.isArray(cat)) {
      return cat.map(categoryLabel).filter(Boolean).join(' / ');
    }
    if (typeof cat === 'object' && cat.name) return String(cat.name);
    return '';
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function run() {
    if (typeof CMS_CONFIG === 'undefined') return;

    var wrap = document.querySelector('.js_newsSwiper .swiper-wrapper');
    if (!wrap) return;

    var base =
      'https://' + CMS_CONFIG.serviceDomain + '.microcms.io/api/v1/' + API_NAME;
    var qs =
      '?orders=-publishDate' +
      '&limit=6' +
      '&fields=title,slug,publishDate,category,thumbnail,id';
    var headers = { 'X-MICROCMS-API-KEY': CMS_CONFIG.apiKey };

    fetch(base + qs, { headers: headers })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        if (!data.contents || data.contents.length === 0) {
          wrap.innerHTML = '';
          return;
        }

        wrap.innerHTML = data.contents
          .map(function (item) {
            var raw = imageFieldUrl(item.thumbnail);
            var imgSrc = raw ? raw + '?w=840&q=82' : DEFAULT_THUMB;
            var dateRaw = item.publishDate || item.publishedAt;
            var cateText = categoryLabel(item.category);
            var tagHtml = cateText
              ? '<span class="tp_news_tag">' + escapeHtml(cateText) + '</span>'
              : '';
            var slug = item.slug != null && item.slug !== '';
            var href = slug
              ? './news/detail/?slug=' + encodeURIComponent(item.slug)
              : './news/detail/?id=' + encodeURIComponent(item.id);

            return [
              '<article class="tp_news_item swiper-slide">',
              '<a class="tp_news_link" href="' + href + '">',
              '<div class="tp_news_thumb">',
              '<img src="' + imgSrc + '" alt="' + escapeHtml(item.title || '') + '" width="840" loading="lazy">',
              tagHtml,
              '</div>',
              '<time class="tp_news_date" datetime="' +
                escapeHtml(String(dateRaw || '')) +
                '">' +
                formatDate(dateRaw) +
                '</time>',
              '<p class="tp_news_txt">' + escapeHtml(item.title || '') + '</p>',
              '</a>',
              '</article>',
            ].join('');
          })
          .join('');

        if (typeof initNewsSwiper === 'function') {
          initNewsSwiper();
        }
      })
      .catch(function (err) {
        console.error('[TOP NEWS] fetch error:', err);
        wrap.innerHTML = '';
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
