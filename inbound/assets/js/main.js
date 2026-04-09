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
