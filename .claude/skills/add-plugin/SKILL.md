---
name: add-plugin
description: "Scaffold a new plugin app for the dashboard. Use this skill whenever the user wants to add a new app, tool, widget, or feature to the dashboard as a plugin — even if they don't say 'plugin' explicitly. Triggers on phrases like 'add an app to the dashboard', 'I want a pomodoro timer', 'new widget', 'build a habit tracker', etc."
---

# Add Plugin to Dashboard

This skill scaffolds a new plugin for the dashboard. The dashboard has a lightweight plugin system where each app is a self-contained module with a standard lifecycle interface.

## Before you start

Read `CLAUDE.md` at the project root for full project context if you haven't already. The existing anki plugin (`apps/anki/`) is the reference implementation — read `apps/anki/anki.js` and `apps/anki/anki.css` to understand the patterns before generating code.

## Step 1: Gather requirements

Ask the user for the following (skip anything they've already provided):

- **Plugin ID**: short kebab-case identifier (e.g., `pomodoro`, `habit-tracker`). Used for directory names, CSS prefixes, API routes.
- **Display name**: human-readable name shown in the Apps grid (e.g., "Pomodoro", "Habit Tracker")
- **Emoji**: single emoji for the app card in the Apps view
- **What it does**: brief description of the plugin's functionality — enough to know what the UI and data model should look like
- **Needs server API?**: yes/no. Server is needed if the plugin reads/writes files, calls external services, or needs any backend logic. Pure frontend widgets (clock, calculator) don't need one.

## Step 2: Create the files

### 2a. Frontend plugin: `apps/{id}/{id}.js`

Export default object with the plugin interface:

```js
export default {
  id: '{id}',
  name: '{Display Name}',
  emoji: '{emoji}',
  render() { /* return HTML string */ },
  mount(container) { /* query DOM, bind events, load data */ },
  unmount() { /* remove event listeners, clear timers, reset state */ },
};
```

Key conventions (these prevent bugs that are annoying to debug):
- **All DOM queries go in `mount()`**, not at module top level — the HTML doesn't exist until `render()` is called. Store refs in a local `els` object.
- **All global event listeners (especially `keydown`) must be removed in `unmount()`** — otherwise they leak into other views and cause conflicts with the dashboard's own keyboard shortcuts.
- **Prefix all DOM ids and CSS classes** with the plugin id (e.g., `{id}-card`, `.{id}-stats`) to avoid collisions with other plugins or dashboard core.
- **Use `/api/{id}/...`** for any fetch calls to the server plugin.
- Guard against stale DOM refs in timeouts/callbacks: check `els.container && els.container.isConnected` before touching the DOM.

### 2b. Plugin styles: `apps/{id}/{id}.css`

- Scope everything under `.{id}-container` or similar
- Use dashboard CSS variables from `styles/variables.css` — never hardcode colors. The important ones:
  - Backgrounds: `--bg-primary`, `--bg-secondary`, `--bg-card`, `--bg-elevated`
  - Text: `--text-primary`, `--text-secondary`, `--text-muted`
  - Accent: `--accent`, `--accent-light`, `--accent-glow`, `--accent-subtle`
  - Borders: `--border`, `--border-light`
  - Radii: `--radius-sm` (8px), `--radius-md` (12px), `--radius-lg` (16px)
  - Timing: `--speed-fast` (150ms), `--speed-base` (250ms), `--speed-slow` (400ms)
  - Fonts: `--font-sans`, `--font-mono`
  - Semantic colors: `--color-success`, `--color-warning`, `--color-danger`, `--color-info`
- Set `font-family: var(--font-sans)` on buttons and inputs (they don't inherit by default)

### 2c. Data directory (if needed): `apps/{id}/data/`

Create this if the plugin stores any data files (JSON, etc.). The server plugin reads/writes from here.

### 2d. Server plugin (if needed): `server-plugins/{id}.js`

```js
const express = require('express');
const router = express.Router();

function onStartup() {
  console.log('  {Name}: Plugin ready');
}

// Routes are mounted at /api/{id}/
router.get('/example', (req, res) => {
  res.json({ ok: true });
});

module.exports = { router, onStartup };
```

Uses CommonJS (`require`/`module.exports`), not ES modules — the server runs in Node without Vite.

## Step 3: Register the plugin

### 3a. Add CSS link to `index.html`

Add after the other plugin CSS links in the `<head>`:
```html
<link rel="stylesheet" href="apps/{id}/{id}.css" />
```

### 3b. Add to PLUGIN_IDS in `js/plugins.js`

Find the `PLUGIN_IDS` array and add the new id:
```js
const PLUGIN_IDS = ['anki', '{id}'];
```

That's it — the plugin loader, router, nav, and apps grid all pick up the new plugin automatically from this single registration point.

## Step 4: Verify

After scaffolding, tell the user:
1. Run `npm run dev` (or restart if already running)
2. Navigate to **Apps** in the dashboard
3. The new plugin should appear as a card — click it to open

If the plugin has a server component, verify the API works:
```bash
curl http://localhost:5173/api/{id}/example
```

## What NOT to do

- Don't modify `router.js` — it discovers plugins dynamically
- Don't modify `app.js` — plugin loading is automatic
- Don't add nav links to `index.html` — the Apps view handles this
- Don't use global CSS selectors — always prefix with the plugin id
