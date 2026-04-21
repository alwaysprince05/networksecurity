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
function initStats() {
  const packetsEl  = document.getElementById('stat-packets');
  const threatsEl  = document.getElementById('stat-threats');
  const accuracyEl = document.getElementById('stat-accuracy');

  if (packetsEl)  animateCounter(packetsEl,  124853, 2000);
  if (threatsEl)  animateCounter(threatsEl,  1842,   1800);
  
  const f1El = document.getElementById('f1-score');
  const precisionEl = document.getElementById('precision-score');
  const recallEl = document.getElementById('recall-score');

  if (f1El) animateFloat(f1El, 0.97, 1800);
  if (precisionEl) animateFloat(precisionEl, 0.98, 1900);
  if (recallEl) animateFloat(recallEl, 0.96, 2000);

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

// ── Init Threat Ring Chart ──────────────────────────────
function initThreatRingChart() {
  const ctx = document.getElementById('threatRingChart');
  if (!ctx) return;

  const dataValues = [85, 15];
  const colors = ['#00d26a', '#ff4b4b'];
  
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
          centerText.textContent = '85%';
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
document.addEventListener('DOMContentLoaded', () => {
  applyEntranceAnimation();
  animateProgressBars();
  initStats();
  
  initSparkBars();
  initThreatRingChart();
});
