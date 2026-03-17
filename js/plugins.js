// ─── PLUGIN SYSTEM ───
// Each plugin lives in apps/{id}/{id}.js and exports the plugin interface:
//   { id, name, emoji, render(), mount(container), unmount() }

const PLUGIN_IDS = ['anki'];

let loadedPlugins = {};
let activePlugin = null;

export async function loadPlugins() {
  for (const id of PLUGIN_IDS) {
    try {
      const module = await import(`../apps/${id}/${id}.js`);
      loadedPlugins[id] = module.default;
    } catch (err) {
      console.warn(`Failed to load plugin "${id}":`, err);
    }
  }
  return loadedPlugins;
}

export function getPlugins() {
  return loadedPlugins;
}

export function getActivePlugin() {
  return activePlugin;
}

export function mountPlugin(id, container) {
  const plugin = loadedPlugins[id];
  if (!plugin) return false;

  // Unmount previous plugin if any
  if (activePlugin && activePlugin !== plugin) {
    activePlugin.unmount();
  }

  container.innerHTML = plugin.render();
  plugin.mount(container);
  activePlugin = plugin;
  return true;
}

export function unmountActivePlugin() {
  if (activePlugin) {
    activePlugin.unmount();
    activePlugin = null;
  }
}
