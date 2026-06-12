// ═══════════════════════════════════════════
// MAIN.JS — Inisialisasi & Shared Utilities
// Dipanggil pertama kali saat halaman dimuat.
// ═══════════════════════════════════════════

/**
 * Inisialisasi dashboard:
 * - Isi dropdown tahun untuk fitur 1
 * - Tambah 2 item default untuk fitur 2
 * - Tampilkan app, sembunyikan loading
 */
function init() {
  const years = [...DATASET.meta.years].reverse();

  // Isi dropdown fitur 1
  const f1Year = document.getElementById('f1-year');
  years.forEach(y => {
    const o = document.createElement('option');
    o.value = y;
    o.textContent = y;
    f1Year.appendChild(o);
  });

  // Default 2 item fitur 2
  addItem('bitcoin', '2020');
  addItem('forex',   '2020');

  document.getElementById('loading').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
}

/**
 * Ganti tab aktif antara fitur 1 dan fitur 2.
 * @param {string} t - 'fitur1' atau 'fitur2'
 */
function switchTab(t) {
  document.querySelectorAll('.tab').forEach((btn, i) => {
    btn.classList.toggle('active', ['fitur1', 'fitur2'][i] === t);
  });
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.getElementById(t).classList.add('active');
}

/**
 * Hitung total Distance Score dari semua kriteria untuk satu tahun.
 * @param {string} year
 * @returns {number}
 */
function totalDS(year) {
  return Object.values(DATASET.distanceScore[year]).reduce((s, v) => s + v, 0);
}

/**
 * Buat string HTML <option> untuk semua tahun di dataset.
 * @param {string} selected - Tahun yang dipilih secara default
 * @returns {string}
 */
function buildYearOptions(selected) {
  return [...DATASET.meta.years]
    .reverse()
    .map(y => `<option value="${y}" ${y === selected ? 'selected' : ''}>${y}</option>`)
    .join('');
}

// Jalankan saat DOM siap
document.addEventListener('DOMContentLoaded', init);
