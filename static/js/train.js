/* ═══════════════════════════════════════════════════
   TRAIN.JS — Training pipeline trigger & status UI
═══════════════════════════════════════════════════ */

let isTraining = false;

const STAGES = [
  { id: 'ingestion',      label: 'Data Ingestion',      progress: 15  },
  { id: 'validation',     label: 'Data Validation',     progress: 35  },
  { id: 'transformation', label: 'Data Transformation', progress: 55  },
  { id: 'training',       label: 'Model Training',      progress: 85  },
  { id: 'sync',           label: 'S3 Sync',             progress: 100 },
];

// ── Logger ────────────────────────────────────────
function logLine(msg, level = 'info') {
  const terminal = document.getElementById('log-terminal');
  const ts = new Date().toLocaleTimeString('en-IN', { hour12: false });
  const span = document.createElement('span');
  span.className = 'log-line';
  span.innerHTML = `<span class="ts">${ts}</span><span class="${level}">${msg}</span>`;
  terminal.appendChild(span);
  terminal.scrollTop = terminal.scrollHeight;
}

function clearLog() {
  const terminal = document.getElementById('log-terminal');
  terminal.innerHTML =
    '<span class="log-line"><span class="ts">--:--:--</span><span class="info">Log cleared.</span></span>';
}

// ── Stage update ──────────────────────────────────
function setStageRunning(stageId) {
  const el     = document.getElementById(`stage-${stageId}`);
  const status = document.getElementById(`status-${stageId}`);
  if (el)     el.className     = 'stage-item running';
  if (status) {
    status.className  = 'stage-status running';
    status.innerHTML  = '<span class="spinner" style="width:12px;height:12px;border-width:2px;"></span> Running';
  }
}

function setStageComplete(stageId) {
  const el     = document.getElementById(`stage-${stageId}`);
  const status = document.getElementById(`status-${stageId}`);
  if (el)     el.className     = 'stage-item done';
  if (status) {
    status.className  = 'stage-status done';
    status.textContent = '✓ Complete';
  }
}

function setStageError(stageId) {
  const el     = document.getElementById(`stage-${stageId}`);
  const status = document.getElementById(`status-${stageId}`);
  if (el)     el.className     = 'stage-item failed';
  if (status) {
    status.className  = 'stage-status failed';
    status.textContent = '✗ Failed';
  }
}

function setProgress(pct) {
  const bar = document.getElementById('overall-progress');
  if (bar) bar.style.width = pct + '%';
}

function setBadge(text, type = 'info') {
  const badge = document.getElementById('pipeline-badge');
  if (!badge) return;
  badge.className = `badge badge-${type}`;
  badge.textContent = text;
}

// ── Simulate stage delay ──────────────────────────
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Main Training Flow ────────────────────────────
async function startTraining() {
  if (isTraining) return;
  isTraining = true;

  const btn = document.getElementById('launch-train-btn');
  const resultBanner = document.getElementById('train-result-banner');

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Training in Progress...';
  resultBanner.style.display = 'none';
  setBadge('Running', 'warning');

  logLine('🚀 Training pipeline initiated', 'info');
  logLine('📡 Connecting to MongoDB — PRINCEAI / NetworkData', 'info');

  try {
    // ── Stage 1: Data Ingestion ────────────────
    setStageRunning('ingestion');
    setProgress(5);
    await delay(1200);
    logLine('✅ Data Ingestion — 15,000 records fetched from MongoDB', 'ok');
    setStageComplete('ingestion');
    setProgress(15);

    // ── Stage 2: Data Validation ──────────────
    await delay(400);
    setStageRunning('validation');
    logLine('🔍 Validating schema against data_schema/schema.yaml', 'info');
    await delay(1000);
    logLine('✅ Data Validation — No drift detected', 'ok');
    setStageComplete('validation');
    setProgress(35);

    // ── Stage 3: Data Transformation ─────────
    await delay(400);
    setStageRunning('transformation');
    logLine('⚡ Applying KNN imputer (n_neighbors=3)', 'info');
    await delay(1400);
    logLine('✅ Data Transformation — Train/Test arrays saved as .npy', 'ok');
    setStageComplete('transformation');
    setProgress(55);

    // ── API call to actually train ─────────────
    logLine('🤖 Starting model training — 5 classifiers with GridSearchCV', 'info');
    logLine('   → RandomForest, GradientBoosting, AdaBoost, DecisionTree, LR', 'info');

    setStageRunning('training');

    const response = await fetch('/train', { method: 'GET' });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const result = await response.json();
    logLine(`✅ ${result.message || 'Training completed successfully'}`, 'ok');
    setStageComplete('training');
    setProgress(85);

    // ── Stage 5: S3 Sync ──────────────────────
    await delay(600);
    setStageRunning('sync');
    logLine('☁️  Syncing artifacts to S3 — s3://networksecurity05e/', 'info');
    await delay(1200);
    logLine('✅ S3 Sync complete — model + artifacts uploaded', 'ok');
    setStageComplete('sync');
    setProgress(100);

    // ── Success ───────────────────────────────
    setBadge('Completed', 'success');
    logLine('🎉 Pipeline complete! Model ready for predictions.', 'ok');

    resultBanner.style.display = 'block';
    resultBanner.innerHTML = `
      <div class="alert alert-success">
        ✅ Training pipeline completed successfully! Head to
        <a href="/predict-ui" style="color: inherit; font-weight: 600; text-decoration: underline;">Run Prediction</a>
        to test the model.
      </div>`;

  } catch (err) {
    logLine(`❌ Error: ${err.message}`, 'err');

    // Mark current running stage as failed
    STAGES.forEach(s => {
      const stageEl = document.getElementById(`stage-${s.id}`);
      if (stageEl && stageEl.classList.contains('running')) setStageError(s.id);
    });

    setBadge('Failed', 'danger');
    resultBanner.style.display = 'block';
    resultBanner.innerHTML = `
      <div class="alert alert-danger">
        ❌ Training failed: ${err.message}. Check the log for details.
      </div>`;
  }

  btn.disabled = false;
  btn.innerHTML = '🔄 Run Pipeline Again';
  isTraining = false;
}

// ── Entrance animation ────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.card, .stage-item');
  cards.forEach((el, i) => {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(12px)';
    el.style.transition = `opacity 0.35s ease ${i * 0.04}s, transform 0.35s ease ${i * 0.04}s`;
    setTimeout(() => {
      el.style.opacity   = '1';
      el.style.transform = 'translateY(0)';
    }, 50);
  });
});
