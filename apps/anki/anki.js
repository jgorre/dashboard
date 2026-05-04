// ─── MYANKI PLUGIN ───
// Swedish vocabulary flashcard trainer with spaced repetition

// ===== State =====
let data = { cards: [], nextId: 1 };
let currentCard = null;
let dueCards = [];
let previousDueCount = 0;
let els = {};
let keydownHandler = null;

// ===== API =====
async function pullLatest() {
  try {
    await fetch('/api/anki/pull', { method: 'POST' });
  } catch (err) {
    console.warn('Anki pull failed:', err);
  }
}

async function loadData() {
  await pullLatest();
  const res = await fetch('/api/anki/cards');
  data = await res.json();
  updateDueCards();
  updateStats();
  showNextCard();
  renderRecentCards();
  hideSyncOverlay();
  showBackupStatus('✓ Synced, up to date');
  hideBackupStatus();
}

function hideSyncOverlay() {
  if (!els.syncOverlay) return;
  els.syncOverlay.classList.add('fading');
  els.syncOverlay.addEventListener('transitionend', () => {
    if (els.syncOverlay) els.syncOverlay.classList.add('hidden');
  }, { once: true });
}

async function saveData() {
  await fetch('/api/anki/cards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

// ===== Git Backup =====
function getFormattedDate() {
  return new Date().toISOString().split('T')[0];
}

function showBackupStatus(message, isLoading = false, isError = false) {
  els.backupSpinner.classList.toggle('hidden', !isLoading);
  els.backupText.textContent = message;
  els.backupStatus.classList.remove('success', 'error');
  if (!isLoading && !isError) els.backupStatus.classList.add('success');
  if (isError) els.backupStatus.classList.add('error');
  els.backupStatus.classList.add('visible');
}

function hideBackupStatus(delay = 3000) {
  setTimeout(() => {
    if (els.backupStatus) els.backupStatus.classList.remove('visible');
  }, delay);
}

async function backupToGit(commitMessage) {
  showBackupStatus('Backing up...', true);

  try {
    const res = await fetch('/api/anki/backup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: commitMessage })
    });

    const result = await res.json();

    if (result.success) {
      const now = new Date().toLocaleTimeString();
      localStorage.setItem('ankiLastBackup', now);
      showBackupStatus(`✓ Backed up at ${now}`);
      hideBackupStatus();
    } else {
      showBackupStatus('✗ Backup failed', false, true);
      hideBackupStatus(5000);
    }
  } catch (err) {
    console.error('Backup error:', err);
    showBackupStatus('✗ Backup failed', false, true);
    hideBackupStatus(5000);
  }
}

// ===== Spaced Repetition (SM-2) =====
function getToday() {
  return new Date().toISOString().split('T')[0];
}

function addDays(dateStr, days) {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

function updateDueCards() {
  const today = getToday();
  dueCards = data.cards.filter(c => c.nextReview <= today);
  dueCards.sort(() => Math.random() - 0.5);
}

function calculateNextReview(card, rating) {
  let { interval, easeFactor, repetitions } = card;

  if (rating === 2) {
    interval = 1;
    easeFactor = Math.max(1.3, easeFactor - 0.15);
  } else if (rating === 3) {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 3;
    else if (repetitions === 2) interval = 7;
    else if (repetitions === 3) interval = 14;
    else interval = Math.ceil(interval * easeFactor);
    repetitions++;
  } else if (rating === 4) {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else if (repetitions === 2) interval = 14;
    else interval = Math.ceil(interval * easeFactor * 1.3);
    easeFactor += 0.15;
    repetitions++;
  }

  return {
    interval,
    easeFactor,
    repetitions,
    nextReview: addDays(getToday(), interval)
  };
}

// ===== UI Updates =====
function updateStats() {
  els.dueCount.textContent = `${dueCards.length} card${dueCards.length !== 1 ? 's' : ''} due`;
  els.totalCount.textContent = `${data.cards.length} total`;
}

function showNextCard() {
  if (dueCards.length === 0) {
    els.flashcard.classList.add('hidden');
    els.emptyState.classList.remove('hidden');
    currentCard = null;
    return;
  }

  els.emptyState.classList.add('hidden');
  els.flashcard.classList.remove('hidden');

  currentCard = dueCards[0];
  els.cardFrontText.textContent = currentCard.english;
  els.cardBackText.textContent = currentCard.swedish;

  els.card.classList.remove('revealed');
  els.cardAnswer.classList.add('hidden');
  els.cardHint.classList.remove('hidden');
  els.ratingButtons.classList.add('hidden');
  els.deleteBtn.classList.add('hidden');
}

function revealCard() {
  if (!currentCard || els.card.classList.contains('revealed')) return;
  els.card.classList.add('revealed');
  els.cardAnswer.classList.remove('hidden');
  els.cardHint.classList.add('hidden');
  els.ratingButtons.classList.remove('hidden');
  els.deleteBtn.classList.remove('hidden');
}

function deleteCard() {
  if (!currentCard) return;
  data.cards = data.cards.filter(c => c.id !== currentCard.id);
  dueCards.shift();
  saveData();
  updateDueCards();
  updateStats();
  renderRecentCards();
  showNextCard();
}

function rateCard(rating) {
  if (!currentCard) return;
  const prevCount = dueCards.length;
  dueCards.shift();

  if (rating === 1) {
    dueCards.push(currentCard);
  } else {
    const updates = calculateNextReview(currentCard, rating);
    const cardIndex = data.cards.findIndex(c => c.id === currentCard.id);
    if (cardIndex !== -1) {
      Object.assign(data.cards[cardIndex], updates);
    }
    saveData();
  }

  updateStats();
  showNextCard();

  if (prevCount > 0 && dueCards.length === 0) {
    backupToGit(`session completed - ${getFormattedDate()}`);
  }
}

function renderRecentCards() {
  const recent = [...data.cards].reverse().slice(0, 10);
  els.recentList.innerHTML = recent.map(c => `
    <li>
      <span class="anki-english">${escapeHtml(c.english)}</span>
      <span class="anki-swedish">${escapeHtml(c.swedish)}</span>
    </li>
  `).join('');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ===== Add Cards =====
function addCards() {
  const lines = els.bulkInput.value.trim().split('\n').filter(l => l.trim());
  let added = 0;

  for (const line of lines) {
    const separator = line.includes(' - ') ? ' - ' : ',';
    const parts = line.split(separator).map(s => s.trim());

    if (parts.length >= 2 && parts[0] && parts[1]) {
      const [english, swedish] = parts;
      data.cards.push({
        id: data.nextId++,
        english,
        swedish,
        nextReview: getToday(),
        interval: 1,
        easeFactor: 2.5,
        repetitions: 0
      });
      added++;
    }
  }

  if (added > 0) {
    saveData();
    updateDueCards();
    updateStats();
    renderRecentCards();
    els.bulkInput.value = '';
    els.addFeedback.textContent = `✓ Added ${added} card${added !== 1 ? 's' : ''}`;
    setTimeout(() => { if (els.addFeedback) els.addFeedback.textContent = ''; }, 3000);
    backupToGit(`added ${added} card${added !== 1 ? 's' : ''} - ${getFormattedDate()}`);
  } else {
    els.addFeedback.textContent = 'No valid cards found';
    els.addFeedback.style.color = 'var(--color-warning)';
    setTimeout(() => {
      if (els.addFeedback) {
        els.addFeedback.textContent = '';
        els.addFeedback.style.color = '';
      }
    }, 3000);
  }
}

// ===== Navigation =====
function switchView(viewName) {
  const container = els.container;
  container.querySelectorAll('.anki-nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === viewName);
  });

  els.studyView.classList.toggle('active', viewName === 'study');
  els.addView.classList.toggle('active', viewName === 'add');

  if (viewName === 'study') {
    updateDueCards();
    updateStats();
    showNextCard();
  }
}

// ===== Plugin Interface =====
export default {
  id: 'anki',
  name: 'MyAnki',
  emoji: '🇸🇪',

  render() {
    return `
      <div class="anki-container">
        <nav class="anki-nav">
          <button class="anki-nav-btn active" data-view="study">Study</button>
          <button class="anki-nav-btn" data-view="add">Add Cards</button>
        </nav>

        <!-- Study View -->
        <div id="anki-study-view" class="anki-view active">
          <div id="anki-sync-overlay" class="anki-sync-overlay">
            <div class="anki-sync-spinner"></div>
            <span class="anki-sync-label">Syncing vocab...</span>
          </div>

          <div class="anki-stats">
            <span id="anki-due-count">0 cards due</span>
            <span id="anki-total-count">0 total</span>
          </div>

          <div class="anki-card-container">
            <div id="anki-empty-state" class="anki-card-wrapper">
              <div class="anki-empty-message">
                <p>No cards due!</p>
                <p class="subtle">Add some cards to get started</p>
              </div>
            </div>

            <div id="anki-flashcard" class="anki-card-wrapper hidden">
              <div class="anki-card" id="anki-card">
                <div class="anki-card-front">
                  <span class="anki-card-label">English</span>
                  <span class="anki-card-text" id="anki-card-front-text"></span>
                  <span class="anki-card-hint" id="anki-card-hint">Click or press Space to reveal</span>
                </div>
                <div class="anki-card-answer hidden" id="anki-card-answer">
                  <span class="anki-card-label">Svenska</span>
                  <span class="anki-card-text" id="anki-card-back-text"></span>
                </div>
                <button class="anki-delete-btn hidden" id="anki-delete-btn" title="Delete this card">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6"/>
                  </svg>
                </button>
              </div>

              <div class="anki-rating-buttons hidden" id="anki-rating-buttons">
                <button class="anki-rate-btn again" data-rating="1">
                  <span class="anki-rating-key">1</span>
                  Again
                </button>
                <button class="anki-rate-btn hard" data-rating="2">
                  <span class="anki-rating-key">2</span>
                  Hard
                </button>
                <button class="anki-rate-btn good" data-rating="3">
                  <span class="anki-rating-key">3</span>
                  Good
                </button>
                <button class="anki-rate-btn easy" data-rating="4">
                  <span class="anki-rating-key">4</span>
                  Easy
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Add Cards View -->
        <div id="anki-add-view" class="anki-view">
          <div class="anki-add-container">
            <h2>Add New Cards</h2>
            <p class="anki-instructions">
              Enter one card per line: <code>english - swedish</code>
            </p>

            <textarea
              id="anki-bulk-input"
              placeholder="dog - hund
cat - katt
house - hus
to run - att springa"
              rows="12"
            ></textarea>

            <div class="anki-add-actions">
              <button id="anki-add-cards-btn" class="anki-primary-btn">
                Add Cards
              </button>
              <span id="anki-add-feedback"></span>
            </div>

            <div class="anki-recent-cards">
              <h3>Recently Added</h3>
              <ul id="anki-recent-list"></ul>
            </div>
          </div>
        </div>

        <!-- Backup Status -->
        <div id="anki-backup-status" class="anki-backup-status">
          <div class="anki-backup-spinner hidden"></div>
          <span id="anki-backup-text"></span>
        </div>
      </div>
    `;
  },

  mount(container) {
    els = {
      container,
      studyView: container.querySelector('#anki-study-view'),
      addView: container.querySelector('#anki-add-view'),
      dueCount: container.querySelector('#anki-due-count'),
      totalCount: container.querySelector('#anki-total-count'),
      emptyState: container.querySelector('#anki-empty-state'),
      flashcard: container.querySelector('#anki-flashcard'),
      card: container.querySelector('#anki-card'),
      cardFrontText: container.querySelector('#anki-card-front-text'),
      cardBackText: container.querySelector('#anki-card-back-text'),
      cardAnswer: container.querySelector('#anki-card-answer'),
      cardHint: container.querySelector('#anki-card-hint'),
      ratingButtons: container.querySelector('#anki-rating-buttons'),
      deleteBtn: container.querySelector('#anki-delete-btn'),
      bulkInput: container.querySelector('#anki-bulk-input'),
      addCardsBtn: container.querySelector('#anki-add-cards-btn'),
      addFeedback: container.querySelector('#anki-add-feedback'),
      recentList: container.querySelector('#anki-recent-list'),
      backupStatus: container.querySelector('#anki-backup-status'),
      backupSpinner: container.querySelector('.anki-backup-spinner'),
      backupText: container.querySelector('#anki-backup-text'),
      syncOverlay: container.querySelector('#anki-sync-overlay'),
    };

    // Nav buttons
    container.querySelectorAll('.anki-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => switchView(btn.dataset.view));
    });

    // Card click to reveal
    els.card.addEventListener('click', (e) => {
      if (e.target.closest('.anki-delete-btn')) return;
      revealCard();
    });

    // Delete button
    els.deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteCard();
    });

    // Rating buttons
    container.querySelectorAll('.anki-rate-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        rateCard(parseInt(btn.dataset.rating));
      });
    });

    // Add cards button
    els.addCardsBtn.addEventListener('click', addCards);

    // Keyboard shortcuts (scoped — removed on unmount)
    keydownHandler = (e) => {
      // Only handle when anki plugin is active
      if (!els.container || !els.container.isConnected) return;

      if (els.addView.classList.contains('active')) {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
          addCards();
        }
        return;
      }

      if (!els.studyView.classList.contains('active')) return;
      if (!currentCard) return;

      if (e.code === 'Space' && !els.card.classList.contains('revealed')) {
        e.preventDefault();
        revealCard();
      } else if (els.card.classList.contains('revealed')) {
        if (e.key === '1') rateCard(1);
        else if (e.key === '2') rateCard(2);
        else if (e.key === '3') rateCard(3);
        else if (e.key === '4') rateCard(4);
        else if (e.key === 'd' || e.key === 'D' || e.key === 'Backspace') deleteCard();
      }
    };
    document.addEventListener('keydown', keydownHandler);

    // Sync and load data
    loadData();
  },

  unmount() {
    if (keydownHandler) {
      document.removeEventListener('keydown', keydownHandler);
      keydownHandler = null;
    }
    currentCard = null;
    dueCards = [];
    els = {};
  }
};
