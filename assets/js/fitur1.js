// ═══════════════════════════════════════════
// FITUR1.JS — Pertumbuhan Aset Per Tahun
// Dengan modal dialog untuk setting indikator.
// ═══════════════════════════════════════════

let currentAsset = 'bitcoin';
let currentGrowthData = [];
let activeIndicators = {};

// Warna badge per indikator
const BADGE_COLORS = {
  ma: '#F59E0B',
  macd: '#3B82F6',
  envelope: '#8B5CF6'
};

/**
 * Entry point fitur 1.
 * Dipanggil saat tombol "Tampilkan" diklik.
 */
function showAssetChart() {
  currentAsset = document.getElementById('f1-asset').value;
  const name  = currentAsset === 'bitcoin' ? 'Bitcoin (BTC)' : 'Forex';

  document.getElementById('f1-title').textContent = name + ' — Pertumbuhan Tahunan';

  // Ambil data pertumbuhan
  currentGrowthData = DATASET.meta.years.map(year =>
    DATASET.alternative[year][currentAsset] * 100
  );

  // Reset indicator
  activeIndicators = {};
  renderBadges();
  drawLineChartFitur1(currentAsset, currentGrowthData, {});

  document.getElementById('f1-result').classList.remove('hidden');
  document.getElementById('f1-indicator-menu').classList.add('hidden');
}

/**
 * Toggle indicator menu visibility.
 */
function toggleIndicatorMenu() {
  const menu = document.getElementById('f1-indicator-menu');
  menu.classList.toggle('hidden');
}

/**
 * Open modal untuk indikator tertentu.
 * @param {string} type - 'ma', 'macd', atau 'envelope'
 */
function openModal(type) {
  document.getElementById('f1-indicator-menu').classList.add('hidden');

  const maxPeriods = DATASET.meta.years.length;

  if (type === 'ma') {
    document.getElementById('ma-periode-input').innerHTML =
      buildPeriodOptions(maxPeriods, activeIndicators.ma?.period || 20);
  } else if (type === 'macd') {
    document.getElementById('macd-fast-input').innerHTML =
      buildPeriodOptions(maxPeriods, activeIndicators.macd?.fast || 12);
    document.getElementById('macd-slow-input').innerHTML =
      buildPeriodOptions(maxPeriods, activeIndicators.macd?.slow || 26);
    document.getElementById('macd-signal-input').innerHTML =
      buildPeriodOptions(maxPeriods, activeIndicators.macd?.signal || 9);
  } else if (type === 'envelope') {
    document.getElementById('envelope-periode-input').innerHTML =
      buildPeriodOptions(maxPeriods, activeIndicators.envelope?.period || 20);
    document.getElementById('envelope-percentage-input').innerHTML =
      buildPercentageOptions(activeIndicators.envelope?.percentage || 2);
  }

  document.getElementById(`modal-${type}`).classList.remove('hidden');
}

/**
 * Close modal.
 * @param {string} type
 */
function closeModal(type) {
  document.getElementById(`modal-${type}`).classList.add('hidden');
}

/**
 * Apply indicator dan tutup modal.
 * @param {string} type
 */
function applyIndicator(type) {
  if (type === 'ma') {
    activeIndicators.ma = {
      enabled: true,
      period: parseInt(document.getElementById('ma-periode-input').value)
    };
  } else if (type === 'macd') {
    activeIndicators.macd = {
      enabled: true,
      fast: parseInt(document.getElementById('macd-fast-input').value),
      slow: parseInt(document.getElementById('macd-slow-input').value),
      signal: parseInt(document.getElementById('macd-signal-input').value)
    };
  } else if (type === 'envelope') {
    activeIndicators.envelope = {
      enabled: true,
      period: parseInt(document.getElementById('envelope-periode-input').value),
      percentage: parseFloat(document.getElementById('envelope-percentage-input').value)
    };
  }

  closeModal(type);
  updateChart();
  renderBadges();
}

/**
 * Remove indicator.
 * @param {string} type
 */
function removeIndicator(type) {
  delete activeIndicators[type];
  updateChart();
  renderBadges();
}

/**
 * Hitung & redraw chart dengan indikator aktif.
 */
function updateChart() {
  const calculatedIndicators = {};

  if (activeIndicators.ma) {
    calculatedIndicators.ma = calculateSMA(currentGrowthData, activeIndicators.ma.period);
  }

  if (activeIndicators.macd) {
    calculatedIndicators.macd = calculateMACD(
      currentGrowthData,
      activeIndicators.macd.fast,
      activeIndicators.macd.slow,
      activeIndicators.macd.signal
    );
  }

  if (activeIndicators.envelope) {
    calculatedIndicators.envelope = calculateBollingerBands(
      currentGrowthData,
      activeIndicators.envelope.period,
      activeIndicators.envelope.percentage
    );
  }

  drawLineChartFitur1(currentAsset, currentGrowthData, calculatedIndicators);
}

/**
 * Render badge untuk setiap indikator aktif.
 */
function renderBadges() {
  const badgesContainer = document.getElementById('f1-badges');
  const badges = [];

  if (activeIndicators.ma) {
    badges.push(`
      <div class="badge">
        <div class="badge-dot" style="background:${BADGE_COLORS.ma}"></div>
        <span>Rata-rata Pergerakan (${activeIndicators.ma.period})</span>
        <span class="badge-close" onclick="removeIndicator('ma')">✕</span>
      </div>
    `);
  }

  if (activeIndicators.macd) {
    badges.push(`
      <div class="badge">
        <div class="badge-dot" style="background:${BADGE_COLORS.macd}"></div>
        <span>MACD (${activeIndicators.macd.fast}, ${activeIndicators.macd.slow}, ${activeIndicators.macd.signal})</span>
        <span class="badge-close" onclick="removeIndicator('macd')">✕</span>
      </div>
    `);
  }

  if (activeIndicators.envelope) {
    badges.push(`
      <div class="badge">
        <div class="badge-dot" style="background:${BADGE_COLORS.envelope}"></div>
        <span>Envelope (${activeIndicators.envelope.period}, ${activeIndicators.envelope.percentage.toFixed(2)}%)</span>
        <span class="badge-close" onclick="removeIndicator('envelope')">✕</span>
      </div>
    `);
  }

  badgesContainer.innerHTML = badges.join('');
}

