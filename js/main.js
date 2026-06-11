(function () {
  'use strict';

  const header = document.getElementById('header');
  const nav = document.querySelector('.nav');
  const navToggle = document.querySelector('.nav__toggle');
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

  /* Category cards → scroll to top sellers */
  categoryCards.forEach(card => {
    card.addEventListener('click', () => {
      const featured = document.getElementById('featured');
      if (featured) {
        featured.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
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
    '.feature-card, .review-card, .section-header, .category-card, .featured-card'
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
  document.querySelectorAll('.why__grid, .categories__grid').forEach(grid => {
    Array.from(grid.children).forEach((child, i) => {
      child.style.transitionDelay = `${i * 0.08}s`;
    });
  });
})();
