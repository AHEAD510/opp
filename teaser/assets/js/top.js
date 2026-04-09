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
  "../assets/json/loading.json",
  __oppNormalizedDocumentBase()
).href;

var __loaderLottieStarted = false;

window.addEventListener("scroll", function () {
  scrollToggleClass(".js_headerCange", ".js_header", "is_change");
}),
  document.addEventListener("DOMContentLoaded", function () {
    loadingAnime();
  }),
  window.addEventListener("load", function (e) {
    loader();
    heroLine();
  });

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
    var o = 5 + 5 * Math.random(),
      a = 5 * Math.random();
    e.style.animationDuration = o + "s";
    e.style.animationDelay = a + "s";
  });
};

function scrollToggleClass(e, o, a) {
  if (!$(e).length) return;
  var scroll = $(window).scrollTop();
  var startPos = $(e).offset().top - 100;
  var endPos = startPos + $(e).outerHeight();
  if (scroll > startPos) $(o).addClass(a);
  else $(o).removeClass(a);
}

const mySwiper = new Swiper(".js_newSlide", {
  slidesPerView: "auto",
  spaceBetween: 0,
  grabCursor: !0,
  navigation: { nextEl: ".tp_news_next", prevEl: ".tp_news_prev" },
  scrollbar: { el: ".swiper-scrollbar", draggable: !0, dragSize: 100 },
  breakpoints: { 821: { spaceBetween: 24, scrollbar: { dragSize: 300 } } },
});
