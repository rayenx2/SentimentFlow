const API = 'http://localhost:8080';
const history = [];

// ── Tab navigation ──
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`tab-${tab}`).classList.add('active');
  });
});

// ── Model status ──
async function checkModelStatus() {
  try {
    const res = await fetch(`${API}/health`);
    const data = await res.json();
    const dot = document.getElementById('model-dot');
    const status = document.getElementById('model-status-text');
    if (data.status === 'healthy' && data.model.status === 'available') {
      dot.className = 'model-dot healthy';
      status.textContent = 'Available';
    } else {
      dot.className = 'model-dot unhealthy';
      status.textContent = data.model.status || 'Unavailable';
    }
  } catch {
    document.getElementById('model-dot').className = 'model-dot unhealthy';
    document.getElementById('model-status-text').textContent = 'Unreachable';
  }
}

checkModelStatus();
setInterval(checkModelStatus, 30000);

// ── Char counter ──
const singleInput = document.getElementById('single-input');
const charCount = document.getElementById('char-count');
singleInput.addEventListener('input', () => {
  charCount.textContent = singleInput.value.length;
});

// ── Example chips ──
document.querySelectorAll('.example-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    singleInput.value = chip.dataset.text;
    charCount.textContent = singleInput.value.length;
    singleInput.focus();
  });
});

// ── Single analysis ──
const singleBtn = document.getElementById('single-analyze-btn');
singleBtn.addEventListener('click', async () => {
  const text = singleInput.value.trim();
  if (!text) return;

  setLoading(singleBtn, 'single-spinner', true);
  showSingleEmpty(false);
  showSingleResult(false);
  showSingleError(false);

  try {
    const res = await fetch(`${API}/api/v1/sentiment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    renderSingleResult(data);
    addToHistory(data);
  } catch (err) {
    document.getElementById('single-error-msg').textContent = err.message;
    showSingleError(true);
  } finally {
    setLoading(singleBtn, 'single-spinner', false);
  }
});

singleInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) singleBtn.click();
});

function showSingleEmpty(show) {
  document.getElementById('single-empty').style.display = show ? 'flex' : 'none';
}

function showSingleResult(show) {
  document.getElementById('single-result').style.display = show ? 'flex' : 'none';
}

function showSingleError(show) {
  document.getElementById('single-error').style.display = show ? 'flex' : 'none';
}

function renderSingleResult(data) {
  const { sentiment, confidence, probabilities, text } = data;
  const pct = Math.round(confidence * 100);

  const badge = document.getElementById('sentiment-badge');
  badge.className = `sentiment-badge-large ${sentiment}`;
  document.getElementById('sentiment-icon').textContent = sentimentIcon(sentiment);
  document.getElementById('sentiment-label').textContent = capitalize(sentiment);

  // Confidence ring
  const ringFill = document.getElementById('confidence-ring-fill');
  const circumference = 314.16;
  ringFill.style.stroke = sentimentColor(sentiment);
  document.getElementById('confidence-pct').textContent = pct + '%';
  setTimeout(() => {
    ringFill.style.strokeDashoffset = circumference - (circumference * confidence);
  }, 50);

  // Probability bars
  animateBar('bar-positive', 'val-positive', probabilities.positive || 0);
  animateBar('bar-neutral', 'val-neutral', probabilities.neutral || 0);
  animateBar('bar-negative', 'val-negative', probabilities.negative || 0);

  document.getElementById('analyzed-text-box').textContent = `"${text}"`;

  showSingleResult(true);
}

function animateBar(barId, valId, value) {
  const pct = Math.round(value * 100);
  const bar = document.getElementById(barId);
  const val = document.getElementById(valId);
  val.textContent = pct + '%';
  setTimeout(() => { bar.style.width = pct + '%'; }, 50);
}

// ── Batch analysis ──
const batchQueue = [];

function renderQueue() {
  const container = document.getElementById('batch-queue');
  const empty = document.getElementById('queue-empty');
  const count = document.getElementById('queue-count');
  const analyzeBtn = document.getElementById('batch-analyze-btn');

  count.textContent = batchQueue.length;
  analyzeBtn.disabled = batchQueue.length === 0;

  if (batchQueue.length === 0) {
    container.innerHTML = '';
    container.appendChild(empty);
    empty.style.display = 'flex';
    return;
  }

  empty.style.display = 'none';
  const existing = container.querySelectorAll('.queue-item');
  existing.forEach(el => el.remove());

  batchQueue.forEach((text, i) => {
    const item = document.createElement('div');
    item.className = 'queue-item';
    item.innerHTML = `
      <span class="queue-item-num">${i + 1}</span>
      <span class="queue-item-text" title="${escapeHtml(text)}">${escapeHtml(text)}</span>
      <button class="queue-remove-btn" data-index="${i}" title="Remove">×</button>
    `;
    container.appendChild(item);
  });

  container.querySelectorAll('.queue-remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      batchQueue.splice(parseInt(btn.dataset.index), 1);
      renderQueue();
    });
  });
}

document.getElementById('batch-add-btn').addEventListener('click', () => {
  const text = document.getElementById('batch-single-input').value.trim();
  if (!text || batchQueue.length >= 100) return;
  batchQueue.push(text);
  document.getElementById('batch-single-input').value = '';
  renderQueue();
});

document.getElementById('batch-single-input').addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    document.getElementById('batch-add-btn').click();
  }
});

document.getElementById('batch-paste-btn').addEventListener('click', () => {
  const raw = document.getElementById('batch-paste-input').value;
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  const remaining = 100 - batchQueue.length;
  lines.slice(0, remaining).forEach(l => batchQueue.push(l));
  document.getElementById('batch-paste-input').value = '';
  renderQueue();
});

document.getElementById('batch-clear-btn').addEventListener('click', () => {
  batchQueue.length = 0;
  renderQueue();
});

document.getElementById('batch-analyze-btn').addEventListener('click', async () => {
  if (batchQueue.length === 0) return;

  const btn = document.getElementById('batch-analyze-btn');
  setLoading(btn, 'batch-spinner', true);

  try {
    const res = await fetch(`${API}/api/v1/sentiment/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts: [...batchQueue] })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    renderBatchResults(data.results);
    data.results.forEach(r => addToHistory(r));
  } catch (err) {
    alert('Batch analysis failed: ' + err.message);
  } finally {
    setLoading(btn, 'batch-spinner', false);
  }
});

