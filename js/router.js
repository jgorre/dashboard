// ─── ROUTER ───
import { mountPlugin, unmountActivePlugin, getPlugins } from './plugins.js';

const VIEWS = {
  home: document.getElementById('view-home'),
  substacks: document.getElementById('view-substacks'),
  links: document.getElementById('view-links'),
};

const NAV_LINKS = {
  home: document.getElementById('nav-home'),
  substacks: document.getElementById('nav-substacks'),
  links: document.getElementById('nav-links'),
};

const appContainer = document.getElementById('view-app');
let pluginNavLinks = {};

function showView(name) {
  const plugins = getPlugins();
  const isCoreView = !!VIEWS[name];
  const isPluginView = !!plugins[name];
  const navKey = isCoreView ? name : (isPluginView ? name : 'home');

  // Hide all core views
  Object.values(VIEWS).forEach(el => el.classList.remove('visible'));
  appContainer.classList.remove('visible');

  // Update nav active states
  Object.entries(NAV_LINKS).forEach(([k, el]) => el.classList.toggle('active', k === navKey));
  Object.entries(pluginNavLinks).forEach(([k, el]) => el.classList.toggle('active', k === navKey));

  if (isPluginView) {
    // Unmount any previously active plugin, mount the new one
    mountPlugin(name, appContainer);
    void appContainer.offsetWidth;
    appContainer.classList.add('visible');
  } else {
    // Core view — unmount any active plugin
    unmountActivePlugin();
    const target = VIEWS[navKey] || VIEWS.home;
    void target.offsetWidth;
    target.classList.add('visible');
  }

  const hint = document.querySelector('.keyboard-hint');
  hint.style.display = (navKey === 'home' || isPluginView) ? 'none' : '';
}

export function initPluginNav() {
  const plugins = getPlugins();
  const pluginNavContainer = document.getElementById('plugin-nav');

  for (const [id, plugin] of Object.entries(plugins)) {
    const link = document.createElement('a');
    link.className = 'nav-link';
    link.href = `#${id}`;
    link.id = `nav-${id}`;
    link.textContent = `${plugin.emoji} ${plugin.name}`;
    pluginNavContainer.appendChild(link);
    pluginNavLinks[id] = link;
  }
}

export function handleRoute() {
  const hash = window.location.hash.replace('#', '') || 'home';
  showView(hash);
}

window.addEventListener('hashchange', handleRoute);
