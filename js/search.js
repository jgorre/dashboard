// ─── SEARCH & KEYBOARD SHORTCUTS ───
import { renderCards, renderCategories, renderLinks, setActiveCategory } from './renderer.js';

export function initSearch() {
  const searchInput = document.getElementById('search');
  const categoriesEl = document.getElementById('categories');

  searchInput.addEventListener('input', () => {
    renderCards(searchInput.value);
  });

  categoriesEl.addEventListener('click', e => {
    const btn = e.target.closest('.chip');
    if (!btn) return;
    setActiveCategory(btn.dataset.category);
    renderCategories();
    renderCards(searchInput.value);
  });

  document.addEventListener('keydown', e => {
    const hash = window.location.hash || '#home';

    if (e.key === '/') {
      if (hash === '#substacks' && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput.focus();
      } else if (hash === '#links') {
        const linksInput = document.getElementById('links-search');
        if (document.activeElement !== linksInput) {
          e.preventDefault();
          linksInput.focus();
        }
      }
    }

    if (e.key === 'Escape') {
      searchInput.value = '';
      searchInput.blur();
      setActiveCategory('All');
      renderCategories();
      renderCards();

      const linksInput = document.getElementById('links-search');
      linksInput.value = '';
      linksInput.blur();
      renderLinks();
    }
  });
}

export function initLinksSearch() {
  const linksInput = document.getElementById('links-search');

  linksInput.addEventListener('input', () => {
    renderLinks(linksInput.value);
  });
}
