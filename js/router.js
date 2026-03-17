// ─── ROUTER ───
import { mountPlugin, unmountActivePlugin, getPlugins } from './plugins.js';

const VIEWS = {
  home: document.getElementById('view-home'),
  substacks: document.getElementById('view-substacks'),
  links: document.getElementById('view-links'),
  apps: document.getElementById('view-apps'),
};

const NAV_LINKS = {
  home: document.getElementById('nav-home'),
  substacks: document.getElementById('nav-substacks'),
  links: document.getElementById('nav-links'),
  apps: document.getElementById('nav-apps'),
};

const appContainer = document.getElementById('view-app');

function showView(name) {
  const plugins = getPlugins();
  const isCoreView = !!VIEWS[name];
  const isPluginView = !!plugins[name];
  const navKey = isCoreView ? name : (isPluginView ? 'apps' : 'home');

  // Hide all core views + app container
  Object.values(VIEWS).forEach(el => el.classList.remove('visible'));
  appContainer.classList.remove('visible');

  // Update nav active states
  Object.entries(NAV_LINKS).forEach(([k, el]) => el.classList.toggle('active', k === navKey));

  if (isPluginView) {
    mountPlugin(name, appContainer);
    void appContainer.offsetWidth;
    appContainer.classList.add('visible');
  } else {
    unmountActivePlugin();
    const target = VIEWS[navKey] || VIEWS.home;
    void target.offsetWidth;
    target.classList.add('visible');
  }

  const hint = document.querySelector('.keyboard-hint');
  hint.style.display = (navKey === 'home' || navKey === 'apps' || isPluginView) ? 'none' : '';
}

export function initPluginNav() {
  const plugins = getPlugins();
  const appsGrid = document.getElementById('apps-grid');

  for (const [id, plugin] of Object.entries(plugins)) {
    const card = document.createElement('a');
    card.className = 'app-card';
    card.href = `#${id}`;
    card.innerHTML = `
      <span class="app-card-emoji">${plugin.emoji}</span>
      <span class="app-card-name">${plugin.name}</span>
    `;
    appsGrid.appendChild(card);
  }
}

export function handleRoute() {
  const hash = window.location.hash.replace('#', '') || 'home';
  showView(hash);
}

window.addEventListener('hashchange', handleRoute);
