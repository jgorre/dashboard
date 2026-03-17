const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Auto-discover and mount server plugins
const pluginDir = path.join(__dirname, 'server-plugins');
if (fs.existsSync(pluginDir)) {
  for (const file of fs.readdirSync(pluginDir)) {
    if (!file.endsWith('.js')) continue;
    const name = path.basename(file, '.js');
    const plugin = require(path.join(pluginDir, file));

    // Support plugins that export { router, onStartup }
    if (plugin.router) {
      app.use(`/api/${name}`, plugin.router);
      console.log(`  Loaded server plugin: /api/${name}`);
      if (typeof plugin.onStartup === 'function') {
        plugin.onStartup();
      }
    } else {
      // Plain router export
      app.use(`/api/${name}`, plugin);
      console.log(`  Loaded server plugin: /api/${name}`);
    }
  }
}

// In production, serve the built files
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`\n  Dashboard API server running at http://localhost:${PORT}\n`);
});
