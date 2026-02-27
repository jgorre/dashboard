// ─── SEARCH & KEYBOARD SHORTCUTS ───
import { renderCards, renderCategories, setActiveCategory } from './renderer.js';

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
    if (e.key === '/' && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput.focus();
    }
    if (e.key === 'Escape') {
      searchInput.value = '';
      searchInput.blur();
      setActiveCategory('All');
      renderCategories();
      renderCards();
    }
  });
}
