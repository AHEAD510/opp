(function () {
  'use strict';

  var API_NAME = 'news';
  var BASE_URL = 'https://' + CMS_CONFIG.serviceDomain + '.microcms.io/api/v1/' + API_NAME;
  var HEADERS = { 'X-MICROCMS-API-KEY': CMS_CONFIG.apiKey };
  /** thumbnail 未設定時（一覧・詳細共通） */
  var DEFAULT_NEWS_THUMB = '/ogp.jpg';

  /** microCMS の画像フィールド（thumbnail 等）から URL を取得 */
  function imageFieldUrl(field) {
    if (!field) return null;
    if (typeof field === 'string') return field;
    if (field.url) return field.url;
    return null;
  }

  /** カテゴリ（文字列 / オブジェクト / 配列）を表示用テキストに */
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

  function showError(loadingEl, errorEl) {
    hideStateEl(loadingEl);
    if (errorEl) {
      errorEl.hidden = false;
      errorEl.removeAttribute('hidden');
    }
  }

  function hideStateEl(el) {
    if (!el) return;
    el.hidden = true;
    el.setAttribute('hidden', '');
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ============================================================
  //  LIST PAGE
  // ============================================================
  var listEl = document.getElementById('js_newsList');
  if (listEl) {
    var listLoadingEl = document.getElementById('js_newsLoading');
    var listErrorEl = document.getElementById('js_newsError');

    var listQs =
      '?orders=-publishDate' +
      '&limit=100' +
      '&fields=id,title,slug,publishDate,category,thumbnail';

    fetch(BASE_URL + listQs, { headers: HEADERS })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        hideStateEl(listLoadingEl);
        if (listErrorEl) hideStateEl(listErrorEl);

        if (!data.contents || data.contents.length === 0) {
          listEl.innerHTML = '<li class="nw_state"><span>記事はまだありません。</span></li>';
          return;
        }

        listEl.innerHTML = data.contents.map(function (item) {
          var rawThumb = imageFieldUrl(item.thumbnail);
          var thumb = rawThumb ? rawThumb + '?w=720&q=80' : DEFAULT_NEWS_THUMB;
          var cateText = categoryLabel(item.category);
          var cateHtml = cateText
            ? '<span class="bl_card_cate">' + escapeHtml(cateText) + '</span>'
            : '';
          var dateRaw = item.publishDate || item.publishedAt;
          var href =
            item.slug != null && item.slug !== ''
              ? './detail/?slug=' + encodeURIComponent(item.slug)
              : './detail/?id=' + encodeURIComponent(item.id);
          return [
            '<li class="nw_list_item">',
              '<a href="' + href + '" class="bl_card">',
                '<figure class="bl_card_fig">',
                  '<img src="' + thumb + '" alt="" width="720" loading="lazy">',
                '</figure>',
                '<div class="bl_card_meta">',
                  '<time class="bl_card_date" datetime="' + escapeHtml(String(dateRaw || '')) + '">' +
                    formatDate(dateRaw) +
                  '</time>',
                  cateHtml,
                '</div>',
                '<p class="bl_card_ttl"><span>' + escapeHtml(item.title || '') + '</span></p>',
              '</a>',
            '</li>'
          ].join('');
        }).join('');
      })
      .catch(function (err) {
        console.error('News list fetch error:', err);
        showError(listLoadingEl, listErrorEl);
      });
  }

  // ============================================================
  //  DETAIL PAGE
  // ============================================================
  var detailEl = document.getElementById('js_newsDetail');
  if (detailEl) {
    var detLoadingEl = document.getElementById('js_newsLoading');
    var detErrorEl = document.getElementById('js_newsError');

    var params = new URLSearchParams(location.search);
    var slug = params.get('slug');
    var id = params.get('id');

    function applyDetail(item) {
      hideStateEl(detLoadingEl);
      hideStateEl(detErrorEl);
      detailEl.hidden = false;
      detailEl.removeAttribute('hidden');

      document.title = item.title + ' | NEWS | ONE PAGE PARTNERS';

      var titleEl = document.getElementById('js_newsTitle');
      if (titleEl) titleEl.textContent = item.title || '';

      var bcTitleEl = document.getElementById('js_newsBcTitle');
      if (bcTitleEl) bcTitleEl.textContent = item.title || '';

      var dateRaw = item.publishDate || item.publishedAt;
      var dateEl = document.getElementById('js_newsDate');
      if (dateEl) {
        dateEl.textContent = formatDate(dateRaw);
        dateEl.setAttribute('datetime', dateRaw || '');
      }

      var cateEl = document.getElementById('js_newsCate');
      if (cateEl) {
        var cateText = categoryLabel(item.category);
        if (cateText) {
          cateEl.textContent = cateText;
          cateEl.hidden = false;
        } else {
          cateEl.hidden = true;
        }
      }

      var eyecatchFig = document.getElementById('js_newsEyecatchWrap');
      var eyecatchImg = document.getElementById('js_newsEyecatch');
      var mainImg = imageFieldUrl(item.thumbnail);
      if (eyecatchImg && eyecatchFig) {
        eyecatchImg.src = mainImg ? mainImg + '?w=1200&q=85' : DEFAULT_NEWS_THUMB;
        eyecatchImg.alt = item.title || '';
        eyecatchFig.hidden = false;
      }

      var bodyEl = document.getElementById('js_newsBody');
      if (bodyEl && item.body) {
        bodyEl.innerHTML = item.body;
      }
    }

    if (!slug && !id) {
      showError(detLoadingEl, detErrorEl);
      return;
    }

    var detailPromise;
    if (slug) {
      var filter = 'slug[equals]' + slug;
      detailPromise = fetch(
        BASE_URL + '?filters=' + encodeURIComponent(filter) + '&limit=1',
        { headers: HEADERS }
      )
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        })
        .then(function (data) {
          var item = data.contents && data.contents[0];
          if (!item) throw new Error('not found');
          return item;
        });
    } else {
      detailPromise = fetch(BASE_URL + '/' + encodeURIComponent(id), { headers: HEADERS })
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        });
    }

    detailPromise
      .then(applyDetail)
      .catch(function (err) {
        console.error('News detail fetch error:', err);
        hideStateEl(detailEl);
        showError(detLoadingEl, detErrorEl);
      });
  }
})();
