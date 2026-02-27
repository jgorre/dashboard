// ─── APP ENTRY POINT ───
import { renderCategories, renderCards, renderFeatured } from './renderer.js';
import { handleRoute } from './router.js';
import { initSearch } from './search.js';
import { initClock } from './clock.js';
import { initParticles } from './particles.js';

// Wire up config links
if (typeof DASHBOARD_CONFIG !== 'undefined') {
  document.getElementById('worklog-link').href = DASHBOARD_CONFIG.workLogUrl;
  document.getElementById('braindumps-link').href = DASHBOARD_CONFIG.brainDumpsUrl;
  document.getElementById('todoist-link').href = DASHBOARD_CONFIG.todoistUrl;
  document.getElementById('fieldnotes-link').href = DASHBOARD_CONFIG.fieldNotesUrl;
}

// Initialize all modules
renderCategories();
renderCards();
renderFeatured();
initSearch();
initClock();
initParticles();
handleRoute();
