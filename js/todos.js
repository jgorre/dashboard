// ─── TODOS ───

const API = '/api/todos';
let todos = [];

async function fetchTodos() {
  const res = await fetch(API);
  todos = await res.json();
}

async function addTodo(title) {
  await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
}

async function toggleTodo(id, completed) {
  await fetch(`${API}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed }),
  });
}

async function updateTitle(id, title) {
  await fetch(`${API}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
}

async function deleteTodo(id) {
  await fetch(`${API}/${id}`, { method: 'DELETE' });
}

function renderList() {
  const list = document.getElementById('todos-list');
  if (!todos.length) {
    list.innerHTML = '';
    return;
  }

  list.innerHTML = todos.map(t => {
    const cls = t.completed ? ' todos-item--completed' : '';
    const icon = t.completed ? '\u25CF' : '\u25CB';
    return `<li class="todos-item${cls}" data-id="${t.id}">
      <button class="todos-checkbox" aria-label="Toggle complete">${icon}</button>
      <span class="todos-title"></span>
      <button class="todos-delete" aria-label="Delete">\u00D7</button>
    </li>`;
  }).join('');

  // Set titles via textContent to prevent XSS
  list.querySelectorAll('.todos-item').forEach((el, i) => {
    el.querySelector('.todos-title').textContent = todos[i].title;
  });
}

async function refresh() {
  await fetchTodos();
  renderList();
}

function startEdit(titleEl, id) {
  const current = titleEl.textContent;
  const input = document.createElement('input');
  input.className = 'todos-edit-input';
  input.value = current;
  titleEl.replaceWith(input);
  input.focus();

  let saved = false;
  const save = async () => {
    if (saved) return;
    saved = true;
    const val = input.value.trim();
    if (val && val !== current) {
      await updateTitle(id, val);
    }
    await refresh();
  };

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); save(); }
    if (e.key === 'Escape') { saved = true; refresh(); }
  });
  input.addEventListener('blur', save);
}

export async function initTodos() {
  await refresh();

  const section = document.getElementById('todos-section');
  const addRow = document.getElementById('todos-add-row');
  const addBtn = document.getElementById('todos-add-btn');
  const addInput = document.getElementById('todos-add-input');

  // Click the + button to activate the input
  addBtn.addEventListener('click', () => {
    addRow.classList.add('active');
    addInput.focus();
  });

  // Add input handlers
  addInput.addEventListener('keydown', async e => {
    if (e.key === 'Enter') {
      const val = addInput.value.trim();
      if (!val) return;
      addInput.value = '';
      addRow.classList.remove('active');
      addInput.blur();
      await addTodo(val);
      await refresh();
    }
    if (e.key === 'Escape') {
      addInput.value = '';
      addRow.classList.remove('active');
      addInput.blur();
    }
  });

  addInput.addEventListener('blur', () => {
    if (!addInput.value.trim()) {
      addRow.classList.remove('active');
    }
  });

  // Click delegation for checkbox and delete
  section.addEventListener('click', async e => {
    const item = e.target.closest('.todos-item');
    if (!item) return;
    const id = Number(item.dataset.id);

    if (e.target.closest('.todos-checkbox')) {
      const todo = todos.find(t => t.id === id);
      if (todo) {
        await toggleTodo(id, !todo.completed);
        await refresh();
      }
    } else if (e.target.closest('.todos-delete')) {
      await deleteTodo(id);
      await refresh();
    }
  });

  // Double-click to edit
  section.addEventListener('dblclick', e => {
    const titleEl = e.target.closest('.todos-title');
    if (!titleEl) return;
    const item = titleEl.closest('.todos-item');
    if (!item) return;
    startEdit(titleEl, Number(item.dataset.id));
  });
}
