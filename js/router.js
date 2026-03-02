// ─── ROUTER ───
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

function showView(name) {
  const navKey = VIEWS[name] ? name : 'home';
  Object.values(VIEWS).forEach(el => el.classList.remove('visible'));
  Object.entries(NAV_LINKS).forEach(([k, el]) => el.classList.toggle('active', k === navKey));
  const target = VIEWS[navKey];
  void target.offsetWidth; // force reflow for animations
  target.classList.add('visible');

  const hint = document.querySelector('.keyboard-hint');
  hint.style.display = navKey === 'home' ? 'none' : '';
}

export function handleRoute() {
  const hash = window.location.hash.replace('#', '') || 'home';
  showView(hash);
}

window.addEventListener('hashchange', handleRoute);
