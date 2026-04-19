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

// ── Init Dashboard Stats ──────────────────────────
function initStats() {
  const packetsEl  = document.getElementById('stat-packets');
  const threatsEl  = document.getElementById('stat-threats');
  const accuracyEl = document.getElementById('stat-accuracy');

  if (packetsEl)  animateCounter(packetsEl,  124853, 2000);
  if (threatsEl)  animateCounter(threatsEl,  1842,   1800);
  if (accuracyEl) {
    // Animate float
    let count = 0;
    const target = 97.4;
    const interval = setInterval(() => {
      count += 2.5;
      if (count >= target) { count = target; clearInterval(interval); }
      accuracyEl.textContent = count.toFixed(1) + '%';
    }, 40);
  }
}

// ── Sparkbar Animation ────────────────────────────
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

// ── Chart.js Initialization ───────────────────────
function initTrafficChart() {
  const ctx = document.getElementById('trafficChart');
  if (!ctx || typeof Chart === 'undefined') return;

  const startingData = Array.from({length: 20}, () => Math.floor(Math.random() * 40) + 20);
  const labels = Array.from({length: 20}, (_, i) => i + "s ago").reverse();

  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Traffic (MB/s)',
        data: startingData,
        borderColor: '#00d4ff',
        backgroundColor: 'rgba(0, 212, 255, 0.05)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 400 },
      scales: {
        x: { display: false },
        y: {
          display: true,
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          min: 0,
          max: 100,
          ticks: { color: '#7a8299', maxTicksLimit: 5 }
        }
      },
      plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
      interaction: { mode: 'nearest', axis: 'x', intersect: false }
    }
  });

  setInterval(() => {
    const newVal = Math.floor(Math.random() * 40) + 20;
    chart.data.datasets[0].data.push(newVal);
    chart.data.datasets[0].data.shift();
    chart.update();
  }, 2000);
}

// ── Init ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  applyEntranceAnimation();
  animateProgressBars();
  initStats();
  initSparkBars();
  initTrafficChart();
});
