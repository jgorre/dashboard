const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const DATA_FILE = path.join(__dirname, '..', 'data', 'todos.json');

function readTodos() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeTodos(todos) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2));
}

function onStartup() {
  if (!fs.existsSync(DATA_FILE)) {
    writeTodos([]);
  }
  console.log('  Todos: Plugin ready');
}

// Get all todos
router.get('/', (req, res) => {
  res.json(readTodos());
});

// Create a todo
router.post('/', (req, res) => {
  const { title } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }
  const todos = readTodos();
  const id = Math.max(0, ...todos.map(t => t.id)) + 1;
  const todo = { id, title: title.trim(), completed: false };
  todos.push(todo);
  writeTodos(todos);
  res.status(201).json(todo);
});

// Update a todo (partial)
router.patch('/:id', (req, res) => {
  const todos = readTodos();
  const idx = todos.findIndex(t => t.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  if (req.body.title !== undefined) todos[idx].title = req.body.title.trim();
  if (req.body.completed !== undefined) todos[idx].completed = req.body.completed;

  writeTodos(todos);
  res.json(todos[idx]);
});

// Delete a todo
router.delete('/:id', (req, res) => {
  let todos = readTodos();
  const len = todos.length;
  todos = todos.filter(t => t.id !== Number(req.params.id));
  if (todos.length === len) return res.status(404).json({ error: 'Not found' });

  writeTodos(todos);
  res.json({ success: true });
});

module.exports = { router, onStartup };
