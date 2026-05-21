/* ============================================================
   THOMAS LI — Portfolio
   SEG3125 Assignment 1 · Summer 2026
   Vanilla JS — scroll spy, nav state, current year
   ============================================================ */

(function () {
  'use strict';

  /* --------------------------------------------------------
     1. Current year in footer
     -------------------------------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* --------------------------------------------------------
     2. Sticky-nav scroll state
     -------------------------------------------------------- */
  const nav = document.getElementById('siteNav');
  const onScroll = () => {
    if (!nav) return;
    if (window.scrollY > 8) {
      nav.classList.add('is-scrolled');
    } else {
      nav.classList.remove('is-scrolled');
    }
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* --------------------------------------------------------
     3. Active-section tracking via IntersectionObserver
     -------------------------------------------------------- */
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const linkByTarget = new Map(
    navLinks.map((a) => [a.dataset.target, a])
  );

  const sections = ['about', 'how', 'work', 'contact']
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const setActive = (id) => {
      navLinks.forEach((a) => a.classList.remove('is-active'));
      const link = linkByTarget.get(id);
      if (link) link.classList.add('is-active');
    };

    let visibleIds = new Set();

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleIds.add(entry.target.id);
          } else {
            visibleIds.delete(entry.target.id);
          }
        });
        // Choose the topmost visible section so the highlight feels stable
        const order = ['about', 'how', 'work', 'contact'];
        const current = order.find((id) => visibleIds.has(id));
        if (current) {
          setActive(current);
        } else {
          navLinks.forEach((a) => a.classList.remove('is-active'));
        }
      },
      {
        rootMargin: '-40% 0px -50% 0px',
        threshold: 0,
      }
    );

    sections.forEach((s) => io.observe(s));
  }

  /* --------------------------------------------------------
     4. Smooth-scroll polish for anchor links
        (offsets for the fixed nav, native smooth on supported browsers)
     -------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      const navHeight = nav ? nav.offsetHeight : 0;
      const top =
        target.getBoundingClientRect().top + window.scrollY - navHeight + 1;
      window.scrollTo({
        top,
        behavior: 'smooth',
      });
    });
  });

  /* --------------------------------------------------------
     5. Tiny "Coming Soon" interception on case cards
        (prevents the # jump and gives a quiet console signal)
     -------------------------------------------------------- */
  document.querySelectorAll('.case-card').forEach((card) => {
    card.addEventListener('click', (event) => {
      const href = card.getAttribute('href');
      if (href === '#') {
        event.preventDefault();
        // No alert — the visual "Coming soon" badge already tells the user.
      }
    });
  });
})();
