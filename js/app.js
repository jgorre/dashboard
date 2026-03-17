// ─── APP ENTRY POINT ───
import { renderCategories, renderCards, renderFeatured, renderLinks } from './renderer.js';
import { handleRoute, initPluginNav } from './router.js';
import { initSearch, initLinksSearch } from './search.js';
import { initClock } from './clock.js';
import { initParticles } from './particles.js';
import { loadPlugins } from './plugins.js';

// Wire up config links
if (typeof DASHBOARD_CONFIG !== 'undefined') {
  document.getElementById('worklog-link').href = DASHBOARD_CONFIG.workLogUrl;
  document.getElementById('braindumps-link').href = DASHBOARD_CONFIG.brainDumpsUrl;
  document.getElementById('todoist-link').href = DASHBOARD_CONFIG.todoistUrl;
  document.getElementById('fieldnotes-link').href = DASHBOARD_CONFIG.fieldNotesUrl;
} else {
  console.warn('DASHBOARD_CONFIG not found. Copy config.example.js to config.js and fill in your URLs.');
}

// Initialize all modules
renderCategories();
renderCards();
renderFeatured();
renderLinks();
initSearch();
initLinksSearch();
initClock();
initParticles();

// Load plugins, then initialize routing
loadPlugins().then(() => {
  initPluginNav();
  handleRoute();
});
