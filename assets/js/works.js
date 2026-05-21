/**
 * Works 一覧・詳細 — microCMS works API
 * 依存: cms-config.js
 */
(function () {
  'use strict';

  if (typeof CMS_CONFIG === 'undefined' || !CMS_CONFIG.apiKey) {
    console.error('works.js: CMS_CONFIG が未定義です。cms-config.js を先に読み込んでください。');
    return;
  }

  var API_NAME = 'works';
  var BASE_URL =
    'https://' + CMS_CONFIG.serviceDomain + '.microcms.io/api/v1/' + API_NAME;
  var HEADERS = { 'X-MICROCMS-API-KEY': CMS_CONFIG.apiKey };

  function imageFieldUrl(field) {
    if (!field) return null;
    if (typeof field === 'string') return field;
    if (field.url) return field.url;
    return null;
  }

  /** カテゴリ（文字列 / オブジェクト / 配列・複数選択）をバッジ用ラベル配列に */
  function categoriesToLabels(cat) {
    if (cat == null || cat === '') return [];
    if (typeof cat === 'string') return [cat];
    if (Array.isArray(cat)) {
      return cat.reduce(function (acc, item) {
        return acc.concat(categoriesToLabels(item));
      }, []);
    }
    if (typeof cat === 'object' && cat.name) return [String(cat.name)];
    return [];
  }

  function categoryDisplay(cat) {
    return categoriesToLabels(cat).join(' / ');
  }

  function formatDateSlash(dateStr) {
    if (!dateStr) return '';
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return y + '/' + m + '/' + day;
  }

  function hideStateEl(el) {
    if (!el) return;
    el.hidden = true;
    el.setAttribute('hidden', '');
  }

  function showError(loadingEl, errorEl) {
    hideStateEl(loadingEl);
    if (errorEl) {
      errorEl.hidden = false;
      errorEl.removeAttribute('hidden');
    }
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

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text || '';
  }

  /** 本文のみ HTML として挿入（title 等は setText でエスケープ） */
  function setBodyHtml(el, html) {
    if (!el) return;
    var bodyHtml = html || '';
    if (bodyHtml.indexOf('&lt;') !== -1) {
      bodyHtml = bodyHtml
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
    }
    el.innerHTML = bodyHtml;
    if (bodyHtml) {
      el.hidden = false;
      el.removeAttribute('hidden');
    } else {
      el.hidden = true;
      el.setAttribute('hidden', '');
    }
  }

  function setMetaPair(categoryId, dateId, clientId, item) {
    var cateText = categoryDisplay(item.category);
    var dateRaw = item.date || item.publishedAt;
    var dateText = formatDateSlash(dateRaw);

    [categoryId].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = cateText;
    });

    [dateId].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        el.textContent = dateText;
        if (dateRaw) el.setAttribute('datetime', dateRaw);
      }
    });

    [clientId].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = item.client || '';
    });
  }

  // ============================================================
  //  LIST PAGE
  // ============================================================
  var listEl = document.getElementById('js_worksList');
  if (listEl) {
    var DEFAULT_LIST_THUMB = '../ogp.jpg';
    var loadingEl = document.getElementById('js_worksLoading');
    var errorEl = document.getElementById('js_worksError');

    function buildCategoryHtml(category) {
      var labels = categoriesToLabels(category);
      if (!labels.length) return '';
      return (
        '<ul class="card_cate">' +
        labels
          .map(function (label) {
            return (
              '<li><span class="el_badge">' + escapeHtml(label) + '</span></li>'
            );
          })
          .join('') +
        '</ul>'
      );
    }

    function buildHref(item) {
      if (item.slug != null && item.slug !== '') {
        return './det/?slug=' + encodeURIComponent(item.slug);
      }
      if (item.id) {
        return './det/?id=' + encodeURIComponent(item.id);
      }
      return './det/';
    }

    function renderCard(item) {
      var rawThumb = imageFieldUrl(item.thumbnail);
      var thumb = rawThumb ? rawThumb + '?w=720&q=80' : DEFAULT_LIST_THUMB;
      var href = buildHref(item);
      var title = item.title || '';
      var alt = title ? escapeAttr(title) : '';
      var cateHtml = buildCategoryHtml(item.category);

      return [
        '<li class="wrk_item">',
        '<a href="' + href + '" class="card">',
        '<div class="card_main">',
        cateHtml,
        '<h2 class="card_name">' + escapeHtml(title) + '</h2>',
        '</div>',
        '<figure class="card_fig">',
        '<img src="' + escapeAttr(thumb) + '" alt="' + alt + '" width="720" loading="lazy">',
        '</figure>',
        '</a>',
        '</li>'
      ].join('');
    }

    var listQs =
      '?orders=-date' +
      '&limit=100' +
      '&fields=id,title,slug,category,date,client,thumbnail';

    fetch(BASE_URL + listQs, { headers: HEADERS })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        hideStateEl(loadingEl);
        if (errorEl) hideStateEl(errorEl);

        if (!data.contents || data.contents.length === 0) {
          listEl.innerHTML =
            '<li class="wrk_item"><div class="card_main wrk_empty"><p>実績はまだありません。</p></div></li>';
          return;
        }

        listEl.innerHTML = data.contents.map(renderCard).join('');
      })
      .catch(function (err) {
        console.error('Works list fetch error:', err);
        showError(loadingEl, errorEl);
      });
  }

  // ============================================================
  //  DETAIL PAGE
  // ============================================================
  var detailEl = document.getElementById('js_worksDetail');
  if (!detailEl) return;

  var DEFAULT_DET_THUMB = '../../ogp.jpg';
  var detLoadingEl = document.getElementById('js_worksLoading');
  var detErrorEl = document.getElementById('js_worksError');

  var params = new URLSearchParams(location.search);
  var slug = params.get('slug');
  var id = params.get('id');

  function renderGallery(gallery) {
    if (!gallery || !gallery.length) return '';
    return gallery
      .map(function (img, index) {
        var url = imageFieldUrl(img);
        if (!url) return '';
        var cap = img.caption || img.alt || '';
        var capHtml = cap
          ? '<figcaption>' + escapeHtml(cap) + '</figcaption>'
          : '';
        return (
          '<figure class="det_sect_fig">' +
          '<img src="' +
          escapeAttr(url) +
          '?w=720&q=80" alt="" width="720" loading="lazy">' +
          capHtml +
          '</figure>'
        );
      })
      .join('');
  }

  function applyDetail(item) {
    hideStateEl(detLoadingEl);
    hideStateEl(detErrorEl);
    detailEl.hidden = false;
    detailEl.removeAttribute('hidden');

    var title = item.title || '';
    document.title = title + ' | WORKS | ONE PAGE PARTNERS';

    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title + ' | ONE PAGE PARTNERS');

    setText('js_worksTitle', title);
    setText('js_worksBcTitle', title);
    setText('js_worksFooterTitle', title);

    setMetaPair(
      'js_worksCategoryHeader',
      'js_worksDateHeader',
      'js_worksClientHeader',
      item
    );
    setMetaPair(
      'js_worksCategoryFooter',
      'js_worksDateFooter',
      'js_worksClientFooter',
      item
    );

    var mainImgUrl =
      imageFieldUrl(item.mainImage) || imageFieldUrl(item.thumbnail);
    var mvWrap = document.getElementById('js_worksMvWrap');
    var mvImg = document.getElementById('js_worksMainImage');
    if (mvImg && mvWrap) {
      mvImg.src = mainImgUrl
        ? mainImgUrl + '?w=1200&q=85'
        : DEFAULT_DET_THUMB;
      mvImg.alt = title;
      mvWrap.hidden = false;
      mvWrap.removeAttribute('hidden');
    }

    setBodyHtml(document.getElementById('js_worksBody'), item.body);

    var galleryWrap = document.getElementById('js_worksGallery');
    if (galleryWrap) {
      var galleryHtml = renderGallery(item.gallery);
      if (galleryHtml) {
        galleryWrap.innerHTML = galleryHtml;
        galleryWrap.hidden = false;
        galleryWrap.removeAttribute('hidden');
      } else {
        galleryWrap.innerHTML = '';
        galleryWrap.hidden = true;
        galleryWrap.setAttribute('hidden', '');
      }
    }

    var staffWrap = document.getElementById('js_worksStaffWrap');
    var staffEl = document.getElementById('js_worksStaff');
    if (staffWrap && staffEl) {
      if (item.staff) {
        staffEl.textContent = item.staff;
        staffWrap.hidden = false;
        staffWrap.removeAttribute('hidden');
      } else {
        staffEl.textContent = '';
        staffWrap.hidden = true;
        staffWrap.setAttribute('hidden', '');
      }
    }

    var linkWrap = document.getElementById('js_worksLinkWrap');
    var siteLink = document.getElementById('js_worksSiteUrl');
    if (linkWrap && siteLink) {
      if (item.siteUrl) {
        siteLink.href = item.siteUrl;
        siteLink.textContent = 'Web Site';
        linkWrap.hidden = false;
        linkWrap.removeAttribute('hidden');
      } else {
        siteLink.href = '#';
        linkWrap.hidden = true;
        linkWrap.setAttribute('hidden', '');
      }
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
    detailPromise = fetch(BASE_URL + '/' + encodeURIComponent(id), {
      headers: HEADERS
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  detailPromise
    .then(applyDetail)
    .catch(function (err) {
      console.error('Works detail fetch error:', err);
      hideStateEl(detailEl);
      showError(detLoadingEl, detErrorEl);
    });
})();
