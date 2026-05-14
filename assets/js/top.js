// ==========================================
//   event
// ==========================================
/** ビューポート高さを CSS 変数と .js_heroBg に同期（下端の白帯対策。インライン指定で CSS より優先） */
(function syncAppVhRoot() {
  function readViewportHeightPx() {
    var inner = window.innerHeight || 0;
    var client = document.documentElement && document.documentElement.clientHeight;
    var vv = window.visualViewport && window.visualViewport.height;
    var h = Math.max(inner, client || 0, vv || 0);
    /* サブピクセル・ツールバー変動で 1px 欠けるのを防ぐ */
    return Math.ceil(h) + 2;
  }
  function syncAppVh() {
    var h = readViewportHeightPx();
    document.documentElement.style.setProperty("--app-vh", h * 0.01 + "px");
    var hero = document.querySelector(".js_heroBg");
    if (hero) {
      hero.style.height = h + "px";
      hero.style.minHeight = h + "px";
    }
  }
  syncAppVh();
  window.addEventListener("resize", syncAppVh);
  window.addEventListener("orientationchange", syncAppVh);
  window.addEventListener("load", syncAppVh);
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", syncAppVh);
  }
  requestAnimationFrame(function () {
    syncAppVh();
    requestAnimationFrame(syncAppVh);
  });
})();

function __oppNormalizedDocumentBase() {
  var u = new URL(document.baseURI);
  var p = u.pathname;
  if (!p.endsWith("/")) {
    var last = p.slice(p.lastIndexOf("/") + 1);
    if (last.indexOf(".") !== -1) u.pathname = p.slice(0, p.lastIndexOf("/") + 1);
    else u.pathname = p + "/";
  }
  return u.href;
}

var __lottieJsonUrl = new URL(
  "assets/json/loading.json",
  __oppNormalizedDocumentBase()
).href;

var __loaderLottieStarted = false;

document.addEventListener("DOMContentLoaded", function () {
  loadingAnime();
}),
  window.addEventListener("load", function (e) {
    loader();
    heroLine();
  }),
  window.addEventListener("scroll", function () {});

const loader = function () {
  $(".js_loaderCover").delay(2e3).fadeOut(1e3),
    $(".js_loader").delay(1e3).fadeOut(500),
    setTimeout(function () {
      return_scroll(),
        $(".js_heroBg").addClass("is_animated"),
        $(".js_bgFlowHero").addClass("is_animated");
    }, 2500);
};

function loadingAnime() {
  if (__loaderLottieStarted) return;
  var container = document.getElementById("js_loaderImg");
  if (!container) return;

  function run() {
    if (typeof lottie === "undefined") return false;
    if (__loaderLottieStarted) return true;
    try {
      lottie
        .loadAnimation({
          container: container,
          renderer: "svg",
          loop: true,
          autoplay: true,
          path: __lottieJsonUrl,
        })
        .setSpeed(0.8);
      __loaderLottieStarted = true;
      return true;
    } catch (err) {
      console.warn("[LOADER] lottie.loadAnimation failed:", err);
      return false;
    }
  }

  if (!run()) {
    window.addEventListener("load", function onLoadLottie() {
      window.removeEventListener("load", onLoadLottie);
      run();
    });
  }
}

const heroLine = function () {
  document.querySelectorAll(".js_tpLinePath").forEach(function (e) {
    var n = 5 + 5 * Math.random(),
      a = 5 * Math.random();
    e.style.animationDuration = n + "s";
    e.style.animationDelay = a + "s";
  });
};
