# Dashboard

Personal dashboard — a single place for quick links, reading lists, and pluggable apps.

## Tech Stack

- **Frontend**: Vanilla JS (ES modules), no framework
- **Build**: Vite v6
- **Backend**: Express.js (only needed for app plugins that require server-side logic)
- **Styling**: Pure CSS with custom properties, modular files in `styles/`
- **Zero runtime frontend dependencies**

## Running

```bash
npm run dev      # starts Vite + Express concurrently
npm run build    # production build (Vite)
npm start        # production mode (Express serves built files)
```

Dev runs two processes: Vite on port 5173 (frontend + HMR), Express on port 3001 (API). Vite proxies `/api/*` to Express (configured in `vite.config.js`).

## Project Structure

```
index.html              # single-page app shell
config.js               # personal URLs (gitignored, copy from config.example.js)
server.js               # Express server, auto-discovers server-plugins
vite.config.js          # Vite config with API proxy
js/
  app.js                # entry point, initializes everything
  router.js             # hash-based routing (#home, #substacks, #links, #apps, + plugins)
  renderer.js           # renders substacks cards, links, featured reading
  search.js             # search input + keyboard shortcuts (/ to focus, Esc to clear)
  clock.js              # header clock + date
  particles.js          # background particle canvas animation
  plugins.js            # plugin loader (loadPlugins, mountPlugin, unmountActivePlugin)
styles/
  variables.css         # all design tokens (colors, fonts, spacing, timing)
  base.css              # reset, body, vignette, scrollbar
  layout.css            # page layout, header, nav, views, responsive
  components.css        # search, chips, cards, worklog boxes, app cards, hints
  animations.css        # keyframes + staggered entrance animations
data/
  substacks.json        # newsletter entries
  links.json            # external link entries
apps/                   # plugin apps (see Plugin System below)
server-plugins/         # Express routers for plugins that need server APIs
```

## Core Views

- **Home** (`#home`): Quick links (work log, braindumps, todoist, field notes) + featured reading
- **Substacks** (`#substacks`): Searchable/filterable newsletter cards with category chips
- **Links** (`#links`): Searchable external links/tools
- **Apps** (`#apps`): Grid of installed plugin apps

## Plugin System

Plugins live in `apps/{id}/` and are self-contained. Each plugin exports:

```js
export default {
  id: 'anki',
  name: 'MyAnki',
  emoji: '🇸🇪',
  render() { /* returns HTML string */ },
  mount(container) { /* bind events, fetch data, start up */ },
  unmount() { /* remove event listeners, clean up */ },
};
```

### Adding a new plugin

1. Create `apps/{id}/{id}.js` exporting the interface above
2. Create `apps/{id}/{id}.css` — scope all selectors under a container class to avoid conflicts
3. Add the CSS link in `index.html`
4. Add the id to `PLUGIN_IDS` array in `js/plugins.js`
5. If the plugin needs server APIs: create `server-plugins/{id}.js` exporting `{ router, onStartup }`
   - The router is auto-mounted at `/api/{id}/`

### Key conventions

- All plugin DOM ids and CSS classes must be prefixed with the plugin id (e.g., `anki-card`, `.anki-stats`) to avoid collisions
- Plugins must clean up global event listeners in `unmount()` — especially `keydown` handlers
- Use dashboard CSS variables from `variables.css` for theme consistency
- Plugin server routes live in `server-plugins/`, NOT in the plugin's `apps/` directory (server-plugins use CommonJS `require`, frontend uses ES modules)

## Installed Plugins

### MyAnki (`apps/anki/`)

Swedish vocabulary flashcard trainer with spaced repetition (SM-2 algorithm).

- **Frontend**: `apps/anki/anki.js` + `apps/anki/anki.css`
- **Server**: `server-plugins/anki.js` (GET/POST `/api/anki/cards`, POST `/api/anki/backup`, POST `/api/anki/pull`)
- **Data**: `apps/anki/data/vocab.json` (git-tracked)
- **On open**: does `git pull` to sync latest vocab data, shows "Syncing..." status
- **Auto-backup**: commits + pushes vocab.json on card add and session completion
- **Auth**: uses the dashboard repo's existing git SSH config — no separate token needed

## Design

- Dark theme, "glowing command center" aesthetic (see `visual-design-spec.md` for full spec)
- Purple accent (`--accent: #8b5cf6`), teal for personal section
- Staggered entrance animations on view switches (`cardIn`, `fadeSlideIn`)
- Shimmer gradient bar on card tops, breathing glow on home boxes
- Monospace clock/date, Inter for body text, JetBrains Mono for code

## Config

`config.js` is gitignored. Copy `config.example.js` to `config.js` and fill in personal URLs. The app works without it but quick links on the home view will be broken.

## Git

- Remote uses SSH (`git@github-personal:jgorre/dashboard.git`)
- `vocab.json` is git-tracked and auto-committed by the anki plugin
- `.githubtoken` and `config.js` are gitignored
