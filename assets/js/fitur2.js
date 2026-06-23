// ═══════════════════════════════════════════
// FITUR2.JS — Perbandingan & Ranking
// Mengelola daftar item perbandingan,
// memanggil chart, dan merender tabel ranking.
// ═══════════════════════════════════════════

const MAX_ITEMS  = 5;
let   itemCounter = 0;

// ── Item Management ───────────────────────────────────────────────────

/**
 * Tambah satu baris item perbandingan ke daftar.
 * @param {string} defaultAsset - 'bitcoin' atau 'forex'
 * @param {string} defaultYear  - Tahun default yang dipilih
 */
function addItem(defaultAsset = 'bitcoin', defaultYear = '2020') {
  const currentCount = document.querySelectorAll('#item-list .item-row').length;
  if (currentCount >= MAX_ITEMS) {
    alert(`Maksimal ${MAX_ITEMS} item perbandingan.`);
    return;
  }

  const id    = ++itemCounter;
  const color = PALETTE[(id - 1) % PALETTE.length];
  const row   = document.createElement('div');

  row.className = 'item-row';
  row.id        = `item-${id}`;
  row.innerHTML = `
    <div class="item-dot" style="background:${color}"></div>
    <div class="item-selects">
      <select id="ia-${id}">
        <option value="bitcoin" ${defaultAsset === 'bitcoin' ? 'selected' : ''}>Bitcoin</option>
        <option value="forex"   ${defaultAsset === 'forex'   ? 'selected' : ''}>Forex</option>
      </select>
      <select id="iy-${id}">${buildYearOptions(defaultYear)}</select>
    </div>
    <div class="item-actions">
      <button class="btn btn-danger btn-sm" onclick="removeItem(${id})">✕</button>
    </div>`;

  document.getElementById('item-list').appendChild(row);
}

/**
 * Hapus satu baris item berdasarkan id.
 * @param {number} id
 */
function removeItem(id) {
  const el = document.getElementById(`item-${id}`);
  if (el) el.remove();
}

/**
 * Reset semua item, kembali ke 2 item default.
 */
function resetItems() {
  document.getElementById('item-list').innerHTML = '';
  document.getElementById('f2-result').classList.add('hidden');
  itemCounter = 0;
  destroyChart();
  addItem('bitcoin', '2020');
  addItem('forex',   '2020');
}

// ── Compare & Rank ────────────────────────────────────────────────────

/**
 * Ambil semua item yang ada di daftar saat ini.
 * @returns {Array} items - Array objek { id, asset, year, color, label }
 */
function getItems() {
  return Array.from(document.querySelectorAll('#item-list .item-row'))
    .map((row, idx) => {
      const id    = row.id.replace('item-', '');
      const asset = document.getElementById(`ia-${id}`).value;
      const year  = document.getElementById(`iy-${id}`).value;
      const color = PALETTE[idx % PALETTE.length];
      const label = (asset === 'bitcoin' ? 'Bitcoin' : 'Forex') + ' ' + year;
      return { id, asset, year, color, label };
    });
}

/**
 * Entry point fitur 2.
 * Dipanggil saat tombol "Bandingkan" diklik.
 */
function runCompare() {
  const items = getItems();
  if (items.length < 2) {
    alert('Tambahkan minimal 2 item untuk dibandingkan.');
    return;
  }

  drawLineChart(items);
  drawRankTable(items);

  document.getElementById('f2-result').classList.remove('hidden');
  document.getElementById('f2-result').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Render tabel ranking berdasarkan Total Distance Score (terkecil = terbaik).
 * @param {Array} items
 */
function drawRankTable(items) {
  const ranked = items
    .map(item => ({
      ...item,
      growth: DATASET.alternative[item.year][item.asset],
      ds:     totalDS(item.year),
      c1rank: DATASET.bessonRank[item.year].c1.rank
    }))
    .sort((a, b) => a.ds - b.ds);

  const rankClass = i => ['rank-1', 'rank-2', 'rank-3'][i] || 'rank-other';

  document.getElementById('f2-rank-body').innerHTML = ranked.map((item, i) => {
    const pct   = (item.growth * 100).toFixed(2);
    const isPos = item.growth >= 0;
    return `
      <tr class="rank-row-${i + 1}">
        <td><span class="rank-badge ${rankClass(i)}">${i + 1}</span></td>
        <td>
          <span style="display:inline-block;width:10px;height:10px;border-radius:50%;
            background:${item.color};margin-right:6px;vertical-align:middle"></span>
          ${item.asset === 'bitcoin' ? 'Bitcoin' : 'Forex'}
        </td>
        <td>${item.year}</td>
        <td class="${isPos ? 'pos' : 'neg'}">${isPos ? '+' : ''}${pct}%</td>
        <td>${item.ds.toFixed(3)}</td>
        <td>${item.c1rank}</td>
        <td class="${isPos ? 'pos' : 'neg'}" style="font-weight:500">${isPos ? 'Untung' : 'Rugi'}</td>
      </tr>`;
  }).join('');
}