function renderBatchResults(results) {
  const empty = document.getElementById('batch-empty');
  const list = document.getElementById('batch-results-list');

  empty.style.display = 'none';
  list.style.display = 'flex';
  list.innerHTML = '';

  results.forEach((r, i) => {
    const item = document.createElement('div');
    item.className = 'batch-result-item';
    item.innerHTML = `
      <span class="batch-result-num">${i + 1}</span>
      <div class="batch-result-body">
        <div class="batch-result-text" title="${escapeHtml(r.text)}">${escapeHtml(r.text)}</div>
        <div class="batch-result-meta">
          <span class="sentiment-badge-sm ${r.sentiment}">${capitalize(r.sentiment)}</span>
          <span class="conf-text">${Math.round(r.confidence * 100)}% confidence</span>
        </div>
      </div>
    `;
    list.appendChild(item);
  });
}

// ── History ──
let activeFilter = 'all';

function addToHistory(data) {
  history.unshift({
    text: data.text,
    sentiment: data.sentiment,
    confidence: data.confidence,
    time: new Date()
  });
  renderHistory();
}

function renderHistory() {
  const list = document.getElementById('history-list');
  const empty = document.getElementById('history-empty');

  const filtered = activeFilter === 'all'
    ? history
    : history.filter(h => h.sentiment === activeFilter);

  if (filtered.length === 0) {
    list.innerHTML = '';
    list.appendChild(empty);
    empty.style.display = 'flex';
    return;
  }

  empty.style.display = 'none';
  const items = list.querySelectorAll('.history-item');
  items.forEach(el => el.remove());

  filtered.forEach(entry => {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `
      <div class="history-sentiment-dot ${entry.sentiment}"></div>
      <div class="history-body">
        <div class="history-text">${escapeHtml(entry.text)}</div>
        <div class="history-meta">
          <span>${Math.round(entry.confidence * 100)}% confidence</span>
          <span>${formatTime(entry.time)}</span>
        </div>
      </div>
      <span class="history-badge ${entry.sentiment}">${capitalize(entry.sentiment)}</span>
    `;
    list.appendChild(item);
  });
}

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    activeFilter = btn.dataset.filter;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderHistory();
  });
});

document.getElementById('clear-history-btn').addEventListener('click', () => {
  history.length = 0;
  renderHistory();
});

// ── Helpers ──
function setLoading(btn, spinnerId, loading) {
  btn.classList.toggle('loading', loading);
  btn.disabled = loading;
  document.getElementById(spinnerId).style.display = loading ? 'inline-block' : 'none';
}

function sentimentIcon(s) {
  return { positive: '😊', neutral: '😐', negative: '😞' }[s] || '🤔';
}

function sentimentColor(s) {
  return { positive: '#22c55e', neutral: '#f59e0b', negative: '#ef4444' }[s] || '#6366f1';
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Init queue render
renderQueue();
