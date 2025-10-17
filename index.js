// landing.js
// Smooth reveal-on-scroll with IntersectionObserver + small UX helpers

document.addEventListener('DOMContentLoaded', function () {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const reveals = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const obsOptions = {
      root: null,
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.08
    };
    const observer = new IntersectionObserver((entries, o) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          o.unobserve(entry.target);
        }
      });
    }, obsOptions);

    reveals.forEach((r) => observer.observe(r));
  } else {
    // fallback - show all
    reveals.forEach(r => r.classList.add('is-visible'));
  }

  // smooth scroll behavior for anchor links (in case browser doesn't)
  document.querySelectorAll('a[href^="#"]').forEach(anchor=>{
    anchor.addEventListener('click', function(e){
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({behavior:'smooth', block:'start'});
      }
    });
  });
});
