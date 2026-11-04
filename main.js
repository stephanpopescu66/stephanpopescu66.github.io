// Lazy-load and autoplay videos only while they are on screen.
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const vids = document.querySelectorAll('video[data-lazy]');
const vio = new IntersectionObserver((entries) => {
  for (const e of entries) {
    const v = e.target;
    if (e.isIntersecting) {
      if (v.preload === 'none') v.preload = 'auto';
      if (!reduce) v.play().catch(() => {});
    } else {
      v.pause();
    }
  }
}, { rootMargin: '200px 0px', threshold: 0.25 });
vids.forEach((v) => vio.observe(v));

// Tap to toggle play on touch / reduced-motion.
document.querySelectorAll('.reel figure, .mosaic video, .wide-media video').forEach((el) => {
  el.addEventListener('click', () => {
    const v = el.tagName === 'VIDEO' ? el : el.querySelector('video');
    if (v.paused) v.play().catch(() => {}); else v.pause();
  });
});

// Hero video: respect reduced motion.
const hero = document.querySelector('.hero-video');
if (reduce && hero) { hero.removeAttribute('autoplay'); hero.pause(); }

// Fade sections in.
const rio = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); }
}, { threshold: 0.12 });
document.querySelectorAll('.headline, .sub, .hero-img, .specs, .tile, .wide-media, .mosaic, .trio, .reel, .quad, .college-link, .statement').forEach((el) => {
  el.classList.add('reveal');
  rio.observe(el);
});
