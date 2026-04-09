// ==========================================
//   event
// ==========================================
document.addEventListener("DOMContentLoaded",()=>{loadingAnime()}),window.addEventListener("load",e=>{loader(),heroLine()}),window.addEventListener("scroll",()=>{});const loader=function(){$(".js_loaderCover").delay(2e3).fadeOut(1e3),$(".js_loader").delay(1e3).fadeOut(500),setTimeout(function(){return_scroll(),$(".js_heroBg").addClass("is_animated"),$(".js_bgFlowHero").addClass("is_animated")},2500)};function loadingAnime(){lottie.loadAnimation({container:document.getElementById("js_loaderImg"),renderer:"svg",loop:!0,autoplay:!0,path:"/opp/assets/json/loading.json"}).setSpeed(.8)}const heroLine=function(){document.querySelectorAll(".js_tpLinePath").forEach(e=>{var n=5+5*Math.random(),a=5*Math.random();e.style.animationDuration=n+"s",e.style.animationDelay=a+"s"})}
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