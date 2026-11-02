(() => {
  const selectors = [
    '.hero', '.category-nav', '.flash-sale-section', '.trust-row',
    '.section-head', '.best-sellers-section', '.newsletter',
    '.product-grid .product-card', '.category'
  ].join(',');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window)) return;

  const reveal = (root = document) => {
    root.querySelectorAll(selectors).forEach((element, index) => {
      if (element.dataset.scrollRevealReady) return;
      element.dataset.scrollRevealReady = '1';
      element.dataset.scrollReveal = element.matches('.product-card,.category') ? 'scale' : 'up';
      if (element.matches('.product-grid .product-card')) {
        element.style.setProperty('--reveal-delay', `${(index % 4) * 65}ms`);
      }
      observer.observe(element);
    });
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealed');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -45px 0px' });

  reveal();
  const productGrid = document.getElementById('productGrid');
  if (productGrid) {
    new MutationObserver(() => reveal(productGrid)).observe(productGrid, { childList: true, subtree: true });
  }
})();
