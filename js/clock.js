// ─── CLOCK & DATE ───
function updateTime() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });
  document.getElementById('clock').textContent = timeStr;
}

function setDate() {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  document.getElementById('date-display').textContent = dateStr;
}

export function initClock() {
  setDate();
  updateTime();
  setInterval(updateTime, 1000);
}
