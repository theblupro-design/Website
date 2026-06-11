(function () {
  'use strict';

  const INTRO_KEY = 'blupro_intro_seen';

  /* Flying prawn intro — once per session */
  function initIntroAnimation() {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion || sessionStorage.getItem(INTRO_KEY)) {
      document.getElementById('introOverlay')?.remove();
      return;
    }

    const overlay = document.getElementById('introOverlay');
    const prawn = document.getElementById('introPrawn');
    const splash = document.getElementById('introSplash');
    const heroWrap = document.getElementById('heroLogoTarget');
    const heroLogo = document.getElementById('heroLogo');
    const heroContent = document.querySelector('.hero__content');

    if (!overlay || !prawn || !heroWrap || !heroLogo) {
      overlay?.remove();
      return;
    }

    document.body.classList.add('body--intro-active');

    function finishIntro() {
      sessionStorage.setItem(INTRO_KEY, '1');
      document.body.classList.remove('body--intro-active');
      overlay.classList.add('intro-overlay--hide');
      setTimeout(() => overlay.remove(), 550);
    }

    function runIntro() {
      const rect = heroWrap.getBoundingClientRect();
      if (rect.width < 10) {
        finishIntro();
        return;
      }

      const size = Math.min(rect.width * 0.4, 128);
      const targetX = rect.left + rect.width * 0.27;
      const targetY = rect.top + rect.height * 0.44;
      const startX = -size * 0.8;
      const startY = window.innerHeight * 0.88;
      const midX = targetX - window.innerWidth * 0.12;
      const midY = Math.min(startY, targetY) - window.innerHeight * 0.18;
      const endLeft = targetX - size / 2;
      const endTop = targetY - size / 2;

      prawn.style.width = size + 'px';
      prawn.style.height = size + 'px';

      const anim = prawn.animate([
        {
          left: startX + 'px',
          top: startY + 'px',
          transform: 'rotate(-40deg) scale(1.25)',
          opacity: 1
        },
        {
          left: (midX - size / 2) + 'px',
          top: (midY - size / 2) + 'px',
          transform: 'rotate(-12deg) scale(1.08)',
          opacity: 1,
          offset: 0.5
        },
        {
          left: endLeft + 'px',
          top: endTop + 'px',
          transform: 'rotate(6deg) scale(1)',
          opacity: 1,
          offset: 0.82
        },
        {
          left: endLeft + 'px',
          top: endTop + 'px',
          transform: 'rotate(0deg) scale(0.15)',
          opacity: 0
        }
      ], {
        duration: 2100,
        easing: 'cubic-bezier(0.33, 1, 0.68, 1)',
        fill: 'forwards'
      });

      anim.onfinish = () => {
        if (splash) {
          splash.style.left = targetX + 'px';
          splash.style.top = targetY + 'px';
          splash.classList.add('intro-splash--pop');
        }

        heroLogo.style.transition = 'opacity 0.45s ease, transform 0.45s cubic-bezier(0.34, 1.2, 0.64, 1)';
        heroLogo.style.opacity = '1';
        heroLogo.style.transform = 'scale(1.04)';

        if (heroContent) {
          heroContent.style.transition = 'opacity 0.55s ease 0.15s';
          heroContent.style.opacity = '1';
        }

        setTimeout(() => {
          heroLogo.style.transform = 'scale(1)';
          finishIntro();
        }, 400);
      };
    }

    if (document.readyState === 'complete') {
      requestAnimationFrame(() => requestAnimationFrame(runIntro));
    } else {
      window.addEventListener('load', () => {
        requestAnimationFrame(() => requestAnimationFrame(runIntro));
      });
    }
  }

  initIntroAnimation();

  const header = document.getElementById('header');
  const nav = document.querySelector('.nav');
  const navToggle = document.querySelector('.nav__toggle');
  const productCards = document.querySelectorAll('.product-card');
  const categoryCards = document.querySelectorAll('.category-card[data-filter]');

  /* Header scroll effect */
  function onScroll() {
    header.classList.toggle('header--scrolled', window.scrollY > 20);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile navigation */
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('nav--open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    document.querySelectorAll('.nav__links a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('nav--open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* Apply product filter (from category cards) */
  function applyFilter(filter) {
    productCards.forEach(card => {
      const category = card.dataset.category;
      const show = filter === 'all' || category === filter;
      card.classList.toggle('hidden', !show);

      if (show) {
        card.style.animation = 'none';
        card.offsetHeight;
        card.style.animation = 'fadeIn 0.4s ease forwards';
      }
    });
  }

  /* Category cards → scroll to products + filter */
  categoryCards.forEach(card => {
    card.addEventListener('click', () => {
      const filter = card.dataset.filter;
      const products = document.getElementById('products');
      if (products) {
        products.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      setTimeout(() => applyFilter(filter), 400);
    });
  });

  /* Reviews carousel — one at a time, auto-advance */
  const reviewsTrack = document.getElementById('reviewsTrack');
  const reviewsDots = document.getElementById('reviewsDots');
  const prevBtn = document.querySelector('.reviews__nav--prev');
  const nextBtn = document.querySelector('.reviews__nav--next');

  if (reviewsTrack) {
    const slides = reviewsTrack.querySelectorAll('.review-card--slide');
    let current = 0;
    let timer = null;
    const interval = 5000;

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'reviews__dot' + (i === 0 ? ' reviews__dot--active' : '');
      dot.setAttribute('aria-label', `Go to review ${i + 1}`);
      dot.addEventListener('click', () => goTo(i, true));
      reviewsDots.appendChild(dot);
    });

    const dots = reviewsDots.querySelectorAll('.reviews__dot');

    function goTo(index, userAction) {
      current = (index + slides.length) % slides.length;
      reviewsTrack.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('reviews__dot--active', i === current));
      if (userAction) resetTimer();
    }

    function next() {
      goTo(current + 1, false);
    }

    function prev() {
      goTo(current - 1, false);
    }

    function resetTimer() {
      clearInterval(timer);
      timer = setInterval(next, interval);
    }

    if (prevBtn) prevBtn.addEventListener('click', () => { prev(); resetTimer(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { next(); resetTimer(); });

    const carousel = document.querySelector('.reviews__carousel');
    if (carousel) {
      carousel.addEventListener('mouseenter', () => clearInterval(timer));
      carousel.addEventListener('mouseleave', resetTimer);
    }

    resetTimer();
  }

  /* Scroll reveal animations */
  const revealElements = document.querySelectorAll(
    '.feature-card, .product-card, .review-card, .section-header, .category-card, .featured-card'
  );

  revealElements.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  revealElements.forEach(el => observer.observe(el));

  /* Stagger animation for grid children */
  document.querySelectorAll('.why__grid, .products__grid, .categories__grid').forEach(grid => {
    Array.from(grid.children).forEach((child, i) => {
      child.style.transitionDelay = `${i * 0.08}s`;
    });
  });
})();

const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);
