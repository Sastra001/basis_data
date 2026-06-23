// ═══════════════════════════════════════════
// MAIN.JS — Inisialisasi & Shared Utilities
// Dipanggil pertama kali saat halaman dimuat.
// ═══════════════════════════════════════════

/**
 * Inisialisasi dashboard:
 * - Tambah 2 item default untuk fitur 2
 * - Setup responsive sidebar toggle
 * - Tampilkan app, sembunyikan loading
 */
function init() {
  // Default 2 item fitur 2
  addItem('bitcoin', '2020');
  addItem('forex',   '2020');

  // Mobile sidebar toggle
  setupMobileSidebar();

  document.getElementById('loading').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
}

/**
 * Setup mobile sidebar behavior.
 * Di mobile, sidebar jadi fullscreen overlay saat di-toggle.
 */
function setupMobileSidebar() {
  if (window.innerWidth < 640) {
    const sidebar = document.getElementById('sidebar-daftar');
    if (sidebar) {
      // Add close button untuk mobile
      sidebar.addEventListener('click', e => {
        if (e.target === sidebar) {
          sidebar.classList.remove('mobile-open');
        }
      });
    }
  }
}

/**
 * Toggle sidebar di mobile (fullscreen).
 * Dipanggil saat klik tombol "Daftar" di mobile.
 */
function toggleMobileSidebar() {
  if (window.innerWidth < 640) {
    const sidebar = document.getElementById('sidebar-daftar');
    if (sidebar) {
      sidebar.classList.toggle('mobile-open');
    }
  }
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
