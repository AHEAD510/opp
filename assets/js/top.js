// ==========================================
//   event
// ==========================================
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
// ==============================
// TOP: NEWS swiper
// ==============================
(function () {
    function initNewsSwiper() {
      if (typeof Swiper === "undefined") return;
  
      var el = document.querySelector(".js_newsSwiper");
      if (!el) return;
  
      // 二重初期化防止
      if (el.classList.contains("is-swiper-initialized")) return;
  
      new Swiper(el, {
        slidesPerView: "auto",
        spaceBetween: 24,
        speed: 600,
        loop: false,
        watchOverflow: true,
        grabCursor: true,
  
        navigation: {
          nextEl: ".js_newsNext",
          prevEl: ".js_newsPrev",
        },
  
        scrollbar: {
          el: ".js_newsScrollbar",
          draggable: true,
          dragSize: 120,
        },
  
        breakpoints: {
          0: { spaceBetween: 16 },
          768: { spaceBetween: 24 },
          1200: { spaceBetween: 32 },
        },
  
        on: {
          init: function () {
            el.classList.add("is-swiper-initialized");
          },
        },
      });
    }
  
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initNewsSwiper);
    } else {
      initNewsSwiper();
    }
  })();
