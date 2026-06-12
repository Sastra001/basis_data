// ═══════════════════════════════════════════
// FITUR1.JS — Analisis Saham
// Mengambil input aset + tahun, lalu
// menampilkan metrik, bar kriteria,
// dan distance score.
// ═══════════════════════════════════════════

/**
 * Entry point fitur 1.
 * Dipanggil saat tombol "Lihat Hasil" diklik.
 */
function analyzeStock() {
  const asset  = document.getElementById('f1-asset').value;
  const year   = document.getElementById('f1-year').value;
  const growth = DATASET.alternative[year][asset];
  const br     = DATASET.bessonRank[year];
  const ds     = DATASET.distanceScore[year];
  const name   = asset === 'bitcoin' ? 'Bitcoin (BTC)' : 'Forex';

  document.getElementById('f1-title').textContent = name + ' — Tahun ' + year;

  renderMetrics(growth, br, year);
  renderBars(br);
  renderDsChips(ds);

  document.getElementById('f1-result').classList.remove('hidden');
}

/**
 * Render 4 kartu metrik utama (pertumbuhan, total DS, rank C1, status).
 * @param {number} growth - Nilai pertumbuhan dari alternative
 * @param {object} br     - Data bessonRank untuk tahun tersebut
 * @param {string} year   - Tahun yang dipilih
 */
function renderMetrics(growth, br, year) {
  const isPos = growth >= 0;
  const pct   = (growth * 100).toFixed(2);

  document.getElementById('f1-metrics').innerHTML = `
    <div class="metric">
      <div class="metric-label">Pertumbuhan</div>
      <div class="metric-val ${isPos ? 'pos' : 'neg'}">${isPos ? '+' : ''}${pct}%</div>
    </div>
    <div class="metric">
      <div class="metric-label">Total Distance Score</div>
      <div class="metric-val">${totalDS(year).toFixed(3)}</div>
    </div>
    <div class="metric">
      <div class="metric-label">Besson Rank C1</div>
      <div class="metric-val">${br.c1.rank}</div>
    </div>
    <div class="metric">
      <div class="metric-label">Status</div>
      <div class="metric-val ${isPos ? 'pos' : 'neg'}">${isPos ? 'Untung' : 'Rugi'}</div>
    </div>`;
}

/**
 * Render bar horizontal untuk nilai setiap kriteria (C1–C5).
 * @param {object} br - Data bessonRank untuk tahun tersebut
 */
function renderBars(br) {
  document.getElementById('f1-bars').innerHTML = Object.entries(DATASET.meta.kriteria)
    .map(([k, kr]) => `
      <div class="bar-wrap">
        <div class="bar-label">${kr.nama} (${k.toUpperCase()})</div>
        <div class="bar-bg">
          <div class="bar-fill" style="width:${br[k].nilai}%;background:${KRITERIA_COLORS[k]}"></div>
        </div>
        <span style="font-size:12px;color:#888;width:28px;text-align:right">${br[k].nilai}</span>
        <span style="font-size:11px;color:#aaa;width:40px">rank ${br[k].rank}</span>
      </div>`)
    .join('');
}

/**
 * Render chip/badge Distance Score per kriteria.
 * @param {object} ds - Data distanceScore untuk tahun tersebut
 */
function renderDsChips(ds) {
  document.getElementById('f1-ds').innerHTML = Object.entries(ds)
    .map(([k, v]) => `<span class="ds-chip">${k.toUpperCase()}: ${v}</span>`)
    .join('');
}
