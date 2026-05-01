/* ═══════════════════════════════════════════════════
   DASHBOARD.JS — Animated counters & live stats
═══════════════════════════════════════════════════ */

// ── Animated Counter ──────────────────────────────
function animateCounter(el, target, duration = 1500, suffix = '') {
  const start     = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed  = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current  = Math.floor(start + (target - start) * eased);

    el.textContent = current.toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}


function animateFloat(el, target, duration = 1500) {
  const startTime = performance.now();
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = (target * eased).toFixed(2);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// ── Init Dashboard Stats ──────────────────────────
function initStats(data) {
  const packetsEl  = document.getElementById('stat-packets');
  const threatsEl  = document.getElementById('stat-threats');

  if (packetsEl)  animateCounter(packetsEl,  data.total_rows, 2000);
  if (threatsEl)  animateCounter(threatsEl,  data.malicious_count,   1800);
}

function initMLMetrics(data) {
  const accuracyEl = document.getElementById('stat-accuracy');
  const f1El = document.getElementById('f1-score');
  const precisionEl = document.getElementById('precision-score');
  const recallEl = document.getElementById('recall-score');
  const modelNameEl = document.getElementById('best-model-name');

  if (modelNameEl && data.model_name) modelNameEl.textContent = data.model_name;

  if (f1El) animateFloat(f1El, data.f1_score, 1800);
  if (precisionEl) animateFloat(precisionEl, data.precision, 1900);
  if (recallEl) animateFloat(recallEl, data.recall, 2000);

  if (accuracyEl) {
    let count = 0;
    const target = data.accuracy * 100;
    const interval = setInterval(() => {
      count += 2.5;
      if (count >= target) { count = target; clearInterval(interval); }
      accuracyEl.textContent = count.toFixed(1) + '%';
    }, 40);
  }
}


// ── Sparkbar Animation ────────────────────────────

// ── Init Threat Ring Chart ──────────────────────────────
function initThreatRingChart(data) {
  const ctx = document.getElementById('threatRingChart');
  if (!ctx) return;

  const total = data.total_rows || 1;
  const normalPct = Math.round((data.normal_count / total) * 100);
  const maliciousPct = Math.round((data.malicious_count / total) * 100);

  const dataValues = [normalPct, maliciousPct];
  const colors = ['#00d26a', '#ff4b4b'];
  
  // Update progress bars
  const normalText = document.getElementById('normal-percent-text');
  const maliciousText = document.getElementById('malicious-percent-text');
  const normalProgress = document.getElementById('normal-progress');
  const maliciousProgress = document.getElementById('malicious-progress');
  const chartCenter = document.getElementById('chartCenterText');
  
  if (normalText) normalText.textContent = normalPct + '%';
  if (maliciousText) maliciousText.textContent = maliciousPct + '%';
  if (normalProgress) normalProgress.style.width = normalPct + '%';
  if (maliciousProgress) maliciousProgress.style.width = maliciousPct + '%';
  if (chartCenter) {
      chartCenter.textContent = normalPct + '%';
      chartCenter.style.color = colors[0];
  }
  
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Normal Traffic', 'Malicious Traffic'],
      datasets: [{
        data: dataValues,
        backgroundColor: colors,
        borderWidth: 0,
        hoverOffset: 4
      }]
    },
    options: {
      cutout: '78%',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      },
      onHover: (event, activeElements) => {
        const centerText = document.getElementById('chartCenterText');
        if (activeElements?.length > 0) {
          const index = activeElements[0].index;
          centerText.textContent = dataValues[index] + '%';
          centerText.style.color = colors[index];
        } else {
          centerText.textContent = normalPct + '%';
          centerText.style.color = colors[0]; // Set to Normal Green color for default
        }
      }
    }
  });
}

function initSparkBars() {
  document.querySelectorAll('.spark-bar').forEach(bar => {
    const cols = bar.querySelectorAll('.spark-bar-col');
    cols.forEach((col, i) => {
      const h = 20 + Math.random() * 80;
      col.style.height       = h + '%';
      col.style.animationDelay = (i * 0.05) + 's';
    });
  });
}

// ── Progress Bar Animate ──────────────────────────
function animateProgressBars() {
  document.querySelectorAll('.progress-bar-fill').forEach(bar => {
    const target = bar.style.width;
    bar.style.width = '0%';
    setTimeout(() => { bar.style.width = target; }, 300);
  });
}

// ── Page Load Entrance ────────────────────────────
function applyEntranceAnimation() {
  const cards = document.querySelectorAll('.stat-card, .card');
  cards.forEach((card, i) => {
    card.style.opacity   = '0';
    card.style.transform = 'translateY(16px)';
    card.style.transition = `opacity 0.4s ease ${i * 0.06}s, transform 0.4s ease ${i * 0.06}s`;
    setTimeout(() => {
      card.style.opacity   = '1';
      card.style.transform = 'translateY(0)';
    }, 50);
  });
}

// ── Init ──────────────────────────────────────────
async function loadDashboardData() {
  try {
    const res = await fetch('/api/stats');
    const data = await res.json();
    initStats(data);
    initThreatRingChart(data);
  } catch (err) {
    console.error("Failed to fetch stats", err);
    const data = {total_rows: 124853, malicious_count: 1842, normal_count: 123011};
    initStats(data);
    initThreatRingChart(data);
  }
}

async function loadMLMetrics() {
  try {
    const res = await fetch('/api/ml_metrics');
    const data = await res.json();
    initMLMetrics(data);
  } catch (err) {
    console.error("Failed to fetch ML metrics", err);
    initMLMetrics({accuracy: 0.974, f1_score: 0.97, precision: 0.98, recall: 0.96, model_name: "Random Forest"});
  }
}

document.addEventListener('DOMContentLoaded', () => {
  applyEntranceAnimation();
  animateProgressBars();
  
  loadDashboardData();
  loadMLMetrics();
  
  initSparkBars();
});
