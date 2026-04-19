/* ═══════════════════════════════════════════════════
   PREDICT.JS — CSV upload, drag-and-drop, form UX
═══════════════════════════════════════════════════ */

// ── File Select Handler ───────────────────────────
function handleFileSelect(input) {
  const file     = input.files[0];
  const infoBox  = document.getElementById('file-info');
  const nameText = document.getElementById('file-name-text');
  const sizeText = document.getElementById('file-size-text');
  const submitBtn = document.getElementById('predict-submit-btn');

  if (!file) return;

  // Validate file type
  if (!file.name.toLowerCase().endsWith('.csv')) {
    showFileError('Only .csv files are supported.');
    return;
  }

  // Validate size (50MB)
  if (file.size > 50 * 1024 * 1024) {
    showFileError('File exceeds 50MB limit.');
    return;
  }

  clearFileError();

  const sizeMB = (file.size / 1024 / 1024).toFixed(2);
  nameText.textContent = file.name;
  sizeText.textContent = `${sizeMB} MB`;

  if (infoBox)  infoBox.style.display  = 'flex';
  if (submitBtn) submitBtn.disabled = false;

  // Highlight upload zone
  const zone = document.getElementById('upload-zone');
  if (zone) {
    zone.style.borderColor   = 'var(--accent-green)';
    zone.style.background    = 'rgba(0,230,118,0.04)';
  }
}

// ── Show / clear file errors ──────────────────────
function showFileError(msg) {
  let errDiv = document.getElementById('file-error');
  if (!errDiv) {
    errDiv = document.createElement('div');
    errDiv.id        = 'file-error';
    errDiv.className = 'alert alert-danger';
    errDiv.style.marginTop = '12px';
    const zone = document.getElementById('upload-zone');
    if (zone) zone.after(errDiv);
  }
  errDiv.textContent = '⚠️ ' + msg;
  const submitBtn = document.getElementById('predict-submit-btn');
  if (submitBtn) submitBtn.disabled = true;
}

function clearFileError() {
  const errDiv = document.getElementById('file-error');
  if (errDiv) errDiv.remove();
}

// ── Drag and Drop ─────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const zone    = document.getElementById('upload-zone');
  const fileInput = document.getElementById('file-input');

  if (!zone) return;

  ['dragenter', 'dragover'].forEach(e => {
    zone.addEventListener(e, ev => {
      ev.preventDefault();
      zone.classList.add('drag-over');
    });
  });

  ['dragleave', 'drop'].forEach(e => {
    zone.addEventListener(e, ev => {
      ev.preventDefault();
      zone.classList.remove('drag-over');
    });
  });

  zone.addEventListener('drop', ev => {
    ev.preventDefault();
    const files = ev.dataTransfer.files;
    if (files.length && fileInput) {
      fileInput.files = files;
      handleFileSelect(fileInput);
    }
  });

  // ── Form submit loading state ────────────────
  const form = document.getElementById('predict-form');
  if (form) {
    form.addEventListener('submit', () => {
      const btn = document.getElementById('predict-submit-btn');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Analyzing...';
      }
    });
  }

  // ── Entrance animations ──────────────────────
  const elements = document.querySelectorAll('.card, .upload-zone, .summary-card');
  elements.forEach((el, i) => {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(12px)';
    el.style.transition = `opacity 0.35s ease ${i * 0.06}s, transform 0.35s ease ${i * 0.06}s`;
    setTimeout(() => {
      el.style.opacity   = '1';
      el.style.transform = 'translateY(0)';
    }, 60);
  });

  // ── Animate results summary bars if on results page ──
  const summaryCards = document.querySelectorAll('.summary-card');
  summaryCards.forEach((card, i) => {
    const valEl = card.querySelector('.s-value');
    if (!valEl) return;
    const target = parseInt(valEl.textContent) || 0;
    valEl.textContent = '0';
    setTimeout(() => {
      let count = 0;
      const step = Math.ceil(target / 40);
      const interval = setInterval(() => {
        count += step;
        if (count >= target) { count = target; clearInterval(interval); }
        valEl.textContent = count.toLocaleString();
      }, 25);
    }, i * 150);
  });
});
