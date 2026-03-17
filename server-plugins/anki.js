const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const router = express.Router();

const DATA_FILE = path.join(__dirname, '..', 'apps', 'anki', 'data', 'vocab.json');
const PROJECT_ROOT = path.join(__dirname, '..');

function onStartup() {
  console.log('  Anki: Plugin ready');
}

// Pull latest changes before reading cards
router.post('/pull', (req, res) => {
  exec('git pull', { cwd: PROJECT_ROOT }, (error, stdout, stderr) => {
    if (error) {
      console.error('Anki pull error:', stderr || error.message);
      return res.status(500).json({ success: false, error: 'Pull failed' });
    }
    console.log('Anki pull:', stdout.trim());
    res.json({ success: true, message: stdout.trim() });
  });
});

// Get all cards
router.get('/cards', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    res.json(data);
  } catch (err) {
    res.json({ cards: [], nextId: 1 });
  }
});

// Save all cards
router.post('/cards', (req, res) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(req.body, null, 2));
  res.json({ success: true });
});

// Backup — commit and push vocab.json within the dashboard repo
router.post('/backup', (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, error: 'Commit message required' });
  }

  const vocabRelPath = path.relative(PROJECT_ROOT, DATA_FILE);
  const commands = [
    `git add ${vocabRelPath}`,
    `git commit -m "${message.replace(/"/g, '\\"')}"`,
    `git push`
  ].join(' && ');

  exec(commands, { cwd: PROJECT_ROOT }, (error, stdout, stderr) => {
    if (error) {
      if (stdout.includes('nothing to commit') || stdout.includes('no changes added to commit')) {
        return res.json({ success: true, message: 'Nothing to commit' });
      }
      console.error('Anki backup error:', stderr || stdout || error.message);
      return res.status(500).json({ success: false, error: 'Backup failed' });
    }

    console.log('Anki backup successful:', message);
    res.json({ success: true, message: 'Backed up successfully' });
  });
});

module.exports = { router, onStartup };
