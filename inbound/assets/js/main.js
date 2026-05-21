const revealTargets = document.querySelectorAll('.js-reveal-up');

if (revealTargets.length) {
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.2,
    rootMargin: '0px 0px -40px 0px'
  });

  revealTargets.forEach(el => observer.observe(el));
}

const headerTitle = document.querySelector('.js-header-title-switch');
const mvSection = document.querySelector('.js-mv-section');

if (headerTitle && mvSection) {
  const mvObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        headerTitle.classList.remove('is-dark');
      } else {
        headerTitle.classList.add('is-dark');
      }
    });
  }, {
    threshold: 0,
    rootMargin: '-80px 0px 0px 0px'
  });

  mvObserver.observe(mvSection);
}

const parallaxPlane = document.querySelector('.js-parallax-plane');

if (parallaxPlane) {
  const PARALLAX_MAX_Y = 52;
  const PARALLAX_SCALE = 1.14;
  let ticking = false;

  const updateParallax = () => {
    const rect = parallaxPlane.getBoundingClientRect();
    const viewportH = window.innerHeight || document.documentElement.clientHeight;
    const inView = rect.bottom > 0 && rect.top < viewportH;

    if (inView) {
      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = viewportH / 2;
      const progress = (elementCenter - viewportCenter) / (viewportH / 2);
      const clamped = Math.max(-1, Math.min(1, progress));
      const y = -clamped * PARALLAX_MAX_Y;

      parallaxPlane.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0) scale(${PARALLAX_SCALE})`;
    }

    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  };

  updateParallax();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
}

const parallaxWords = document.querySelectorAll('.about-bg-word, .services-bg-word');

if (parallaxWords.length) {
  const WORD_PARALLAX_MAX_Y = 48;
  let wordTicking = false;

  const updateWordParallax = () => {
    const viewportH = window.innerHeight || document.documentElement.clientHeight;

    parallaxWords.forEach(word => {
      const rect = word.getBoundingClientRect();
      const inView = rect.bottom > 0 && rect.top < viewportH;
      if (!inView) return;

      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = viewportH / 2;
      const progress = (elementCenter - viewportCenter) / (viewportH / 2);
      const clamped = Math.max(-1, Math.min(1, progress));
      const y = -clamped * WORD_PARALLAX_MAX_Y;

      word.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
    });

    wordTicking = false;
  };

  const onWordScroll = () => {
    if (!wordTicking) {
      window.requestAnimationFrame(updateWordParallax);
      wordTicking = true;
    }
  };

  updateWordParallax();
  window.addEventListener('scroll', onWordScroll, { passive: true });
  window.addEventListener('resize', onWordScroll);
}

const flowCards = document.querySelectorAll('.flow-panels .flow-card');
const spMedia = window.matchMedia('(max-width: 767px)');

if (flowCards.length) {
  const closeAllFlowCards = () => {
    flowCards.forEach(card => card.classList.remove('is-open'));
  };

  const initFlowCardsForViewport = () => {
    if (!spMedia.matches) {
      closeAllFlowCards();
    }
  };

  flowCards.forEach(card => {
    card.addEventListener('click', () => {
      if (!spMedia.matches) return;

      const isOpen = card.classList.contains('is-open');
      closeAllFlowCards();
      if (!isOpen) {
        card.classList.add('is-open');
      }
    });
  });

  if (typeof spMedia.addEventListener === 'function') {
    spMedia.addEventListener('change', initFlowCardsForViewport);
  } else {
    spMedia.addListener(initFlowCardsForViewport);
  }
  initFlowCardsForViewport();
}

// Drawer menu (PC/SP shared)
(() => {
  const btn = document.querySelector('.js-site-menu-btn');
  const menu = document.querySelector('.js-site-menu');
  const overlay = document.querySelector('.js-site-menu-overlay');

  if (!btn || !menu || !overlay) return;

  const open = () => {
    document.body.classList.add('is-menu-open');
    overlay.hidden = false;
    menu.setAttribute('aria-hidden', 'false');
    btn.setAttribute('aria-expanded', 'true');
  };

  const close = () => {
    document.body.classList.remove('is-menu-open');
    overlay.hidden = true;
    menu.setAttribute('aria-hidden', 'true');
    btn.setAttribute('aria-expanded', 'false');
  };

  btn.addEventListener('click', () => {
    const isOpen = document.body.classList.contains('is-menu-open');
    if (isOpen) close();
    else open();
  });

  overlay.addEventListener('click', close);

  menu.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    const hash = a.getAttribute('href');
    if (hash && hash.startsWith('#')) {
      const target = document.querySelector(hash);
      if (target) {
        e.preventDefault();
        const header = document.querySelector('header');
        const offset = header ? header.offsetHeight + 12 : 0;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      }
    }
    close();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
})();

function setupHeroMarqueeVideos() {
  const candidateGroups = ['heart-a', 'heart-c'];
  const cooldownGroups = new Set();

  function getItems(group) {
    return Array.from(document.querySelectorAll(`[data-candidate-group="${group}"]`));
  }

  function resetGroup(group) {
    const items = getItems(group);
    items.forEach((item) => {
      const video = item.querySelector('.hero-marquee__video');
      item.classList.remove('is-playing');

      if (video) {
        video.pause();
        video.currentTime = 0;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.setAttribute('muted', '');
        video.setAttribute('playsinline', '');
      }
    });
  }

  function pickNextGroup() {
    const available = candidateGroups.filter((group) => !cooldownGroups.has(group));

    if (!available.length) {
      cooldownGroups.clear();
      return candidateGroups[Math.floor(Math.random() * candidateGroups.length)];
    }

    return available[Math.floor(Math.random() * available.length)];
  }

  function playGroup(group) {
    const items = getItems(group);
    if (!items.length) return;

    cooldownGroups.add(group);

    items.forEach((item) => {
      const video = item.querySelector('.hero-marquee__video');
      item.classList.add('is-playing');

      if (video) {
        video.pause();
        video.currentTime = 0;
        video.loop = true;
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => {});
        }
      }
    });

    window.setTimeout(() => {
      items.forEach((item) => {
        const video = item.querySelector('.hero-marquee__video');
        item.classList.remove('is-playing');
        if (video) {
          video.pause();
          video.currentTime = 0;
        }
      });
    }, 700);
  }

  candidateGroups.forEach((group) => resetGroup(group));

  function cycleOnce() {
    const nextGroup = pickNextGroup();
    playGroup(nextGroup);
  }

  window.setTimeout(() => {
    cycleOnce();
    window.setInterval(() => {
      cycleOnce();
    }, 6500);
  }, 3000);
}

window.addEventListener('load', setupHeroMarqueeVideos);
