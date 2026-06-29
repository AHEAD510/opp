(function () {
  'use strict';

  var SCROLL_KEY = 'oppContactScrollToTabs';
  var tabs = document.getElementById('contactTabs');
  if (!tabs) return;

  function normalizePath(pathname) {
    return pathname.replace(/\/index\.html$/, '/').replace(/\/$/, '') || '/';
  }

  function scrollToTabs() {
    var header = document.querySelector('.js_header');
    var headerHeight = header ? header.offsetHeight : 80;
    var top = tabs.getBoundingClientRect().top + window.pageYOffset - headerHeight;
    window.scrollTo(0, top);
  }

  document.querySelectorAll('.contact_tabs__item').forEach(function (link) {
    link.addEventListener('click', function () {
      var targetPath = normalizePath(new URL(link.href, window.location.href).pathname);
      var currentPath = normalizePath(window.location.pathname);

      if (targetPath !== currentPath) {
        sessionStorage.setItem(SCROLL_KEY, '1');
      }
    });
  });

  if (sessionStorage.getItem(SCROLL_KEY)) {
    sessionStorage.removeItem(SCROLL_KEY);
    window.addEventListener('load', scrollToTabs);
  }
})();
