// ─── RENDERING ───
import { substacks } from './substacks.js';
import { links } from './links.js';

const grid = document.getElementById('cards-grid');
const categoriesEl = document.getElementById('categories');

export const allCategories = ['All', ...new Set(substacks.map(s => s.category))];
export let activeCategory = 'All';

export function setActiveCategory(cat) {
  activeCategory = cat;
}

// SAFE: data is static, never user-generated — sanitize if this changes
function cardHTML(s) {
  return `
    <a class="card" href="${s.url}" target="_blank" rel="noopener noreferrer">
      <span class="card-arrow">↗</span>
      <div class="card-emoji">${s.emoji}</div>
      <div class="card-name">${s.name}</div>
      <div class="card-author">${s.author}</div>
      <div class="card-description">${s.description}</div>
      <span class="card-tag">${s.category}</span>
    </a>
  `;
}

export function renderCategories() {
  categoriesEl.innerHTML = allCategories.map(cat => `
    <button class="chip ${cat === activeCategory ? 'active' : ''}" data-category="${cat}">
      ${cat}
    </button>
  `).join('');
}

export function renderCards(filter = '', category = activeCategory) {
  const q = filter.toLowerCase();
  const filtered = substacks.filter(s => {
    const matchesSearch = !q ||
      s.name.toLowerCase().includes(q) ||
      s.author.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q);
    const matchesCategory = category === 'All' || s.category === category;
    return matchesSearch && matchesCategory;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-results">
        <div class="empty-results-icon">🔍</div>
        <div class="empty-results-text">No substacks match your search</div>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(cardHTML).join('');
}

export function renderFeatured() {
  const featuredGrid = document.getElementById('featured-grid');
  const featured = substacks.filter(s => s.featured);
  featuredGrid.innerHTML = featured.map(cardHTML).join('');
}

function linkCardHTML(l) {
  return `
    <a class="card" href="${l.url}" target="_blank" rel="noopener noreferrer">
      <span class="card-arrow">↗</span>
      <div class="card-emoji">${l.emoji}</div>
      <div class="card-name">${l.name}</div>
      <div class="card-description">${l.description}</div>
      <span class="card-tag">${l.category}</span>
    </a>
  `;
}

export function renderLinks() {
  const linksGrid = document.getElementById('links-grid');
  linksGrid.innerHTML = links.map(linkCardHTML).join('');
}
